(function () {
  'use strict';

  // ============================================================
  //  MULTIPLE CHOICE QUIZ SYSTEM
  //  Auto-injects MC quizzes into each chapter section
  // ============================================================

  const Q = {
    // ── Ch 1: Pre-Calculus Foundations ──
    'precalculus': [
      // 1.1 Number Systems
      { q: 'Which number is irrational?', o: ['$\\frac{22}{7}$', '$0.\\overline{3}$', '$\\sqrt{2}$', '$-5$'], a: 2, exp: '$\\sqrt{2}$ cannot be expressed as a ratio of integers. $\\frac{22}{7}$ and $0.\\overline{3}$ are rational.' },
      { q: 'The set of integers $\\mathbb{Z}$ is a subset of which set?', o: ['$\\mathbb{N}$', '$\\mathbb{Q}$', 'Neither', 'The empty set'], a: 1, exp: '$\\mathbb{N} \\subset \\mathbb{Z} \\subset \\mathbb{Q}$ — every integer is a rational number ($n = n/1$).' },
      { q: 'Which interval notation represents $\\{x : -2 \\leq x < 5\\}$?', o: ['$(-2, 5)$', '$[-2, 5]$', '$[-2, 5)$', '$(-2, 5]$'], a: 2, exp: 'Square bracket at $-2$ (included), parenthesis at $5$ (excluded).' },
      { q: 'If $z = 3 + 4i$, what is $|z|$?', o: ['$7$', '$5$', '$\\sqrt{7}$', '$25$'], a: 1, exp: '$|z| = \\sqrt{3^2 + 4^2} = \\sqrt{9 + 16} = \\sqrt{25} = 5$.' },
      { q: 'Which statement is FALSE?', o: ['$\\pi$ is irrational', '$0$ is a natural number in some conventions', 'Every real number is complex', '$\\sqrt{4}$ is irrational'], a: 3, exp: '$\\sqrt{4} = 2$, which is rational (and natural). The other statements are all true.' },
      // 1.2 Algebra
      { q: 'Simplify: $(x^3)(x^5)$', o: ['$x^{15}$', '$x^8$', '$2x^8$', '$x^{35}$'], a: 1, exp: 'Product rule: $x^a \\cdot x^b = x^{a+b}$, so $x^{3+5} = x^8$.' },
      { q: 'What is $\\log_2(32)$?', o: ['$4$', '$5$', '$6$', '$16$'], a: 1, exp: '$2^5 = 32$, so $\\log_2(32) = 5$.' },
      { q: 'Factor: $x^2 - 9$', o: ['$(x-3)^2$', '$(x+3)(x-3)$', '$(x+9)(x-1)$', '$(x-9)(x+1)$'], a: 1, exp: 'Difference of squares: $a^2 - b^2 = (a+b)(a-b)$.' },
      { q: 'Using the quadratic formula, the discriminant of $2x^2 + 3x + 5 = 0$ is:', o: ['$-31$', '$31$', '$49$', '$-49$'], a: 0, exp: '$\\Delta = b^2 - 4ac = 9 - 40 = -31$. Negative discriminant means complex roots.' },
      { q: 'Simplify: $\\frac{x^{-2}}{x^3}$', o: ['$x^{-5}$', '$x^{5}$', '$x^{-1}$', '$x$'], a: 0, exp: '$x^{-2}/x^3 = x^{-2-3} = x^{-5}$.' },
      // 1.3 Functions
      { q: 'If $f(x) = x^2$ and $g(x) = x + 1$, what is $(f \\circ g)(2)$?', o: ['$5$', '$9$', '$6$', '$4$'], a: 1, exp: '$(f \\circ g)(2) = f(g(2)) = f(3) = 9$.' },
      { q: 'Which function is even?', o: ['$f(x) = x^3$', '$f(x) = x^2 + 1$', '$f(x) = x$', '$f(x) = \\sin x$'], a: 1, exp: 'Even means $f(-x) = f(x)$. For $x^2+1$: $(-x)^2 + 1 = x^2 + 1$. ✓' },
      { q: 'The domain of $f(x) = \\sqrt{x - 3}$ is:', o: ['$x > 3$', '$x \\geq 3$', '$x \\leq 3$', 'All reals'], a: 1, exp: 'Need $x - 3 \\geq 0$, so $x \\geq 3$, i.e. $[3, \\infty)$.' },
      // 1.4 Trig
      { q: 'What is $\\sin(\\pi/6)$?', o: ['$\\frac{\\sqrt{3}}{2}$', '$\\frac{1}{2}$', '$\\frac{\\sqrt{2}}{2}$', '$1$'], a: 1, exp: '$\\sin(30°) = 1/2$ is a standard unit circle value.' },
      { q: '$\\sin^2\\theta + \\cos^2\\theta = $?', o: ['$0$', '$1$', '$2$', '$\\tan^2\\theta$'], a: 1, exp: 'The fundamental Pythagorean identity.' },
      { q: 'What is $\\cos(\\pi)$?', o: ['$0$', '$1$', '$-1$', '$\\frac{1}{2}$'], a: 2, exp: 'At $\\pi$ (180°), the point on the unit circle is $(-1, 0)$, so $\\cos\\pi = -1$.' },
      { q: 'Simplify: $\\sec^2 x - \\tan^2 x$', o: ['$0$', '$1$', '$\\sin^2 x$', '$-1$'], a: 1, exp: 'From $1 + \\tan^2 x = \\sec^2 x$, rearranging gives $\\sec^2 x - \\tan^2 x = 1$.' },
    ],
    // ── Ch 2: Limits & Continuity ──
    'limits': [
      { q: '$\\lim_{x \\to 3} (2x + 1) = $?', o: ['$5$', '$6$', '$7$', '$8$'], a: 2, exp: 'Direct substitution: $2(3) + 1 = 7$.' },
      { q: '$\\lim_{x \\to 0} \\frac{\\sin x}{x} = $?', o: ['$0$', '$1$', '$\\infty$', 'Does not exist'], a: 1, exp: 'This is the most important limit in calculus. It equals 1 (proved via Squeeze Theorem).' },
      { q: 'If $\\lim_{x \\to a^-} f(x) = 3$ and $\\lim_{x \\to a^+} f(x) = 5$, then $\\lim_{x \\to a} f(x)$:', o: ['$= 3$', '$= 5$', '$= 4$', 'Does not exist'], a: 3, exp: 'The two-sided limit exists only when both one-sided limits are equal.' },
      { q: '$\\lim_{x \\to \\infty} \\frac{3x^2 + 1}{x^2 - 2} = $?', o: ['$0$', '$3$', '$1$', '$\\infty$'], a: 1, exp: 'Divide top and bottom by $x^2$: $\\frac{3 + 1/x^2}{1 - 2/x^2} \\to \\frac{3}{1} = 3$.' },
      { q: '$\\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2} = $?', o: ['$0$', '$2$', '$4$', 'Does not exist'], a: 2, exp: 'Factor: $\\frac{(x-2)(x+2)}{x-2} = x + 2 \\to 4$.' },
      { q: 'Which condition is NOT required for continuity at $x = a$?', o: ['$f(a)$ is defined', '$\\lim_{x \\to a} f(x)$ exists', '$f\'(a)$ exists', '$\\lim_{x \\to a} f(x) = f(a)$'], a: 2, exp: 'Differentiability is not required for continuity. $f(x) = |x|$ is continuous but not differentiable at 0.' },
      { q: 'The Intermediate Value Theorem requires $f$ to be:', o: ['Differentiable', 'Continuous on $[a,b]$', 'Increasing', 'Bounded'], a: 1, exp: 'IVT requires continuity on a closed interval.' },
      { q: 'Given $\\varepsilon > 0$, the $\\varepsilon$-$\\delta$ definition says $|f(x) - L| < \\varepsilon$ when:', o: ['$|x - a| < \\varepsilon$', '$0 < |x - a| < \\delta$', '$|x| < \\delta$', '$f(x) < \\varepsilon$'], a: 1, exp: '$0 < |x-a| < \\delta \\implies |f(x)-L| < \\varepsilon$ is the formal definition.' },
      { q: '$\\lim_{x \\to 0} \\frac{1 - \\cos x}{x} = $?', o: ['$1$', '$0$', '$\\frac{1}{2}$', '$-1$'], a: 1, exp: 'Multiply by $\\frac{1+\\cos x}{1+\\cos x}$: $\\frac{\\sin^2 x}{x(1+\\cos x)} = \\frac{\\sin x}{x} \\cdot \\frac{\\sin x}{1+\\cos x} \\to 1 \\cdot 0 = 0$.' },
      { q: 'A function with a removable discontinuity at $x=a$ has:', o: ['No limit at $a$', 'A limit at $a$ but $f(a) \\neq \\lim$', 'An infinite limit at $a$', 'A jump at $a$'], a: 1, exp: 'Removable: the limit exists but doesn\'t equal the function value (or $f(a)$ is undefined).' },
    ],
    // ── Ch 3: Differentiation ──
    'derivatives': [
      { q: 'The derivative of $f(x) = x^4$ is:', o: ['$x^3$', '$4x^3$', '$4x^4$', '$3x^4$'], a: 1, exp: 'Power rule: $\\frac{d}{dx}x^n = nx^{n-1}$. So $4x^3$.' },
      { q: '$\\frac{d}{dx}[\\sin x] = $?', o: ['$-\\cos x$', '$\\cos x$', '$\\sin x$', '$\\tan x$'], a: 1, exp: 'The derivative of $\\sin x$ is $\\cos x$.' },
      { q: 'If $f(x) = e^{3x}$, then $f\'(x) = $?', o: ['$e^{3x}$', '$3e^{3x}$', '$3e^x$', '$e^{3x}/3$'], a: 1, exp: 'Chain rule: $\\frac{d}{dx}e^{u} = e^u \\cdot u\'$. Here $u=3x$, $u\'=3$.' },
      { q: 'The product rule states $(fg)\' = $?', o: ['$f\'g\'$', '$f\'g + fg\'$', '$f\'g - fg\'$', '$fg\' + f\'g\'$'], a: 1, exp: '$(fg)\' = f\'g + fg\'$ — remember both terms.' },
      { q: '$\\frac{d}{dx}[\\ln x] = $?', o: ['$\\frac{1}{x}$', '$\\frac{1}{x^2}$', '$e^x$', '$\\ln x$'], a: 0, exp: 'The derivative of $\\ln x$ is $1/x$ (for $x > 0$).' },
      { q: 'If $f\'(c) = 0$, then at $x = c$:', o: ['$f$ has a maximum', '$f$ has a minimum', '$f$ has a critical point', '$f$ is discontinuous'], a: 2, exp: '$f\'(c) = 0$ means $c$ is a critical point, but it could be a max, min, or neither (inflection point).' },
      { q: 'The Mean Value Theorem guarantees $f\'(c) = \\frac{f(b)-f(a)}{b-a}$ when $f$ is:', o: ['Continuous on $[a,b]$ and differentiable on $(a,b)$', 'Differentiable on $[a,b]$', 'Continuous everywhere', 'Increasing on $[a,b]$'], a: 0, exp: 'MVT requires continuity on the closed interval AND differentiability on the open interval.' },
      { q: '$\\frac{d}{dx}[\\tan x] = $?', o: ['$\\cot x$', '$-\\sec^2 x$', '$\\sec^2 x$', '$\\sec x \\tan x$'], a: 2, exp: '$\\frac{d}{dx}\\tan x = \\sec^2 x$.' },
      { q: 'L\'Hôpital\'s Rule applies when the limit has the form:', o: ['$0 \\cdot \\infty$', '$1^\\infty$', '$\\frac{0}{0}$ or $\\frac{\\infty}{\\infty}$', 'Any form'], a: 2, exp: 'L\'Hôpital\'s Rule directly applies to $0/0$ and $\\infty/\\infty$. Other forms must be rewritten first.' },
      { q: 'If $f\'\'(c) > 0$ at a critical point $c$, then $f(c)$ is a:', o: ['Local maximum', 'Local minimum', 'Inflection point', 'Cannot determine'], a: 1, exp: 'Second derivative test: $f\'\'(c) > 0$ means concave up, so local minimum.' },
      { q: '$\\frac{d}{dx}[x \\cdot e^x] = $?', o: ['$e^x$', '$xe^x$', '$e^x + xe^x$', '$e^x(x+1)$'], a: 2, exp: 'Product rule: $1 \\cdot e^x + x \\cdot e^x = e^x + xe^x = e^x(x+1)$. Both C and D are correct forms.' },
      { q: 'The derivative of $\\arctan(x)$ is:', o: ['$\\frac{1}{1+x^2}$', '$\\frac{1}{\\sqrt{1-x^2}}$', '$\\sec^2 x$', '$\\frac{-1}{1+x^2}$'], a: 0, exp: '$\\frac{d}{dx}\\arctan x = \\frac{1}{1+x^2}$.' },
    ],
    // ── Ch 4: Integration ──
    'integration': [
      { q: '$\\int x^3\\,dx = $?', o: ['$3x^2 + C$', '$\\frac{x^4}{4} + C$', '$\\frac{x^4}{3} + C$', '$x^4 + C$'], a: 1, exp: 'Power rule for integration: $\\int x^n dx = \\frac{x^{n+1}}{n+1} + C$.' },
      { q: '$\\int_0^\\pi \\sin x\\,dx = $?', o: ['$0$', '$1$', '$2$', '$-2$'], a: 2, exp: '$[-\\cos x]_0^\\pi = -\\cos\\pi - (-\\cos 0) = -(-1) + 1 = 2$.' },
      { q: 'The Fundamental Theorem of Calculus (Part 2) states:', o: ['$\\frac{d}{dx}\\int_a^x f = f(x)$', '$\\int_a^b f = F(b) - F(a)$', '$\\int f\' = f + C$', 'All of the above'], a: 1, exp: 'FTC Part 2: $\\int_a^b f(x)dx = F(b) - F(a)$ where $F\' = f$.' },
      { q: '$\\int \\frac{1}{x}\\,dx = $?', o: ['$\\frac{1}{x^2} + C$', '$\\ln x + C$', '$\\ln|x| + C$', '$-\\frac{1}{x^2} + C$'], a: 2, exp: '$\\int \\frac{1}{x}dx = \\ln|x| + C$ — the absolute value is essential.' },
      { q: 'To evaluate $\\int x e^x dx$, you should use:', o: ['u-substitution', 'Integration by parts', 'Partial fractions', 'Trig substitution'], a: 1, exp: 'Product of algebraic and exponential → integration by parts with $u = x$, $dv = e^x dx$.' },
      { q: '$\\int_a^a f(x)\\,dx = $?', o: ['$f(a)$', '$1$', '$0$', 'Undefined'], a: 2, exp: 'When the limits are equal, the integral is always 0 (no width).' },
      { q: 'In IBP, the LIATE rule suggests choosing $u$ as:', o: ['The exponential function', 'The trig function', 'The algebraic function', 'The logarithmic function'], a: 3, exp: 'LIATE priority: Logarithmic > Inverse trig > Algebraic > Trig > Exponential. Choose $u$ from left.' },
      { q: '$\\int e^x\\,dx = $?', o: ['$xe^x + C$', '$e^x + C$', '$e^{x+1}/(x+1) + C$', '$\\frac{e^x}{x} + C$'], a: 1, exp: '$e^x$ is its own antiderivative.' },
      { q: 'For $\\int \\frac{2x}{x^2+1}dx$, the best method is:', o: ['IBP', 'u-sub with $u = x^2 + 1$', 'Partial fractions', 'Trig sub'], a: 1, exp: 'Let $u = x^2 + 1$, $du = 2x\\,dx$. The integral becomes $\\int \\frac{du}{u} = \\ln|u| + C$.' },
      { q: '$\\int \\cos x\\,dx = $?', o: ['$-\\sin x + C$', '$\\sin x + C$', '$\\cos x + C$', '$\\tan x + C$'], a: 1, exp: '$\\int \\cos x\\,dx = \\sin x + C$.' },
    ],
    // ── Ch 5: Series ──
    'series': [
      { q: 'The geometric series $\\sum_{n=0}^\\infty r^n$ converges when:', o: ['$r < 1$', '$|r| < 1$', '$r > 0$', '$r \\neq 1$'], a: 1, exp: 'Geometric series converges iff $|r| < 1$, and the sum is $\\frac{1}{1-r}$.' },
      { q: 'If $\\lim_{n \\to \\infty} a_n \\neq 0$, then $\\sum a_n$:', o: ['Converges', 'Diverges', 'May converge', 'Equals 0'], a: 1, exp: 'Divergence Test: if the terms don\'t approach 0, the series must diverge.' },
      { q: 'The $p$-series $\\sum \\frac{1}{n^p}$ converges when:', o: ['$p > 0$', '$p > 1$', '$p \\geq 1$', '$p > 2$'], a: 1, exp: 'The $p$-series converges iff $p > 1$. The harmonic series ($p=1$) famously diverges.' },
      { q: 'The Maclaurin series for $e^x$ is:', o: ['$\\sum \\frac{x^n}{n}$', '$\\sum \\frac{x^n}{n!}$', '$\\sum \\frac{x^{2n}}{(2n)!}$', '$\\sum nx^n$'], a: 1, exp: '$e^x = \\sum_{n=0}^\\infty \\frac{x^n}{n!} = 1 + x + \\frac{x^2}{2!} + \\frac{x^3}{3!} + \\cdots$' },
      { q: 'The Ratio Test says $\\sum a_n$ converges if:', o: ['$\\lim |a_{n+1}/a_n| > 1$', '$\\lim |a_{n+1}/a_n| < 1$', '$\\lim |a_{n+1}/a_n| = 1$', '$\\lim a_n = 0$'], a: 1, exp: 'If the ratio limit $L < 1$, the series converges absolutely. If $L > 1$, it diverges. $L = 1$ is inconclusive.' },
      { q: '$\\sum_{n=0}^\\infty \\frac{1}{2^n} = $?', o: ['$1$', '$2$', '$\\infty$', '$1/2$'], a: 1, exp: 'Geometric series with $r = 1/2$: $\\frac{1}{1 - 1/2} = 2$.' },
      { q: 'An alternating series $\\sum (-1)^n b_n$ converges if $b_n$ is:', o: ['Increasing and $b_n \\to 0$', 'Decreasing and $b_n \\to 0$', 'Bounded', 'Positive'], a: 1, exp: 'Alternating Series Test: $b_n$ must be decreasing and $\\lim b_n = 0$.' },
      { q: 'The Taylor series of $\\sin x$ centered at $0$ contains:', o: ['Only even powers', 'Only odd powers', 'All powers', 'Only constant terms'], a: 1, exp: '$\\sin x = x - \\frac{x^3}{3!} + \\frac{x^5}{5!} - \\cdots$ — only odd powers (since $\\sin$ is an odd function).' },
      { q: 'The radius of convergence of $\\sum \\frac{x^n}{n!}$ is:', o: ['$1$', '$e$', '$\\infty$', '$0$'], a: 2, exp: 'The series for $e^x$ converges for all $x$, so $R = \\infty$.' },
    ],
    // ── Ch 6: Parametric & Polar ──
    'parametric-polar': [
      { q: 'For $x = \\cos t$, $y = \\sin t$, the curve is a:', o: ['Line', 'Parabola', 'Circle', 'Ellipse'], a: 2, exp: '$\\cos^2 t + \\sin^2 t = 1$, so $x^2 + y^2 = 1$ — a unit circle.' },
      { q: '$\\frac{dy}{dx}$ for parametric curves equals:', o: ['$\\frac{dx/dt}{dy/dt}$', '$\\frac{dy/dt}{dx/dt}$', '$\\frac{dy}{dt}$', '$\\frac{dx}{dt}$'], a: 1, exp: 'Chain rule: $\\frac{dy}{dx} = \\frac{dy/dt}{dx/dt}$.' },
      { q: 'In polar coordinates, the area enclosed by $r = f(\\theta)$ from $\\alpha$ to $\\beta$ is:', o: ['$\\int_\\alpha^\\beta r\\,d\\theta$', '$\\frac{1}{2}\\int_\\alpha^\\beta r^2\\,d\\theta$', '$\\int_\\alpha^\\beta r^2\\,d\\theta$', '$\\pi r^2$'], a: 1, exp: 'Polar area: $A = \\frac{1}{2}\\int_\\alpha^\\beta [f(\\theta)]^2 d\\theta$.' },
      { q: 'The polar curve $r = 1 + \\cos\\theta$ is called a:', o: ['Rose', 'Limaçon', 'Cardioid', 'Lemniscate'], a: 2, exp: '$r = 1 + \\cos\\theta$ is a cardioid (heart shape) — a special case of a limaçon where $a = b$.' },
      { q: 'Convert $(r, \\theta) = (2, \\pi/3)$ to Cartesian:', o: ['$(1, \\sqrt{3})$', '$(\\sqrt{3}, 1)$', '$(1, 1)$', '$(2, 2)$'], a: 0, exp: '$x = r\\cos\\theta = 2 \\cdot 1/2 = 1$, $y = r\\sin\\theta = 2 \\cdot \\sqrt{3}/2 = \\sqrt{3}$.' },
    ],
    // ── Ch 7: Multivariable ──
    'multivariable': [
      { q: 'If $f(x,y) = x^2 y + y^3$, then $\\frac{\\partial f}{\\partial x} = $?', o: ['$2xy$', '$x^2 + 3y^2$', '$2xy + 3y^2$', '$2x + y$'], a: 0, exp: 'Treat $y$ as constant: $\\frac{\\partial}{\\partial x}(x^2 y + y^3) = 2xy + 0 = 2xy$.' },
      { q: 'The gradient $\\nabla f$ points in the direction of:', o: ['Steepest descent', 'Steepest ascent', 'Zero change', 'The tangent line'], a: 1, exp: 'The gradient points in the direction of maximum rate of increase.' },
      { q: 'Green\'s Theorem relates a line integral to a:', o: ['Triple integral', 'Surface integral', 'Double integral', 'Volume integral'], a: 2, exp: 'Green\'s Theorem: $\\oint_C = \\iint_D$ (line integral around boundary = double integral over region).' },
      { q: '$\\frac{\\partial^2 f}{\\partial x \\partial y} = \\frac{\\partial^2 f}{\\partial y \\partial x}$ when $f$ has:', o: ['First derivatives', 'Continuous second partial derivatives', 'A maximum', 'No critical points'], a: 1, exp: 'Clairaut\'s Theorem: mixed partials are equal when both are continuous.' },
      { q: 'In Lagrange multipliers, we solve:', o: ['$\\nabla f = 0$', '$\\nabla f = \\lambda \\nabla g$', '$f = g$', '$\\nabla g = 0$'], a: 1, exp: 'Lagrange: $\\nabla f = \\lambda \\nabla g$ along with the constraint $g = 0$.' },
    ],
    // ── Ch 8: Linear Algebra ──
    'linear-algebra': [
      { q: 'If $A$ is a $3 \\times 2$ matrix and $B$ is $2 \\times 4$, then $AB$ is:', o: ['$3 \\times 4$', '$2 \\times 2$', '$3 \\times 2$', 'Undefined'], a: 0, exp: '$(m \\times n)(n \\times p) = m \\times p$. So $(3 \\times 2)(2 \\times 4) = 3 \\times 4$.' },
      { q: 'The determinant of $\\begin{pmatrix} 2 & 1 \\\\ 3 & 4 \\end{pmatrix}$ is:', o: ['$5$', '$11$', '$-5$', '$8$'], a: 0, exp: '$\\det = ad - bc = 2(4) - 1(3) = 8 - 3 = 5$.' },
      { q: '$A\\mathbf{v} = \\lambda\\mathbf{v}$ means $\\mathbf{v}$ is a(n):', o: ['Basis vector', 'Null vector', 'Eigenvector', 'Unit vector'], a: 2, exp: 'An eigenvector satisfies $Av = \\lambda v$ — the matrix only scales it.' },
      { q: 'A set of vectors is linearly independent if:', o: ['They span the whole space', 'No vector is a linear combination of the others', 'They are all unit vectors', 'They are all orthogonal'], a: 1, exp: 'Linearly independent: the only solution to $c_1 v_1 + \\cdots + c_n v_n = 0$ is all $c_i = 0$.' },
      { q: 'The rank of a matrix equals:', o: ['The number of rows', 'The number of pivot positions', 'The determinant', 'The trace'], a: 1, exp: 'Rank = number of pivot positions in row echelon form = dimension of column space.' },
      { q: 'If $\\det(A) = 0$, then $A$ is:', o: ['Invertible', 'Singular (not invertible)', 'Symmetric', 'Diagonal'], a: 1, exp: 'A matrix is invertible iff $\\det(A) \\neq 0$. If $\\det = 0$, it\'s singular.' },
      { q: 'The dimension of the null space of a $5 \\times 3$ matrix with rank 2 is:', o: ['$1$', '$2$', '$3$', '$5$'], a: 0, exp: 'Rank-Nullity: rank + nullity = # columns. $2 + \\text{nullity} = 3$, so nullity $= 1$.' },
    ],
    // ── Ch 9: Differential Equations ──
    'diff-eq': [
      { q: 'The ODE $\\frac{dy}{dx} = ky$ has the general solution:', o: ['$y = kx + C$', '$y = Ce^{kx}$', '$y = \\sin(kx)$', '$y = Cx^k$'], a: 1, exp: 'Separating variables: $\\frac{dy}{y} = k\\,dx \\implies \\ln|y| = kx + C_1 \\implies y = Ce^{kx}$.' },
      { q: 'A separable ODE has the form:', o: ['$y\'\' + y = 0$', '$\\frac{dy}{dx} = f(x)g(y)$', '$y\' + P(x)y = Q(x)$', '$y\' = x + y$'], a: 1, exp: 'Separable: can be written as $\\frac{dy}{g(y)} = f(x)\\,dx$ and integrated both sides.' },
      { q: 'The characteristic equation of $y\'\' - 5y\' + 6y = 0$ is:', o: ['$r^2 + 5r + 6 = 0$', '$r^2 - 5r + 6 = 0$', '$r^2 - 5r - 6 = 0$', '$r^2 + 6r - 5 = 0$'], a: 1, exp: 'Replace $y\'\'$ with $r^2$, $y\'$ with $r$, $y$ with $1$: $r^2 - 5r + 6 = 0$.' },
      { q: 'If the characteristic roots are $r = 2 \\pm 3i$, the general solution involves:', o: ['$e^{2x}$ and $e^{3x}$', '$e^{2x}\\cos(3x)$ and $e^{2x}\\sin(3x)$', '$e^{3x}\\cos(2x)$', '$\\cos(2x)$ and $\\sin(3x)$'], a: 1, exp: 'Complex roots $\\alpha \\pm \\beta i$ give $e^{\\alpha x}\\cos(\\beta x)$ and $e^{\\alpha x}\\sin(\\beta x)$.' },
      { q: 'An integrating factor for $y\' + P(x)y = Q(x)$ is:', o: ['$e^{P(x)}$', '$e^{\\int P(x)dx}$', '$P(x)$', '$\\int Q(x)dx$'], a: 1, exp: 'The integrating factor $\\mu = e^{\\int P(x)dx}$ makes the left side an exact derivative.' },
      { q: 'The equation $y\' = -2y$ with $y(0) = 5$ has solution:', o: ['$y = 5e^{2t}$', '$y = 5e^{-2t}$', '$y = -2e^{5t}$', '$y = 5 - 2t$'], a: 1, exp: '$y = Ce^{-2t}$, and $y(0) = C = 5$, so $y = 5e^{-2t}$ (exponential decay).' },
    ],
    // ── Ch 10: Real Analysis ──
    'real-analysis': [
      { q: 'The Completeness Axiom states that every bounded-above nonempty subset of $\\mathbb{R}$ has a:', o: ['Maximum', 'Supremum in $\\mathbb{R}$', 'Limit point', 'Minimum'], a: 1, exp: 'Completeness: every nonempty bounded-above set has a least upper bound (supremum) IN $\\mathbb{R}$.' },
      { q: 'A sequence $\\{a_n\\}$ converges to $L$ if for every $\\varepsilon > 0$:', o: ['$|a_n - L| < \\varepsilon$ for all $n$', '$\\exists N$ such that $n \\geq N \\implies |a_n - L| < \\varepsilon$', '$a_n < L + \\varepsilon$', '$|a_n| < \\varepsilon$'], a: 1, exp: 'The formal definition: eventually (after some $N$), all terms stay within $\\varepsilon$ of $L$.' },
      { q: 'The Bolzano-Weierstrass Theorem states:', o: ['Every sequence converges', 'Every bounded sequence has a convergent subsequence', 'Every Cauchy sequence converges', 'Every monotone sequence converges'], a: 1, exp: 'B-W: bounded ⟹ has a convergent subsequence. The sequence itself need not converge.' },
      { q: 'In $\\mathbb{R}$, a sequence is convergent if and only if it is:', o: ['Bounded', 'Monotone', 'Cauchy', 'Increasing'], a: 2, exp: 'In $\\mathbb{R}$, convergent ⟺ Cauchy. This is a consequence of completeness.' },
      { q: '$\\sup\\{1 - 1/n : n \\in \\mathbb{N}\\} = $?', o: ['$0$', '$1$', '$1 - 1/n$', '$\\infty$'], a: 1, exp: 'The terms $1 - 1/n$ approach 1 but never reach it. The sup is 1 (not attained).' },
      { q: 'A bounded monotone increasing sequence:', o: ['Diverges', 'Converges to its supremum', 'Oscillates', 'Is Cauchy but not convergent'], a: 1, exp: 'Monotone Convergence Theorem: bounded + monotone ⟹ converges (to the sup if increasing).' },
    ],
    // ── Ch 11: Abstract Algebra ──
    'abstract-algebra': [
      { q: 'A group must satisfy all of the following EXCEPT:', o: ['Closure', 'Commutativity', 'Associativity', 'Existence of inverses'], a: 1, exp: 'Groups need closure, associativity, identity, and inverses. Commutativity is extra (that makes it abelian).' },
      { q: 'The order of $\\mathbb{Z}_6$ is:', o: ['$3$', '$6$', '$12$', '$\\infty$'], a: 1, exp: 'The order of a group is its number of elements. $\\mathbb{Z}_6 = \\{0,1,2,3,4,5\\}$ has 6 elements.' },
      { q: 'Lagrange\'s Theorem says $|H|$ divides $|G|$ when $H$ is a:', o: ['Normal subgroup', 'Subgroup', 'Subset', 'Coset'], a: 1, exp: 'Lagrange: for any subgroup $H \\leq G$, $|H|$ divides $|G|$. No extra conditions needed.' },
      { q: 'The identity element in $(\\mathbb{Z}, +)$ is:', o: ['$1$', '$0$', '$-1$', 'Does not exist'], a: 1, exp: '$0 + a = a + 0 = a$ for all $a$, so 0 is the identity under addition.' },
      { q: 'A group where $ab = ba$ for all elements is called:', o: ['Cyclic', 'Simple', 'Abelian', 'Normal'], a: 2, exp: 'Abelian (named after Niels Henrik Abel) = commutative group.' },
    ],
    // ── Ch 12: Probability ──
    'probability': [
      { q: 'If $P(A) = 0.3$ and $P(B) = 0.5$ and $A, B$ are independent, then $P(A \\cap B) = $?', o: ['$0.8$', '$0.15$', '$0.2$', '$0.35$'], a: 1, exp: 'Independent events: $P(A \\cap B) = P(A) \\cdot P(B) = 0.3 \\times 0.5 = 0.15$.' },
      { q: 'For a discrete random variable, $E[X] = $?', o: ['$\\sum x_i$', '$\\sum x_i \\cdot P(x_i)$', '$\\int x f(x) dx$', '$P(X = x)$'], a: 1, exp: 'Expected value: $E[X] = \\sum x_i P(X = x_i)$ — the probability-weighted average.' },
      { q: 'The Central Limit Theorem says that sample means approach a:', o: ['Uniform distribution', 'Binomial distribution', 'Normal distribution', 'Poisson distribution'], a: 2, exp: 'CLT: the distribution of sample means → Normal as $n \\to \\infty$, regardless of the original distribution.' },
      { q: 'Bayes\' Theorem relates $P(A|B)$ to:', o: ['$P(B|A)$', '$P(A \\cup B)$', '$P(A) + P(B)$', '$1 - P(A)$'], a: 0, exp: '$P(A|B) = \\frac{P(B|A) P(A)}{P(B)}$ — it "flips" the conditioning.' },
      { q: '$\\text{Var}(X) = $?', o: ['$E[X]^2$', '$E[X^2] - (E[X])^2$', '$E[X^2]$', '$\\sqrt{E[X]}$'], a: 1, exp: 'Variance: $\\text{Var}(X) = E[X^2] - (E[X])^2$ — the "mean of squares minus square of mean."' },
      { q: 'A Binomial($n, p$) random variable counts:', o: ['Time until first success', 'Number of successes in $n$ trials', 'Number of events in a time period', 'The median value'], a: 1, exp: 'Binomial: number of successes in $n$ independent Bernoulli trials, each with success probability $p$.' },
      { q: 'If $P(A) = 0$, then event $A$ is:', o: ['Certain', 'Impossible (in probability terms)', 'Independent of all events', 'Complementary'], a: 1, exp: '$P(A) = 0$ means $A$ is (almost certainly) impossible.' },
    ],
  };

  // ============================================================
  //  QUIZ RENDERING & INTERACTION
  // ============================================================

  function shuffleArray(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function buildQuizHTML(questions, chapterId) {
    const picked = shuffleArray(questions).slice(0, Math.min(questions.length, 10));
    const qid = 'mcq-' + chapterId;

    let html = `<div class="mc-quiz" id="${qid}">`;
    html += `<div class="mc-quiz-header">`;
    html += `<h4>📝 Quick-Check: Multiple Choice</h4>`;
    html += `<span class="mc-score" id="${qid}-score"></span>`;
    html += `</div>`;

    picked.forEach((q, i) => {
      html += `<div class="mc-question" data-correct="${q.a}" data-idx="${i}">`;
      html += `<div class="mc-q-text"><span class="mc-q-num">${i + 1}.</span> ${q.q}</div>`;
      html += `<div class="mc-options">`;
      q.o.forEach((opt, j) => {
        html += `<button class="mc-option" data-choice="${j}"><span class="mc-option-letter">${'ABCD'[j]}</span>${opt}</button>`;
      });
      html += `</div>`;
      html += `<div class="mc-explanation" style="display:none"><strong>Explanation:</strong> ${q.exp}</div>`;
      html += `</div>`;
    });

    html += `<div class="mc-quiz-footer">`;
    html += `<button class="mc-check-btn">Check Answers</button>`;
    html += `<button class="mc-retry-btn" style="display:none">Try New Questions</button>`;
    html += `</div>`;
    html += `</div>`;
    return html;
  }

  function attachQuizListeners(container) {
    container.querySelectorAll('.mc-option').forEach(btn => {
      btn.addEventListener('click', function () {
        const question = this.closest('.mc-question');
        if (question.classList.contains('mc-answered')) return;
        question.querySelectorAll('.mc-option').forEach(o => o.classList.remove('mc-selected'));
        this.classList.add('mc-selected');
      });
    });

    container.querySelectorAll('.mc-check-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        const quiz = this.closest('.mc-quiz');
        let correct = 0, total = 0;

        quiz.querySelectorAll('.mc-question').forEach(q => {
          total++;
          q.classList.add('mc-answered');
          const correctIdx = parseInt(q.dataset.correct);
          const selected = q.querySelector('.mc-option.mc-selected');
          const correctBtn = q.querySelector(`.mc-option[data-choice="${correctIdx}"]`);

          correctBtn.classList.add('mc-correct');
          if (selected) {
            if (parseInt(selected.dataset.choice) === correctIdx) {
              correct++;
              selected.classList.add('mc-correct');
            } else {
              selected.classList.add('mc-wrong');
            }
          }
          q.querySelector('.mc-explanation').style.display = 'block';
        });

        const scoreEl = quiz.querySelector('.mc-score');
        scoreEl.textContent = `${correct}/${total}`;
        scoreEl.className = 'mc-score ' + (correct === total ? 'mc-perfect' : correct >= total * 0.7 ? 'mc-good' : 'mc-needs-work');

        this.style.display = 'none';
        quiz.querySelector('.mc-retry-btn').style.display = '';
      });
    });

    container.querySelectorAll('.mc-retry-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        const quiz = this.closest('.mc-quiz');
        const chapterId = quiz.id.replace('mcq-', '');
        if (Q[chapterId]) {
          const wrapper = quiz.parentElement;
          quiz.remove();
          wrapper.insertAdjacentHTML('beforeend', buildQuizHTML(Q[chapterId], chapterId));
          attachQuizListeners(wrapper);
        }
      });
    });
  }

  function injectQuizzes() {
    const chapters = document.querySelectorAll('.chapter[id]');
    chapters.forEach(chapter => {
      const chId = chapter.id;
      if (!Q[chId]) return;
      if (chapter.querySelector('.mc-quiz')) return;

      const lastPractice = Array.from(chapter.querySelectorAll('.practice-section')).pop();
      const target = lastPractice || chapter;

      const wrapper = document.createElement('div');
      wrapper.className = 'mc-quiz-wrapper';
      wrapper.innerHTML = buildQuizHTML(Q[chId], chId);

      if (lastPractice) {
        lastPractice.after(wrapper);
      } else {
        const lastLesson = Array.from(chapter.querySelectorAll('.lesson')).pop();
        if (lastLesson) lastLesson.appendChild(wrapper);
        else chapter.appendChild(wrapper);
      }
      attachQuizListeners(wrapper);
    });
  }

  function initQuizzes() {
    injectQuizzes();
    const renderKatex = () => {
      if (window.renderMathInElement) {
        document.querySelectorAll('.mc-quiz').forEach(el => {
          window.renderMathInElement(el, {
            delimiters: [
              { left: '$$', right: '$$', display: true },
              { left: '$', right: '$', display: false },
              { left: '\\(', right: '\\)', display: false },
              { left: '\\[', right: '\\]', display: true }
            ],
            throwOnError: false
          });
        });
      }
    };
    setTimeout(renderKatex, 300);

    const obs = new MutationObserver(() => {
      injectQuizzes();
      setTimeout(renderKatex, 300);
    });
    const main = document.querySelector('.main-content') || document.body;
    obs.observe(main, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(initQuizzes, 400));
  } else {
    setTimeout(initQuizzes, 400);
  }
})();
