(function () {
  'use strict';

  // ============================================================
  //  UTILITIES
  // ============================================================

  const slugify = (t) =>
    t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const debounce = (fn, ms) => {
    let id;
    return (...args) => {
      clearTimeout(id);
      id = setTimeout(() => fn(...args), ms);
    };
  };

  const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  const factorial = (() => {
    const cache = [1, 1];
    return function f(n) {
      if (n < 0) return NaN;
      if (cache[n] !== undefined) return cache[n];
      return (cache[n] = n * f(n - 1));
    };
  })();

  const allDemos = [];

  // ============================================================
  //  SAFE MATH EXPRESSION PARSER
  // ============================================================

  const MathParser = (() => {
    const TOKEN_PATTERNS = [
      { re: /^\s+/, type: null },
      { re: /^(\d+\.?\d*|\.\d+)/, type: 'NUM' },
      { re: /^(asin|acos|atan|sqrt|sinh|cosh|tanh|sin|cos|tan|abs|exp|log|ln)(?![a-zA-Z])/, type: 'FN' },
      { re: /^pi(?![a-zA-Z])/, type: 'NUM', value: Math.PI },
      { re: /^e(?![a-zA-Z])/, type: 'NUM', value: Math.E },
      { re: /^[xyt]/, type: 'VAR' },
      { re: /^[+\-*/^]/, type: 'OP' },
      { re: /^\(/, type: 'LP' },
      { re: /^\)/, type: 'RP' },
    ];

    function tokenize(expr) {
      const tokens = [];
      let i = 0;
      while (i < expr.length) {
        let matched = false;
        for (const p of TOKEN_PATTERNS) {
          const m = p.re.exec(expr.slice(i));
          if (!m) continue;
          if (p.type) {
            const tok = { type: p.type, value: p.value !== undefined ? p.value : m[0] };
            if (p.type === 'NUM' && p.value === undefined) tok.value = parseFloat(m[0]);
            tokens.push(tok);
          }
          i += m[0].length;
          matched = true;
          break;
        }
        if (!matched) throw new Error('Unexpected: ' + expr[i]);
      }
      return tokens;
    }

    // Insert implicit multiplication between adjacent value-like tokens
    function insertMul(tokens) {
      const out = [];
      const isValue = (t) => ['NUM', 'VAR', 'RP'].includes(t.type);
      const isStart = (t) => ['NUM', 'VAR', 'FN', 'LP'].includes(t.type);
      for (let i = 0; i < tokens.length; i++) {
        out.push(tokens[i]);
        if (i + 1 < tokens.length && isValue(tokens[i]) && isStart(tokens[i + 1])) {
          out.push({ type: 'OP', value: '*' });
        }
      }
      return out;
    }

    // Recursive-descent parser producing AST
    function parse(tokens) {
      let pos = 0;
      const peek = () => tokens[pos];
      const eat = (type) => {
        if (pos >= tokens.length || tokens[pos].type !== type)
          throw new Error('Expected ' + type);
        return tokens[pos++];
      };

      function expr() {
        let n = term();
        while (pos < tokens.length && peek().type === 'OP' && (peek().value === '+' || peek().value === '-')) {
          const op = tokens[pos++].value;
          n = { t: 'bin', op, l: n, r: term() };
        }
        return n;
      }

      function term() {
        let n = power();
        while (pos < tokens.length && peek().type === 'OP' && (peek().value === '*' || peek().value === '/')) {
          const op = tokens[pos++].value;
          n = { t: 'bin', op, l: n, r: power() };
        }
        return n;
      }

      function power() {
        let n = unary();
        if (pos < tokens.length && peek().type === 'OP' && peek().value === '^') {
          pos++;
          n = { t: 'bin', op: '^', l: n, r: unary() };
        }
        return n;
      }

      function unary() {
        if (pos < tokens.length && peek().type === 'OP' && peek().value === '-') {
          pos++;
          return { t: 'neg', c: unary() };
        }
        if (pos < tokens.length && peek().type === 'OP' && peek().value === '+') {
          pos++;
          return unary();
        }
        return call();
      }

      function call() {
        if (pos < tokens.length && peek().type === 'FN') {
          const fn = tokens[pos++].value;
          eat('LP');
          const arg = expr();
          eat('RP');
          return { t: 'fn', fn, c: arg };
        }
        return primary();
      }

      function primary() {
        if (pos < tokens.length && peek().type === 'NUM') {
          return { t: 'num', v: tokens[pos++].value };
        }
        if (pos < tokens.length && peek().type === 'VAR') {
          return { t: 'var', n: tokens[pos++].value };
        }
        if (pos < tokens.length && peek().type === 'LP') {
          pos++;
          const n = expr();
          eat('RP');
          return n;
        }
        throw new Error('Unexpected token');
      }

      const ast = expr();
      if (pos < tokens.length) throw new Error('Trailing tokens');
      return ast;
    }

    const FN_MAP = {
      sin: Math.sin, cos: Math.cos, tan: Math.tan,
      asin: Math.asin, acos: Math.acos, atan: Math.atan,
      sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh,
      sqrt: Math.sqrt, abs: Math.abs,
      ln: Math.log, log: Math.log, exp: Math.exp,
    };

    function evaluate(node, vars) {
      switch (node.t) {
        case 'num': return node.v;
        case 'var': return vars[node.n] || 0;
        case 'neg': return -evaluate(node.c, vars);
        case 'bin': {
          const l = evaluate(node.l, vars);
          const r = evaluate(node.r, vars);
          if (node.op === '+') return l + r;
          if (node.op === '-') return l - r;
          if (node.op === '*') return l * r;
          if (node.op === '/') return r === 0 ? NaN : l / r;
          if (node.op === '^') return Math.pow(l, r);
          return NaN;
        }
        case 'fn': {
          const a = evaluate(node.c, vars);
          const f = FN_MAP[node.fn];
          return f ? f(a) : NaN;
        }
      }
      return NaN;
    }

    function compile(exprStr) {
      try {
        const tokens = insertMul(tokenize(exprStr));
        const ast = parse(tokens);
        return (x, y) => {
          const v = evaluate(ast, { x: x, y: y !== undefined ? y : 0 });
          return isFinite(v) ? v : NaN;
        };
      } catch (_) {
        return null;
      }
    }

    return { compile };
  })();

  // ============================================================
  //  GRAPH CANVAS — reusable canvas wrapper for 2-D math plots
  // ============================================================

  class GraphCanvas {
    constructor(canvas, opts = {}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.xMin = opts.xMin ?? -6;
      this.xMax = opts.xMax ?? 6;
      this.yMin = opts.yMin ?? -4;
      this.yMax = opts.yMax ?? 4;
      this.w = 0;
      this.h = 0;
    }

    setSize(w, h) {
      const dpr = window.devicePixelRatio || 1;
      this.w = w;
      this.h = h;
      this.canvas.width = w * dpr;
      this.canvas.height = h * dpr;
      this.canvas.style.width = w + 'px';
      this.canvas.style.height = h + 'px';
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    setViewport(xMin, xMax, yMin, yMax) {
      this.xMin = xMin; this.xMax = xMax;
      this.yMin = yMin; this.yMax = yMax;
    }

    wx(sx) { return sx / this.w * (this.xMax - this.xMin) + this.xMin; }
    wy(sy) { return (this.h - sy) / this.h * (this.yMax - this.yMin) + this.yMin; }
    sx(wx) { return (wx - this.xMin) / (this.xMax - this.xMin) * this.w; }
    sy(wy) { return this.h - (wy - this.yMin) / (this.yMax - this.yMin) * this.h; }

    clear() { this.ctx.clearRect(0, 0, this.w, this.h); }

    colors() {
      const lt = document.body.classList.contains('light-mode');
      return {
        grid: lt ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.07)',
        axes: lt ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.45)',
        text: lt ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)',
        fn: lt
          ? ['#0969da', '#cf222e', '#1a7f37', '#bf8700', '#8250df', '#0550ae']
          : ['#58a6ff', '#ff6b6b', '#4ecdc4', '#ffd93d', '#c084fc', '#ff9f43'],
        fill: lt ? 'rgba(9,105,218,0.18)' : 'rgba(88,166,255,0.18)',
        bg: lt ? '#ffffff' : '#1a1a2e',
      };
    }

    niceStep(range) {
      const rough = range / 8;
      const exp = Math.floor(Math.log10(rough));
      const frac = rough / Math.pow(10, exp);
      let nice = 10;
      if (frac <= 1.5) nice = 1;
      else if (frac <= 3) nice = 2;
      else if (frac <= 7) nice = 5;
      return nice * Math.pow(10, exp);
    }

    drawGrid() {
      const c = this.colors();
      const ctx = this.ctx;
      const stepX = this.niceStep(this.xMax - this.xMin);
      const stepY = this.niceStep(this.yMax - this.yMin);

      ctx.strokeStyle = c.grid;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      for (let x = Math.ceil(this.xMin / stepX) * stepX; x <= this.xMax; x += stepX) {
        const px = this.sx(x);
        ctx.moveTo(px, 0); ctx.lineTo(px, this.h);
      }
      for (let y = Math.ceil(this.yMin / stepY) * stepY; y <= this.yMax; y += stepY) {
        const py = this.sy(y);
        ctx.moveTo(0, py); ctx.lineTo(this.w, py);
      }
      ctx.stroke();
    }

    drawAxes() {
      const c = this.colors();
      const ctx = this.ctx;
      const stepX = this.niceStep(this.xMax - this.xMin);
      const stepY = this.niceStep(this.yMax - this.yMin);

      ctx.strokeStyle = c.axes;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      if (this.yMin <= 0 && this.yMax >= 0) {
        const y0 = this.sy(0);
        ctx.moveTo(0, y0); ctx.lineTo(this.w, y0);
      }
      if (this.xMin <= 0 && this.xMax >= 0) {
        const x0 = this.sx(0);
        ctx.moveTo(x0, 0); ctx.lineTo(x0, this.h);
      }
      ctx.stroke();

      ctx.fillStyle = c.text;
      ctx.font = '10px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const y0 = clamp(this.sy(0), 0, this.h - 14);
      for (let x = Math.ceil(this.xMin / stepX) * stepX; x <= this.xMax; x += stepX) {
        if (Math.abs(x) < stepX * 0.01) continue;
        ctx.fillText(+x.toPrecision(4), this.sx(x), y0 + 3);
      }
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      const x0 = clamp(this.sx(0), 14, this.w);
      for (let y = Math.ceil(this.yMin / stepY) * stepY; y <= this.yMax; y += stepY) {
        if (Math.abs(y) < stepY * 0.01) continue;
        ctx.fillText(+y.toPrecision(4), x0 - 4, this.sy(y));
      }
    }

    plotFn(fn, color, lw = 2) {
      const ctx = this.ctx;
      const samples = Math.max(this.w * 2, 600);
      ctx.strokeStyle = color;
      ctx.lineWidth = lw;
      ctx.beginPath();
      let started = false;
      for (let i = 0; i <= samples; i++) {
        const pxX = (i / samples) * this.w;
        const x = this.wx(pxX);
        const y = fn(x);
        if (!isFinite(y) || Math.abs(y) > 1e6) { started = false; continue; }
        const py = this.sy(y);
        if (!started) { ctx.moveTo(pxX, py); started = true; }
        else ctx.lineTo(pxX, py);
      }
      ctx.stroke();
    }

    drawPoint(wxv, wyv, color, r = 4) {
      const ctx = this.ctx;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(this.sx(wxv), this.sy(wyv), r, 0, Math.PI * 2);
      ctx.fill();
    }

    drawOpenCircle(wxv, wyv, color, r = 5) {
      const ctx = this.ctx;
      const lt = document.body.classList.contains('light-mode');
      ctx.fillStyle = lt ? '#ffffff' : '#1a1a2e';
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.sx(wxv), this.sy(wyv), r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    drawLine(x1, y1, x2, y2, color, lw = 1) {
      const ctx = this.ctx;
      ctx.strokeStyle = color;
      ctx.lineWidth = lw;
      ctx.beginPath();
      ctx.moveTo(this.sx(x1), this.sy(y1));
      ctx.lineTo(this.sx(x2), this.sy(y2));
      ctx.stroke();
    }

    drawRect(x1, y1, x2, y2, fill, stroke) {
      const ctx = this.ctx;
      const px1 = this.sx(Math.min(x1, x2));
      const py1 = this.sy(Math.max(y1, y2));
      const pw = Math.abs(this.sx(x2) - this.sx(x1));
      const ph = Math.abs(this.sy(y2) - this.sy(y1));
      if (fill) { ctx.fillStyle = fill; ctx.fillRect(px1, py1, pw, ph); }
      if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.strokeRect(px1, py1, pw, ph); }
    }

    drawArrow(x1, y1, x2, y2, color, lw = 1.2) {
      const ctx = this.ctx;
      const sx1 = this.sx(x1), sy1 = this.sy(y1);
      const sx2 = this.sx(x2), sy2 = this.sy(y2);
      const angle = Math.atan2(sy2 - sy1, sx2 - sx1);
      const len = Math.hypot(sx2 - sx1, sy2 - sy1);
      const head = Math.min(len * 0.35, 7);
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = lw;
      ctx.beginPath();
      ctx.moveTo(sx1, sy1); ctx.lineTo(sx2, sy2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(sx2, sy2);
      ctx.lineTo(sx2 - head * Math.cos(angle - 0.4), sy2 - head * Math.sin(angle - 0.4));
      ctx.lineTo(sx2 - head * Math.cos(angle + 0.4), sy2 - head * Math.sin(angle + 0.4));
      ctx.closePath();
      ctx.fill();
    }

    drawText(txt, wxv, wyv, color, align = 'center', baseline = 'bottom', font = '12px system-ui') {
      const ctx = this.ctx;
      ctx.fillStyle = color;
      ctx.font = font;
      ctx.textAlign = align;
      ctx.textBaseline = baseline;
      ctx.fillText(txt, this.sx(wxv), this.sy(wyv));
    }

    base() {
      this.clear();
      this.drawGrid();
      this.drawAxes();
    }
  }

  // ============================================================
  //  DEMO HELPERS
  // ============================================================

  function makeControls(container) {
    const div = document.createElement('div');
    div.className = 'demo-controls';
    container.appendChild(div);
    return div;
  }

  function makeCanvasWrap(container, height) {
    const wrap = document.createElement('div');
    wrap.className = 'demo-canvas-wrap';
    wrap.style.cssText = 'position:relative;width:100%;height:' + (height || 400) + 'px;';
    const cvs = document.createElement('canvas');
    cvs.className = 'demo-canvas';
    cvs.style.cssText = 'display:block;width:100%;height:100%;border-radius:6px;';
    wrap.appendChild(cvs);
    container.appendChild(wrap);
    return { wrap, canvas: cvs };
  }

  function makeInfo(container) {
    const div = document.createElement('div');
    div.className = 'demo-info';
    div.style.cssText = 'padding:8px 4px;font-size:0.92em;min-height:1.4em;';
    container.appendChild(div);
    return div;
  }

  function setupResize(wrap, graph, render) {
    function resize() {
      const rect = wrap.getBoundingClientRect();
      if (rect.width < 10) return;
      graph.setSize(rect.width, rect.height);
      render();
    }
    const ro = new ResizeObserver(debounce(resize, 80));
    ro.observe(wrap);
    resize();
  }

  function numericalDerivative(fn, x, h = 1e-6) {
    return (fn(x + h) - fn(x - h)) / (2 * h);
  }

  // ============================================================
  //  DEMO: FUNCTION GRAPHER
  // ============================================================

  function initFunctionGrapher(container) {
    const ctrl = makeControls(container);
    ctrl.innerHTML =
      '<label style="flex:1;display:flex;align-items:center;gap:6px;">f(x) = ' +
      '<input type="text" class="demo-input" value="sin(x)" style="flex:1;padding:4px 8px;' +
      'border:1px solid var(--border,#444);border-radius:4px;background:var(--input-bg,#252538);' +
      'color:inherit;font-family:monospace;"></label>' +
      '<button class="demo-btn" data-action="zin" title="Zoom in">＋</button>' +
      '<button class="demo-btn" data-action="zout" title="Zoom out">−</button>' +
      '<button class="demo-btn" data-action="reset" title="Reset view">⟳</button>';

    const { wrap, canvas } = makeCanvasWrap(container, 400);
    const info = makeInfo(container);
    const graph = new GraphCanvas(canvas, { xMin: -8, xMax: 8, yMin: -5, yMax: 5 });
    const input = ctrl.querySelector('.demo-input');

    let fn = MathParser.compile(input.value);
    let dragging = false, dragStart = null, vpStart = null;

    function render() {
      graph.base();
      const c = graph.colors();
      if (fn) graph.plotFn(fn, c.fn[0], 2.5);
    }

    function zoom(factor) {
      const cx = (graph.xMin + graph.xMax) / 2, cy = (graph.yMin + graph.yMax) / 2;
      const dx = (graph.xMax - graph.xMin) / 2 * factor;
      const dy = (graph.yMax - graph.yMin) / 2 * factor;
      graph.setViewport(cx - dx, cx + dx, cy - dy, cy + dy);
      render();
    }

    ctrl.addEventListener('click', (e) => {
      const a = e.target.dataset && e.target.dataset.action;
      if (a === 'zin') zoom(0.6);
      else if (a === 'zout') zoom(1.5);
      else if (a === 'reset') { graph.setViewport(-8, 8, -5, 5); render(); }
    });

    input.addEventListener('input', () => {
      fn = MathParser.compile(input.value);
      render();
    });

    canvas.addEventListener('mousedown', (e) => {
      dragging = true;
      const r = canvas.getBoundingClientRect();
      dragStart = { x: e.clientX - r.left, y: e.clientY - r.top };
      vpStart = { xMin: graph.xMin, xMax: graph.xMax, yMin: graph.yMin, yMax: graph.yMax };
      canvas.style.cursor = 'grabbing';
    });
    window.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      const r = canvas.getBoundingClientRect();
      const mx = e.clientX - r.left, my = e.clientY - r.top;
      const dx = graph.wx(mx) - graph.wx(dragStart.x);
      const dy = graph.wy(my) - graph.wy(dragStart.y);
      graph.setViewport(
        vpStart.xMin - dx, vpStart.xMax - dx,
        vpStart.yMin - dy, vpStart.yMax - dy
      );
      render();
    });
    window.addEventListener('mouseup', () => {
      dragging = false;
      canvas.style.cursor = '';
    });

    canvas.addEventListener('mousemove', (e) => {
      if (dragging) return;
      const r = canvas.getBoundingClientRect();
      const mx = e.clientX - r.left, my = e.clientY - r.top;
      const wx = graph.wx(mx), wy = graph.wy(my);
      let txt = `x: ${wx.toFixed(3)}, y: ${wy.toFixed(3)}`;
      if (fn) {
        const fv = fn(wx);
        if (isFinite(fv)) txt += `   f(x) = ${fv.toFixed(4)}`;
      }
      info.textContent = txt;
    });
    canvas.addEventListener('mouseleave', () => { info.textContent = ''; });

    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      zoom(e.deltaY > 0 ? 1.15 : 0.87);
    }, { passive: false });

    setupResize(wrap, graph, render);
    allDemos.push(render);
  }

  // ============================================================
  //  DEMO: DERIVATIVE VISUALIZER
  // ============================================================

  function initDerivativeVisualizer(container) {
    const functions = [
      { label: 'x²', expr: 'x^2' },
      { label: 'sin(x)', expr: 'sin(x)' },
      { label: 'x³ − 3x', expr: 'x^3-3*x' },
      { label: 'cos(x)', expr: 'cos(x)' },
      { label: 'eˣ', expr: 'exp(x)' },
    ];

    const ctrl = makeControls(container);
    const selHTML = functions.map((f, i) =>
      `<option value="${i}">${f.label}</option>`).join('');
    ctrl.innerHTML =
      `<select class="demo-select" style="padding:4px;border-radius:4px;background:var(--input-bg,#252538);color:inherit;border:1px solid var(--border,#444);">${selHTML}</select>` +
      '<label style="flex:1;display:flex;align-items:center;gap:6px;margin-left:10px;">x = ' +
      '<input type="range" class="demo-slider" min="-5" max="5" step="0.05" value="1" style="flex:1;">' +
      '<span class="demo-value" style="min-width:3em;">1.00</span></label>';

    const { wrap, canvas } = makeCanvasWrap(container, 380);
    const info = makeInfo(container);
    const graph = new GraphCanvas(canvas, { xMin: -6, xMax: 6, yMin: -4, yMax: 6 });
    const sel = ctrl.querySelector('.demo-select');
    const slider = ctrl.querySelector('.demo-slider');
    const valSpan = ctrl.querySelector('.demo-value');

    let fn = MathParser.compile(functions[0].expr);

    function render() {
      graph.base();
      const c = graph.colors();
      if (!fn) return;
      graph.plotFn(fn, c.fn[0], 2.5);

      const derivFn = (x) => numericalDerivative(fn, x);
      graph.plotFn(derivFn, c.fn[2], 1.5);

      const xv = parseFloat(slider.value);
      const yv = fn(xv);
      const slope = numericalDerivative(fn, xv);
      if (isFinite(yv) && isFinite(slope)) {
        const len = 3;
        graph.drawLine(xv - len, yv - slope * len, xv + len, yv + slope * len, c.fn[1], 2);
        graph.drawPoint(xv, yv, c.fn[1], 5);
        info.textContent = `Point: (${xv.toFixed(2)}, ${yv.toFixed(2)})   Slope: ${slope.toFixed(4)}`;
      }

      graph.drawText('f(x)', graph.xMax - 0.5, fn(graph.xMax - 0.5) + 0.3, c.fn[0], 'right', 'bottom', '11px system-ui');
      graph.drawText("f'(x)", graph.xMax - 0.5, derivFn(graph.xMax - 0.5) + 0.3, c.fn[2], 'right', 'bottom', '11px system-ui');
    }

    sel.addEventListener('change', () => {
      fn = MathParser.compile(functions[sel.value].expr);
      render();
    });
    slider.addEventListener('input', () => {
      valSpan.textContent = parseFloat(slider.value).toFixed(2);
      render();
    });

    setupResize(wrap, graph, render);
    allDemos.push(render);
  }

  // ============================================================
  //  DEMO: INTEGRAL VISUALIZER (Riemann sums)
  // ============================================================

  function initIntegralVisualizer(container) {
    const ctrl = makeControls(container);
    ctrl.innerHTML =
      '<label style="display:flex;align-items:center;gap:6px;">Rectangles: ' +
      '<input type="range" class="demo-slider" min="1" max="100" value="10" style="flex:1;min-width:100px;">' +
      '<span class="demo-value" style="min-width:2.4em;">10</span></label>' +
      '<span style="display:flex;gap:4px;margin-left:8px;">' +
      '<button class="demo-btn active" data-method="left">Left</button>' +
      '<button class="demo-btn" data-method="right">Right</button>' +
      '<button class="demo-btn" data-method="mid">Mid</button></span>';

    const { wrap, canvas } = makeCanvasWrap(container, 380);
    const info = makeInfo(container);
    const graph = new GraphCanvas(canvas, { xMin: -1, xMax: 3, yMin: -0.5, yMax: 5 });
    const slider = ctrl.querySelector('.demo-slider');
    const valSpan = ctrl.querySelector('.demo-value');
    const methodBtns = ctrl.querySelectorAll('[data-method]');

    const fn = (x) => x * x;
    const exactArea = (b, a) => (b * b * b - a * a * a) / 3;
    let method = 'left';
    const aVal = 0, bVal = 2;

    function render() {
      graph.base();
      const c = graph.colors();
      const n = parseInt(slider.value, 10);
      const dx = (bVal - aVal) / n;

      for (let i = 0; i < n; i++) {
        const xl = aVal + i * dx;
        let sampleX;
        if (method === 'left') sampleX = xl;
        else if (method === 'right') sampleX = xl + dx;
        else sampleX = xl + dx / 2;
        const h = fn(sampleX);
        const fillC = h >= 0 ? c.fill : (document.body.classList.contains('light-mode') ? 'rgba(207,34,46,0.18)' : 'rgba(255,107,107,0.18)');
        const strokeC = c.fn[0];
        graph.drawRect(xl, 0, xl + dx, h, fillC, strokeC);
      }

      graph.plotFn(fn, c.fn[1], 2.5);

      let approx = 0;
      for (let i = 0; i < n; i++) {
        const xl = aVal + i * dx;
        let sampleX;
        if (method === 'left') sampleX = xl;
        else if (method === 'right') sampleX = xl + dx;
        else sampleX = xl + dx / 2;
        approx += fn(sampleX) * dx;
      }

      const exact = exactArea(bVal, aVal);
      info.innerHTML = `Approximate area: <strong>${approx.toFixed(6)}</strong> &nbsp;|&nbsp; ` +
        `Exact area: <strong>${exact.toFixed(6)}</strong> &nbsp;|&nbsp; ` +
        `Error: <strong>${Math.abs(approx - exact).toFixed(6)}</strong>`;
    }

    slider.addEventListener('input', () => {
      valSpan.textContent = slider.value;
      render();
    });

    methodBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        methodBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        method = btn.dataset.method;
        render();
      });
    });

    setupResize(wrap, graph, render);
    allDemos.push(render);
  }

  // ============================================================
  //  DEMO: TAYLOR SERIES
  // ============================================================

  function initTaylorSeries(container) {
    const funcs = [
      { label: 'sin(x)', actual: Math.sin, taylor: taylorSin },
      { label: 'cos(x)', actual: Math.cos, taylor: taylorCos },
      { label: 'eˣ', actual: Math.exp, taylor: taylorExp },
      { label: 'ln(1+x)', actual: (x) => Math.log(1 + x), taylor: taylorLn1px },
    ];

    function taylorSin(x, deg) {
      let s = 0;
      for (let k = 0; ; k++) {
        const n = 2 * k + 1;
        if (n > deg) break;
        s += Math.pow(-1, k) * Math.pow(x, n) / factorial(n);
      }
      return s;
    }
    function taylorCos(x, deg) {
      let s = 0;
      for (let k = 0; ; k++) {
        const n = 2 * k;
        if (n > deg) break;
        s += Math.pow(-1, k) * Math.pow(x, n) / factorial(n);
      }
      return s;
    }
    function taylorExp(x, deg) {
      let s = 0;
      for (let k = 0; k <= deg; k++) s += Math.pow(x, k) / factorial(k);
      return s;
    }
    function taylorLn1px(x, deg) {
      let s = 0;
      for (let k = 1; k <= deg; k++) s += Math.pow(-1, k + 1) * Math.pow(x, k) / k;
      return s;
    }

    function formulaStr(idx, deg) {
      const terms = [];
      if (idx === 0) {
        for (let k = 0; ; k++) {
          const n = 2 * k + 1;
          if (n > deg) break;
          const sign = k % 2 === 0 ? '+' : '-';
          const coeff = factorial(n);
          terms.push(`${sign === '-' ? '- ' : (k > 0 ? '+ ' : '')}x^${n}/${coeff}`);
        }
      } else if (idx === 1) {
        for (let k = 0; ; k++) {
          const n = 2 * k;
          if (n > deg) break;
          const sign = k % 2 === 0 ? '+' : '-';
          const coeff = factorial(n);
          if (n === 0) terms.push('1');
          else terms.push(`${sign === '-' ? '- ' : '+ '}x^${n}/${coeff}`);
        }
      } else if (idx === 2) {
        for (let k = 0; k <= deg; k++) {
          const coeff = factorial(k);
          if (k === 0) terms.push('1');
          else terms.push(`+ x^${k}/${coeff}`);
        }
      } else {
        for (let k = 1; k <= deg; k++) {
          const sign = (k + 1) % 2 === 0 ? '-' : '+';
          if (k === 1) terms.push('x');
          else terms.push(`${sign === '-' ? '- ' : '+ '}x^${k}/${k}`);
        }
      }
      return terms.length ? 'T(x) = ' + terms.join(' ') : 'T(x) = 0';
    }

    const ctrl = makeControls(container);
    const selHTML = funcs.map((f, i) => `<option value="${i}">${f.label}</option>`).join('');
    ctrl.innerHTML =
      `<select class="demo-select" style="padding:4px;border-radius:4px;background:var(--input-bg,#252538);color:inherit;border:1px solid var(--border,#444);">${selHTML}</select>` +
      '<label style="flex:1;display:flex;align-items:center;gap:6px;margin-left:10px;">Degree: ' +
      '<input type="range" class="demo-slider" min="0" max="20" step="1" value="1" style="flex:1;">' +
      '<span class="demo-value" style="min-width:2em;">1</span></label>';

    const { wrap, canvas } = makeCanvasWrap(container, 380);
    const info = makeInfo(container);
    info.style.fontFamily = 'monospace';
    info.style.overflowX = 'auto';
    const graph = new GraphCanvas(canvas, { xMin: -7, xMax: 7, yMin: -3, yMax: 3 });
    const sel = ctrl.querySelector('.demo-select');
    const slider = ctrl.querySelector('.demo-slider');
    const valSpan = ctrl.querySelector('.demo-value');

    function render() {
      graph.base();
      const c = graph.colors();
      const idx = parseInt(sel.value, 10);
      const deg = parseInt(slider.value, 10);
      const { actual, taylor } = funcs[idx];

      graph.plotFn(actual, c.fn[0], 2.5);
      graph.plotFn((x) => taylor(x, deg), c.fn[1], 2);
      graph.drawText('f(x)', graph.xMax - 0.5, actual(graph.xMax - 0.5) + 0.3, c.fn[0], 'right', 'bottom', '11px system-ui');
      graph.drawText(`T${deg}(x)`, graph.xMax - 1.5, funcs[idx].taylor(graph.xMax - 1.5, deg) + 0.3, c.fn[1], 'right', 'bottom', '11px system-ui');

      info.textContent = formulaStr(idx, deg);
    }

    sel.addEventListener('change', render);
    slider.addEventListener('input', () => {
      valSpan.textContent = slider.value;
      render();
    });

    setupResize(wrap, graph, render);
    allDemos.push(render);
  }

  // ============================================================
  //  DEMO: VECTOR FIELD
  // ============================================================

  function initVectorField(container) {
    const fields = [
      { label: 'Rotation: F = (−y, x)', fn: (x, y) => [-y, x] },
      { label: 'Source: F = (x, y)', fn: (x, y) => [x, y] },
      { label: 'Sink: F = (−x, −y)', fn: (x, y) => [-x, -y] },
      { label: 'Shear: F = (y, 0)', fn: (x, y) => [y, 0] },
      { label: 'Spiral: F = (−y+x/3, x+y/3)', fn: (x, y) => [-y + x / 3, x + y / 3] },
      { label: 'Saddle: F = (x, −y)', fn: (x, y) => [x, -y] },
      { label: 'Trig: F = (sin y, sin x)', fn: (x, y) => [Math.sin(y), Math.sin(x)] },
    ];

    const ctrl = makeControls(container);
    const selHTML = fields.map((f, i) => `<option value="${i}">${f.label}</option>`).join('');
    ctrl.innerHTML =
      `<select class="demo-select" style="padding:4px;border-radius:4px;background:var(--input-bg,#252538);color:inherit;border:1px solid var(--border,#444);">${selHTML}</select>` +
      '<span style="margin-left:8px;opacity:0.6;font-size:0.85em;">Click to trace a particle path</span>';

    const { wrap, canvas } = makeCanvasWrap(container, 400);
    makeInfo(container);
    const graph = new GraphCanvas(canvas, { xMin: -5, xMax: 5, yMin: -5, yMax: 5 });
    const sel = ctrl.querySelector('.demo-select');

    let particles = [];

    function magColor(mag, maxMag) {
      const t = clamp(mag / maxMag, 0, 1);
      const r = Math.round(lerp(50, 255, t));
      const g = Math.round(lerp(130, 80, t));
      const b = Math.round(lerp(220, 80, t));
      return `rgb(${r},${g},${b})`;
    }

    function render() {
      graph.base();
      const idx = parseInt(sel.value, 10);
      const fieldFn = fields[idx].fn;
      const step = 0.7;
      const arrows = [];
      let maxMag = 0;

      for (let x = Math.ceil(graph.xMin / step) * step; x <= graph.xMax; x += step) {
        for (let y = Math.ceil(graph.yMin / step) * step; y <= graph.yMax; y += step) {
          const [vx, vy] = fieldFn(x, y);
          const mag = Math.hypot(vx, vy);
          if (mag > maxMag) maxMag = mag;
          arrows.push({ x, y, vx, vy, mag });
        }
      }

      const scale = step * 0.4 / (maxMag || 1);
      arrows.forEach((a) => {
        const color = magColor(a.mag, maxMag);
        graph.drawArrow(a.x, a.y, a.x + a.vx * scale, a.y + a.vy * scale, color, 1.2);
      });

      particles.forEach((path) => {
        const c = graph.colors();
        graph.ctx.strokeStyle = c.fn[1];
        graph.ctx.lineWidth = 2;
        graph.ctx.beginPath();
        path.forEach((p, i) => {
          const px = graph.sx(p.x), py = graph.sy(p.y);
          if (i === 0) graph.ctx.moveTo(px, py);
          else graph.ctx.lineTo(px, py);
        });
        graph.ctx.stroke();
        if (path.length) {
          const last = path[path.length - 1];
          graph.drawPoint(last.x, last.y, c.fn[1], 3);
        }
      });
    }

    canvas.addEventListener('click', (e) => {
      const r = canvas.getBoundingClientRect();
      const mx = e.clientX - r.left, my = e.clientY - r.top;
      const wx = graph.wx(mx), wy = graph.wy(my);
      const idx = parseInt(sel.value, 10);
      const fieldFn = fields[idx].fn;
      const path = [{ x: wx, y: wy }];
      let cx = wx, cy = wy;
      for (let i = 0; i < 500; i++) {
        const [vx, vy] = fieldFn(cx, cy);
        cx += vx * 0.03;
        cy += vy * 0.03;
        path.push({ x: cx, y: cy });
        if (Math.abs(cx) > 20 || Math.abs(cy) > 20) break;
      }
      particles.push(path);
      render();
    });

    sel.addEventListener('change', () => { particles = []; render(); });

    setupResize(wrap, graph, render);
    allDemos.push(render);
  }

  // ============================================================
  //  DEMO: MATRIX TRANSFORM
  // ============================================================

  function initMatrixTransform(container) {
    const presets = [
      { label: 'Rotation 45°', m: [0.707, -0.707, 0.707, 0.707] },
      { label: 'Shear', m: [1, 1, 0, 1] },
      { label: 'Reflect Y', m: [-1, 0, 0, 1] },
      { label: 'Scale 2×', m: [2, 0, 0, 2] },
      { label: 'Projection', m: [1, 0, 0, 0] },
      { label: 'Squeeze', m: [2, 0, 0, 0.5] },
    ];

    const ctrl = makeControls(container);
    ctrl.style.flexWrap = 'wrap';
    ctrl.innerHTML =
      '<div style="display:flex;gap:4px;align-items:center;">' +
      '<span style="font-size:0.85em;">Matrix:</span>' +
      '<input type="number" class="m-in" data-i="0" value="1" step="0.1" style="width:50px;padding:3px;border-radius:3px;background:var(--input-bg,#252538);color:inherit;border:1px solid var(--border,#444);text-align:center;">' +
      '<input type="number" class="m-in" data-i="1" value="0" step="0.1" style="width:50px;padding:3px;border-radius:3px;background:var(--input-bg,#252538);color:inherit;border:1px solid var(--border,#444);text-align:center;">' +
      '<input type="number" class="m-in" data-i="2" value="0" step="0.1" style="width:50px;padding:3px;border-radius:3px;background:var(--input-bg,#252538);color:inherit;border:1px solid var(--border,#444);text-align:center;">' +
      '<input type="number" class="m-in" data-i="3" value="1" step="0.1" style="width:50px;padding:3px;border-radius:3px;background:var(--input-bg,#252538);color:inherit;border:1px solid var(--border,#444);text-align:center;">' +
      '<button class="demo-btn" data-action="animate">Animate</button></div>' +
      '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:4px;">' +
      presets.map((p, i) => `<button class="demo-btn demo-preset" data-p="${i}">${p.label}</button>`).join('') +
      '</div>';

    const { wrap, canvas } = makeCanvasWrap(container, 400);
    const info = makeInfo(container);
    const graph = new GraphCanvas(canvas, { xMin: -4, xMax: 4, yMin: -4, yMax: 4 });
    const inputs = ctrl.querySelectorAll('.m-in');

    let animating = false;

    function getMatrix() {
      return Array.from(inputs).map((inp) => parseFloat(inp.value) || 0);
    }

    function transformPt(m, x, y) {
      return [m[0] * x + m[1] * y, m[2] * x + m[3] * y];
    }

    function drawGrid(m, color, lw) {
      const ctx = graph.ctx;
      ctx.strokeStyle = color;
      ctx.lineWidth = lw;
      ctx.globalAlpha = 0.5;
      for (let i = -5; i <= 5; i++) {
        ctx.beginPath();
        const [x1, y1] = transformPt(m, i, -5);
        const [x2, y2] = transformPt(m, i, 5);
        ctx.moveTo(graph.sx(x1), graph.sy(y1));
        ctx.lineTo(graph.sx(x2), graph.sy(y2));
        ctx.stroke();
        ctx.beginPath();
        const [x3, y3] = transformPt(m, -5, i);
        const [x4, y4] = transformPt(m, 5, i);
        ctx.moveTo(graph.sx(x3), graph.sy(y3));
        ctx.lineTo(graph.sx(x4), graph.sy(y4));
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    function drawUnitSquare(m, fillColor, strokeColor) {
      const ctx = graph.ctx;
      const pts = [[0, 0], [1, 0], [1, 1], [0, 1]].map(([x, y]) => transformPt(m, x, y));
      ctx.fillStyle = fillColor;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      pts.forEach(([x, y], i) => {
        const px = graph.sx(x), py = graph.sy(y);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    function eigenInfo(m) {
      const tr = m[0] + m[3];
      const det = m[0] * m[3] - m[1] * m[2];
      const disc = tr * tr - 4 * det;
      if (disc < 0) return 'Eigenvalues: complex (' + (tr / 2).toFixed(2) + ' ± ' + (Math.sqrt(-disc) / 2).toFixed(2) + 'i)';
      const l1 = (tr + Math.sqrt(disc)) / 2;
      const l2 = (tr - Math.sqrt(disc)) / 2;
      return `Eigenvalues: λ₁ = ${l1.toFixed(3)}, λ₂ = ${l2.toFixed(3)}   det = ${det.toFixed(3)}`;
    }

    function drawEigenvectors(m) {
      const tr = m[0] + m[3];
      const det = m[0] * m[3] - m[1] * m[2];
      const disc = tr * tr - 4 * det;
      if (disc < 0) return;
      const c = graph.colors();
      [0, 1].forEach((idx) => {
        const lambda = idx === 0 ? (tr + Math.sqrt(disc)) / 2 : (tr - Math.sqrt(disc)) / 2;
        let vx, vy;
        if (Math.abs(m[1]) > 1e-10) { vx = m[1]; vy = lambda - m[0]; }
        else if (Math.abs(m[2]) > 1e-10) { vx = lambda - m[3]; vy = m[2]; }
        else { vx = idx === 0 ? 1 : 0; vy = idx === 0 ? 0 : 1; }
        const len = Math.hypot(vx, vy);
        if (len < 1e-10) return;
        vx /= len; vy /= len;
        const scale = 3;
        graph.drawArrow(0, 0, vx * scale, vy * scale, c.fn[3 + idx], 2);
      });
    }

    function renderWithMatrix(m) {
      graph.base();
      const c = graph.colors();
      const identity = [1, 0, 0, 1];
      drawGrid(identity, c.grid, 0.3);
      drawUnitSquare(identity, 'transparent', c.axes);
      drawGrid(m, c.fn[0], 0.7);
      drawUnitSquare(m, c.fill, c.fn[0]);
      drawEigenvectors(m);
      info.textContent = eigenInfo(m);
    }

    function render() { renderWithMatrix(getMatrix()); }

    inputs.forEach((inp) => inp.addEventListener('input', render));

    ctrl.addEventListener('click', (e) => {
      if (e.target.dataset.p !== undefined) {
        const p = presets[parseInt(e.target.dataset.p, 10)];
        p.m.forEach((v, i) => { inputs[i].value = v; });
        render();
      }
      if (e.target.dataset.action === 'animate' && !animating) {
        const target = getMatrix();
        const start = performance.now();
        const duration = 600;
        animating = true;
        function frame(now) {
          const t = clamp((now - start) / duration, 0, 1);
          const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
          const m = [
            lerp(1, target[0], ease), lerp(0, target[1], ease),
            lerp(0, target[2], ease), lerp(1, target[3], ease),
          ];
          renderWithMatrix(m);
          if (t < 1) requestAnimationFrame(frame);
          else animating = false;
        }
        requestAnimationFrame(frame);
      }
    });

    setupResize(wrap, graph, render);
    allDemos.push(render);
  }

  // ============================================================
  //  DEMO: LIMIT EXPLORER
  // ============================================================

  function initLimitExplorer(container) {
    const funcs = [
      { label: '(x²−1)/(x−1) at x=1', fn: (x) => (x * x - 1) / (x - 1), pt: 1, limit: 2, actual: (x) => x + 1 },
      { label: 'sin(x)/x at x=0', fn: (x) => (x === 0 ? NaN : Math.sin(x) / x), pt: 0, limit: 1, actual: null },
      { label: '(x³−8)/(x−2) at x=2', fn: (x) => (x * x * x - 8) / (x - 2), pt: 2, limit: 12, actual: (x) => x * x + 2 * x + 4 },
      { label: '(eˣ−1)/x at x=0', fn: (x) => (x === 0 ? NaN : (Math.exp(x) - 1) / x), pt: 0, limit: 1, actual: null },
    ];

    const ctrl = makeControls(container);
    const selHTML = funcs.map((f, i) => `<option value="${i}">${f.label}</option>`).join('');
    ctrl.innerHTML =
      `<select class="demo-select" style="padding:4px;border-radius:4px;background:var(--input-bg,#252538);color:inherit;border:1px solid var(--border,#444);">${selHTML}</select>` +
      '<label style="flex:1;display:flex;align-items:center;gap:6px;margin-left:10px;">Approach (log₁₀ δ): ' +
      '<input type="range" class="demo-slider" min="-8" max="0" step="0.1" value="-1" style="flex:1;">' +
      '<span class="demo-value" style="min-width:3em;">-1.0</span></label>';

    const { wrap, canvas } = makeCanvasWrap(container, 360);
    const info = makeInfo(container);
    info.style.fontFamily = 'monospace';
    info.style.whiteSpace = 'pre-wrap';
    info.style.fontSize = '0.82em';
    const graph = new GraphCanvas(canvas, { xMin: -2, xMax: 4, yMin: -1, yMax: 5 });
    const sel = ctrl.querySelector('.demo-select');
    const slider = ctrl.querySelector('.demo-slider');
    const valSpan = ctrl.querySelector('.demo-value');

    function render() {
      const idx = parseInt(sel.value, 10);
      const { fn, pt, limit, actual } = funcs[idx];

      const range = 3;
      graph.setViewport(pt - range, pt + range, limit - range, limit + range);
      graph.base();
      const c = graph.colors();

      // Plot the function, skipping the discontinuity
      graph.plotFn((x) => {
        if (Math.abs(x - pt) < 1e-10) return NaN;
        return fn(x);
      }, c.fn[0], 2.5);

      graph.drawOpenCircle(pt, limit, c.fn[0], 5);

      const delta = Math.pow(10, parseFloat(slider.value));
      const leftX = pt - delta;
      const rightX = pt + delta;
      const leftY = fn(leftX);
      const rightY = fn(rightX);

      if (isFinite(leftY)) graph.drawPoint(leftX, leftY, c.fn[1], 5);
      if (isFinite(rightY)) graph.drawPoint(rightX, rightY, c.fn[2], 5);

      // Dashed vertical line at the limit point
      const ctx = graph.ctx;
      ctx.setLineDash([4, 4]);
      graph.drawLine(pt, graph.yMin, pt, graph.yMax, c.axes, 0.8);
      ctx.setLineDash([]);

      // Value table
      const deltas = [1, 0.1, 0.01, 0.001, delta];
      let table = 'δ          | f(a−δ)      | f(a+δ)      | limit\n';
      table += '─'.repeat(56) + '\n';
      deltas.forEach((d) => {
        const lv = fn(pt - d), rv = fn(pt + d);
        table += `${d.toExponential(1).padEnd(10)} | ${isFinite(lv) ? lv.toFixed(6).padEnd(11) : 'undefined'.padEnd(11)} | ${isFinite(rv) ? rv.toFixed(6).padEnd(11) : 'undefined'.padEnd(11)} | ${limit}\n`;
      });
      table += `\nLeft-hand limit: ${isFinite(leftY) ? leftY.toFixed(8) : '—'}`;
      table += `\nRight-hand limit: ${isFinite(rightY) ? rightY.toFixed(8) : '—'}`;
      table += `\nLimit: ${limit}`;
      info.textContent = table;
    }

    sel.addEventListener('change', render);
    slider.addEventListener('input', () => {
      valSpan.textContent = parseFloat(slider.value).toFixed(1);
      render();
    });

    setupResize(wrap, graph, render);
    allDemos.push(render);
  }

  // ============================================================
  //  DEMO: SERIES CONVERGENCE
  // ============================================================

  function initSeriesConvergence(container) {
    const series = [
      {
        label: 'Geometric (r=½)',
        term: (n) => Math.pow(0.5, n),
        converges: true,
        limit: 2,
        info: 'Converges to 1/(1−r) = 2',
      },
      {
        label: 'Harmonic',
        term: (n) => 1 / n,
        converges: false,
        limit: Infinity,
        info: 'Diverges (grows without bound)',
      },
      {
        label: 'p-series (p=2)',
        term: (n) => 1 / (n * n),
        converges: true,
        limit: Math.PI * Math.PI / 6,
        info: 'Converges to π²/6 ≈ ' + (Math.PI * Math.PI / 6).toFixed(4),
      },
      {
        label: 'Alternating Harmonic',
        term: (n) => Math.pow(-1, n + 1) / n,
        converges: true,
        limit: Math.LN2,
        info: 'Converges to ln(2) ≈ 0.6931',
      },
      {
        label: 'Geometric (r=1.2) — divergent',
        term: (n) => Math.pow(1.2, n),
        converges: false,
        limit: Infinity,
        info: 'Diverges (|r| > 1)',
      },
    ];

    const ctrl = makeControls(container);
    const selHTML = series.map((s, i) => `<option value="${i}">${s.label}</option>`).join('');
    ctrl.innerHTML =
      `<select class="demo-select" style="padding:4px;border-radius:4px;background:var(--input-bg,#252538);color:inherit;border:1px solid var(--border,#444);">${selHTML}</select>` +
      '<label style="flex:1;display:flex;align-items:center;gap:6px;margin-left:10px;">Terms (n): ' +
      '<input type="range" class="demo-slider" min="1" max="80" value="20" style="flex:1;">' +
      '<span class="demo-value" style="min-width:2em;">20</span></label>';

    const { wrap, canvas } = makeCanvasWrap(container, 380);
    const info = makeInfo(container);
    const graph = new GraphCanvas(canvas);
    const sel = ctrl.querySelector('.demo-select');
    const slider = ctrl.querySelector('.demo-slider');
    const valSpan = ctrl.querySelector('.demo-value');

    function render() {
      const idx = parseInt(sel.value, 10);
      const s = series[idx];
      const n = parseInt(slider.value, 10);

      const terms = [];
      const partials = [];
      let sum = 0;
      for (let i = 1; i <= n; i++) {
        const t = s.term(i);
        terms.push(t);
        sum += t;
        partials.push(sum);
      }

      const maxAbsTerm = Math.max(...terms.map(Math.abs), 0.1);
      const maxPartial = Math.max(...partials.map(Math.abs), Math.abs(sum), 0.1);
      const yTop = Math.max(maxAbsTerm, maxPartial) * 1.15;
      const yBot = Math.min(0, ...terms, ...partials) * 1.15;

      graph.setViewport(0, n + 1, yBot - 0.3, yTop + 0.3);
      graph.base();
      const c = graph.colors();

      // Bar chart of terms
      const barW = 0.35;
      terms.forEach((t, i) => {
        const x = i + 1;
        const fill = t >= 0 ? (c.fn[0] + '55') : (c.fn[1] + '55');
        const stroke = t >= 0 ? c.fn[0] : c.fn[1];
        graph.drawRect(x - barW, 0, x + barW, t, fill, stroke);
      });

      // Partial sum line
      graph.ctx.strokeStyle = c.fn[2];
      graph.ctx.lineWidth = 2;
      graph.ctx.beginPath();
      partials.forEach((p, i) => {
        const px = graph.sx(i + 1), py = graph.sy(p);
        if (i === 0) graph.ctx.moveTo(px, py);
        else graph.ctx.lineTo(px, py);
      });
      graph.ctx.stroke();
      partials.forEach((p, i) => graph.drawPoint(i + 1, p, c.fn[2], 2.5));

      // Convergence line
      if (s.converges && isFinite(s.limit)) {
        graph.ctx.setLineDash([5, 5]);
        graph.drawLine(0, s.limit, n + 1, s.limit, c.fn[3], 1.5);
        graph.ctx.setLineDash([]);
        graph.drawText('Limit = ' + s.limit.toFixed(4), n * 0.6, s.limit + (yTop - yBot) * 0.04, c.fn[3], 'center', 'bottom', '11px system-ui');
      }

      info.innerHTML = `<strong>${s.converges ? 'Converges' : 'Diverges'}</strong> &nbsp;|&nbsp; ` +
        `S<sub>${n}</sub> = ${sum.toFixed(6)} &nbsp;|&nbsp; ${s.info}`;
    }

    sel.addEventListener('change', render);
    slider.addEventListener('input', () => {
      valSpan.textContent = slider.value;
      render();
    });

    setupResize(wrap, graph, render);
    allDemos.push(render);
  }

  // ============================================================
  //  DEMO: UNIT CIRCLE
  // ============================================================

  function initUnitCircle(container) {
    const ctrl = makeControls(container);
    ctrl.innerHTML =
      '<label style="flex:1;display:flex;align-items:center;gap:6px;">θ = ' +
      '<input type="range" class="demo-slider" min="0" max="6.2832" step="0.01" value="0.7854" style="flex:1;">' +
      '<span class="demo-value" style="min-width:4em;">45.0°</span></label>';

    const { wrap, canvas } = makeCanvasWrap(container, 400);
    const info = makeInfo(container);
    const graph = new GraphCanvas(canvas, { xMin: -2, xMax: 2, yMin: -2, yMax: 2 });
    const slider = ctrl.querySelector('.demo-slider');
    const valSpan = ctrl.querySelector('.demo-value');

    const specialAngles = [
      0, Math.PI / 6, Math.PI / 4, Math.PI / 3, Math.PI / 2,
      2 * Math.PI / 3, 3 * Math.PI / 4, 5 * Math.PI / 6, Math.PI,
      7 * Math.PI / 6, 5 * Math.PI / 4, 4 * Math.PI / 3, 3 * Math.PI / 2,
      5 * Math.PI / 3, 7 * Math.PI / 4, 11 * Math.PI / 6
    ];

    function getQuadrant(a) {
      var n = ((a % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      if (n < Math.PI / 2) return 'I';
      if (n < Math.PI) return 'II';
      if (n < 3 * Math.PI / 2) return 'III';
      return 'IV';
    }

    function render() {
      graph.base();
      var c = graph.colors();
      var ctx = graph.ctx;
      var theta = parseFloat(slider.value);
      var cosT = Math.cos(theta), sinT = Math.sin(theta);

      ctx.strokeStyle = c.axes;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (var i = 0; i <= 200; i++) {
        var a = (i / 200) * 2 * Math.PI;
        var px = graph.sx(Math.cos(a)), py = graph.sy(Math.sin(a));
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();

      specialAngles.forEach(function (a) { graph.drawPoint(Math.cos(a), Math.sin(a), c.text, 2); });

      graph.drawLine(0, 0, cosT, 0, '#3b82f6', 3);
      graph.drawLine(cosT, 0, cosT, sinT, '#ef4444', 3);
      graph.drawLine(0, 0, cosT, sinT, c.axes, 1.5);

      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      var arcSteps = Math.max(Math.round(Math.abs(theta) * 20), 10);
      for (var j = 0; j <= arcSteps; j++) {
        var at = (j / arcSteps) * theta;
        var apx = graph.sx(0.2 * Math.cos(at)), apy = graph.sy(0.2 * Math.sin(at));
        if (j === 0) ctx.moveTo(apx, apy); else ctx.lineTo(apx, apy);
      }
      ctx.stroke();

      if (Math.abs(cosT) > 0.01) {
        var tanT = sinT / cosT;
        if (Math.abs(tanT) < 8) {
          graph.drawLine(1, 0, 1, tanT, '#22c55e', 2.5);
          ctx.setLineDash([4, 3]);
          graph.drawLine(0, 0, 1, tanT, c.text, 0.8);
          ctx.setLineDash([]);
          graph.drawPoint(1, tanT, '#22c55e', 4);
        }
      }

      graph.drawPoint(cosT, sinT, c.fn[0], 6);

      graph.drawText('cos θ', cosT / 2, -0.1, '#3b82f6', 'center', 'top', '11px system-ui');
      if (Math.abs(sinT) > 0.15)
        graph.drawText('sin θ', cosT + (cosT >= 0 ? 0.12 : -0.12), sinT / 2, '#ef4444', cosT >= 0 ? 'left' : 'right', 'middle', '11px system-ui');
      graph.drawText('Quadrant ' + getQuadrant(theta), 0, 1.85, c.text, 'center', 'bottom', 'bold 12px system-ui');

      var deg = (theta * 180 / Math.PI).toFixed(1);
      valSpan.textContent = deg + '°';
      var tanStr = Math.abs(cosT) > 0.01 ? (sinT / cosT).toFixed(4) : 'undef';
      info.innerHTML =
        '<span style="color:#3b82f6">cos \u03b8 = ' + cosT.toFixed(4) + '</span> &nbsp;|&nbsp; ' +
        '<span style="color:#ef4444">sin \u03b8 = ' + sinT.toFixed(4) + '</span> &nbsp;|&nbsp; ' +
        '<span style="color:#22c55e">tan \u03b8 = ' + tanStr + '</span> &nbsp;|&nbsp; ' +
        '\u03b8 = ' + theta.toFixed(3) + ' rad (' + deg + '°)';
    }

    slider.addEventListener('input', render);
    setupResize(wrap, graph, render);
    allDemos.push(render);
  }

  // ============================================================
  //  DEMO: EPSILON-DELTA DEFINITION VISUALIZER
  // ============================================================

  function initEpsilonDelta(container) {
    var funcs = [
      { label: 'f(x) = 2x+1, x\u21921, L=3', fn: function (x) { return 2 * x + 1; }, a: 1, L: 3 },
      { label: 'f(x) = x\u00b2, x\u21922, L=4', fn: function (x) { return x * x; }, a: 2, L: 4 },
      { label: 'f(x) = sin(x)/x, x\u21920, L=1', fn: function (x) { return Math.abs(x) < 1e-12 ? NaN : Math.sin(x) / x; }, a: 0, L: 1 },
      { label: 'f(x) = (x\u00b2\u22124)/(x\u22122), x\u21922, L=4', fn: function (x) { return Math.abs(x - 2) < 1e-12 ? NaN : (x * x - 4) / (x - 2); }, a: 2, L: 4 },
    ];

    var ctrl = makeControls(container);
    ctrl.style.flexWrap = 'wrap';
    var selHTML = funcs.map(function (f, i) { return '<option value="' + i + '">' + f.label + '</option>'; }).join('');
    ctrl.innerHTML =
      '<select class="demo-select" style="padding:4px;border-radius:4px;background:var(--input-bg,#252538);color:inherit;border:1px solid var(--border,#444);">' + selHTML + '</select>' +
      '<div style="display:flex;gap:8px;flex:1;flex-wrap:wrap;margin-left:8px;align-items:center;">' +
      '<label style="display:flex;align-items:center;gap:4px;">\u03b5: <input type="range" class="demo-slider" data-param="eps" min="0.01" max="2" step="0.01" value="0.5" style="width:90px;"><span class="eps-val" style="min-width:3em;">0.50</span></label>' +
      '<label style="display:flex;align-items:center;gap:4px;">\u03b4: <input type="range" class="demo-slider" data-param="del" min="0.01" max="2" step="0.01" value="0.5" style="width:90px;"><span class="del-val" style="min-width:3em;">0.50</span></label>' +
      '<button class="demo-btn" data-action="animate">Animate</button></div>';

    var { wrap, canvas } = makeCanvasWrap(container, 380);
    var infoDiv = makeInfo(container);
    var graph = new GraphCanvas(canvas);
    var sel = ctrl.querySelector('.demo-select');
    var epsSlider = ctrl.querySelector('[data-param="eps"]');
    var delSlider = ctrl.querySelector('[data-param="del"]');
    var epsVal = ctrl.querySelector('.eps-val');
    var delVal = ctrl.querySelector('.del-val');
    var animId = null;

    function render() {
      var idx = parseInt(sel.value, 10);
      var fObj = funcs[idx];
      var fn = fObj.fn, a = fObj.a, L = fObj.L;
      var eps = parseFloat(epsSlider.value);
      var del = parseFloat(delSlider.value);

      graph.setViewport(a - 4, a + 4, L - 4, L + 4);
      graph.base();
      var c = graph.colors();
      var ctx = graph.ctx;

      graph.drawRect(graph.xMin, L - eps, graph.xMax, L + eps, 'rgba(34,197,94,0.12)', 'rgba(34,197,94,0.4)');
      graph.drawRect(a - del, graph.yMin, a + del, graph.yMax, 'rgba(59,130,246,0.12)', 'rgba(59,130,246,0.4)');

      var works = true;
      for (var i = 0; i <= 400; i++) {
        var x = (a - del) + (2 * del * i / 400);
        if (Math.abs(x - a) < 1e-12) continue;
        var y = fn(x);
        if (isFinite(y) && Math.abs(y - L) > eps + 1e-10) { works = false; break; }
      }

      graph.plotFn(function (x) { return Math.abs(x - a) < del ? NaN : fn(x); }, c.fn[0], 2);

      var samples = Math.max(graph.w * 2, 600);
      var passes = [['#22c55e', true], ['#ef4444', false]];
      passes.forEach(function (pass) {
        ctx.strokeStyle = pass[0];
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        var started = false;
        for (var si = 0; si <= samples; si++) {
          var px = (si / samples) * graph.w;
          var sx = graph.wx(px);
          if (Math.abs(sx - a) > del || Math.abs(sx - a) < 1e-12) { started = false; continue; }
          var sy = fn(sx);
          if (!isFinite(sy) || Math.abs(sy) > 1e6) { started = false; continue; }
          var inEps = Math.abs(sy - L) <= eps;
          if (pass[1] !== inEps) { started = false; continue; }
          var ppy = graph.sy(sy);
          if (!started) { ctx.moveTo(px, ppy); started = true; } else ctx.lineTo(px, ppy);
        }
        ctx.stroke();
      });

      graph.drawText('L = ' + L, graph.xMax - 0.3, L + 0.2, c.text, 'right', 'bottom', '10px system-ui');
      graph.drawPoint(a, L, c.fn[0], 4);

      var status = works
        ? '<span style="color:#22c55e;font-weight:bold;">\u03b4 works for this \u03b5! \u2713</span>'
        : '<span style="color:#ef4444;font-weight:bold;">\u03b4 too large \u2014 function escapes! \u2717</span>';
      infoDiv.innerHTML = '\u03b5 = ' + eps.toFixed(2) + ', \u03b4 = ' + del.toFixed(2) + ' &nbsp;|&nbsp; ' + status;
    }

    sel.addEventListener('change', render);
    epsSlider.addEventListener('input', function () { epsVal.textContent = parseFloat(epsSlider.value).toFixed(2); render(); });
    delSlider.addEventListener('input', function () { delVal.textContent = parseFloat(delSlider.value).toFixed(2); render(); });

    ctrl.addEventListener('click', function (e) {
      if (!e.target.dataset || e.target.dataset.action !== 'animate') return;
      if (animId) { cancelAnimationFrame(animId); animId = null; return; }
      var t = 0;
      function step() {
        t += 0.01;
        var ep = Math.max(0.02, 2 - t * 1.98);
        var idx2 = parseInt(sel.value, 10);
        var fn2 = funcs[idx2].fn, a2 = funcs[idx2].a, L2 = funcs[idx2].L;
        var bestDel = ep;
        for (var d = ep; d > 0.005; d -= 0.005) {
          var ok = true;
          for (var j = 0; j <= 100; j++) {
            var x = (a2 - d) + (2 * d * j / 100);
            if (Math.abs(x - a2) < 1e-12) continue;
            var y = fn2(x);
            if (isFinite(y) && Math.abs(y - L2) > ep) { ok = false; break; }
          }
          if (ok) { bestDel = d; break; }
        }
        epsSlider.value = ep; delSlider.value = bestDel;
        epsVal.textContent = ep.toFixed(2); delVal.textContent = bestDel.toFixed(2);
        render();
        if (t < 1) animId = requestAnimationFrame(step); else animId = null;
      }
      animId = requestAnimationFrame(step);
    });

    setupResize(wrap, graph, render);
    allDemos.push(render);
  }

  // ============================================================
  //  DEMO: SECANT LINE → TANGENT LINE
  // ============================================================

  function initSecantToTangent(container) {
    var funcList = [
      { label: 'x\u00b2', expr: 'x^2' },
      { label: 'sin(x)', expr: 'sin(x)' },
      { label: 'x\u00b3 \u2212 3x', expr: 'x^3-3*x' },
      { label: 'cos(x)', expr: 'cos(x)' },
      { label: 'e\u02e3', expr: 'exp(x)' },
    ];

    var ctrl = makeControls(container);
    ctrl.style.flexWrap = 'wrap';
    var selHTML = funcList.map(function (f, i) { return '<option value="' + i + '">' + f.label + '</option>'; }).join('');
    ctrl.innerHTML =
      '<select class="demo-select" style="padding:4px;border-radius:4px;background:var(--input-bg,#252538);color:inherit;border:1px solid var(--border,#444);">' + selHTML + '</select>' +
      '<label style="display:flex;align-items:center;gap:4px;margin-left:8px;">a: <input type="range" class="demo-slider" data-param="a" min="-4" max="4" step="0.05" value="1" style="width:80px;"><span class="a-val" style="min-width:3em;">1.00</span></label>' +
      '<label style="display:flex;align-items:center;gap:4px;margin-left:8px;">h: <input type="range" class="demo-slider" data-param="h" min="-3" max="3" step="0.01" value="1" style="width:80px;"><span class="h-val" style="min-width:3em;">1.00</span></label>' +
      '<button class="demo-btn" data-action="animate" style="margin-left:6px;">Animate h\u21920</button>';

    var { wrap, canvas } = makeCanvasWrap(container, 380);
    var infoDiv = makeInfo(container);
    var graph = new GraphCanvas(canvas, { xMin: -5, xMax: 5, yMin: -3, yMax: 7 });
    var sel = ctrl.querySelector('.demo-select');
    var aSlider = ctrl.querySelector('[data-param="a"]');
    var hSlider = ctrl.querySelector('[data-param="h"]');
    var aValSpan = ctrl.querySelector('.a-val');
    var hValSpan = ctrl.querySelector('.h-val');
    var fn = MathParser.compile(funcList[0].expr);
    var animId = null;

    function render() {
      graph.base();
      var c = graph.colors();
      var ctx = graph.ctx;
      if (!fn) return;
      graph.plotFn(fn, c.fn[0], 2.5);

      var a = parseFloat(aSlider.value);
      var h = parseFloat(hSlider.value);
      var fa = fn(a);
      if (!isFinite(fa)) return;
      var isTangent = Math.abs(h) < 0.05;
      var fah = fn(a + h);
      var ext = 6;

      if (Math.abs(h) > 0.001 && isFinite(fah)) {
        var secSlope = (fah - fa) / h;
        ctx.setLineDash([6, 4]);
        graph.drawLine(a - ext, fa - secSlope * ext, a + ext, fa + secSlope * ext, '#f97316', 2);
        ctx.setLineDash([]);
        graph.drawPoint(a + h, fah, '#f97316', 5);
        if (!isTangent)
          infoDiv.innerHTML = 'Secant slope: (f(' + (a + h).toFixed(2) + ') \u2212 f(' + a.toFixed(2) + ')) / ' + h.toFixed(3) + ' = <strong>' + secSlope.toFixed(4) + '</strong>';
      }

      if (isTangent) {
        var tanSlope = numericalDerivative(fn, a);
        graph.drawLine(a - ext, fa - tanSlope * ext, a + ext, fa + tanSlope * ext, '#ef4444', 2.5);
        infoDiv.innerHTML = 'Tangent line at x = ' + a.toFixed(2) + ' &nbsp;|&nbsp; <strong>f\'(' + a.toFixed(2) + ') = ' + tanSlope.toFixed(4) + '</strong>';
      }

      graph.drawPoint(a, fa, c.fn[1], 6);
    }

    sel.addEventListener('change', function () { fn = MathParser.compile(funcList[sel.value].expr); render(); });
    aSlider.addEventListener('input', function () { aValSpan.textContent = parseFloat(aSlider.value).toFixed(2); render(); });
    hSlider.addEventListener('input', function () { hValSpan.textContent = parseFloat(hSlider.value).toFixed(2); render(); });

    ctrl.addEventListener('click', function (e) {
      if (!e.target.dataset || e.target.dataset.action !== 'animate') return;
      if (animId) { cancelAnimationFrame(animId); animId = null; return; }
      var curH = parseFloat(hSlider.value);
      if (Math.abs(curH) < 0.1) { hSlider.value = 2; curH = 2; }
      function step() {
        curH *= 0.96;
        if (Math.abs(curH) < 0.01) curH = 0;
        hSlider.value = curH;
        hValSpan.textContent = curH.toFixed(2);
        render();
        if (Math.abs(curH) > 0.005) animId = requestAnimationFrame(step); else animId = null;
      }
      animId = requestAnimationFrame(step);
    });

    setupResize(wrap, graph, render);
    allDemos.push(render);
  }

  // ============================================================
  //  DEMO: CURVE SKETCHING — COMPLETE CURVE ANALYSIS
  // ============================================================

  function initCurveSketching(container) {
    var ctrl = makeControls(container);
    ctrl.style.flexWrap = 'wrap';
    ctrl.innerHTML =
      '<label style="flex:1;display:flex;align-items:center;gap:6px;">f(x) = ' +
      '<input type="text" class="demo-input" value="x^3-3*x" style="flex:1;padding:4px 8px;border:1px solid var(--border,#444);border-radius:4px;background:var(--input-bg,#252538);color:inherit;font-family:monospace;"></label>' +
      '<label style="display:flex;align-items:center;gap:4px;margin-left:8px;"><input type="checkbox" class="demo-cb" data-show="fp" checked> f\'</label>' +
      '<label style="display:flex;align-items:center;gap:4px;margin-left:4px;"><input type="checkbox" class="demo-cb" data-show="fpp"> f\'\'</label>';

    var { wrap, canvas } = makeCanvasWrap(container, 400);
    var infoDiv = makeInfo(container);
    var graph = new GraphCanvas(canvas, { xMin: -5, xMax: 5, yMin: -6, yMax: 6 });
    var input = ctrl.querySelector('.demo-input');
    var fn = MathParser.compile(input.value);

    function findZeros(f, lo, hi, steps) {
      var result = [];
      var dx = (hi - lo) / steps;
      for (var i = 0; i < steps; i++) {
        var x1 = lo + i * dx, x2 = x1 + dx;
        var y1 = f(x1), y2 = f(x2);
        if (isFinite(y1) && isFinite(y2) && y1 * y2 < 0) {
          var a = x1, b = x2;
          for (var j = 0; j < 30; j++) {
            var mid = (a + b) / 2;
            if (f(mid) * f(a) < 0) b = mid; else a = mid;
          }
          result.push((a + b) / 2);
        }
      }
      return result;
    }

    function render() {
      graph.base();
      var c = graph.colors();
      var ctx = graph.ctx;
      if (!fn) { infoDiv.textContent = 'Invalid expression'; return; }

      var showFp = ctrl.querySelector('[data-show="fp"]').checked;
      var showFpp = ctrl.querySelector('[data-show="fpp"]').checked;
      var fp = function (x) { return numericalDerivative(fn, x); };
      var fpp = function (x) { return numericalDerivative(fp, x); };

      var dx = (graph.xMax - graph.xMin) / 400;
      for (var x = graph.xMin; x < graph.xMax; x += dx) {
        var d = fp(x), y = fn(x);
        if (!isFinite(d) || !isFinite(y)) continue;
        graph.drawRect(x, 0, x + dx, y, d > 0 ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)', null);
      }

      graph.plotFn(fn, c.fn[0], 2.5);

      if (showFp) {
        ctx.setLineDash([6, 4]);
        graph.plotFn(fp, '#3b82f6', 1.5);
        ctx.setLineDash([]);
      }
      if (showFpp) {
        ctx.setLineDash([3, 3]);
        graph.plotFn(fpp, '#22c55e', 1.5);
        ctx.setLineDash([]);
      }

      var crits = findZeros(fp, graph.xMin, graph.xMax, 1000);
      crits.forEach(function (xc) {
        var yc = fn(xc);
        if (!isFinite(yc)) return;
        var curv = fpp(xc);
        if (curv > 0.01) {
          graph.drawPoint(xc, yc, '#22c55e', 6);
          graph.drawText('min', xc, yc - 0.3, '#22c55e', 'center', 'top', '10px system-ui');
        } else if (curv < -0.01) {
          graph.drawPoint(xc, yc, '#ef4444', 6);
          graph.drawText('max', xc, yc + 0.3, '#ef4444', 'center', 'bottom', '10px system-ui');
        } else {
          graph.drawPoint(xc, yc, '#a855f7', 6);
        }
      });

      var infls = findZeros(fpp, graph.xMin, graph.xMax, 1000);
      infls.forEach(function (xi) {
        var yi = fn(xi);
        if (!isFinite(yi)) return;
        graph.drawPoint(xi, yi, '#a855f7', 5);
        graph.drawText('infl', xi, yi + 0.3, '#a855f7', 'center', 'bottom', '10px system-ui');
      });

      infoDiv.innerHTML =
        '<span style="color:#ef4444">\u25cf</span> max &nbsp; <span style="color:#22c55e">\u25cf</span> min &nbsp; <span style="color:#a855f7">\u25cf</span> inflection' +
        (showFp ? ' &nbsp; <span style="color:#3b82f6">---</span> f\'' : '') +
        (showFpp ? ' &nbsp; <span style="color:#22c55e">\u00b7\u00b7\u00b7</span> f\'\'' : '') +
        ' &nbsp;|&nbsp; Critical: ' + crits.length + ', Inflection: ' + infls.length;
    }

    input.addEventListener('input', function () { fn = MathParser.compile(input.value); render(); });
    ctrl.querySelectorAll('.demo-cb').forEach(function (cb) { cb.addEventListener('change', render); });
    setupResize(wrap, graph, render);
    allDemos.push(render);
  }

  // ============================================================
  //  DEMO: FUNDAMENTAL THEOREM OF CALCULUS
  // ============================================================

  function initFtcVisual(container) {
    var ctrl = makeControls(container);
    ctrl.innerHTML =
      '<label style="flex:1;display:flex;align-items:center;gap:6px;">x = ' +
      '<input type="range" class="demo-slider" min="-6" max="6" step="0.05" value="3" style="flex:1;">' +
      '<span class="demo-value" style="min-width:3em;">3.00</span></label>';

    var { wrap, canvas } = makeCanvasWrap(container, 400);
    var infoDiv = makeInfo(container);
    var graph = new GraphCanvas(canvas, { xMin: -7, xMax: 7, yMin: -3, yMax: 5 });
    var slider = ctrl.querySelector('.demo-slider');
    var valSpan = ctrl.querySelector('.demo-value');

    var f = function (t) { return Math.sin(t) + 1; };

    function trapInt(fn, a, b, n) {
      if (Math.abs(b - a) < 1e-12) return 0;
      var h = (b - a) / n;
      var s = (fn(a) + fn(b)) / 2;
      for (var i = 1; i < n; i++) s += fn(a + i * h);
      return s * h;
    }

    function bigF(x) { return trapInt(f, 0, x, 500); }

    function render() {
      graph.base();
      var c = graph.colors();
      var ctx = graph.ctx;
      var xv = parseFloat(slider.value);

      if (Math.abs(xv) > 0.01) {
        var lo = Math.min(0, xv), hi = Math.max(0, xv);
        var steps = 200, dxs = (hi - lo) / steps;
        var fillCol = xv >= 0 ? 'rgba(59,130,246,0.15)' : 'rgba(239,68,68,0.15)';
        for (var i = 0; i < steps; i++) {
          var xl = lo + i * dxs, yl = f(xl);
          if (isFinite(yl)) graph.drawRect(xl, 0, xl + dxs, yl, fillCol, null);
        }
      }

      graph.plotFn(f, c.fn[0], 2.5);
      graph.plotFn(bigF, c.fn[2], 2);

      var Fxv = bigF(xv), fxv = f(xv);
      if (isFinite(Fxv) && isFinite(fxv)) {
        var ext = 1.5;
        graph.drawLine(xv - ext, Fxv - fxv * ext, xv + ext, Fxv + fxv * ext, c.fn[1], 2);
        graph.drawPoint(xv, Fxv, c.fn[2], 5);
        graph.drawPoint(xv, fxv, c.fn[0], 5);
        ctx.setLineDash([4, 4]);
        graph.drawLine(xv, graph.yMin, xv, graph.yMax, c.text, 0.6);
        ctx.setLineDash([]);
      }

      graph.drawText('f(t) = sin(t)+1', graph.xMax - 1, f(graph.xMax - 1) + 0.3, c.fn[0], 'right', 'bottom', '11px system-ui');
      graph.drawText('F(x) = \u222b\u2080\u02e3 f(t)dt', graph.xMax - 1, bigF(graph.xMax - 1) - 0.3, c.fn[2], 'right', 'top', '11px system-ui');

      valSpan.textContent = xv.toFixed(2);
      infoDiv.innerHTML =
        'Area = F(' + xv.toFixed(2) + ') = <strong>' + Fxv.toFixed(4) + '</strong> &nbsp;|&nbsp; ' +
        'f(x) = <strong>' + fxv.toFixed(4) + '</strong> &nbsp;|&nbsp; ' +
        'Slope of F at x \u2248 <strong>' + numericalDerivative(bigF, xv).toFixed(4) + '</strong>';
    }

    slider.addEventListener('input', render);
    setupResize(wrap, graph, render);
    allDemos.push(render);
  }

  // ============================================================
  //  DEMO: POLAR CURVE PLOTTER
  // ============================================================

  function initPolarGrapher(container) {
    var presets = [
      { label: 'Cardioid: 1+cos(\u03b8)', expr: '1+cos(x)' },
      { label: 'Rose: cos(3\u03b8)', expr: 'cos(3*x)' },
      { label: 'Lima\u00e7on: 2+cos(\u03b8)', expr: '2+cos(x)' },
      { label: 'Circle: 2cos(\u03b8)', expr: '2*cos(x)' },
      { label: 'Spiral: \u03b8/6', expr: 'x/6' },
      { label: 'Lemniscate-like', expr: 'sqrt(abs(4*cos(2*x)))' },
    ];

    var ctrl = makeControls(container);
    ctrl.style.flexWrap = 'wrap';
    var selHTML = presets.map(function (p, i) { return '<option value="' + i + '">' + p.label + '</option>'; }).join('');
    ctrl.innerHTML =
      '<select class="demo-select" style="padding:4px;border-radius:4px;background:var(--input-bg,#252538);color:inherit;border:1px solid var(--border,#444);">' + selHTML + '</select>' +
      '<label style="display:flex;align-items:center;gap:4px;margin-left:8px;flex:1;">r(\u03b8) = ' +
      '<input type="text" class="demo-input" value="1+cos(x)" style="flex:1;padding:4px 8px;border:1px solid var(--border,#444);border-radius:4px;background:var(--input-bg,#252538);color:inherit;font-family:monospace;"> <span style="font-size:0.8em;opacity:0.6;">(use x for \u03b8)</span></label>' +
      '<button class="demo-btn" data-action="sweep" style="margin-left:6px;">Sweep</button>';

    var { wrap, canvas } = makeCanvasWrap(container, 400);
    var infoDiv = makeInfo(container);
    var graph = new GraphCanvas(canvas, { xMin: -3, xMax: 3, yMin: -3, yMax: 3 });
    var sel = ctrl.querySelector('.demo-select');
    var input = ctrl.querySelector('.demo-input');
    var fn = MathParser.compile(input.value);
    var sweepAngle = 2 * Math.PI;
    var sweepId = null;

    function drawPolarGrid() {
      var c = graph.colors();
      var ctx = graph.ctx;
      ctx.strokeStyle = c.grid;
      ctx.lineWidth = 0.5;
      for (var r = 0.5; r <= 4; r += 0.5) {
        ctx.beginPath();
        for (var i = 0; i <= 100; i++) {
          var a = (i / 100) * 2 * Math.PI;
          var px = graph.sx(r * Math.cos(a)), py = graph.sy(r * Math.sin(a));
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
      for (var a2 = 0; a2 < Math.PI; a2 += Math.PI / 6) {
        graph.drawLine(-4 * Math.cos(a2), -4 * Math.sin(a2), 4 * Math.cos(a2), 4 * Math.sin(a2), c.grid, 0.5);
      }
    }

    function render() {
      graph.clear();
      drawPolarGrid();
      graph.drawAxes();
      var c = graph.colors();
      var ctx = graph.ctx;
      if (!fn) { infoDiv.textContent = 'Invalid expression'; return; }

      var steps = 1000;
      var maxTheta = sweepAngle;
      ctx.strokeStyle = c.fn[0];
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      var started = false;
      for (var i = 0; i <= steps; i++) {
        var theta = (i / steps) * maxTheta;
        var r = fn(theta);
        if (!isFinite(r)) { started = false; continue; }
        var xp = r * Math.cos(theta), yp = r * Math.sin(theta);
        var px = graph.sx(xp), py = graph.sy(yp);
        if (!started) { ctx.moveTo(px, py); started = true; } else ctx.lineTo(px, py);
      }
      ctx.stroke();

      if (sweepAngle < 2 * Math.PI - 0.01) {
        var rNow = fn(sweepAngle);
        if (isFinite(rNow)) {
          var xNow = rNow * Math.cos(sweepAngle), yNow = rNow * Math.sin(sweepAngle);
          graph.drawPoint(xNow, yNow, c.fn[1], 5);
          ctx.setLineDash([3, 3]);
          graph.drawLine(0, 0, xNow, yNow, c.fn[1], 1);
          ctx.setLineDash([]);
        }
      }

      var area = 0, dt = maxTheta / steps;
      for (var j = 0; j < steps; j++) {
        var rv = fn((j + 0.5) * dt);
        if (isFinite(rv)) area += 0.5 * rv * rv * dt;
      }

      var rEnd = fn(sweepAngle);
      var xEnd = isFinite(rEnd) ? rEnd * Math.cos(sweepAngle) : 0;
      var yEnd = isFinite(rEnd) ? rEnd * Math.sin(sweepAngle) : 0;
      infoDiv.innerHTML =
        '\u03b8 = ' + sweepAngle.toFixed(2) + ' rad &nbsp;|&nbsp; ' +
        'r = ' + (isFinite(rEnd) ? rEnd.toFixed(3) : '\u2014') + ' &nbsp;|&nbsp; ' +
        '(x,y) = (' + xEnd.toFixed(3) + ', ' + yEnd.toFixed(3) + ') &nbsp;|&nbsp; ' +
        'Area \u2248 ' + area.toFixed(4);
    }

    sel.addEventListener('change', function () {
      var p = presets[sel.value]; input.value = p.expr;
      fn = MathParser.compile(p.expr); sweepAngle = 2 * Math.PI; render();
    });
    input.addEventListener('input', function () {
      fn = MathParser.compile(input.value.replace(/theta/g, 'x'));
      sweepAngle = 2 * Math.PI; render();
    });
    ctrl.addEventListener('click', function (e) {
      if (!e.target.dataset || e.target.dataset.action !== 'sweep') return;
      if (sweepId) { cancelAnimationFrame(sweepId); sweepId = null; return; }
      sweepAngle = 0;
      function step() {
        sweepAngle += 0.04;
        if (sweepAngle > 2 * Math.PI) { sweepAngle = 2 * Math.PI; render(); sweepId = null; return; }
        render();
        sweepId = requestAnimationFrame(step);
      }
      sweepId = requestAnimationFrame(step);
    });

    setupResize(wrap, graph, render);
    allDemos.push(render);
  }

  // ============================================================
  //  DEMO: SLOPE FIELD FOR DIFFERENTIAL EQUATIONS
  // ============================================================

  function initSlopeField(container) {
    var eqs = [
      { label: 'dy/dx = x + y', expr: 'x+y' },
      { label: 'dy/dx = x\u00b7y', expr: 'x*y' },
      { label: 'dy/dx = \u2212y/x', expr: '-y/x' },
      { label: 'dy/dx = sin(x)', expr: 'sin(x)' },
      { label: 'dy/dx = x\u00b2 \u2212 y', expr: 'x^2-y' },
    ];

    var ctrl = makeControls(container);
    var selHTML = eqs.map(function (e, i) { return '<option value="' + i + '">' + e.label + '</option>'; }).join('');
    ctrl.innerHTML =
      '<select class="demo-select" style="padding:4px;border-radius:4px;background:var(--input-bg,#252538);color:inherit;border:1px solid var(--border,#444);">' + selHTML + '</select>' +
      '<button class="demo-btn" data-action="clear" style="margin-left:8px;">Clear traces</button>' +
      '<span style="margin-left:8px;opacity:0.6;font-size:0.85em;">Click to trace a solution</span>';

    var { wrap, canvas } = makeCanvasWrap(container, 400);
    var infoDiv = makeInfo(container);
    var graph = new GraphCanvas(canvas, { xMin: -5, xMax: 5, yMin: -5, yMax: 5 });
    var sel = ctrl.querySelector('.demo-select');
    var dydx = MathParser.compile(eqs[0].expr);
    var traces = [];
    var traceColors = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#ec4899', '#06b6d4'];

    function render() {
      graph.base();
      var c = graph.colors();
      var ctx = graph.ctx;
      if (!dydx) return;

      var step = 0.5, segLen = 0.2;
      for (var gx = Math.ceil(graph.xMin / step) * step; gx <= graph.xMax; gx += step) {
        for (var gy = Math.ceil(graph.yMin / step) * step; gy <= graph.yMax; gy += step) {
          var slope = dydx(gx, gy);
          if (!isFinite(slope)) continue;
          var angle = Math.atan(slope);
          var ddx = segLen * Math.cos(angle), ddy = segLen * Math.sin(angle);
          var mag = Math.min(Math.abs(slope), 5) / 5;
          var r = Math.round(lerp(100, 255, mag));
          var g = Math.round(lerp(150, 80, mag));
          var b = Math.round(lerp(200, 80, mag));
          graph.drawLine(gx - ddx, gy - ddy, gx + ddx, gy + ddy, 'rgb(' + r + ',' + g + ',' + b + ')', 1.2);
        }
      }

      traces.forEach(function (trace, ti) {
        var col = traceColors[ti % traceColors.length];
        ctx.strokeStyle = col;
        ctx.lineWidth = 2;
        ctx.beginPath();
        trace.forEach(function (p, i) {
          var px = graph.sx(p.x), py = graph.sy(p.y);
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        });
        ctx.stroke();
        if (trace.length) graph.drawPoint(trace[0].x, trace[0].y, col, 4);
      });
    }

    canvas.addEventListener('click', function (e) {
      if (!dydx) return;
      var rect = canvas.getBoundingClientRect();
      var wx = graph.wx(e.clientX - rect.left), wy = graph.wy(e.clientY - rect.top);
      var dt = 0.02;
      var fwd = [{ x: wx, y: wy }];
      var cx = wx, cy = wy;
      for (var i = 0; i < 800; i++) {
        var s = dydx(cx, cy);
        if (!isFinite(s)) break;
        cx += dt; cy += s * dt;
        if (Math.abs(cx) > 10 || Math.abs(cy) > 10) break;
        fwd.push({ x: cx, y: cy });
      }
      var bck = [];
      cx = wx; cy = wy;
      for (var j = 0; j < 800; j++) {
        var s2 = dydx(cx, cy);
        if (!isFinite(s2)) break;
        cx -= dt; cy -= s2 * dt;
        if (Math.abs(cx) > 10 || Math.abs(cy) > 10) break;
        bck.push({ x: cx, y: cy });
      }
      bck.reverse();
      traces.push(bck.concat(fwd));
      render();
    });

    canvas.addEventListener('mousemove', function (e) {
      if (!dydx) return;
      var rect = canvas.getBoundingClientRect();
      var wx = graph.wx(e.clientX - rect.left), wy = graph.wy(e.clientY - rect.top);
      var s = dydx(wx, wy);
      infoDiv.textContent = '(' + wx.toFixed(2) + ', ' + wy.toFixed(2) + ')  dy/dx = ' + (isFinite(s) ? s.toFixed(4) : 'undefined');
    });
    canvas.addEventListener('mouseleave', function () { infoDiv.textContent = ''; });

    sel.addEventListener('change', function () { dydx = MathParser.compile(eqs[sel.value].expr); traces = []; render(); });
    ctrl.addEventListener('click', function (e) {
      if (e.target.dataset && e.target.dataset.action === 'clear') { traces = []; render(); }
    });

    setupResize(wrap, graph, render);
    allDemos.push(render);
  }

  // ============================================================
  //  DEMO: PROBABILITY DISTRIBUTION VISUALIZER
  // ============================================================

  function initProbabilityDist(container) {
    var ctrl = makeControls(container);
    ctrl.style.flexWrap = 'wrap';
    ctrl.innerHTML =
      '<select class="demo-select" style="padding:4px;border-radius:4px;background:var(--input-bg,#252538);color:inherit;border:1px solid var(--border,#444);">' +
      '<option value="normal">Normal</option><option value="binomial">Binomial</option>' +
      '<option value="poisson">Poisson</option><option value="exponential">Exponential</option>' +
      '<option value="uniform">Uniform</option></select>' +
      '<div class="dist-ctrls" style="display:flex;gap:6px;flex:1;flex-wrap:wrap;margin-left:8px;align-items:center;"></div>';

    var { wrap, canvas } = makeCanvasWrap(container, 380);
    var infoDiv = makeInfo(container);
    var graph = new GraphCanvas(canvas, { xMin: -5, xMax: 5, yMin: -0.05, yMax: 0.5 });
    var sel = ctrl.querySelector('.demo-select');
    var distCtrls = ctrl.querySelector('.dist-ctrls');

    function sl(name, label, min, max, step, val) {
      return '<label style="display:flex;align-items:center;gap:3px;font-size:0.9em;">' + label +
        ' <input type="range" data-p="' + name + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '" style="width:60px;">' +
        '<span data-v="' + name + '" style="min-width:2.5em;font-size:0.85em;">' + val + '</span></label>';
    }

    function buildCtrls() {
      var type = sel.value;
      var html = '';
      if (type === 'normal') html = sl('mu', '\u03bc', -4, 4, 0.1, 0) + sl('sig', '\u03c3', 0.2, 3, 0.05, 1);
      else if (type === 'binomial') html = sl('n', 'n', 1, 30, 1, 10) + sl('p', 'p', 0.01, 0.99, 0.01, 0.5);
      else if (type === 'poisson') html = sl('lam', '\u03bb', 0.2, 10, 0.1, 3);
      else if (type === 'exponential') html = sl('lam', '\u03bb', 0.1, 5, 0.1, 1);
      else html = sl('ua', 'lo', -3, 3, 0.1, 0) + sl('ub', 'hi', 0, 5, 0.1, 3);
      html += sl('lo', 'a', -5, 15, 0.1, -1) + sl('hi', 'b', -5, 15, 0.1, 1);
      distCtrls.innerHTML = html;
    }

    function gp(name) {
      var el = distCtrls.querySelector('[data-p="' + name + '"]');
      return el ? parseFloat(el.value) : 0;
    }

    distCtrls.addEventListener('input', function (e) {
      if (e.target.dataset && e.target.dataset.p) {
        var sp = distCtrls.querySelector('[data-v="' + e.target.dataset.p + '"]');
        if (sp) sp.textContent = parseFloat(e.target.value).toFixed(e.target.step < 0.05 ? 2 : 1);
        render();
      }
    });

    function normalPDF(x, mu, sig) {
      return Math.exp(-0.5 * Math.pow((x - mu) / sig, 2)) / (sig * Math.sqrt(2 * Math.PI));
    }

    function binomPMF(k, n, p) {
      if (k < 0 || k > n || k !== Math.floor(k)) return 0;
      var coeff = 1;
      for (var i = 0; i < Math.min(k, n - k); i++) coeff = coeff * (n - i) / (i + 1);
      return coeff * Math.pow(p, k) * Math.pow(1 - p, n - k);
    }

    function poissonPMF(k, lam) {
      if (k < 0 || k !== Math.floor(k)) return 0;
      return Math.pow(lam, k) * Math.exp(-lam) / factorial(k);
    }

    function render() {
      var type = sel.value;
      var isDiscrete = (type === 'binomial' || type === 'poisson');
      var lo = gp('lo'), hi = gp('hi');
      var c = graph.colors();
      var ctx = graph.ctx;

      if (type === 'normal') {
        var mu = gp('mu'), sig = gp('sig');
        var peak = 1 / (sig * Math.sqrt(2 * Math.PI));
        graph.setViewport(mu - 4 * sig, mu + 4 * sig, -peak * 0.05, peak * 1.2);
        graph.base();
        var pdf = function (x) { return normalPDF(x, mu, sig); };
        var steps = 200, dxs = (Math.min(hi, graph.xMax) - Math.max(lo, graph.xMin)) / steps;
        if (hi > lo) {
          for (var i = 0; i < steps; i++) {
            var xl = Math.max(lo, graph.xMin) + i * dxs;
            graph.drawRect(xl, 0, xl + dxs, pdf(xl), 'rgba(59,130,246,0.2)', null);
          }
        }
        graph.plotFn(pdf, c.fn[0], 2.5);
        ctx.setLineDash([4, 4]);
        graph.drawLine(mu, graph.yMin, mu, graph.yMax, c.fn[1], 1);
        [-1, 1, -2, 2, -3, 3].forEach(function (k) {
          graph.drawLine(mu + k * sig, graph.yMin, mu + k * sig, graph.yMax, c.text, 0.4);
        });
        ctx.setLineDash([]);
        var prob = 0;
        for (var j = 0; j < 500; j++) {
          var xx = lo + (hi - lo) * (j + 0.5) / 500;
          prob += pdf(xx) * (hi - lo) / 500;
        }
        infoDiv.innerHTML = 'P(' + lo.toFixed(1) + ' \u2264 X \u2264 ' + hi.toFixed(1) + ') = <strong>' + Math.max(0, prob).toFixed(6) + '</strong> &nbsp;|&nbsp; \u03bc = ' + mu.toFixed(1) + ', \u03c3 = ' + sig.toFixed(2);
      } else if (type === 'binomial') {
        var n = Math.round(gp('n')), p = gp('p');
        var maxP = 0;
        for (var k = 0; k <= n; k++) maxP = Math.max(maxP, binomPMF(k, n, p));
        graph.setViewport(-1, n + 1, -maxP * 0.05, maxP * 1.3);
        graph.base();
        var prob2 = 0;
        for (var k2 = 0; k2 <= n; k2++) {
          var pv = binomPMF(k2, n, p);
          var inRange = k2 >= lo && k2 <= hi;
          var fill = inRange ? 'rgba(59,130,246,0.4)' : 'rgba(59,130,246,0.12)';
          graph.drawRect(k2 - 0.35, 0, k2 + 0.35, pv, fill, c.fn[0]);
          if (inRange) prob2 += pv;
        }
        graph.drawText('\u03bc = ' + (n * p).toFixed(2), n * p, -maxP * 0.08, c.fn[1], 'center', 'top', '10px system-ui');
        infoDiv.innerHTML = 'P(' + Math.ceil(lo) + ' \u2264 X \u2264 ' + Math.floor(hi) + ') = <strong>' + prob2.toFixed(6) + '</strong> &nbsp;|&nbsp; n = ' + n + ', p = ' + p.toFixed(2);
      } else if (type === 'poisson') {
        var lam = gp('lam');
        var maxK = Math.max(Math.ceil(lam + 4 * Math.sqrt(lam)), 12);
        var maxP2 = 0;
        for (var k3 = 0; k3 <= maxK; k3++) maxP2 = Math.max(maxP2, poissonPMF(k3, lam));
        graph.setViewport(-1, maxK + 1, -maxP2 * 0.05, maxP2 * 1.3);
        graph.base();
        var prob3 = 0;
        for (var k4 = 0; k4 <= maxK; k4++) {
          var pv2 = poissonPMF(k4, lam);
          var inR = k4 >= lo && k4 <= hi;
          graph.drawRect(k4 - 0.35, 0, k4 + 0.35, pv2, inR ? 'rgba(59,130,246,0.4)' : 'rgba(59,130,246,0.12)', c.fn[0]);
          if (inR) prob3 += pv2;
        }
        infoDiv.innerHTML = 'P(' + Math.ceil(lo) + ' \u2264 X \u2264 ' + Math.floor(hi) + ') = <strong>' + prob3.toFixed(6) + '</strong> &nbsp;|&nbsp; \u03bb = ' + lam.toFixed(1);
      } else if (type === 'exponential') {
        var lam2 = gp('lam');
        graph.setViewport(-0.5, 5 / lam2, -0.1, lam2 * 1.2);
        graph.base();
        var expPdf = function (x) { return x < 0 ? 0 : lam2 * Math.exp(-lam2 * x); };
        var elo = Math.max(0, lo), ehi = Math.max(0, hi);
        if (ehi > elo) {
          var esteps = 200, edx = (ehi - elo) / esteps;
          for (var ei = 0; ei < esteps; ei++) {
            var exl = elo + ei * edx;
            graph.drawRect(exl, 0, exl + edx, expPdf(exl), 'rgba(59,130,246,0.2)', null);
          }
        }
        graph.plotFn(expPdf, c.fn[0], 2.5);
        var eprob = elo >= 0 ? Math.exp(-lam2 * elo) - Math.exp(-lam2 * ehi) : 0;
        infoDiv.innerHTML = 'P(' + lo.toFixed(1) + ' \u2264 X \u2264 ' + hi.toFixed(1) + ') = <strong>' + Math.max(0, eprob).toFixed(6) + '</strong> &nbsp;|&nbsp; \u03bb = ' + lam2.toFixed(1);
      } else {
        var ua = gp('ua'), ub = gp('ub');
        if (ub <= ua) ub = ua + 0.1;
        var uHeight = 1 / (ub - ua);
        graph.setViewport(ua - 1, ub + 1, -uHeight * 0.1, uHeight * 1.5);
        graph.base();
        var uPdf = function (x) { return (x >= ua && x <= ub) ? uHeight : 0; };
        var ulo = clamp(lo, ua, ub), uhi2 = clamp(hi, ua, ub);
        if (uhi2 > ulo)
          graph.drawRect(ulo, 0, uhi2, uHeight, 'rgba(59,130,246,0.2)', null);
        graph.plotFn(uPdf, c.fn[0], 2.5);
        var uprob = Math.max(0, (uhi2 - ulo) / (ub - ua));
        infoDiv.innerHTML = 'P(' + lo.toFixed(1) + ' \u2264 X \u2264 ' + hi.toFixed(1) + ') = <strong>' + uprob.toFixed(6) + '</strong> &nbsp;|&nbsp; Uniform[' + ua.toFixed(1) + ', ' + ub.toFixed(1) + ']';
      }
    }

    sel.addEventListener('change', function () { buildCtrls(); render(); });
    buildCtrls();
    setupResize(wrap, graph, render);
    allDemos.push(render);
  }

  // ============================================================
  //  DEMO: NUMBER SYSTEMS ON NUMBER LINE
  // ============================================================

  function initNumberLineVisual(container) {
    var ctrl = makeControls(container);
    ctrl.style.flexWrap = 'wrap';
    ctrl.innerHTML =
      '<label style="display:flex;align-items:center;gap:4px;"><input type="checkbox" class="demo-cb" data-show="int" checked> <span style="color:#3b82f6;">Integers</span></label>' +
      '<label style="display:flex;align-items:center;gap:4px;margin-left:6px;"><input type="checkbox" class="demo-cb" data-show="rat"> <span style="color:#22c55e;">Rationals</span></label>' +
      '<label style="display:flex;align-items:center;gap:4px;margin-left:6px;"><input type="checkbox" class="demo-cb" data-show="irr"> <span style="color:#ef4444;">Irrationals</span></label>' +
      '<label style="display:flex;align-items:center;gap:4px;margin-left:6px;"><input type="checkbox" class="demo-cb" data-show="special" checked> <span style="color:#f59e0b;">Special</span></label>' +
      '<label style="display:flex;align-items:center;gap:6px;margin-left:12px;">Zoom: ' +
      '<input type="range" class="demo-slider" min="0" max="100" step="1" value="0" style="width:100px;">' +
      '<span class="demo-value" style="min-width:3em;">1x</span></label>';

    var { wrap, canvas } = makeCanvasWrap(container, 250);
    var infoDiv = makeInfo(container);
    var graph = new GraphCanvas(canvas, { xMin: -5.5, xMax: 5.5, yMin: -1.5, yMax: 1.5 });
    var slider = ctrl.querySelector('.demo-slider');
    var valSpan = ctrl.querySelector('.demo-value');

    var specials = [
      { val: Math.sqrt(2), label: '\u221a2', approx: '1.414...' },
      { val: Math.PI, label: '\u03c0', approx: '3.141...' },
      { val: Math.E, label: 'e', approx: '2.718...' },
      { val: (1 + Math.sqrt(5)) / 2, label: '\u03c6', approx: '1.618...' },
      { val: -Math.sqrt(2), label: '\u2212\u221a2', approx: '-1.414...' },
      { val: -Math.PI, label: '\u2212\u03c0', approx: '-3.141...' },
    ];

    function render() {
      var t = parseInt(slider.value, 10) / 100;
      var center = lerp(0, 1.5, t);
      var halfW = lerp(5.5, 0.25, t);
      graph.setViewport(center - halfW, center + halfW, -1.5, 1.5);
      valSpan.textContent = (1 / (halfW / 5.5)).toFixed(0) + 'x';

      graph.clear();
      graph.drawGrid();
      var c = graph.colors();
      var ctx = graph.ctx;

      graph.drawLine(graph.xMin, 0, graph.xMax, 0, c.axes, 2);

      var stepX = graph.niceStep(graph.xMax - graph.xMin);
      ctx.fillStyle = c.text;
      ctx.font = '10px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      for (var x = Math.ceil(graph.xMin / stepX) * stepX; x <= graph.xMax; x += stepX) {
        var px = graph.sx(x);
        ctx.beginPath(); ctx.moveTo(px, graph.sy(0) - 4); ctx.lineTo(px, graph.sy(0) + 4); ctx.strokeStyle = c.axes; ctx.lineWidth = 1; ctx.stroke();
        if (Math.abs(x) > stepX * 0.01) ctx.fillText(+x.toPrecision(4), px, graph.sy(0) + 6);
      }

      var showInt = ctrl.querySelector('[data-show="int"]').checked;
      var showRat = ctrl.querySelector('[data-show="rat"]').checked;
      var showIrr = ctrl.querySelector('[data-show="irr"]').checked;
      var showSpec = ctrl.querySelector('[data-show="special"]').checked;

      if (showInt) {
        for (var ni = Math.ceil(graph.xMin); ni <= Math.floor(graph.xMax); ni++) {
          graph.drawPoint(ni, 0, '#3b82f6', 5);
          graph.drawText('' + ni, ni, 0.15, '#3b82f6', 'center', 'bottom', 'bold 11px system-ui');
        }
      }

      if (showRat) {
        var maxDenom = Math.max(8, Math.round(halfW < 1 ? 30 : 12));
        for (var d = 2; d <= maxDenom; d++) {
          for (var num = Math.ceil(graph.xMin * d); num <= Math.floor(graph.xMax * d); num++) {
            if (num % d === 0) continue;
            var rv = num / d;
            if (rv < graph.xMin || rv > graph.xMax) continue;
            graph.drawPoint(rv, 0, '#22c55e', 2);
          }
        }
      }

      if (showIrr) {
        var irrStep = halfW < 1 ? 0.01 : 0.05;
        for (var ix = Math.ceil(graph.xMin / irrStep) * irrStep; ix <= graph.xMax; ix += irrStep) {
          var isRat = false;
          for (var dd = 1; dd <= 20; dd++) {
            if (Math.abs(ix * dd - Math.round(ix * dd)) < 0.001) { isRat = true; break; }
          }
          if (!isRat) {
            var spx = graph.sx(ix), spy = graph.sy(0);
            ctx.fillStyle = 'rgba(239,68,68,0.3)';
            ctx.fillRect(spx - 0.5, spy - 3, 1, 6);
          }
        }
      }

      if (showSpec) {
        specials.forEach(function (sp) {
          if (sp.val < graph.xMin || sp.val > graph.xMax) return;
          graph.drawPoint(sp.val, 0, '#f59e0b', 6);
          graph.drawText(sp.label, sp.val, 0.2, '#f59e0b', 'center', 'bottom', 'bold 12px system-ui');
          graph.drawText(sp.approx, sp.val, -0.2, '#f59e0b', 'center', 'top', '10px system-ui');
        });
      }

      infoDiv.innerHTML =
        '<span style="color:#3b82f6">\u25cf Integers</span> &nbsp; ' +
        '<span style="color:#22c55e">\u25cf Rationals</span> &nbsp; ' +
        '<span style="color:#ef4444">\u25cf Irrationals</span> &nbsp; ' +
        '<span style="color:#f59e0b">\u25cf Special (\u221a2, \u03c0, e, \u03c6)</span>' +
        ' &nbsp;|&nbsp; Viewing [' + graph.xMin.toFixed(2) + ', ' + graph.xMax.toFixed(2) + ']';
    }

    ctrl.querySelectorAll('.demo-cb').forEach(function (cb) { cb.addEventListener('change', render); });
    slider.addEventListener('input', render);

    canvas.addEventListener('click', function (e) {
      var rect = canvas.getBoundingClientRect();
      var wx = graph.wx(e.clientX - rect.left);
      var cls = 'Real number: ' + wx.toFixed(6);
      if (Math.abs(wx - Math.round(wx)) < 0.01) cls += ' (Integer)';
      else {
        var isR = false;
        for (var d = 1; d <= 100; d++) {
          if (Math.abs(wx * d - Math.round(wx * d)) < 0.05) { cls += ' (\u2248 ' + Math.round(wx * d) + '/' + d + ', Rational)'; isR = true; break; }
        }
        if (!isR) cls += ' (likely Irrational)';
      }
      infoDiv.textContent = cls;
    });

    setupResize(wrap, graph, render);
    allDemos.push(render);
  }

  // ============================================================
  //  DEMO: PARENT FUNCTIONS GALLERY
  // ============================================================

  function initParentFunctions(container) {
    var funcs = [
      { name: 'y = x', fn: function (x) { return x; }, color: '#94a3b8', domain: '(\u2212\u221e, \u221e)', range: '(\u2212\u221e, \u221e)', props: 'Linear, odd, slope 1' },
      { name: 'y = x\u00b2', fn: function (x) { return x * x; }, color: '#3b82f6', domain: '(\u2212\u221e, \u221e)', range: '[0, \u221e)', props: 'Quadratic, even, vertex at origin' },
      { name: 'y = x\u00b3', fn: function (x) { return x * x * x; }, color: '#a855f7', domain: '(\u2212\u221e, \u221e)', range: '(\u2212\u221e, \u221e)', props: 'Cubic, odd, inflection at origin' },
      { name: 'y = \u221ax', fn: function (x) { return x >= 0 ? Math.sqrt(x) : NaN; }, color: '#22c55e', domain: '[0, \u221e)', range: '[0, \u221e)', props: 'Square root, inverse of x\u00b2 (x\u22650)' },
      { name: 'y = |x|', fn: function (x) { return Math.abs(x); }, color: '#f97316', domain: '(\u2212\u221e, \u221e)', range: '[0, \u221e)', props: 'Absolute value, even, V-shape' },
      { name: 'y = 1/x', fn: function (x) { return Math.abs(x) < 0.01 ? NaN : 1 / x; }, color: '#ef4444', domain: 'x \u2260 0', range: 'y \u2260 0', props: 'Reciprocal, odd, hyperbola' },
      { name: 'y = e\u02e3', fn: function (x) { return Math.exp(x); }, color: '#06b6d4', domain: '(\u2212\u221e, \u221e)', range: '(0, \u221e)', props: 'Exponential, always positive, growth' },
      { name: 'y = ln(x)', fn: function (x) { return x > 0 ? Math.log(x) : NaN; }, color: '#eab308', domain: '(0, \u221e)', range: '(\u2212\u221e, \u221e)', props: 'Logarithm, inverse of e\u02e3' },
    ];

    var ctrl = makeControls(container);
    ctrl.style.flexWrap = 'wrap';
    ctrl.innerHTML = funcs.map(function (f, i) {
      return '<label style="display:flex;align-items:center;gap:3px;margin-right:6px;font-size:0.88em;">' +
        '<input type="checkbox" class="demo-cb" data-fn="' + i + '" checked>' +
        '<span style="color:' + f.color + ';">' + f.name + '</span></label>';
    }).join('');

    var { wrap, canvas } = makeCanvasWrap(container, 400);
    var infoDiv = makeInfo(container);
    var graph = new GraphCanvas(canvas, { xMin: -6, xMax: 6, yMin: -4, yMax: 6 });
    var hoverIdx = -1;

    function render() {
      graph.base();
      var c = graph.colors();
      var ctx = graph.ctx;
      var checks = ctrl.querySelectorAll('.demo-cb');

      funcs.forEach(function (f, i) {
        if (!checks[i].checked) return;
        var lw = (hoverIdx === i) ? 4 : 2;
        graph.plotFn(f.fn, f.color, lw);
        if (hoverIdx === i) {
          var labelX = 3;
          var labelY = f.fn(labelX);
          if (!isFinite(labelY)) { labelX = 1; labelY = f.fn(labelX); }
          if (isFinite(labelY))
            graph.drawText(f.name, labelX, labelY + 0.3, f.color, 'center', 'bottom', 'bold 12px system-ui');
        }
      });

      if (hoverIdx >= 0 && hoverIdx < funcs.length) {
        var hf = funcs[hoverIdx];
        infoDiv.innerHTML = '<strong style="color:' + hf.color + ';">' + hf.name + '</strong> &nbsp;|&nbsp; ' +
          'Domain: ' + hf.domain + ' &nbsp;|&nbsp; Range: ' + hf.range + ' &nbsp;|&nbsp; ' + hf.props;
      } else {
        infoDiv.innerHTML = 'Hover over the graph to see function details. Toggle functions with checkboxes above.';
      }
    }

    canvas.addEventListener('mousemove', function (e) {
      var rect = canvas.getBoundingClientRect();
      var wx = graph.wx(e.clientX - rect.left), wy = graph.wy(e.clientY - rect.top);
      var checks = ctrl.querySelectorAll('.demo-cb');
      var best = -1, bestDist = Infinity;
      funcs.forEach(function (f, i) {
        if (!checks[i].checked) return;
        var fv = f.fn(wx);
        if (!isFinite(fv)) return;
        var dist = Math.abs(fv - wy);
        if (dist < bestDist) { bestDist = dist; best = i; }
      });
      var worldThreshold = (graph.yMax - graph.yMin) * 0.08;
      var newIdx = bestDist < worldThreshold ? best : -1;
      if (newIdx !== hoverIdx) { hoverIdx = newIdx; render(); }
    });
    canvas.addEventListener('mouseleave', function () { if (hoverIdx !== -1) { hoverIdx = -1; render(); } });

    ctrl.querySelectorAll('.demo-cb').forEach(function (cb) { cb.addEventListener('change', render); });

    setupResize(wrap, graph, render);
    allDemos.push(render);
  }

  // ============================================================
  //  DEMO: PARAMETRIC TRACER
  // ============================================================

  function initParametricTracer(container) {
    const presets = [
      { label: 'Circle', xFn: function(t){return Math.cos(t);}, yFn: function(t){return Math.sin(t);}, tMax: 2*Math.PI, vp: [-1.8,1.8,-1.8,1.8] },
      { label: 'Figure-8', xFn: function(t){return Math.sin(t);}, yFn: function(t){return Math.sin(2*t);}, tMax: 2*Math.PI, vp: [-1.8,1.8,-1.8,1.8] },
      { label: 'Lissajous', xFn: function(t){return Math.sin(3*t);}, yFn: function(t){return Math.sin(2*t);}, tMax: 2*Math.PI, vp: [-1.8,1.8,-1.8,1.8] },
      { label: 'Epicycloid', xFn: function(t){return 4*Math.cos(t)-Math.cos(4*t);}, yFn: function(t){return 4*Math.sin(t)-Math.sin(4*t);}, tMax: 2*Math.PI, vp: [-6,6,-6,6] },
      { label: 'Astroid', xFn: function(t){return Math.pow(Math.cos(t),3);}, yFn: function(t){return Math.pow(Math.sin(t),3);}, tMax: 2*Math.PI, vp: [-1.8,1.8,-1.8,1.8] },
    ];
    const ctrl = makeControls(container);
    ctrl.innerHTML =
      '<select class="demo-select param-sel" style="padding:4px;border-radius:4px;background:var(--input-bg,#252538);color:inherit;border:1px solid var(--border,#444);">' +
      presets.map(function(p,i){return '<option value="'+i+'">'+p.label+'</option>';}).join('') + '</select>' +
      '<button class="demo-btn param-play" style="margin-left:8px;">\u23F8</button>' +
      '<label style="flex:1;display:flex;align-items:center;gap:6px;margin-left:8px;">Speed ' +
      '<input type="range" class="demo-slider param-speed" min="0.1" max="3" step="0.1" value="1" style="flex:1;"></label>';
    var { wrap, canvas } = makeCanvasWrap(container, 400);
    var infoDiv = makeInfo(container);
    var graph = new GraphCanvas(canvas, { xMin: -1.8, xMax: 1.8, yMin: -1.8, yMax: 1.8 });
    var sel = ctrl.querySelector('.param-sel');
    var playBtn = ctrl.querySelector('.param-play');
    var speedSl = ctrl.querySelector('.param-speed');
    var playing = true, tCur = 0, trail = [], animId = null;
    function cur() { return presets[parseInt(sel.value)]; }
    function resetTrace() { tCur = 0; trail = []; }
    function render() {
      graph.base();
      var c = graph.colors(), ctx = graph.ctx, p = cur();
      ctx.strokeStyle = c.grid; ctx.lineWidth = 1; ctx.beginPath();
      for (var i = 0; i <= 500; i++) {
        var t = (i / 500) * p.tMax, px = graph.sx(p.xFn(t)), py = graph.sy(p.yFn(t));
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
      if (trail.length > 1) {
        ctx.strokeStyle = c.fn[0]; ctx.lineWidth = 2.5; ctx.beginPath();
        ctx.moveTo(graph.sx(trail[0][0]), graph.sy(trail[0][1]));
        for (var j = 1; j < trail.length; j++) ctx.lineTo(graph.sx(trail[j][0]), graph.sy(trail[j][1]));
        ctx.stroke();
      }
      if (trail.length > 0) { var last = trail[trail.length - 1]; graph.drawPoint(last[0], last[1], c.fn[1], 6); }
      var xv = p.xFn(tCur), yv = p.yFn(tCur);
      infoDiv.innerHTML = 't = ' + tCur.toFixed(3) + ' &nbsp;|&nbsp; x = ' + xv.toFixed(4) + ' &nbsp;|&nbsp; y = ' + yv.toFixed(4);
    }
    function animate() {
      if (!playing) return;
      var p = cur(), speed = parseFloat(speedSl.value);
      tCur += 0.02 * speed;
      if (tCur > p.tMax) { tCur = p.tMax; playing = false; playBtn.textContent = '\u25B6'; }
      trail.push([p.xFn(tCur), p.yFn(tCur)]);
      render();
      if (playing) animId = requestAnimationFrame(animate);
    }
    playBtn.addEventListener('click', function() {
      if (tCur >= cur().tMax) resetTrace();
      playing = !playing;
      playBtn.textContent = playing ? '\u23F8' : '\u25B6';
      if (playing) animate();
    });
    sel.addEventListener('change', function() {
      var vp = cur().vp;
      graph.setViewport(vp[0], vp[1], vp[2], vp[3]);
      resetTrace(); playing = true; playBtn.textContent = '\u23F8'; animate();
    });
    setupResize(wrap, graph, render);
    allDemos.push(render);
    animate();
  }

  // ============================================================
  //  DEMO: OPTIMIZATION VISUAL
  // ============================================================

  function initOptimizationVisual(container) {
    var ctrl = makeControls(container);
    ctrl.innerHTML =
      '<label style="flex:1;display:flex;align-items:center;gap:6px;">f(x) = ' +
      '<input type="text" class="demo-input opt-expr" value="x^3-6*x^2+9*x+1" style="flex:1;padding:4px 8px;border:1px solid var(--border,#444);border-radius:4px;background:var(--input-bg,#252538);color:inherit;font-family:monospace;"></label>' +
      '<label style="display:flex;align-items:center;gap:4px;margin-left:8px;">a ' +
      '<input type="range" class="demo-slider opt-a" min="-5" max="8" step="0.1" value="0" style="width:80px;">' +
      '<span class="opt-a-val" style="min-width:2.5em;">0</span></label>' +
      '<label style="display:flex;align-items:center;gap:4px;margin-left:4px;">b ' +
      '<input type="range" class="demo-slider opt-b" min="-5" max="8" step="0.1" value="5" style="width:80px;">' +
      '<span class="opt-b-val" style="min-width:2.5em;">5</span></label>';
    var { wrap, canvas } = makeCanvasWrap(container, 400);
    var infoDiv = makeInfo(container);
    var graph = new GraphCanvas(canvas, { xMin: -2, xMax: 7, yMin: -5, yMax: 12 });
    var exprIn = ctrl.querySelector('.opt-expr');
    var slA = ctrl.querySelector('.opt-a'), slB = ctrl.querySelector('.opt-b');
    var valA = ctrl.querySelector('.opt-a-val'), valB = ctrl.querySelector('.opt-b-val');
    var fn = MathParser.compile(exprIn.value);
    function findCritical(f, a, b) {
      var pts = [], steps = 1000, h = (b - a) / steps;
      for (var i = 1; i < steps; i++) {
        var x0 = a + (i - 1) * h, x1 = a + i * h;
        var d0 = numericalDerivative(f, x0), d1 = numericalDerivative(f, x1);
        if (d0 * d1 < 0) {
          var lo = x0, hi = x1;
          for (var k = 0; k < 30; k++) { var mid = (lo + hi) / 2; if (numericalDerivative(f, mid) * numericalDerivative(f, lo) > 0) lo = mid; else hi = mid; }
          pts.push((lo + hi) / 2);
        }
        if (Math.abs(d1) < 1e-9) pts.push(x1);
      }
      return pts;
    }
    function render() {
      graph.base();
      var c = graph.colors(), ctx = graph.ctx;
      if (!fn) { infoDiv.textContent = 'Invalid expression'; return; }
      var a = parseFloat(slA.value), b = parseFloat(slB.value);
      if (a > b) { var tmp = a; a = b; b = tmp; }
      valA.textContent = a.toFixed(1); valB.textContent = b.toFixed(1);
      graph.plotFn(fn, c.fn[0], 2);
      var sa = graph.sx(a), sb = graph.sx(b);
      ctx.fillStyle = c.fill; ctx.fillRect(sa, 0, sb - sa, graph.h);
      ctx.strokeStyle = c.fn[1]; ctx.lineWidth = 1; ctx.setLineDash([4,3]);
      ctx.beginPath(); ctx.moveTo(sa, 0); ctx.lineTo(sa, graph.h); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(sb, 0); ctx.lineTo(sb, graph.h); ctx.stroke();
      ctx.setLineDash([]);
      var crits = findCritical(fn, a, b);
      var candidates = [{ x: a, y: fn(a), label: 'a=' + a.toFixed(1) }, { x: b, y: fn(b), label: 'b=' + b.toFixed(1) }];
      crits.forEach(function(cx) { if (cx > a + 0.01 && cx < b - 0.01) candidates.push({ x: cx, y: fn(cx), label: "f'=0, x=" + cx.toFixed(2) }); });
      var absMax = candidates[0], absMin = candidates[0];
      candidates.forEach(function(pt) { if (pt.y > absMax.y) absMax = pt; if (pt.y < absMin.y) absMin = pt; });
      candidates.forEach(function(pt) { graph.drawPoint(pt.x, pt.y, c.fn[4], 5); });
      graph.drawPoint(absMax.x, absMax.y, '#ef4444', 8);
      graph.drawText('\u2605 Max ' + absMax.y.toFixed(2), absMax.x, absMax.y + 0.5, '#ef4444', 'center', 'bottom', 'bold 11px system-ui');
      graph.drawPoint(absMin.x, absMin.y, '#22c55e', 8);
      graph.drawText('\u2605 Min ' + absMin.y.toFixed(2), absMin.x, absMin.y - 0.5, '#22c55e', 'center', 'top', 'bold 11px system-ui');
      infoDiv.innerHTML = '<b>Candidates:</b> ' + candidates.map(function(pt) {
        return pt.label + ' \u2192 f=' + pt.y.toFixed(3);
      }).join(' &nbsp;|&nbsp; ');
    }
    exprIn.addEventListener('input', function() { fn = MathParser.compile(exprIn.value); render(); });
    slA.addEventListener('input', render);
    slB.addEventListener('input', render);
    setupResize(wrap, graph, render);
    allDemos.push(render);
  }

  // ============================================================
  //  DEMO: AREA BETWEEN CURVES
  // ============================================================

  function initAreaBetweenCurves(container) {
    var ctrl = makeControls(container);
    ctrl.innerHTML =
      '<label style="display:flex;align-items:center;gap:4px;">f(x)= ' +
      '<input type="text" class="demo-input abc-f" value="x^2" style="width:90px;padding:4px 8px;border:1px solid var(--border,#444);border-radius:4px;background:var(--input-bg,#252538);color:inherit;font-family:monospace;"></label>' +
      '<label style="display:flex;align-items:center;gap:4px;margin-left:8px;">g(x)= ' +
      '<input type="text" class="demo-input abc-g" value="x+2" style="width:90px;padding:4px 8px;border:1px solid var(--border,#444);border-radius:4px;background:var(--input-bg,#252538);color:inherit;font-family:monospace;"></label>' +
      '<label style="flex:1;display:flex;align-items:center;gap:4px;margin-left:8px;">Range ' +
      '<input type="range" class="demo-slider abc-range" min="2" max="20" step="0.5" value="8" style="flex:1;">' +
      '<span class="abc-rv" style="min-width:2.5em;">8</span></label>';
    var { wrap, canvas } = makeCanvasWrap(container, 400);
    var infoDiv = makeInfo(container);
    var graph = new GraphCanvas(canvas, { xMin: -4, xMax: 4, yMin: -2, yMax: 8 });
    var fIn = ctrl.querySelector('.abc-f'), gIn = ctrl.querySelector('.abc-g');
    var rangeSl = ctrl.querySelector('.abc-range'), rangeVal = ctrl.querySelector('.abc-rv');
    var fFn = MathParser.compile(fIn.value), gFn = MathParser.compile(gIn.value);
    function findIntersections(f, g, xMin, xMax) {
      var pts = [], steps = 2000, h = (xMax - xMin) / steps;
      for (var i = 0; i < steps; i++) {
        var x0 = xMin + i * h, x1 = x0 + h;
        var d0 = f(x0) - g(x0), d1 = f(x1) - g(x1);
        if (d0 * d1 < 0) {
          var lo = x0, hi = x1;
          for (var k = 0; k < 40; k++) { var mid = (lo + hi) / 2; if ((f(mid) - g(mid)) * (f(lo) - g(lo)) > 0) lo = mid; else hi = mid; }
          pts.push((lo + hi) / 2);
        }
      }
      return pts;
    }
    function numericalArea(f, g, a, b) {
      var n = 1000, h = (b - a) / n, sum = 0;
      for (var i = 0; i < n; i++) { var x = a + (i + 0.5) * h; sum += Math.abs(f(x) - g(x)); }
      return sum * h;
    }
    function render() {
      graph.base();
      if (!fFn || !gFn) { infoDiv.textContent = 'Invalid expression'; return; }
      var c = graph.colors(), ctx = graph.ctx;
      var r = parseFloat(rangeSl.value); rangeVal.textContent = r.toFixed(0);
      graph.setViewport(-r / 2, r / 2, -r / 2, r / 2);
      graph.clear(); graph.drawGrid(); graph.drawAxes();
      var samples = Math.max(graph.w * 2, 600);
      for (var i = 0; i < samples; i++) {
        var px0 = (i / samples) * graph.w, px1 = ((i + 1) / samples) * graph.w;
        var x = graph.wx(px0);
        var fv = fFn(x), gv = gFn(x);
        if (!isFinite(fv) || !isFinite(gv)) continue;
        var top = Math.max(fv, gv), bot = Math.min(fv, gv);
        ctx.fillStyle = fv >= gv ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)';
        var sy1 = graph.sy(top), sy2 = graph.sy(bot);
        ctx.fillRect(px0, sy1, Math.max(px1 - px0, 1), sy2 - sy1);
      }
      graph.plotFn(fFn, c.fn[0], 2);
      graph.plotFn(gFn, c.fn[1], 2);
      var inters = findIntersections(fFn, gFn, -r / 2, r / 2);
      var totalArea = 0;
      if (inters.length >= 2) {
        for (var k = 0; k < inters.length - 1; k++) totalArea += numericalArea(fFn, gFn, inters[k], inters[k + 1]);
      } else if (inters.length === 0) {
        totalArea = numericalArea(fFn, gFn, -r / 2, r / 2);
      }
      inters.forEach(function(ix) {
        graph.drawPoint(ix, fFn(ix), '#f59e0b', 6);
        graph.drawText('(' + ix.toFixed(2) + ',' + fFn(ix).toFixed(2) + ')', ix, fFn(ix) + 0.3, '#f59e0b', 'center', 'bottom', '10px system-ui');
      });
      infoDiv.innerHTML = '<span style="color:' + c.fn[0] + '">f(x)</span> vs <span style="color:' + c.fn[1] + '">g(x)</span>' +
        ' &nbsp;|&nbsp; Intersections: ' + inters.length +
        ' &nbsp;|&nbsp; Area \u2248 ' + totalArea.toFixed(4);
    }
    fIn.addEventListener('input', function() { fFn = MathParser.compile(fIn.value); render(); });
    gIn.addEventListener('input', function() { gFn = MathParser.compile(gIn.value); render(); });
    rangeSl.addEventListener('input', render);
    setupResize(wrap, graph, render);
    allDemos.push(render);
  }

  // ============================================================
  //  DEMO: SEQUENCE VISUAL
  // ============================================================

  function initSequenceVisual(container) {
    var seqs = [
      { label: '1/n', fn: function(n){return 1/n;}, limit: 0 },
      { label: '(-1)^n / n', fn: function(n){return Math.pow(-1,n)/n;}, limit: 0 },
      { label: 'n/(n+1)', fn: function(n){return n/(n+1);}, limit: 1 },
      { label: 'sin(n)/n', fn: function(n){return Math.sin(n)/n;}, limit: 0 },
      { label: '(1+1/n)^n', fn: function(n){return Math.pow(1+1/n,n);}, limit: Math.E },
      { label: '2^n/n!', fn: function(n){ var v=1; for(var i=1;i<=n;i++) v*=2/i; return v; }, limit: 0 },
      { label: 'Fib ratio', fn: function(n){ var a=1,b=1; for(var i=2;i<n;i++){var t=a+b;a=b;b=t;} return n<2?1:b/a; }, limit: (1+Math.sqrt(5))/2 },
    ];
    var ctrl = makeControls(container);
    ctrl.innerHTML =
      '<select class="demo-select seq-sel" style="padding:4px;border-radius:4px;background:var(--input-bg,#252538);color:inherit;border:1px solid var(--border,#444);">' +
      seqs.map(function(s,i){return '<option value="'+i+'">'+s.label+'</option>';}).join('') + '</select>' +
      '<label style="flex:1;display:flex;align-items:center;gap:6px;margin-left:8px;">Terms ' +
      '<input type="range" class="demo-slider seq-n" min="5" max="200" step="1" value="30" style="flex:1;">' +
      '<span class="seq-nv" style="min-width:3em;">30</span></label>';
    var { wrap, canvas } = makeCanvasWrap(container, 380);
    var infoDiv = makeInfo(container);
    var graph = new GraphCanvas(canvas, { xMin: 0, xMax: 35, yMin: -1, yMax: 3 });
    var sel = ctrl.querySelector('.seq-sel'), slN = ctrl.querySelector('.seq-n'), nVal = ctrl.querySelector('.seq-nv');
    function render() {
      var s = seqs[parseInt(sel.value)], N = parseInt(slN.value);
      nVal.textContent = N;
      var vals = [];
      for (var i = 1; i <= N; i++) vals.push(s.fn(i));
      var yMin = Infinity, yMax = -Infinity;
      vals.forEach(function(v) { if (isFinite(v)) { if (v < yMin) yMin = v; if (v > yMax) yMax = v; } });
      var pad = Math.max((yMax - yMin) * 0.15, 0.5);
      graph.setViewport(0, N + 2, yMin - pad, yMax + pad);
      graph.base();
      var c = graph.colors(), ctx = graph.ctx;
      if (s.limit !== null && isFinite(s.limit)) {
        ctx.setLineDash([6, 4]); ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(graph.sx(0), graph.sy(s.limit)); ctx.lineTo(graph.sx(N + 2), graph.sy(s.limit)); ctx.stroke();
        ctx.setLineDash([]);
        graph.drawText('L = ' + s.limit.toFixed(4), N * 0.85, s.limit + pad * 0.2, '#f59e0b', 'right', 'bottom', '11px system-ui');
      }
      vals.forEach(function(v, i) {
        if (isFinite(v)) graph.drawPoint(i + 1, v, c.fn[0], 3);
      });
      var last = vals[vals.length - 1];
      var limStr = (s.limit !== null) ? 'Limit = ' + s.limit.toFixed(5) : 'Diverges';
      infoDiv.innerHTML = 'a_{' + N + '} = ' + (isFinite(last) ? last.toFixed(6) : 'undef') + ' &nbsp;|&nbsp; ' + limStr;
    }
    sel.addEventListener('change', render);
    slN.addEventListener('input', render);
    setupResize(wrap, graph, render);
    allDemos.push(render);
  }

  // ============================================================
  //  DEMO: CENTRAL LIMIT THEOREM
  // ============================================================

  function initCltDemo(container) {
    var dists = [
      { label: 'Uniform [0,1]', sample: function(){return Math.random();}, mu: 0.5, sigma: 1/Math.sqrt(12) },
      { label: 'Exponential (\u03bb=1)', sample: function(){return -Math.log(1-Math.random());}, mu: 1, sigma: 1 },
      { label: 'Bimodal', sample: function(){return Math.random()<0.5 ? 0.3+0.1*gaussRand() : 0.7+0.1*gaussRand();}, mu: 0.5, sigma: Math.sqrt(0.04+0.01) },
      { label: 'Dice roll', sample: function(){return Math.floor(Math.random()*6)+1;}, mu: 3.5, sigma: Math.sqrt(35/12) },
    ];
    function gaussRand() { var u=0,v=0; while(u===0)u=Math.random(); while(v===0)v=Math.random(); return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v); }
    var ctrl = makeControls(container);
    ctrl.innerHTML =
      '<select class="demo-select clt-dist" style="padding:4px;border-radius:4px;background:var(--input-bg,#252538);color:inherit;border:1px solid var(--border,#444);">' +
      dists.map(function(d,i){return '<option value="'+i+'">'+d.label+'</option>';}).join('') + '</select>' +
      '<label style="display:flex;align-items:center;gap:4px;margin-left:8px;">n= ' +
      '<input type="range" class="demo-slider clt-n" min="1" max="100" step="1" value="10" style="width:100px;">' +
      '<span class="clt-nv" style="min-width:2.5em;">10</span></label>' +
      '<button class="demo-btn clt-one" style="margin-left:8px;">Sample!</button>' +
      '<button class="demo-btn clt-100" style="margin-left:4px;">Run 100</button>' +
      '<button class="demo-btn clt-reset" style="margin-left:4px;">\u21BA Reset</button>';
    var { wrap, canvas } = makeCanvasWrap(container, 380);
    var infoDiv = makeInfo(container);
    var distSel = ctrl.querySelector('.clt-dist'), slN = ctrl.querySelector('.clt-n'), nVal = ctrl.querySelector('.clt-nv');
    var means = [], bins = 40;
    function curDist() { return dists[parseInt(distSel.value)]; }
    function takeSample() {
      var d = curDist(), n = parseInt(slN.value), sum = 0;
      for (var i = 0; i < n; i++) sum += d.sample();
      means.push(sum / n);
    }
    function render() {
      var cvs = canvas, ctx = cvs.getContext('2d');
      var dpr = window.devicePixelRatio || 1;
      var w = cvs.width / dpr, h = cvs.height / dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var lt = document.body.classList.contains('light-mode');
      ctx.fillStyle = lt ? '#ffffff' : '#1a1a2e'; ctx.fillRect(0, 0, w, h);
      nVal.textContent = slN.value;
      var d = curDist(), n = parseInt(slN.value);
      if (means.length === 0) { infoDiv.textContent = 'Click "Sample!" to begin'; return; }
      var lo = Infinity, hi = -Infinity;
      means.forEach(function(m) { if (m < lo) lo = m; if (m > hi) hi = m; });
      var pad = Math.max((hi - lo) * 0.1, 0.1);
      lo -= pad; hi += pad;
      var binW = (hi - lo) / bins, counts = new Array(bins).fill(0);
      means.forEach(function(m) { var b = Math.min(Math.floor((m - lo) / binW), bins - 1); if (b >= 0) counts[b]++; });
      var maxCount = Math.max.apply(null, counts);
      var marginB = 30, marginT = 10, marginL = 10, marginR = 10;
      var plotW = w - marginL - marginR, plotH = h - marginB - marginT;
      var barW = plotW / bins;
      var fnCol = lt ? '#0969da' : '#58a6ff';
      ctx.fillStyle = lt ? 'rgba(9,105,218,0.35)' : 'rgba(88,166,255,0.35)';
      for (var i = 0; i < bins; i++) {
        var bh = maxCount > 0 ? (counts[i] / maxCount) * plotH : 0;
        ctx.fillRect(marginL + i * barW, marginT + plotH - bh, barW - 1, bh);
      }
      var theoMu = d.mu, theoSig = d.sigma / Math.sqrt(n);
      if (theoSig > 0.001) {
        ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2; ctx.beginPath();
        var peak = 1 / (theoSig * Math.sqrt(2 * Math.PI));
        for (var px = 0; px <= plotW; px++) {
          var xv = lo + (px / plotW) * (hi - lo);
          var nv = Math.exp(-0.5 * Math.pow((xv - theoMu) / theoSig, 2)) / (theoSig * Math.sqrt(2 * Math.PI));
          var ny = marginT + plotH - (nv / peak) * plotH * (maxCount > 0 ? 1 : 0);
          if (px === 0) ctx.moveTo(marginL + px, ny); else ctx.lineTo(marginL + px, ny);
        }
        ctx.stroke();
      }
      ctx.fillStyle = lt ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)';
      ctx.font = '10px system-ui'; ctx.textAlign = 'center';
      for (var ti = 0; ti <= 4; ti++) {
        var xv2 = lo + (ti / 4) * (hi - lo);
        ctx.fillText(xv2.toFixed(2), marginL + (ti / 4) * plotW, h - 5);
      }
      var mOfM = means.reduce(function(a, b){return a + b;}, 0) / means.length;
      var sOfM = Math.sqrt(means.reduce(function(a, b){return a + (b - mOfM) * (b - mOfM);}, 0) / means.length);
      infoDiv.innerHTML = 'Samples: ' + means.length +
        ' &nbsp;|&nbsp; Mean of means: ' + mOfM.toFixed(4) +
        ' &nbsp;|&nbsp; Std of means: ' + sOfM.toFixed(4) +
        ' &nbsp;|&nbsp; \u03C3/\u221An = ' + (d.sigma / Math.sqrt(n)).toFixed(4);
    }
    ctrl.querySelector('.clt-one').addEventListener('click', function() { takeSample(); render(); });
    ctrl.querySelector('.clt-100').addEventListener('click', function() { for (var i = 0; i < 100; i++) takeSample(); render(); });
    ctrl.querySelector('.clt-reset').addEventListener('click', function() { means = []; render(); });
    distSel.addEventListener('change', function() { means = []; render(); });
    slN.addEventListener('input', function() { means = []; render(); });
    function cltResize() {
      var rect = wrap.getBoundingClientRect(); if (rect.width < 10) return;
      var dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr; canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + 'px'; canvas.style.height = rect.height + 'px';
      render();
    }
    new ResizeObserver(debounce(cltResize, 80)).observe(wrap);
    cltResize();
    allDemos.push(render);
  }

  // ============================================================
  //  DEMO: GROUP TABLE (CAYLEY TABLE)
  // ============================================================

  function initGroupTable(container) {
    var groups = [
      { label: '\u2124/2\u2124', elems: ['0','1'], op: function(a,b,e){return e[(parseInt(a)+parseInt(b))%2];}, abelian: true, order: 2, gens: ['1'] },
      { label: '\u2124/3\u2124', elems: ['0','1','2'], op: function(a,b,e){return e[(parseInt(a)+parseInt(b))%3];}, abelian: true, order: 3, gens: ['1'] },
      { label: '\u2124/4\u2124', elems: ['0','1','2','3'], op: function(a,b,e){return e[(parseInt(a)+parseInt(b))%4];}, abelian: true, order: 4, gens: ['1','3'] },
      { label: 'Klein V\u2084', elems: ['e','a','b','c'], op: function(a,b) {
        var t = {ee:'e',ea:'a',eb:'b',ec:'c',ae:'a',aa:'e',ab:'c',ac:'b',be:'b',ba:'c',bb:'e',bc:'a',ce:'c',ca:'b',cb:'a',cc:'e'};
        return t[a+b];
      }, abelian: true, order: 4, gens: ['a','b'] },
      { label: 'S\u2083', elems: ['e','r','r\u00b2','s','sr','sr\u00b2'], op: function(a,b) {
        var idx = {'e':0,'r':1,'r\u00b2':2,'s':3,'sr':4,'sr\u00b2':5};
        var tbl = [
          [0,1,2,3,4,5],[1,2,0,4,5,3],[2,0,1,5,3,4],
          [3,5,4,0,2,1],[4,3,5,1,0,2],[5,4,3,2,1,0]
        ];
        var elems = ['e','r','r\u00b2','s','sr','sr\u00b2'];
        return elems[tbl[idx[a]][idx[b]]];
      }, abelian: false, order: 6, gens: ['r','s'] },
    ];
    var ctrl = makeControls(container);
    ctrl.innerHTML =
      '<select class="demo-select grp-sel" style="padding:4px;border-radius:4px;background:var(--input-bg,#252538);color:inherit;border:1px solid var(--border,#444);">' +
      groups.map(function(g,i){return '<option value="'+i+'">'+g.label+'</option>';}).join('') + '</select>' +
      '<span class="grp-hint" style="margin-left:8px;font-size:0.88em;opacity:0.7;">Hover to highlight inverses. Click header to highlight element pattern.</span>';
    var { wrap, canvas } = makeCanvasWrap(container, 380);
    var infoDiv = makeInfo(container);
    var sel = ctrl.querySelector('.grp-sel');
    var hoverR = -1, hoverC = -1, selHeader = -1;
    var palette = ['#58a6ff','#ff6b6b','#4ecdc4','#ffd93d','#c084fc','#ff9f43'];
    function curGroup() { return groups[parseInt(sel.value)]; }
    function render() {
      var g = curGroup(), n = g.elems.length;
      var cvs = canvas, ctx = cvs.getContext('2d');
      var dpr = window.devicePixelRatio || 1;
      var w = cvs.width / dpr, h = cvs.height / dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var lt = document.body.classList.contains('light-mode');
      ctx.fillStyle = lt ? '#ffffff' : '#1a1a2e'; ctx.fillRect(0, 0, w, h);
      var cellSize = Math.min((w - 20) / (n + 1), (h - 20) / (n + 1), 60);
      var ox = (w - cellSize * (n + 1)) / 2, oy = (h - cellSize * (n + 1)) / 2;
      ctx.font = Math.min(cellSize * 0.4, 14) + 'px system-ui';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      var colorMap = {};
      g.elems.forEach(function(e, i) { colorMap[e] = palette[i % palette.length]; });
      ctx.fillStyle = lt ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)';
      ctx.fillRect(ox, oy, cellSize, cellSize * (n + 1));
      ctx.fillRect(ox, oy, cellSize * (n + 1), cellSize);
      ctx.fillStyle = lt ? '#333' : '#e0e0e0';
      ctx.font = 'bold ' + Math.min(cellSize * 0.4, 14) + 'px system-ui';
      ctx.fillText('\u2022', ox + cellSize / 2, oy + cellSize / 2);
      for (var i = 0; i < n; i++) {
        var hdrX = ox + (i + 1) * cellSize + cellSize / 2, hdrY = oy + cellSize / 2;
        ctx.fillStyle = colorMap[g.elems[i]]; ctx.fillText(g.elems[i], hdrX, hdrY);
        ctx.fillStyle = colorMap[g.elems[i]]; ctx.fillText(g.elems[i], ox + cellSize / 2, oy + (i + 1) * cellSize + cellSize / 2);
      }
      ctx.font = Math.min(cellSize * 0.38, 13) + 'px system-ui';
      for (var r = 0; r < n; r++) {
        for (var ci = 0; ci < n; ci++) {
          var res = g.op(g.elems[r], g.elems[ci], g.elems);
          var cx = ox + (ci + 1) * cellSize, cy = oy + (r + 1) * cellSize;
          var highlight = (r === hoverR || ci === hoverC || r === selHeader || ci === selHeader);
          if (highlight) {
            ctx.fillStyle = lt ? 'rgba(9,105,218,0.12)' : 'rgba(88,166,255,0.12)';
            ctx.fillRect(cx, cy, cellSize, cellSize);
          }
          if (res === g.elems[0]) {
            ctx.fillStyle = lt ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.15)';
            ctx.fillRect(cx, cy, cellSize, cellSize);
          }
          ctx.fillStyle = colorMap[res] || (lt ? '#333' : '#e0e0e0');
          ctx.fillText(res, cx + cellSize / 2, cy + cellSize / 2);
        }
      }
      ctx.strokeStyle = lt ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)'; ctx.lineWidth = 0.5;
      for (var gi = 0; gi <= n + 1; gi++) {
        ctx.beginPath(); ctx.moveTo(ox + gi * cellSize, oy); ctx.lineTo(ox + gi * cellSize, oy + (n + 1) * cellSize); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(ox, oy + gi * cellSize); ctx.lineTo(ox + (n + 1) * cellSize, oy + gi * cellSize); ctx.stroke();
      }
      infoDiv.innerHTML = '<b>' + g.label + '</b> &nbsp;|&nbsp; Order: ' + g.order +
        ' &nbsp;|&nbsp; ' + (g.abelian ? 'Abelian' : 'Non-abelian') +
        ' &nbsp;|&nbsp; Generator(s): {' + g.gens.join(', ') + '}';
    }
    canvas.addEventListener('mousemove', function(e) {
      var g = curGroup(), n = g.elems.length;
      var dpr = window.devicePixelRatio || 1;
      var w = canvas.width / dpr, h = canvas.height / dpr;
      var cellSize = Math.min((w - 20) / (n + 1), (h - 20) / (n + 1), 60);
      var ox = (w - cellSize * (n + 1)) / 2, oy = (h - cellSize * (n + 1)) / 2;
      var rect = canvas.getBoundingClientRect();
      var mx = e.clientX - rect.left - ox, my = e.clientY - rect.top - oy;
      var col = Math.floor(mx / cellSize) - 1, row = Math.floor(my / cellSize) - 1;
      var newR = (row >= 0 && row < n) ? row : -1;
      var newC = (col >= 0 && col < n) ? col : -1;
      if (newR !== hoverR || newC !== hoverC) { hoverR = newR; hoverC = newC; render(); }
    });
    canvas.addEventListener('click', function(e) {
      var g = curGroup(), n = g.elems.length;
      var dpr = window.devicePixelRatio || 1;
      var w = canvas.width / dpr, h = canvas.height / dpr;
      var cellSize = Math.min((w - 20) / (n + 1), (h - 20) / (n + 1), 60);
      var ox = (w - cellSize * (n + 1)) / 2, oy = (h - cellSize * (n + 1)) / 2;
      var rect = canvas.getBoundingClientRect();
      var mx = e.clientX - rect.left - ox, my = e.clientY - rect.top - oy;
      var col = Math.floor(mx / cellSize) - 1, row = Math.floor(my / cellSize) - 1;
      if (row === -1 && col >= 0 && col < n) selHeader = selHeader === col ? -1 : col;
      else if (col === -1 && row >= 0 && row < n) selHeader = selHeader === row ? -1 : row;
      render();
    });
    canvas.addEventListener('mouseleave', function() { hoverR = -1; hoverC = -1; render(); });
    sel.addEventListener('change', function() { selHeader = -1; render(); });
    function grpResize() {
      var rect = wrap.getBoundingClientRect(); if (rect.width < 10) return;
      var dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr; canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + 'px'; canvas.style.height = rect.height + 'px';
      render();
    }
    new ResizeObserver(debounce(grpResize, 80)).observe(wrap);
    grpResize();
    allDemos.push(render);
  }

  // ============================================================
  //  DEMO: TRANSFORM COMPOSE
  // ============================================================

  function initTransformCompose(container) {
    var bases = [
      { label: 'x\u00b2', fn: function(x){return x*x;} },
      { label: 'sin(x)', fn: function(x){return Math.sin(x);} },
      { label: '|x|', fn: function(x){return Math.abs(x);} },
      { label: '\u221ax', fn: function(x){return x>=0?Math.sqrt(x):NaN;} },
    ];
    var ctrl = makeControls(container);
    ctrl.style.flexWrap = 'wrap';
    ctrl.innerHTML =
      '<select class="demo-select tc-base" style="padding:4px;border-radius:4px;background:var(--input-bg,#252538);color:inherit;border:1px solid var(--border,#444);">' +
      bases.map(function(b,i){return '<option value="'+i+'">'+b.label+'</option>';}).join('') + '</select>' +
      '<label style="display:flex;align-items:center;gap:3px;margin-left:6px;font-size:0.88em;">a<input type="range" class="demo-slider tc-a" min="-5" max="5" step="0.1" value="0" style="width:60px;"><span class="tc-av">0</span></label>' +
      '<label style="display:flex;align-items:center;gap:3px;margin-left:4px;font-size:0.88em;">h<input type="range" class="demo-slider tc-h" min="-5" max="5" step="0.1" value="0" style="width:60px;"><span class="tc-hv">0</span></label>' +
      '<label style="display:flex;align-items:center;gap:3px;margin-left:4px;font-size:0.88em;">c<input type="range" class="demo-slider tc-c" min="0.25" max="4" step="0.05" value="1" style="width:60px;"><span class="tc-cv">1</span></label>' +
      '<label style="display:flex;align-items:center;gap:3px;margin-left:4px;font-size:0.88em;">b<input type="range" class="demo-slider tc-b" min="0.25" max="4" step="0.05" value="1" style="width:60px;"><span class="tc-bv">1</span></label>' +
      '<label style="display:flex;align-items:center;gap:3px;margin-left:6px;font-size:0.88em;"><input type="checkbox" class="tc-rx"> Reflect x</label>' +
      '<label style="display:flex;align-items:center;gap:3px;margin-left:4px;font-size:0.88em;"><input type="checkbox" class="tc-ry"> Reflect y</label>';
    var { wrap, canvas } = makeCanvasWrap(container, 400);
    var infoDiv = makeInfo(container);
    var graph = new GraphCanvas(canvas, { xMin: -8, xMax: 8, yMin: -5, yMax: 8 });
    var baseSel = ctrl.querySelector('.tc-base');
    var slA = ctrl.querySelector('.tc-a'), slH = ctrl.querySelector('.tc-h');
    var slC = ctrl.querySelector('.tc-c'), slB = ctrl.querySelector('.tc-b');
    var cbRx = ctrl.querySelector('.tc-rx'), cbRy = ctrl.querySelector('.tc-ry');
    var avS = ctrl.querySelector('.tc-av'), hvS = ctrl.querySelector('.tc-hv');
    var cvS = ctrl.querySelector('.tc-cv'), bvS = ctrl.querySelector('.tc-bv');
    function render() {
      graph.base();
      var c = graph.colors(), ctx = graph.ctx;
      var base = bases[parseInt(baseSel.value)];
      var a = parseFloat(slA.value), h = parseFloat(slH.value);
      var vc = parseFloat(slC.value), hb = parseFloat(slB.value);
      var rx = cbRx.checked, ry = cbRy.checked;
      avS.textContent = a.toFixed(1); hvS.textContent = h.toFixed(1);
      cvS.textContent = vc.toFixed(2); bvS.textContent = hb.toFixed(2);
      ctx.setLineDash([6, 4]);
      graph.plotFn(base.fn, c.grid, 1.5);
      ctx.setLineDash([]);
      var transformed = function(x) {
        var inner = hb * (ry ? -x : x) - h;
        var val = base.fn(inner);
        if (!isFinite(val)) return NaN;
        return (rx ? -1 : 1) * vc * val + a;
      };
      graph.plotFn(transformed, c.fn[0], 2.5);
      var cStr = vc === 1 ? '' : vc.toFixed(2) + '\u00b7';
      var sign = rx ? '-' : '';
      var bStr = hb === 1 ? '' : hb.toFixed(2);
      var innerStr = (ry ? '-' : '') + (hb !== 1 ? bStr : '') + 'x';
      if (h !== 0) innerStr += (h > 0 ? '-' : '+') + Math.abs(h).toFixed(1);
      var aStr = a !== 0 ? (a > 0 ? ' + ' : ' - ') + Math.abs(a).toFixed(1) : '';
      infoDiv.innerHTML = '<b>y = ' + sign + cStr + 'f(' + innerStr + ')' + aStr + '</b>' +
        ' &nbsp; <span style="opacity:0.6;">(dashed = original)</span>';
    }
    [baseSel, slA, slH, slC, slB].forEach(function(el) { el.addEventListener('input', render); });
    [cbRx, cbRy].forEach(function(el) { el.addEventListener('change', render); });
    setupResize(wrap, graph, render);
    allDemos.push(render);
  }

  // ============================================================
  //  DEMO: RELATED RATES VISUAL
  // ============================================================

  function initRelatedRatesVisual(container) {
    var ctrl = makeControls(container);
    ctrl.innerHTML =
      '<button class="demo-btn rr-play">\u25B6</button>' +
      '<label style="flex:1;display:flex;align-items:center;gap:6px;margin-left:8px;">x (base distance) ' +
      '<input type="range" class="demo-slider rr-x" min="0.5" max="9.5" step="0.05" value="3" style="flex:1;">' +
      '<span class="rr-xv" style="min-width:3em;">3.00</span></label>';
    var { wrap, canvas } = makeCanvasWrap(container, 400);
    var infoDiv = makeInfo(container);
    var graph = new GraphCanvas(canvas, { xMin: -1, xMax: 12, yMin: -1, yMax: 12 });
    var playBtn = ctrl.querySelector('.rr-play'), slX = ctrl.querySelector('.rr-x'), xvSpan = ctrl.querySelector('.rr-xv');
    var L = 10, dxdt = 2, playing = false, animId = null;
    function render() {
      graph.base();
      var c = graph.colors(), ctx = graph.ctx;
      var x = parseFloat(slX.value);
      var y = Math.sqrt(L * L - x * x);
      xvSpan.textContent = x.toFixed(2);
      ctx.strokeStyle = lt() ? '#888' : '#555'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(graph.sx(0), graph.sy(0)); ctx.lineTo(graph.sx(0), graph.sy(11)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(graph.sx(0), graph.sy(0)); ctx.lineTo(graph.sx(11), graph.sy(0)); ctx.stroke();
      ctx.strokeStyle = c.fn[0]; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(graph.sx(x), graph.sy(0)); ctx.lineTo(graph.sx(0), graph.sy(y)); ctx.stroke();
      graph.drawPoint(x, 0, c.fn[1], 7);
      graph.drawPoint(0, y, c.fn[2], 7);
      graph.drawText('x=' + x.toFixed(2), x, -0.5, c.fn[1], 'center', 'top', 'bold 12px system-ui');
      graph.drawText('y=' + y.toFixed(2), -0.5, y, c.fn[2], 'right', 'middle', 'bold 12px system-ui');
      ctx.setLineDash([4, 3]); ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(graph.sx(x), graph.sy(0)); ctx.lineTo(graph.sx(x), graph.sy(y)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(graph.sx(0), graph.sy(y)); ctx.lineTo(graph.sx(x), graph.sy(y)); ctx.stroke();
      ctx.setLineDash([]);
      graph.drawText('L=' + L, x / 2 + 0.3, y / 2 + 0.3, c.fn[0], 'left', 'bottom', 'bold 13px system-ui');
      var dydt = -(x * dxdt) / y;
      infoDiv.innerHTML = 'x = ' + x.toFixed(3) + ' &nbsp;|&nbsp; y = ' + y.toFixed(3) +
        ' &nbsp;|&nbsp; dx/dt = ' + dxdt +
        ' &nbsp;|&nbsp; <b>dy/dt = ' + dydt.toFixed(4) + '</b>' +
        ' &nbsp;|&nbsp; x\u00b2+y\u00b2 = ' + (x * x + y * y).toFixed(1);
    }
    function lt() { return document.body.classList.contains('light-mode'); }
    function animateRR() {
      if (!playing) return;
      var x = parseFloat(slX.value) + 0.03;
      if (x > 9.5) { x = 9.5; playing = false; playBtn.textContent = '\u25B6'; }
      slX.value = x;
      render();
      if (playing) animId = requestAnimationFrame(animateRR);
    }
    playBtn.addEventListener('click', function() {
      if (parseFloat(slX.value) >= 9.4) slX.value = 0.5;
      playing = !playing;
      playBtn.textContent = playing ? '\u23F8' : '\u25B6';
      if (playing) animateRR();
    });
    slX.addEventListener('input', function() { playing = false; playBtn.textContent = '\u25B6'; render(); });
    setupResize(wrap, graph, render);
    allDemos.push(render);
  }

  // ============================================================
  //  DEMO REGISTRY
  // ============================================================

  const DEMO_REGISTRY = {
    'function-grapher': initFunctionGrapher,
    'derivative-visualizer': initDerivativeVisualizer,
    'integral-visualizer': initIntegralVisualizer,
    'taylor-series': initTaylorSeries,
    'vector-field': initVectorField,
    'matrix-transform': initMatrixTransform,
    'limit-explorer': initLimitExplorer,
    'series-convergence': initSeriesConvergence,
    'unit-circle': initUnitCircle,
    'epsilon-delta': initEpsilonDelta,
    'secant-to-tangent': initSecantToTangent,
    'curve-sketching': initCurveSketching,
    'ftc-visual': initFtcVisual,
    'polar-grapher': initPolarGrapher,
    'slope-field': initSlopeField,
    'probability-dist': initProbabilityDist,
    'number-line-visual': initNumberLineVisual,
    'parent-functions': initParentFunctions,
    'parametric-tracer': initParametricTracer,
    'optimization-visual': initOptimizationVisual,
    'area-between-curves': initAreaBetweenCurves,
    'sequence-visual': initSequenceVisual,
    'clt-demo': initCltDemo,
    'group-table': initGroupTable,
    'transform-compose': initTransformCompose,
    'related-rates-visual': initRelatedRatesVisual,
  };

  // ============================================================
  //  NAVIGATION SYSTEM
  // ============================================================

  const Navigation = {
    chapters: [],
    currentIndex: 0,
    navItems: [],

    init() {
      this.chapters = Array.from(document.querySelectorAll('.chapter'));
      this.buildSidebar();
      this.addChapterNavButtons();
      this.setupHashRouting();
      this.setupMobileMenu();
      this.setupScrollToTop();
      this.setupScrollSpy();
    },

    buildSidebar() {
      const sidebar = document.querySelector('.sidebar');
      if (!sidebar) return;
      let nav = sidebar.querySelector('.sidebar-nav');
      if (!nav) { nav = document.createElement('nav'); nav.className = 'sidebar-nav'; sidebar.appendChild(nav); }
      if (!this.chapters.length) return;
      const ul = document.createElement('ul');
      ul.className = 'nav-list';

      this.chapters.forEach((chapter, ci) => {
        const titleEl = chapter.querySelector('.chapter-title') || chapter.querySelector('h2');
        if (!titleEl) return;
        if (!chapter.id) chapter.id = 'chapter-' + (ci + 1);
        const li = document.createElement('li');
        li.className = 'nav-chapter';
        li.dataset.chapterIndex = ci;

        const link = document.createElement('a');
        link.href = '#' + chapter.id;
        link.className = 'nav-chapter-link';
        link.textContent = titleEl.textContent;
        link.dataset.ci = ci;
        li.appendChild(link);

        const lessons = chapter.querySelectorAll('.lesson');
        if (lessons.length) {
          const subUl = document.createElement('ul');
          subUl.className = 'nav-lessons';
          lessons.forEach((lesson, li2) => {
            const lTitle = lesson.querySelector('.lesson-header h3') || lesson.querySelector('h3') || lesson.querySelector('.lesson-title');
            if (!lTitle) return;
            if (!lesson.id) lesson.id = 'lesson-' + (ci + 1) + '-' + (li2 + 1);
            const subLi = document.createElement('li');
            const subLink = document.createElement('a');
            subLink.href = '#' + lesson.id;
            subLink.className = 'nav-lesson-link';
            subLink.addEventListener('click', (e) => {
              e.preventDefault();
              this.goToChapter(ci);
              setTimeout(() => {
                const el = document.getElementById(lesson.id);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 50);
              const sb = document.querySelector('.sidebar');
              const ov = document.querySelector('.overlay');
              if (sb) sb.classList.remove('open');
              if (ov) ov.classList.remove('active');
              if (this._syncMobileBtn) this._syncMobileBtn();
            });
            subLink.textContent = lTitle.textContent;
            subLi.appendChild(subLink);
            subUl.appendChild(subLi);
            this.navItems.push({ id: lesson.id, el: subLink, chapterIndex: ci });
          });
          li.appendChild(subUl);
        }
        ul.appendChild(li);
        this.navItems.push({ id: chapter.id, el: link, chapterIndex: ci });
      });
      nav.innerHTML = '';
      nav.appendChild(ul);

      const self = this;
      ul.querySelectorAll('.nav-chapter').forEach(li => {
        const link = li.querySelector('.nav-chapter-link');
        const lessons = li.querySelector('.nav-lessons');
        if (!link) return;
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const ci = parseInt(link.dataset.ci);

          if (lessons) {
            const isOpen = li.classList.contains('expanded');
            // Close all others
            ul.querySelectorAll('.nav-chapter').forEach(other => {
              if (other !== li) {
                other.classList.remove('expanded');
                const ol = other.querySelector('.nav-lessons');
                if (ol) { ol.style.maxHeight = ''; ol.style.padding = ''; }
              }
            });
            // Toggle this one
            if (isOpen) {
              li.classList.remove('expanded');
              lessons.style.maxHeight = '';
              lessons.style.padding = '';
            } else {
              li.classList.add('expanded');
              lessons.style.maxHeight = lessons.scrollHeight + 'px';
              lessons.style.padding = '0 0 0.4rem';
            }
          }

          // Navigate to the chapter
          if (!isNaN(ci)) self.goToChapter(ci);
        });
      });
    },

    addChapterNavButtons() {
      this.chapters.forEach((chapter, ci) => {
        const topNav = document.createElement('div');
        topNav.className = 'chapter-nav';
        const botNav = document.createElement('div');
        botNav.className = 'chapter-nav';
        const prevTitle = ci > 0 ? (this.chapters[ci - 1].querySelector('h2')?.textContent || 'Previous') : '';
        const nextTitle = ci < this.chapters.length - 1 ? (this.chapters[ci + 1].querySelector('h2')?.textContent || 'Next') : '';

        const makePrev = () => {
          if (ci === 0) { const ph = document.createElement('div'); ph.className = 'chapter-nav-placeholder'; return ph; }
          const btn = document.createElement('button');
          btn.className = 'chapter-nav-btn prev';
          btn.innerHTML = '<span class="nav-arrow">&larr;</span><span class="nav-label"><span class="nav-small">Previous Chapter</span><span class="nav-title">' + prevTitle.replace(/ \(0 of.*/, '') + '</span></span>';
          btn.addEventListener('click', () => this.goToChapter(ci - 1));
          return btn;
        };
        const makeNext = () => {
          if (ci === this.chapters.length - 1) { const ph = document.createElement('div'); ph.className = 'chapter-nav-placeholder'; return ph; }
          const btn = document.createElement('button');
          btn.className = 'chapter-nav-btn next';
          btn.innerHTML = '<span class="nav-label"><span class="nav-small">Next Chapter</span><span class="nav-title">' + nextTitle.replace(/ \(0 of.*/, '') + '</span></span><span class="nav-arrow">&rarr;</span>';
          btn.addEventListener('click', () => this.goToChapter(ci + 1));
          return btn;
        };

        topNav.appendChild(makePrev());
        topNav.appendChild(makeNext());
        botNav.appendChild(makePrev());
        botNav.appendChild(makeNext());

        if (ci > 0) {
          const intro = chapter.querySelector('.chapter-intro');
          if (intro) intro.parentNode.insertBefore(topNav, intro);
          else chapter.insertBefore(topNav, chapter.children[1] || null);
        }
        chapter.appendChild(botNav);
      });
    },

    goToChapter(index) {
      if (index < 0 || index >= this.chapters.length) return;
      this.currentIndex = index;
      this.chapters.forEach((ch, i) => ch.classList.toggle('active-chapter', i === index));
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      const hash = this.chapters[index].id;
      if (location.hash !== '#' + hash) history.pushState(null, '', '#' + hash);

      document.querySelectorAll('.nav-chapter-link').forEach(el => el.classList.remove('current-chapter'));
      document.querySelectorAll('.nav-chapter').forEach(el => el.classList.remove('expanded'));
      const navItems = document.querySelectorAll('.nav-chapter');
      if (navItems[index]) {
        navItems[index].querySelector('.nav-chapter-link')?.classList.add('current-chapter');
        navItems[index].classList.add('expanded');
      }

      this.initVisibleDemos();
      ProgressTracker.updateUI();
    },

    initVisibleDemos() {
      const self = this;
      const chapter = self.chapters[self.currentIndex];
      if (!chapter) return;
      const doInit = () => {
        chapter.querySelectorAll('.interactive-demo[data-demo]').forEach(container => {
          const type = container.dataset.demo;
          if (DEMO_REGISTRY[type] && !container.dataset.inited) {
            container.dataset.inited = '1';
            const existing = container.querySelector('.demo-canvas-container');
            if (existing) existing.style.display = 'none';
            try { DEMO_REGISTRY[type](container); } catch (e) { console.warn('Demo init:', e); }
          }
        });
      };
      requestAnimationFrame(() => setTimeout(doInit, 60));
    },

    setupHashRouting() {
      const resolveHash = () => {
        const hash = location.hash.replace('#', '');
        if (!hash) { this.goToChapter(0); return; }
        let found = -1;
        this.chapters.forEach((ch, i) => { if (ch.id === hash) found = i; });
        if (found >= 0) { this.goToChapter(found); return; }
        this.chapters.forEach((ch, i) => {
          if (ch.querySelector('#' + CSS.escape(hash))) found = i;
        });
        if (found >= 0) {
          this.goToChapter(found);
          setTimeout(() => { const el = document.getElementById(hash); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
        } else {
          this.goToChapter(0);
        }
      };
      window.addEventListener('hashchange', resolveHash);
      resolveHash();
    },

    scrollToSection(id) {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    setupScrollSpy() {
      if (!this.navItems.length) return;
      const handler = () => {
        let current = '';
        const offset = 120;
        this.navItems.forEach(item => {
          if (item.chapterIndex !== this.currentIndex) return;
          const sec = document.getElementById(item.id);
          if (sec && sec.getBoundingClientRect().top <= offset) current = item.id;
        });
        this.navItems.forEach(item => {
          if (item.chapterIndex === this.currentIndex) {
            item.el.classList.toggle('active', item.id === current);
          } else {
            item.el.classList.remove('active');
          }
        });
      };
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking) { requestAnimationFrame(() => { handler(); ticking = false; }); ticking = true; }
      }, { passive: true });
      handler();
    },

    setupMobileMenu() {
      const menuBtn = document.querySelector('.mobile-menu-btn');
      const sidebar = document.querySelector('.sidebar');
      const overlay = document.querySelector('.overlay');
      this._syncMobileBtn = () => {
        if (!menuBtn || !sidebar) return;
        const isOpen = sidebar.classList.contains('open');
        menuBtn.textContent = isOpen ? '✕' : '☰';
        menuBtn.style.left = isOpen ? '' : '';
        menuBtn.style.display = isOpen ? 'none' : '';
      };
      const syncBtn = this._syncMobileBtn;
      if (menuBtn && sidebar) {
        menuBtn.addEventListener('click', () => {
          sidebar.classList.toggle('open');
          if (overlay) overlay.classList.toggle('active');
          syncBtn();
        });
      }
      const sidebarClose = document.querySelector('.sidebar-close-btn');
      if (sidebarClose && sidebar) {
        sidebarClose.addEventListener('click', () => {
          sidebar.classList.remove('open');
          if (overlay) overlay.classList.remove('active');
          syncBtn();
          if (menuBtn) menuBtn.style.display = '';
        });
      }
      if (overlay && sidebar) {
        overlay.addEventListener('click', () => {
          sidebar.classList.remove('open');
          overlay.classList.remove('active');
          syncBtn();
        });
      }
    },

    setupScrollToTop() {
      const btn = document.querySelector('.scroll-to-top');
      if (!btn) return;
      window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > 300);
      }, { passive: true });
      btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    },
  };

  // ============================================================
  //  DARK / LIGHT MODE
  // ============================================================

  const ThemeManager = {
    init() {
      const saved = localStorage.getItem('mathguide-theme');
      if (saved === 'light') {
        document.body.classList.add('light-mode');
      } else {
        document.body.classList.remove('light-mode');
      }
      this.updateToggleBtn();

      const btn = document.getElementById('dark-mode-toggle');
      if (btn) {
        btn.addEventListener('click', () => this.toggle());
      }
    },

    toggle() {
      document.body.classList.toggle('light-mode');
      const isLight = document.body.classList.contains('light-mode');
      localStorage.setItem('mathguide-theme', isLight ? 'light' : 'dark');
      this.updateToggleBtn();
      allDemos.forEach((fn) => { try { fn(); } catch (_) { /* noop */ } });
    },

    updateToggleBtn() {
      const btn = document.getElementById('dark-mode-toggle');
      if (!btn) return;
      btn.innerHTML = '';
      btn.title = document.body.classList.contains('light-mode') ? 'Switch to dark mode' : 'Switch to light mode';
    },
  };

  // ============================================================
  //  SEARCH
  // ============================================================

  const Search = {
    dropdown: null,

    init() {
      const input = document.getElementById('search-input');
      if (!input) return;

      this.dropdown = document.createElement('div');
      this.dropdown.className = 'search-dropdown';
      const wrap = input.closest('.search-wrap') || input.parentNode;
      wrap.style.position = 'relative';
      wrap.appendChild(this.dropdown);

      input.addEventListener('input', debounce(() => this.perform(input.value.trim()), 250));
      input.addEventListener('focus', () => { if (input.value.trim()) this.perform(input.value.trim()); });
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-wrap') && !e.target.closest('.search-dropdown')) {
          this.dropdown.style.display = 'none';
        }
      });
    },

    buildIndex() {
      if (this._index) return this._index;
      const index = [];
      document.querySelectorAll('.chapter').forEach((ch) => {
        const chapterTitle = (ch.querySelector('.chapter-header h2') || {}).textContent || ch.id;
        const chIdx = Array.from(document.querySelectorAll('.chapter')).indexOf(ch);
        ch.querySelectorAll('.lesson').forEach((lesson) => {
          const h3 = lesson.querySelector('h3');
          const sectionTitle = h3 ? h3.textContent : '';
          const boxes = lesson.querySelectorAll('.theorem-box, .definition-box, .formula-box, .example-box');
          boxes.forEach((box) => {
            const title = (box.querySelector('.box-title') || {}).textContent || '';
            if (title) index.push({ text: title.toLowerCase(), display: title, section: sectionTitle, chIdx, el: box, type: 'concept' });
          });
          const problems = lesson.querySelectorAll('.problem');
          problems.forEach((p) => {
            const num = (p.querySelector('.problem-number') || {}).textContent || '';
            const q = (p.querySelector('.problem-question') || {}).textContent || '';
            if (num) index.push({ text: (num + ' ' + q).toLowerCase(), display: 'Problem ' + num, section: sectionTitle, chIdx, el: p, type: 'problem' });
          });
          if (sectionTitle) index.push({ text: sectionTitle.toLowerCase(), display: sectionTitle, section: chapterTitle, chIdx, el: lesson, type: 'section' });
        });
      });
      this._index = index;
      return index;
    },

    perform(term) {
      if (!term) { this.dropdown.style.display = 'none'; return; }
      const index = this.buildIndex();
      const lower = term.toLowerCase();
      const results = index.filter(item => item.text.includes(lower)).slice(0, 12);

      if (results.length === 0) {
        this.dropdown.innerHTML = '<div class="search-empty">No results found</div>';
        this.dropdown.style.display = 'block';
        return;
      }

      let html = '';
      results.forEach((r) => {
        const icon = r.type === 'section' ? '&#167;' : r.type === 'concept' ? '&#9670;' : '#';
        html += '<button class="search-result" data-ch="' + r.chIdx + '">'
          + '<span class="search-result-icon">' + icon + '</span>'
          + '<span class="search-result-body">'
          + '<span class="search-result-title">' + this.highlightTerm(r.display, term) + '</span>'
          + '<span class="search-result-section">' + r.section + '</span>'
          + '</span></button>';
      });
      html = '<div class="search-legend"><span>&#167; Section</span><span>&#9670; Concept</span><span># Problem</span></div>' + html;
      this.dropdown.innerHTML = html;
      this.dropdown.style.display = 'block';

      this.dropdown.querySelectorAll('.search-result').forEach((btn, i) => {
        btn.addEventListener('click', () => {
          const r = results[i];
          Navigation.goToChapter(r.chIdx);
          setTimeout(() => {
            r.el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            r.el.style.outline = '2px solid var(--accent)';
            r.el.style.outlineOffset = '4px';
            setTimeout(() => { r.el.style.outline = ''; r.el.style.outlineOffset = ''; }, 2500);
          }, 200);
          this.dropdown.style.display = 'none';
          document.getElementById('search-input').value = '';
        });
      });
    },

    highlightTerm(text, term) {
      const re = new RegExp('(' + escapeRegExp(term) + ')', 'gi');
      return text.replace(re, '<mark class="search-hl">$1</mark>');
    },
  };

  // ============================================================
  //  PRACTICE PROBLEM ENGINE
  // ============================================================

  const PracticeEngine = {
    progress: {},

    init() {
      this.load();

      document.addEventListener('click', (e) => {
        if (e.target.classList.contains('show-solution-btn')) {
          this.toggleSolution(e.target);
        }
        if (e.target.classList.contains('show-hints-btn')) {
          this.toggleHints(e.target);
        }
      });

      this.updateCounters();
    },

    toggleSolution(btn) {
      const solution = btn.nextElementSibling;
      if (!solution || !solution.classList.contains('problem-solution')) {
        // Try to find it as a sibling further down
        const parent = btn.closest('.problem, .practice-problem');
        const sol = parent && parent.querySelector('.problem-solution');
        if (sol) {
          sol.classList.toggle('visible');
          btn.textContent = sol.classList.contains('visible') ? 'Hide Solution' : 'Show Solution';
          if (sol.classList.contains('visible')) this.markViewed(btn);
          return;
        }
        return;
      }
      solution.classList.toggle('visible');
      btn.textContent = solution.classList.contains('visible') ? 'Hide Solution' : 'Show Solution';
      if (solution.classList.contains('visible')) this.markViewed(btn);
    },

    toggleHints(btn) {
      const parent = btn.closest('.problem, .practice-problem');
      const hints = parent && parent.querySelector('.problem-hints');
      if (hints) {
        hints.classList.toggle('visible');
        btn.textContent = hints.classList.contains('visible') ? 'Hide Hints' : 'Show Hints';
      }
    },

    markViewed(btn) {
      const problem = btn.closest('.problem, .practice-problem');
      if (!problem) return;
      const section = problem.closest('.lesson, .chapter, section');
      const sectionId = section ? (section.id || 'unknown') : 'unknown';
      const problemId = problem.id || problem.dataset.id || Array.from(
        (section || document).querySelectorAll('.problem, .practice-problem')
      ).indexOf(problem).toString();

      if (!this.progress[sectionId]) this.progress[sectionId] = [];
      const key = sectionId + ':' + problemId;
      if (!this.progress[sectionId].includes(key)) {
        this.progress[sectionId].push(key);
      }
      this.save();
      this.updateCounters();
      ProgressTracker.updateUI();
    },

    updateCounters() {
      document.querySelectorAll('.lesson, .chapter, section').forEach((sec) => {
        const problems = sec.querySelectorAll('.problem, .practice-problem');
        if (!problems.length) return;
        const id = sec.id || 'unknown';
        const viewed = (this.progress[id] || []).length;
        let counter = sec.querySelector('.problem-counter');
        if (!counter) {
          const header = sec.querySelector('.lesson-header, .chapter-title, h2, h3');
          if (!header) return;
          counter = document.createElement('span');
          counter.className = 'problem-counter';
          counter.style.cssText = 'font-size:0.8em;opacity:0.7;margin-left:8px;';
          header.appendChild(counter);
        }
        counter.textContent = `(${viewed} of ${problems.length} attempted)`;
      });
    },

    save() {
      const data = JSON.parse(localStorage.getItem('mathguide-progress') || '{}');
      data.practice = this.progress;
      localStorage.setItem('mathguide-progress', JSON.stringify(data));
    },

    load() {
      try {
        const data = JSON.parse(localStorage.getItem('mathguide-progress') || '{}');
        this.progress = data.practice || {};
      } catch (_) {
        this.progress = {};
      }
    },
  };

  // ============================================================
  //  PROGRESS TRACKING
  // ============================================================

  const ProgressTracker = {
    init() {
      this.updateUI();
    },

    updateUI() {
      const chapter = document.querySelector('.chapter.active-chapter');
      if (!chapter) return;
      const problems = chapter.querySelectorAll('.problem');
      const total = problems.length;
      let done = 0;
      const practice = PracticeEngine.progress || {};
      chapter.querySelectorAll('.lesson[id], .chapter[id]').forEach(sec => {
        const arr = practice[sec.id];
        if (arr) done += arr.length;
      });
      done = Math.min(done, total);
      const pct = total > 0 ? Math.round((done / total) * 100) : 0;
      const fill = document.querySelector('.progress-fill');
      const text = document.querySelector('.progress-text');
      if (fill) fill.style.width = pct + '%';
      if (text) text.textContent = done + '/' + total + ' done';
    },

    save() {},

    load() {
      try {
        const data = JSON.parse(localStorage.getItem('mathguide-progress') || '{}');
        if (Array.isArray(data.visited)) {
          data.visited.forEach((id) => this.visited.add(id));
        }
      } catch (_) { /* noop */ }
    },
  };

  // ============================================================
  //  COLLAPSIBLE CONTENT
  // ============================================================

  const Collapsible = {
    init() {
      // Proof boxes — collapsed by default
      document.querySelectorAll('.proof-box').forEach((box) => {
        const title = box.querySelector('.box-title');
        const content = box.querySelector('.box-content');
        if (!title || !content) return;
        box.classList.add('collapsed');
        let indicator = title.querySelector('.collapse-indicator');
        if (!indicator) {
          indicator = document.createElement('span');
          indicator.className = 'collapse-indicator';
          indicator.style.cssText = 'margin-right:6px;display:inline-block;transition:transform 0.2s;';
          indicator.textContent = '▶';
          title.insertBefore(indicator, title.firstChild);
        }
        title.style.cursor = 'pointer';
        title.addEventListener('click', () => {
          box.classList.toggle('collapsed');
          indicator.textContent = box.classList.contains('collapsed') ? '▶' : '▼';
        });
      });

      // Lesson headers
      document.querySelectorAll('.lesson-header').forEach((header) => {
        const lesson = header.closest('.lesson');
        if (!lesson) return;
        const content = lesson.querySelector('.lesson-content');
        if (!content) return;
        header.style.cursor = 'pointer';
        let indicator = header.querySelector('.collapse-indicator');
        if (!indicator) {
          indicator = document.createElement('span');
          indicator.className = 'collapse-indicator';
          indicator.style.cssText = 'margin-right:6px;display:inline-block;transition:transform 0.2s;font-size:0.7em;';
          indicator.textContent = '▼';
          header.insertBefore(indicator, header.firstChild);
        }
        header.addEventListener('click', (e) => {
          if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') return;
          lesson.classList.toggle('collapsed');
          indicator.textContent = lesson.classList.contains('collapsed') ? '▶' : '▼';
        });
      });
    },
  };

  // ============================================================
  //  KATEX RENDERING
  // ============================================================

  const KaTeXRenderer = {
    init() {
      const tryRender = () => {
        if (typeof renderMathInElement === 'function') {
          try {
            renderMathInElement(document.body, {
              delimiters: [
                { left: '$$', right: '$$', display: true },
                { left: '\\[', right: '\\]', display: true },
                { left: '$', right: '$', display: false },
                { left: '\\(', right: '\\)', display: false },
              ],
              throwOnError: false,
            });
          } catch (_) { /* noop */ }
          return true;
        }
        return false;
      };

      if (!tryRender()) {
        // Retry until KaTeX CDN loads (up to 10s)
        let attempts = 0;
        const interval = setInterval(() => {
          if (tryRender() || ++attempts > 20) clearInterval(interval);
        }, 500);
      }
    },
  };

  // ============================================================
  //  MINI-GRAPH VISUAL PANELS
  // ============================================================

  const MiniGraphs = {
    init() {
      document.querySelectorAll('.visual-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const panel = btn.nextElementSibling;
          const opening = !panel.classList.contains('open');
          btn.classList.toggle('open');
          panel.classList.toggle('open');
          if (opening && !panel.dataset.rendered) {
            panel.dataset.rendered = '1';
            this.renderAll(panel);
          }
        });
      });
    },

    renderAll(panel) {
      panel.querySelectorAll('.mini-graph').forEach(el => {
        try { this.renderOne(el); }
        catch (e) { console.warn('Mini-graph error:', e); }
      });
    },

    renderOne(el) {
      const fnStr = el.dataset.fn;
      const fn2Str = el.dataset.fn2;
      const color1 = el.dataset.color1 || '#4a9eff';
      const color2 = el.dataset.color2 || '#f87171';
      const xMin = parseFloat(el.dataset.xmin || '-6.5');
      const xMax = parseFloat(el.dataset.xmax || '6.5');
      const yMin = parseFloat(el.dataset.ymin || '-3');
      const yMax = parseFloat(el.dataset.ymax || '3');

      const canvas = document.createElement('canvas');
      el.insertBefore(canvas, el.firstChild);

      const dpr = window.devicePixelRatio || 1;
      const rect = el.getBoundingClientRect();
      const w = rect.width || 260;
      const h = 180;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);

      const toSx = x => ((x - xMin) / (xMax - xMin)) * w;
      const toSy = y => h - ((y - yMin) / (yMax - yMin)) * h;

      ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--bg-primary').trim() || '#0a0a0f';
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 0.5;
      for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x++) {
        const sx = toSx(x);
        ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx, h); ctx.stroke();
      }
      for (let y = Math.ceil(yMin); y <= Math.floor(yMax); y++) {
        const sy = toSy(y);
        ctx.beginPath(); ctx.moveTo(0, sy); ctx.lineTo(w, sy); ctx.stroke();
      }

      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1;
      const ox = toSx(0), oy = toSy(0);
      if (ox >= 0 && ox <= w) { ctx.beginPath(); ctx.moveTo(ox, 0); ctx.lineTo(ox, h); ctx.stroke(); }
      if (oy >= 0 && oy <= h) { ctx.beginPath(); ctx.moveTo(0, oy); ctx.lineTo(w, oy); ctx.stroke(); }

      const plotFn = (expr, color) => {
        let fn;
        try { fn = MathParser.compile(expr); } catch { return; }
        if (!fn) return;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = color;
        ctx.shadowBlur = 4;
        ctx.beginPath();
        let started = false;
        const steps = Math.round(w * 2);
        for (let i = 0; i <= steps; i++) {
          const x = xMin + (xMax - xMin) * (i / steps);
          let y;
          try { y = fn(x); } catch { continue; }
          if (!isFinite(y) || Math.abs(y) > 100) { started = false; continue; }
          const sx = toSx(x), sy = toSy(y);
          if (!started) { ctx.moveTo(sx, sy); started = true; }
          else ctx.lineTo(sx, sy);
        }
        ctx.stroke();
      };

      if (fnStr) plotFn(fnStr, color1);
      if (fn2Str) plotFn(fn2Str, color2);
      ctx.shadowBlur = 0;
    }
  };

  // ============================================================
  //  INITIALIZATION
  // ============================================================

  function init() {
    ThemeManager.init();
    KaTeXRenderer.init();
    Navigation.init();
    Search.init();

    PracticeEngine.init();
    ProgressTracker.init();
    Collapsible.init();
    MiniGraphs.init();

    // Reference sheet panel
    const refToggle = document.querySelector('.ref-sheet-toggle');
    const refPanel = document.getElementById('ref-sheet');
    const refClose = refPanel?.querySelector('.ref-sheet-close');
    let refRendered = false;
    const openRef = () => {
      refPanel?.classList.add('open');
      if (!refRendered && typeof renderMathInElement === 'function') {
        refRendered = true;
        renderMathInElement(refPanel, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false }
          ],
          throwOnError: false
        });
      }
    };
    const closeRef = () => refPanel?.classList.remove('open');
    refToggle?.addEventListener('click', () => refPanel?.classList.contains('open') ? closeRef() : openRef());
    refClose?.addEventListener('click', closeRef);

    refPanel?.querySelectorAll('.ref-sheet-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        refPanel.querySelectorAll('.ref-sheet-tab').forEach(t => t.classList.remove('active'));
        refPanel.querySelectorAll('.ref-sheet-section').forEach(s => s.classList.remove('active'));
        tab.classList.add('active');
        const target = refPanel.querySelector('[data-ref-section="' + tab.dataset.refTab + '"]');
        if (target) target.classList.add('active');
      });
    });

    // Today in Math History
    const mathDays = {
      '0101':['New Year — 1801: Carl Friedrich Gauss published <em>Disquisitiones Arithmeticae</em>, revolutionizing number theory at age 24.',''],
      '0112':['1907: Birthday of <strong>Sergei Novikov</strong>, Fields Medalist who connected topology with physics.',''],
      '0117':['1647: Birthday of <strong>Johann Bernoulli</strong>, who developed early calculus and taught Euler.',''],
      '0125':['1736: Birthday of <strong>Joseph-Louis Lagrange</strong>, creator of Lagrange multipliers and the Lagrangian.',''],
      '0202':['1905: Birthday of <strong>Atle Selberg</strong>, who proved the prime number theorem elementarily.',''],
      '0212':['1809: Birthday of <strong>Charles Darwin</strong> AND <strong>Abraham Lincoln</strong> — science and freedom share a birthday.',''],
      '0220':['1844: Birthday of <strong>Ludwig Boltzmann</strong>, who connected entropy to probability: S = k ln W.',''],
      '0223':['1855: Death of <strong>Carl Friedrich Gauss</strong>, the Prince of Mathematicians.',''],
      '0301':['1879: Birthday of <strong>R.H. Bing</strong>, topologist who proved wild theorems about 3-manifolds.',''],
      '0314':['<strong>Happy Pi Day!</strong> π = 3.14159265358979… Today also marks Einstein\'s birthday (1879). Pi is irrational, transcendental, and appears everywhere — from circles to quantum mechanics to probability. How many digits can you memorize?',''],
      '0320':['1768: Birthday of <strong>Joseph Fourier</strong>, who showed any function can be built from sine waves.',''],
      '0328':['1862: Birthday of <strong>Aristide Maillol</strong>. In math: 1949 — Claude Shannon published information theory.',''],
      '0330':['1596: Birthday of <strong>René Descartes</strong>, who unified algebra and geometry with the coordinate plane.',''],
      '0415':['1707: Birthday of <strong>Leonhard Euler</strong>, the most prolific mathematician in history. He gave us e, i, f(x), Σ, and hundreds of theorems.',''],
      '0423':['1858: Birthday of <strong>Max Planck</strong>, who launched quantum theory with E = hf.',''],
      '0430':['1777: Birthday of <strong>Carl Friedrich Gauss</strong>, who proved the fundamental theorem of algebra at age 22.',''],
      '0512':['1820: Birthday of <strong>Florence Nightingale</strong>, pioneer of statistical graphics and data visualization.',''],
      '0522':['1907: Birthday of <strong>Haskell Curry</strong>, after whom the Curry-Howard correspondence (and Haskell language) are named.',''],
      '0528':['1676: Newton wrote to Leibniz revealing his binomial series — the start of the calculus priority dispute.',''],
      '0613':['1928: Birthday of <strong>John Nash</strong>, whose Nash equilibrium revolutionized game theory. (A Beautiful Mind)',''],
      '0614':['1736: Birthday of <strong>Charles-Augustin de Coulomb</strong>, who quantified electric force with an inverse-square law.',''],
      '0622':['On this day in 1633, Galileo was forced to recant heliocentrism. "And yet it moves." Math reveals truth.',''],
      '0628':['<strong>τ Day!</strong> τ = 2π ≈ 6.28318… Some argue τ is more natural than π. The full turn is τ radians!',''],
      '0706':['1785: Birthday of <strong>William Rowan Hamilton</strong>. On Oct 16, 1843, he carved i² = j² = k² = ijk = −1 on a bridge, inventing quaternions.',''],
      '0802':['1815: Fields Medal namesake <strong>John Charles Fields</strong> was born. The "Nobel Prize of math."',''],
      '0810':['1912: Birthday of <strong>Jorge Luis Borges</strong>, whose stories explore infinity — The Library of Babel imagines all possible books.',''],
      '0906':['1766: Birthday of <strong>John Dalton</strong>, who used math to develop atomic theory.',''],
      '0917':['1826: Birthday of <strong>Bernhard Riemann</strong>, who reimagined geometry and stated the most famous unsolved problem: the Riemann Hypothesis.',''],
      '1006':['1831: Birthday of <strong>Richard Dedekind</strong>, who made the real numbers rigorous with "Dedekind cuts."',''],
      '1015':['1608: Birthday of <strong>Evangelista Torricelli</strong>, Galileo\'s student who invented the barometer and discovered "Torricelli\'s trumpet" — infinite surface area, finite volume!',''],
      '1023':['4004 BC (traditionally): Archbishop Ussher\'s calculated date of creation. Math meets theology.',''],
      '1031':['1815: Birthday of <strong>Karl Weierstrass</strong>, who made calculus rigorous and found a continuous but nowhere-differentiable function — breaking everyone\'s intuition.',''],
      '1107':['1867: Birthday of <strong>Marie Curie</strong>, who used math and physics to discover radioactivity (2 Nobel Prizes).',''],
      '1123':['1616: Birthday of <strong>John Wallis</strong>, who introduced the ∞ symbol and developed infinite products for π.',''],
      '1201':['1792: Birthday of <strong>Nikolai Lobachevsky</strong>, who dared to create non-Euclidean geometry — where parallel lines CAN meet.',''],
      '1205':['1901: Birthday of <strong>Werner Heisenberg</strong>. His uncertainty principle (Δx·Δp ≥ ℏ/2) is pure math constraining physical reality.',''],
      '1210':['1815: Birthday of <strong>Ada Lovelace</strong>, the world\'s first computer programmer, who saw that Babbage\'s engine could do more than arithmetic.',''],
      '1222':['1887: Birthday of <strong>Srinivasa Ramanujan</strong>, the self-taught genius from India whose intuition produced 3,900+ results. "An equation means nothing to me unless it expresses a thought of God."',''],
      '1225':['1642: Birthday of <strong>Isaac Newton</strong>, who invented calculus, described gravity, and transformed all of science. Not a bad Christmas present.',''],
    };
    const el = document.getElementById('math-today');
    if (el) {
      const d = new Date();
      const key = String(d.getMonth()+1).padStart(2,'0') + String(d.getDate()).padStart(2,'0');
      const entry = mathDays[key];
      if (entry) {
        el.innerHTML = '<div style="font-size:0.68rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--accent-secondary);margin-bottom:0.5rem;">Today in Math History — ' + d.toLocaleDateString('en-US',{month:'long',day:'numeric'}) + '</div><div style="font-size:1.3rem;margin-bottom:0.5rem;">' + entry[1] + '</div><p style="font-size:0.9rem;color:var(--text-secondary);line-height:1.7;margin:0;">' + entry[0] + '</p>';
      } else {
        const quotes = [
          ['"Mathematics is the queen of the sciences."','— Carl Friedrich Gauss'],
          ['"Pure mathematics is, in its way, the poetry of logical ideas."','— Albert Einstein'],
          ['"Do not worry about your difficulties in mathematics. I can assure you mine are still greater."','— Albert Einstein'],
          ['"In mathematics the art of proposing a question must be held of higher value than solving it."','— Georg Cantor'],
          ['"The essence of mathematics lies in its freedom."','— Georg Cantor'],
          ['"Mathematics is not about numbers, equations, computations, or algorithms: it is about understanding."','— William Paul Thurston'],
          ['"An equation means nothing to me unless it expresses a thought of God."','— Srinivasa Ramanujan'],
          ['"God used beautiful mathematics in creating the world."','— Paul Dirac'],
          ['"Mathematics, rightly viewed, possesses not only truth, but supreme beauty."','— Bertrand Russell'],
        ];
        const q = quotes[d.getDate() % quotes.length];
        el.innerHTML = '<div style="font-size:0.68rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--accent-secondary);margin-bottom:0.5rem;">Daily Inspiration</div><p style="font-size:1rem;color:var(--text-primary);line-height:1.7;margin:0 0 0.3rem;font-style:italic;">' + q[0] + '</p><p style="font-size:0.8rem;color:var(--text-muted);margin:0;">' + q[1] + '</p>';
      }
    }

    // Landing page chapter links
    document.querySelectorAll('.chapter-toc-item').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        const hash = a.getAttribute('href').replace('#','');
        const idx = Navigation.chapters.findIndex(c => c.id === hash);
        if (idx >= 0) Navigation.goToChapter(idx);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
