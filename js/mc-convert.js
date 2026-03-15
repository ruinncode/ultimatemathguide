/* mc-convert.js – Converts free-response problems into multiple choice */
(function () {
  'use strict';

  // ─── Multiple-Choice Data ────────────────────────────────────────────
  // Each key = problem number (matches .problem-number text).
  // a = index of correct answer, o = 4 options, w = 4 explanations.

  var MC = {

    // ══════════════════════════════════════════════════════════════════════
    //  CHAPTER 1 — Foundations
    // ══════════════════════════════════════════════════════════════════════

    '1.1.3': {
      a: 0,
      o: [
        '$(-3,\\, 3)$',
        '$[-3,\\, 3]$',
        '$(-9,\\, 9)$',
        '$[-3,\\, 3)$'
      ],
      w: [
        'Solving $x^2 < 9$ gives $-3 < x < 3$; strict inequality means open endpoints.',
        'Closed brackets would include $x = \\pm 3$, but $x^2 < 9$ is strict — $9 \\not< 9$.',
        'This results from solving $|x| < 9$ instead of correctly taking the square root to get $|x| < 3$.',
        'There is no reason to treat the endpoints differently; both are excluded by the strict inequality.'
      ]
    },

    '1.1.4': {
      a: 2,
      o: [
        '$16 + 9i$',
        '$6 - 9i$',
        '$16 - 9i$',
        '$16 - 11i$'
      ],
      w: [
        'Sign error on the imaginary part: $-10i + i = -9i$, not $+9i$.',
        'The $i^2 = -1$ term in the product contributes $+8$ to the real part, giving $11$ not $1$.',
        'Expanding $(3+2i)(1-4i) = 11-10i$, then adding $(5+i)$ gives $16-9i$.',
        'Adding $+i$ to $-10i$ yields $-9i$, not $-11i$ — check the sign when combining imaginary parts.'
      ]
    },

    '1.2.1': {
      a: 1,
      o: [
        '$(x^2 - 4)(x^2 + 4)$',
        '$(x - 2)(x + 2)(x^2 + 4)$',
        '$(x - 2)^2(x + 2)^2$',
        '$(x - 4)(x + 4)$'
      ],
      w: [
        'This is only partially factored — $x^2-4$ factors further into $(x-2)(x+2)$.',
        'Applying difference of squares twice: $x^4-16 = (x^2-4)(x^2+4) = (x-2)(x+2)(x^2+4)$.',
        'Squaring each factor is incorrect; $x^4-16 \\neq (x-2)^2(x+2)^2$ since the right side equals $(x^2-4)^2 = x^4-8x^2+16$.',
        'This treats $x^4-16$ as if it were $x^2-16$, ignoring the fourth power.'
      ]
    },

    '1.2.2': {
      a: 0,
      o: [
        '$\\dfrac{x-3}{x+2}$',
        '$\\dfrac{x+3}{x+2}$',
        '$\\dfrac{x-3}{x+3}$',
        '$1$'
      ],
      w: [
        'Factor to get $\\frac{(x-3)(x+3)}{(x+2)(x+3)}$; cancel $(x+3)$ to obtain $\\frac{x-3}{x+2}$.',
        'Sign error in the numerator factorisation: $x^2-9 = (x-3)(x+3)$, not $(x+3)^2$.',
        'The denominator factors as $(x+2)(x+3)$, so the $(x+3)$ cancels from the denominator, not the $(x+2)$.',
        'The expression does not simplify to $1$; that would require the numerator and denominator to be identical.'
      ]
    },

    '1.2.3': {
      a: 2,
      o: [
        '$x = 29$',
        '$x = 3$',
        '$x = 5$',
        '$x = -5$'
      ],
      w: [
        'This comes from solving $x+3)(x-1) = 32$ incorrectly — expand and solve the quadratic carefully.',
        'Substituting $x=3$ gives $\\log_2(6) + \\log_2(2) = \\log_2(12) \\neq 5$.',
        'Combine logs: $\\log_2((x+3)(x-1)) = 5$, so $(x+3)(x-1) = 32$. Solving $x^2+2x-35=0$ gives $x=5$ (reject $x=-7$).',
        'Negative value: $x=-5$ makes $x+3 = -2$, and $\\log_2$ of a negative number is undefined.'
      ]
    },

    '1.2.6': {
      a: 3,
      o: [
        '$(2x - 3)(x^2 - 4)$',
        '$(x + 3)(2x^2 - 4)$',
        '$(2x + 3)(x^2 + 4)$',
        '$(2x + 3)(x - 2)(x + 2)$'
      ],
      w: [
        'The leading coefficient $2x^3$ requires $2x+3$, not $2x-3$; check signs by expanding.',
        'Expanding gives $2x^3+6x^2-4x-12$, which does not match the original.',
        'Using $x^2+4$ instead of $x^2-4$ would give $2x^3+3x^2+8x+12$, not the original.',
        'Group as $(2x^3+3x^2)+(-8x-12) = x^2(2x+3)-4(2x+3) = (2x+3)(x^2-4) = (2x+3)(x-2)(x+2)$.'
      ]
    },

    '1.2.7': {
      a: 1,
      o: [
        '$x = 7$',
        '$x = 4$',
        '$x = -2$',
        '$x = 1$'
      ],
      w: [
        'Check: $\\log_3(6) - \\log_3(12) = \\log_3(1/2) \\neq \\log_3(1/3)$.',
        'Combine: $\\log_3\\!\\left(\\frac{x-1}{x+5}\\right) = \\log_3\\!\\left(\\frac{1}{3}\\right)$, so $\\frac{x-1}{x+5}=\\frac{1}{3}$. Cross-multiply to get $x=4$.',
        '$x=-2$ gives $\\log_3(-3)$, which is undefined.',
        '$x=1$ gives $\\log_3(0)$, which is undefined.'
      ]
    },

    '1.3.3': {
      a: 0,
      o: [
        '$f^{-1}(x) = \\dfrac{x + 2}{x - 3}$',
        '$f^{-1}(x) = \\dfrac{x - 2}{x + 3}$',
        '$f^{-1}(x) = \\dfrac{3x - 2}{x + 1}$',
        '$f^{-1}(x) = \\dfrac{x + 2}{3 - x}$'
      ],
      w: [
        'Swap $x$ and $y$ in $y=\\frac{3x+2}{x-1}$ and solve: $x(y-1)=3y+2 \\Rightarrow y=\\frac{x+2}{x-3}$.',
        'Sign errors when isolating $y$ — verify by checking $f(f^{-1}(x))=x$.',
        'This comes from an algebraic error when moving terms; expand to verify it does not invert $f$.',
        'Note $\\frac{x+2}{3-x} = -\\frac{x+2}{x-3}$; the missing negative sign makes this incorrect.'
      ]
    },

    '1.4.1': {
      a: 1,
      o: [
        '$\\dfrac{1}{2}$',
        '$-\\dfrac{1}{2}$',
        '$-\\dfrac{\\sqrt{3}}{2}$',
        '$\\dfrac{\\sqrt{3}}{2}$'
      ],
      w: [
        'Forgot the sign: $\\frac{7\\pi}{6}$ is in Quadrant III where sine is negative.',
        '$\\frac{7\\pi}{6} = \\pi + \\frac{\\pi}{6}$, reference angle $\\frac{\\pi}{6}$; in QIII sine is negative, so $-\\frac{1}{2}$.',
        'This is $\\cos(\\frac{7\\pi}{6})$, not $\\sin(\\frac{7\\pi}{6})$ — confused sine and cosine values.',
        'This is $\\sin(\\frac{\\pi}{3})$ — used the wrong reference angle.'
      ]
    },

    '1.4.4': {
      a: 3,
      o: [
        '$\\dfrac{\\sqrt{6}+\\sqrt{2}}{4}$',
        '$\\dfrac{\\sqrt{2}-\\sqrt{6}}{4}$',
        '$\\dfrac{\\sqrt{3}}{4}$',
        '$\\dfrac{\\sqrt{6}-\\sqrt{2}}{4}$'
      ],
      w: [
        'This is $\\cos(15°)$, not $\\cos(75°)$ — the addition formula sign was reversed.',
        'Sign error: $\\cos(45°)\\cos(30°)$ is positive, giving $\\sqrt{6}$ with a positive sign in the numerator.',
        'This oversimplifies; the sum formula does not reduce to a single radical.',
        'Using $\\cos(75°) = \\cos(45°+30°) = \\cos 45°\\cos 30° - \\sin 45°\\sin 30° = \\frac{\\sqrt{6}-\\sqrt{2}}{4}$.'
      ]
    },

    // ══════════════════════════════════════════════════════════════════════
    //  CHAPTER 2 — Limits & Continuity
    // ══════════════════════════════════════════════════════════════════════

    '2.1.1': {
      a: 2,
      o: [
        '$0$',
        '$3$',
        '$6$',
        'DNE'
      ],
      w: [
        'Plugging in $x=3$ directly gives $\\frac{0}{0}$, which is indeterminate — you must simplify first.',
        'This confuses the limit value with the point of approach.',
        'Factor: $\\frac{x^2-9}{x-3} = \\frac{(x-3)(x+3)}{x-3} = x+3$. At $x=3$, the limit is $6$.',
        'The $\\frac{0}{0}$ form is indeterminate, not undefined; the limit exists after cancellation.'
      ]
    },

    '2.1.3': {
      a: 1,
      o: [
        '$0$',
        '$\\dfrac{1}{4}$',
        '$\\dfrac{1}{2}$',
        '$4$'
      ],
      w: [
        'The numerator and denominator both approach $0$, but after rationalising the limit is nonzero.',
        'Multiply by $\\frac{\\sqrt{x+4}+2}{\\sqrt{x+4}+2}$ to get $\\frac{1}{\\sqrt{x+4}+2} \\to \\frac{1}{4}$.',
        'This comes from evaluating $\\frac{1}{\\sqrt{0+4}} = \\frac{1}{2}$ without the conjugate simplification.',
        'This is the reciprocal of the correct answer — the denominator is $4$, not the numerator.'
      ]
    },

    '2.1.4': {
      a: 0,
      o: [
        '$\\dfrac{1}{2}$',
        '$0$',
        '$1$',
        '$\\dfrac{1}{3}$'
      ],
      w: [
        'Rewrite as $\\frac{\\tan x - \\sin x}{x^3} = \\frac{\\sin x(1-\\cos x)}{x^3 \\cos x}$. Using Taylor series or L\'H\\hat{o}pital\'s rule yields $\\frac{1}{2}$.',
        'All three terms vanish at $x=0$, but the rates differ — the limit is not $0$.',
        'Applying L\'H\\hat{o}pital\'s rule once is insufficient; you need to continue until the form is determinate.',
        'This results from a small error in the Taylor expansion coefficients.'
      ]
    },

    '2.1.5': {
      a: 3,
      o: [
        '$0$',
        '$\\dfrac{3}{2}$',
        '$\\infty$',
        '$\\dfrac{3}{7}$'
      ],
      w: [
        'When numerator and denominator have the same degree, the limit is the ratio of leading coefficients, not $0$.',
        'This uses the coefficients of $x$ terms ($5$ and $-2$) instead of the leading coefficients.',
        'Same-degree polynomials yield a finite limit, not $\\infty$.',
        'Divide by $x^2$: $\\frac{3 + 5/x - 1/x^2}{7 - 2/x + 4/x^2} \\to \\frac{3}{7}$.'
      ]
    },

    '2.1.6': {
      a: 0,
      o: [
        '$3$',
        '$0$',
        '$1$',
        '$\\dfrac{1}{3}$'
      ],
      w: [
        'Using $\\lim_{u \\to 0}\\frac{\\sin u}{u}=1$ with $u=3x$: $\\frac{\\sin 3x}{x} = 3\\cdot\\frac{\\sin 3x}{3x} \\to 3$.',
        'The limit $\\frac{\\sin u}{u} \\to 1$ applies to $u \\to 0$, but the factor of $3$ from the chain rule must be included.',
        'This is $\\lim\\frac{\\sin u}{u}=1$ without accounting for the coefficient inside the sine.',
        'This inverts the coefficient — the $3$ belongs in the numerator, not the denominator.'
      ]
    },

    '2.3.2': {
      a: 2,
      o: [
        '$k = 2$',
        '$k = 0$',
        '$k = 1$',
        '$k = 3$'
      ],
      w: [
        'This satisfies one side of the limit but not both — check the left-hand and right-hand limits.',
        '$k=0$ typically leaves a jump; both one-sided limits must agree at the boundary.',
        'Setting the left-hand limit equal to the right-hand limit at the boundary gives $k = 1$.',
        'Verify by substituting: $k=3$ creates a discontinuity at the transition point.'
      ]
    },

    '2.3.5': {
      a: 1,
      o: [
        '$a = 5,\\; b = -4$',
        '$a = \\dfrac{11}{2},\\; b = -\\dfrac{9}{2}$',
        '$a = 6,\\; b = -5$',
        '$a = 4,\\; b = -3$'
      ],
      w: [
        'Close, but substituting into both continuity conditions shows a mismatch.',
        'Set up two equations from the continuity requirements at both transition points and solve the $2 \\times 2$ system.',
        'An arithmetic slip in the linear system — double-check each substitution.',
        'This satisfies one boundary condition but not the other.'
      ]
    },

    // ══════════════════════════════════════════════════════════════════════
    //  CHAPTER 3 — Derivatives
    // ══════════════════════════════════════════════════════════════════════

    '3.1.1': {
      a: 0,
      o: [
        '$3$',
        '$5$',
        '$3x$',
        '$0$'
      ],
      w: [
        'The derivative of $3x+5$ is $3$; the slope of a linear function is its coefficient.',
        '$5$ is the constant term (the $y$-intercept), not the slope.',
        'The derivative of $3x$ is $3$, not $3x$ — differentiation reduces the power by one.',
        '$0$ would be the derivative of a constant; $3x+5$ is not constant.'
      ]
    },

    '3.1.2': {
      a: 1,
      o: [
        '$\\dfrac{1}{x^2}$',
        '$-\\dfrac{1}{x^2}$',
        '$-\\dfrac{1}{x}$',
        '$\\ln x$'
      ],
      w: [
        'Forgot the negative sign: the power rule gives $-1 \\cdot x^{-2} = -\\frac{1}{x^2}$.',
        'Rewrite $\\frac{1}{x} = x^{-1}$; by the power rule, $\\frac{d}{dx}x^{-1} = -x^{-2} = -\\frac{1}{x^2}$.',
        'This is $-\\frac{1}{x}$ which would be the derivative of $-\\ln|x|$, not $\\frac{1}{x}$.',
        '$\\ln x$ is the antiderivative of $\\frac{1}{x}$, not its derivative.'
      ]
    },

    '3.1.3': {
      a: 2,
      o: [
        '$\\dfrac{\\sqrt{x}}{2}$',
        '$\\dfrac{1}{\\sqrt{x}}$',
        '$\\dfrac{1}{2\\sqrt{x}}$',
        '$2\\sqrt{x}$'
      ],
      w: [
        'This keeps $\\sqrt{x}$ in the numerator instead of $1$; recall $\\frac{1}{2}x^{-1/2} = \\frac{1}{2\\sqrt{x}}$.',
        'Missing the $\\frac{1}{2}$ coefficient from the power rule exponent.',
        'Write $\\sqrt{x} = x^{1/2}$; power rule gives $\\frac{1}{2}x^{-1/2} = \\frac{1}{2\\sqrt{x}}$.',
        '$2\\sqrt{x}$ is the antiderivative of $\\frac{1}{\\sqrt{x}}$, not the derivative of $\\sqrt{x}$.'
      ]
    },

    '3.2.1': {
      a: 0,
      o: [
        '$35x^4 - 9x^2 + 2$',
        '$7x^4 - 3x^2 + 2$',
        '$35x^5 - 9x^3 + 2x$',
        '$35x^4 - 9x^2 + 2x - 9$'
      ],
      w: [
        'Apply the power rule term by term: $7 \\cdot 5x^4 - 3 \\cdot 3x^2 + 2 \\cdot 1 - 0 = 35x^4 - 9x^2 + 2$.',
        'Forgot to multiply by the original coefficient: $\\frac{d}{dx}(7x^5) = 35x^4$, not $7x^4$.',
        'The exponent should decrease by one when differentiating, not stay the same.',
        'The constant $-9$ vanishes when differentiating, and the $2x$ term becomes just $2$.'
      ]
    },

    '3.2.3': {
      a: 3,
      o: [
        '$2x\\cos x$',
        '$x^2\\cos x$',
        '$2x\\sin x - x^2\\cos x$',
        '$2x\\sin x + x^2\\cos x$'
      ],
      w: [
        'This is only the first term of the product rule; the second term $x^2\\cos x$ is missing.',
        'This is only the second term; the product rule requires both $u\'v$ and $uv\'$.',
        'The sign on $x^2\\cos x$ should be positive: $\\frac{d}{dx}(\\sin x) = +\\cos x$.',
        'Product rule: $(x^2)\'\\sin x + x^2(\\sin x)\' = 2x\\sin x + x^2\\cos x$.'
      ]
    },

    '3.2.5': {
      a: 1,
      o: [
        '$\\dfrac{2}{(x-1)^2}$',
        '$-\\dfrac{2}{(x-1)^2}$',
        '$\\dfrac{1}{(x-1)^2}$',
        '$-\\dfrac{2}{x^2-1}$'
      ],
      w: [
        'Sign error: the quotient rule gives $(x-1)-(x+1) = -2$ in the numerator.',
        'Quotient rule: $\\frac{(1)(x-1) - (x+1)(1)}{(x-1)^2} = \\frac{-2}{(x-1)^2}$.',
        'The numerator from the quotient rule is $-2$, not $-1$.',
        'The denominator is $(x-1)^2$, not $x^2-1 = (x-1)(x+1)$.'
      ]
    },

    '3.2.7': {
      a: 2,
      o: [
        '$-\\sin(3x)$',
        '$3\\sin(3x)$',
        '$-3\\sin(3x)$',
        '$-3\\cos(3x)$'
      ],
      w: [
        'Missing the chain rule factor of $3$ from the inner derivative.',
        'Forgot the negative sign: $\\frac{d}{dx}(\\cos u) = -\\sin u$, not $+\\sin u$.',
        'Chain rule: $\\frac{d}{dx}\\cos(3x) = -\\sin(3x) \\cdot 3 = -3\\sin(3x)$.',
        'The derivative of $\\cos$ is $-\\sin$, not $-\\cos$.'
      ]
    },

    '3.2.8': {
      a: 0,
      o: [
        '$14(2x+5)^6$',
        '$7(2x+5)^6$',
        '$14(2x+5)^7$',
        '$(2x+5)^6$'
      ],
      w: [
        'Chain rule: $7(2x+5)^6 \\cdot 2 = 14(2x+5)^6$.',
        'Missing the inner derivative factor of $2$.',
        'The exponent decreases by one when differentiating; it should be $6$, not $7$.',
        'Both the coefficient $7$ and the inner derivative $2$ are needed; this has neither.'
      ]
    },

    '3.2.14': {
      a: 3,
      o: [
        '$-\\dfrac{2x+y}{2y}$',
        '$-\\dfrac{2x}{x+2y}$',
        '$\\dfrac{2x+y}{x+2y}$',
        '$-\\dfrac{2x+y}{x+2y}$'
      ],
      w: [
        'The $xy$ term contributes $y + x\\frac{dy}{dx}$ by the product rule; the $x$ term belongs in the denominator.',
        'The $y$ term from differentiating $xy$ is missing from the numerator.',
        'Sign error: solving for $\\frac{dy}{dx}$ introduces a negative sign.',
        'Implicit differentiation: $2x + y + x\\frac{dy}{dx} + 2y\\frac{dy}{dx} = 0$, so $\\frac{dy}{dx} = -\\frac{2x+y}{x+2y}$.'
      ]
    },

    '3.3.1': {
      a: 1,
      o: [
        '$0$',
        '$1$',
        '$e$',
        '$\\infty$'
      ],
      w: [
        'The $\\frac{0}{0}$ form requires L\'H\\hat{o}pital\'s rule or Taylor expansion; the limit is not $0$.',
        'By L\'H\\hat{o}pital: $\\frac{e^x}{1}\\big|_{x=0} = 1$. Equivalently, $e^x \\approx 1 + x$ near $0$.',
        '$e$ would be $\\lim_{x\\to 1}\\frac{e^x-1}{x}$; at $x=0$ the answer is $1$.',
        'Both numerator and denominator vanish, so the limit is finite, not $\\infty$.'
      ]
    },

    '3.3.3': {
      a: 2,
      o: [
        '$-\\dfrac{3}{4}$ ft/s',
        '$-2$ ft/s',
        '$-\\dfrac{3}{2}$ ft/s',
        '$\\dfrac{3}{2}$ ft/s'
      ],
      w: [
        'Check the related-rates setup: $2x\\frac{dx}{dt} + 2y\\frac{dy}{dt} = 0$ with the correct values.',
        'Arithmetic error in the Pythagorean relation; recompute $y$ from $x^2+y^2 = L^2$.',
        'Using the Pythagorean relation and implicit differentiation, the rate is $-\\frac{3}{2}$ ft/s (negative means sliding down).',
        'The wall-side rate is negative (the top slides down); the positive version ignores the direction.'
      ]
    },

    '3.3.4': {
      a: 0,
      o: [
        '$1$',
        '$0$',
        '$\\infty$',
        '$e$'
      ],
      w: [
        'Write $x^x = e^{x\\ln x}$. Since $\\lim_{x\\to 0^+} x\\ln x = 0$, we get $e^0 = 1$.',
        '$x \\to 0$ but $x^x \\not\\to 0$; the exponent $x\\ln x \\to 0$, so the result is $e^0$.',
        'Despite $\\ln x \\to -\\infty$, the product $x \\ln x \\to 0$, so the limit is finite.',
        '$e$ would require $x\\ln x \\to 1$ as $x \\to 0^+$, but in fact it approaches $0$.'
      ]
    },

    '3.3.7': {
      a: 1,
      o: [
        '$x = 3$',
        '$x = 2$',
        '$x = 4$',
        '$x = 6$'
      ],
      w: [
        'Check the second derivative or endpoints; $x=3$ does not satisfy $V\'(x)=0$ for the standard box problem.',
        'Setting $V\'(x) = 0$ and solving yields $x = 2$ as the critical point that maximises volume.',
        '$x=4$ may exceed the physical constraint of the material dimensions.',
        '$x=6$ is typically half the side length and gives zero volume (cuts consume all material).'
      ]
    },

    // ══════════════════════════════════════════════════════════════════════
    //  CHAPTER 4 — Integrals
    // ══════════════════════════════════════════════════════════════════════

    '4.1.1': {
      a: 2,
      o: [
        '$20x^3 - 6x + 7 + C$',
        '$5x^5 - 3x^3 + 7x + C$',
        '$x^5 - x^3 + 7x + C$',
        '$x^5 - x^3 + 7x$'
      ],
      w: [
        'This is the derivative, not the antiderivative — integration raises the power.',
        'Forgot to divide by the new exponent: $\\int 5x^4\\,dx = \\frac{5x^5}{5} = x^5$, not $5x^5$.',
        'Integrate term by term: $\\frac{5x^5}{5} - \\frac{3x^3}{3} + 7x + C = x^5 - x^3 + 7x + C$.',
        'An indefinite integral must include the constant of integration $+C$.'
      ]
    },

    '4.1.2': {
      a: 0,
      o: [
        '$6\\sqrt{x} + 4e^x + C$',
        '$3\\sqrt{x} + 4e^x + C$',
        '$6\\sqrt{x} + e^x + C$',
        '$\\dfrac{3}{2}\\sqrt{x} + 4e^x + C$'
      ],
      w: [
        'Rewrite $\\frac{3}{\\sqrt{x}} = 3x^{-1/2}$; integrating gives $3 \\cdot 2x^{1/2} = 6\\sqrt{x}$. The $e^x$ integrates to itself.',
        'Missing the factor of $2$: $\\int x^{-1/2}dx = 2x^{1/2}$, so the coefficient is $3 \\times 2 = 6$.',
        'The coefficient on $e^x$ stays $4$; $\\int 4e^x\\,dx = 4e^x$, not $e^x$.',
        'The power rule for $x^{-1/2}$ gives $\\frac{x^{1/2}}{1/2} = 2\\sqrt{x}$, then multiply by $3$.'
      ]
    },

    '4.2.1': {
      a: 1,
      o: [
        '$0$',
        '$2$',
        '$1$',
        '$-2$'
      ],
      w: [
        '$\\sin x$ is non-negative on $[0,\\pi]$, so the integral cannot be $0$.',
        '$\\int_0^{\\pi}\\sin x\\,dx = [-\\cos x]_0^{\\pi} = -\\cos\\pi + \\cos 0 = 1 + 1 = 2$.',
        'This results from evaluating $-\\cos(\\pi)$ alone without subtracting $-\\cos(0)$.',
        'The antiderivative is $-\\cos x$, not $\\cos x$; the signs must be tracked carefully.'
      ]
    },

    '4.2.3': {
      a: 3,
      o: [
        '$3e$',
        '$1$',
        '$\\dfrac{3}{e}$',
        '$3$'
      ],
      w: [
        'The integral of $\\frac{1}{x}$ is $\\ln|x|$, not $x$; do not multiply by $e$.',
        '$\\ln(e) = 1$, but the coefficient $3$ must be included.',
        'The upper limit gives $\\ln(e) = 1$, not $\\frac{1}{e}$.',
        '$\\int_1^e \\frac{3}{x}\\,dx = 3[\\ln x]_1^e = 3(\\ln e - \\ln 1) = 3(1-0) = 3$.'
      ]
    },

    '4.2.4': {
      a: 0,
      o: [
        '$5$',
        '$19$',
        '$7$',
        '$-5$'
      ],
      w: [
        'By additivity: $\\int_3^5 f = \\int_0^5 f - \\int_0^3 f = 12 - 7 = 5$.',
        'The integrals are subtracted, not added: $12-7=5$, not $12+7=19$.',
        '$7$ is $\\int_0^3 f$, not $\\int_3^5 f$.',
        'The order of subtraction matters: $\\int_0^5 f - \\int_0^3 f = 12-7 = 5$, a positive value.'
      ]
    },

    '4.3.1': {
      a: 2,
      o: [
        '$\\cos(x^2) + C$',
        '$-\\sin(x^2) + C$',
        '$\\sin(x^2) + C$',
        '$2\\sin(x^2) + C$'
      ],
      w: [
        'The integral of $\\cos u$ is $\\sin u$, not $\\cos u$.',
        'Wrong sign: $\\int \\cos u\\,du = +\\sin u$, not $-\\sin u$.',
        'Let $u = x^2$, $du = 2x\\,dx$. Then $\\int 2x\\cos(x^2)\\,dx = \\int \\cos u\\,du = \\sin u + C = \\sin(x^2)+C$.',
        'The $2x\\,dx$ exactly matches $du$, so no extra factor of $2$ remains.'
      ]
    },

    '4.3.3': {
      a: 1,
      o: [
        '$\\ln|\\cos x| + C$',
        '$\\ln|\\sec x| + C$',
        '$\\sec^2 x + C$',
        '$-\\cot x + C$'
      ],
      w: [
        'Missing the negative sign: $\\int \\tan x\\,dx = -\\ln|\\cos x| = \\ln|\\sec x|$, not $+\\ln|\\cos x|$.',
        'Write $\\tan x = \\frac{\\sin x}{\\cos x}$; with $u = \\cos x$, $\\int \\frac{-du}{u} = -\\ln|u| = \\ln|\\sec x|+C$.',
        '$\\sec^2 x$ is the derivative of $\\tan x$, not its antiderivative.',
        '$-\\cot x$ is the integral of $\\csc^2 x$, not $\\tan x$.'
      ]
    },

    '4.3.4': {
      a: 0,
      o: [
        '$e^x(x - 1) + C$',
        '$xe^x + C$',
        '$e^x(x + 1) + C$',
        '$\\dfrac{x^2 e^x}{2} + C$'
      ],
      w: [
        'Integration by parts with $u=x$, $dv=e^x dx$: $xe^x - \\int e^x dx = xe^x - e^x = e^x(x-1)+C$.',
        'Forgot to subtract the second integral: $\\int e^x\\,dx = e^x$ must be subtracted from $xe^x$.',
        'The sign inside the parentheses is $-1$, not $+1$; recheck $xe^x - e^x$.',
        'Integration by parts does not simply multiply the two functions together.'
      ]
    },

    '4.3.6': {
      a: 3,
      o: [
        '$\\dfrac{1}{x} + C$',
        '$x\\ln x + C$',
        '$\\dfrac{(\\ln x)^2}{2} + C$',
        '$x\\ln x - x + C$'
      ],
      w: [
        '$\\frac{1}{x}$ is the derivative of $\\ln x$, not its integral.',
        'Missing the $-x$ term from the integration by parts step: $\\int 1\\,dx = x$ must be subtracted.',
        'This would be $\\int \\frac{\\ln x}{x}\\,dx$, not $\\int \\ln x\\,dx$.',
        'By parts with $u = \\ln x$, $dv = dx$: $x\\ln x - \\int x \\cdot \\frac{1}{x}\\,dx = x\\ln x - x + C$.'
      ]
    },

    '4.3.9': {
      a: 1,
      o: [
        '$\\arccos\\!\\left(\\dfrac{x}{3}\\right) + C$',
        '$\\arcsin\\!\\left(\\dfrac{x}{3}\\right) + C$',
        '$\\arctan\\!\\left(\\dfrac{x}{3}\\right) + C$',
        '$\\dfrac{1}{3}\\arcsin(x) + C$'
      ],
      w: [
        'The standard form $\\int \\frac{dx}{\\sqrt{a^2-x^2}}$ gives $\\arcsin$, not $\\arccos$ (they differ by a constant, but the standard result is $\\arcsin$).',
        'Recognise $\\int \\frac{dx}{\\sqrt{9-x^2}} = \\arcsin\\!\\left(\\frac{x}{3}\\right) + C$ with $a=3$.',
        '$\\arctan$ corresponds to $\\int \\frac{dx}{a^2+x^2}$, not $\\frac{dx}{\\sqrt{a^2-x^2}}$.',
        'The $\\frac{1}{3}$ factor is already absorbed by the substitution $u = x/3$; it should not appear outside.'
      ]
    },

    '4.3.11': {
      a: 2,
      o: [
        '$\\arctan\\!\\left(\\dfrac{x}{4}\\right) + C$',
        '$\\dfrac{1}{4}\\arctan\\!\\left(\\dfrac{x}{2}\\right) + C$',
        '$\\dfrac{1}{2}\\arctan\\!\\left(\\dfrac{x}{2}\\right) + C$',
        '$\\arctan\\!\\left(\\dfrac{x}{2}\\right) + C$'
      ],
      w: [
        'The argument should be $x/2$ (since $a=2$), not $x/4$.',
        'The leading coefficient is $\\frac{1}{a} = \\frac{1}{2}$, not $\\frac{1}{a^2} = \\frac{1}{4}$.',
        'Using $\\int \\frac{dx}{x^2+a^2} = \\frac{1}{a}\\arctan\\!\\left(\\frac{x}{a}\\right)+C$ with $a=2$ gives $\\frac{1}{2}\\arctan\\!\\left(\\frac{x}{2}\\right)+C$.',
        'The $\\frac{1}{a}$ factor out front is required by the formula; it cannot be omitted.'
      ]
    },

    // ══════════════════════════════════════════════════════════════════════
    //  CHAPTER 5 — Series
    // ══════════════════════════════════════════════════════════════════════

    '5.1.1': {
      a: 0,
      o: [
        '$3$',
        '$4$',
        '$\\dfrac{3}{4}$',
        'Diverges'
      ],
      w: [
        'Geometric series $\\sum_{n=1}^{\\infty}\\left(\\frac{3}{4}\\right)^n = \\frac{3/4}{1-3/4} = 3$.',
        '$4$ is the sum starting from $n=0$; from $n=1$ the first term is $\\frac{3}{4}$, giving $\\frac{3/4}{1/4}=3$.',
        '$\\frac{3}{4}$ is the common ratio and first term, not the sum.',
        'Since $|r| = \\frac{3}{4} < 1$, the geometric series converges.'
      ]
    },

    '5.1.5': {
      a: 2,
      o: [
        '$1$',
        '$2$',
        '$\\dfrac{3}{2}$',
        'Diverges'
      ],
      w: [
        'The telescoping cancellation leaves both $1$ and $\\frac{1}{2}$ as surviving terms.',
        'Only partial terms survive after cancellation; carefully track which terms remain.',
        'Write partial sums: surviving terms are $1 + \\frac{1}{2} = \\frac{3}{2}$ after telescoping cancellation.',
        'Telescoping series converge because most terms cancel; this one converges to $\\frac{3}{2}$.'
      ]
    },

    '5.2.2': {
      a: 1,
      o: [
        '$(1, 5)$',
        '$[1, 5)$',
        '$[1, 5]$',
        '$(1, 5]$'
      ],
      w: [
        'The left endpoint $x=1$ must be tested separately; the series converges there (alternating harmonic series).',
        'Ratio test gives $|x-3|<2$, i.e. $1<x<5$. At $x=1$: $\\sum \\frac{(-1)^n}{n}$ converges. At $x=5$: $\\sum \\frac{1}{n}$ diverges. So $[1,5)$.',
        'At $x=5$ the series becomes $\\sum \\frac{1}{n}$, the harmonic series, which diverges.',
        'Check both endpoints: $x=1$ gives a convergent alternating series, while $x=5$ gives the divergent harmonic series.'
      ]
    },

    // ══════════════════════════════════════════════════════════════════════
    //  CHAPTER 6 — Parametric & Polar
    // ══════════════════════════════════════════════════════════════════════

    '6.1.2': {
      a: 0,
      o: [
        '$x^2 + y^2 = 9$',
        '$x^2 + y^2 = 3$',
        '$x + y = 3$',
        '$x^2 - y^2 = 9$'
      ],
      w: [
        'Since $x=3\\cos t$ and $y=3\\sin t$, we have $x^2+y^2 = 9\\cos^2 t + 9\\sin^2 t = 9$.',
        'The radius is $3$, so $r^2 = 9$, not $3$; do not forget to square.',
        'The Pythagorean identity involves squares: $\\cos^2 t + \\sin^2 t = 1$, not $\\cos t + \\sin t$.',
        'Subtraction would arise from $\\cosh/\\sinh$; $\\cos/\\sin$ give a sum, not a difference.'
      ]
    },

    '6.2.1': {
      a: 3,
      o: [
        '$2\\pi$',
        '$4\\pi$',
        '$\\dfrac{\\pi}{2}$',
        '$\\pi$'
      ],
      w: [
        'The curve $r=2\\cos\\theta$ traces a circle of radius $1$ (not $2$); area $= \\pi(1)^2 = \\pi$.',
        'This is the area of a circle with radius $2$; the actual radius of $r=2\\cos\\theta$ is $1$.',
        'The $\\frac{1}{2}$ in the polar area formula is needed, but the limits and integrand must also be correct.',
        'Area $= \\frac{1}{2}\\int_0^{\\pi}(2\\cos\\theta)^2\\,d\\theta = \\frac{1}{2}\\int_0^{\\pi}4\\cos^2\\theta\\,d\\theta = \\pi$.'
      ]
    },

    '6.2.2': {
      a: 2,
      o: [
        '$x^2 + y^2 = 4$',
        '$(x-2)^2 + y^2 = 4$',
        '$x^2 + (y-2)^2 = 4$',
        '$x^2 + y^2 = 16$'
      ],
      w: [
        'This is a circle centred at the origin, but $r=4\\sin\\theta$ shifts the centre to $(0,2)$.',
        'The $\\sin\\theta$ factor shifts vertically, not horizontally; $\\cos\\theta$ would shift along $x$.',
        'Multiply both sides by $r$: $r^2 = 4r\\sin\\theta \\Rightarrow x^2+y^2 = 4y \\Rightarrow x^2+(y-2)^2=4$.',
        'This confuses $r=4\\sin\\theta$ with $r=4$; the former is a circle of radius $2$, not $4$.'
      ]
    },

    // ══════════════════════════════════════════════════════════════════════
    //  CHAPTER 7 — Multivariable Calculus
    // ══════════════════════════════════════════════════════════════════════

    '7.1.1': {
      a: 1,
      o: [
        '$3x^2$',
        '$3x^2 - 3y^2$',
        '$3x^2 - 6xy$',
        '$x^3 - 3y^2$'
      ],
      w: [
        'The $-3xy^2$ term contributes $-3y^2$ when differentiating with respect to $x$; it cannot be dropped.',
        '$f_x = \\frac{\\partial}{\\partial x}(x^3 - 3xy^2 + y^4) = 3x^2 - 3y^2$; treat $y$ as a constant.',
        'When differentiating $-3xy^2$ with respect to $x$, the result is $-3y^2$, not $-6xy$.',
        'Differentiate each term: $\\frac{\\partial}{\\partial x}(x^3) = 3x^2$ and $\\frac{\\partial}{\\partial x}(-3xy^2) = -3y^2$.'
      ]
    },

    '7.2.1': {
      a: 0,
      o: [
        '$\\dfrac{1}{3}$',
        '$\\dfrac{1}{2}$',
        '$\\dfrac{1}{6}$',
        '$\\dfrac{2}{3}$'
      ],
      w: [
        'Evaluate inner integral: $\\int_0^{1-x}(x+y)\\,dy = x(1-x)+\\frac{(1-x)^2}{2}$. Then integrate over $[0,1]$ to get $\\frac{1}{3}$.',
        'An error in expanding $(1-x)^2$ or in the outer integration leads to $\\frac{1}{2}$.',
        '$\\frac{1}{6}$ results from dropping the $x$ term in the integrand.',
        'Check the limits of the inner integral: the upper bound is $1-x$, not $1$.'
      ]
    },

    '7.2.2': {
      a: 3,
      o: [
        '$2\\pi(e^4-1)$',
        '$\\pi e^4$',
        '$\\pi(e^2-1)$',
        '$\\pi(e^4-1)$'
      ],
      w: [
        'The extra factor of $2$ is incorrect; the substitution $u = r^2$ absorbs it.',
        'The $-1$ comes from the lower limit $r=0$: $e^{0}=1$ must be subtracted.',
        'The exponent should be $r^2=4$ (since $r\\le 2$), giving $e^4$, not $e^2$.',
        'Convert to polar: $\\int_0^{2\\pi}\\int_0^2 e^{r^2}\\,r\\,dr\\,d\\theta = 2\\pi \\cdot \\frac{1}{2}[e^{r^2}]_0^2 = \\pi(e^4-1)$.'
      ]
    },

    '7.3.1': {
      a: 2,
      o: [
        '$2\\pi$',
        '$\\pi$',
        '$0$',
        '$-\\pi$'
      ],
      w: [
        'Green\'s theorem converts to $\\iint (2x-2y)\\,dA$; by symmetry over the unit disk, this is $0$.',
        'The symmetry of $2x-2y$ over a centred disk makes each integral vanish.',
        'By Green\'s theorem: $\\iint\\left(\\frac{\\partial(x^2)}{\\partial x}-\\frac{\\partial(y^2)}{\\partial y}\\right)dA = \\iint(2x-2y)\\,dA = 0$ by symmetry.',
        'Odd integrands over symmetric regions integrate to $0$, not $-\\pi$.'
      ]
    },

    // ══════════════════════════════════════════════════════════════════════
    //  CHAPTER 8 — Linear Algebra
    // ══════════════════════════════════════════════════════════════════════

    '8.1.3': {
      a: 0,
      o: [
        '$19$',
        '$-19$',
        '$17$',
        '$21$'
      ],
      w: [
        'Expand along any row or column using cofactors to obtain $19$.',
        'A sign error in one cofactor term flips the overall sign.',
        'An arithmetic slip in one of the $2\\times 2$ sub-determinants leads to $17$.',
        'Double-check each $2\\times 2$ minor; a small addition error gives $21$.'
      ]
    },

    '8.3.1': {
      a: 1,
      o: [
        '$\\lambda = 1,\\; \\lambda = 6$',
        '$\\lambda = 3,\\; \\lambda = 2$',
        '$\\lambda = 3,\\; \\lambda = -2$',
        '$\\lambda = 5,\\; \\lambda = 0$'
      ],
      w: [
        'The characteristic polynomial is $(3-\\lambda)(2-\\lambda) - 0 = 0$; the roots are $3$ and $2$, not $1$ and $6$.',
        'For $\\begin{pmatrix}3&1\\\\0&2\\end{pmatrix}$, the eigenvalues are the diagonal entries: $\\lambda=3$ and $\\lambda=2$ (triangular matrix).',
        'Both eigenvalues are positive; $-2$ comes from a sign error in the characteristic equation.',
        'The trace is $5$ and the determinant is $6$; the pair $(5,0)$ does not satisfy $\\lambda_1+\\lambda_2=5$ and $\\lambda_1\\lambda_2=6$.'
      ]
    },

    // ══════════════════════════════════════════════════════════════════════
    //  CHAPTER 9 — Differential Equations
    // ══════════════════════════════════════════════════════════════════════

    '9.1.1': {
      a: 2,
      o: [
        '$y = 5e^{3t}$',
        '$y = 3e^{5x}$',
        '$y = 5e^{3x}$',
        '$y = 5 + 3x$'
      ],
      w: [
        'The independent variable should be $x$, not $t$, to match the original equation.',
        'The coefficient and exponent are swapped: $y(0)=5$ fixes the coefficient at $5$, and the rate is $3$.',
        'Separate variables: $\\frac{dy}{y}=3\\,dx \\Rightarrow y=Ce^{3x}$. With $y(0)=5$, $C=5$.',
        'This is a linear approximation, not the exact solution; $\\frac{dy}{dx}=3y$ has exponential solutions.'
      ]
    },

    '9.2.1': {
      a: 0,
      o: [
        '$y = \\cos 2x$',
        '$y = \\sin 2x$',
        '$y = \\cos 4x$',
        '$y = e^{2x}$'
      ],
      w: [
        'Characteristic equation $r^2+4=0$ gives $r=\\pm 2i$, so $y=A\\cos 2x+B\\sin 2x$. ICs give $A=1, B=0$.',
        '$y\'(0) = 2B = 0$ forces $B=0$; $\\sin 2x$ alone doesn\'t satisfy the initial conditions.',
        'The $\\omega$ in $\\cos(\\omega x)$ is $2$, not $4$; $\\cos 4x$ solves $y\'\'+16y=0$.',
        'Complex roots $\\pm 2i$ mean oscillatory solutions, not exponential growth.'
      ]
    },

    '9.2.3': {
      a: 1,
      o: [
        '$y = 2e^{-3x}$',
        '$y = (2 + 5x)e^{-3x}$',
        '$y = (2 - 5x)e^{-3x}$',
        '$y = (2 + 5x)e^{3x}$'
      ],
      w: [
        'A repeated root requires the $(C_1+C_2 x)$ form; $2e^{-3x}$ alone cannot satisfy $y\'(0)=-1$.',
        'Double root $r=-3$: $y=(C_1+C_2 x)e^{-3x}$. $y(0)=C_1=2$, $y\'(0)=C_2-3C_1=-1 \\Rightarrow C_2=5$.',
        'Sign error on $C_2$: $y\'(0) = C_2 - 6 = -1$ gives $C_2 = 5$, not $-5$.',
        'The root is $r=-3$ (negative); $e^{3x}$ corresponds to $r=+3$, which is wrong.'
      ]
    },

    '9.2.5': {
      a: 3,
      o: [
        '$y = e^{2x}$',
        '$y = (1 + 2x)e^{2x}$',
        '$y = (1 + x)e^{-2x}$',
        '$y = (1 + x)e^{2x}$'
      ],
      w: [
        '$e^{2x}$ alone cannot satisfy $y\'(0)=3$; the repeated-root general solution requires a linear factor.',
        '$C_2=1$ not $2$: from $y\'(0) = C_2 + 2C_1 = C_2+2 = 3$, we get $C_2=1$.',
        'The characteristic root is $+2$, not $-2$; check the signs in $r^2-4r+4=0$.',
        'Repeated root $r=2$: $y=(C_1+C_2 x)e^{2x}$. $y(0)=1 \\Rightarrow C_1=1$, $y\'(0)=C_2+2=3 \\Rightarrow C_2=1$.'
      ]
    },

    // ══════════════════════════════════════════════════════════════════════
    //  CHAPTER 10 — Real Analysis
    // ══════════════════════════════════════════════════════════════════════

    '10.1.1': {
      a: 0,
      o: [
        '$1$',
        '$\\dfrac{1}{2}$',
        '$2$',
        '$\\infty$'
      ],
      w: [
        '$\\frac{n}{n+1} < 1$ for all $n$, and $\\frac{n}{n+1} \\to 1$, so $\\sup = 1$ (approached but never reached).',
        '$\\frac{1}{2}$ is just the first term of the sequence; the terms increase toward $1$.',
        'Every term is less than $1$, so $2$ is an upper bound but not the least upper bound.',
        'The sequence is bounded above by $1$; the supremum is finite.'
      ]
    },

    // ══════════════════════════════════════════════════════════════════════
    //  CHAPTER 11 — Abstract Algebra
    // ══════════════════════════════════════════════════════════════════════

    '11.1.4': {
      a: 2,
      o: [
        '$3,\\; 4,\\; 12$',
        '$4,\\; 3,\\; 6$',
        '$4,\\; 3,\\; 12$',
        '$12,\\; 12,\\; 12$'
      ],
      w: [
        'The orders of $\\bar{3}$ and $\\bar{4}$ are swapped here; $\\text{ord}(\\bar{3}) = 12/\\gcd(3,12) = 4$.',
        'The order of $\\bar{5}$ is $12/\\gcd(5,12) = 12$, not $6$.',
        'Use $\\text{ord}(\\bar{k}) = 12/\\gcd(k,12)$: $\\text{ord}(\\bar{3})=4$, $\\text{ord}(\\bar{4})=3$, $\\text{ord}(\\bar{5})=12$.',
        'Not every element has order $12$; only generators of $\\mathbb{Z}/12\\mathbb{Z}$ (those coprime to $12$) do.'
      ]
    },

    // ══════════════════════════════════════════════════════════════════════
    //  CHAPTER 12 — Probability & Statistics
    // ══════════════════════════════════════════════════════════════════════

    '12.1.1': {
      a: 1,
      o: [
        '$\\dfrac{1}{6}$',
        '$\\dfrac{2}{9}$',
        '$\\dfrac{1}{9}$',
        '$\\dfrac{7}{36}$'
      ],
      w: [
        '$\\frac{6}{36} = \\frac{1}{6}$ counts only sum-of-$7$ outcomes; you must also include sum-of-$11$.',
        'Sum $7$: $6$ ways; sum $11$: $2$ ways. Total $= \\frac{8}{36} = \\frac{2}{9}$.',
        'This counts only the sum-of-$11$ outcomes ($\\frac{2}{36}$); sum-of-$7$ adds $6$ more.',
        '$\\frac{7}{36}$ comes from miscounting; list all pairs systematically to get $8$ favourable outcomes.'
      ]
    },

    '12.2.1': {
      a: 0,
      o: [
        '$\\dfrac{5}{72}$',
        '$\\dfrac{1}{36}$',
        '$\\dfrac{1}{12}$',
        '$\\dfrac{25}{216}$'
      ],
      w: [
        '$\\binom{3}{2}\\left(\\frac{1}{6}\\right)^2\\left(\\frac{5}{6}\\right)^1 = 3 \\cdot \\frac{1}{36} \\cdot \\frac{5}{6} = \\frac{15}{216} = \\frac{5}{72}$.',
        'Forgot the binomial coefficient $\\binom{3}{2}=3$; there are $3$ ways to choose which $2$ rolls are sixes.',
        'This likely comes from $\\frac{1}{2}\\cdot\\frac{1}{6}$; use the binomial formula instead.',
        'This is $\\left(\\frac{5}{6}\\right)^3$, the probability of no sixes, not exactly two.'
      ]
    },

    '12.2.4': {
      a: 3,
      o: [
        '$0.6827$',
        '$0.9544$',
        '$0.7475$',
        '$0.8185$'
      ],
      w: [
        '$0.6827$ is $P(\\mu-\\sigma \\le X \\le \\mu+\\sigma)$; here the range $[85,130]$ is not symmetric ($-1\\sigma$ to $+2\\sigma$).',
        '$0.9544$ is $P(\\mu-2\\sigma \\le X \\le \\mu+2\\sigma)$; the lower bound here is only $1\\sigma$ below the mean.',
        'This does not correspond to the correct $z$-score boundaries.',
        '$z_1 = \\frac{85-100}{15} = -1$, $z_2 = \\frac{130-100}{15} = 2$. $P(-1 \\le Z \\le 2) = 0.9772 - 0.1587 = 0.8185$.'
      ]
    },

    // ══════════════════════════════════════════════════════════════════════
    //  CHAPTER 13 — Computational Mathematics
    // ══════════════════════════════════════════════════════════════════════

    '13.1.1': {
      a: 2,
      o: [
        '$2.958$',
        '$3.500$',
        '$3.241$',
        '$4.123$'
      ],
      w: [
        'Too low — likely used too few subintervals or a less accurate quadrature rule.',
        '$3.500$ is a rough approximation; a proper numerical method (e.g. Simpson\'s rule) gives closer to $3.241$.',
        'Numerical integration of $\\int_0^2 \\sqrt{1+x^3}\\,dx$ yields approximately $3.241$.',
        'Too high — check for an arithmetic error in the quadrature weights or function evaluations.'
      ]
    },

    '13.3.2': {
      a: 0,
      o: [
        '$x=1,\\; y=2,\\; z=3$',
        '$x=2,\\; y=1,\\; z=3$',
        '$x=1,\\; y=3,\\; z=2$',
        '$x=3,\\; y=2,\\; z=1$'
      ],
      w: [
        'Gaussian elimination (or any systematic method) yields $x=1$, $y=2$, $z=3$.',
        'The values of $x$ and $y$ are swapped; substitute back into the original equations to verify.',
        '$y$ and $z$ are swapped; always back-substitute to confirm the solution.',
        'All three values are in the wrong positions; careful row reduction avoids this.'
      ]
    }
  };

  // ─── Injection Function ──────────────────────────────────────────────

  function injectMC() {
    document.querySelectorAll('.problem').forEach(function (problem) {
      if (problem.dataset.mcConverted === '1') return;
      if (problem.querySelector('.inline-mc-options')) return;

      var numEl = problem.querySelector('.problem-number');
      if (!numEl) return;
      var pid = numEl.textContent.trim();
      var data = MC[pid];
      if (!data) return;

      problem.dataset.mcInjected = '1';

      var question = problem.querySelector('.problem-question');
      var solBtn = problem.querySelector('.show-solution-btn');
      if (!question) return;

      if (solBtn) solBtn.style.display = 'none';

      var optionsDiv = document.createElement('div');
      optionsDiv.className = 'inline-mc-options';

      var letters = 'ABCD';
      data.o.forEach(function (opt, j) {
        var btn = document.createElement('button');
        btn.className = 'inline-mc-btn';
        btn.dataset.choice = j;
        btn.innerHTML =
          '<span class="inline-mc-letter">' + letters[j] +
          '</span><span class="inline-mc-text">' + opt + '</span>';
        optionsDiv.appendChild(btn);
      });

      var feedback = document.createElement('div');
      feedback.className = 'mc-feedback';
      feedback.style.display = 'none';

      question.after(optionsDiv);
      optionsDiv.after(feedback);

      optionsDiv.addEventListener('click', function (e) {
        var btn = e.target.closest('.inline-mc-btn');
        if (!btn || problem.classList.contains('inline-mc-answered')) return;

        problem.classList.add('inline-mc-answered');
        var chosen = parseInt(btn.dataset.choice, 10);
        var correct = data.a;
        var isCorrect = chosen === correct;

        var correctBtn = optionsDiv.querySelector('[data-choice="' + correct + '"]');
        correctBtn.classList.add('inline-mc-correct');

        if (!isCorrect) btn.classList.add('inline-mc-wrong');

        var fbHTML = '';
        if (isCorrect) {
          fbHTML =
            '<div class="mc-fb-correct"><strong>Correct!</strong> ' +
            (data.w[chosen] || '') + '</div>';
        } else {
          fbHTML =
            '<div class="mc-fb-wrong"><strong>Incorrect.</strong> ' +
            (data.w[chosen] || '') + '</div>';
          fbHTML +=
            '<div class="mc-fb-right"><strong>The answer is ' +
            letters[correct] + ':</strong> ' +
            (data.w[correct] || '') + '</div>';
        }
        feedback.innerHTML = fbHTML;
        feedback.style.display = 'block';

        if (solBtn) {
          solBtn.style.display = '';
          solBtn.click();
        }

        if (typeof renderMathInElement === 'function') {
          renderMathInElement(feedback, {
            delimiters: [
              { left: '$$', right: '$$', display: true },
              { left: '$', right: '$', display: false }
            ],
            throwOnError: false
          });
        }

        var evt = new CustomEvent('mc-answered', {
          detail: { pid: pid, correct: isCorrect }
        });
        document.dispatchEvent(evt);
      });

      if (typeof renderMathInElement === 'function') {
        renderMathInElement(optionsDiv, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false }
          ],
          throwOnError: false
        });
      }
    });
  }

  // ─── Initialisation ──────────────────────────────────────────────────

  function init() {
    injectMC();
    var obs = new MutationObserver(function () {
      setTimeout(injectMC, 200);
    });
    var main = document.querySelector('.main-content') || document.body;
    obs.observe(main, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
