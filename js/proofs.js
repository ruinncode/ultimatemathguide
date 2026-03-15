(function () {
  'use strict';

  // ============================================================
  //  COLLAPSIBLE PROOFS FOR ALL RULES AND THEOREMS
  //  Adds "Why does this work? See the proof" buttons
  // ============================================================

  var PROOFS = {

    // ── Differentiation Rules ──

    'Power Rule': {
      title: 'Why the Power Rule Works',
      steps: [
        ['Start with the definition', 'We want to find d/dx of $x^n$. Use the limit definition:\n$$f\'(x) = \\lim_{h \\to 0}\\frac{(x+h)^n - x^n}{h}$$'],
        ['Expand using the Binomial Theorem', '$(x+h)^n = x^n + nx^{n-1}h + \\frac{n(n-1)}{2}x^{n-2}h^2 + \\cdots + h^n$\n\nEvery term after the first has at least one factor of $h$.'],
        ['Subtract $x^n$', '$(x+h)^n - x^n = nx^{n-1}h + \\frac{n(n-1)}{2}x^{n-2}h^2 + \\cdots$\n\nThe $x^n$ terms cancel.'],
        ['Divide by $h$', '$$\\frac{(x+h)^n - x^n}{h} = nx^{n-1} + \\frac{n(n-1)}{2}x^{n-2}h + \\cdots$$\n\nEvery term except the first still has an $h$ in it.'],
        ['Take the limit as $h \\to 0$', 'All terms with $h$ vanish, leaving:\n$$\\lim_{h \\to 0} = nx^{n-1}$$\n\nThat is it. The power rule says: bring the exponent down as a coefficient, then reduce the exponent by 1.']
      ]
    },

    'Product Rule': {
      title: 'Why the Product Rule Works',
      steps: [
        ['Start with the definition', 'Let $P(x) = f(x) \\cdot g(x)$. We want $P\'(x)$:\n$$P\'(x) = \\lim_{h \\to 0}\\frac{f(x+h)g(x+h) - f(x)g(x)}{h}$$'],
        ['The clever trick: add and subtract the same thing', 'Add $f(x+h)g(x)$ and subtract it (net zero):\n$$= \\lim_{h \\to 0}\\frac{f(x+h)g(x+h) - f(x+h)g(x) + f(x+h)g(x) - f(x)g(x)}{h}$$'],
        ['Group the terms', '$$= \\lim_{h \\to 0}\\left[f(x+h)\\cdot\\frac{g(x+h)-g(x)}{h} + g(x)\\cdot\\frac{f(x+h)-f(x)}{h}\\right]$$\n\nWe factored $f(x+h)$ from the first pair and $g(x)$ from the second.'],
        ['Recognize the limits', 'As $h \\to 0$:\n- $f(x+h) \\to f(x)$\n- $\\frac{g(x+h)-g(x)}{h} \\to g\'(x)$\n- $\\frac{f(x+h)-f(x)}{h} \\to f\'(x)$'],
        ['Result', '$$P\'(x) = f(x) \\cdot g\'(x) + g(x) \\cdot f\'(x)$$\n\nIn short: (first)(derivative of second) + (second)(derivative of first).']
      ]
    },

    'Quotient Rule': {
      title: 'Why the Quotient Rule Works',
      steps: [
        ['Write as a product', 'Instead of proving from scratch, write $\\frac{f}{g} = f \\cdot g^{-1}$ and use the product rule + chain rule.'],
        ['Apply the product rule', '$$\\frac{d}{dx}[f \\cdot g^{-1}] = f\' \\cdot g^{-1} + f \\cdot \\frac{d}{dx}[g^{-1}]$$'],
        ['Differentiate $g^{-1}$ using the chain rule', '$$\\frac{d}{dx}[g^{-1}] = \\frac{d}{dx}[g(x)]^{-1} = -[g(x)]^{-2} \\cdot g\'(x) = \\frac{-g\'(x)}{[g(x)]^2}$$'],
        ['Combine everything', '$$= \\frac{f\'(x)}{g(x)} + f(x) \\cdot \\frac{-g\'(x)}{[g(x)]^2} = \\frac{f\'(x)g(x) - f(x)g\'(x)}{[g(x)]^2}$$\n\nThat is the quotient rule. It is really just the product rule in disguise.']
      ]
    },

    'Chain Rule': {
      title: 'Why the Chain Rule Works',
      steps: [
        ['The intuition', 'If $y$ depends on $u$ which depends on $x$, then a small change in $x$ causes a change in $u$, which causes a change in $y$. The rates multiply.'],
        ['Set up', 'Let $y = f(u)$ where $u = g(x)$. We want $\\frac{dy}{dx}$.'],
        ['Write the difference quotient', '$$\\frac{\\Delta y}{\\Delta x} = \\frac{\\Delta y}{\\Delta u} \\cdot \\frac{\\Delta u}{\\Delta x}$$\n\nThis is just multiplying and dividing by $\\Delta u$ -- the $\\Delta u$ terms cancel.'],
        ['Take the limit', 'As $\\Delta x \\to 0$, we also have $\\Delta u \\to 0$ (since $g$ is continuous), so:\n$$\\frac{dy}{dx} = \\frac{dy}{du} \\cdot \\frac{du}{dx} = f\'(u) \\cdot g\'(x) = f\'(g(x)) \\cdot g\'(x)$$'],
        ['In words', 'The derivative of a composite function = (outer derivative evaluated at inner) times (inner derivative). The rates of change multiply like gear ratios.']
      ]
    },

    // ── Limit Theorems ──

    'Squeeze Theorem': {
      title: 'Why the Squeeze Theorem Works',
      steps: [
        ['Setup', 'Suppose $g(x) \\leq f(x) \\leq h(x)$ near $a$, and $\\lim_{x \\to a} g(x) = \\lim_{x \\to a} h(x) = L$.'],
        ['What we know', 'Given any $\\varepsilon > 0$, there exists $\\delta$ such that when $|x-a| < \\delta$:\n- $|g(x) - L| < \\varepsilon$, meaning $L - \\varepsilon < g(x)$\n- $|h(x) - L| < \\varepsilon$, meaning $h(x) < L + \\varepsilon$'],
        ['Squeeze f in the middle', 'Since $g(x) \\leq f(x) \\leq h(x)$:\n$$L - \\varepsilon < g(x) \\leq f(x) \\leq h(x) < L + \\varepsilon$$'],
        ['Conclude', 'So $|f(x) - L| < \\varepsilon$ whenever $|x - a| < \\delta$. Since this works for ANY $\\varepsilon > 0$, we have $\\lim f(x) = L$.\n\nThe function $f$ is trapped between two functions that both approach $L$, so $f$ has no choice but to approach $L$ too.']
      ]
    },

    'Intermediate Value Theorem': {
      title: 'Why the IVT Works (Intuition)',
      steps: [
        ['What it says', 'If $f$ is continuous on $[a,b]$ and $k$ is between $f(a)$ and $f(b)$, then $f(c) = k$ for some $c$ in $(a,b)$.'],
        ['The key idea: continuity means no jumps', 'A continuous function can be drawn without lifting your pen. If the function starts below the line $y = k$ and ends above it (or vice versa), the curve MUST cross that line somewhere.'],
        ['Why continuity is essential', 'Without continuity, the function could JUMP over the value $k$. For example, a step function goes from 0 to 2 without ever equaling 1. Continuity prevents this.'],
        ['The rigorous proof uses completeness', 'Define $S = \\{x \\in [a,b] : f(x) < k\\}$. This set is nonempty and bounded, so by the Completeness Axiom it has a supremum $c = \\sup S$. Using continuity, one shows $f(c) = k$. The details are in Chapter 10 (Real Analysis).']
      ]
    },

    'Mean Value Theorem': {
      title: 'Why the MVT Works',
      steps: [
        ['What it says', 'If $f$ is continuous on $[a,b]$ and differentiable on $(a,b)$, there exists $c \\in (a,b)$ where $f\'(c) = \\frac{f(b)-f(a)}{b-a}$.'],
        ['The clever construction', 'Define $g(x) = f(x) - \\left[f(a) + \\frac{f(b)-f(a)}{b-a}(x-a)\\right]$.\n\nThis subtracts the SECANT LINE from $f$. So $g$ measures how far $f$ is from the straight line connecting $(a, f(a))$ to $(b, f(b))$.'],
        ['Key observation', '$g(a) = 0$ and $g(b) = 0$. The function $g$ starts and ends at zero. Also, $g$ is continuous on $[a,b]$ and differentiable on $(a,b)$.'],
        ['Apply Rolle\'s Theorem', 'Since $g(a) = g(b) = 0$, by Rolle\'s Theorem there exists $c \\in (a,b)$ where $g\'(c) = 0$.'],
        ['Compute $g\'(c) = 0$', '$g\'(x) = f\'(x) - \\frac{f(b)-f(a)}{b-a}$, so:\n$$0 = f\'(c) - \\frac{f(b)-f(a)}{b-a}$$\n$$f\'(c) = \\frac{f(b)-f(a)}{b-a}$$\n\nAt some point, the instantaneous rate equals the average rate.']
      ]
    },

    // ── FTC ──

    'Fundamental Theorem of Calculus': {
      title: 'Why the FTC Works',
      steps: [
        ['FTC Part 1: Setup', 'Define $F(x) = \\int_a^x f(t)\\,dt$. We want to show $F\'(x) = f(x)$.'],
        ['Write the difference quotient', '$$F\'(x) = \\lim_{h \\to 0}\\frac{F(x+h) - F(x)}{h} = \\lim_{h \\to 0}\\frac{1}{h}\\int_x^{x+h} f(t)\\,dt$$\n\nThe integral from $a$ to $x+h$ minus the integral from $a$ to $x$ leaves just the integral from $x$ to $x+h$.'],
        ['Approximate the integral', 'For small $h$, the function $f$ is approximately constant (equal to $f(x)$) on the tiny interval $[x, x+h]$. So:\n$$\\int_x^{x+h} f(t)\\,dt \\approx f(x) \\cdot h$$'],
        ['Take the limit', '$$F\'(x) = \\lim_{h \\to 0}\\frac{f(x) \\cdot h + \\text{(tiny error)}}{h} = f(x)$$\n\nThe "tiny error" vanishes because $f$ is continuous. So the derivative of the area function IS the original function.'],
        ['FTC Part 2 follows', 'If $F\'(x) = f(x)$ and $G$ is ANY antiderivative of $f$, then $G(x) = F(x) + C$.\n$$\\int_a^b f(x)\\,dx = F(b) = F(b) - F(a) = G(b) - G(a)$$\n\nThis is why you can evaluate definite integrals by finding antiderivatives.']
      ]
    },

    // ── Integration rules ──

    'Integration by Parts': {
      title: 'Where Integration by Parts Comes From',
      steps: [
        ['Start with the product rule', 'We know: $\\frac{d}{dx}[u \\cdot v] = u\'v + uv\'$'],
        ['Integrate both sides', '$$\\int \\frac{d}{dx}[uv]\\,dx = \\int u\'v\\,dx + \\int uv\'\\,dx$$\n$$uv = \\int v\\,du + \\int u\\,dv$$'],
        ['Rearrange', '$$\\int u\\,dv = uv - \\int v\\,du$$\n\nThat is integration by parts. It is just the product rule run backwards.'],
        ['Why it helps', 'If $\\int u\\,dv$ is hard, maybe $\\int v\\,du$ is easier. We trade one integral for a (hopefully) simpler one. The LIATE rule helps you choose $u$ so that $du$ is simpler than $u$.']
      ]
    },

    // ── Series ──

    'Taylor Series': {
      title: 'Where Taylor Series Come From',
      steps: [
        ['The goal', 'We want to write $f(x)$ as a polynomial: $f(x) = c_0 + c_1 x + c_2 x^2 + c_3 x^3 + \\cdots$. What should the coefficients be?'],
        ['Find $c_0$: plug in $x = 0$', '$f(0) = c_0$. So $c_0 = f(0)$.'],
        ['Find $c_1$: take the derivative and plug in $x = 0$', '$f\'(x) = c_1 + 2c_2 x + 3c_3 x^2 + \\cdots$, so $f\'(0) = c_1$.'],
        ['Find $c_2$: second derivative', '$f\'\'(x) = 2c_2 + 6c_3 x + \\cdots$, so $f\'\'(0) = 2c_2$, meaning $c_2 = \\frac{f\'\'(0)}{2}$.'],
        ['The pattern', 'The $n$th derivative at 0 gives: $f^{(n)}(0) = n! \\cdot c_n$, so:\n$$c_n = \\frac{f^{(n)}(0)}{n!}$$\n\nThe Taylor series is:\n$$f(x) = \\sum_{n=0}^{\\infty}\\frac{f^{(n)}(0)}{n!}x^n$$\n\nEach coefficient is determined by matching the function\'s derivatives at the center point.']
      ]
    },

    // ── Linear Algebra ──

    'Eigenvalues & Eigenvectors': {
      title: 'Why det(A - lambda I) = 0 Finds Eigenvalues',
      steps: [
        ['Start with the definition', '$A\\mathbf{v} = \\lambda\\mathbf{v}$ means the matrix only stretches $\\mathbf{v}$, not rotates it.'],
        ['Rearrange', '$A\\mathbf{v} - \\lambda\\mathbf{v} = \\mathbf{0}$, which is $(A - \\lambda I)\\mathbf{v} = \\mathbf{0}$.'],
        ['We need a nonzero solution', 'We want $\\mathbf{v} \\neq \\mathbf{0}$. The equation $(A - \\lambda I)\\mathbf{v} = \\mathbf{0}$ has a nonzero solution ONLY when the matrix $(A - \\lambda I)$ is NOT invertible.'],
        ['When is a matrix not invertible?', 'A matrix is not invertible when its determinant is zero. So we need:\n$$\\det(A - \\lambda I) = 0$$\n\nThis is the "characteristic equation." Solving it gives the eigenvalues $\\lambda$.'],
        ['Then find eigenvectors', 'For each $\\lambda$, plug back into $(A - \\lambda I)\\mathbf{v} = \\mathbf{0}$ and solve by row reduction. The nonzero solutions are the eigenvectors.']
      ]
    },

    // ── Probability ──

    'Probability Axioms': {
      title: 'Why These Three Axioms Are Enough',
      steps: [
        ['The three axioms', '1. $P(E) \\geq 0$ for every event\n2. $P(\\Omega) = 1$ (something must happen)\n3. If $A$ and $B$ are disjoint: $P(A \\cup B) = P(A) + P(B)$'],
        ['Deriving P(empty set) = 0', '$\\Omega = \\Omega \\cup \\emptyset$ (disjoint), so $P(\\Omega) = P(\\Omega) + P(\\emptyset)$, giving $P(\\emptyset) = 0$.'],
        ['Deriving the complement rule', '$\\Omega = A \\cup A^c$ (disjoint), so $1 = P(A) + P(A^c)$, giving $P(A^c) = 1 - P(A)$.'],
        ['Everything else follows', 'From these three simple rules, we can derive ALL of probability theory: conditional probability, Bayes\' theorem, independence, random variables, distributions. Kolmogorov showed in 1933 that these three axioms are all you need.']
      ]
    },

    "Lagrange's Theorem": {
      title: 'Why Subgroup Order Divides Group Order',
      steps: [
        ['The idea: cosets partition the group', 'Given subgroup $H$ of $G$, define cosets $gH = \\{gh : h \\in H\\}$ for each $g \\in G$.'],
        ['Cosets are the same size as H', 'The map $h \\mapsto gh$ is a bijection from $H$ to $gH$, so $|gH| = |H|$.'],
        ['Cosets don\'t overlap', 'Two cosets are either identical or completely disjoint. (If they share one element, they share all.)'],
        ['Cosets cover all of G', 'Every element $g$ belongs to the coset $gH$, so the cosets partition $G$ into non-overlapping chunks of size $|H|$. Therefore $|G| = (\\text{number of cosets}) \\times |H|$, which means $|H|$ divides $|G|$.']
      ]
    }
  };

  // ── Match proof to box title ──

  function findProofKey(titleText) {
    var clean = titleText.replace(/\s+/g, ' ').trim();
    for (var key in PROOFS) {
      if (clean.indexOf(key) !== -1) return key;
    }
    for (var key2 in PROOFS) {
      var lk = key2.toLowerCase(), lt = clean.toLowerCase();
      if (lt.indexOf(lk) !== -1 || lk.indexOf(lt) !== -1) return key2;
    }
    return null;
  }

  // ── Build proof panel HTML ──

  function buildProofHTML(data) {
    var html = '<div class="proof-panel">';
    html += '<div class="proof-panel-title">' + data.title + '</div>';
    data.steps.forEach(function (step, i) {
      html += '<div class="proof-step">';
      html += '<div class="proof-step-head"><span class="proof-step-num">' + (i + 1) + '</span>' + step[0] + '</div>';
      html += '<div class="proof-step-body">' + step[1].replace(/\n/g, '<br>') + '</div>';
      html += '</div>';
    });
    html += '</div>';
    return html;
  }

  // ── Inject proof buttons ──

  function inject() {
    var boxes = document.querySelectorAll('.formula-box, .theorem-box, .definition-box');
    boxes.forEach(function (box) {
      if (box.querySelector('.proof-toggle-btn')) return;
      var titleEl = box.querySelector('.box-title');
      if (!titleEl) return;
      var key = findProofKey(titleEl.textContent);
      if (!key) return;
      var data = PROOFS[key];

      var btn = document.createElement('button');
      btn.className = 'proof-toggle-btn';
      btn.textContent = 'Why does this work? See the proof';

      var panel = document.createElement('div');
      panel.className = 'proof-panel-wrap';
      panel.innerHTML = buildProofHTML(data);
      panel.style.display = 'none';

      btn.addEventListener('click', function () {
        var isOpen = panel.style.display !== 'none';
        panel.style.display = isOpen ? 'none' : 'block';
        btn.textContent = isOpen ? 'Why does this work? See the proof' : 'Hide proof';
        if (!isOpen && typeof renderMathInElement === 'function') {
          renderMathInElement(panel, {
            delimiters: [
              { left: '$$', right: '$$', display: true },
              { left: '$', right: '$', display: false }
            ],
            throwOnError: false
          });
        }
      });

      var content = box.querySelector('.box-content');
      if (content) {
        content.appendChild(btn);
        content.appendChild(panel);
      }
    });
  }

  // ── Styles ──

  var style = document.createElement('style');
  style.textContent = [
    '.proof-toggle-btn {',
    '  display: inline-block;',
    '  margin-top: 0.75rem;',
    '  padding: 0.4rem 0.85rem;',
    '  border: 1px solid var(--border-color);',
    '  border-radius: var(--radius-pill);',
    '  background: transparent;',
    '  color: var(--text-muted);',
    '  font-family: "Inter", sans-serif;',
    '  font-size: 0.78rem;',
    '  font-weight: 500;',
    '  cursor: pointer;',
    '  transition: all 0.2s ease;',
    '}',
    '.proof-toggle-btn:hover {',
    '  color: var(--accent);',
    '  border-color: var(--accent);',
    '  background: var(--accent-glow);',
    '}',
    '.proof-panel-wrap { margin-top: 0.85rem; }',
    '.proof-panel {',
    '  padding: 1rem;',
    '  background: rgba(108, 99, 255, 0.04);',
    '  border: 1px solid var(--border-color);',
    '  border-radius: var(--radius-md);',
    '  animation: fadeIn 0.3s ease;',
    '}',
    '.proof-panel-title {',
    '  font-family: "Inter", sans-serif;',
    '  font-size: 0.88rem;',
    '  font-weight: 700;',
    '  color: var(--text-heading);',
    '  margin-bottom: 0.85rem;',
    '  padding-bottom: 0.5rem;',
    '  border-bottom: 1px solid var(--border-subtle);',
    '}',
    '.proof-step {',
    '  margin-bottom: 0.85rem;',
    '}',
    '.proof-step:last-child { margin-bottom: 0; }',
    '.proof-step-head {',
    '  display: flex;',
    '  align-items: center;',
    '  gap: 0.5rem;',
    '  font-weight: 600;',
    '  font-size: 0.85rem;',
    '  color: var(--text-heading);',
    '  margin-bottom: 0.3rem;',
    '}',
    '.proof-step-num {',
    '  width: 22px;',
    '  height: 22px;',
    '  border-radius: 5px;',
    '  border: 1px solid var(--accent);',
    '  color: var(--accent);',
    '  font-family: "JetBrains Mono", monospace;',
    '  font-size: 0.68rem;',
    '  font-weight: 700;',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  flex-shrink: 0;',
    '}',
    '.proof-step-body {',
    '  font-size: 0.88rem;',
    '  line-height: 1.75;',
    '  color: var(--text-secondary);',
    '  padding-left: 32px;',
    '}'
  ].join('\n');
  document.head.appendChild(style);

  // ── Init ──

  function init() {
    inject();
    var obs = new MutationObserver(function () { setTimeout(inject, 300); });
    var main = document.querySelector('.main-content') || document.body;
    obs.observe(main, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 900); });
  } else {
    setTimeout(init, 900);
  }
})();
