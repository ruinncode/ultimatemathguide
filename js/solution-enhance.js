(function () {
  'use strict';

  // ============================================================
  //  SOLUTION ENHANCER
  //  Adds "Strategy" headers and "Key Takeaway" footers to all
  //  solutions that don't already have hand-written ones.
  //  Maps problem prefixes to strategy tips.
  // ============================================================

  const STRATEGIES = {
    '1.1': { strat: 'Ask yourself: can this number be written as a fraction p/q of integers? If yes → rational. If no → irrational. Remember: every set is nested inside the ones above it.', takeaway: 'The number sets form a chain: ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ ⊂ ℂ. Classify by checking the most specific set first.' },
    '1.2': { strat: 'Look for opportunities to factor, cancel common factors, or apply exponent/log rules. The key to algebra is recognizing which identity or rule applies.', takeaway: 'Algebra is about pattern recognition — factor what you can, simplify, and always check for extraneous solutions.' },
    '1.3': { strat: 'Start by identifying the function type. For domain: find where the function is undefined (division by zero, square roots of negatives). For composition: work inside-out.', takeaway: 'Functions are the building blocks of calculus. Knowing domain, range, and composition is essential for everything that follows.' },
    '1.4': { strat: 'Draw the unit circle or a reference triangle. Identify the reference angle, determine the quadrant, and use ASTC (All-Students-Take-Calculus) for signs.', takeaway: 'Most trig problems reduce to the unit circle. If you know the values at 0°, 30°, 45°, 60°, 90°, you can handle any standard angle.' },
    '2.1': { strat: 'Try direct substitution first. If you get 0/0, simplify algebraically (factor, conjugate, or common denominator) to cancel the problematic factor, then substitute again.', takeaway: 'Limits describe approaching behavior, not the value AT the point. The key technique is removing the 0/0 by algebraic manipulation.' },
    '2.2': { strat: 'Start from the end: you want |f(x) − L| < ε. Work backwards to find what restriction on |x − a| (i.e., δ) will guarantee this. Then write the proof forwards.', takeaway: 'ε-δ proofs follow a fixed structure: "Given ε > 0, choose δ = [formula]. Then if 0 < |x−a| < δ, we have |f(x)−L| < ε." The hard part is finding the right δ.' },
    '2.3': { strat: 'Check the three conditions: (1) f(a) is defined, (2) the limit exists, (3) the limit equals f(a). For piecewise functions, check where the pieces meet.', takeaway: 'Continuity means "no surprises" — the function does what you expect it to do at every point. Discontinuities are classified as removable, jump, or infinite.' },
    '3.1': { strat: 'Use the limit definition: f\'(x) = lim[f(x+h)−f(x)]/h as h→0. Replace x with (x+h), subtract f(x), simplify, divide by h, then take the limit.', takeaway: 'The limit definition is the foundation, but you won\'t use it often in practice — the differentiation rules (power rule, etc.) are much faster.' },
    '3.2': { strat: 'Identify which rule to use: power rule for xⁿ, product rule for f·g, quotient rule for f/g, chain rule for f(g(x)). Most problems combine 2-3 rules.', takeaway: 'Differentiation is mechanical once you know the rules. The chain rule is the most important — it handles all composite functions.' },
    '3.3': { strat: 'Read carefully to identify the type: optimization (find max/min), related rates (find a rate given another rate), L\'Hôpital (0/0 or ∞/∞ limit), or curve sketching.', takeaway: 'Applications of derivatives always follow a recipe. Learn the recipe for each type and practice recognizing which one to use.' },
    '4.1': { strat: 'Ask: "what function, when differentiated, gives me this?" Use the power rule in reverse (add 1 to exponent, divide by new exponent), and don\'t forget +C.', takeaway: 'Integration is "undoing" differentiation. The +C is essential because derivatives of constants vanish — there are infinitely many antiderivatives.' },
    '4.2': { strat: 'For FTC Part 2: find the antiderivative F, then compute F(b) − F(a). For FTC Part 1: the derivative of ∫ₐˣ f(t)dt is just f(x) (with chain rule if needed).', takeaway: 'The FTC connects the two pillars of calculus. Part 2 makes definite integrals computable; Part 1 says differentiation undoes integration.' },
    '4.3': { strat: 'Decision guide: see f(g(x))·g\'(x)? → u-sub. Product of different types? → IBP. Rational function? → partial fractions. Square root of quadratic? → trig sub.', takeaway: 'Integration technique selection is the hardest skill. Practice the decision tree until it becomes second nature.' },
    '5.1': { strat: 'First check: do the terms approach 0? If not, the series diverges (Divergence Test). Then try: geometric? p-series? ratio test? comparison? alternating?', takeaway: 'No single test works for all series. Build a toolkit and try tests in order of simplicity.' },
    '5.2': { strat: 'To find a Taylor series: either compute derivatives and use the formula, or manipulate a known series (eˣ, sin x, cos x, 1/(1−x)) using substitution, differentiation, or integration.', takeaway: 'Taylor series let you replace complex functions with polynomials. The more terms you keep, the better the approximation near the center.' },
    '6.1': { strat: 'For parametric derivatives: dy/dx = (dy/dt)/(dx/dt). For arc length: integrate √((dx/dt)² + (dy/dt)²). To sketch: make a table of t, x, y values.', takeaway: 'Parametric curves separate the x and y motions. Think of t as time — x(t) is the horizontal position and y(t) is the vertical position at time t.' },
    '6.2': { strat: 'For polar area: A = ½∫r²dθ. To convert: x = r·cos θ, y = r·sin θ. For tangent lines: use dy/dx = (dr/dθ·sinθ + r·cosθ)/(dr/dθ·cosθ − r·sinθ).', takeaway: 'Polar coordinates are natural for curves with rotational symmetry. Remember the ½ in the area formula!' },
    '7.1': { strat: 'Treat the other variables as constants and differentiate normally. For the gradient: compute (∂f/∂x, ∂f/∂y) — it points uphill.', takeaway: 'Partial derivatives extend single-variable calculus to multiple dimensions. Each partial tells you the rate of change in one direction.' },
    '7.2': { strat: 'Set up the bounds carefully. For rectangular regions: constants on the outer integral, functions on the inner. Consider switching to polar if the region is circular.', takeaway: 'Double integrals compute volume. The hardest part is setting up the bounds correctly — always sketch the region first.' },
    '8.1': { strat: 'Row reduce to echelon form to solve systems. For inverses: augment [A|I] and row reduce to [I|A⁻¹]. For determinants: use cofactor expansion or row operations.', takeaway: 'Matrix algebra is the language of linear systems. Row reduction is the Swiss Army knife — it solves almost every problem.' },
    '8.3': { strat: 'To find eigenvalues: solve det(A − λI) = 0. To find eigenvectors: for each eigenvalue λ, solve (A − λI)v = 0 by row reduction.', takeaway: 'Eigenvalues tell you HOW MUCH a transformation stretches. Eigenvectors tell you WHICH DIRECTIONS are only stretched (not rotated).' },
    '9.1': { strat: 'Classify the ODE first: separable? → separate and integrate both sides. Linear? → find the integrating factor μ = e^(∫P dx). Exact? → find the potential function.', takeaway: 'Different ODE types need different techniques. Always classify first, then apply the matching method.' },
    '9.2': { strat: 'Write the characteristic equation ar² + br + c = 0. The roots determine the solution form: distinct reals → eʳ¹ˣ, eʳ²ˣ; complex α±βi → eᵅˣ cos/sin(βx); repeated → eʳˣ, xeʳˣ.', takeaway: 'Second-order constant-coefficient ODEs reduce to a quadratic equation. The nature of the roots (real/complex/repeated) determines the solution structure.' },
    '10.1': { strat: 'Use the Completeness Axiom: every nonempty bounded-above set has a supremum in ℝ. Many proofs start by defining a set and taking its sup or inf.', takeaway: 'The real numbers are "complete" — no gaps. This simple axiom is the foundation of all rigorous analysis.' },
    '10.2': { strat: 'To prove convergence: given ε > 0, find N such that n ≥ N implies |aₙ − L| < ε. The key is bounding |aₙ − L| and choosing N to make that bound < ε.', takeaway: 'Convergence proofs have a fixed structure. The creative part is finding the right bound and the right N.' },
    '11.1': { strat: 'Check the four group axioms systematically: (1) closure, (2) associativity, (3) identity exists, (4) every element has an inverse. For finite groups, build the Cayley table.', takeaway: 'Groups abstract the idea of symmetry. Once you verify the axioms, all of group theory applies.' },
    '12.1': { strat: 'Count the favorable outcomes and divide by total outcomes. For conditional probability: P(A|B) = P(A∩B)/P(B). Use tree diagrams for multi-step problems.', takeaway: 'Probability is about careful counting and applying the rules (addition, multiplication, Bayes\'). Draw diagrams!' },
    '12.2': { strat: 'Identify the distribution type first (binomial, Poisson, normal, etc.). Then use the appropriate formula for mean, variance, and probabilities.', takeaway: 'Each distribution models a specific type of randomness. Matching the right distribution to the problem is the crucial first step.' },
  };

  function enhance() {
    document.querySelectorAll('.problem-solution').forEach(sol => {
      if (sol.querySelector('.sol-strategy') || sol.dataset.enhanced) return;
      sol.dataset.enhanced = '1';

      const problem = sol.closest('.problem');
      if (!problem) return;
      const numEl = problem.querySelector('.problem-number');
      if (!numEl) return;
      const pid = numEl.textContent.trim();
      const prefix = pid.replace(/^(\d+\.\d+).*/, '$1');
      const data = STRATEGIES[prefix];
      if (!data) return;

      const strat = document.createElement('div');
      strat.className = 'sol-strategy';
      strat.innerHTML = '💡 <strong>Strategy:</strong> ' + data.strat;
      sol.insertBefore(strat, sol.firstChild);

      if (!sol.querySelector('.sol-takeaway')) {
        const take = document.createElement('div');
        take.className = 'sol-takeaway';
        take.innerHTML = '📌 <strong>Key takeaway:</strong> ' + data.takeaway;
        sol.appendChild(take);
      }
    });
  }

  function init() {
    enhance();
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('show-solution-btn')) {
        setTimeout(enhance, 150);
      }
    });
    const obs = new MutationObserver(() => setTimeout(enhance, 200));
    const main = document.querySelector('.main-content') || document.body;
    obs.observe(main, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 800));
  } else {
    setTimeout(init, 800);
  }
})();
