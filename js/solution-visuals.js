(function () {
  'use strict';

  // ============================================================
  //  SOLUTION VISUALIZATION SYSTEM
  //  Auto-injects canvas diagrams into problem solutions
  //  to help learners understand visually.
  // ============================================================

  const DPR = window.devicePixelRatio || 1;

  function makeCanvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w * DPR; c.height = h * DPR;
    c.style.width = w + 'px'; c.style.height = h + 'px';
    c.className = 'sol-vis-canvas';
    const ctx = c.getContext('2d');
    ctx.scale(DPR, DPR);
    return { c, ctx, w, h };
  }

  function drawAxes(ctx, w, h, opts = {}) {
    const ox = opts.ox || 40, oy = opts.oy || h - 30;
    const xEnd = opts.xEnd || w - 15, yEnd = opts.yEnd || 15;
    ctx.strokeStyle = '#444'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(xEnd, oy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox, yEnd); ctx.stroke();
    return { ox, oy, xEnd, yEnd };
  }

  function plotFn(ctx, fn, xMin, xMax, sx, sy, ox, oy, color, lw) {
    ctx.strokeStyle = color || '#6c63ff';
    ctx.lineWidth = lw || 2;
    ctx.beginPath();
    let started = false;
    const step = (xMax - xMin) / 400;
    for (let x = xMin; x <= xMax; x += step) {
      try {
        const y = fn(x);
        if (!isFinite(y) || Math.abs(y) > 1000) { started = false; continue; }
        const px = ox + (x - xMin) * sx, py = oy - y * sy;
        if (!started) { ctx.moveTo(px, py); started = true; } else ctx.lineTo(px, py);
      } catch (e) { started = false; }
    }
    ctx.stroke();
  }

  // ── Visual registry: problem number → draw function ──

  const V = {};

  // ── 1.1 Number Systems ──
  V['1.1.1'] = function (container) {
    const { ctx, w, h } = makeCanvas(320, 100);
    const sets = [
      { label: 'ℕ', x: 40, color: '#6c63ff' },
      { label: 'ℤ', x: 90, color: '#f0b832' },
      { label: 'ℚ', x: 140, color: '#4a9eff' },
      { label: 'ℝ', x: 200, color: '#34d399' },
      { label: 'ℂ', x: 260, color: '#a78bfa' },
    ];
    ctx.font = '11px Inter, sans-serif';
    sets.forEach(s => {
      ctx.beginPath(); ctx.arc(s.x, 40, 20, 0, Math.PI * 2);
      ctx.fillStyle = s.color + '25'; ctx.fill();
      ctx.strokeStyle = s.color; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = s.color; ctx.textAlign = 'center';
      ctx.fillText(s.label, s.x, 45);
    });
    for (let i = 0; i < sets.length - 1; i++) {
      ctx.strokeStyle = '#555'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(sets[i].x + 22, 40); ctx.lineTo(sets[i + 1].x - 22, 40); ctx.stroke();
      ctx.fillStyle = '#888'; ctx.font = '10px Inter'; ctx.textAlign = 'center';
      ctx.fillText('⊂', (sets[i].x + sets[i + 1].x) / 2, 44);
    }
    ctx.fillStyle = '#a0a0b0'; ctx.font = '10px Inter'; ctx.textAlign = 'center';
    ctx.fillText('-7 ∈ ℤ,ℚ,ℝ,ℂ    22/7 ∈ ℚ,ℝ,ℂ    √5 ∈ ℝ,ℂ    3+4i ∈ ℂ only', w / 2, 85);
    container.appendChild(c);
  };

  V['1.1.3'] = function (container) {
    const { ctx, c, w, h } = makeCanvas(300, 60);
    const y = 30;
    ctx.strokeStyle = '#555'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(20, y); ctx.lineTo(280, y); ctx.stroke();
    const sx = x => 150 + x * 25;
    [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].forEach(x => {
      ctx.beginPath(); ctx.moveTo(sx(x), y - 3); ctx.lineTo(sx(x), y + 3); ctx.stroke();
      ctx.fillStyle = '#777'; ctx.font = '8px Inter'; ctx.textAlign = 'center';
      ctx.fillText(x, sx(x), y + 13);
    });
    ctx.strokeStyle = '#6c63ff'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(sx(-3), y); ctx.lineTo(sx(3), y); ctx.stroke();
    [{ x: -3, open: true }, { x: 3, open: true }].forEach(pt => {
      ctx.beginPath(); ctx.arc(sx(pt.x), y, 4, 0, Math.PI * 2);
      ctx.fillStyle = pt.open ? '#0a0a0f' : '#6c63ff'; ctx.fill();
      ctx.strokeStyle = '#6c63ff'; ctx.lineWidth = 2; ctx.stroke();
    });
    ctx.fillStyle = '#f0b832'; ctx.font = '10px Inter'; ctx.textAlign = 'center';
    ctx.fillText('(-3, 3)', 150, 55);
    container.appendChild(c);
  };

  // ── 2.1 Limits ──
  V['2.1.1'] = function (container) {
    const { ctx, c, w, h } = makeCanvas(300, 180);
    const { ox, oy } = drawAxes(ctx, w, h);
    const xMin = -1, xMax = 7, sx = (w - 55) / (xMax - xMin), sy = 12;
    plotFn(ctx, x => x === 3 ? NaN : (x * x - 9) / (x - 3), xMin, xMax, sx, sy, ox - xMin * sx, oy, '#6c63ff', 2);
    const hx = ox + (3 - xMin) * sx, hy = oy - 6 * sy;
    ctx.beginPath(); ctx.arc(hx, hy, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#0a0a0f'; ctx.fill();
    ctx.strokeStyle = '#f87171'; ctx.lineWidth = 2; ctx.stroke();
    ctx.setLineDash([3, 3]); ctx.strokeStyle = '#f0b832'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(ox, hy); ctx.lineTo(w - 15, hy); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#f0b832'; ctx.font = '10px Inter'; ctx.textAlign = 'left';
    ctx.fillText('L = 6', ox + 3, hy - 6);
    ctx.fillStyle = '#f87171'; ctx.fillText('hole at x=3', hx + 8, hy - 6);
    container.appendChild(c);
  };

  V['2.1.2'] = function (container) {
    const { ctx, c, w, h } = makeCanvas(300, 180);
    const { ox, oy } = drawAxes(ctx, w, h);
    const xMin = -4, xMax = 4, sx = (w - 55) / (xMax - xMin), sy = 20;
    plotFn(ctx, x => x === 0 ? NaN : Math.sin(x) / x, xMin, xMax, sx, sy, ox - xMin * sx, oy, '#6c63ff', 2);
    const cx = ox + (0 - xMin) * sx, cy = oy - 1 * sy;
    ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#0a0a0f'; ctx.fill();
    ctx.strokeStyle = '#f0b832'; ctx.lineWidth = 2; ctx.stroke();
    ctx.setLineDash([3, 3]); ctx.strokeStyle = '#f0b832';
    ctx.beginPath(); ctx.moveTo(ox, cy); ctx.lineTo(w - 15, cy); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#f0b832'; ctx.font = '10px Inter'; ctx.textAlign = 'left';
    ctx.fillText('L = 1', ox + 3, cy - 8);
    ctx.fillStyle = '#a0a0b0'; ctx.fillText('sin(x)/x → 1 as x → 0', w / 2 - 40, 15);
    container.appendChild(c);
  };

  // ── 2.3 Continuity ──
  V['2.3.1'] = function (container) {
    const { ctx, c, w, h } = makeCanvas(320, 190);
    const { ox, oy } = drawAxes(ctx, w, h);
    const xMin = -5, xMax = 5, sx = (w - 55) / (xMax - xMin), sy = 15;
    const f = x => (Math.abs(x * x - 4) < 0.05) ? NaN : (x + 1) / (x * x - 4);
    plotFn(ctx, f, xMin, -2.05, sx, sy, ox - xMin * sx, oy, '#6c63ff', 2);
    plotFn(ctx, f, -1.95, 1.95, sx, sy, ox - xMin * sx, oy, '#6c63ff', 2);
    plotFn(ctx, f, 2.05, xMax, sx, sy, ox - xMin * sx, oy, '#6c63ff', 2);
    ctx.setLineDash([4, 3]); ctx.strokeStyle = '#f87171'; ctx.lineWidth = 1;
    [-2, 2].forEach(xv => {
      const px = ox + (xv - xMin) * sx;
      ctx.beginPath(); ctx.moveTo(px, 15); ctx.lineTo(px, oy); ctx.stroke();
    });
    ctx.setLineDash([]);
    ctx.fillStyle = '#f87171'; ctx.font = '10px Inter'; ctx.textAlign = 'center';
    const px2 = ox + (-2 - xMin) * sx, px3 = ox + (2 - xMin) * sx;
    ctx.fillText('x = -2', px2, oy + 15);
    ctx.fillText('x = 2', px3, oy + 15);
    ctx.fillStyle = '#a0a0b0'; ctx.fillText('Vertical asymptotes → discontinuous', w / 2, 12);
    container.appendChild(c);
  };

  V['2.3.2'] = function (container) {
    const { ctx, c, w, h } = makeCanvas(320, 200);
    const { ox, oy } = drawAxes(ctx, w, h);
    const xMin = -1, xMax = 5, sx = (w - 55) / (xMax - xMin), sy = 22;
    plotFn(ctx, x => x * x + 1, xMin, 2, sx, sy, ox - xMin * sx, oy, '#6c63ff', 2);
    plotFn(ctx, x => 1 * x + 3, 2, xMax, sx, sy, ox - xMin * sx, oy, '#34d399', 2);
    const meetX = ox + (2 - xMin) * sx, meetY = oy - 5 * sy;
    ctx.beginPath(); ctx.arc(meetX, meetY, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#f0b832'; ctx.fill();
    ctx.setLineDash([3, 3]); ctx.strokeStyle = '#f0b832'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(meetX, oy); ctx.lineTo(meetX, 15); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#6c63ff'; ctx.font = '10px Inter'; ctx.textAlign = 'left';
    ctx.fillText('x² + 1', ox + 5, oy - 2 * sy);
    ctx.fillStyle = '#34d399';
    ctx.fillText('kx + 3 (k=1)', meetX + 20, oy - 4.5 * sy);
    ctx.fillStyle = '#f0b832'; ctx.textAlign = 'center';
    ctx.fillText('meet at (2, 5)', meetX, meetY - 10);
    ctx.fillText('k = 1 makes pieces connect', w / 2, 12);
    container.appendChild(c);
  };

  V['2.3.3'] = function (container) {
    const { ctx, c, w, h } = makeCanvas(320, 200);
    const { ox, oy } = drawAxes(ctx, w, h);
    const xMin = -0.5, xMax = 2.5, sx = (w - 55) / (xMax - xMin), sy = 50;
    plotFn(ctx, x => Math.cos(x) - x, xMin, xMax, sx, sy, ox - xMin * sx, oy, '#6c63ff', 2);
    ctx.setLineDash([3, 3]); ctx.strokeStyle = '#888'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(w - 15, oy); ctx.stroke();
    ctx.setLineDash([]);
    const root = 0.7391;
    const rx = ox + (root - xMin) * sx;
    ctx.beginPath(); ctx.arc(rx, oy, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#34d399'; ctx.fill();
    const g0x = ox + (0 - xMin) * sx, g0y = oy - 1 * sy;
    ctx.beginPath(); ctx.arc(g0x, g0y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#6c63ff'; ctx.fill();
    const gpy = oy - (Math.cos(Math.PI / 2) - Math.PI / 2) * sy;
    const gpx = ox + (Math.PI / 2 - xMin) * sx;
    ctx.beginPath(); ctx.arc(gpx, gpy, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#f87171'; ctx.fill();
    ctx.font = '10px Inter'; ctx.textAlign = 'left';
    ctx.fillStyle = '#6c63ff'; ctx.fillText('g(0) = 1 > 0', g0x + 8, g0y - 5);
    ctx.fillStyle = '#f87171'; ctx.fillText('g(π/2) < 0', gpx + 5, gpy + 15);
    ctx.fillStyle = '#34d399'; ctx.textAlign = 'center'; ctx.fillText('root ≈ 0.74', rx, oy + 18);
    ctx.fillStyle = '#f0b832'; ctx.fillText('g(x) = cos x − x', w / 2, 12);
    ctx.fillText('IVT: sign change ⟹ root exists', w / 2, h - 5);
    container.appendChild(c);
  };

  V['2.3.4'] = function (container) {
    const { ctx, c, w, h } = makeCanvas(320, 200);
    const { ox, oy } = drawAxes(ctx, w, h, { oy: 100 });
    const xMin = -2, xMax = 4, sx = (w - 55) / (xMax - xMin), sy = 25;
    const newOy = 100;
    plotFn(ctx, x => (x < 1) ? -(x + 1) : NaN, xMin, 0.98, sx, sy, ox - xMin * sx, newOy, '#6c63ff', 2);
    plotFn(ctx, x => (x > 1) ? (x + 1) : NaN, 1.02, xMax, sx, sy, ox - xMin * sx, newOy, '#6c63ff', 2);
    const jx = ox + (1 - xMin) * sx;
    ctx.beginPath(); ctx.arc(jx, newOy - (-2) * sy, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#0a0a0f'; ctx.fill(); ctx.strokeStyle = '#6c63ff'; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.arc(jx, newOy - 2 * sy, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#0a0a0f'; ctx.fill(); ctx.strokeStyle = '#6c63ff'; ctx.stroke();
    ctx.setLineDash([3, 3]); ctx.strokeStyle = '#f87171';
    ctx.beginPath(); ctx.moveTo(jx, 15); ctx.lineTo(jx, h - 10); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#f87171'; ctx.font = '10px Inter'; ctx.textAlign = 'center';
    ctx.fillText('Jump at x = 1', jx, h - 5);
    ctx.fillStyle = '#6c63ff'; ctx.fillText('→ 2 from right', jx + 50, newOy - 2 * sy - 5);
    ctx.fillText('→ −2 from left', jx - 50, newOy - (-2) * sy + 15);
    container.appendChild(c);
  };

  V['2.3.5'] = function (container) {
    const { ctx, c, w, h } = makeCanvas(320, 200);
    const { ox, oy } = drawAxes(ctx, w, h);
    const xMin = -1, xMax = 5, sx = (w - 55) / (xMax - xMin), sy = 8;
    const a = 11 / 2, b = -9 / 2;
    plotFn(ctx, x => x * x, xMin, 1, sx, sy, ox - xMin * sx, oy, '#6c63ff', 2);
    plotFn(ctx, x => a * x + b, 1, 3, sx, sy, ox - xMin * sx, oy, '#f0b832', 2);
    plotFn(ctx, x => 4 * x, 3, xMax, sx, sy, ox - xMin * sx, oy, '#34d399', 2);
    [1, 3].forEach(xv => {
      const px = ox + (xv - xMin) * sx;
      const yv = xv === 1 ? 1 : 12;
      ctx.beginPath(); ctx.arc(px, oy - yv * sy, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#f0b832'; ctx.fill();
    });
    ctx.font = '10px Inter'; ctx.textAlign = 'left';
    ctx.fillStyle = '#6c63ff'; ctx.fillText('x²', ox + 5, oy - 0.5 * sy - 10);
    ctx.fillStyle = '#f0b832'; ctx.fillText('(11/2)x − 9/2', ox + (1.5 - xMin) * sx, oy - 2 * sy);
    ctx.fillStyle = '#34d399'; ctx.fillText('4x', ox + (3.5 - xMin) * sx, oy - 14 * sy);
    ctx.fillStyle = '#a0a0b0'; ctx.textAlign = 'center';
    ctx.fillText('All three pieces connect smoothly', w / 2, 12);
    container.appendChild(c);
  };

  // ── 3.1 Derivatives ──
  V['3.1.1'] = function (container) {
    const { ctx, c, w, h } = makeCanvas(320, 200);
    const { ox, oy } = drawAxes(ctx, w, h);
    const xMin = -2, xMax = 4, sx = (w - 55) / (xMax - xMin), sy = 15;
    plotFn(ctx, x => x * x, xMin, xMax, sx, sy, ox - xMin * sx, oy, '#6c63ff', 2);
    const a = 1;
    const tangSlope = 2 * a;
    const tangY = a2 => a2 * a2 + tangSlope * (a2 - a);
    ctx.strokeStyle = '#f87171'; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(ox + (-0.5 - xMin) * sx, oy - tangY(-0.5) * sy);
    ctx.lineTo(ox + (2.5 - xMin) * sx, oy - tangY(2.5) * sy);
    ctx.stroke();
    const px = ox + (a - xMin) * sx, py = oy - (a * a) * sy;
    ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#f0b832'; ctx.fill();
    ctx.fillStyle = '#a0a0b0'; ctx.font = '10px Inter'; ctx.textAlign = 'center';
    ctx.fillStyle = '#6c63ff'; ctx.fillText('f(x) = x²', w - 50, 30);
    ctx.fillStyle = '#f87171'; ctx.fillText('tangent slope = 2', w - 60, 50);
    ctx.fillStyle = '#f0b832'; ctx.fillText('(1, 1)', px + 15, py - 8);
    container.appendChild(c);
  };

  // ── 3.3 Applications ──
  V['3.3.2'] = function (container) {
    const { ctx, c, w, h } = makeCanvas(340, 210);
    const { ox, oy } = drawAxes(ctx, w, h);
    const xMin = -2.5, xMax = 3.5, sx = (w - 55) / (xMax - xMin), sy = 6;
    plotFn(ctx, x => x * x * x - 3 * x + 2, xMin, xMax, sx, sy, ox - xMin * sx, oy, '#6c63ff', 2);
    const pts = [
      { x: -2, y: 0, label: 'f(-2)=0', color: '#a78bfa' },
      { x: -1, y: 4, label: 'f(-1)=4', color: '#f0b832' },
      { x: 1, y: 0, label: 'f(1)=0', color: '#a78bfa' },
      { x: 3, y: 20, label: 'f(3)=20', color: '#34d399' },
    ];
    pts.forEach(p => {
      const px = ox + (p.x - xMin) * sx, py = oy - p.y * sy;
      ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fillStyle = p.color; ctx.fill();
      ctx.fillStyle = p.color; ctx.font = '9px Inter'; ctx.textAlign = 'center';
      ctx.fillText(p.label, px, py - 10);
    });
    ctx.fillStyle = '#34d399'; ctx.font = 'bold 10px Inter'; ctx.textAlign = 'center';
    ctx.fillText('★ Abs Max = 20 at x=3', w / 2 + 40, 12);
    ctx.fillStyle = '#a78bfa';
    ctx.fillText('★ Abs Min = 0 at x=-2 and x=1', w / 2, h - 5);
    container.appendChild(c);
  };

  V['3.3.3'] = function (container) {
    const { ctx, c, w, h } = makeCanvas(200, 220);
    const wallX = 30, floorY = 190;
    ctx.strokeStyle = '#555'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(wallX, 20); ctx.lineTo(wallX, floorY); ctx.lineTo(180, floorY); ctx.stroke();
    ctx.strokeStyle = '#6c63ff'; ctx.lineWidth = 3;
    const bx = wallX + 80, by = floorY, tx = wallX, ty = floorY - 110;
    ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(tx, ty); ctx.stroke();
    ctx.fillStyle = '#f0b832'; ctx.font = '11px Inter'; ctx.textAlign = 'center';
    ctx.fillText('10 ft', (bx + tx) / 2 + 15, (by + ty) / 2 - 5);
    ctx.fillStyle = '#00d2ff'; ctx.fillText('x = 6', (wallX + bx) / 2, floorY + 15);
    ctx.fillStyle = '#34d399'; ctx.fillText('y = 8', wallX - 15, (floorY + ty) / 2);
    ctx.strokeStyle = '#f87171'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(bx, floorY - 5); ctx.lineTo(bx + 20, floorY - 5); ctx.stroke();
    ctx.fillStyle = '#f87171'; ctx.fillText('dx/dt = 2', bx + 15, floorY - 12);
    ctx.strokeStyle = '#a78bfa';
    ctx.beginPath(); ctx.moveTo(wallX + 5, ty); ctx.lineTo(wallX + 5, ty + 20); ctx.stroke();
    ctx.fillStyle = '#a78bfa'; ctx.fillText('dy/dt = ?', wallX + 25, ty + 10);
    ctx.fillStyle = '#f0b832'; ctx.textAlign = 'center';
    ctx.fillText('dy/dt = −3/2 ft/s', w / 2 + 20, 15);
    container.appendChild(c);
  };

  V['3.3.4'] = function (container) {
    const { ctx, c, w, h } = makeCanvas(300, 180);
    const { ox, oy } = drawAxes(ctx, w, h);
    const xMin = 0.001, xMax = 3, sx = (w - 55) / (xMax - 0), sy = 50;
    plotFn(ctx, x => Math.pow(x, x), 0.01, xMax, sx, sy, ox, oy, '#6c63ff', 2);
    ctx.beginPath(); ctx.arc(ox, oy - 1 * sy, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#f0b832'; ctx.fill();
    ctx.setLineDash([3, 3]); ctx.strokeStyle = '#f0b832';
    ctx.beginPath(); ctx.moveTo(ox, oy - 1 * sy); ctx.lineTo(ox + 50, oy - 1 * sy); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#f0b832'; ctx.font = '10px Inter'; ctx.textAlign = 'left';
    ctx.fillText('→ 1 as x → 0⁺', ox + 8, oy - 1 * sy - 8);
    ctx.fillStyle = '#a0a0b0'; ctx.fillText('x^x', w - 40, 30);
    container.appendChild(c);
  };

  // ── 4 Integration ──
  V['4.2.1'] = function (container) {
    const { ctx, c, w, h } = makeCanvas(320, 190);
    const { ox, oy } = drawAxes(ctx, w, h);
    const xMin = -0.5, xMax = 4, sx = (w - 55) / (xMax - xMin), sy = 12;
    const f = x => x * x;
    ctx.fillStyle = 'rgba(108,99,255,0.15)';
    ctx.beginPath(); ctx.moveTo(ox + (1 - xMin) * sx, oy);
    for (let x = 1; x <= 3; x += 0.02) ctx.lineTo(ox + (x - xMin) * sx, oy - f(x) * sy);
    ctx.lineTo(ox + (3 - xMin) * sx, oy); ctx.closePath(); ctx.fill();
    plotFn(ctx, f, xMin, xMax, sx, sy, ox - xMin * sx, oy, '#6c63ff', 2);
    ctx.fillStyle = '#f0b832'; ctx.font = '10px Inter'; ctx.textAlign = 'center';
    ctx.fillText('a=1', ox + (1 - xMin) * sx, oy + 15);
    ctx.fillText('b=3', ox + (3 - xMin) * sx, oy + 15);
    ctx.fillStyle = '#6c63ff'; ctx.fillText('∫₁³ x² dx = [x³/3]₁³ = 26/3', w / 2, 15);
    ctx.fillStyle = '#a0a0b0'; ctx.fillText('shaded area = 26/3', w / 2 + 20, oy - 4 * sy);
    container.appendChild(c);
  };

  // ── 5 Series ──
  V['5.1.1'] = function (container) {
    const { ctx, c, w, h } = makeCanvas(320, 170);
    const { ox, oy } = drawAxes(ctx, w, h);
    ctx.fillStyle = '#a0a0b0'; ctx.font = '10px Inter'; ctx.textAlign = 'center';
    const sx = 25, sy = 50;
    for (let n = 0; n < 10; n++) {
      const val = Math.pow(0.5, n);
      const px = ox + n * sx + 10, py = oy - val * sy;
      ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#6c63ff'; ctx.fill();
    }
    let partial = 0;
    for (let n = 0; n < 10; n++) {
      partial += Math.pow(0.5, n);
      const px = ox + n * sx + 10, py = oy - (partial / 2) * sy;
      ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#f0b832'; ctx.fill();
    }
    ctx.setLineDash([3, 3]); ctx.strokeStyle = '#34d399';
    ctx.beginPath(); ctx.moveTo(ox, oy - (2 / 2) * sy); ctx.lineTo(w - 15, oy - (2 / 2) * sy); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#6c63ff'; ctx.font = '9px Inter'; ctx.textAlign = 'left';
    ctx.fillText('terms (1/2)ⁿ', w - 100, 15);
    ctx.fillStyle = '#f0b832'; ctx.fillText('partial sums → 2', w - 100, 30);
    ctx.fillStyle = '#34d399'; ctx.fillText('sum = 2', w - 80, oy - (2 / 2) * sy - 5);
    container.appendChild(c);
  };

  // ── Additional problems with auto-generated function graphs ──

  const autoGraphProblems = {
    '2.1.3': { fn: x => (x * x - 4) / (x + 2), xMin: -5, xMax: 3, title: 'f(x) = (x²-4)/(x+2)', holes: [{ x: -2, y: -4 }], limits: [{ at: -2, val: -4 }] },
    '2.1.4': { fn: x => (Math.sqrt(x + 1) - 1) / x, xMin: -0.9, xMax: 5, title: '(√(x+1)−1)/x', holes: [{ x: 0, y: 0.5 }], limits: [{ at: 0, val: 0.5 }] },
    '2.1.6': { fn: x => Math.abs(x - 2) / (x - 2), xMin: -1, xMax: 5, title: '|x-2|/(x-2)', jump: { x: 2, left: -1, right: 1 } },
    '2.3.6': { fn: x => x === 2 ? NaN : (x * x - 4) / (x - 2), xMin: -1, xMax: 5, title: '(x²-4)/(x-2)', holes: [{ x: 2, y: 4 }], limits: [{ at: 2, val: 4 }] },
    '3.1.2': { fn: x => 1 / (x * x), xMin: 0.2, xMax: 4, title: 'f(x) = 1/x² → f\'(x) = -2/x³', tangentAt: 1, tangentSlope: -2 },
    '3.3.1': { fn: x => (Math.exp(x) - 1) / (x === 0 ? 0.0001 : x), xMin: -3, xMax: 3, title: '(eˣ−1)/x → 1', limits: [{ at: 0, val: 1 }] },
  };

  Object.entries(autoGraphProblems).forEach(([num, cfg]) => {
    V[num] = function (container) {
      const { ctx, c, w, h } = makeCanvas(300, 180);
      const { ox, oy } = drawAxes(ctx, w, h);
      const xRange = cfg.xMax - cfg.xMin;
      const sx = (w - 55) / xRange;
      let yMin = Infinity, yMax = -Infinity;
      for (let x = cfg.xMin; x <= cfg.xMax; x += xRange / 200) {
        try { const y = cfg.fn(x); if (isFinite(y)) { yMin = Math.min(yMin, y); yMax = Math.max(yMax, y); } } catch (e) {}
      }
      const yRange = yMax - yMin || 1;
      const sy = (h - 50) / yRange;
      const baseOy = oy + yMin * sy;

      plotFn(ctx, cfg.fn, cfg.xMin, cfg.xMax, sx, sy, ox - cfg.xMin * sx, baseOy, '#6c63ff', 2);

      if (cfg.holes) cfg.holes.forEach(hole => {
        const px = ox + (hole.x - cfg.xMin) * sx, py = baseOy - hole.y * sy;
        ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#0a0a0f'; ctx.fill();
        ctx.strokeStyle = '#f87171'; ctx.lineWidth = 2; ctx.stroke();
      });

      if (cfg.limits) cfg.limits.forEach(lim => {
        const py = baseOy - lim.val * sy;
        ctx.setLineDash([3, 3]); ctx.strokeStyle = '#f0b832'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(ox, py); ctx.lineTo(w - 15, py); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#f0b832'; ctx.font = '10px Inter'; ctx.textAlign = 'left';
        ctx.fillText('L = ' + lim.val, ox + 3, py - 6);
      });

      if (cfg.jump) {
        const jx = ox + (cfg.jump.x - cfg.xMin) * sx;
        ctx.setLineDash([4, 3]); ctx.strokeStyle = '#f87171';
        ctx.beginPath(); ctx.moveTo(jx, 15); ctx.lineTo(jx, oy); ctx.stroke();
        ctx.setLineDash([]);
        ctx.beginPath(); ctx.arc(jx, baseOy - cfg.jump.left * sy, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#0a0a0f'; ctx.fill(); ctx.strokeStyle = '#6c63ff'; ctx.lineWidth = 2; ctx.stroke();
        ctx.beginPath(); ctx.arc(jx, baseOy - cfg.jump.right * sy, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#0a0a0f'; ctx.fill(); ctx.strokeStyle = '#6c63ff'; ctx.stroke();
        ctx.fillStyle = '#f87171'; ctx.font = '9px Inter'; ctx.textAlign = 'center';
        ctx.fillText('jump', jx, oy + 15);
      }

      if (cfg.tangentAt !== undefined) {
        const tX = cfg.tangentAt, tY = cfg.fn(tX), tS = cfg.tangentSlope;
        const px = ox + (tX - cfg.xMin) * sx, py = baseOy - tY * sy;
        ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#f0b832'; ctx.fill();
        ctx.strokeStyle = '#f87171'; ctx.lineWidth = 1.5;
        ctx.beginPath();
        const dx = 1.5;
        ctx.moveTo(ox + (tX - dx - cfg.xMin) * sx, baseOy - (tY + tS * (-dx)) * sy);
        ctx.lineTo(ox + (tX + dx - cfg.xMin) * sx, baseOy - (tY + tS * dx) * sy);
        ctx.stroke();
      }

      ctx.fillStyle = '#a0a0b0'; ctx.font = '10px Inter'; ctx.textAlign = 'center';
      ctx.fillText(cfg.title, w / 2, 12);
      container.appendChild(c);
    };
  });

  // ── Injection system ──

  function injectVisuals() {
    document.querySelectorAll('.problem').forEach(problem => {
      const numEl = problem.querySelector('.problem-number');
      if (!numEl) return;
      const num = numEl.textContent.trim();
      if (!V[num]) return;
      const solution = problem.querySelector('.problem-solution');
      if (!solution || solution.querySelector('.sol-vis-wrapper')) return;

      const wrapper = document.createElement('div');
      wrapper.className = 'sol-vis-wrapper';
      const label = document.createElement('div');
      label.className = 'sol-vis-label';
      label.textContent = 'Visual';
      wrapper.appendChild(label);

      try { V[num](wrapper); } catch (e) { console.warn('Visual ' + num + ':', e); }

      solution.insertBefore(wrapper, solution.firstChild);
    });
  }

  function init() {
    injectVisuals();
    const obs = new MutationObserver(() => setTimeout(injectVisuals, 200));
    const main = document.querySelector('.main-content') || document.body;
    obs.observe(main, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 500));
  } else {
    setTimeout(init, 500);
  }
})();
