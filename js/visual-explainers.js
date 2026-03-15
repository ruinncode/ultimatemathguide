(function() {
'use strict';

/* ── Inject styles ── */
var _s = document.createElement('style');
_s.textContent = [
  '.ve-container{margin:20px 0;padding:16px;background:rgba(108,99,255,.04);border:1px solid rgba(108,99,255,.15);border-radius:12px}',
  '.ve-header{font-weight:600;color:#6c63ff;margin-bottom:12px;font-size:14px;letter-spacing:.3px}',
  '.ve-canvas-wrap{background:#0e0e18;border-radius:8px;text-align:center;padding:10px;margin-bottom:10px}',
  '.ve-canvas{display:block;margin:0 auto;border-radius:4px}',
  '.ve-text{color:rgba(255,255,255,.78);font-size:13px;line-height:1.65;min-height:40px;margin-bottom:10px;padding:0 4px}',
  '.ve-controls{display:flex;align-items:center;justify-content:center;gap:12px}',
  '.ve-btn{background:rgba(108,99,255,.1);border:1px solid rgba(108,99,255,.25);color:#a78bfa;padding:6px 18px;border-radius:6px;cursor:pointer;font-size:12px;transition:all .2s;font-family:inherit}',
  '.ve-btn:hover:not(:disabled){background:rgba(108,99,255,.22);color:#c4b5fd}',
  '.ve-btn:disabled{opacity:.3;cursor:default}',
  '.ve-step-label{color:rgba(255,255,255,.45);font-size:12px;min-width:44px;text-align:center}',
  'body.light-mode .ve-canvas-wrap{background:#f0f0f5}',
  'body.light-mode .ve-text{color:rgba(0,0,0,.75)}',
  'body.light-mode .ve-step-label{color:rgba(0,0,0,.4)}',
  'body.light-mode .ve-btn{background:rgba(90,82,224,.08);border-color:rgba(90,82,224,.2);color:#5a52e0}',
  'body.light-mode .ve-btn:hover:not(:disabled){background:rgba(90,82,224,.15)}'
].join('\n');
document.head.appendChild(_s);

/* ── Constants ── */
var DPR = window.devicePixelRatio || 1;
var PI = Math.PI;
var EXPLAINERS = [];
function isLight() { return document.body.classList.contains('light-mode'); }
var C = {};
function refreshC() {
  var lt = isLight();
  C.accent = lt ? '#5a52e0' : '#6c63ff';
  C.secondary = lt ? '#0090b0' : '#00d2ff';
  C.gold = lt ? '#c89000' : '#f0b832';
  C.green = lt ? '#1a8a60' : '#34d399';
  C.red = lt ? '#d04040' : '#f87171';
  C.purple = lt ? '#7c5cbf' : '#a78bfa';
  C.text = lt ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)';
  C.textDim = lt ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)';
  C.grid = lt ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)';
  C.axis = lt ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)';
  C.bg = lt ? '#f8f8fa' : '#0e0e18';
  C.holeFill = lt ? '#f8f8fa' : '#0e0e18';
}
refreshC();

/* ── Utility ── */
function lerp(a, b, t) { return a + (b - a) * t; }
function easeInOut(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

/* ── Coordinate helper ── */
function sc(w, h, xMin, xMax, sy, opts) {
  opts = opts || {};
  var ox = opts.ox !== undefined ? opts.ox : 40;
  var oy = opts.oy !== undefined ? opts.oy : h - 30;
  var pad = opts.pad || 60;
  var sx = (w - pad) / (xMax - xMin);
  return {
    ox: ox, oy: oy, sx: sx, sy: sy, xMin: xMin, xMax: xMax,
    x: function(v) { return ox + (v - xMin) * sx; },
    y: function(v) { return oy - v * sy; }
  };
}

/* ── Drawing helpers ── */
function drawAxes(ctx, w, h, opts) {
  opts = opts || {};
  var ox = opts.ox !== undefined ? opts.ox : 40;
  var oy = opts.oy !== undefined ? opts.oy : h - 30;
  var xEnd = opts.xEnd || w - 10, yEnd = opts.yEnd || 10;
  ctx.save(); ctx.strokeStyle = C.axis; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(ox, yEnd); ctx.lineTo(ox, oy); ctx.lineTo(xEnd, oy); ctx.stroke();
  ctx.fillStyle = C.axis;
  ctx.beginPath(); ctx.moveTo(ox - 4, yEnd + 8); ctx.lineTo(ox, yEnd); ctx.lineTo(ox + 4, yEnd + 8); ctx.fill();
  ctx.beginPath(); ctx.moveTo(xEnd - 8, oy - 4); ctx.lineTo(xEnd, oy); ctx.lineTo(xEnd - 8, oy + 4); ctx.fill();
  ctx.restore();
  return { ox: ox, oy: oy };
}

function plotFn(ctx, fn, xMin, xMax, sx, sy, ox, oy, color, lw) {
  ctx.save(); ctx.strokeStyle = color || C.accent; ctx.lineWidth = lw || 2;
  ctx.beginPath(); var started = false;
  for (var i = 0; i <= 300; i++) {
    var x = xMin + i * (xMax - xMin) / 300;
    var y = fn(x);
    if (!isFinite(y) || Math.abs(y) > 500) { started = false; continue; }
    var px = ox + (x - xMin) * sx, py = oy - y * sy;
    if (!started) { ctx.moveTo(px, py); started = true; } else ctx.lineTo(px, py);
  }
  ctx.stroke(); ctx.restore();
}

function plotC(ctx, fn, c, color, lw) {
  plotFn(ctx, fn, c.xMin, c.xMax, c.sx, c.sy, c.ox, c.oy, color, lw);
}

function fillC(ctx, fn, xMin, xMax, c, color) {
  ctx.save(); ctx.fillStyle = color || 'rgba(108,99,255,0.25)';
  ctx.beginPath(); ctx.moveTo(c.x(xMin), c.oy);
  for (var i = 0; i <= 200; i++) {
    var x = xMin + i * (xMax - xMin) / 200;
    var y = fn(x); if (!isFinite(y)) y = 0;
    ctx.lineTo(c.x(x), c.y(y));
  }
  ctx.lineTo(c.x(xMax), c.oy); ctx.closePath(); ctx.fill(); ctx.restore();
}

function rectsC(ctx, fn, a, b, n, c, color) {
  var dx = (b - a) / n;
  for (var i = 0; i < n; i++) {
    var x = a + i * dx, fv = fn(x + dx / 2);
    var px = c.x(x), pw = dx * c.sx, ph = Math.max(0, fv * c.sy);
    ctx.fillStyle = color || 'rgba(108,99,255,0.3)';
    ctx.fillRect(px, c.oy - ph, pw, ph);
    ctx.strokeStyle = C.grid; ctx.lineWidth = 0.5;
    ctx.strokeRect(px, c.oy - ph, pw, ph);
  }
}

function drawDot(ctx, x, y, r, color) {
  ctx.save(); ctx.fillStyle = color || C.accent;
  ctx.beginPath(); ctx.arc(x, y, r || 4, 0, PI * 2); ctx.fill(); ctx.restore();
}

function drawHollowDot(ctx, x, y, r, color) {
  ctx.save(); ctx.strokeStyle = color || C.accent; ctx.lineWidth = 2; ctx.fillStyle = C.bg;
  ctx.beginPath(); ctx.arc(x, y, r || 4, 0, PI * 2); ctx.fill(); ctx.stroke(); ctx.restore();
}

function drawArrow(ctx, x1, y1, x2, y2, color, lw) {
  ctx.save(); ctx.strokeStyle = color || C.accent; ctx.fillStyle = color || C.accent;
  ctx.lineWidth = lw || 2;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  var a = Math.atan2(y2 - y1, x2 - x1), hl = 8;
  ctx.beginPath(); ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - hl * Math.cos(a - 0.4), y2 - hl * Math.sin(a - 0.4));
  ctx.lineTo(x2 - hl * Math.cos(a + 0.4), y2 - hl * Math.sin(a + 0.4));
  ctx.closePath(); ctx.fill(); ctx.restore();
}

function drawDashed(ctx, x1, y1, x2, y2, color, lw) {
  ctx.save(); ctx.strokeStyle = color || C.gold; ctx.lineWidth = lw || 1;
  ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
  ctx.stroke(); ctx.setLineDash([]); ctx.restore();
}

function drawLabel(ctx, text, x, y, opts) {
  opts = opts || {}; ctx.save();
  ctx.fillStyle = opts.color || C.text;
  ctx.font = (opts.bold ? 'bold ' : '') + (opts.size || 12) + 'px sans-serif';
  ctx.textAlign = opts.align || 'center'; ctx.textBaseline = opts.baseline || 'middle';
  ctx.fillText(text, x, y); ctx.restore();
}

function drawSecantLine(ctx, fn, x1, x2, c, color) {
  var y1 = fn(x1), y2 = fn(x2);
  var m = (y2 - y1) / (x2 - x1);
  var ya = y1 + m * (c.xMin - x1), yb = y1 + m * (c.xMax - x1);
  ctx.save(); ctx.strokeStyle = color || C.gold; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(c.x(c.xMin), c.y(ya)); ctx.lineTo(c.x(c.xMax), c.y(yb));
  ctx.stroke(); ctx.restore();
}

/* ── Engine ── */
function createExplainer(config) {
  var lesson = document.getElementById(config.lessonId);
  if (!lesson) return;
  if (lesson.querySelector('.ve-container[data-ve-id="' + config.veId + '"]')) return;

  var container = document.createElement('div');
  container.className = 've-container';
  container.setAttribute('data-ve-id', config.veId || config.lessonId);

  var header = document.createElement('div');
  header.className = 've-header';
  header.innerHTML = '\u25B6 Visual Intuition: ' + config.title;

  var canvasWrap = document.createElement('div');
  canvasWrap.className = 've-canvas-wrap';
  var canvas = document.createElement('canvas');
  canvas.className = 've-canvas';
  canvasWrap.appendChild(canvas);

  var textEl = document.createElement('div');
  textEl.className = 've-text';

  var controls = document.createElement('div');
  controls.className = 've-controls';
  var backBtn = document.createElement('button');
  backBtn.className = 've-btn ve-back';
  backBtn.textContent = '\u25C0 Back';
  var stepLabel = document.createElement('span');
  stepLabel.className = 've-step-label';
  var nextBtn = document.createElement('button');
  nextBtn.className = 've-btn ve-next';
  nextBtn.textContent = 'Next \u25B6';
  controls.appendChild(backBtn);
  controls.appendChild(stepLabel);
  controls.appendChild(nextBtn);

  container.appendChild(header);
  container.appendChild(canvasWrap);
  container.appendChild(textEl);
  container.appendChild(controls);

  var lessonContent = lesson.querySelector('.lesson-content');
  if (lessonContent) {
    var existing = lessonContent.querySelectorAll('.ve-container');
    if (existing.length > 0) {
      var last = existing[existing.length - 1];
      last.parentNode.insertBefore(container, last.nextSibling);
    } else {
      lessonContent.insertBefore(container, lessonContent.firstChild);
    }
  } else {
    lesson.appendChild(container);
  }

  var w = 380, h = 260;
  canvas.width = w * DPR; canvas.height = h * DPR;
  canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
  var ctx = canvas.getContext('2d');
  ctx.scale(DPR, DPR);

  var currentStep = 0, animId = null;

  function render() {
    refreshC();
    var frame = config.frames[currentStep];
    if (!frame) return;
    var start = performance.now(), duration = 600;
    function tick() {
      var t = Math.min((performance.now() - start) / duration, 1);
      ctx.clearRect(0, 0, w, h);
      frame.draw(ctx, w, h, t);
      if (t < 1) animId = requestAnimationFrame(tick);
    }
    if (animId) cancelAnimationFrame(animId);
    tick();
    textEl.textContent = frame.text;
    stepLabel.textContent = (currentStep + 1) + ' / ' + config.frames.length;
    backBtn.disabled = currentStep === 0;
    nextBtn.disabled = currentStep === config.frames.length - 1;
  }

  backBtn.addEventListener('click', function() { if (currentStep > 0) { currentStep--; render(); } });
  nextBtn.addEventListener('click', function() { if (currentStep < config.frames.length - 1) { currentStep++; render(); } });
  render();
}

/* ================================================================
   EXPLAINER DEFINITIONS — 25 total
   ================================================================ */

/* ── 1. What IS a Limit? ── */
EXPLAINERS.push((function() {
  var xMin = -1, xMax = 5, SY = 25;
  function f(x) { return x + 2; }
  function fHole(x) { return Math.abs(x - 2) < 0.05 ? NaN : x + 2; }
  function bg(ctx, w, h, c) {
    drawAxes(ctx, w, h, { ox: c.ox, oy: c.oy });
    plotC(ctx, fHole, c, C.accent, 2);
    drawHollowDot(ctx, c.x(2), c.y(4), 5, C.red);
  }
  return {
    veId: 'intuitive-limits', title: 'What IS a Limit?', lessonId: 'intuitive-limits',
    frames: [
      { text: 'Consider f(x) = (x\u00B2\u22124)/(x\u22122). At x=2 the function is undefined \u2014 there\'s a hole.',
        draw: function(ctx, w, h, t) {
          var c = sc(w, h, xMin, xMax, SY);
          var et = easeInOut(t);
          drawAxes(ctx, w, h, { ox: c.ox, oy: c.oy });
          ctx.save(); ctx.globalAlpha = et; plotC(ctx, fHole, c, C.accent, 2.5); ctx.restore();
          if (t > 0.5) drawHollowDot(ctx, c.x(2), c.y(4), 5 * easeInOut((t - 0.5) * 2), C.red);
          if (t > 0.7) drawLabel(ctx, 'hole!', c.x(2) + 28, c.y(4) - 2, { size: 11, color: C.red, bold: true });
          drawLabel(ctx, 'x', w - 15, c.oy + 14, { size: 10, color: C.textDim });
          drawLabel(ctx, 'y', c.ox - 12, 18, { size: 10, color: C.textDim });
        }},
      { text: 'As x approaches 2 from the left, f(x) gets closer and closer to 4...',
        draw: function(ctx, w, h, t) {
          var c = sc(w, h, xMin, xMax, SY); bg(ctx, w, h, c);
          var et = easeInOut(t), dx = lerp(-0.5, 1.95, et), dy = f(dx);
          var px = c.x(dx), py = c.y(dy);
          drawDot(ctx, px, py, 5, C.gold);
          drawDashed(ctx, px, py, c.ox, py, C.gold);
          drawLabel(ctx, 'y\u2248' + dy.toFixed(2), c.ox - 5, py, { size: 10, color: C.gold, align: 'right' });
        }},
      { text: '...and from the right, f(x) also approaches 4.',
        draw: function(ctx, w, h, t) {
          var c = sc(w, h, xMin, xMax, SY); bg(ctx, w, h, c);
          var et = easeInOut(t), dx = lerp(4.5, 2.05, et), dy = f(dx);
          drawDot(ctx, c.x(dx), c.y(dy), 5, C.secondary);
          drawDashed(ctx, c.x(dx), c.y(dy), c.ox, c.y(dy), C.secondary);
          drawLabel(ctx, 'y\u2248' + dy.toFixed(2), c.ox - 5, c.y(dy), { size: 10, color: C.secondary, align: 'right' });
        }},
      { text: 'Even though f(2) doesn\'t exist, the limit IS 4. A limit is about where the function is HEADING, not where it IS.',
        draw: function(ctx, w, h, t) {
          var c = sc(w, h, xMin, xMax, SY); bg(ctx, w, h, c);
          var et = easeInOut(t);
          drawDashed(ctx, c.ox, c.y(4), lerp(c.ox, w - 10, et), c.y(4), C.gold, 1.5);
          drawLabel(ctx, 'L = 4', w - 40, c.y(4) - 12, { size: 13, color: C.gold, bold: true });
          if (t > 0.3) {
            var at = easeInOut((t - 0.3) / 0.7);
            drawArrow(ctx, c.x(2) - 70, c.y(4), c.x(2) - lerp(70, 12, at), c.y(4), C.gold);
            drawArrow(ctx, c.x(2) + 70, c.y(4), c.x(2) + lerp(70, 12, at), c.y(4), C.secondary);
          }
        }},
      { text: 'In fact, (x\u00B2\u22124)/(x\u22122) = x+2 everywhere except x=2. The limit \u201Csees through\u201D the hole.',
        draw: function(ctx, w, h, t) {
          var c = sc(w, h, xMin, xMax, SY); bg(ctx, w, h, c);
          var et = easeInOut(t);
          ctx.save(); ctx.globalAlpha = et * 0.6; plotC(ctx, f, c, C.green, 3); ctx.restore();
          if (t > 0.4) drawDot(ctx, c.x(2), c.y(4), 4 * easeInOut((t - 0.4) / 0.6), C.green);
          drawLabel(ctx, 'f(x) = x + 2', w / 2 + 50, 25, { size: 13, color: C.green, bold: true });
        }}
    ]
  };
})());

/* ── 2. Continuity vs Discontinuity ── */
EXPLAINERS.push({
  veId: 'continuity', title: 'Continuity vs Discontinuity', lessonId: 'continuity',
  frames: [
    { text: 'A continuous function is one you can draw without lifting your pen.',
      draw: function(ctx, w, h, t) {
        var c = sc(w, h, 0, 6, 30, { oy: h / 2 + 40 });
        drawAxes(ctx, w, h, { ox: c.ox, oy: c.oy });
        var et = easeInOut(t);
        plotFn(ctx, function(x) { return 2 + 1.5 * Math.sin(x); }, 0, lerp(0.1, 6, et), c.sx, c.sy, c.ox, c.oy, C.green, 2.5);
        drawLabel(ctx, 'Continuous \u2014 no breaks!', w / 2, 20, { size: 13, color: C.green, bold: true });
      }},
    { text: 'A \u201Chole\u201D discontinuity: the limit exists, but the function is undefined or has a different value there.',
      draw: function(ctx, w, h, t) {
        var c = sc(w, h, 0, 6, 30, { oy: h / 2 + 40 });
        drawAxes(ctx, w, h, { ox: c.ox, oy: c.oy });
        plotFn(ctx, function(x) { return Math.abs(x - 3) < 0.06 ? NaN : 2 + 1.5 * Math.sin(x); }, 0, 6, c.sx, c.sy, c.ox, c.oy, C.accent, 2.5);
        var et = easeInOut(t);
        if (t > 0.3) drawHollowDot(ctx, c.x(3), c.y(2 + 1.5 * Math.sin(3)), 5 * easeInOut((t - 0.3) / 0.5), C.red);
        drawLabel(ctx, 'Removable (hole)', w / 2, 20, { size: 13, color: C.red, bold: true });
      }},
    { text: 'A \u201Cjump\u201D discontinuity: the function suddenly jumps. Left and right limits disagree.',
      draw: function(ctx, w, h, t) {
        var c = sc(w, h, 0, 6, 30, { oy: h / 2 + 40 });
        drawAxes(ctx, w, h, { ox: c.ox, oy: c.oy });
        plotFn(ctx, function(x) { return x < 3 ? 1.5 : NaN; }, 0, 6, c.sx, c.sy, c.ox, c.oy, C.accent, 2.5);
        plotFn(ctx, function(x) { return x >= 3 ? 3.5 : NaN; }, 0, 6, c.sx, c.sy, c.ox, c.oy, C.accent, 2.5);
        drawDot(ctx, c.x(3), c.y(3.5), 4, C.accent);
        drawHollowDot(ctx, c.x(3), c.y(1.5), 4, C.accent);
        var et = easeInOut(t);
        if (t > 0.4) {
          drawDashed(ctx, c.x(3), c.y(1.5), c.x(3), c.y(3.5), C.red);
          drawLabel(ctx, 'JUMP', c.x(3) + 25, c.y(2.5), { size: 12, color: C.red, bold: true });
        }
        drawLabel(ctx, 'Jump discontinuity', w / 2, 20, { size: 13, color: C.red, bold: true });
      }},
    { text: 'An \u201Cinfinite\u201D discontinuity: the function shoots to infinity. There\'s no finite limit.',
      draw: function(ctx, w, h, t) {
        var c = sc(w, h, 0, 6, 30, { oy: h / 2 + 40 });
        drawAxes(ctx, w, h, { ox: c.ox, oy: c.oy });
        plotFn(ctx, function(x) { return 1 / (x - 3) + 2; }, 0, 6, c.sx, c.sy, c.ox, c.oy, C.accent, 2.5);
        drawDashed(ctx, c.x(3), 10, c.x(3), c.oy, C.red, 1.5);
        drawLabel(ctx, 'Infinite (asymptote)', w / 2, 20, { size: 13, color: C.red, bold: true });
      }},
    { text: 'Three types of discontinuity: removable (hole), jump, and infinite (asymptote). Continuity means NONE of these happen.',
      draw: function(ctx, w, h, t) {
        var et = easeInOut(t);
        var panels = [
          { label: 'Hole', color: C.gold, fn: function(x) { return Math.abs(x - 1) < 0.08 ? NaN : 1 + Math.sin(x); } },
          { label: 'Jump', color: C.secondary, fn: null },
          { label: 'Asymptote', color: C.red, fn: function(x) { return 1 / (x - 1) + 1.5; } }
        ];
        var pw = 100, gap = 15, sx0 = 20;
        for (var p = 0; p < 3; p++) {
          var px = sx0 + p * (pw + gap), oy = h - 25, oxp = px + 5;
          ctx.save(); ctx.globalAlpha = et;
          ctx.strokeStyle = C.axis; ctx.lineWidth = 0.5;
          ctx.beginPath(); ctx.moveTo(oxp, 40); ctx.lineTo(oxp, oy); ctx.lineTo(px + pw, oy); ctx.stroke();
          var lsx = (pw - 10) / 2, lsy = 35;
          if (p === 0) {
            plotFn(ctx, panels[0].fn, 0, 2, lsx, lsy, oxp, oy, panels[0].color, 2);
            drawHollowDot(ctx, oxp + 1 * lsx, oy - (1 + Math.sin(1)) * lsy, 3, C.red);
          } else if (p === 1) {
            plotFn(ctx, function(x) { return x < 1 ? 0.8 : NaN; }, 0, 2, lsx, lsy, oxp, oy, panels[1].color, 2);
            plotFn(ctx, function(x) { return x >= 1 ? 2.2 : NaN; }, 0, 2, lsx, lsy, oxp, oy, panels[1].color, 2);
          } else {
            plotFn(ctx, panels[2].fn, 0, 2, lsx, lsy, oxp, oy, panels[2].color, 2);
            drawDashed(ctx, oxp + 1 * lsx, 40, oxp + 1 * lsx, oy, C.red, 0.5);
          }
          drawLabel(ctx, panels[p].label, px + pw / 2, 28, { size: 11, color: panels[p].color, bold: true });
          ctx.restore();
        }
      }}
  ]
});

/* ── 3. Epsilon-Delta Visually ── */
EXPLAINERS.push((function() {
  function f(x) { return 2 * x + 1; }
  var xMin = 0, xMax = 6, SY = 15;
  function scene(ctx, w, h, c, eps, del, t) {
    drawAxes(ctx, w, h, { ox: c.ox, oy: c.oy });
    plotC(ctx, f, c, C.accent, 2);
    drawDot(ctx, c.x(3), c.y(7), 4, C.green);
    var et = easeInOut(t);
    if (eps > 0) {
      ctx.save(); ctx.fillStyle = 'rgba(240,184,50,0.12)';
      ctx.fillRect(c.ox, c.y(7 + eps), w - 50 - c.ox, (eps * 2) * c.sy); ctx.restore();
      drawDashed(ctx, c.ox, c.y(7 + eps), w - 50, c.y(7 + eps), C.gold, 1);
      drawDashed(ctx, c.ox, c.y(7 - eps), w - 50, c.y(7 - eps), C.gold, 1);
      drawLabel(ctx, '\u03B5=' + eps.toFixed(1), w - 38, c.y(7), { size: 10, color: C.gold });
    }
    if (del > 0) {
      ctx.save(); ctx.fillStyle = 'rgba(0,210,255,0.1)';
      ctx.fillRect(c.x(3 - del), c.y(0), del * 2 * c.sx, -c.oy + 10); ctx.restore();
      drawDashed(ctx, c.x(3 - del), 10, c.x(3 - del), c.oy, C.secondary, 1);
      drawDashed(ctx, c.x(3 + del), 10, c.x(3 + del), c.oy, C.secondary, 1);
      drawLabel(ctx, '\u03B4=' + del.toFixed(2), c.x(3), c.oy + 14, { size: 10, color: C.secondary });
    }
    drawLabel(ctx, '(3, 7)', c.x(3) + 20, c.y(7) - 8, { size: 10, color: C.green });
  }
  return {
    veId: 'epsilon-delta', title: 'Epsilon-Delta Visually', lessonId: 'epsilon-delta',
    frames: [
      { text: 'We want to prove lim(x\u21923) of 2x+1 = 7. We can make f(x) as close to 7 as we want.',
        draw: function(ctx, w, h, t) { var c = sc(w, h, xMin, xMax, SY); scene(ctx, w, h, c, 0, 0, t); }},
      { text: 'Someone gives us \u03B5 \u2014 a tolerance around L=7. We must keep f(x) inside this yellow band.',
        draw: function(ctx, w, h, t) { var c = sc(w, h, xMin, xMax, SY); scene(ctx, w, h, c, 1.5 * easeInOut(t), 0, t); }},
      { text: 'We respond with \u03B4 \u2014 if x stays within \u03B4 of 3, then f(x) stays within \u03B5 of 7.',
        draw: function(ctx, w, h, t) { var c = sc(w, h, xMin, xMax, SY); scene(ctx, w, h, c, 1.5, 0.75 * easeInOut(t), t); }},
      { text: 'Make \u03B5 smaller? No problem \u2014 we just make \u03B4 smaller too. For this function, \u03B4 = \u03B5/2 always works.',
        draw: function(ctx, w, h, t) {
          var c = sc(w, h, xMin, xMax, SY);
          var eps = lerp(1.5, 0.8, easeInOut(t));
          scene(ctx, w, h, c, eps, eps / 2, t);
        }},
      { text: 'No matter HOW small \u03B5 gets, we can always find a \u03B4. THAT is what \u201Cthe limit equals 7\u201D means, rigorously.',
        draw: function(ctx, w, h, t) {
          var c = sc(w, h, xMin, xMax, SY);
          var eps = lerp(0.8, 0.25, easeInOut(t));
          scene(ctx, w, h, c, eps, eps / 2, t);
        }}
    ]
  };
})());

/* ── 4. Secant to Tangent ── */
EXPLAINERS.push((function() {
  function f(x) { return x * x; }
  var xMin = -0.5, xMax = 4, SY = 14;
  function base(ctx, w, h, c) {
    drawAxes(ctx, w, h, { ox: c.ox, oy: c.oy });
    plotC(ctx, f, c, C.accent, 2);
  }
  return {
    veId: 'derivative-definition', title: 'Secant to Tangent', lessonId: 'derivative-definition',
    frames: [
      { text: 'Start with two points on f(x)=x\u00B2. The line through them is a SECANT line. Its slope is the average rate of change.',
        draw: function(ctx, w, h, t) {
          var c = sc(w, h, xMin, xMax, SY); base(ctx, w, h, c);
          drawSecantLine(ctx, f, 1, 3, c, C.gold);
          drawDot(ctx, c.x(1), c.y(1), 5, C.gold);
          drawDot(ctx, c.x(3), c.y(9), 5, C.gold);
          drawLabel(ctx, '(1,1)', c.x(1) - 22, c.y(1) + 12, { size: 10, color: C.gold });
          drawLabel(ctx, '(3,9)', c.x(3) + 18, c.y(9) - 8, { size: 10, color: C.gold });
          drawLabel(ctx, 'slope = 4', w / 2 + 40, 25, { size: 12, color: C.gold, bold: true });
        }},
      { text: 'Slide the second point closer... the secant line rotates, and its slope changes.',
        draw: function(ctx, w, h, t) {
          var c = sc(w, h, xMin, xMax, SY); base(ctx, w, h, c);
          var x2 = lerp(3, 2, easeInOut(t));
          drawSecantLine(ctx, f, 1, x2, c, C.gold);
          drawDot(ctx, c.x(1), c.y(1), 5, C.gold);
          drawDot(ctx, c.x(x2), c.y(f(x2)), 5, C.gold);
          var m = (f(x2) - f(1)) / (x2 - 1);
          drawLabel(ctx, 'slope \u2248 ' + m.toFixed(2), w / 2 + 40, 25, { size: 12, color: C.gold, bold: true });
        }},
      { text: 'Closer still... the secant line is getting closer to touching the curve at just one point.',
        draw: function(ctx, w, h, t) {
          var c = sc(w, h, xMin, xMax, SY); base(ctx, w, h, c);
          var x2 = lerp(2, 1.3, easeInOut(t));
          drawSecantLine(ctx, f, 1, x2, c, C.gold);
          drawDot(ctx, c.x(1), c.y(1), 5, C.gold);
          drawDot(ctx, c.x(x2), c.y(f(x2)), 5, C.gold);
          var m = (f(x2) - f(1)) / (x2 - 1);
          drawLabel(ctx, 'slope \u2248 ' + m.toFixed(2), w / 2 + 40, 25, { size: 12, color: C.gold, bold: true });
        }},
      { text: 'In the LIMIT, the secant becomes the TANGENT line. Its slope is the derivative f\'(1)=2.',
        draw: function(ctx, w, h, t) {
          var c = sc(w, h, xMin, xMax, SY); base(ctx, w, h, c);
          var x2 = lerp(1.3, 1.01, easeInOut(t));
          drawSecantLine(ctx, f, 1, x2, c, C.gold);
          drawDot(ctx, c.x(1), c.y(1), 5, C.red);
          if (t > 0.7) {
            ctx.save(); ctx.globalAlpha = (t - 0.7) / 0.3;
            drawLabel(ctx, 'TANGENT', c.x(2.5), c.y(f(2.5)) - 20, { size: 13, color: C.red, bold: true });
            drawLabel(ctx, 'f\'(1) = 2', w / 2, h - 15, { size: 13, color: C.red, bold: true });
            ctx.restore();
          }
        }},
      { text: 'f\'(x) = lim[h\u21920] (f(x+h)\u2212f(x))/h. The derivative IS this limit of secant slopes becoming the tangent slope.',
        draw: function(ctx, w, h, t) {
          var c = sc(w, h, xMin, xMax, SY); base(ctx, w, h, c);
          var et = easeInOut(t);
          var ya = 1 + 2 * (c.xMin - 1), yb = 1 + 2 * (c.xMax - 1);
          ctx.save(); ctx.strokeStyle = C.red; ctx.lineWidth = 2; ctx.globalAlpha = et;
          ctx.beginPath(); ctx.moveTo(c.x(c.xMin), c.y(ya)); ctx.lineTo(c.x(c.xMax), c.y(yb)); ctx.stroke();
          ctx.restore();
          drawDot(ctx, c.x(1), c.y(1), 5, C.red);
          drawLabel(ctx, 'f\'(x) = lim  (f(x+h)\u2212f(x)) / h', w / 2, 22, { size: 12, color: C.text, bold: true });
          drawLabel(ctx, 'h\u21920', w / 2 - 38, 36, { size: 9, color: C.textDim });
        }}
    ]
  };
})());

/* ── 5. What the Derivative Tells You ── */
EXPLAINERS.push((function() {
  function f(x) { return x * x * x - 3 * x; }
  function fp(x) { return 3 * x * x - 3; }
  var xMin = -2.5, xMax = 2.5, SY = 22;
  return {
    veId: 'differentiation-rules', title: 'What the Derivative Tells You', lessonId: 'differentiation-rules',
    frames: [
      { text: 'Imagine walking along the curve. At each point, the derivative tells you the STEEPNESS and DIRECTION.',
        draw: function(ctx, w, h, t) {
          var c = sc(w, h, xMin, xMax, SY, { oy: h / 2 + 20 });
          drawAxes(ctx, w, h, { ox: c.ox, oy: c.oy });
          plotC(ctx, f, c, C.accent, 2);
          var et = easeInOut(t), px = lerp(-2, 2, et), py = f(px), slope = fp(px);
          var dx = 20, dy = slope * 20 / c.sx * c.sy;
          var len = Math.sqrt(dx * dx + dy * dy); dx = dx / len * 25; dy = dy / len * 25;
          drawDot(ctx, c.x(px), c.y(py), 5, C.gold);
          drawArrow(ctx, c.x(px), c.y(py), c.x(px) + dx, c.y(py) - dy, C.gold, 2.5);
        }},
      { text: 'At a local maximum, the path is FLAT. The derivative is zero \u2014 you\'re neither going up nor down.',
        draw: function(ctx, w, h, t) {
          var c = sc(w, h, xMin, xMax, SY, { oy: h / 2 + 20 });
          drawAxes(ctx, w, h, { ox: c.ox, oy: c.oy });
          plotC(ctx, f, c, C.accent, 2);
          drawDot(ctx, c.x(-1), c.y(2), 5, C.gold);
          var et = easeInOut(t);
          drawArrow(ctx, c.x(-1) - 25 * et, c.y(2), c.x(-1) + 25 * et, c.y(2), C.gold, 2.5);
          drawLabel(ctx, 'f\'=0 (flat)', c.x(-1), c.y(2) - 15, { size: 11, color: C.gold, bold: true });
          drawLabel(ctx, 'local max', c.x(-1), c.y(2) + 18, { size: 10, color: C.textDim });
        }},
      { text: 'Going downhill, the derivative is NEGATIVE. The function is decreasing.',
        draw: function(ctx, w, h, t) {
          var c = sc(w, h, xMin, xMax, SY, { oy: h / 2 + 20 });
          drawAxes(ctx, w, h, { ox: c.ox, oy: c.oy });
          plotC(ctx, f, c, C.accent, 2);
          var et = easeInOut(t), px = lerp(-0.8, 0.8, et), py = f(px), slope = fp(px);
          var dx = 20, dy = slope * 20 / c.sx * c.sy;
          var len = Math.sqrt(dx * dx + dy * dy) || 1; dx = dx / len * 25; dy = dy / len * 25;
          drawDot(ctx, c.x(px), c.y(py), 5, C.red);
          drawArrow(ctx, c.x(px), c.y(py), c.x(px) + dx, c.y(py) - dy, C.red, 2.5);
          drawLabel(ctx, 'f\' < 0', c.x(px) + 30, c.y(py), { size: 12, color: C.red, bold: true });
        }},
      { text: 'At a local minimum, flat again. Derivative = 0. Then it starts going up...',
        draw: function(ctx, w, h, t) {
          var c = sc(w, h, xMin, xMax, SY, { oy: h / 2 + 20 });
          drawAxes(ctx, w, h, { ox: c.ox, oy: c.oy });
          plotC(ctx, f, c, C.accent, 2);
          drawDot(ctx, c.x(1), c.y(-2), 5, C.green);
          var et = easeInOut(t);
          drawArrow(ctx, c.x(1) - 25 * et, c.y(-2), c.x(1) + 25 * et, c.y(-2), C.green, 2.5);
          drawLabel(ctx, 'f\'=0 (flat)', c.x(1), c.y(-2) - 15, { size: 11, color: C.green, bold: true });
          drawLabel(ctx, 'local min', c.x(1), c.y(-2) + 18, { size: 10, color: C.textDim });
        }},
      { text: 'The derivative f\'(x) tells you the slope at every point. Where f goes up, f\' is positive; where f goes down, f\' is negative.',
        draw: function(ctx, w, h, t) {
          var c = sc(w, h, xMin, xMax, SY, { oy: h / 2 + 20 });
          drawAxes(ctx, w, h, { ox: c.ox, oy: c.oy });
          plotC(ctx, f, c, C.accent, 2);
          var et = easeInOut(t);
          ctx.save(); ctx.globalAlpha = et;
          plotC(ctx, function(x) { return fp(x) * 0.35; }, c, C.green, 2);
          ctx.restore();
          drawLabel(ctx, 'f(x)', w - 35, c.y(f(2.2)) + 5, { size: 11, color: C.accent });
          drawLabel(ctx, 'f\'(x)', w - 35, c.y(fp(2.2) * 0.35) - 8, { size: 11, color: C.green });
        }}
    ]
  };
})());

/* ── 6. Chain Rule as Gears ── */
EXPLAINERS.push({
  veId: 'differentiation-rules-chain', title: 'Chain Rule as Gears', lessonId: 'differentiation-rules',
  frames: [
    { text: 'Think of the chain rule as LINKED GEARS. The outer function f and inner function g are connected.',
      draw: function(ctx, w, h, t) {
        var et = easeInOut(t);
        var cx1 = w / 2 - 65, cy = h / 2, r1 = 50;
        var cx2 = w / 2 + 65, r2 = 35;
        ctx.save(); ctx.strokeStyle = C.accent; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(cx1, cy, r1 * et, 0, 2 * PI); ctx.stroke();
        ctx.strokeStyle = C.gold;
        ctx.beginPath(); ctx.arc(cx2, cy, r2 * et, 0, 2 * PI); ctx.stroke();
        ctx.restore();
        drawLabel(ctx, 'f (outer)', cx1, cy - r1 - 12, { size: 12, color: C.accent, bold: true });
        drawLabel(ctx, 'g (inner)', cx2, cy - r2 - 12, { size: 12, color: C.gold, bold: true });
        for (var i = 0; i < 8; i++) {
          var a = i * PI / 4;
          ctx.save(); ctx.strokeStyle = C.accent; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(cx1 + (r1 - 6) * Math.cos(a) * et, cy + (r1 - 6) * Math.sin(a) * et);
          ctx.lineTo(cx1 + (r1 + 6) * Math.cos(a) * et, cy + (r1 + 6) * Math.sin(a) * et); ctx.stroke();
          ctx.restore();
        }
        for (var i = 0; i < 6; i++) {
          var a = i * PI / 3;
          ctx.save(); ctx.strokeStyle = C.gold; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(cx2 + (r2 - 5) * Math.cos(a) * et, cy + (r2 - 5) * Math.sin(a) * et);
          ctx.lineTo(cx2 + (r2 + 5) * Math.cos(a) * et, cy + (r2 + 5) * Math.sin(a) * et); ctx.stroke();
          ctx.restore();
        }
      }},
    { text: 'When the inner gear (g) turns, the outer gear (f) turns too. But they turn at different rates.',
      draw: function(ctx, w, h, t) {
        var et = easeInOut(t);
        var cx1 = w / 2 - 65, cy = h / 2, r1 = 50;
        var cx2 = w / 2 + 65, r2 = 35;
        var rot1 = et * PI * 0.6, rot2 = -et * PI * 0.6 * (r1 / r2);
        ctx.save(); ctx.strokeStyle = C.accent; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(cx1, cy, r1, 0, 2 * PI); ctx.stroke(); ctx.restore();
        ctx.save(); ctx.strokeStyle = C.gold; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(cx2, cy, r2, 0, 2 * PI); ctx.stroke(); ctx.restore();
        for (var i = 0; i < 8; i++) {
          var a = rot1 + i * PI / 4;
          ctx.save(); ctx.strokeStyle = C.accent; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(cx1 + (r1 - 6) * Math.cos(a), cy + (r1 - 6) * Math.sin(a));
          ctx.lineTo(cx1 + (r1 + 6) * Math.cos(a), cy + (r1 + 6) * Math.sin(a)); ctx.stroke(); ctx.restore();
        }
        for (var i = 0; i < 6; i++) {
          var a = rot2 + i * PI / 3;
          ctx.save(); ctx.strokeStyle = C.gold; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(cx2 + (r2 - 5) * Math.cos(a), cy + (r2 - 5) * Math.sin(a));
          ctx.lineTo(cx2 + (r2 + 5) * Math.cos(a), cy + (r2 + 5) * Math.sin(a)); ctx.stroke(); ctx.restore();
        }
        drawLabel(ctx, 'f (outer)', cx1, cy - r1 - 12, { size: 12, color: C.accent, bold: true });
        drawLabel(ctx, 'g (inner)', cx2, cy - r2 - 12, { size: 12, color: C.gold, bold: true });
      }},
    { text: 'If g changes at rate g\'(x)=3 and f responds at rate f\'=2 per unit of g, the total rate is 2 \u00D7 3 = 6.',
      draw: function(ctx, w, h, t) {
        var et = easeInOut(t);
        var cx1 = w / 2 - 65, cy = h / 2 - 15, r1 = 45, cx2 = w / 2 + 65, r2 = 30;
        ctx.save(); ctx.strokeStyle = C.accent; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(cx1, cy, r1, 0, 2 * PI); ctx.stroke(); ctx.restore();
        ctx.save(); ctx.strokeStyle = C.gold; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(cx2, cy, r2, 0, 2 * PI); ctx.stroke(); ctx.restore();
        drawLabel(ctx, 'rate: f\'=2', cx1, cy, { size: 13, color: C.accent, bold: true });
        drawLabel(ctx, 'rate: g\'=3', cx2, cy, { size: 13, color: C.gold, bold: true });
        if (t > 0.3) {
          ctx.save(); ctx.globalAlpha = easeInOut((t - 0.3) / 0.7);
          drawLabel(ctx, 'Total rate = 2 \u00D7 3 = 6', w / 2, h - 30, { size: 15, color: C.green, bold: true });
          ctx.restore();
        }
      }},
    { text: 'd/dx[f(g(x))] = f\'(g(x)) \u00B7 g\'(x). The rates MULTIPLY. Outer derivative (evaluated at inner) times inner derivative.',
      draw: function(ctx, w, h, t) {
        var et = easeInOut(t);
        drawLabel(ctx, 'd/dx [ f(g(x)) ]', w / 2, 50, { size: 16, color: C.text, bold: true });
        if (t > 0.2) {
          ctx.save(); ctx.globalAlpha = easeInOut((t - 0.2) / 0.4);
          drawLabel(ctx, '=', w / 2, 85, { size: 18, color: C.text });
          ctx.restore();
        }
        if (t > 0.4) {
          ctx.save(); ctx.globalAlpha = easeInOut((t - 0.4) / 0.4);
          drawLabel(ctx, 'f\'(g(x))', w / 2 - 55, 120, { size: 16, color: C.accent, bold: true });
          drawLabel(ctx, '\u00D7', w / 2, 120, { size: 16, color: C.text });
          drawLabel(ctx, 'g\'(x)', w / 2 + 50, 120, { size: 16, color: C.gold, bold: true });
          ctx.restore();
        }
        if (t > 0.7) {
          ctx.save(); ctx.globalAlpha = easeInOut((t - 0.7) / 0.3);
          drawLabel(ctx, 'outer deriv', w / 2 - 55, 148, { size: 10, color: C.accent });
          drawLabel(ctx, 'inner deriv', w / 2 + 50, 148, { size: 10, color: C.gold });
          drawLabel(ctx, 'The rates MULTIPLY', w / 2, 200, { size: 14, color: C.green, bold: true });
          ctx.restore();
        }
      }}
  ]
});

/* ── 7. Why Extrema Have Zero Slope ── */
EXPLAINERS.push((function() {
  function f(x) { return -0.15 * (x - 3) * (x - 3) + 4; }
  var xMin = 0, xMax = 7, SY = 30;
  return {
    veId: 'applications-derivatives', title: 'Why Extrema Have Zero Slope', lessonId: 'applications-derivatives',
    frames: [
      { text: 'Imagine a ball rolling on a curve. Where does it naturally rest? At peaks and valleys.',
        draw: function(ctx, w, h, t) {
          var c = sc(w, h, xMin, xMax, SY);
          drawAxes(ctx, w, h, { ox: c.ox, oy: c.oy });
          plotFn(ctx, function(x) { return -0.08 * (x - 2) * (x - 2) * (x - 5) * (x - 5) * 0.3 + 3; }, 0, 7, c.sx, c.sy, c.ox, c.oy, C.accent, 2.5);
          var et = easeInOut(t), bx = lerp(0.5, 2, et);
          var by = -0.08 * (bx - 2) * (bx - 2) * (bx - 5) * (bx - 5) * 0.3 + 3;
          drawDot(ctx, c.x(bx), c.y(by) - 6, 6, C.gold);
        }},
      { text: 'Going uphill: the slope is positive, the function is increasing.',
        draw: function(ctx, w, h, t) {
          var fn = function(x) { return -0.15 * (x - 3.5) * (x - 3.5) + 4; };
          var c = sc(w, h, xMin, xMax, SY);
          drawAxes(ctx, w, h, { ox: c.ox, oy: c.oy });
          plotFn(ctx, fn, 0, 7, c.sx, c.sy, c.ox, c.oy, C.accent, 2.5);
          var et = easeInOut(t), bx = lerp(1, 3, et), by = fn(bx);
          drawDot(ctx, c.x(bx), c.y(by) - 6, 6, C.gold);
          var slope = -0.3 * (bx - 3.5);
          var dx = 25, dy = -slope * 25;
          drawArrow(ctx, c.x(bx), c.y(by), c.x(bx) + dx, c.y(by) + dy, C.green, 2.5);
          drawLabel(ctx, 'slope > 0', w / 2 + 50, 25, { size: 12, color: C.green, bold: true });
        }},
      { text: 'At the very top: slope is exactly ZERO. The tangent line is perfectly horizontal. This is a critical point.',
        draw: function(ctx, w, h, t) {
          var fn = function(x) { return -0.15 * (x - 3.5) * (x - 3.5) + 4; };
          var c = sc(w, h, xMin, xMax, SY);
          drawAxes(ctx, w, h, { ox: c.ox, oy: c.oy });
          plotFn(ctx, fn, 0, 7, c.sx, c.sy, c.ox, c.oy, C.accent, 2.5);
          drawDot(ctx, c.x(3.5), c.y(4) - 6, 6, C.gold);
          var et = easeInOut(t);
          drawDashed(ctx, c.x(3.5) - 60 * et, c.y(4), c.x(3.5) + 60 * et, c.y(4), C.red, 2);
          drawLabel(ctx, 'f\'(c) = 0', c.x(3.5), c.y(4) - 25, { size: 13, color: C.red, bold: true });
        }},
      { text: 'Both maxima and minima have f\'(c)=0. But f\'=0 doesn\'t guarantee an extremum \u2014 you need the first or second derivative test.',
        draw: function(ctx, w, h, t) {
          var fn = function(x) { return 0.05 * (x - 1.5) * (x - 1.5) * (x - 5.5) * (x - 5.5) * -1 + 3.5 + 0.4 * Math.sin(x * 0.5); };
          var c = sc(w, h, xMin, xMax, SY);
          drawAxes(ctx, w, h, { ox: c.ox, oy: c.oy });
          var fnSimple = function(x) { return -0.12 * (x - 2) * (x - 2) + 4; };
          var fnSimple2 = function(x) { return 0.12 * (x - 5) * (x - 5) + 1.5; };
          plotFn(ctx, function(x) { return x < 3.5 ? fnSimple(x) : fnSimple2(x); }, 0.5, 7, c.sx, c.sy, c.ox, c.oy, C.accent, 2.5);
          var et = easeInOut(t);
          drawDashed(ctx, c.x(2) - 40, c.y(4), c.x(2) + 40, c.y(4), C.red, 1.5);
          drawDashed(ctx, c.x(5) - 40, c.y(1.5), c.x(5) + 40, c.y(1.5), C.green, 1.5);
          drawDot(ctx, c.x(2), c.y(4), 5, C.red);
          drawDot(ctx, c.x(5), c.y(1.5), 5, C.green);
          drawLabel(ctx, 'max', c.x(2), c.y(4) - 15, { size: 11, color: C.red, bold: true });
          drawLabel(ctx, 'min', c.x(5), c.y(1.5) + 18, { size: 11, color: C.green, bold: true });
        }}
    ]
  };
})());

/* ── 8. Area Under a Curve ── */
EXPLAINERS.push((function() {
  function f(x) { return x * x; }
  var xMin = 0, xMax = 2.5, SY = 35;
  function base(ctx, w, h, c) {
    drawAxes(ctx, w, h, { ox: c.ox, oy: c.oy });
    plotC(ctx, f, c, C.accent, 2);
  }
  return {
    veId: 'antiderivatives', title: 'Area Under a Curve', lessonId: 'antiderivatives',
    frames: [
      { text: 'How do we find the area under a curve? We can\'t use length \u00D7 width \u2014 it\'s not a rectangle.',
        draw: function(ctx, w, h, t) {
          var c = sc(w, h, xMin, xMax, SY); base(ctx, w, h, c);
          var et = easeInOut(t);
          ctx.save(); ctx.globalAlpha = et * 0.3;
          fillC(ctx, f, 0, 2, c, 'rgba(108,99,255,0.4)');
          ctx.restore();
          drawLabel(ctx, 'f(x) = x\u00B2', c.x(2) + 15, c.y(f(2)) - 10, { size: 11, color: C.accent });
          drawLabel(ctx, 'Area = ?', w / 2, h / 2, { size: 15, color: C.gold, bold: true });
        }},
      { text: 'Approximate with rectangles! 4 rectangles give a rough estimate...',
        draw: function(ctx, w, h, t) {
          var c = sc(w, h, xMin, xMax, SY); base(ctx, w, h, c);
          var et = easeInOut(t);
          ctx.save(); ctx.globalAlpha = et;
          rectsC(ctx, f, 0, 2, 4, c, 'rgba(108,99,255,0.35)');
          ctx.restore();
          drawLabel(ctx, 'n = 4 rectangles', w / 2, 20, { size: 12, color: C.gold, bold: true });
        }},
      { text: 'More rectangles = better approximation. The thin gaps and overlaps get smaller.',
        draw: function(ctx, w, h, t) {
          var c = sc(w, h, xMin, xMax, SY); base(ctx, w, h, c);
          var n = Math.round(lerp(4, 10, easeInOut(t)));
          rectsC(ctx, f, 0, 2, n, c, 'rgba(108,99,255,0.35)');
          drawLabel(ctx, 'n = ' + n + ' rectangles', w / 2, 20, { size: 12, color: C.gold, bold: true });
        }},
      { text: 'With enough rectangles, the approximation is almost perfect.',
        draw: function(ctx, w, h, t) {
          var c = sc(w, h, xMin, xMax, SY); base(ctx, w, h, c);
          var n = Math.round(lerp(10, 50, easeInOut(t)));
          rectsC(ctx, f, 0, 2, n, c, 'rgba(108,99,255,0.35)');
          drawLabel(ctx, 'n = ' + n + ' rectangles', w / 2, 20, { size: 12, color: C.gold, bold: true });
        }},
      { text: 'In the LIMIT of infinitely many infinitely thin rectangles, we get the exact area: \u222B\u2080\u00B2 x\u00B2 dx = 8/3.',
        draw: function(ctx, w, h, t) {
          var c = sc(w, h, xMin, xMax, SY);
          drawAxes(ctx, w, h, { ox: c.ox, oy: c.oy });
          var et = easeInOut(t);
          ctx.save(); ctx.globalAlpha = et;
          fillC(ctx, f, 0, 2, c, 'rgba(108,99,255,0.4)');
          ctx.restore();
          plotC(ctx, f, c, C.accent, 2);
          drawLabel(ctx, '\u222B x\u00B2 dx = 8/3 \u2248 2.67', w / 2, 22, { size: 14, color: C.green, bold: true });
        }}
    ]
  };
})());

/* ── 9. FTC: The Big Connection ── */
EXPLAINERS.push((function() {
  function f(x) { return Math.sin(x); }
  function F(x) { return 1 - Math.cos(x); }
  return {
    veId: 'ftc', title: 'FTC: The Big Connection', lessonId: 'ftc',
    frames: [
      { text: 'Define F(x) = the area under f from 0 to x. As x moves right, F(x) grows.',
        draw: function(ctx, w, h, t) {
          var c = sc(w, h, 0, 8, 60, { oy: h / 2 });
          drawAxes(ctx, w, h, { ox: c.ox, oy: c.oy });
          plotC(ctx, f, c, C.accent, 2);
          var et = easeInOut(t), xv = lerp(0.2, 5, et);
          fillC(ctx, f, 0, xv, c, 'rgba(108,99,255,0.3)');
          drawDashed(ctx, c.x(xv), c.y(-1.5), c.x(xv), c.y(1.5), C.gold, 1);
          drawLabel(ctx, 'x=' + xv.toFixed(1), c.x(xv), c.oy + 16, { size: 10, color: C.gold });
          drawLabel(ctx, 'f(x) = sin(x)', w - 70, 20, { size: 11, color: C.accent });
        }},
      { text: 'When f(x) is large positive, the area grows FAST. When f(x) is small, the area grows slowly.',
        draw: function(ctx, w, h, t) {
          var c = sc(w, h, 0, 8, 60, { oy: h / 2 });
          drawAxes(ctx, w, h, { ox: c.ox, oy: c.oy });
          plotC(ctx, f, c, C.accent, 2);
          var et = easeInOut(t), xv = lerp(0.2, 6.5, et);
          fillC(ctx, function(x) { return Math.max(0, f(x)); }, 0, Math.min(xv, PI), c, 'rgba(52,211,153,0.3)');
          if (xv > PI) fillC(ctx, function(x) { return Math.min(0, f(x)); }, PI, Math.min(xv, 2 * PI), c, 'rgba(248,113,113,0.3)');
          drawDashed(ctx, c.x(xv), c.y(-1.5), c.x(xv), c.y(1.5), C.gold, 1);
          drawLabel(ctx, 'F(' + xv.toFixed(1) + ') = ' + F(xv).toFixed(2), w / 2, 20, { size: 12, color: C.gold, bold: true });
        }},
      { text: 'F(x) is the accumulation function. It tells you how much area has piled up.',
        draw: function(ctx, w, h, t) {
          var et = easeInOut(t);
          var c1 = sc(w, h, 0, 8, 40, { oy: h / 2 - 30 });
          ctx.save(); ctx.strokeStyle = C.axis; ctx.lineWidth = 0.5;
          ctx.beginPath(); ctx.moveTo(c1.ox, c1.oy); ctx.lineTo(w - 10, c1.oy); ctx.stroke(); ctx.restore();
          plotFn(ctx, f, 0, 8, c1.sx, c1.sy, c1.ox, c1.oy, C.accent, 2);
          drawLabel(ctx, 'f(x)=sin(x)', w - 65, c1.oy - 50, { size: 10, color: C.accent });
          var c2 = sc(w, h, 0, 8, 30, { oy: h - 25, ox: 40 });
          ctx.save(); ctx.strokeStyle = C.axis; ctx.lineWidth = 0.5;
          ctx.beginPath(); ctx.moveTo(c2.ox, c2.oy); ctx.lineTo(w - 10, c2.oy); ctx.stroke(); ctx.restore();
          ctx.save(); ctx.globalAlpha = et;
          plotFn(ctx, F, 0, 8, c2.sx, c2.sy, c2.ox, c2.oy, C.green, 2.5);
          ctx.restore();
          drawLabel(ctx, 'F(x)=1\u2212cos(x)', w - 65, c2.oy - 50, { size: 10, color: C.green });
        }},
      { text: 'KEY insight: the SLOPE of F at any point equals the HEIGHT of f at that point. F\'(x) = f(x).',
        draw: function(ctx, w, h, t) {
          var et = easeInOut(t);
          var c1 = sc(w, h, 0, 8, 40, { oy: h / 2 - 30 });
          ctx.save(); ctx.strokeStyle = C.axis; ctx.lineWidth = 0.5;
          ctx.beginPath(); ctx.moveTo(c1.ox, c1.oy); ctx.lineTo(w - 10, c1.oy); ctx.stroke(); ctx.restore();
          plotFn(ctx, f, 0, 8, c1.sx, c1.sy, c1.ox, c1.oy, C.accent, 2);
          var c2 = sc(w, h, 0, 8, 30, { oy: h - 25, ox: 40 });
          ctx.save(); ctx.strokeStyle = C.axis; ctx.lineWidth = 0.5;
          ctx.beginPath(); ctx.moveTo(c2.ox, c2.oy); ctx.lineTo(w - 10, c2.oy); ctx.stroke(); ctx.restore();
          plotFn(ctx, F, 0, 8, c2.sx, c2.sy, c2.ox, c2.oy, C.green, 2.5);
          var xv = lerp(1, 5, et);
          drawDashed(ctx, c1.x(xv), c1.y(f(xv)), c1.x(xv), c1.oy, C.gold, 1.5);
          drawDot(ctx, c1.x(xv), c1.y(f(xv)), 4, C.gold);
          drawDot(ctx, c2.x(xv), c2.y(F(xv)), 4, C.gold);
          drawLabel(ctx, 'height of f', c1.x(xv) + 30, c1.y(f(xv)), { size: 10, color: C.gold });
          drawLabel(ctx, '= slope of F', c2.x(xv) + 30, c2.y(F(xv)) - 10, { size: 10, color: C.gold });
        }},
      { text: 'This is the Fundamental Theorem of Calculus. Differentiation and integration are INVERSE operations.',
        draw: function(ctx, w, h, t) {
          var et = easeInOut(t);
          drawLabel(ctx, 'Fundamental Theorem of Calculus', w / 2, 35, { size: 15, color: C.gold, bold: true });
          if (t > 0.2) {
            ctx.save(); ctx.globalAlpha = easeInOut((t - 0.2) / 0.4);
            drawLabel(ctx, 'd/dx \u222B\u2090\u02E3 f(t) dt = f(x)', w / 2, 80, { size: 16, color: C.text, bold: true });
            ctx.restore();
          }
          if (t > 0.5) {
            ctx.save(); ctx.globalAlpha = easeInOut((t - 0.5) / 0.3);
            drawLabel(ctx, 'Integration', w / 2 - 70, 140, { size: 13, color: C.accent, bold: true });
            drawArrow(ctx, w / 2 - 20, 140, w / 2 + 20, 140, C.textDim, 2);
            drawArrow(ctx, w / 2 + 20, 155, w / 2 - 20, 155, C.textDim, 2);
            drawLabel(ctx, 'Differentiation', w / 2 + 75, 155, { size: 13, color: C.green, bold: true });
            ctx.restore();
          }
          if (t > 0.7) {
            ctx.save(); ctx.globalAlpha = easeInOut((t - 0.7) / 0.3);
            drawLabel(ctx, 'They UNDO each other!', w / 2, 210, { size: 14, color: C.red, bold: true });
            ctx.restore();
          }
        }}
    ]
  };
})());

/* ── 10. u-Substitution Visually ── */
EXPLAINERS.push({
  veId: 'integration-techniques', title: 'u-Substitution Visually', lessonId: 'integration-techniques',
  frames: [
    { text: 'Some integrals look impossible. But if we change perspective, they simplify.',
      draw: function(ctx, w, h, t) {
        var c = sc(w, h, -0.5, 3.5, 50, { oy: h / 2 + 10 });
        drawAxes(ctx, w, h, { ox: c.ox, oy: c.oy });
        var et = easeInOut(t);
        plotFn(ctx, function(x) { return 2 * x * Math.cos(x * x); }, 0, lerp(0.5, 3, et), c.sx, c.sy, c.ox, c.oy, C.accent, 2.5);
        drawLabel(ctx, '2x\u00B7cos(x\u00B2)', w / 2 + 40, 25, { size: 13, color: C.accent, bold: true });
        drawLabel(ctx, 'Looks complicated!', w / 2, h - 20, { size: 12, color: C.red });
      }},
    { text: 'Let u = x\u00B2. This \u201Crelabels\u201D the x-axis. The complicated shape transforms into something simpler.',
      draw: function(ctx, w, h, t) {
        var et = easeInOut(t);
        drawLabel(ctx, 'x-axis:', 30, 30, { size: 11, color: C.textDim, align: 'left' });
        ctx.save(); ctx.strokeStyle = C.accent; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(70, 30); ctx.lineTo(350, 30); ctx.stroke(); ctx.restore();
        for (var i = 0; i <= 3; i++) drawLabel(ctx, String(i), 70 + i * 93, 45, { size: 10, color: C.accent });
        drawLabel(ctx, 'u = x\u00B2:', 30, 100, { size: 11, color: C.gold, align: 'left' });
        ctx.save(); ctx.globalAlpha = et; ctx.strokeStyle = C.gold; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(70, 100); ctx.lineTo(350, 100); ctx.stroke(); ctx.restore();
        var uVals = [0, 1, 4, 9];
        for (var i = 0; i < uVals.length; i++) {
          ctx.save(); ctx.globalAlpha = et;
          drawLabel(ctx, String(uVals[i]), 70 + i * 93, 115, { size: 10, color: C.gold });
          drawDashed(ctx, 70 + i * 93, 35, 70 + i * 93, 95, C.textDim, 0.5);
          ctx.restore();
        }
        if (t > 0.5) {
          ctx.save(); ctx.globalAlpha = easeInOut((t - 0.5) / 0.5);
          drawLabel(ctx, '2x\u00B7cos(x\u00B2) dx  \u2192  cos(u) du', w / 2, 170, { size: 14, color: C.green, bold: true });
          ctx.restore();
        }
      }},
    { text: 'Under the substitution, 2x\u00B7cos(x\u00B2)dx becomes cos(u)du \u2014 much easier!',
      draw: function(ctx, w, h, t) {
        var c = sc(w, h, -0.5, 10, 55, { oy: h / 2 + 10 });
        drawAxes(ctx, w, h, { ox: c.ox, oy: c.oy });
        var et = easeInOut(t);
        plotFn(ctx, function(u) { return Math.cos(u); }, 0, lerp(0.5, 9.5, et), c.sx, c.sy, c.ox, c.oy, C.green, 2.5);
        drawLabel(ctx, 'cos(u)', w / 2 + 40, 20, { size: 14, color: C.green, bold: true });
        drawLabel(ctx, 'u', w - 15, c.oy + 14, { size: 11, color: C.textDim });
        drawLabel(ctx, 'Much simpler!', w / 2, h - 15, { size: 12, color: C.gold });
      }},
    { text: 'Integrate the simple version: sin(u)+C. Then substitute back: sin(x\u00B2)+C.',
      draw: function(ctx, w, h, t) {
        var et = easeInOut(t);
        drawLabel(ctx, '\u222B cos(u) du', w / 2, 40, { size: 15, color: C.green, bold: true });
        if (t > 0.2) {
          ctx.save(); ctx.globalAlpha = easeInOut((t - 0.2) / 0.3);
          drawLabel(ctx, '= sin(u) + C', w / 2, 80, { size: 15, color: C.text, bold: true });
          ctx.restore();
        }
        if (t > 0.5) {
          ctx.save(); ctx.globalAlpha = easeInOut((t - 0.5) / 0.3);
          drawLabel(ctx, 'Substitute back: u = x\u00B2', w / 2, 130, { size: 13, color: C.gold });
          drawLabel(ctx, '= sin(x\u00B2) + C', w / 2, 170, { size: 16, color: C.accent, bold: true });
          ctx.restore();
        }
        if (t > 0.8) {
          ctx.save(); ctx.globalAlpha = easeInOut((t - 0.8) / 0.2);
          drawLabel(ctx, 'The substitution "untwisted" the integral', w / 2, 220, { size: 12, color: C.secondary });
          ctx.restore();
        }
      }}
  ]
});

/* ── 11. Partial Sums Converging ── */
EXPLAINERS.push((function() {
  var vals = [1, 0.5, 0.25, 0.125, 0.0625, 0.03125, 0.015625, 0.0078125];
  var colors = [C.accent, C.secondary, C.gold, C.green, C.purple, C.red, '#66ccff', '#ff99cc'];
  function drawTower(ctx, w, h, nBlocks, t) {
    var barW = 80, baseX = w / 2 - barW / 2, oy = h - 30;
    var scale = 90;
    var et = easeInOut(t);
    var total = 0;
    for (var i = 0; i < nBlocks; i++) {
      var bh = vals[i] * scale;
      ctx.fillStyle = colors[i % colors.length];
      ctx.globalAlpha = i < nBlocks - 1 ? 1 : et;
      ctx.fillRect(baseX, oy - (total + bh * (i < nBlocks - 1 ? 1 : et)) * 1, barW, bh * (i < nBlocks - 1 ? 1 : et));
      ctx.strokeStyle = C.axis; ctx.lineWidth = 0.5;
      ctx.strokeRect(baseX, oy - (total + bh * (i < nBlocks - 1 ? 1 : et)) * 1, barW, bh * (i < nBlocks - 1 ? 1 : et));
      total += vals[i] * (i < nBlocks - 1 ? 1 : et);
      ctx.globalAlpha = 1;
    }
    drawDashed(ctx, 40, oy - 2 * scale, w - 20, oy - 2 * scale, C.red, 1);
    drawLabel(ctx, '2', 30, oy - 2 * scale, { size: 11, color: C.red });
    drawLabel(ctx, 'Sum = ' + total.toFixed(3), w / 2, 18, { size: 13, color: C.gold, bold: true });
    ctx.strokeStyle = C.axis; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(baseX - 10, oy); ctx.lineTo(baseX + barW + 10, oy); ctx.stroke();
  }
  return {
    veId: 'sequences-series', title: 'Partial Sums Converging', lessonId: 'sequences-series',
    frames: [
      { text: 'Consider summing 1 + 1/2 + 1/4 + 1/8 + \u2026 Each term is half the previous.',
        draw: function(ctx, w, h, t) { drawTower(ctx, w, h, 1, t); }},
      { text: 'After 2 terms: total = 1.5. The tower is growing...',
        draw: function(ctx, w, h, t) { drawTower(ctx, w, h, 2, t); }},
      { text: 'After 4 terms: total = 1.875. Getting closer to something...',
        draw: function(ctx, w, h, t) { drawTower(ctx, w, h, 4, t); }},
      { text: 'The blocks keep getting smaller. The tower approaches height 2 but never quite reaches it.',
        draw: function(ctx, w, h, t) { drawTower(ctx, w, h, 8, t); }},
      { text: 'In the limit, the infinite sum EQUALS exactly 2. Geometric series with r=1/2 converges to 1/(1\u22121/2) = 2.',
        draw: function(ctx, w, h, t) {
          var et = easeInOut(t);
          var barW = 80, baseX = w / 2 - barW / 2, oy = h - 30, scale = 90;
          ctx.fillStyle = 'rgba(108,99,255,0.4)';
          ctx.fillRect(baseX, oy - 2 * scale * et, barW, 2 * scale * et);
          drawDashed(ctx, 40, oy - 2 * scale, w - 20, oy - 2 * scale, C.red, 1);
          drawLabel(ctx, '2', 30, oy - 2 * scale, { size: 11, color: C.red });
          drawLabel(ctx, 'Sum = 2 (exactly!)', w / 2, 18, { size: 14, color: C.green, bold: true });
          ctx.strokeStyle = C.axis; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(baseX - 10, oy); ctx.lineTo(baseX + barW + 10, oy); ctx.stroke();
        }}
    ]
  };
})());

/* ── 12. Taylor Polynomials Hugging ── */
EXPLAINERS.push((function() {
  function T1(x) { return x; }
  function T3(x) { return x - x * x * x / 6; }
  function T5(x) { return T3(x) + Math.pow(x, 5) / 120; }
  function T7(x) { return T5(x) - Math.pow(x, 7) / 5040; }
  function T9(x) { return T7(x) + Math.pow(x, 9) / 362880; }
  var xMin = -7, xMax = 7, SY = 55;
  function base(ctx, w, h, c) {
    ctx.save(); ctx.strokeStyle = C.axis; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(c.ox, c.oy); ctx.lineTo(w - 10, c.oy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(c.x(0), 10); ctx.lineTo(c.x(0), h - 10); ctx.stroke();
    ctx.restore();
    plotC(ctx, Math.sin, c, C.accent, 2.5);
  }
  return {
    veId: 'taylor-series', title: 'Taylor Polynomials Hugging', lessonId: 'taylor-series',
    frames: [
      { text: 'The first Taylor polynomial for sin(x) is just T\u2081 = x. It matches at x=0 but diverges quickly.',
        draw: function(ctx, w, h, t) {
          var c = sc(w, h, xMin, xMax, SY, { oy: h / 2 }); base(ctx, w, h, c);
          ctx.save(); ctx.globalAlpha = easeInOut(t);
          plotC(ctx, T1, c, C.red, 1.5); ctx.restore();
          drawLabel(ctx, 'sin(x)', w - 45, c.y(Math.sin(6)) - 10, { size: 10, color: C.accent });
          drawLabel(ctx, 'T\u2081 = x', w - 45, 25, { size: 10, color: C.red });
        }},
      { text: 'Add the x\u00B3 term: T\u2083 = x \u2212 x\u00B3/6. Now it hugs sin(x) much further from the origin.',
        draw: function(ctx, w, h, t) {
          var c = sc(w, h, xMin, xMax, SY, { oy: h / 2 }); base(ctx, w, h, c);
          plotC(ctx, T1, c, 'rgba(248,113,113,0.3)', 1);
          ctx.save(); ctx.globalAlpha = easeInOut(t);
          plotC(ctx, T3, c, C.gold, 2); ctx.restore();
          drawLabel(ctx, 'T\u2083', w - 40, 25, { size: 11, color: C.gold, bold: true });
        }},
      { text: 'Add x\u2075/120: T\u2085 follows sin(x) even further. Each term extends the "hug" region.',
        draw: function(ctx, w, h, t) {
          var c = sc(w, h, xMin, xMax, SY, { oy: h / 2 }); base(ctx, w, h, c);
          plotC(ctx, T3, c, 'rgba(240,184,50,0.3)', 1);
          ctx.save(); ctx.globalAlpha = easeInOut(t);
          plotC(ctx, T5, c, C.green, 2); ctx.restore();
          drawLabel(ctx, 'T\u2085', w - 40, 25, { size: 11, color: C.green, bold: true });
        }},
      { text: 'T\u2087 and T\u2089 hug even further. The more terms, the wider the region of accuracy.',
        draw: function(ctx, w, h, t) {
          var c = sc(w, h, xMin, xMax, SY, { oy: h / 2 }); base(ctx, w, h, c);
          plotC(ctx, T5, c, 'rgba(52,211,153,0.25)', 1);
          var et = easeInOut(t);
          plotC(ctx, T7, c, C.secondary, 1.5);
          ctx.save(); ctx.globalAlpha = et;
          plotC(ctx, T9, c, C.purple, 2); ctx.restore();
          drawLabel(ctx, 'T\u2087', w - 55, 15, { size: 10, color: C.secondary });
          drawLabel(ctx, 'T\u2089', w - 35, 15, { size: 10, color: C.purple });
        }},
      { text: 'With infinitely many terms, the Taylor series IS the function (within its radius of convergence). You\'ve built sin(x) from pure polynomials.',
        draw: function(ctx, w, h, t) {
          var c = sc(w, h, xMin, xMax, SY, { oy: h / 2 }); base(ctx, w, h, c);
          var et = easeInOut(t);
          var polys = [T1, T3, T5, T7, T9];
          var cols = [C.red, C.gold, C.green, C.secondary, C.purple];
          for (var i = 0; i < polys.length; i++) {
            ctx.save(); ctx.globalAlpha = 0.2 + et * 0.15;
            plotC(ctx, polys[i], c, cols[i], 1); ctx.restore();
          }
          drawLabel(ctx, 'sin(x) = x \u2212 x\u00B3/3! + x\u2075/5! \u2212 \u2026', w / 2, h - 15, { size: 12, color: C.text, bold: true });
        }}
    ]
  };
})());

/* ── 13. Tracing a Parametric Curve ── */
EXPLAINERS.push({
  veId: 'parametric', title: 'Tracing a Parametric Curve', lessonId: 'parametric',
  frames: [
    { text: 'In parametric equations, a parameter t controls both x and y independently. Think of t as TIME.',
      draw: function(ctx, w, h, t) {
        var cx = w / 2, cy = h / 2 - 20, r = 70;
        var et = easeInOut(t);
        ctx.save(); ctx.strokeStyle = C.axis; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(cx - 120, cy); ctx.lineTo(cx + 120, cy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, cy - 100); ctx.lineTo(cx, cy + 100); ctx.stroke();
        ctx.restore();
        drawLabel(ctx, 'x', cx + 125, cy + 12, { size: 10, color: C.textDim });
        drawLabel(ctx, 'y', cx - 12, cy - 95, { size: 10, color: C.textDim });
        ctx.save(); ctx.strokeStyle = C.gold; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(50, h - 25); ctx.lineTo(w - 50, h - 25); ctx.stroke(); ctx.restore();
        drawLabel(ctx, 't = 0', 50, h - 12, { size: 9, color: C.gold });
        drawLabel(ctx, 't = 2\u03C0', w - 50, h - 12, { size: 9, color: C.gold });
        var tPos = lerp(50, w - 50, et);
        drawDot(ctx, tPos, h - 25, 4, C.gold);
        drawLabel(ctx, 'time \u2192', w / 2, h - 12, { size: 10, color: C.gold });
      }},
    { text: 'x = cos(t), y = sin(t). As time advances, the dot traces out a circle.',
      draw: function(ctx, w, h, t) {
        var cx = w / 2, cy = h / 2 - 15, r = 70;
        ctx.save(); ctx.strokeStyle = C.axis; ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(cx - 120, cy); ctx.lineTo(cx + 120, cy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, cy - 100); ctx.lineTo(cx, cy + 100); ctx.stroke();
        ctx.restore();
        var et = easeInOut(t), maxA = et * 2 * PI;
        ctx.save(); ctx.strokeStyle = C.accent; ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (var a = 0; a <= maxA; a += 0.03) {
          var px = cx + r * Math.cos(a), py = cy - r * Math.sin(a);
          if (a === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke(); ctx.restore();
        var dx = cx + r * Math.cos(maxA), dy = cy - r * Math.sin(maxA);
        drawDot(ctx, dx, dy, 5, C.gold);
        ctx.save(); ctx.strokeStyle = C.gold; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(50, h - 20); ctx.lineTo(50 + (w - 100) * et, h - 20); ctx.stroke(); ctx.restore();
        drawDot(ctx, 50 + (w - 100) * et, h - 20, 3, C.gold);
      }},
    { text: 'Each coordinate follows its own pattern in time. Together, they create the path.',
      draw: function(ctx, w, h, t) {
        var cx = w / 2, cy = h / 2, r = 55;
        var et = easeInOut(t);
        ctx.save(); ctx.strokeStyle = C.grid; ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * PI); ctx.stroke(); ctx.restore();
        ctx.save(); ctx.strokeStyle = C.accent; ctx.lineWidth = 2;
        ctx.beginPath();
        for (var a = 0; a <= 2 * PI; a += 0.03) {
          var px = cx + r * Math.cos(a), py = cy - r * Math.sin(a);
          if (a === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke(); ctx.restore();
        var ang = et * 2 * PI;
        var dx = cx + r * Math.cos(ang), dy = cy - r * Math.sin(ang);
        drawDot(ctx, dx, dy, 5, C.gold);
        drawDashed(ctx, dx, dy, dx, cy, C.secondary, 0.8);
        drawDashed(ctx, dx, dy, cx, dy, C.red, 0.8);
        drawLabel(ctx, 'x=cos(t)', dx, cy + 14, { size: 9, color: C.secondary });
        drawLabel(ctx, 'y=sin(t)', cx - 30, dy, { size: 9, color: C.red });
      }},
    { text: 'Parametric equations describe WHERE you are at each moment. They can create curves that aren\'t functions \u2014 like this circle.',
      draw: function(ctx, w, h, t) {
        var cx = w / 2, cy = h / 2, r = 70;
        ctx.save(); ctx.strokeStyle = C.accent; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * PI); ctx.stroke(); ctx.restore();
        var et = easeInOut(t);
        for (var i = 0; i < 8; i++) {
          var a = i * PI / 4, px = cx + r * Math.cos(a), py = cy - r * Math.sin(a);
          drawDot(ctx, px, py, 3, C.gold);
        }
        drawLabel(ctx, 'x(t) = cos(t)', w / 2, 20, { size: 12, color: C.secondary, bold: true });
        drawLabel(ctx, 'y(t) = sin(t)', w / 2, 38, { size: 12, color: C.red, bold: true });
        drawLabel(ctx, 'Not a function \u2014 passes vertical line test!', w / 2, h - 15, { size: 11, color: C.gold });
      }}
  ]
});

/* ── 14. Polar Coordinates ── */
EXPLAINERS.push({
  veId: 'polar', title: 'Polar Coordinates', lessonId: 'polar',
  frames: [
    { text: 'In polar coordinates, we describe points by DISTANCE from origin (r) and ANGLE (\u03B8), not x and y.',
      draw: function(ctx, w, h, t) {
        var cx = w / 2, cy = h / 2, scale = 45;
        var et = easeInOut(t);
        for (var i = 1; i <= 3; i++) {
          ctx.save(); ctx.strokeStyle = C.grid; ctx.lineWidth = 0.5; ctx.globalAlpha = et;
          ctx.beginPath(); ctx.arc(cx, cy, i * scale, 0, 2 * PI); ctx.stroke(); ctx.restore();
          drawLabel(ctx, String(i), cx + i * scale + 5, cy - 5, { size: 9, color: C.textDim });
        }
        for (var a = 0; a < PI; a += PI / 6) {
          ctx.save(); ctx.strokeStyle = C.grid; ctx.lineWidth = 0.3; ctx.globalAlpha = et;
          ctx.beginPath(); ctx.moveTo(cx - 140 * Math.cos(a), cy + 140 * Math.sin(a));
          ctx.lineTo(cx + 140 * Math.cos(a), cy - 140 * Math.sin(a)); ctx.stroke(); ctx.restore();
        }
        var pr = 2 * scale, pa = PI / 4;
        drawArrow(ctx, cx, cy, cx + pr * Math.cos(pa) * et, cy - pr * Math.sin(pa) * et, C.gold, 2);
        if (t > 0.4) {
          ctx.save(); ctx.strokeStyle = C.secondary; ctx.lineWidth = 1.5; ctx.globalAlpha = easeInOut((t - 0.4) / 0.4);
          ctx.beginPath(); ctx.arc(cx, cy, 20, 0, -pa, true); ctx.stroke(); ctx.restore();
          drawLabel(ctx, '\u03B8', cx + 28, cy - 12, { size: 11, color: C.secondary });
          drawLabel(ctx, 'r', cx + pr * 0.5 * Math.cos(pa) + 8, cy - pr * 0.5 * Math.sin(pa), { size: 11, color: C.gold });
        }
      }},
    { text: 'As the angle sweeps, the arm\'s length r changes. This traces a cardioid: r = 1 + cos(\u03B8).',
      draw: function(ctx, w, h, t) {
        var cx = w / 2, cy = h / 2, scale = 50;
        var et = easeInOut(t), maxTh = et * 2 * PI;
        for (var i = 1; i <= 3; i++) {
          ctx.save(); ctx.strokeStyle = C.grid; ctx.lineWidth = 0.3;
          ctx.beginPath(); ctx.arc(cx, cy, i * scale * 0.65, 0, 2 * PI); ctx.stroke(); ctx.restore();
        }
        ctx.save(); ctx.strokeStyle = C.accent; ctx.lineWidth = 2.5; ctx.beginPath();
        for (var th = 0; th <= maxTh; th += 0.02) {
          var r = (1 + Math.cos(th)) * scale * 0.65;
          var px = cx + r * Math.cos(th), py = cy - r * Math.sin(th);
          if (th === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke(); ctx.restore();
        if (maxTh > 0.1) {
          var endR = (1 + Math.cos(maxTh)) * scale * 0.65;
          var ex = cx + endR * Math.cos(maxTh), ey = cy - endR * Math.sin(maxTh);
          ctx.save(); ctx.strokeStyle = C.gold; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(ex, ey); ctx.stroke(); ctx.restore();
          drawDot(ctx, ex, ey, 4, C.gold);
        }
        drawLabel(ctx, 'r = 1 + cos(\u03B8)', w / 2, h - 15, { size: 12, color: C.accent, bold: true });
      }},
    { text: 'r = cos(2\u03B8) creates a 4-petal rose. The arm extends and retracts as it sweeps.',
      draw: function(ctx, w, h, t) {
        var cx = w / 2, cy = h / 2, scale = 80;
        var et = easeInOut(t), maxTh = et * 2 * PI;
        ctx.save(); ctx.strokeStyle = C.green; ctx.lineWidth = 2.5; ctx.beginPath();
        var started = false;
        for (var th = 0; th <= maxTh; th += 0.015) {
          var r = Math.cos(2 * th) * scale;
          if (r < 0) { started = false; continue; }
          var px = cx + r * Math.cos(th), py = cy - r * Math.sin(th);
          if (!started) { ctx.moveTo(px, py); started = true; } else ctx.lineTo(px, py);
        }
        ctx.stroke(); ctx.restore();
        drawLabel(ctx, 'r = cos(2\u03B8)', w / 2, h - 15, { size: 12, color: C.green, bold: true });
      }},
    { text: 'Polar coordinates are natural for curves with rotational symmetry. Area = (1/2) \u222B r\u00B2 d\u03B8.',
      draw: function(ctx, w, h, t) {
        var cx = w / 2, cy = h / 2 - 10, scale = 50;
        var et = easeInOut(t);
        ctx.save(); ctx.strokeStyle = C.accent; ctx.lineWidth = 2; ctx.beginPath();
        for (var th = 0; th <= 2 * PI; th += 0.02) {
          var r = (1 + Math.cos(th)) * scale * 0.6;
          var px = cx + r * Math.cos(th), py = cy - r * Math.sin(th);
          if (th === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke(); ctx.restore();
        ctx.save(); ctx.globalAlpha = et * 0.3; ctx.fillStyle = C.accent; ctx.beginPath();
        for (var th = 0; th <= 2 * PI; th += 0.02) {
          var r = (1 + Math.cos(th)) * scale * 0.6;
          var px = cx + r * Math.cos(th), py = cy - r * Math.sin(th);
          if (th === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath(); ctx.fill(); ctx.restore();
        drawLabel(ctx, 'Area = (1/2) \u222B r\u00B2 d\u03B8', w / 2, h - 15, { size: 13, color: C.gold, bold: true });
      }}
  ]
});

/* ── 15. Partial Derivatives as Slices ── */
EXPLAINERS.push((function() {
  var sX = 28, sZ = 22;
  function zFn(x, y) { return 3 * Math.exp(-0.25 * ((x - 2.5) * (x - 2.5) + (y - 2.5) * (y - 2.5))); }
  function projX(x, y) { return 100 + (x - 0) * sX - (y - 0) * sX * 0.35; }
  function projY(x, y, z) { return 200 - z * sZ - (y - 0) * sX * 0.35; }
  function drawMesh(ctx, highlight) {
    for (var yv = 0; yv <= 5; yv += 0.5) {
      var isHL = highlight === 'y' && Math.abs(yv - 2.5) < 0.26;
      ctx.save(); ctx.strokeStyle = isHL ? C.gold : C.grid; ctx.lineWidth = isHL ? 2.5 : 0.6; ctx.beginPath();
      for (var xv = 0; xv <= 5; xv += 0.2) {
        var z = zFn(xv, yv), px = projX(xv, yv), py = projY(xv, yv, z);
        if (xv === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke(); ctx.restore();
    }
    for (var xv = 0; xv <= 5; xv += 0.5) {
      var isHL = highlight === 'x' && Math.abs(xv - 2.5) < 0.26;
      ctx.save(); ctx.strokeStyle = isHL ? C.secondary : C.grid; ctx.lineWidth = isHL ? 2.5 : 0.6; ctx.beginPath();
      for (var yv = 0; yv <= 5; yv += 0.2) {
        var z = zFn(xv, yv), px = projX(xv, yv), py = projY(xv, yv, z);
        if (yv === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke(); ctx.restore();
    }
  }
  return {
    veId: 'partial-derivatives', title: 'Partial Derivatives as Slices', lessonId: 'partial-derivatives',
    frames: [
      { text: 'A function f(x,y) creates a SURFACE in 3D space. How do we measure its slope?',
        draw: function(ctx, w, h, t) {
          ctx.save(); ctx.globalAlpha = easeInOut(t); drawMesh(ctx, null); ctx.restore();
          drawLabel(ctx, 'f(x,y)', 30, 20, { size: 13, color: C.accent, bold: true });
        }},
      { text: 'Fix y and vary x \u2014 you get a 2D curve. Its slope is the partial derivative \u2202f/\u2202x.',
        draw: function(ctx, w, h, t) {
          drawMesh(ctx, 'y');
          drawLabel(ctx, '\u2202f/\u2202x', w - 60, 25, { size: 14, color: C.gold, bold: true });
          drawLabel(ctx, 'y = fixed', w - 60, 45, { size: 10, color: C.gold });
        }},
      { text: 'Now fix x and vary y \u2014 a different slice. Its slope is \u2202f/\u2202y.',
        draw: function(ctx, w, h, t) {
          drawMesh(ctx, 'x');
          drawLabel(ctx, '\u2202f/\u2202y', w - 60, 25, { size: 14, color: C.secondary, bold: true });
          drawLabel(ctx, 'x = fixed', w - 60, 45, { size: 10, color: C.secondary });
        }},
      { text: 'At any point, there are TWO slopes \u2014 one in x, one in y. These are the partial derivatives.',
        draw: function(ctx, w, h, t) {
          drawMesh(ctx, null);
          var et = easeInOut(t);
          var cx = 2.5, cy = 2.5, z = zFn(cx, cy);
          var px = projX(cx, cy), py = projY(cx, cy, z);
          drawDot(ctx, px, py, 5, C.red);
          ctx.save(); ctx.globalAlpha = et;
          drawArrow(ctx, px, py, px + 30, py - 5, C.gold, 2.5);
          drawArrow(ctx, px, py, px - 12, py - 20, C.secondary, 2.5);
          drawLabel(ctx, '\u2202f/\u2202x', px + 35, py - 8, { size: 11, color: C.gold });
          drawLabel(ctx, '\u2202f/\u2202y', px - 25, py - 28, { size: 11, color: C.secondary });
          ctx.restore();
        }}
    ]
  };
})());

/* ── 16. Gradient Points Uphill ── */
EXPLAINERS.push((function() {
  function drawContours(ctx, w, h) {
    var cx = w / 2, cy = h / 2;
    var radii = [20, 40, 60, 80, 100];
    for (var i = 0; i < radii.length; i++) {
      ctx.save(); ctx.strokeStyle = 'rgba(108,99,255,' + (0.15 + i * 0.08) + ')'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.ellipse(cx, cy, radii[i] * 1.2, radii[i] * 0.8, -0.3, 0, 2 * PI); ctx.stroke(); ctx.restore();
    }
  }
  return {
    veId: 'partial-derivatives-gradient', title: 'Gradient Points Uphill', lessonId: 'partial-derivatives',
    frames: [
      { text: 'Contour lines connect points of equal height \u2014 like a topographic map.',
        draw: function(ctx, w, h, t) {
          ctx.save(); ctx.globalAlpha = easeInOut(t); drawContours(ctx, w, h); ctx.restore();
          drawLabel(ctx, 'Level curves', w / 2, 18, { size: 13, color: C.accent, bold: true });
          var cx = w / 2, cy = h / 2;
          drawLabel(ctx, 'high', cx, cy - 5, { size: 10, color: C.gold });
          drawLabel(ctx, 'low', cx + 90, cy + 60, { size: 10, color: C.textDim });
        }},
      { text: 'The gradient vector is always PERPENDICULAR to the contour lines, pointing toward higher ground.',
        draw: function(ctx, w, h, t) {
          drawContours(ctx, w, h);
          var cx = w / 2, cy = h / 2;
          var et = easeInOut(t);
          var pts = [
            { x: cx + 70, y: cy - 10, dx: -22, dy: 4 },
            { x: cx - 60, y: cy + 20, dx: 20, dy: -8 },
            { x: cx + 20, y: cy + 55, dx: -6, dy: -20 },
            { x: cx - 30, y: cy - 50, dx: 10, dy: 18 },
            { x: cx + 80, y: cy + 40, dx: -24, dy: -12 },
            { x: cx - 75, y: cy - 20, dx: 22, dy: 6 }
          ];
          for (var i = 0; i < pts.length; i++) {
            var p = pts[i];
            ctx.save(); ctx.globalAlpha = et;
            drawArrow(ctx, p.x, p.y, p.x + p.dx * et, p.y + p.dy * et, C.green, 2);
            ctx.restore();
          }
          drawLabel(ctx, '\u2207f', cx + 100, cy - 50, { size: 14, color: C.green, bold: true });
        }},
      { text: 'Following the gradient takes you uphill as steeply as possible. This is gradient ascent \u2014 the basis of optimization.',
        draw: function(ctx, w, h, t) {
          drawContours(ctx, w, h);
          var cx = w / 2, cy = h / 2;
          var et = easeInOut(t);
          var path = [];
          var px = cx + 95, py = cy + 55;
          for (var s = 0; s < 30; s++) {
            path.push({ x: px, y: py });
            var ddx = (cx - px) * 0.08, ddy = (cy - py) * 0.08;
            px += ddx; py += ddy;
          }
          var nDraw = Math.floor(et * path.length);
          ctx.save(); ctx.strokeStyle = C.gold; ctx.lineWidth = 2.5; ctx.beginPath();
          for (var i = 0; i <= nDraw && i < path.length; i++) {
            if (i === 0) ctx.moveTo(path[i].x, path[i].y); else ctx.lineTo(path[i].x, path[i].y);
          }
          ctx.stroke(); ctx.restore();
          if (nDraw > 0 && nDraw < path.length) drawDot(ctx, path[nDraw].x, path[nDraw].y, 5, C.gold);
          drawLabel(ctx, 'Gradient ascent', w / 2, h - 15, { size: 12, color: C.gold, bold: true });
        }},
      { text: '\u2207f = (\u2202f/\u2202x, \u2202f/\u2202y). Its magnitude = HOW steep; its direction = WHICH WAY is steepest.',
        draw: function(ctx, w, h, t) {
          var et = easeInOut(t);
          drawContours(ctx, w, h);
          drawLabel(ctx, '\u2207f = (\u2202f/\u2202x, \u2202f/\u2202y)', w / 2, 25, { size: 14, color: C.green, bold: true });
          if (t > 0.3) {
            ctx.save(); ctx.globalAlpha = easeInOut((t - 0.3) / 0.4);
            drawLabel(ctx, '|\u2207f| = steepness', w / 2, h - 35, { size: 12, color: C.gold });
            drawLabel(ctx, 'direction = steepest ascent', w / 2, h - 15, { size: 12, color: C.secondary });
            ctx.restore();
          }
        }}
    ]
  };
})());

/* ── 17. Double Integral as Volume ── */
EXPLAINERS.push({
  veId: 'multiple-integrals', title: 'Double Integral as Volume', lessonId: 'multiple-integrals',
  frames: [
    { text: 'A double integral computes the VOLUME under a surface and above a region R.',
      draw: function(ctx, w, h, t) {
        var et = easeInOut(t);
        var bx = 80, by = h - 60, bw = 200, bh = 80;
        ctx.save(); ctx.fillStyle = 'rgba(108,99,255,0.15)'; ctx.globalAlpha = et;
        ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + bw, by);
        ctx.lineTo(bx + bw - 40, by - bh); ctx.lineTo(bx - 40, by - bh); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = C.accent; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
        drawLabel(ctx, 'Region R', bx + bw / 2 - 20, by - bh / 2 + 5, { size: 12, color: C.accent });
        drawLabel(ctx, 'xy-plane', bx + bw / 2, by + 18, { size: 10, color: C.textDim });
      }},
    { text: 'Just like single integrals use rectangles, double integrals use COLUMNS.',
      draw: function(ctx, w, h, t) {
        var et = easeInOut(t), bx = 80, by = h - 50;
        var cols = 3;
        for (var ix = 0; ix < cols; ix++) {
          for (var iy = 0; iy < cols; iy++) {
            var x0 = bx + ix * 55, y0 = by - iy * 25;
            var colH = (30 + 20 * Math.sin(ix + iy)) * et;
            ctx.save(); ctx.fillStyle = 'rgba(108,99,255,' + (0.2 + iy * 0.1) + ')';
            ctx.fillRect(x0 - 15, y0 - colH - iy * 8, 40, colH); ctx.strokeStyle = C.accent; ctx.lineWidth = 1;
            ctx.strokeRect(x0 - 15, y0 - colH - iy * 8, 40, colH); ctx.restore();
          }
        }
        drawLabel(ctx, '3 \u00D7 3 columns', w / 2, 18, { size: 12, color: C.gold, bold: true });
      }},
    { text: 'Thinner columns = better approximation. The sum of all column volumes approaches the exact volume.',
      draw: function(ctx, w, h, t) {
        var et = easeInOut(t), bx = 70, by = h - 45;
        var cols = 6;
        var cw = 22, ch = 12;
        for (var ix = 0; ix < cols; ix++) {
          for (var iy = 0; iy < cols; iy++) {
            var x0 = bx + ix * (cw + 2), y0 = by - iy * ch;
            var colH = (15 + 12 * Math.sin(ix * 0.8 + iy * 0.5)) * et;
            ctx.save(); ctx.fillStyle = 'rgba(108,99,255,' + (0.15 + iy * 0.05) + ')';
            ctx.fillRect(x0, y0 - colH - iy * 4, cw, colH);
            ctx.strokeStyle = C.grid; ctx.lineWidth = 0.3;
            ctx.strokeRect(x0, y0 - colH - iy * 4, cw, colH); ctx.restore();
          }
        }
        drawLabel(ctx, 'More columns \u2192 better fit', w / 2, 18, { size: 12, color: C.gold, bold: true });
      }},
    { text: 'In the limit: \u222C f(x,y) dA gives the exact volume. We compute it as two nested single integrals.',
      draw: function(ctx, w, h, t) {
        var et = easeInOut(t);
        ctx.save(); ctx.fillStyle = 'rgba(108,99,255,0.25)'; ctx.globalAlpha = et;
        ctx.beginPath(); ctx.moveTo(80, h - 50); ctx.lineTo(280, h - 50);
        ctx.lineTo(260, h - 130); ctx.bezierCurveTo(220, h - 180, 130, h - 160, 60, h - 130);
        ctx.closePath(); ctx.fill(); ctx.strokeStyle = C.accent; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
        drawLabel(ctx, '\u222C f(x,y) dA', w / 2, 30, { size: 16, color: C.green, bold: true });
        if (t > 0.5) {
          ctx.save(); ctx.globalAlpha = easeInOut((t - 0.5) / 0.5);
          drawLabel(ctx, '= \u222B( \u222B f(x,y) dy ) dx', w / 2, 60, { size: 13, color: C.text });
          drawLabel(ctx, 'Iterated integration', w / 2, h - 10, { size: 12, color: C.gold });
          ctx.restore();
        }
      }}
  ]
});

/* ── 18. Matrix as Transformation ── */
EXPLAINERS.push((function() {
  var S = 45;
  function drawGrid(ctx, cx, cy) {
    ctx.save(); ctx.strokeStyle = C.grid; ctx.lineWidth = 0.3;
    for (var i = -3; i <= 3; i++) {
      ctx.beginPath(); ctx.moveTo(cx + i * S, cy - 3 * S); ctx.lineTo(cx + i * S, cy + 3 * S); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - 3 * S, cy + i * S); ctx.lineTo(cx + 3 * S, cy + i * S); ctx.stroke();
    }
    ctx.strokeStyle = C.axis; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(cx - 3 * S, cy); ctx.lineTo(cx + 3 * S, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy - 3 * S); ctx.lineTo(cx, cy + 3 * S); ctx.stroke();
    ctx.restore();
  }
  function drawQuad(ctx, cx, cy, pts, color) {
    ctx.save(); ctx.fillStyle = color || 'rgba(108,99,255,0.15)'; ctx.strokeStyle = C.accent; ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (var i = 0; i < pts.length; i++) {
      var px = cx + pts[i][0] * S, py = cy - pts[i][1] * S;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  }
  function matMul(m, v) { return [m[0] * v[0] + m[1] * v[1], m[2] * v[0] + m[3] * v[1]]; }
  var unitSq = [[0, 0], [1, 0], [1, 1], [0, 1]];
  return {
    veId: 'matrices-systems', title: 'Matrix as Transformation', lessonId: 'matrices-systems',
    frames: [
      { text: 'Think of a 2\u00D72 matrix as a TRANSFORMATION of space. Start with the unit square.',
        draw: function(ctx, w, h, t) {
          var cx = w / 2 - 20, cy = h / 2 + 10;
          drawGrid(ctx, cx, cy); drawQuad(ctx, cx, cy, unitSq, 'rgba(108,99,255,0.2)');
          var et = easeInOut(t);
          drawArrow(ctx, cx, cy, cx + S * et, cy, C.green, 2.5);
          drawArrow(ctx, cx, cy, cx, cy - S * et, C.gold, 2.5);
          if (et > 0.5) {
            drawLabel(ctx, 'e\u2081', cx + S + 8, cy + 4, { size: 11, color: C.green });
            drawLabel(ctx, 'e\u2082', cx - 14, cy - S - 6, { size: 11, color: C.gold });
          }
        }},
      { text: 'This matrix stretches space horizontally by 2. Every point\'s x-coordinate doubles.',
        draw: function(ctx, w, h, t) {
          var cx = w / 2 - 30, cy = h / 2 + 10;
          var et = easeInOut(t), mat = [lerp(1, 2, et), 0, 0, 1];
          drawGrid(ctx, cx, cy);
          var pts = unitSq.map(function(v) { return matMul(mat, v); });
          drawQuad(ctx, cx, cy, pts, 'rgba(108,99,255,0.2)');
          drawArrow(ctx, cx, cy, cx + pts[1][0] * S, cy - pts[1][1] * S, C.green, 2);
          drawArrow(ctx, cx, cy, cx + pts[3][0] * S, cy - pts[3][1] * S, C.gold, 2);
          drawLabel(ctx, '[[2,0],[0,1]]', w / 2 + 40, 20, { size: 11, color: C.text, bold: true });
        }},
      { text: 'A shear tilts the square into a parallelogram. The columns of the matrix tell you where e\u2081 and e\u2082 land.',
        draw: function(ctx, w, h, t) {
          var cx = w / 2 - 20, cy = h / 2 + 10;
          var et = easeInOut(t), mat = [1, lerp(0, 1, et), 0, 1];
          drawGrid(ctx, cx, cy);
          var pts = unitSq.map(function(v) { return matMul(mat, v); });
          drawQuad(ctx, cx, cy, pts, 'rgba(108,99,255,0.2)');
          drawArrow(ctx, cx, cy, cx + pts[1][0] * S, cy - pts[1][1] * S, C.green, 2);
          drawArrow(ctx, cx, cy, cx + pts[3][0] * S, cy - pts[3][1] * S, C.gold, 2);
          drawLabel(ctx, '[[1,1],[0,1]]', w / 2 + 40, 20, { size: 11, color: C.text, bold: true });
        }},
      { text: 'A rotation matrix spins every vector. The key insight: a matrix IS where the basis vectors go.',
        draw: function(ctx, w, h, t) {
          var cx = w / 2 - 20, cy = h / 2 + 10;
          var et = easeInOut(t), angle = et * PI / 4;
          var mat = [Math.cos(angle), -Math.sin(angle), Math.sin(angle), Math.cos(angle)];
          drawGrid(ctx, cx, cy);
          var pts = unitSq.map(function(v) { return matMul(mat, v); });
          drawQuad(ctx, cx, cy, pts, 'rgba(108,99,255,0.2)');
          drawArrow(ctx, cx, cy, cx + pts[1][0] * S, cy - pts[1][1] * S, C.green, 2);
          drawArrow(ctx, cx, cy, cx + pts[3][0] * S, cy - pts[3][1] * S, C.gold, 2);
          drawLabel(ctx, 'Rotation by ' + Math.round(angle * 180 / PI) + '\u00B0', w / 2 + 30, 20, { size: 11, color: C.text, bold: true });
        }}
    ]
  };
})());

/* ── 19. Eigenvectors Don't Rotate ── */
EXPLAINERS.push((function() {
  var S = 40;
  var mat = [2, 1, 1, 2];
  function matMul(m, v) { return [m[0] * v[0] + m[1] * v[1], m[2] * v[0] + m[3] * v[1]]; }
  var vecs = [[1, 0], [0, 1], [1, 1], [1, -1], [0.7, 0.3], [-0.5, 0.8]];
  return {
    veId: 'eigenvalues', title: 'Eigenvectors Don\'t Rotate', lessonId: 'eigenvalues',
    frames: [
      { text: 'When a matrix transforms space, most vectors change BOTH direction and length.',
        draw: function(ctx, w, h, t) {
          var cx = w / 2, cy = h / 2;
          var et = easeInOut(t);
          var cols = [C.accent, C.gold, C.green, C.secondary, C.purple, C.red];
          for (var i = 0; i < vecs.length; i++) {
            var v = vecs[i], len = Math.sqrt(v[0] * v[0] + v[1] * v[1]);
            var nx = v[0] / len * 2, ny = v[1] / len * 2;
            drawArrow(ctx, cx, cy, cx + nx * S * et, cy - ny * S * et, cols[i], 2);
          }
          drawLabel(ctx, 'Several vectors', w / 2, 18, { size: 12, color: C.text });
        }},
      { text: 'After applying the matrix, most arrows rotated AND stretched. But one special vector only stretched!',
        draw: function(ctx, w, h, t) {
          var cx = w / 2, cy = h / 2;
          var et = easeInOut(t);
          var cols = [C.accent, C.gold, C.green, C.secondary, C.purple, C.red];
          for (var i = 0; i < vecs.length; i++) {
            var v = vecs[i], len = Math.sqrt(v[0] * v[0] + v[1] * v[1]);
            var nx = v[0] / len * 2, ny = v[1] / len * 2;
            var orig = [nx, ny];
            var tformed = matMul(mat, orig);
            var fx = lerp(orig[0], tformed[0], et), fy = lerp(orig[1], tformed[1], et);
            drawArrow(ctx, cx, cy, cx + fx * S, cy - fy * S, cols[i], 2);
          }
          if (t > 0.6) {
            ctx.save(); ctx.globalAlpha = (t - 0.6) / 0.4;
            drawLabel(ctx, '\u2190 this one only stretched!', cx + 3 * S + 10, cy - 3 * S + 5, { size: 10, color: C.green, bold: true });
            ctx.restore();
          }
        }},
      { text: 'Av = \u03BBv. The matrix just multiplies this vector by \u03BB (the eigenvalue). Direction unchanged.',
        draw: function(ctx, w, h, t) {
          var cx = w / 2, cy = h / 2;
          var et = easeInOut(t);
          drawArrow(ctx, cx, cy, cx + 2 * S, cy - 2 * S, 'rgba(52,211,153,0.3)', 1.5);
          var scale = lerp(1, 1.5, et);
          drawArrow(ctx, cx, cy, cx + 2 * S * scale, cy - 2 * S * scale, C.green, 3);
          drawLabel(ctx, 'v', cx + 2 * S + 10, cy - 2 * S, { size: 12, color: C.green });
          drawLabel(ctx, '\u03BBv', cx + 2 * S * scale + 10, cy - 2 * S * scale - 5, { size: 12, color: C.gold, bold: true });
          drawArrow(ctx, cx, cy, cx + 2 * S, cy + 2 * S, 'rgba(0,210,255,0.3)', 1.5);
          var scale2 = lerp(1, 0.5, et);
          drawArrow(ctx, cx, cy, cx + 2 * S * scale2, cy + 2 * S * scale2, C.secondary, 3);
          drawLabel(ctx, '\u03BB\u2081 = 3', 80, 40, { size: 13, color: C.green, bold: true });
          drawLabel(ctx, '\u03BB\u2082 = 1', 80, 60, { size: 13, color: C.secondary, bold: true });
        }},
      { text: 'Finding eigenvectors: solve det(A \u2212 \u03BBI) = 0. These special directions reveal the matrix\'s true nature.',
        draw: function(ctx, w, h, t) {
          var et = easeInOut(t);
          drawLabel(ctx, 'Av = \u03BBv', w / 2, 45, { size: 18, color: C.text, bold: true });
          if (t > 0.2) {
            ctx.save(); ctx.globalAlpha = easeInOut((t - 0.2) / 0.3);
            drawLabel(ctx, '(A \u2212 \u03BBI)v = 0', w / 2, 85, { size: 15, color: C.accent });
            ctx.restore();
          }
          if (t > 0.5) {
            ctx.save(); ctx.globalAlpha = easeInOut((t - 0.5) / 0.3);
            drawLabel(ctx, 'det(A \u2212 \u03BBI) = 0', w / 2, 125, { size: 15, color: C.gold, bold: true });
            ctx.restore();
          }
          if (t > 0.7) {
            ctx.save(); ctx.globalAlpha = easeInOut((t - 0.7) / 0.3);
            drawLabel(ctx, 'Eigenvectors = axes of the transformation', w / 2, 190, { size: 12, color: C.green });
            ctx.restore();
          }
        }}
    ]
  };
})());

/* ── 20. Determinant as Area ── */
EXPLAINERS.push((function() {
  var S = 50;
  function matMul(m, v) { return [m[0] * v[0] + m[1] * v[1], m[2] * v[0] + m[3] * v[1]]; }
  var unitSq = [[0, 0], [1, 0], [1, 1], [0, 1]];
  function drawPgram(ctx, cx, cy, pts, color, label) {
    ctx.save(); ctx.fillStyle = color || 'rgba(108,99,255,0.2)';
    ctx.beginPath();
    for (var i = 0; i < pts.length; i++) {
      var px = cx + pts[i][0] * S, py = cy - pts[i][1] * S;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = C.accent; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
    if (label) drawLabel(ctx, label, cx + (pts[0][0] + pts[2][0]) / 2 * S, cy - (pts[0][1] + pts[2][1]) / 2 * S, { size: 12, color: C.gold, bold: true });
  }
  return {
    veId: 'matrices-systems-determinant', title: 'Determinant as Area', lessonId: 'matrices-systems',
    frames: [
      { text: 'The determinant measures how a matrix SCALES area. Start with the unit square (area 1).',
        draw: function(ctx, w, h, t) {
          var cx = w / 2 - 30, cy = h / 2 + 20;
          ctx.save(); ctx.strokeStyle = C.axis; ctx.lineWidth = 0.5;
          ctx.beginPath(); ctx.moveTo(cx - 2 * S, cy); ctx.lineTo(cx + 3 * S, cy); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(cx, cy + 2 * S); ctx.lineTo(cx, cy - 3 * S); ctx.stroke();
          ctx.restore();
          var et = easeInOut(t);
          drawPgram(ctx, cx, cy, unitSq, 'rgba(108,99,255,' + (0.2 * et) + ')', 'Area = 1');
        }},
      { text: 'After transformation, the square becomes a parallelogram. Its area IS the determinant.',
        draw: function(ctx, w, h, t) {
          var cx = w / 2 - 30, cy = h / 2 + 20;
          ctx.save(); ctx.strokeStyle = C.axis; ctx.lineWidth = 0.5;
          ctx.beginPath(); ctx.moveTo(cx - 2 * S, cy); ctx.lineTo(cx + 4 * S, cy); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(cx, cy + 2 * S); ctx.lineTo(cx, cy - 3 * S); ctx.stroke();
          ctx.restore();
          var et = easeInOut(t);
          var mat = [lerp(1, 2, et), lerp(0, 0.5, et), lerp(0, 0.5, et), lerp(1, 1.5, et)];
          var pts = unitSq.map(function(v) { return matMul(mat, v); });
          var det = mat[0] * mat[3] - mat[1] * mat[2];
          drawPgram(ctx, cx, cy, pts, 'rgba(108,99,255,0.25)', 'Area = det \u2248 ' + det.toFixed(1));
        }},
      { text: 'If det = 0, the parallelogram collapses to a LINE. Area = 0. The matrix is not invertible.',
        draw: function(ctx, w, h, t) {
          var cx = w / 2 - 30, cy = h / 2 + 20;
          ctx.save(); ctx.strokeStyle = C.axis; ctx.lineWidth = 0.5;
          ctx.beginPath(); ctx.moveTo(cx - 2 * S, cy); ctx.lineTo(cx + 4 * S, cy); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(cx, cy + 2 * S); ctx.lineTo(cx, cy - 3 * S); ctx.stroke();
          ctx.restore();
          var et = easeInOut(t);
          var mat = [lerp(2, 1, et), lerp(0.5, 2, et), lerp(0.5, 0.5, et), lerp(1.5, 1, et)];
          var pts = unitSq.map(function(v) { return matMul(mat, v); });
          drawPgram(ctx, cx, cy, pts, 'rgba(248,113,113,0.2)');
          var det = mat[0] * mat[3] - mat[1] * mat[2];
          drawLabel(ctx, 'det \u2248 ' + det.toFixed(2), w / 2 + 40, 25, { size: 13, color: C.red, bold: true });
          if (Math.abs(det) < 0.2) drawLabel(ctx, 'COLLAPSED! Not invertible.', w / 2, h - 15, { size: 12, color: C.red, bold: true });
        }},
      { text: 'A negative determinant means the transformation FLIPS orientation (like a mirror). |det| is the area factor.',
        draw: function(ctx, w, h, t) {
          var cx = w / 2 - 30, cy = h / 2 + 20;
          ctx.save(); ctx.strokeStyle = C.axis; ctx.lineWidth = 0.5;
          ctx.beginPath(); ctx.moveTo(cx - 3 * S, cy); ctx.lineTo(cx + 3 * S, cy); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(cx, cy + 2 * S); ctx.lineTo(cx, cy - 3 * S); ctx.stroke();
          ctx.restore();
          var et = easeInOut(t);
          var mat = [lerp(1, -1, et), 0, 0, 1];
          var pts = unitSq.map(function(v) { return matMul(mat, v); });
          drawPgram(ctx, cx, cy, pts, 'rgba(167,139,250,0.25)');
          var det = mat[0] * mat[3] - mat[1] * mat[2];
          drawLabel(ctx, 'det = ' + det.toFixed(1), w / 2 + 40, 25, { size: 13, color: C.purple, bold: true });
          if (det < 0) drawLabel(ctx, 'Orientation FLIPPED', w / 2, h - 15, { size: 12, color: C.purple, bold: true });
        }}
    ]
  };
})());

/* ── 21. Slope Field Flow ── */
EXPLAINERS.push((function() {
  function dydx(x, y) { return x - y; }
  function drawField(ctx, w, h) {
    var ox = 40, oy = h - 30, sx = 50, sy = 50;
    ctx.save(); ctx.strokeStyle = C.axis; ctx.lineWidth = 1;
    for (var xi = -0.5; xi <= 5.5; xi += 0.5) {
      for (var yi = -1; yi <= 4; yi += 0.5) {
        var s = dydx(xi, yi);
        var ang = Math.atan(s);
        var px = ox + (xi + 0.5) * sx, py = oy - (yi + 1) * sy;
        var dl = 8;
        ctx.beginPath();
        ctx.moveTo(px - dl * Math.cos(ang), py + dl * Math.sin(ang));
        ctx.lineTo(px + dl * Math.cos(ang), py - dl * Math.sin(ang));
        ctx.stroke();
      }
    }
    ctx.restore();
  }
  function eulerSolve(x0, y0, steps) {
    var pts = [{ x: x0, y: y0 }], dt = 0.05;
    for (var i = 0; i < steps; i++) {
      var x = pts[pts.length - 1].x, y = pts[pts.length - 1].y;
      pts.push({ x: x + dt, y: y + dydx(x, y) * dt });
    }
    return pts;
  }
  return {
    veId: 'first-order-odes', title: 'Slope Field Flow', lessonId: 'first-order-odes',
    frames: [
      { text: 'A slope field shows dy/dx at every point. Each tiny segment points in the direction a solution would go.',
        draw: function(ctx, w, h, t) {
          ctx.save(); ctx.globalAlpha = easeInOut(t); drawField(ctx, w, h); ctx.restore();
          drawLabel(ctx, 'y\' = x \u2212 y', w / 2, 15, { size: 13, color: C.accent, bold: true });
        }},
      { text: 'Drop a particle at a starting point. Which way does it flow?',
        draw: function(ctx, w, h, t) {
          drawField(ctx, w, h);
          var ox = 40, oy = h - 30, sx = 50, sy = 50;
          var et = easeInOut(t);
          drawDot(ctx, ox + 0.5 * sx, oy - 3 * sy, 6 * et, C.gold);
          drawLabel(ctx, '(0, 2)', ox + 0.5 * sx + 15, oy - 3 * sy, { size: 10, color: C.gold });
        }},
      { text: 'The particle follows the arrows, tracing a SOLUTION CURVE. This is what solving the ODE means.',
        draw: function(ctx, w, h, t) {
          drawField(ctx, w, h);
          var ox = 40, oy = h - 30, sx = 50, sy = 50;
          var pts = eulerSolve(0, 2, 100);
          var et = easeInOut(t), nDraw = Math.floor(et * pts.length);
          ctx.save(); ctx.strokeStyle = C.gold; ctx.lineWidth = 2.5; ctx.beginPath();
          for (var i = 0; i < nDraw; i++) {
            var px = ox + (pts[i].x + 0.5) * sx, py = oy - (pts[i].y + 1) * sy;
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          }
          ctx.stroke(); ctx.restore();
          if (nDraw > 0 && nDraw < pts.length) {
            var last = pts[nDraw - 1];
            drawDot(ctx, ox + (last.x + 0.5) * sx, oy - (last.y + 1) * sy, 4, C.gold);
          }
        }},
      { text: 'Different starting points give different curves. The slope field is like a river \u2014 initial conditions pick your stream.',
        draw: function(ctx, w, h, t) {
          drawField(ctx, w, h);
          var ox = 40, oy = h - 30, sx = 50, sy = 50;
          var starts = [[0, 0], [0, 2], [0, 4], [0, -0.5]];
          var cols = [C.gold, C.secondary, C.green, C.red];
          var et = easeInOut(t);
          for (var s = 0; s < starts.length; s++) {
            var pts = eulerSolve(starts[s][0], starts[s][1], 100);
            var nDraw = Math.floor(et * pts.length);
            ctx.save(); ctx.strokeStyle = cols[s]; ctx.lineWidth = 2; ctx.beginPath();
            for (var i = 0; i < nDraw; i++) {
              var px = ox + (pts[i].x + 0.5) * sx, py = oy - (pts[i].y + 1) * sy;
              if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
            }
            ctx.stroke(); ctx.restore();
          }
        }}
    ]
  };
})());

/* ── 22. Exponential Growth/Decay ── */
EXPLAINERS.push({
  veId: 'first-order-odes-exp-growth', title: 'Exponential Growth/Decay', lessonId: 'first-order-odes',
  frames: [
    { text: 'y\' = ky means: the rate of change is proportional to the current value. More rabbits = more baby rabbits.',
      draw: function(ctx, w, h, t) {
        var et = easeInOut(t);
        var barW = 50, barX = w / 2 - barW / 2, oy = h - 40;
        var barH = 60 * et;
        ctx.fillStyle = C.accent; ctx.fillRect(barX, oy - barH, barW, barH);
        drawLabel(ctx, 'Population', w / 2, oy + 16, { size: 11, color: C.textDim });
        drawArrow(ctx, barX + barW + 15, oy - barH / 2, barX + barW + 15, oy - barH / 2 - 30 * et, C.green, 2);
        drawLabel(ctx, 'growth rate', barX + barW + 50, oy - barH / 2 - 15, { size: 10, color: C.green });
        drawLabel(ctx, 'y\' = ky', w / 2, 20, { size: 14, color: C.text, bold: true });
      }},
    { text: 'As the population grows, the growth RATE increases too. This creates a feedback loop.',
      draw: function(ctx, w, h, t) {
        var et = easeInOut(t);
        var barW = 50, barX = w / 2 - barW / 2, oy = h - 40;
        var barH = lerp(60, 140, et);
        ctx.fillStyle = C.accent; ctx.fillRect(barX, oy - barH, barW, barH);
        var arrowH = barH * 0.4;
        drawArrow(ctx, barX + barW + 15, oy - barH / 2, barX + barW + 15, oy - barH / 2 - arrowH, C.green, 2.5);
        drawLabel(ctx, 'Bigger \u2192 Faster growth!', w / 2, 20, { size: 13, color: C.gold, bold: true });
      }},
    { text: 'The result is exponential growth: y = Ce^(kt). Each doubling happens in the same time.',
      draw: function(ctx, w, h, t) {
        var c = sc(w, h, 0, 5, 28);
        drawAxes(ctx, w, h, { ox: c.ox, oy: c.oy });
        var et = easeInOut(t);
        plotFn(ctx, function(x) { return 0.5 * Math.exp(0.6 * x); }, 0, lerp(0.5, 5, et), c.sx, c.sy, c.ox, c.oy, C.green, 2.5);
        drawLabel(ctx, 'y = Ce^(kt)', w / 2 + 60, 25, { size: 13, color: C.green, bold: true });
        drawLabel(ctx, 'k > 0: growth', w / 2, h - 10, { size: 11, color: C.green });
      }},
    { text: 'With k < 0, you get exponential DECAY. Radioactive atoms: fewer atoms = fewer decays per second.',
      draw: function(ctx, w, h, t) {
        var c = sc(w, h, 0, 5, 28);
        drawAxes(ctx, w, h, { ox: c.ox, oy: c.oy });
        var et = easeInOut(t);
        plotFn(ctx, function(x) { return 5 * Math.exp(-0.5 * x); }, 0, lerp(0.5, 5, et), c.sx, c.sy, c.ox, c.oy, C.red, 2.5);
        drawDashed(ctx, c.ox, c.y(2.5), w - 10, c.y(2.5), C.textDim, 0.5);
        drawLabel(ctx, 'half-life', c.x(1.4) + 20, c.y(2.5) - 10, { size: 10, color: C.textDim });
        drawLabel(ctx, 'y = Ce^(\u2212kt)', w / 2 + 60, 25, { size: 13, color: C.red, bold: true });
        drawLabel(ctx, 'k < 0: decay', w / 2, h - 10, { size: 11, color: C.red });
      }}
  ]
});

/* ── 23. Completeness: Filling the Gaps ── */
EXPLAINERS.push({
  veId: 'real-numbers', title: 'Completeness: Filling the Gaps', lessonId: 'real-numbers',
  frames: [
    { text: 'The rational numbers (fractions) seem to fill the number line. But there are GAPS.',
      draw: function(ctx, w, h, t) {
        var et = easeInOut(t), cy = h / 2, lx = 30, rx = w - 30;
        ctx.save(); ctx.strokeStyle = C.axis; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(lx, cy); ctx.lineTo(rx, cy); ctx.stroke(); ctx.restore();
        var rats = [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 0.33, 0.67, 1.33, 1.67, 0.1, 0.9, 1.1, 1.9];
        var scale = (rx - lx) / 2.5, ox = lx + 0.25 * scale;
        for (var i = 0; i < Math.floor(rats.length * et); i++) {
          var px = ox + rats[i] * scale;
          drawDot(ctx, px, cy, 2.5, C.accent);
        }
        for (var i = 0; i <= 2; i++) {
          var px = ox + i * scale;
          drawLabel(ctx, String(i), px, cy + 18, { size: 10, color: C.textDim });
        }
        drawLabel(ctx, 'Rationals: Q', w / 2, 30, { size: 13, color: C.accent, bold: true });
      }},
    { text: 'Zoom in near 1.414\u2026 No rational number lives exactly here. \u221A2 is MISSING from Q.',
      draw: function(ctx, w, h, t) {
        var et = easeInOut(t), cy = h / 2, lx = 40, rx = w - 40;
        var centerVal = Math.SQRT2, spread = lerp(1.5, 0.05, et);
        var lo = centerVal - spread, hi = centerVal + spread;
        var scale = (rx - lx) / (hi - lo);
        ctx.save(); ctx.strokeStyle = C.axis; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(lx, cy); ctx.lineTo(rx, cy); ctx.stroke(); ctx.restore();
        var rats = [];
        for (var d = 1; d <= 50; d++) {
          for (var n = Math.ceil(lo * d); n <= Math.floor(hi * d); n++) {
            var v = n / d;
            if (v > lo && v < hi) rats.push(v);
          }
        }
        for (var i = 0; i < rats.length; i++) {
          var px = lx + (rats[i] - lo) * scale;
          drawDot(ctx, px, cy, 1.5, C.accent);
        }
        var sqrtPx = lx + (Math.SQRT2 - lo) * scale;
        drawDashed(ctx, sqrtPx, cy - 30, sqrtPx, cy + 30, C.red, 1.5);
        drawLabel(ctx, '\u221A2 \u2248 1.4142\u2026', sqrtPx, cy - 40, { size: 11, color: C.red, bold: true });
        drawLabel(ctx, 'No rational here!', sqrtPx, cy + 45, { size: 10, color: C.red });
      }},
    { text: 'The real numbers FILL every gap. Completeness: every bounded set has a least upper bound IN \u211D.',
      draw: function(ctx, w, h, t) {
        var et = easeInOut(t), cy = h / 2, lx = 30, rx = w - 30;
        ctx.save(); ctx.strokeStyle = C.axis; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(lx, cy); ctx.lineTo(rx, cy); ctx.stroke(); ctx.restore();
        ctx.save(); ctx.strokeStyle = C.green; ctx.lineWidth = 4 * et; ctx.globalAlpha = et;
        ctx.beginPath(); ctx.moveTo(lx + 20, cy); ctx.lineTo(rx - 20, cy); ctx.stroke(); ctx.restore();
        drawLabel(ctx, '\u211D: the real line (complete)', w / 2, 30, { size: 13, color: C.green, bold: true });
        var scale = (rx - lx - 40) / 2.5, ox = lx + 20 + 0.25 * scale;
        for (var i = 0; i <= 2; i++) {
          drawLabel(ctx, String(i), ox + i * scale, cy + 18, { size: 10, color: C.textDim });
        }
        drawDot(ctx, ox + Math.SQRT2 * scale, cy, 4, C.gold);
        drawLabel(ctx, '\u221A2', ox + Math.SQRT2 * scale, cy - 15, { size: 10, color: C.gold, bold: true });
      }},
    { text: 'This seemingly simple property is what makes calculus WORK. Without completeness, limits, continuity, and the IVT all break down.',
      draw: function(ctx, w, h, t) {
        var et = easeInOut(t);
        drawLabel(ctx, 'Completeness Axiom', w / 2, 40, { size: 15, color: C.gold, bold: true });
        if (t > 0.2) {
          ctx.save(); ctx.globalAlpha = easeInOut((t - 0.2) / 0.3);
          drawLabel(ctx, 'Every bounded subset of \u211D', w / 2, 80, { size: 13, color: C.text });
          drawLabel(ctx, 'has a least upper bound in \u211D', w / 2, 100, { size: 13, color: C.text });
          ctx.restore();
        }
        if (t > 0.5) {
          ctx.save(); ctx.globalAlpha = easeInOut((t - 0.5) / 0.3);
          drawLabel(ctx, 'Without this:', w / 2, 145, { size: 12, color: C.red });
          var items = ['Limits fail', 'Continuity breaks', 'IVT gone', 'No calculus'];
          for (var i = 0; i < items.length; i++) {
            drawLabel(ctx, '\u2717 ' + items[i], w / 2, 170 + i * 20, { size: 11, color: C.red });
          }
          ctx.restore();
        }
      }}
  ]
});

/* ── 24. Symmetries of a Square ── */
EXPLAINERS.push((function() {
  var labels = ['1', '2', '3', '4'];
  var cols = [C.accent, C.gold, C.green, C.red];
  function drawSq(ctx, cx, cy, s, cornerMap) {
    var corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
    var pts = corners.map(function(c) { return { x: cx + c[0] * s / 2, y: cy + c[1] * s / 2 }; });
    ctx.save(); ctx.strokeStyle = C.axis; ctx.lineWidth = 2;
    ctx.beginPath();
    for (var i = 0; i < 4; i++) { if (i === 0) ctx.moveTo(pts[i].x, pts[i].y); else ctx.lineTo(pts[i].x, pts[i].y); }
    ctx.closePath(); ctx.stroke(); ctx.restore();
    for (var i = 0; i < 4; i++) {
      var ci = cornerMap ? cornerMap[i] : i;
      drawDot(ctx, pts[i].x, pts[i].y, 7, cols[ci]);
      drawLabel(ctx, labels[ci], pts[i].x, pts[i].y - 16, { size: 13, color: cols[ci], bold: true });
    }
  }
  function rotatedCorners(angle) {
    var corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
    var result = [];
    for (var i = 0; i < 4; i++) {
      var x = corners[i][0], y = corners[i][1];
      var rx = x * Math.cos(angle) - y * Math.sin(angle);
      var ry = x * Math.sin(angle) + y * Math.cos(angle);
      result.push([rx, ry]);
    }
    return result;
  }
  return {
    veId: 'groups', title: 'Symmetries of a Square', lessonId: 'groups',
    frames: [
      { text: 'A group describes SYMMETRIES. Consider all the ways to move a square so it looks the same.',
        draw: function(ctx, w, h, t) {
          drawSq(ctx, w / 2, h / 2, 120);
          drawLabel(ctx, 'Labeled corners', w / 2, 30, { size: 13, color: C.text });
        }},
      { text: 'Rotation by 90\u00B0: corner 1 goes to 2\'s spot, 2 to 3\'s, etc. This is one symmetry.',
        draw: function(ctx, w, h, t) {
          var cx = w / 2, cy = h / 2, s = 120;
          var et = easeInOut(t), angle = et * PI / 2;
          var pts = rotatedCorners(angle);
          ctx.save(); ctx.strokeStyle = C.axis; ctx.lineWidth = 2; ctx.beginPath();
          for (var i = 0; i < 4; i++) {
            var px = cx + pts[i][0] * s / 2, py = cy + pts[i][1] * s / 2;
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          }
          ctx.closePath(); ctx.stroke(); ctx.restore();
          for (var i = 0; i < 4; i++) {
            var px = cx + pts[i][0] * s / 2, py = cy + pts[i][1] * s / 2;
            drawDot(ctx, px, py, 7, cols[i]);
            drawLabel(ctx, labels[i], px + (pts[i][0] > 0 ? 14 : -14), py + (pts[i][1] > 0 ? 14 : -14), { size: 13, color: cols[i], bold: true });
          }
          drawLabel(ctx, 'Rotate 90\u00B0', w / 2, 20, { size: 13, color: C.gold, bold: true });
        }},
      { text: 'A horizontal flip is another symmetry. There are 8 total: 4 rotations and 4 reflections.',
        draw: function(ctx, w, h, t) {
          var cx = w / 2, cy = h / 2, s = 120;
          var et = easeInOut(t);
          var corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
          var flipped = corners.map(function(c) { return [lerp(c[0], -c[0], et), c[1]]; });
          ctx.save(); ctx.strokeStyle = C.axis; ctx.lineWidth = 2; ctx.beginPath();
          for (var i = 0; i < 4; i++) {
            var px = cx + flipped[i][0] * s / 2, py = cy + flipped[i][1] * s / 2;
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          }
          ctx.closePath(); ctx.stroke(); ctx.restore();
          for (var i = 0; i < 4; i++) {
            var px = cx + flipped[i][0] * s / 2, py = cy + flipped[i][1] * s / 2;
            drawDot(ctx, px, py, 7, cols[i]);
          }
          drawDashed(ctx, cx, cy - s / 2 - 15, cx, cy + s / 2 + 15, C.secondary, 1.5);
          drawLabel(ctx, 'Horizontal flip', w / 2, 20, { size: 13, color: C.secondary, bold: true });
          drawLabel(ctx, '8 symmetries total: 4 rotations + 4 reflections', w / 2, h - 15, { size: 11, color: C.textDim });
        }},
      { text: 'Combining symmetries gives another symmetry. This COMPOSITION is the group operation. Together they form D\u2084.',
        draw: function(ctx, w, h, t) {
          var et = easeInOut(t);
          drawLabel(ctx, 'rotate 90\u00B0', 70, h / 2 - 10, { size: 12, color: C.gold, bold: true });
          drawLabel(ctx, '+', w / 2 - 35, h / 2 - 10, { size: 16, color: C.text });
          drawLabel(ctx, 'flip', w / 2 + 15, h / 2 - 10, { size: 12, color: C.secondary, bold: true });
          drawLabel(ctx, '=', w / 2 + 55, h / 2 - 10, { size: 16, color: C.text });
          if (t > 0.3) {
            ctx.save(); ctx.globalAlpha = easeInOut((t - 0.3) / 0.4);
            drawLabel(ctx, 'diagonal flip', w / 2 + 120, h / 2 - 10, { size: 12, color: C.green, bold: true });
            ctx.restore();
          }
          drawLabel(ctx, 'Dihedral Group D\u2084', w / 2, 30, { size: 15, color: C.accent, bold: true });
          if (t > 0.6) {
            ctx.save(); ctx.globalAlpha = easeInOut((t - 0.6) / 0.4);
            drawLabel(ctx, 'Closure \u2022 Associativity \u2022 Identity \u2022 Inverses', w / 2, h - 20, { size: 11, color: C.textDim });
            ctx.restore();
          }
        }}
    ]
  };
})());

/* ── 25. CLT: Order from Chaos ── */
EXPLAINERS.push((function() {
  function drawHist(ctx, w, h, values, maxVal, color, label) {
    var ox = 40, oy = h - 35, pw = w - 80;
    var n = values.length, barW = pw / n;
    var scale = (oy - 30) / maxVal;
    for (var i = 0; i < n; i++) {
      var bh = values[i] * scale;
      ctx.fillStyle = color; ctx.fillRect(ox + i * barW, oy - bh, barW - 1, bh);
    }
    ctx.save(); ctx.strokeStyle = C.axis; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(ox, 20); ctx.lineTo(ox, oy); ctx.lineTo(ox + pw, oy); ctx.stroke(); ctx.restore();
    drawLabel(ctx, label, w / 2, 16, { size: 12, color: C.gold, bold: true });
  }
  function normalPDF(x, mu, sigma) {
    return Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2)) / (sigma * Math.sqrt(2 * PI));
  }
  return {
    veId: 'random-variables', title: 'CLT: Order from Chaos', lessonId: 'random-variables',
    frames: [
      { text: 'Start with ANY distribution \u2014 even a flat one (uniform). Roll a die: each outcome equally likely.',
        draw: function(ctx, w, h, t) {
          var vals = [1, 1, 1, 1, 1, 1];
          var et = easeInOut(t);
          var ox = 80, oy = h - 40, barW = 35, barH = 100;
          for (var i = 0; i < 6; i++) {
            ctx.fillStyle = C.accent;
            ctx.fillRect(ox + i * (barW + 5), oy - barH * et, barW, barH * et);
            drawLabel(ctx, String(i + 1), ox + i * (barW + 5) + barW / 2, oy + 14, { size: 10, color: C.textDim });
          }
          ctx.save(); ctx.strokeStyle = C.axis; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(ox - 5, oy); ctx.lineTo(ox + 6 * (barW + 5), oy); ctx.stroke(); ctx.restore();
          drawLabel(ctx, 'Single die: uniform', w / 2, 20, { size: 13, color: C.gold, bold: true });
        }},
      { text: 'Add TWO dice: the sum distribution is already triangular. 7 is most likely.',
        draw: function(ctx, w, h, t) {
          var vals = [];
          for (var s = 2; s <= 12; s++) { vals.push(6 - Math.abs(s - 7)); }
          var maxV = 6, et = easeInOut(t);
          var ox = 50, oy = h - 35, pw = w - 100, barW = pw / vals.length;
          var scale = (oy - 30) / maxV;
          for (var i = 0; i < vals.length; i++) {
            var bh = vals[i] * scale * et;
            ctx.fillStyle = C.secondary;
            ctx.fillRect(ox + i * barW, oy - bh, barW - 1, bh);
            if (barW > 15) drawLabel(ctx, String(i + 2), ox + i * barW + barW / 2, oy + 12, { size: 8, color: C.textDim });
          }
          ctx.save(); ctx.strokeStyle = C.axis; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + pw, oy); ctx.stroke(); ctx.restore();
          drawLabel(ctx, 'Sum of 2 dice: triangular', w / 2, 18, { size: 13, color: C.gold, bold: true });
        }},
      { text: 'Add 5 dice: the distribution is noticeably bell-shaped.',
        draw: function(ctx, w, h, t) {
          var mu = 5 * 3.5, sigma = Math.sqrt(5 * 35 / 12);
          var vals = [];
          for (var s = 5; s <= 30; s++) { vals.push(normalPDF(s, mu, sigma)); }
          var maxV = Math.max.apply(null, vals);
          var et = easeInOut(t);
          var ox = 35, oy = h - 35, pw = w - 70, barW = pw / vals.length;
          var scale = (oy - 30) / maxV;
          for (var i = 0; i < vals.length; i++) {
            var bh = vals[i] * scale * et;
            ctx.fillStyle = C.green;
            ctx.fillRect(ox + i * barW, oy - bh, barW - 0.5, bh);
          }
          ctx.save(); ctx.strokeStyle = C.axis; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + pw, oy); ctx.stroke(); ctx.restore();
          drawLabel(ctx, 'Sum of 5 dice: bell-shaped', w / 2, 18, { size: 13, color: C.gold, bold: true });
        }},
      { text: '30 dice: almost a perfect bell curve (normal distribution). No matter WHAT you started with.',
        draw: function(ctx, w, h, t) {
          var mu = 30 * 3.5, sigma = Math.sqrt(30 * 35 / 12);
          var et = easeInOut(t);
          var ox = 40, oy = h - 35, pw = w - 80;
          ctx.save(); ctx.fillStyle = 'rgba(167,139,250,0.35)'; ctx.beginPath();
          ctx.moveTo(ox, oy);
          for (var i = 0; i <= 200; i++) {
            var x = mu - 4 * sigma + i * 8 * sigma / 200;
            var y = normalPDF(x, mu, sigma);
            var px = ox + (x - (mu - 4 * sigma)) / (8 * sigma) * pw;
            var py = oy - y / normalPDF(mu, mu, sigma) * (oy - 30) * et;
            ctx.lineTo(px, py);
          }
          ctx.lineTo(ox + pw, oy); ctx.closePath(); ctx.fill();
          ctx.strokeStyle = C.purple; ctx.lineWidth = 2.5; ctx.beginPath();
          for (var i = 0; i <= 200; i++) {
            var x = mu - 4 * sigma + i * 8 * sigma / 200;
            var y = normalPDF(x, mu, sigma);
            var px = ox + (x - (mu - 4 * sigma)) / (8 * sigma) * pw;
            var py = oy - y / normalPDF(mu, mu, sigma) * (oy - 30) * et;
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          }
          ctx.stroke(); ctx.restore();
          ctx.save(); ctx.strokeStyle = C.axis; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + pw, oy); ctx.stroke(); ctx.restore();
          drawLabel(ctx, '30 dice: nearly perfect bell curve', w / 2, 18, { size: 13, color: C.gold, bold: true });
        }},
      { text: 'The Central Limit Theorem: the sum of many independent random things is approximately NORMAL. This is why the bell curve is everywhere.',
        draw: function(ctx, w, h, t) {
          var et = easeInOut(t);
          var mu = 0, sigma = 1;
          var ox = 60, oy = h / 2 + 30, pw = w - 120;
          ctx.save(); ctx.fillStyle = 'rgba(108,99,255,0.2)'; ctx.globalAlpha = et; ctx.beginPath();
          ctx.moveTo(ox, oy);
          for (var i = 0; i <= 200; i++) {
            var x = -3.5 + i * 7 / 200, y = normalPDF(x, mu, sigma);
            ctx.lineTo(ox + (x + 3.5) / 7 * pw, oy - y * 200);
          }
          ctx.lineTo(ox + pw, oy); ctx.closePath(); ctx.fill();
          ctx.strokeStyle = C.accent; ctx.lineWidth = 2.5; ctx.beginPath();
          for (var i = 0; i <= 200; i++) {
            var x = -3.5 + i * 7 / 200, y = normalPDF(x, mu, sigma);
            var px = ox + (x + 3.5) / 7 * pw, py = oy - y * 200;
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          }
          ctx.stroke(); ctx.restore();
          drawLabel(ctx, 'Central Limit Theorem', w / 2, 20, { size: 15, color: C.gold, bold: true });
          drawLabel(ctx, 'Sum of many independent variables \u2192 Normal', w / 2, 45, { size: 11, color: C.text });
          drawLabel(ctx, 'This is why the bell curve appears everywhere in nature.', w / 2, h - 12, { size: 10, color: C.textDim });
        }}
    ]
  };
})());

/* ══════════════════════════════════════════════════════════════
   FOUNDATION CHAPTERS — Visual Explainers
   ══════════════════════════════════════════════════════════════ */

/* ── Pythagorean Theorem ── */
EXPLAINERS.push({title:'The Pythagorean Theorem Visually',lessonId:'scientific-pythagorean',frames:[
  {text:'Consider a right triangle with legs a and b and hypotenuse c.',draw:function(ctx,w,h,t){
    refreshC(); var et=easeInOut(t);
    var ax=80,ay=h-50,bx=280,by=h-50,cx2=80,cy2=80;
    ctx.strokeStyle=C.accent;ctx.lineWidth=2+et;ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by);ctx.lineTo(cx2,cy2);ctx.closePath();ctx.stroke();
    ctx.fillStyle=C.accent+'30';ctx.fill();
    drawLabel(ctx,'a',75,h/2,{size:14,color:C.green,bold:true});
    drawLabel(ctx,'b',(ax+bx)/2,h-35,{size:14,color:C.secondary,bold:true});
    drawLabel(ctx,'c',(bx+cx2)/2+15,(by+cy2)/2,{size:14,color:C.gold,bold:true});
    ctx.strokeStyle=C.textDim;ctx.lineWidth=1;ctx.strokeRect(ax,ay-15,15,15);
  }},
  {text:'Build a square on each side. The area of the square on side a is a\u00b2.',draw:function(ctx,w,h,t){
    refreshC();var et=easeInOut(t);
    var ax=120,ay=h-60,bx=280,by=h-60,cx2=120,cy2=100;
    ctx.strokeStyle=C.accent;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by);ctx.lineTo(cx2,cy2);ctx.closePath();ctx.stroke();
    var aLen=(ay-cy2)*et;ctx.fillStyle=C.green+'30';ctx.fillRect(ax-aLen,cy2,aLen,ay-cy2);ctx.strokeStyle=C.green;ctx.strokeRect(ax-aLen,cy2,aLen,ay-cy2);
    drawLabel(ctx,'a\u00b2',ax-aLen/2,(cy2+ay)/2,{size:12,color:C.green,bold:true});
    var bLen=(bx-ax)*et;ctx.fillStyle=C.secondary+'30';ctx.fillRect(ax,ay,bLen,bLen);ctx.strokeStyle=C.secondary;ctx.strokeRect(ax,ay,bLen,bLen);
    drawLabel(ctx,'b\u00b2',ax+bLen/2,ay+bLen/2,{size:12,color:C.secondary,bold:true});
  }},
  {text:'The square on the hypotenuse c has area c\u00b2. The key insight: a\u00b2 + b\u00b2 = c\u00b2.',draw:function(ctx,w,h,t){
    refreshC();
    drawLabel(ctx,'a\u00b2 + b\u00b2 = c\u00b2',w/2,h/2-20,{size:22,color:C.gold,bold:true});
    drawLabel(ctx,'The area of the two smaller squares',w/2,h/2+20,{size:12,color:C.text});
    drawLabel(ctx,'ALWAYS equals the area of the big square.',w/2,h/2+40,{size:12,color:C.text});
    drawLabel(ctx,'This works for EVERY right triangle.',w/2,h-30,{size:11,color:C.textDim});
  }},
  {text:'Example: a=3, b=4. Then c\u00b2 = 9+16 = 25, so c = 5. The famous 3-4-5 triangle.',draw:function(ctx,w,h,t){
    refreshC();var et=easeInOut(t);
    var ax=100,ay=h-50,bx=260,by=h-50,cx2=100,cy2=90;
    ctx.strokeStyle=C.accent;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by);ctx.lineTo(cx2,cy2);ctx.closePath();ctx.stroke();
    drawLabel(ctx,'3',85,(cy2+ay)/2,{size:14,color:C.green,bold:true});
    drawLabel(ctx,'4',(ax+bx)/2,h-35,{size:14,color:C.secondary,bold:true});
    drawLabel(ctx,'5',(bx+cx2)/2+15,(by+cy2)/2,{size:14,color:C.gold,bold:true});
    drawLabel(ctx,'3\u00b2 + 4\u00b2 = 9 + 16 = 25 = 5\u00b2',w/2,30,{size:13,color:C.text,bold:true});
  }}
]});

/* ── Slope Visually ── */
EXPLAINERS.push({title:'What IS Slope?',lessonId:'slope-rate',frames:[
  {text:'Slope measures how steep a line is. It is the RISE (vertical change) divided by the RUN (horizontal change).',draw:function(ctx,w,h,t){
    refreshC(); drawAxes(ctx,w,h);
    var x1=80,y1=h-80,x2=300,y2=60;
    ctx.strokeStyle=C.accent;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(lerp(x1,x2,easeInOut(t)),lerp(y1,y2,easeInOut(t)));ctx.stroke();
    drawLabel(ctx,'Slope = rise / run',w/2,25,{size:13,color:C.text,bold:true});
  }},
  {text:'Positive slope: line goes UP from left to right. The bigger the number, the steeper.',draw:function(ctx,w,h,t){
    refreshC(); drawAxes(ctx,w,h);
    var slopes=[0.5,1,2];var colors=[C.green,C.accent,C.gold];
    slopes.forEach(function(m,i){
      ctx.strokeStyle=colors[i];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(40,h-50-m*(-40)+100);ctx.lineTo(w-20,h-50-m*(w-60)+100);ctx.stroke();
    });
    drawLabel(ctx,'m=0.5 (gentle)',w-60,h-70,{size:10,color:C.green});
    drawLabel(ctx,'m=1 (45\u00b0)',w-60,h-110,{size:10,color:C.accent});
    drawLabel(ctx,'m=2 (steep)',w-60,h-150,{size:10,color:C.gold});
  }},
  {text:'Negative slope: line goes DOWN from left to right. Zero slope: perfectly horizontal. Undefined: vertical.',draw:function(ctx,w,h,t){
    refreshC();
    ctx.strokeStyle=C.red;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(40,60);ctx.lineTo(170,h-40);ctx.stroke();
    drawLabel(ctx,'negative',105,h/2-30,{size:10,color:C.red});
    ctx.strokeStyle=C.green;ctx.beginPath();ctx.moveTo(190,h/2);ctx.lineTo(320,h/2);ctx.stroke();
    drawLabel(ctx,'zero',255,h/2-12,{size:10,color:C.green});
    ctx.strokeStyle=C.purple;ctx.beginPath();ctx.moveTo(350,40);ctx.lineTo(350,h-40);ctx.stroke();
    drawLabel(ctx,'undefined',350,30,{size:10,color:C.purple});
  }},
  {text:'To find slope between two points: m = (y\u2082 - y\u2081) / (x\u2082 - x\u2081). Just count the rise and run!',draw:function(ctx,w,h,t){
    refreshC(); drawAxes(ctx,w,h);
    var x1=100,y1=h-80,x2=280,y2=80;
    drawDot(ctx,x1,y1,5,C.accent);drawDot(ctx,x2,y2,5,C.accent);
    ctx.strokeStyle=C.accent;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
    ctx.setLineDash([4,4]);ctx.strokeStyle=C.green;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y1);ctx.stroke();
    ctx.strokeStyle=C.gold;ctx.beginPath();ctx.moveTo(x2,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.setLineDash([]);
    drawLabel(ctx,'run = x\u2082-x\u2081',(x1+x2)/2,y1+18,{size:10,color:C.green});
    drawLabel(ctx,'rise = y\u2082-y\u2081',x2+25,(y1+y2)/2,{size:10,color:C.gold});
  }}
]});

/* ── Systems of Equations ── */
EXPLAINERS.push({title:'Solving Systems: Where Lines Cross',lessonId:'systems-linear',frames:[
  {text:'A system of two linear equations represents two lines. The SOLUTION is where they intersect.',draw:function(ctx,w,h,t){
    refreshC(); drawAxes(ctx,w,h);
    var et=easeInOut(t);
    ctx.strokeStyle=C.accent;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(40,h-60);ctx.lineTo(40+(w-60)*et,60);ctx.stroke();
    ctx.strokeStyle=C.gold;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(40,80);ctx.lineTo(40+(w-60)*et,h-60);ctx.stroke();
    drawDot(ctx,185,135,7*et,C.green);
    drawLabel(ctx,'Solution: the intersection point',w/2,h-15,{size:11,color:C.text});
  }},
  {text:'Substitution: solve one equation for y, then plug into the other. You get one equation with one unknown.',draw:function(ctx,w,h,t){
    refreshC();
    drawLabel(ctx,'Step 1: y = 2x + 1',w/2,50,{size:14,color:C.accent,bold:true});
    drawLabel(ctx,'Step 2: plug into 3x + y = 16',w/2,85,{size:14,color:C.gold,bold:true});
    drawLabel(ctx,'3x + (2x+1) = 16',w/2,120,{size:14,color:C.text});
    drawLabel(ctx,'5x + 1 = 16',w/2,150,{size:14,color:C.text});
    drawLabel(ctx,'x = 3, then y = 7',w/2,185,{size:16,color:C.green,bold:true});
    drawLabel(ctx,'Solution: (3, 7)',w/2,220,{size:13,color:C.textDim});
  }},
  {text:'Elimination: add or subtract equations to cancel one variable. Multiply first if needed.',draw:function(ctx,w,h,t){
    refreshC();
    drawLabel(ctx,'2x + 3y = 12',w/2,50,{size:14,color:C.accent,bold:true});
    drawLabel(ctx,'4x - 3y = 6',w/2,80,{size:14,color:C.gold,bold:true});
    drawLabel(ctx,'\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 ADD \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500',w/2,110,{size:11,color:C.textDim});
    drawLabel(ctx,'6x = 18  \u2192  x = 3',w/2,145,{size:14,color:C.text});
    drawLabel(ctx,'The +3y and -3y cancel!',w/2,175,{size:12,color:C.red,bold:true});
    drawLabel(ctx,'Then: 2(3) + 3y = 12 \u2192 y = 2',w/2,210,{size:13,color:C.green});
  }}
]});

/* ── Quadratic Transformations ── */
EXPLAINERS.push({title:'How a, h, k Transform the Parabola',lessonId:'graphing-quadratics',frames:[
  {text:'The parent function is y = x\u00b2. Every parabola is just this one, shifted and stretched.',draw:function(ctx,w,h,t){
    refreshC(); drawAxes(ctx,w,h,{ox:w/2,oy:h-40});
    var ox=w/2,oy=h-40;
    ctx.strokeStyle=C.accent;ctx.lineWidth=2.5;ctx.beginPath();
    for(var px=-150;px<=150;px++){var x=px/50;var y=x*x;var sx=ox+px;var sy=oy-y*40;if(px===-150)ctx.moveTo(sx,sy);else ctx.lineTo(sx,sy);}ctx.stroke();
    drawLabel(ctx,'y = x\u00b2',w/2,25,{size:16,color:C.accent,bold:true});
    drawLabel(ctx,'The parent parabola. Vertex at (0,0). Opens up.',w/2,50,{size:11,color:C.text});
  }},
  {text:'"a" controls the WIDTH and DIRECTION. a>1 makes it narrower. 0<a<1 makes it wider. a<0 flips it upside down.',draw:function(ctx,w,h,t){
    refreshC(); drawAxes(ctx,w,h,{ox:w/2,oy:h/2});
    var ox=w/2,oy=h/2;
    var params=[{a:0.3,c:C.green,l:'a=0.3 (wide)'},{a:1,c:C.accent,l:'a=1 (normal)'},{a:3,c:C.gold,l:'a=3 (narrow)'},{a:-1,c:C.red,l:'a=-1 (flipped)'}];
    params.forEach(function(p){
      ctx.strokeStyle=p.c;ctx.lineWidth=1.8;ctx.beginPath();
      for(var px=-120;px<=120;px++){var x=px/50;var y=p.a*x*x;var sx=ox+px;var sy=oy-y*30;if(sy<10||sy>h-10){if(px===-120)ctx.moveTo(sx,clamp(sy,10,h-10));continue;}if(px===-120)ctx.moveTo(sx,sy);else ctx.lineTo(sx,sy);}ctx.stroke();
    });
    drawLabel(ctx,'a=0.3',60,oy-35,{size:9,color:C.green});
    drawLabel(ctx,'a=1',100,40,{size:9,color:C.accent});
    drawLabel(ctx,'a=3',ox+15,40,{size:9,color:C.gold});
    drawLabel(ctx,'a=-1 (flip!)',w-70,oy+50,{size:9,color:C.red});
    drawLabel(ctx,'"a" = stretch + direction',w/2,h-12,{size:11,color:C.text,bold:true});
  }},
  {text:'"h" shifts the parabola LEFT or RIGHT. y = (x-h)\u00b2. Note: (x-3)\u00b2 shifts RIGHT 3 (opposite sign!).',draw:function(ctx,w,h,t){
    refreshC(); drawAxes(ctx,w,h,{ox:w/2,oy:h-40});
    var ox=w/2,oy=h-40;
    var shifts=[{h:0,c:C.textDim,l:'h=0'},{h:3,c:C.accent,l:'h=3 (right)'},{h:-2,c:C.gold,l:'h=-2 (left)'}];
    shifts.forEach(function(p){
      ctx.strokeStyle=p.c;ctx.lineWidth=p.h===0?1.5:2.5;ctx.beginPath();
      for(var px=-150;px<=150;px++){var x=px/50;var y=(x-p.h)*(x-p.h);var sx=ox+px;var sy=oy-y*15;if(sy<10)continue;if(px===-150)ctx.moveTo(sx,sy);else ctx.lineTo(sx,sy);}ctx.stroke();
      drawDot(ctx,ox+p.h*50,oy,4,p.c);
    });
    drawLabel(ctx,'"h" shifts horizontally (OPPOSITE sign)',w/2,25,{size:12,color:C.text,bold:true});
    drawLabel(ctx,'(x-3)\u00b2 \u2192 right 3',w-80,oy-60,{size:10,color:C.accent});
    drawLabel(ctx,'(x+2)\u00b2 \u2192 left 2',70,oy-40,{size:10,color:C.gold});
  }},
  {text:'"k" shifts the parabola UP or DOWN. y = x\u00b2 + k. Positive k = up. Negative k = down.',draw:function(ctx,w,h,t){
    refreshC(); drawAxes(ctx,w,h,{ox:w/2,oy:h/2});
    var ox=w/2,oy=h/2;
    var shifts=[{k:0,c:C.textDim,l:'k=0'},{k:3,c:C.green,l:'k=+3 (up)'},{k:-2,c:C.red,l:'k=-2 (down)'}];
    shifts.forEach(function(p){
      ctx.strokeStyle=p.c;ctx.lineWidth=p.k===0?1.5:2.5;ctx.beginPath();
      for(var px=-100;px<=100;px++){var x=px/50;var y=x*x+p.k;var sx=ox+px;var sy=oy-y*25;if(sy<10||sy>h-10)continue;if(px===-100)ctx.moveTo(sx,sy);else ctx.lineTo(sx,sy);}ctx.stroke();
      drawDot(ctx,ox,oy-p.k*25,4,p.c);
    });
    drawLabel(ctx,'"k" shifts vertically (same sign)',w/2,18,{size:12,color:C.text,bold:true});
    drawLabel(ctx,'+3 = up',ox+20,oy-3*25-10,{size:10,color:C.green});
    drawLabel(ctx,'-2 = down',ox+20,oy+2*25+14,{size:10,color:C.red});
  }},
  {text:'Putting it all together: y = a(x-h)\u00b2 + k. "a" stretches, "h" shifts horizontally, "k" shifts vertically. Vertex is at (h, k).',draw:function(ctx,w,h,t){
    refreshC(); drawAxes(ctx,w,h,{ox:w/2,oy:h/2});
    var ox=w/2,oy=h/2,hv=2,kv=3,av=-1.5;
    ctx.strokeStyle=C.textDim;ctx.lineWidth=1;ctx.beginPath();
    for(var px=-120;px<=120;px++){var x=px/50;var y=x*x;var sx=ox+px;var sy=oy-y*18;if(sy<10)continue;if(px===-120)ctx.moveTo(sx,sy);else ctx.lineTo(sx,sy);}ctx.stroke();
    ctx.strokeStyle=C.gold;ctx.lineWidth=2.5;ctx.beginPath();
    for(var px2=-120;px2<=120;px2++){var x2=px2/50;var y2=av*(x2-hv)*(x2-hv)+kv;var sx2=ox+px2;var sy2=oy-y2*18;if(sy2<10||sy2>h-10)continue;if(px2===-120)ctx.moveTo(sx2,sy2);else ctx.lineTo(sx2,sy2);}ctx.stroke();
    drawDot(ctx,ox+hv*50,oy-kv*18,6,C.gold);
    drawLabel(ctx,'y = -1.5(x-2)\u00b2 + 3',w/2,18,{size:13,color:C.gold,bold:true});
    drawLabel(ctx,'vertex (2, 3)',ox+hv*50+10,oy-kv*18-12,{size:10,color:C.gold});
    drawLabel(ctx,'parent y=x\u00b2',70,40,{size:9,color:C.textDim});
    drawLabel(ctx,'a=-1.5: flipped + narrow | h=2: right 2 | k=3: up 3',w/2,h-12,{size:10,color:C.text});
  }}
]});

/* ── SOH CAH TOA ── */
EXPLAINERS.push({title:'SOH CAH TOA: Right Triangle Trig',lessonId:'soh-cah-toa',frames:[
  {text:'In a right triangle, the three sides have names relative to an angle \u03b8: opposite, adjacent, and hypotenuse.',draw:function(ctx,w,h,t){
    refreshC();
    var ax=80,ay=h-50,bx=300,by=h-50,cx2=300,cy2=80;
    ctx.strokeStyle=C.accent;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by);ctx.lineTo(cx2,cy2);ctx.closePath();ctx.stroke();
    ctx.strokeStyle=C.textDim;ctx.lineWidth=1;ctx.strokeRect(bx-15,by-15,15,15);
    drawLabel(ctx,'\u03b8',ax+25,ay-15,{size:16,color:C.gold,bold:true});
    drawLabel(ctx,'opposite',bx+15,(by+cy2)/2,{size:12,color:C.red,bold:true});
    drawLabel(ctx,'adjacent',(ax+bx)/2,h-30,{size:12,color:C.green,bold:true});
    drawLabel(ctx,'hypotenuse',(ax+cx2)/2-20,(ay+cy2)/2-15,{size:12,color:C.accent,bold:true});
  }},
  {text:'SOH: sin \u03b8 = Opposite / Hypotenuse. It tells you the ratio of the side across from \u03b8 to the longest side.',draw:function(ctx,w,h,t){
    refreshC();
    drawLabel(ctx,'S O H',w/2,50,{size:28,color:C.red,bold:true});
    drawLabel(ctx,'sin \u03b8 = Opposite \u00f7 Hypotenuse',w/2,95,{size:15,color:C.text,bold:true});
    drawLabel(ctx,'Example: opposite = 3, hypotenuse = 5',w/2,140,{size:12,color:C.textDim});
    drawLabel(ctx,'sin \u03b8 = 3/5 = 0.6',w/2,170,{size:14,color:C.gold,bold:true});
    drawLabel(ctx,'\u03b8 = sin\u207b\u00b9(0.6) \u2248 36.87\u00b0',w/2,200,{size:13,color:C.green});
  }},
  {text:'CAH: cos \u03b8 = Adjacent / Hypotenuse. The side NEXT TO \u03b8 divided by the longest side.',draw:function(ctx,w,h,t){
    refreshC();
    drawLabel(ctx,'C A H',w/2,50,{size:28,color:C.green,bold:true});
    drawLabel(ctx,'cos \u03b8 = Adjacent \u00f7 Hypotenuse',w/2,95,{size:15,color:C.text,bold:true});
    drawLabel(ctx,'Example: adjacent = 4, hypotenuse = 5',w/2,140,{size:12,color:C.textDim});
    drawLabel(ctx,'cos \u03b8 = 4/5 = 0.8',w/2,170,{size:14,color:C.gold,bold:true});
  }},
  {text:'TOA: tan \u03b8 = Opposite / Adjacent. How tall the opposite side is compared to the adjacent side.',draw:function(ctx,w,h,t){
    refreshC();
    drawLabel(ctx,'T O A',w/2,50,{size:28,color:C.secondary,bold:true});
    drawLabel(ctx,'tan \u03b8 = Opposite \u00f7 Adjacent',w/2,95,{size:15,color:C.text,bold:true});
    drawLabel(ctx,'Example: opposite = 3, adjacent = 4',w/2,140,{size:12,color:C.textDim});
    drawLabel(ctx,'tan \u03b8 = 3/4 = 0.75',w/2,170,{size:14,color:C.gold,bold:true});
  }},
  {text:'To find a missing SIDE: pick the ratio that uses the side you want and the side you know. To find a missing ANGLE: use the inverse (sin\u207b\u00b9, cos\u207b\u00b9, tan\u207b\u00b9).',draw:function(ctx,w,h,t){
    refreshC();
    drawLabel(ctx,'Finding a side:',w/2,40,{size:13,color:C.text,bold:true});
    drawLabel(ctx,'Know angle + one side \u2192 use SOH CAH TOA \u2192 solve for unknown side',w/2,65,{size:11,color:C.textDim});
    drawLabel(ctx,'Finding an angle:',w/2,110,{size:13,color:C.text,bold:true});
    drawLabel(ctx,'Know two sides \u2192 compute the ratio \u2192 use inverse trig',w/2,135,{size:11,color:C.textDim});
    drawLabel(ctx,'\u03b8 = sin\u207b\u00b9(O/H)  or  \u03b8 = cos\u207b\u00b9(A/H)  or  \u03b8 = tan\u207b\u00b9(O/A)',w/2,175,{size:12,color:C.gold,bold:true});
  }}
]});

/* ── Sine Law & Cosine Law ── */
EXPLAINERS.push({title:'Sine Law & Cosine Law',lessonId:'sine-cosine-law',frames:[
  {text:'SOH CAH TOA only works for RIGHT triangles. For ANY triangle, we need the sine law and cosine law.',draw:function(ctx,w,h,t){
    refreshC();
    var ax=60,ay=h-50,bx=320,by=h-50,cx2=200,cy2=40;
    ctx.strokeStyle=C.accent;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by);ctx.lineTo(cx2,cy2);ctx.closePath();ctx.stroke();
    drawLabel(ctx,'A',ax-12,ay+5,{size:13,color:C.gold,bold:true});
    drawLabel(ctx,'B',bx+8,by+5,{size:13,color:C.gold,bold:true});
    drawLabel(ctx,'C',cx2,cy2-10,{size:13,color:C.gold,bold:true});
    drawLabel(ctx,'a',(bx+cx2)/2+10,(by+cy2)/2,{size:12,color:C.red});
    drawLabel(ctx,'b',(ax+cx2)/2-15,(ay+cy2)/2,{size:12,color:C.green});
    drawLabel(ctx,'c',(ax+bx)/2,h-35,{size:12,color:C.secondary});
    drawLabel(ctx,'Not a right triangle \u2014 need new tools!',w/2,h-10,{size:11,color:C.text});
  }},
  {text:'Sine Law: a/sin A = b/sin B = c/sin C. Use when you know an angle and its opposite side (AAS or ASA).',draw:function(ctx,w,h,t){
    refreshC();
    drawLabel(ctx,'Sine Law',w/2,35,{size:18,color:C.accent,bold:true});
    drawLabel(ctx,'a / sin A  =  b / sin B  =  c / sin C',w/2,75,{size:14,color:C.gold,bold:true});
    drawLabel(ctx,'Use when: you know a side and its OPPOSITE angle',w/2,115,{size:11,color:C.text});
    drawLabel(ctx,'Example: A=40\u00b0, a=8, B=60\u00b0. Find b.',w/2,155,{size:12,color:C.textDim});
    drawLabel(ctx,'8/sin40\u00b0 = b/sin60\u00b0',w/2,185,{size:13,color:C.text});
    drawLabel(ctx,'b = 8\u00b7sin60\u00b0 / sin40\u00b0 \u2248 10.78',w/2,215,{size:14,color:C.green,bold:true});
  }},
  {text:'Cosine Law: c\u00b2 = a\u00b2 + b\u00b2 - 2ab\u00b7cos C. Use when you know two sides and the included angle (SAS) or all three sides (SSS).',draw:function(ctx,w,h,t){
    refreshC();
    drawLabel(ctx,'Cosine Law',w/2,35,{size:18,color:C.accent,bold:true});
    drawLabel(ctx,'c\u00b2 = a\u00b2 + b\u00b2 - 2ab \u00b7 cos C',w/2,75,{size:14,color:C.gold,bold:true});
    drawLabel(ctx,'This is the Pythagorean theorem GENERALIZED!',w/2,110,{size:11,color:C.text});
    drawLabel(ctx,'When C=90\u00b0: cos 90\u00b0=0, so c\u00b2=a\u00b2+b\u00b2',w/2,135,{size:10,color:C.textDim});
    drawLabel(ctx,'Example: a=5, b=7, C=50\u00b0. Find c.',w/2,170,{size:12,color:C.textDim});
    drawLabel(ctx,'c\u00b2 = 25 + 49 - 2(5)(7)cos50\u00b0 \u2248 28.99',w/2,200,{size:13,color:C.text});
    drawLabel(ctx,'c \u2248 5.38',w/2,230,{size:14,color:C.green,bold:true});
  }}
]});

/* ── Linear Equations ── */
EXPLAINERS.push({title:'Solving Equations: Balance the Scale',lessonId:'linear-equations',frames:[
  {text:'An equation is like a balance scale. Both sides must stay equal. Whatever you do to one side, do to the other.',draw:function(ctx,w,h,t){
    refreshC();
    var cx=w/2,base=h-50;
    ctx.strokeStyle=C.textDim;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(cx,base);ctx.lineTo(cx,base-30);ctx.stroke();
    ctx.beginPath();ctx.moveTo(cx-120,base-30);ctx.lineTo(cx+120,base-30);ctx.stroke();
    ctx.fillStyle=C.accent+'40';ctx.fillRect(cx-110,base-60,80,30);
    ctx.fillStyle=C.gold+'40';ctx.fillRect(cx+30,base-60,80,30);
    drawLabel(ctx,'3x + 5',cx-70,base-42,{size:12,color:C.accent,bold:true});
    drawLabel(ctx,'20',cx+70,base-42,{size:12,color:C.gold,bold:true});
    drawLabel(ctx,'Both sides must stay EQUAL',w/2,25,{size:12,color:C.text,bold:true});
  }},
  {text:'Step 1: Move constants to one side. Subtract 5 from BOTH sides: 3x = 15.',draw:function(ctx,w,h,t){
    refreshC();
    drawLabel(ctx,'3x + 5 = 20',w/2,50,{size:16,color:C.text});
    drawLabel(ctx,'-5      -5',w/2,80,{size:14,color:C.red,bold:true});
    drawLabel(ctx,'\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500',w/2,100,{size:12,color:C.textDim});
    drawLabel(ctx,'3x = 15',w/2,130,{size:18,color:C.accent,bold:true});
    drawLabel(ctx,'We subtracted 5 from BOTH sides to keep the balance.',w/2,170,{size:11,color:C.textDim});
  }},
  {text:'Step 2: Divide both sides by the coefficient. Divide by 3: x = 5.',draw:function(ctx,w,h,t){
    refreshC();
    drawLabel(ctx,'3x = 15',w/2,50,{size:16,color:C.text});
    drawLabel(ctx,'\u00f73     \u00f73',w/2,80,{size:14,color:C.red,bold:true});
    drawLabel(ctx,'\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500',w/2,100,{size:12,color:C.textDim});
    drawLabel(ctx,'x = 5',w/2,135,{size:22,color:C.green,bold:true});
    drawLabel(ctx,'Check: 3(5) + 5 = 15 + 5 = 20 \u2714',w/2,180,{size:12,color:C.gold});
    drawLabel(ctx,'ALWAYS check by substituting back!',w/2,210,{size:11,color:C.textDim});
  }}
]});

/* ── Factoring Quadratics ── */
EXPLAINERS.push({title:'Factoring: Un-Multiplying',lessonId:'factoring-quadratics',frames:[
  {text:'Factoring is the REVERSE of expanding. If (x+2)(x+3) = x\u00b2+5x+6, then factoring x\u00b2+5x+6 gives (x+2)(x+3).',draw:function(ctx,w,h,t){
    refreshC();
    drawLabel(ctx,'Expanding (FOIL):',w/2,40,{size:13,color:C.textDim});
    drawLabel(ctx,'(x+2)(x+3)  \u2192  x\u00b2 + 5x + 6',w/2,70,{size:15,color:C.accent,bold:true});
    drawLabel(ctx,'\u2b06 Factoring (reverse):',w/2,120,{size:13,color:C.textDim});
    drawLabel(ctx,'x\u00b2 + 5x + 6  \u2192  (x+2)(x+3)',w/2,150,{size:15,color:C.gold,bold:true});
    drawLabel(ctx,'Find two numbers that multiply to 6 and add to 5',w/2,200,{size:12,color:C.text});
    drawLabel(ctx,'2 \u00d7 3 = 6  and  2 + 3 = 5  \u2714',w/2,225,{size:13,color:C.green,bold:true});
  }},
  {text:'The method: for x\u00b2 + bx + c, find two numbers p and q where p\u00d7q = c and p+q = b. Answer: (x+p)(x+q).',draw:function(ctx,w,h,t){
    refreshC();
    drawLabel(ctx,'x\u00b2 + bx + c',w/2,35,{size:16,color:C.accent,bold:true});
    drawLabel(ctx,'Find p and q where:',w/2,75,{size:12,color:C.text});
    drawLabel(ctx,'p \u00d7 q = c  (the constant)',w/2,105,{size:14,color:C.gold,bold:true});
    drawLabel(ctx,'p + q = b  (the middle coefficient)',w/2,135,{size:14,color:C.green,bold:true});
    drawLabel(ctx,'Then: (x + p)(x + q)',w/2,175,{size:16,color:C.accent,bold:true});
    drawLabel(ctx,'This is the core of factoring simple trinomials.',w/2,215,{size:11,color:C.textDim});
  }},
  {text:'Watch the signs! x\u00b2 - 7x + 12: need p\u00d7q = +12 and p+q = -7. Both negative: p=-3, q=-4.',draw:function(ctx,w,h,t){
    refreshC();
    drawLabel(ctx,'x\u00b2 - 7x + 12',w/2,40,{size:16,color:C.text});
    drawLabel(ctx,'p \u00d7 q = +12  (positive)',w/2,80,{size:13,color:C.gold});
    drawLabel(ctx,'p + q = -7   (negative)',w/2,110,{size:13,color:C.green});
    drawLabel(ctx,'Both must be negative (neg \u00d7 neg = pos, neg + neg = neg)',w/2,145,{size:11,color:C.textDim});
    drawLabel(ctx,'p = -3, q = -4',w/2,180,{size:14,color:C.red,bold:true});
    drawLabel(ctx,'(-3)(-4) = 12 \u2714   (-3)+(-4) = -7 \u2714',w/2,210,{size:12,color:C.green});
    drawLabel(ctx,'Answer: (x-3)(x-4)',w/2,240,{size:15,color:C.accent,bold:true});
  }}
]});

/* ── Angle Relationships ── */
EXPLAINERS.push({title:'Angles with Parallel Lines',lessonId:'angles-lines',frames:[
  {text:'When a line (transversal) crosses two parallel lines, it creates 8 angles with special relationships.',draw:function(ctx,w,h,t){
    refreshC();
    ctx.strokeStyle=C.accent;ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(40,80);ctx.lineTo(w-40,80);ctx.stroke();
    ctx.beginPath();ctx.moveTo(40,180);ctx.lineTo(w-40,180);ctx.stroke();
    ctx.strokeStyle=C.gold;ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(120,30);ctx.lineTo(280,h-10);ctx.stroke();
    drawLabel(ctx,'parallel',w-60,75,{size:10,color:C.accent});
    drawLabel(ctx,'parallel',w-60,175,{size:10,color:C.accent});
    drawLabel(ctx,'transversal',285,h-25,{size:10,color:C.gold});
    drawLabel(ctx,'8 angles formed \u2014 but only 2 different sizes!',w/2,h-5,{size:11,color:C.text});
  }},
  {text:'Alternate interior angles are EQUAL. They are on opposite sides of the transversal, between the parallel lines.',draw:function(ctx,w,h,t){
    refreshC();
    ctx.strokeStyle=C.accent;ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(40,80);ctx.lineTo(w-40,80);ctx.stroke();
    ctx.beginPath();ctx.moveTo(40,180);ctx.lineTo(w-40,180);ctx.stroke();
    ctx.strokeStyle=C.textDim;ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(140,30);ctx.lineTo(260,h-10);ctx.stroke();
    ctx.fillStyle=C.green+'40';ctx.beginPath();ctx.arc(185,80,20,0.4,PI/2);ctx.lineTo(185,80);ctx.fill();
    ctx.fillStyle=C.green+'40';ctx.beginPath();ctx.arc(215,180,20,PI+0.4,PI*1.5);ctx.lineTo(215,180);ctx.fill();
    drawLabel(ctx,'These two are EQUAL',w/2,135,{size:13,color:C.green,bold:true});
    drawLabel(ctx,'(alternate interior angles)',w/2,155,{size:11,color:C.textDim});
  }},
  {text:'Corresponding angles are EQUAL (same position at each intersection). Co-interior angles add to 180\u00b0.',draw:function(ctx,w,h,t){
    refreshC();
    drawLabel(ctx,'Key angle relationships:',w/2,30,{size:13,color:C.text,bold:true});
    drawLabel(ctx,'Alternate interior = EQUAL',w/2,65,{size:12,color:C.green});
    drawLabel(ctx,'Corresponding = EQUAL',w/2,95,{size:12,color:C.accent});
    drawLabel(ctx,'Co-interior = add to 180\u00b0',w/2,125,{size:12,color:C.gold});
    drawLabel(ctx,'Vertically opposite = EQUAL',w/2,155,{size:12,color:C.purple});
    drawLabel(ctx,'Supplementary = add to 180\u00b0',w/2,185,{size:12,color:C.red});
    drawLabel(ctx,'With these rules, if you know ONE angle, you can find ALL of them.',w/2,225,{size:11,color:C.textDim});
  }}
]});

/* ── Coordinate Geometry ── */
EXPLAINERS.push({title:'Distance & Midpoint Formulas',lessonId:'coordinate-geometry',frames:[
  {text:'The distance between two points is the Pythagorean theorem in disguise!',draw:function(ctx,w,h,t){
    refreshC(); drawAxes(ctx,w,h);
    var x1=100,y1=h-70,x2=300,y2=70;
    drawDot(ctx,x1,y1,5,C.accent);drawDot(ctx,x2,y2,5,C.accent);
    ctx.strokeStyle=C.gold;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
    ctx.setLineDash([4,4]);ctx.strokeStyle=C.green;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y1);ctx.stroke();
    ctx.strokeStyle=C.red;ctx.beginPath();ctx.moveTo(x2,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.setLineDash([]);
    drawLabel(ctx,'\u0394x',(x1+x2)/2,y1+15,{size:11,color:C.green});
    drawLabel(ctx,'\u0394y',x2+15,(y1+y2)/2,{size:11,color:C.red});
    drawLabel(ctx,'d',( x1+x2)/2-20,(y1+y2)/2-10,{size:13,color:C.gold,bold:true});
    drawLabel(ctx,'d = \u221a(\u0394x\u00b2 + \u0394y\u00b2)',w/2,25,{size:13,color:C.text,bold:true});
  }},
  {text:'The midpoint is just the AVERAGE of the coordinates: M = ((x\u2081+x\u2082)/2, (y\u2081+y\u2082)/2).',draw:function(ctx,w,h,t){
    refreshC(); drawAxes(ctx,w,h);
    var x1=80,y1=h-60,x2=320,y2=60;
    drawDot(ctx,x1,y1,5,C.accent);drawDot(ctx,x2,y2,5,C.accent);
    ctx.strokeStyle=C.textDim;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
    var mx=(x1+x2)/2,my=(y1+y2)/2;
    drawDot(ctx,mx,my,6,C.gold);
    drawLabel(ctx,'Midpoint M',mx+10,my-12,{size:12,color:C.gold,bold:true});
    drawLabel(ctx,'Average the x-values, average the y-values',w/2,25,{size:12,color:C.text});
  }}
]});

/* ── Init ── */
function init() {
  EXPLAINERS.forEach(function(config) { createExplainer(config); });
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() { setTimeout(init, 300); });
} else {
  setTimeout(init, 300);
}

})();
