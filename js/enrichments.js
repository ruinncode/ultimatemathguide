(function () {
  'use strict';

  // ============================================================
  //  THEOREM / DEFINITION ENRICHMENT DATA
  //  Maps box-title text (cleaned) to enrichment objects.
  //  Each has: what, usage, visual (fn or null), history
  // ============================================================

  const E = {};

  /* ---------- 1.1 Number Systems & Set Theory ---------- */
  E['The Number Systems'] = {
    what: 'A hierarchy of number sets: naturals (ℕ) ⊂ integers (ℤ) ⊂ rationals (ℚ) ⊂ reals (ℝ) ⊂ complex (ℂ). Each extension was invented to solve equations the previous set could not.',
    usage: 'Knowing which set a number belongs to tells you what operations are valid. For instance, division isn\'t closed in ℤ, but it is in ℚ (except by 0).',
    history: 'The naturals are humanity\'s oldest numbers — tally marks date back 30,000 years. Negative numbers were resisted in Europe until the 1600s. Irrational numbers were discovered by the Pythagoreans (~500 BC) who reportedly drowned the member who revealed √2 was irrational. Complex numbers became accepted only after Gauss and Euler gave them geometric meaning in the 1700s.',
    visual: drawNumberSystems
  };

  E['Interval Notation'] = {
    what: 'A compact way to describe subsets of the real line. Square brackets [ ] include endpoints (closed), parentheses ( ) exclude them (open). Infinity always gets a parenthesis because it\'s not a real number.',
    usage: 'Used everywhere in calculus for domains, ranges, and describing where a function is continuous, increasing, or differentiable.',
    history: 'Modern interval notation became standard in the late 19th century as analysis was being formalized by Weierstrass, Dedekind, and Cantor. Before this, mathematicians described intervals verbally.',
    visual: drawIntervalNotation
  };

  E['Theorem: √2 is Irrational'] = {
    what: 'The square root of 2 cannot be expressed as a fraction p/q of integers. It\'s a proof by contradiction — one of the most elegant in all of mathematics.',
    usage: 'This is a foundational result that shows the rationals have "gaps." It motivates the construction of the real numbers and is the gateway proof for learning proof techniques.',
    history: 'Attributed to Hippasus of Metapontum (~500 BC), a Pythagorean. The Pythagoreans believed all quantities could be expressed as ratios of whole numbers. The discovery of irrationals was so shocking that, according to legend, Hippasus was drowned at sea for revealing it.',
    visual: drawSqrt2Proof
  };

  /* ---------- 1.2 Algebra Essentials ---------- */
  E['Essential Identities You Must Know'] = {
    what: 'Core algebraic identities like (a+b)² = a² + 2ab + b², difference of squares a²−b² = (a−b)(a+b), and the binomial theorem. These are building blocks for all algebraic manipulation.',
    usage: 'Used constantly for simplifying expressions, factoring polynomials, completing the square, and in calculus for algebraic manipulation before differentiation/integration.',
    history: 'Many of these identities appear in Euclid\'s Elements (~300 BC) as geometric propositions. Al-Khwarizmi\'s 9th-century algebra text gave them algebraic form. The word "algebra" comes from his book title "al-jabr."',
    visual: drawAlgebraIdentity
  };

  E['Exponent Laws'] = {
    what: 'Rules governing how exponents combine: product rule (aᵐ·aⁿ = aᵐ⁺ⁿ), quotient rule, power rule, and the definitions of zero/negative/fractional exponents.',
    usage: 'Essential for simplifying expressions in algebra, calculus (especially when differentiating power functions), and in modeling exponential growth/decay.',
    history: 'Exponent notation was introduced by René Descartes in 1637 in his "La Géométrie." Before this, mathematicians would write x·x·x instead of x³. Fractional and negative exponents were formalized by Newton and Euler.',
    visual: drawExponentLaws
  };

  E['Logarithm Laws'] = {
    what: 'Rules for combining logarithms: log(ab) = log(a) + log(b), log(a/b) = log(a) − log(b), log(aⁿ) = n·log(a). The logarithm is the inverse of exponentiation.',
    usage: 'Used to solve exponential equations, simplify products into sums (invaluable in calculus for logarithmic differentiation), and in real-world applications like the Richter scale, pH, and decibels.',
    history: 'Invented independently by John Napier (1614) and Jost Bürgi (1620) to simplify astronomical calculations. Before calculators, log tables and slide rules (which are mechanical logarithm computers) were essential tools for scientists and engineers for over 300 years.',
    visual: drawLogLaws
  };

  E['Quadratic Formula'] = {
    what: 'For ax² + bx + c = 0, the solutions are x = (−b ± √(b²−4ac)) / 2a. The discriminant Δ = b²−4ac tells you the nature of roots: Δ>0 → two real, Δ=0 → one repeated, Δ<0 → two complex.',
    usage: 'The go-to method for solving any quadratic. In calculus, it finds critical points, in physics it solves projectile motion, and the discriminant determines stability in differential equations.',
    history: 'Babylonian mathematicians (~2000 BC) could solve quadratics using geometric methods. The general formula was known to Indian mathematician Brahmagupta (628 AD). The familiar form we use today was popularized in the 1500s by European algebraists.',
    visual: drawQuadraticFormula
  };

  /* ---------- 1.3 Functions ---------- */
  E['Definition: Function'] = {
    what: 'A function f: A → B is a rule that assigns to each element in the domain A exactly one element in the codomain B. The key constraint is "exactly one" — each input maps to a single output.',
    usage: 'Functions are the central objects of calculus and all higher mathematics. Derivatives, integrals, and limits are all defined in terms of functions.',
    history: 'The modern definition emerged from the work of Dirichlet (1837) and was formalized by set theorists in the early 1900s. Euler (1748) was among the first to use f(x) notation, though the concept of function has evolved dramatically over centuries.',
    visual: drawFunctionDef
  };

  E['Key Function Properties'] = {
    what: 'Domain & range, even/odd symmetry, periodicity, boundedness, and monotonicity. These properties help you understand a function\'s behavior before doing any calculus.',
    usage: 'Knowing symmetry can halve your work (integrals of odd functions on symmetric intervals = 0). Monotonicity tells you about invertibility. Boundedness is crucial for convergence arguments.',
    history: 'Symmetry properties were studied by the Greeks in geometry. The formal classification of functions as even/odd was developed in the 18th century by Euler and others as Fourier analysis revealed the importance of decomposing functions into symmetric components.',
    visual: null
  };

  E['Function Composition & Inverses'] = {
    what: 'Composition (f∘g)(x) = f(g(x)) chains functions together. The inverse f⁻¹ "undoes" f: f(f⁻¹(x)) = x. A function has an inverse if and only if it is one-to-one (injective).',
    usage: 'Composition is the basis of the chain rule in calculus. Inverses give us logarithms (inverse of exponentials), arcsin/arccos/arctan, and are used to solve equations by "undoing" operations.',
    history: 'The concept of inverse functions was implicit in the work of Euler and Lagrange. The formal theory was developed alongside abstract algebra in the 19th century, where the ideas of inverse and composition became central to group theory.',
    visual: null
  };

  E['Transformations of Functions'] = {
    what: 'Shifting (f(x) + k, f(x−h)), scaling (a·f(x), f(bx)), and reflecting (−f(x), f(−x)). These predictable modifications let you build complex functions from simple ones.',
    usage: 'In curve sketching, you start with parent functions and apply transformations. In signal processing, these correspond to time shifts, amplitude changes, and frequency scaling.',
    history: 'Function transformations became a systematic tool in the 18th-19th centuries. The idea that complex shapes can be built from simple ones via transformations is central to Fourier analysis (1807) and modern computer graphics.',
    visual: null
  };

  /* ---------- 1.4 Trigonometry ---------- */
  E['The Unit Circle & Trig Functions'] = {
    what: 'On the unit circle (radius 1), an angle θ determines a point (cos θ, sin θ). This definition extends trig functions to all real numbers, not just acute angles in triangles.',
    usage: 'The unit circle is the foundation for all trigonometry in calculus, Fourier analysis, complex analysis, and physics. It connects geometry with algebra and analysis.',
    history: 'Trigonometry originated with Babylonian and Greek astronomers (Hipparchus, ~150 BC) who needed it for planetary calculations. Indian mathematicians (Aryabhata, 499 AD) developed the sine function. The unit circle approach was formalized by Euler in the 18th century.',
    visual: drawUnitCircleDemo
  };

  E['Essential Trig Identities'] = {
    what: 'Pythagorean (sin²+cos²=1), double angle, sum/difference, and power reduction formulas. These are algebraic relationships that hold for all valid angles.',
    usage: 'Used to simplify integrals (trig substitution, power reduction), solve trig equations, prove other identities, and in signal processing (beating frequencies, modulation).',
    history: 'Pythagorean identities follow directly from the unit circle and were known to ancient Greeks. Sum formulas were developed by Ptolemy (~150 AD). The systematic collection of identities we use today was organized by Euler in the 1700s.',
    visual: drawTrigIdentity
  };

  /* ---------- 2.1 Limits ---------- */
  E['Informal Definition of Limit'] = {
    what: 'lim_{x→a} f(x) = L means: as x gets arbitrarily close to a (but not equal), f(x) gets arbitrarily close to L. The function doesn\'t need to be defined at a — we only care about nearby behavior.',
    usage: 'Limits are the foundation of all calculus. Derivatives are limits of difference quotients, integrals are limits of Riemann sums, and continuity is defined via limits.',
    history: 'The intuitive idea of limits was used by Archimedes (~250 BC) in his method of exhaustion. Newton and Leibniz used "infinitesimals" (1680s) which were philosophically problematic. The rigorous ε-δ definition was finally given by Weierstrass in the 1860s, resolving two centuries of controversy.',
    visual: drawLimitDemo
  };

  E['One-Sided Limits'] = {
    what: 'lim_{x→a⁻} f(x) approaches from the left; lim_{x→a⁺} f(x) from the right. The two-sided limit exists only if both one-sided limits exist and are equal.',
    usage: 'Essential for analyzing piecewise functions, detecting jump discontinuities, and defining derivatives at endpoints of intervals.',
    history: 'One-sided limits became important as mathematicians in the 19th century constructed increasingly "pathological" functions to test the boundaries of their definitions. Dirichlet\'s function (1829) — 1 on rationals, 0 on irrationals — highlighted the need for careful limit definitions.',
    visual: null
  };

  E['Limit Laws'] = {
    what: 'Rules for computing limits: the limit of a sum is the sum of limits, the limit of a product is the product of limits, etc. These let you break complex limits into simpler pieces.',
    usage: 'The everyday tools for evaluating limits. Combined with algebraic manipulation, they handle most limit computations without needing the ε-δ definition.',
    history: 'Formalized as part of the rigorization of calculus in the 19th century. These laws seem "obvious" but their proofs from the ε-δ definition are important exercises that build mathematical maturity.',
    visual: null
  };

  E['Squeeze Theorem (Sandwich Theorem)'] = {
    what: 'If g(x) ≤ f(x) ≤ h(x) near a, and lim g(x) = lim h(x) = L, then lim f(x) = L. You "squeeze" the unknown function between two known ones.',
    usage: 'The standard way to prove lim_{x→0} (sin x)/x = 1, which is foundational to calculus. Also used for oscillating functions like x²sin(1/x) near zero.',
    history: 'The geometric idea dates to Archimedes\' method of exhaustion, where he bounded π by inscribing and circumscribing polygons on a circle. The formal theorem was articulated as part of the ε-δ framework in the 19th century.',
    visual: drawSqueezeTheorem
  };

  E['Formal (ε-δ) Definition of Limit'] = {
    what: 'lim_{x→a} f(x) = L means: for every ε > 0, there exists δ > 0 such that 0 < |x − a| < δ implies |f(x) − L| < ε. This makes "arbitrarily close" mathematically precise.',
    usage: 'The rigorous foundation of all of calculus. Used to prove limit laws, continuity, and in real analysis. Mastering ε-δ proofs is a rite of passage for math majors.',
    history: 'Developed by Karl Weierstrass in the 1860s at the University of Berlin. Before this, calculus rested on intuitive (and often contradictory) notions of "infinitely small" quantities. Weierstrass gave calculus its modern logical foundation — this is why he\'s called the "father of modern analysis."',
    visual: drawEpsilonDelta
  };

  E['Definition: Continuity at a Point'] = {
    what: 'f is continuous at a if: (1) f(a) is defined, (2) lim_{x→a} f(x) exists, and (3) lim_{x→a} f(x) = f(a). Intuitively: no holes, jumps, or vertical asymptotes.',
    usage: 'Continuity is required for the Intermediate Value Theorem, Extreme Value Theorem, Mean Value Theorem, and the Fundamental Theorem of Calculus — essentially every major theorem in calculus.',
    history: 'Bolzano (1817) was the first to give a definition close to our modern one. Weierstrass refined it. The discovery of everywhere-continuous-but-nowhere-differentiable functions (Weierstrass, 1872) shocked mathematicians and showed continuity and differentiability are very different.',
    visual: drawContinuity
  };

  E['Intermediate Value Theorem (IVT)'] = {
    what: 'If f is continuous on [a,b] and k is between f(a) and f(b), then there exists c ∈ (a,b) with f(c) = k. A continuous function must take every intermediate value.',
    usage: 'The primary tool for proving equations have solutions (root existence). Used in bisection methods for numerical root-finding, and in many analysis proofs.',
    history: 'First rigorously proved by Bolzano in 1817 — one of the earliest examples of careful ε-δ style reasoning. Cauchy also proved it shortly after. It seems "obvious" (a continuous curve can\'t jump over a line) but the proof requires the completeness of the real numbers.',
    visual: drawIVT
  };

  /* ---------- 3.1 The Derivative ---------- */
  E['Definition: The Derivative'] = {
    what: 'f\'(x) = lim_{h→0} [f(x+h) − f(x)]/h — the instantaneous rate of change of f at x. Geometrically, it\'s the slope of the tangent line.',
    usage: 'The derivative is one of the two pillars of calculus. It\'s used in optimization, related rates, physics (velocity, acceleration), economics (marginal cost/revenue), and modeling any quantity that changes.',
    history: 'Independently invented by Newton and Leibniz in the 1680s, sparking one of the most bitter priority disputes in scientific history. Newton called it "fluxions," Leibniz used dy/dx notation. Their different notations are both still used today, 340 years later.',
    visual: drawDerivativeDemo
  };

  /* ---------- 3.2 Differentiation Rules ---------- */
  E['The Differentiation Rules (Memorize All of These)'] = {
    what: 'Power rule, product rule, quotient rule, and chain rule — the four rules that let you differentiate any elementary function without going back to the limit definition.',
    usage: 'These rules are your main toolkit. Combined with known derivatives of basic functions (trig, exponential, logarithmic), they handle virtually any differentiation problem.',
    history: 'The power rule was known to Newton and Leibniz. The product and quotient rules follow from the definition. The chain rule — the most important and subtle — was articulated by Leibniz and used naturally in his dy/dx notation: dy/dx = (dy/du)(du/dx).',
    visual: null
  };

  E['Derivatives of Common Functions'] = {
    what: 'A reference table of derivatives: d/dx[sin x] = cos x, d/dx[eˣ] = eˣ, d/dx[ln x] = 1/x, and so on. These are the "vocabulary" of differentiation.',
    usage: 'Combined with the four differentiation rules, knowing these derivatives lets you differentiate any elementary function. The derivative of eˣ being itself is what makes the exponential function so central to mathematics.',
    history: 'These were discovered individually over centuries. The derivative of sin x = cos x comes from the geometric limit lim_{θ→0} (sin θ)/θ = 1, proved rigorously in the 18th century. The special property of eˣ was recognized by Euler.',
    visual: null
  };

  /* ---------- 3.3 Applications ---------- */
  E['Critical Points & Extrema'] = {
    what: 'A critical point occurs where f\'(c) = 0 or f\'(c) is undefined. Local extrema can only occur at critical points. The first/second derivative tests classify them.',
    usage: 'The foundation of optimization — finding maximum/minimum values. Used in everything from engineering design to machine learning loss function minimization.',
    history: 'Fermat (1638) was the first to observe that extreme values occur where the derivative is zero, making him a key precursor to calculus. The complete theory was developed by Newton, Leibniz, and their successors.',
    visual: drawCriticalPoints
  };

  E['Mean Value Theorem (MVT)'] = {
    what: 'If f is continuous on [a,b] and differentiable on (a,b), there exists c ∈ (a,b) where f\'(c) = [f(b)−f(a)]/(b−a). At some point, the instantaneous rate equals the average rate.',
    usage: 'One of the most important theoretical tools in calculus. It proves that constant derivative ⟹ constant function, is used to prove L\'Hôpital\'s rule, and establishes error bounds in Taylor\'s theorem.',
    history: 'A generalization of Rolle\'s Theorem (1691). The MVT in its modern form is due to Cauchy (1823). It\'s the theoretical backbone connecting derivatives to function values — "the most useful theorem in calculus" according to many mathematicians.',
    visual: drawMVT
  };

  E["L'Hôpital's Rule"] = {
    what: 'When lim f/g gives 0/0 or ∞/∞, you can take lim f\'/g\' instead (if it exists). Can be applied repeatedly for persistent indeterminate forms.',
    usage: 'The standard tool for evaluating indeterminate limits. Used constantly in calculus, analysis, and applied mathematics. However, it should be a last resort — algebraic simplification is often faster.',
    history: 'Published by Guillaume de L\'Hôpital in 1696 in the first calculus textbook ever written. However, the rule was actually discovered by Johann Bernoulli, who was paid by L\'Hôpital for mathematical tutoring. Their correspondence confirming Bernoulli\'s authorship was found after both men had died.',
    visual: drawLHopital
  };

  /* ---------- 4.1 Antiderivatives ---------- */
  E['Definition: Antiderivative'] = {
    what: 'F is an antiderivative of f if F\'(x) = f(x). The general antiderivative is F(x) + C, where C is an arbitrary constant. The "+C" is essential because derivatives of constants vanish.',
    usage: 'Antiderivatives are integral (pun intended) to computing definite integrals via the Fundamental Theorem of Calculus, solving differential equations, and finding position from velocity.',
    history: 'The concept arose naturally alongside differentiation in the work of Newton and Leibniz. The notation ∫ f(x) dx was invented by Leibniz (1675) — the elongated S stands for "summa" (sum), reflecting the connection between antiderivatives and areas.',
    visual: null
  };

  /* ---------- 4.2 FTC ---------- */
  E['Fundamental Theorem of Calculus (FTC)'] = {
    what: 'FTC1: d/dx ∫ₐˣ f(t)dt = f(x). FTC2: ∫ₐᵇ f(x)dx = F(b) − F(a). These connect the two main operations of calculus: differentiation and integration are inverses.',
    usage: 'The FTC makes definite integrals computable — instead of taking limits of Riemann sums, you find an antiderivative and evaluate. It\'s arguably the most important theorem in all of calculus.',
    history: 'Glimpsed by Newton and Leibniz independently in the 1680s, this is the reason calculus works as a unified subject. Newton proved it geometrically; Leibniz algebraically. The rigorous proof requires the Mean Value Theorem and was refined by Cauchy and Riemann in the 19th century.',
    visual: drawFTC
  };

  /* ---------- 5.1 Integration Techniques ---------- */
  E['u-Substitution (Reverse Chain Rule)'] = {
    what: 'If you spot f(g(x))·g\'(x), let u = g(x), du = g\'(x)dx, and the integral simplifies to ∫f(u)du. It\'s the chain rule run backwards.',
    usage: 'The most frequently used integration technique. Should be the first thing you try on any integral that isn\'t immediately recognizable.',
    history: 'A direct consequence of the chain rule, systematized by Euler and his contemporaries in the 18th century. The "u" variable substitution notation became standard in calculus textbooks by the 19th century.',
    visual: null
  };

  E['Integration by Parts'] = {
    what: '∫u dv = uv − ∫v du. Choose u and dv wisely using LIATE (Log, Inverse trig, Algebraic, Trig, Exponential) to decide which factor becomes u.',
    usage: 'Essential for integrals involving products of different types of functions: ∫x·eˣ dx, ∫x·sin x dx, ∫ln x dx. Also used to derive reduction formulas.',
    history: 'The integration analog of the product rule, formalized in the 18th century. Brook Taylor (of Taylor series fame) used it extensively. The tabular method (a computational shortcut) was popularized in the 20th century.',
    visual: null
  };

  E['Partial Fractions'] = {
    what: 'Decompose a rational function into simpler fractions: P(x)/Q(x) = A/(x−r₁) + B/(x−r₂) + .... Each piece has a known antiderivative.',
    usage: 'The standard technique for integrating any rational function. Also used in solving differential equations via Laplace transforms and in signal processing (transfer functions).',
    history: 'Developed by Leibniz and Johann Bernoulli in the late 1600s. The method is purely algebraic but was motivated entirely by the need to integrate rational functions. It\'s one of the few techniques that works for an entire class of functions.',
    visual: null
  };

  E['Trigonometric Substitution'] = {
    what: 'Replace x with a trig expression to eliminate square roots: √(a²−x²) → x = a sin θ, √(a²+x²) → x = a tan θ, √(x²−a²) → x = a sec θ.',
    usage: 'The go-to method for integrals involving square roots of quadratic expressions. Arises in computing arc lengths, surface areas, and in physics.',
    history: 'Developed by Euler and his contemporaries in the 18th century. It leverages the Pythagorean identity sin²θ + cos²θ = 1 to simplify radicals — an elegant connection between trigonometry and calculus.',
    visual: null
  };

  /* ---------- 6 Series ---------- */
  E['Sequence vs. Series'] = {
    what: 'A sequence is an ordered list a₁, a₂, a₃, .... A series is the sum ∑aₙ. Convergence means different things: for sequences, the terms approach a limit; for series, the partial sums approach a limit.',
    usage: 'Series are used to represent functions (Taylor series), solve differential equations (power series), compute probabilities, and approximate values to any desired accuracy.',
    history: 'Zeno\'s paradoxes (~450 BC) first raised the issue of infinite sums. Archimedes summed a geometric series to find the area of a parabolic segment. The systematic study of series convergence began with Cauchy (1821).',
    visual: drawSequenceVsSeries
  };

  E['Convergence Tests (The Complete Toolkit)'] = {
    what: 'A collection of tests to determine if an infinite series converges: Divergence test, Geometric series, p-series, Comparison, Limit Comparison, Ratio, Root, Integral, Alternating series tests.',
    usage: 'Series convergence is essential in determining where Taylor/power series are valid, in probability (expectations), numerical analysis, and in proving mathematical results.',
    history: 'The tests were developed piecemeal over 200 years. The Ratio test is due to d\'Alembert (1768), the Integral test to Cauchy (1823), and the Root test to Cauchy as well. The toolkit was completed by the mid-19th century.',
    visual: null
  };

  E['Taylor Series'] = {
    what: 'f(x) = ∑ f⁽ⁿ⁾(a)/n! · (x−a)ⁿ represents a function as an infinite polynomial centered at a. Maclaurin series are the special case a = 0.',
    usage: 'One of the most powerful tools in mathematics: approximating functions, computing limits, solving ODEs, evaluating integrals that have no closed form, and in numerical computing (how your calculator computes sin, cos, eˣ).',
    history: 'Published by Brook Taylor in 1715, but special cases were known earlier to James Gregory (1668) and Madhava of Sangamagrama (~1400 AD, in India — 300 years before Taylor!). Maclaurin popularized the a=0 case in 1742.',
    visual: drawTaylorSeries
  };

  E["Beautiful Connection: Euler's Formula"] = {
    what: 'e^(iθ) = cos θ + i sin θ, and the special case e^(iπ) + 1 = 0 (Euler\'s identity), connecting e, i, π, 1, and 0 — the five most important constants in mathematics.',
    usage: 'Euler\'s formula unifies trigonometry and exponentials, simplifies AC circuit analysis, is the basis of the Fourier transform, and is fundamental to quantum mechanics.',
    history: 'Discovered by Leonhard Euler in 1748. Richard Feynman called Euler\'s identity "the most remarkable formula in mathematics." It emerges naturally from substituting iθ into the Taylor series for eˣ.',
    visual: drawEulerFormula
  };

  /* ---------- 7 Parametric & Polar ---------- */
  E['Parametric Curves'] = {
    what: 'A curve defined by x = f(t), y = g(t) where t is a parameter. This lets you describe curves that aren\'t functions (like circles) and track position over time.',
    usage: 'Used in physics (projectile motion), computer graphics (Bézier curves), robotics (path planning), and for computing arc length and surface area.',
    history: 'Parametric descriptions were implicit in the work of ancient astronomers describing planetary orbits. The formal mathematical framework was developed by Euler and Lagrange in the 18th century.',
    visual: null
  };

  E['Polar Coordinates & Calculus'] = {
    what: 'A coordinate system where points are described by (r, θ) — distance from origin and angle. Area = ½∫r² dθ. Useful for curves with rotational symmetry.',
    usage: 'Natural for describing spirals, roses, cardioids, and any geometry with circular symmetry. Used in antenna theory, complex analysis, and fluid dynamics.',
    history: 'Introduced by Newton and independently by Jacob Bernoulli (~1691). The name "polar" was first used by Gregorio Fontana in 1784. Polar coordinates are essential in complex analysis where z = re^(iθ).',
    visual: null
  };

  /* ---------- 8 Multivariable ---------- */
  E['Partial Derivatives'] = {
    what: 'The derivative of f(x,y) with respect to one variable while holding the other constant. ∂f/∂x treats y as a constant. Multiple partial derivatives exist at each point.',
    usage: 'Foundation of multivariable calculus: gradient, divergence, curl, optimization with constraints (Lagrange multipliers), and in every area of physics and engineering.',
    history: 'Notation ∂ was introduced by Legendre (1786) and popularized by Jacobi (1841). Partial derivatives became central as mathematics moved from single-variable to multivariable calculus in the 18th-19th centuries.',
    visual: null
  };

  E['Double & Triple Integrals'] = {
    what: 'Extensions of definite integrals to 2D and 3D: ∬f(x,y) dA computes volume under a surface, ∭f(x,y,z) dV computes "hypervolume" or total mass/charge in a region.',
    usage: 'Computing areas, volumes, centers of mass, moments of inertia, gravitational/electric fields, and probabilities over multi-dimensional regions.',
    history: 'Developed by Euler, Lagrange, and Gauss in the 18th century. The formalization of multiple integrals (Fubini\'s theorem, change of variables) was completed in the 19th century by Jacobi, Dirichlet, and Jordan.',
    visual: null
  };

  E['Key Theorems of Vector Calculus'] = {
    what: 'Green\'s Theorem (2D), Stokes\' Theorem (surfaces), and the Divergence Theorem (3D) — all are generalizations of the Fundamental Theorem of Calculus relating integrals over a region to integrals over its boundary.',
    usage: 'The backbone of electromagnetism (Maxwell\'s equations), fluid dynamics, and differential geometry. They convert hard integrals into easier ones.',
    history: 'Green\'s Theorem (1828) by George Green, a self-taught miller. Stokes\' Theorem appeared as a Cambridge exam problem in 1854, set by William Thomson (Lord Kelvin) but named after Stokes. The Divergence Theorem was proved independently by Gauss, Ostrogradsky, and Green.',
    visual: null
  };

  /* ---------- 9 Linear Algebra ---------- */
  E['Matrix Fundamentals'] = {
    what: 'Matrices are rectangular arrays of numbers that represent linear maps. Key operations: addition, multiplication, row reduction, determinants, inverses.',
    usage: 'Used in computer graphics, machine learning, quantum mechanics, statistics, network analysis, differential equations — arguably the most applied area of mathematics.',
    history: 'The concept dates to ancient China (Nine Chapters, ~200 BC). The term "matrix" was coined by Sylvester (1850). Cayley (1858) developed matrix algebra. Today, matrix computation is a multi-billion dollar industry (GPUs are matrix multiplication machines).',
    visual: null
  };

  E['Vector Space'] = {
    what: 'A set V with addition and scalar multiplication satisfying 8 axioms. Elements are "vectors" (which can be functions, matrices, etc. — not just arrows). Subspaces, span, basis, and dimension describe the structure.',
    usage: 'The abstract framework unifying linear algebra. Function spaces (used in quantum mechanics and PDEs), solution spaces of differential equations, and data spaces in ML are all vector spaces.',
    history: 'Abstractly defined by Peano (1888), building on the work of Hamilton (quaternions, 1843) and Grassmann (extension theory, 1844). The abstract approach was initially controversial but became dominant in the 20th century.',
    visual: null
  };

  E['Eigenvalues & Eigenvectors'] = {
    what: 'Av = λv — an eigenvector v is a direction that a matrix A only stretches (by factor λ), not rotates. Finding them involves solving det(A − λI) = 0.',
    usage: 'Principal Component Analysis (data science), Google\'s PageRank, quantum mechanics (observables are eigenvalues), vibration analysis, stability of differential equations, and facial recognition.',
    history: 'The word "eigen" is German for "own/characteristic." The concept was developed by Cauchy (1829) for quadratic forms, refined by Hilbert for infinite-dimensional spaces (1904), and became central to quantum mechanics via Heisenberg and Schrödinger (1920s).',
    visual: drawEigenvalues
  };

  E['Key Concepts'] = {
    what: 'Linear independence, span, basis, dimension, rank, and nullity — the core structural properties of vector spaces that determine what systems of equations can be solved.',
    usage: 'Determining if a system has solutions (rank), how many free variables exist (nullity), and finding the most efficient representation of data (basis).',
    history: 'These concepts were formalized in the late 19th century as linear algebra transitioned from concrete matrix computations to abstract vector space theory. The rank-nullity theorem is one of the most elegant results.',
    visual: null
  };

  /* ---------- 10 Differential Equations ---------- */
  E['Types of First-Order ODEs'] = {
    what: 'Separable (separate x and y), Linear (use integrating factor), Exact (find potential function), and homogeneous types. Each has a systematic solution method.',
    usage: 'Model population growth (logistic equation), radioactive decay, Newton\'s law of cooling, mixing problems, circuit analysis (RL/RC circuits), and chemical reaction rates.',
    history: 'The Bernoullis (Jacob and Johann), Euler, and Lagrange developed solution methods throughout the 18th century. Separable equations were understood first; exact equations required the theory of differential forms.',
    visual: null
  };

  E['Constant Coefficient 2nd Order ODEs'] = {
    what: 'ay\'\' + by\' + cy = g(x): find the characteristic equation ar² + br + c = 0. Distinct real roots → e^(r₁x), e^(r₂x). Complex roots → eᵅˣ(cos βx, sin βx). Repeated → eʳˣ, xeʳˣ.',
    usage: 'Describes mechanical vibrations (springs/dampers), electrical circuits (RLC), wave propagation, and any system with inertia and restoring force.',
    history: 'Euler (1743) developed the characteristic equation method. D\'Alembert and Lagrange contributed variation of parameters. These equations describe everything from bridges swaying to atoms vibrating — making them central to engineering physics.',
    visual: null
  };

  /* ---------- 11 Real Analysis ---------- */
  E['The Completeness Axiom'] = {
    what: 'Every non-empty subset of ℝ that is bounded above has a least upper bound (supremum) in ℝ. This is what distinguishes ℝ from ℚ — the rationals have "gaps" (like at √2), the reals don\'t.',
    usage: 'The single most important axiom in analysis. It\'s needed to prove the Intermediate Value Theorem, Extreme Value Theorem, Bolzano-Weierstrass, and virtually every theorem about convergence.',
    history: 'Formalized by Dedekind (1872) via "Dedekind cuts" and independently by Cantor via Cauchy sequences. Before this, the real numbers were used intuitively for 200 years of calculus without a rigorous definition — a remarkable fact.',
    visual: drawCompleteness
  };

  E['Supremum and Infimum'] = {
    what: 'sup(S) is the least upper bound — the smallest number ≥ every element of S. inf(S) is the greatest lower bound. Unlike max/min, sup/inf always exist for bounded sets (by the completeness axiom) even if they\'re not in the set.',
    usage: 'The precise tools for talking about bounds. The limit of a bounded increasing sequence equals the sup of its range. Essential in measure theory, optimization, and functional analysis.',
    history: 'The concepts were made rigorous by Weierstrass and Dedekind in the 1860s-70s. They resolved ambiguities in earlier work where mathematicians talked about "the greatest value less than..." without knowing such a thing always existed.',
    visual: drawSupInf
  };

  E['Archimedean Property'] = {
    what: 'For any real x > 0, there exists a natural number n with n > x. Equivalently, there is no "infinitely large" natural number. The rationals (and reals) are Archimedean; hyperreals are not.',
    usage: 'Used in ε-δ proofs to find N large enough: "Given ε > 0, choose N > 1/ε." It guarantees that you can always make 1/n as small as needed.',
    history: 'Named after Archimedes (~250 BC), who used it to prove the area of a circle. It\'s a consequence of the completeness axiom. Non-Archimedean fields (like the p-adic numbers) are important in number theory.',
    visual: drawArchimedean
  };

  E['Formal Definition: Sequence Convergence'] = {
    what: '{aₙ} converges to L if: ∀ε > 0, ∃N ∈ ℕ such that n ≥ N ⟹ |aₙ − L| < ε. After some point N, all terms stay within ε of L.',
    usage: 'The foundation for all convergence arguments in analysis. Series convergence, continuity via sequences, and completeness are all built on this definition.',
    history: 'Formalized by Bolzano (1817) and Cauchy (1821), making precise what Newton and Euler had used intuitively. This definition, along with the ε-δ limit, is what made analysis rigorous.',
    visual: drawSequenceConvergence
  };

  E['Monotone Convergence Theorem'] = {
    what: 'Every bounded monotone sequence converges. If {aₙ} is increasing and bounded above, then lim aₙ = sup{aₙ}. If decreasing and bounded below, lim aₙ = inf{aₙ}.',
    usage: 'A major tool for proving sequences converge when you can\'t find the limit directly. Define a recursive sequence, show it\'s monotone and bounded, conclude it converges, then find the limit by taking limits of the recursion.',
    history: 'A consequence of the Completeness Axiom, formalized in the 19th century. It captures the intuition that a staircase going up but with a ceiling must have a highest step it approaches.',
    visual: drawMonotoneConvergence
  };

  E['Bolzano-Weierstrass Theorem'] = {
    what: 'Every bounded sequence in ℝ has a convergent subsequence. Even if the sequence itself oscillates wildly, you can always extract a well-behaved subsequence.',
    usage: 'One of the most powerful tools in analysis. Used to prove the Extreme Value Theorem, compactness results, and in optimization to show that minimizers exist.',
    history: 'Proved by Bolzano (1817, unpublished) and independently by Weierstrass (~1860s). The proof uses the "bisection method" — repeatedly halving an interval — one of the most elegant constructions in analysis.',
    visual: drawBolzanoWeierstrass
  };

  E['Cauchy Sequences'] = {
    what: '{aₙ} is Cauchy if terms get arbitrarily close to each other: ∀ε > 0, ∃N such that m,n ≥ N ⟹ |aₘ − aₙ| < ε. In ℝ, Cauchy ⟺ convergent.',
    usage: 'Cauchy sequences let you prove convergence without knowing the limit. This is how Cantor constructed the real numbers — as equivalence classes of Cauchy sequences of rationals.',
    history: 'Introduced by Cauchy (1821). The Cauchy criterion is powerful because it\'s "intrinsic" — you don\'t need to know the limit to prove convergence. This idea was used by Cantor (1872) to construct ℝ, an alternative to Dedekind cuts.',
    visual: drawCauchySequence
  };

  /* ---------- 12 Abstract Algebra ---------- */
  E['Definition: Group'] = {
    what: 'A set G with an operation · satisfying: (1) Closure, (2) Associativity, (3) Identity element exists, (4) Inverses exist. The simplest algebraic structure with symmetry.',
    usage: 'Groups describe symmetry in all its forms: crystal structures (chemistry), particle physics (the Standard Model), cryptography (elliptic curve groups), error-correcting codes, and Rubik\'s cube solutions.',
    history: 'Invented by Évariste Galois (1832), a 20-year-old who wrote down the theory the night before dying in a duel. His work showed that the unsolvability of the quintic by radicals was due to the structure of symmetric groups — one of the most dramatic stories in mathematics.',
    visual: drawGroupDemo
  };

  E["Lagrange's Theorem"] = {
    what: 'The order of any subgroup H of a finite group G divides the order of G: |H| divides |G|. Equivalently, the number of cosets of H in G is |G|/|H|.',
    usage: 'Immediately restricts which subgroups can exist. For a group of order 12, subgroups can only have orders 1, 2, 3, 4, 6, or 12. Used throughout group theory and number theory (Fermat\'s little theorem is a corollary).',
    history: 'Proved by Lagrange in 1771, decades before groups were formally defined! He was studying permutations of roots of polynomials. The theorem was retroactively recognized as a group theory result when Galois and Cayley formalized the concept.',
    visual: drawLagrangeTheorem
  };

  /* ---------- 13 Probability ---------- */
  E['Probability Axioms (Kolmogorov)'] = {
    what: 'Three axioms: (1) P(E) ≥ 0, (2) P(Ω) = 1, (3) P(A∪B) = P(A) + P(B) for disjoint events. Everything in probability theory follows from these three simple rules.',
    usage: 'The foundation of all probability and statistics: insurance, medicine, machine learning, finance, physics (quantum mechanics), and game theory.',
    history: 'Axiomatized by Andrey Kolmogorov in 1933, using measure theory. Before this, probability was a collection of techniques without a unified foundation. Kolmogorov\'s axioms did for probability what Euclid\'s axioms did for geometry.',
    visual: drawProbabilityAxioms
  };

  E['Central Limit Theorem'] = {
    what: 'The sum (or average) of n independent random variables approaches a normal distribution as n → ∞, regardless of the original distribution. This is why the bell curve appears everywhere.',
    usage: 'The theoretical basis for confidence intervals, hypothesis testing, polling, quality control, and why measurement errors tend to be normally distributed.',
    history: 'First proved by de Moivre (1733) for coin flips, generalized by Laplace (1810), and given its modern form by Lyapunov (1901) and Lindeberg (1922). Einstein used it in his 1905 paper on Brownian motion.',
    visual: drawCLT
  };

  E['Random Variables'] = {
    what: 'A random variable X is a function from the sample space to ℝ. Discrete: takes countable values (PMF). Continuous: takes values in intervals (PDF). E[X] is the average, Var(X) measures spread.',
    usage: 'The mathematical framework for modeling uncertainty. Every statistical model, machine learning algorithm, and risk assessment uses random variables.',
    history: 'The concept was implicit in the work of Pascal and Fermat (1654, correspondence on gambling problems). Formalized by Kolmogorov as measurable functions in 1933.',
    visual: null
  };

  E['Important Distributions'] = {
    what: 'Bernoulli (binary), Binomial (count of successes), Poisson (rare events), Normal/Gaussian (bell curve), Exponential (waiting times), Uniform (equal likelihood).',
    usage: 'Each distribution models a specific type of randomness. Normal: measurement errors, test scores. Poisson: website hits, radioactive decay. Exponential: time between events.',
    history: 'The Normal distribution was discovered by de Moivre (1733) and Gauss (1809). Poisson (1837) modeled rare events. Each distribution has a rich history connected to the real-world problems that motivated it.',
    visual: null
  };

  // ============================================================
  //  VISUAL DRAWING FUNCTIONS
  // ============================================================

  function createCanvas(container, w, h) {
    const c = document.createElement('canvas');
    c.width = w * 2; c.height = h * 2;
    c.style.width = w + 'px'; c.style.height = h + 'px';
    c.style.borderRadius = '8px';
    c.style.display = 'block';
    c.style.margin = '0 auto';
    const ctx = c.getContext('2d');
    ctx.scale(2, 2);
    container.appendChild(c);
    return { c, ctx, w, h };
  }

  function drawNumberSystems(container) {
    const { ctx, w, h } = createCanvas(container, 340, 200);
    const sets = [
      { label: 'ℂ Complex', r: 90, color: 'rgba(167,139,250,0.15)', border: '#a78bfa' },
      { label: 'ℝ Real', r: 75, color: 'rgba(52,211,153,0.15)', border: '#34d399' },
      { label: 'ℚ Rational', r: 58, color: 'rgba(74,158,255,0.15)', border: '#4a9eff' },
      { label: 'ℤ Integer', r: 40, color: 'rgba(240,184,50,0.15)', border: '#f0b832' },
      { label: 'ℕ Natural', r: 22, color: 'rgba(108,99,255,0.25)', border: '#6c63ff' },
    ];
    const cx = w / 2, cy = h / 2;
    sets.forEach(s => {
      ctx.beginPath(); ctx.arc(cx, cy, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.color; ctx.fill();
      ctx.strokeStyle = s.border; ctx.lineWidth = 1.5; ctx.stroke();
    });
    const labelPos = [[-72, -78], [-55, -62], [-38, -42], [-22, -22], [0, 4]];
    sets.forEach((s, i) => {
      ctx.fillStyle = s.border;
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(s.label, cx + labelPos[i][0], cy + labelPos[i][1]);
    });
  }

  function drawIntervalNotation(container) {
    const { ctx, w, h } = createCanvas(container, 340, 120);
    ctx.fillStyle = '#a0a0b0'; ctx.font = '11px Inter, sans-serif'; ctx.textAlign = 'center';
    const examples = [
      { text: '[a, b]  — closed', y: 25, leftOpen: false, rightOpen: false },
      { text: '(a, b)  — open', y: 55, leftOpen: true, rightOpen: true },
      { text: '[a, b)  — half-open', y: 85, leftOpen: false, rightOpen: true },
    ];
    examples.forEach(ex => {
      const x1 = 80, x2 = 260;
      ctx.strokeStyle = '#6c63ff'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(x1, ex.y); ctx.lineTo(x2, ex.y); ctx.stroke();
      [{ x: x1, open: ex.leftOpen }, { x: x2, open: ex.rightOpen }].forEach(pt => {
        ctx.beginPath(); ctx.arc(pt.x, ex.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = pt.open ? '#0a0a0f' : '#6c63ff'; ctx.fill();
        ctx.strokeStyle = '#6c63ff'; ctx.lineWidth = 2; ctx.stroke();
      });
      ctx.fillStyle = '#a0a0b0'; ctx.font = '11px Inter, sans-serif';
      ctx.fillText(ex.text, w / 2, ex.y - 10);
    });
  }

  function drawSqrt2Proof(container) {
    const { ctx, w, h } = createCanvas(container, 340, 180);
    ctx.fillStyle = '#a0a0b0'; ctx.font = '12px Inter, sans-serif'; ctx.textAlign = 'left';
    const x = 20;
    ctx.fillStyle = '#f0b832'; ctx.fillText('Proof by Contradiction:', x, 25);
    ctx.fillStyle = '#e0e0e0'; ctx.font = '11px Inter, sans-serif';
    const lines = [
      '1. Assume √2 = p/q (fully reduced)',
      '2. Then p² = 2q²  →  p is even  →  p = 2k',
      '3. Then 4k² = 2q²  →  q² = 2k²  →  q is even',
      '4. Both even ⟹ gcd(p,q) ≥ 2  — Contradiction! ✗',
      '∴ √2 is irrational ✓'
    ];
    lines.forEach((l, i) => {
      ctx.fillStyle = i === 4 ? '#34d399' : i === 3 ? '#f87171' : '#e0e0e0';
      ctx.fillText(l, x, 50 + i * 26);
    });
  }

  function drawAlgebraIdentity(container) {
    const { ctx, w, h } = createCanvas(container, 340, 170);
    const s = 60;
    const ox = 40, oy = 30;
    ctx.strokeStyle = '#6c63ff'; ctx.lineWidth = 2;
    ctx.strokeRect(ox, oy, s + s, s + s);
    ctx.strokeStyle = '#f0b832'; ctx.setLineDash([4, 3]);
    ctx.beginPath(); ctx.moveTo(ox + s, oy); ctx.lineTo(ox + s, oy + s + s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ox, oy + s); ctx.lineTo(ox + s + s, oy + s); ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = '13px JetBrains Mono, monospace'; ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(108,99,255,0.3)';
    ctx.fillRect(ox + 1, oy + 1, s - 1, s - 1);
    ctx.fillStyle = 'rgba(240,184,50,0.2)';
    ctx.fillRect(ox + s + 1, oy + 1, s - 1, s - 1);
    ctx.fillRect(ox + 1, oy + s + 1, s - 1, s - 1);
    ctx.fillStyle = 'rgba(52,211,153,0.2)';
    ctx.fillRect(ox + s + 1, oy + s + 1, s - 1, s - 1);
    ctx.fillStyle = '#6c63ff'; ctx.fillText('a²', ox + s / 2, oy + s / 2 + 5);
    ctx.fillStyle = '#f0b832'; ctx.fillText('ab', ox + s + s / 2, oy + s / 2 + 5);
    ctx.fillStyle = '#f0b832'; ctx.fillText('ab', ox + s / 2, oy + s + s / 2 + 5);
    ctx.fillStyle = '#34d399'; ctx.fillText('b²', ox + s + s / 2, oy + s + s / 2 + 5);
    ctx.fillStyle = '#e0e0e0'; ctx.font = '11px Inter, sans-serif';
    ctx.fillText('a', ox + s / 2, oy - 8); ctx.fillText('b', ox + s + s / 2, oy - 8);
    ctx.textAlign = 'right'; ctx.fillText('a', ox - 8, oy + s / 2 + 4); ctx.fillText('b', ox - 8, oy + s + s / 2 + 4);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#a78bfa'; ctx.font = '13px JetBrains Mono, monospace';
    ctx.fillText('(a+b)² = a² + 2ab + b²', w / 2, h - 15);
  }

  function drawExponentLaws(container) {
    const { ctx, w, h } = createCanvas(container, 340, 130);
    ctx.font = '12px JetBrains Mono, monospace'; ctx.textAlign = 'center';
    const rules = [
      { text: 'aᵐ · aⁿ = aᵐ⁺ⁿ', color: '#6c63ff' },
      { text: 'aᵐ / aⁿ = aᵐ⁻ⁿ', color: '#00d2ff' },
      { text: '(aᵐ)ⁿ = aᵐⁿ', color: '#f0b832' },
      { text: 'a⁰ = 1', color: '#34d399' },
    ];
    rules.forEach((r, i) => {
      ctx.fillStyle = r.color; ctx.fillText(r.text, w / 2, 25 + i * 28);
    });
  }

  function drawLogLaws(container) {
    const { ctx, w, h } = createCanvas(container, 340, 140);
    ctx.font = '12px JetBrains Mono, monospace'; ctx.textAlign = 'center';
    const rules = [
      { text: 'log(ab) = log a + log b', color: '#6c63ff' },
      { text: 'log(a/b) = log a − log b', color: '#00d2ff' },
      { text: 'log(aⁿ) = n · log a', color: '#f0b832' },
      { text: 'logₐ b = ln b / ln a', color: '#34d399' },
    ];
    rules.forEach((r, i) => {
      ctx.fillStyle = r.color; ctx.fillText(r.text, w / 2, 28 + i * 28);
    });
  }

  function drawQuadraticFormula(container) {
    const { ctx, w, h } = createCanvas(container, 340, 200);
    const a = 1, b = -2, c = -3;
    ctx.strokeStyle = '#333'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(20, h / 2); ctx.lineTo(w - 20, h / 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w / 2, 10); ctx.lineTo(w / 2, h - 10); ctx.stroke();
    ctx.strokeStyle = '#6c63ff'; ctx.lineWidth = 2; ctx.beginPath();
    for (let px = 20; px < w - 20; px++) {
      const x = (px - w / 2) / 30;
      const y = a * x * x + b * x + c;
      const py = h / 2 - y * 20;
      if (px === 20) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    const disc = b * b - 4 * a * c;
    if (disc >= 0) {
      const r1 = (-b - Math.sqrt(disc)) / (2 * a), r2 = (-b + Math.sqrt(disc)) / (2 * a);
      [r1, r2].forEach(r => {
        const px = w / 2 + r * 30;
        ctx.beginPath(); ctx.arc(px, h / 2, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#f87171'; ctx.fill();
      });
    }
    ctx.fillStyle = '#a0a0b0'; ctx.font = '11px Inter, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('x² − 2x − 3 = 0  →  roots at x = −1, 3', w / 2, h - 10);
    ctx.fillStyle = '#f0b832'; ctx.font = '10px Inter, sans-serif';
    ctx.fillText('Δ = b²−4ac = 16 > 0  →  two real roots', w / 2, 15);
  }

  function drawFunctionDef(container) {
    const { ctx, w, h } = createCanvas(container, 340, 160);
    const drawSet = (cx, cy, label, items, color) => {
      ctx.beginPath(); ctx.ellipse(cx, cy, 40, 55, 0, 0, Math.PI * 2);
      ctx.fillStyle = color + '15'; ctx.fill();
      ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = color; ctx.font = 'bold 12px Inter'; ctx.textAlign = 'center';
      ctx.fillText(label, cx, cy - 45);
      ctx.font = '12px Inter';
      items.forEach((it, i) => { ctx.fillText(it, cx, cy - 20 + i * 20); });
    };
    drawSet(90, 80, 'Domain A', ['1', '2', '3', '4'], '#6c63ff');
    drawSet(250, 80, 'Codomain B', ['a', 'b', 'c', 'd'], '#34d399');
    const arrows = [[90, 60, 250, 60], [90, 80, 250, 80], [90, 100, 250, 60], [90, 120, 250, 120]];
    ctx.strokeStyle = '#f0b832'; ctx.lineWidth = 1.5;
    arrows.forEach(([x1, y1, x2, y2]) => {
      ctx.beginPath(); ctx.moveTo(x1 + 20, y1); ctx.lineTo(x2 - 20, y2); ctx.stroke();
      const angle = Math.atan2(y2 - y1, x2 - x1);
      ctx.beginPath(); ctx.moveTo(x2 - 20, y2);
      ctx.lineTo(x2 - 28, y2 - 4); ctx.lineTo(x2 - 28, y2 + 4); ctx.fill();
    });
    ctx.fillStyle = '#f0b832'; ctx.font = '13px Inter'; ctx.textAlign = 'center';
    ctx.fillText('f', 170, 45);
  }

  function drawUnitCircleDemo(container) {
    const { ctx, w, h } = createCanvas(container, 280, 280);
    const cx = w / 2, cy = h / 2, r = 100;
    ctx.strokeStyle = '#333'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(20, cy); ctx.lineTo(w - 20, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, 20); ctx.lineTo(cx, h - 20); ctx.stroke();
    ctx.strokeStyle = '#6c63ff'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    const angle = Math.PI / 4;
    const px = cx + r * Math.cos(angle), py = cy - r * Math.sin(angle);
    ctx.strokeStyle = '#f0b832'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = '#34d399'; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, cy); ctx.stroke();
    ctx.strokeStyle = '#00d2ff'; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, cy); ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fillStyle = '#f0b832'; ctx.fill();
    ctx.font = '11px Inter'; ctx.textAlign = 'center';
    ctx.fillStyle = '#00d2ff'; ctx.fillText('cos θ', (cx + px) / 2, cy + 15);
    ctx.fillStyle = '#34d399'; ctx.fillText('sin θ', px + 18, (cy + py) / 2);
    ctx.fillStyle = '#f0b832'; ctx.fillText('θ = π/4', cx + 30, cy - 10);
  }

  function drawTrigIdentity(container) {
    const { ctx, w, h } = createCanvas(container, 300, 160);
    const ox = 100, oy = 130, s = 90;
    ctx.strokeStyle = '#6c63ff'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + s, oy); ctx.lineTo(ox, oy - s * 0.75); ctx.closePath(); ctx.stroke();
    ctx.fillStyle = 'rgba(108,99,255,0.1)'; ctx.fill();
    ctx.font = '12px JetBrains Mono'; ctx.textAlign = 'center';
    ctx.fillStyle = '#00d2ff'; ctx.fillText('a (adj)', ox + s / 2, oy + 18);
    ctx.fillStyle = '#34d399'; ctx.fillText('b (opp)', ox - 22, oy - s * 0.375);
    ctx.fillStyle = '#f0b832'; ctx.fillText('c (hyp)', ox + s / 2 + 10, oy - s * 0.375 - 5);
    ctx.fillStyle = '#a78bfa'; ctx.font = '13px JetBrains Mono';
    ctx.fillText('a² + b² = c²', w / 2 + 30, 30);
    ctx.fillText('sin²θ + cos²θ = 1', w / 2 + 30, 55);
  }

  function drawLimitDemo(container) {
    const { ctx, w, h } = createCanvas(container, 340, 180);
    ctx.strokeStyle = '#333'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(30, h - 30); ctx.lineTo(w - 10, h - 30); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(30, h - 30); ctx.lineTo(30, 10); ctx.stroke();
    ctx.strokeStyle = '#6c63ff'; ctx.lineWidth = 2; ctx.beginPath();
    for (let px = 31; px < w - 10; px++) {
      const x = (px - 30) / 40;
      if (Math.abs(x - 4) < 0.05) continue;
      const y = x === 4 ? NaN : (x * x - 16) / (x - 4);
      const py = h - 30 - y * 15;
      if (px === 31 || isNaN(y)) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    const holeX = 30 + 4 * 40, holeY = h - 30 - 8 * 15;
    ctx.beginPath(); ctx.arc(holeX, holeY, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#0a0a0f'; ctx.fill(); ctx.strokeStyle = '#f87171'; ctx.lineWidth = 2; ctx.stroke();
    ctx.setLineDash([3, 3]); ctx.strokeStyle = '#f0b832';
    ctx.beginPath(); ctx.moveTo(30, holeY); ctx.lineTo(w - 10, holeY); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#a0a0b0'; ctx.font = '10px Inter'; ctx.textAlign = 'center';
    ctx.fillText('f(x) = (x²−16)/(x−4)', w / 2, 15);
    ctx.fillText('lim → 8 as x → 4 (hole, not defined there)', w / 2, h - 8);
    ctx.fillStyle = '#f0b832'; ctx.fillText('L = 8', 22, holeY - 5);
  }

  function drawSqueezeTheorem(container) {
    const { ctx, w, h } = createCanvas(container, 340, 180);
    ctx.strokeStyle = '#333'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(30, h / 2); ctx.lineTo(w - 10, h / 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w / 2, 10); ctx.lineTo(w / 2, h - 10); ctx.stroke();
    const plot = (fn, color) => {
      ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath();
      for (let px = 31; px < w - 10; px++) {
        const x = (px - w / 2) / 30;
        const y = fn(x); const py = h / 2 - y * 40;
        if (px === 31) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
    };
    plot(x => x === 0 ? 1 : Math.sin(x) / x, '#6c63ff');
    plot(x => 1, '#34d399');
    plot(x => Math.cos(x), '#f87171');
    ctx.fillStyle = '#a0a0b0'; ctx.font = '10px Inter'; ctx.textAlign = 'left';
    ctx.fillStyle = '#34d399'; ctx.fillText('h(x) = 1', w - 80, h / 2 - 45);
    ctx.fillStyle = '#6c63ff'; ctx.fillText('f(x) = sin(x)/x', w - 120, h / 2 - 30);
    ctx.fillStyle = '#f87171'; ctx.fillText('g(x) = cos(x)', w - 100, h / 2 + 15);
  }

  function drawEpsilonDelta(container) {
    const { ctx, w, h } = createCanvas(container, 340, 200);
    ctx.strokeStyle = '#333'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(30, h - 30); ctx.lineTo(w - 10, h - 30); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(30, h - 30); ctx.lineTo(30, 10); ctx.stroke();
    const f = x => 0.3 * x + 1;
    const a = 4, L = f(a), eps = 0.5, delta = eps / 0.3;
    const sx = x => 30 + x * 35, sy = y => h - 30 - y * 40;
    ctx.fillStyle = 'rgba(108,99,255,0.1)';
    ctx.fillRect(sx(a - delta), 10, delta * 2 * 35, h - 40);
    ctx.fillStyle = 'rgba(240,184,50,0.1)';
    ctx.fillRect(30, sy(L + eps), w - 40, eps * 2 * 40);
    ctx.strokeStyle = '#6c63ff'; ctx.lineWidth = 2; ctx.beginPath();
    for (let px = 31; px < w - 10; px++) {
      const x = (px - 30) / 35; const py = sy(f(x));
      if (px === 31) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.beginPath(); ctx.arc(sx(a), sy(L), 5, 0, Math.PI * 2);
    ctx.fillStyle = '#f0b832'; ctx.fill();
    ctx.fillStyle = '#a0a0b0'; ctx.font = '10px Inter'; ctx.textAlign = 'center';
    ctx.fillStyle = '#6c63ff'; ctx.fillText('δ-window', sx(a), h - 12);
    ctx.fillStyle = '#f0b832'; ctx.fillText('ε-band', 18, sy(L));
  }

  function drawContinuity(container) {
    const { ctx, w, h } = createCanvas(container, 340, 150);
    const drawCase = (ox, label, type) => {
      ctx.strokeStyle = '#333'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(ox, h - 25); ctx.lineTo(ox + 90, h - 25); ctx.stroke();
      ctx.strokeStyle = '#6c63ff'; ctx.lineWidth = 2;
      if (type === 'continuous') {
        ctx.beginPath();
        for (let px = 0; px < 90; px++) { const x = px / 90; const y = Math.sin(x * Math.PI) * 40 + 50; if (px === 0) ctx.moveTo(ox + px, h - 25 - y / 2); else ctx.lineTo(ox + px, h - 25 - y / 2); }
        ctx.stroke();
      } else if (type === 'jump') {
        ctx.beginPath(); ctx.moveTo(ox, h - 55); ctx.lineTo(ox + 42, h - 55); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(ox + 48, h - 80); ctx.lineTo(ox + 90, h - 80); ctx.stroke();
        ctx.beginPath(); ctx.arc(ox + 45, h - 55, 3, 0, Math.PI * 2); ctx.fillStyle = '#0a0a0f'; ctx.fill(); ctx.strokeStyle = '#f87171'; ctx.stroke();
        ctx.beginPath(); ctx.arc(ox + 45, h - 80, 3, 0, Math.PI * 2); ctx.fillStyle = '#f87171'; ctx.fill();
      } else {
        ctx.beginPath();
        for (let px = 0; px < 90; px++) { const x = (px - 45) / 20; const y = x === 0 ? 0 : 30 / x; const py = h - 55 - y; if (px === 0) ctx.moveTo(ox + px, Math.max(10, Math.min(h - 30, py))); else ctx.lineTo(ox + px, Math.max(10, Math.min(h - 30, py))); }
        ctx.stroke();
      }
      ctx.fillStyle = '#a0a0b0'; ctx.font = '10px Inter'; ctx.textAlign = 'center';
      ctx.fillText(label, ox + 45, h - 5);
    };
    drawCase(20, 'Continuous ✓', 'continuous');
    drawCase(125, 'Jump ✗', 'jump');
    drawCase(230, 'Asymptote ✗', 'asymptote');
  }

  function drawIVT(container) {
    const { ctx, w, h } = createCanvas(container, 340, 180);
    ctx.strokeStyle = '#333'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(50, h - 30); ctx.lineTo(w - 20, h - 30); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(50, h - 30); ctx.lineTo(50, 10); ctx.stroke();
    const sx = t => 50 + t * 50, sy = y => h - 30 - y * 25;
    const f = t => 0.2 * t * t * t - 1.5 * t + 3;
    ctx.strokeStyle = '#6c63ff'; ctx.lineWidth = 2; ctx.beginPath();
    for (let px = 0; px <= 250; px++) { const t = px / 50; const py = sy(f(t)); if (px === 0) ctx.moveTo(sx(t), py); else ctx.lineTo(sx(t), py); }
    ctx.stroke();
    const a = 1, b_ = 4, k = 2.5;
    ctx.setLineDash([4, 3]); ctx.strokeStyle = '#f0b832'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(50, sy(k)); ctx.lineTo(w - 20, sy(k)); ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(sx(a), sy(f(a)), 4, 0, Math.PI * 2); ctx.fillStyle = '#34d399'; ctx.fill();
    ctx.beginPath(); ctx.arc(sx(b_), sy(f(b_)), 4, 0, Math.PI * 2); ctx.fillStyle = '#34d399'; ctx.fill();
    ctx.fillStyle = '#a0a0b0'; ctx.font = '10px Inter'; ctx.textAlign = 'center';
    ctx.fillText('a', sx(a), h - 15); ctx.fillText('b', sx(b_), h - 15);
    ctx.fillStyle = '#f0b832'; ctx.fillText('k', 42, sy(k) + 4);
    ctx.fillStyle = '#f87171'; ctx.fillText('∃c: f(c) = k', w / 2, 15);
  }

  function drawDerivativeDemo(container) {
    const { ctx, w, h } = createCanvas(container, 340, 200);
    ctx.strokeStyle = '#333'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(30, h - 30); ctx.lineTo(w - 10, h - 30); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(30, h - 30); ctx.lineTo(30, 10); ctx.stroke();
    const f = x => 0.05 * x * x * x - 0.3 * x * x + 0.5 * x + 3;
    const fp = x => 0.15 * x * x - 0.6 * x + 0.5;
    const sx = x => 30 + x * 40, sy = y => h - 30 - y * 22;
    ctx.strokeStyle = '#6c63ff'; ctx.lineWidth = 2; ctx.beginPath();
    for (let px = 0; px <= w - 40; px++) { const x = px / 40; const py = sy(f(x)); if (px === 0) ctx.moveTo(sx(x), py); else ctx.lineTo(sx(x), py); }
    ctx.stroke();
    const a = 3;
    ctx.beginPath(); ctx.arc(sx(a), sy(f(a)), 5, 0, Math.PI * 2); ctx.fillStyle = '#f0b832'; ctx.fill();
    const slope = fp(a);
    ctx.strokeStyle = '#f87171'; ctx.lineWidth = 1.5; ctx.beginPath();
    ctx.moveTo(sx(a - 2), sy(f(a) - slope * 2)); ctx.lineTo(sx(a + 2), sy(f(a) + slope * 2)); ctx.stroke();
    ctx.fillStyle = '#a0a0b0'; ctx.font = '10px Inter'; ctx.textAlign = 'center';
    ctx.fillStyle = '#6c63ff'; ctx.fillText('f(x)', w - 40, 30);
    ctx.fillStyle = '#f87171'; ctx.fillText('tangent line', w - 50, sy(f(a) + slope * 2) - 5);
    ctx.fillStyle = '#f0b832'; ctx.fillText('slope = f\'(a)', sx(a) + 30, sy(f(a)) - 10);
  }

  function drawCriticalPoints(container) {
    const { ctx, w, h } = createCanvas(container, 340, 180);
    ctx.strokeStyle = '#333'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(20, h - 25); ctx.lineTo(w - 10, h - 25); ctx.stroke();
    const f = x => -0.02 * (x - 2) * (x - 5) * (x - 8) + 3;
    const sx = x => 20 + x * 30, sy = y => h - 25 - y * 18;
    ctx.strokeStyle = '#6c63ff'; ctx.lineWidth = 2; ctx.beginPath();
    for (let x = 0; x <= 10; x += 0.1) { const py = sy(f(x)); if (x === 0) ctx.moveTo(sx(x), py); else ctx.lineTo(sx(x), py); }
    ctx.stroke();
    [[3.37, 'local max', '#34d399'], [6.63, 'local min', '#f87171']].forEach(([x, label, color]) => {
      ctx.beginPath(); ctx.arc(sx(x), sy(f(x)), 5, 0, Math.PI * 2);
      ctx.fillStyle = color; ctx.fill();
      ctx.font = '10px Inter'; ctx.textAlign = 'center';
      ctx.fillText(label, sx(x), sy(f(x)) - 10);
    });
    ctx.fillStyle = '#f0b832'; ctx.font = '10px Inter'; ctx.textAlign = 'center';
    ctx.fillText('f\'(c) = 0 at critical points', w / 2, h - 5);
  }

  function drawMVT(container) {
    const { ctx, w, h } = createCanvas(container, 340, 180);
    ctx.strokeStyle = '#333'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(30, h - 25); ctx.lineTo(w - 10, h - 25); ctx.stroke();
    const f = x => 0.8 * Math.sin(x * 0.8) + 0.3 * x + 1;
    const sx = x => 30 + x * 40, sy = y => h - 25 - y * 35;
    ctx.strokeStyle = '#6c63ff'; ctx.lineWidth = 2; ctx.beginPath();
    for (let x = 0; x <= 7; x += 0.05) { const py = sy(f(x)); if (x === 0) ctx.moveTo(sx(x), py); else ctx.lineTo(sx(x), py); }
    ctx.stroke();
    const a = 1, b_ = 6;
    ctx.strokeStyle = '#34d399'; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]);
    ctx.beginPath(); ctx.moveTo(sx(a), sy(f(a))); ctx.lineTo(sx(b_), sy(f(b_))); ctx.stroke();
    ctx.setLineDash([]);
    const avgSlope = (f(b_) - f(a)) / (b_ - a);
    const c = 3.5;
    ctx.strokeStyle = '#f0b832'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(sx(c - 1.5), sy(f(c) - avgSlope * 1.5)); ctx.lineTo(sx(c + 1.5), sy(f(c) + avgSlope * 1.5)); ctx.stroke();
    ctx.beginPath(); ctx.arc(sx(c), sy(f(c)), 4, 0, Math.PI * 2); ctx.fillStyle = '#f0b832'; ctx.fill();
    ctx.fillStyle = '#a0a0b0'; ctx.font = '10px Inter'; ctx.textAlign = 'center';
    ctx.fillText('a', sx(a), h - 10); ctx.fillText('b', sx(b_), h - 10); ctx.fillText('c', sx(c), h - 10);
    ctx.fillStyle = '#34d399'; ctx.fillText('secant (avg rate)', sx(4), sy(f(4)) + 30);
    ctx.fillStyle = '#f0b832'; ctx.fillText('tangent at c (= avg rate)', sx(c) + 40, sy(f(c)) - 15);
  }

  function drawLHopital(container) {
    const { ctx, w, h } = createCanvas(container, 340, 150);
    ctx.fillStyle = '#e0e0e0'; ctx.font = '12px Inter'; ctx.textAlign = 'center';
    ctx.fillText('When direct substitution gives:', w / 2, 25);
    ctx.fillStyle = '#f87171'; ctx.font = '16px JetBrains Mono';
    ctx.fillText('0/0  or  ∞/∞', w / 2, 55);
    ctx.fillStyle = '#e0e0e0'; ctx.font = '12px Inter';
    ctx.fillText('Apply L\'Hôpital: differentiate top & bottom', w / 2, 85);
    ctx.fillStyle = '#34d399'; ctx.font = '14px JetBrains Mono';
    ctx.fillText('lim f/g  →  lim f\'/g\'', w / 2, 115);
    ctx.fillStyle = '#a0a0b0'; ctx.font = '10px Inter';
    ctx.fillText('Repeat if still indeterminate', w / 2, 140);
  }

  function drawFTC(container) {
    const { ctx, w, h } = createCanvas(container, 340, 180);
    ctx.strokeStyle = '#333'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(40, h - 30); ctx.lineTo(w - 10, h - 30); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(40, h - 30); ctx.lineTo(40, 10); ctx.stroke();
    const f = x => 2 * Math.sin(x * 0.7) + 2.5;
    const sx = x => 40 + x * 35, sy = y => h - 30 - y * 22;
    const a = 1, b_ = 6;
    ctx.fillStyle = 'rgba(108,99,255,0.2)';
    ctx.beginPath(); ctx.moveTo(sx(a), sy(0));
    for (let x = a; x <= b_; x += 0.05) ctx.lineTo(sx(x), sy(f(x)));
    ctx.lineTo(sx(b_), sy(0)); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#6c63ff'; ctx.lineWidth = 2; ctx.beginPath();
    for (let x = 0; x <= 8; x += 0.05) { const py = sy(f(x)); if (x === 0) ctx.moveTo(sx(x), py); else ctx.lineTo(sx(x), py); }
    ctx.stroke();
    ctx.fillStyle = '#a0a0b0'; ctx.font = '10px Inter'; ctx.textAlign = 'center';
    ctx.fillText('a', sx(a), h - 15); ctx.fillText('b', sx(b_), h - 15);
    ctx.fillStyle = '#f0b832'; ctx.font = '11px Inter';
    ctx.fillText('∫ₐᵇ f(x)dx = F(b) − F(a)', w / 2, 18);
    ctx.fillStyle = '#6c63ff'; ctx.font = '10px Inter';
    ctx.fillText('shaded area = net signed area', w / 2, h - 3);
  }

  function drawSequenceVsSeries(container) {
    const { ctx, w, h } = createCanvas(container, 340, 160);
    ctx.fillStyle = '#f0b832'; ctx.font = '11px Inter'; ctx.textAlign = 'left';
    ctx.fillText('Sequence: 1, 1/2, 1/4, 1/8, ...', 20, 25);
    ctx.fillText('Series:     1 + 1/2 + 1/4 + 1/8 + ... = 2', 20, 50);
    const sx = i => 30 + i * 30, sy = y => h - 20 - y * 55;
    for (let i = 0; i < 9; i++) {
      const val = Math.pow(0.5, i);
      ctx.beginPath(); ctx.arc(sx(i), sy(val), 4, 0, Math.PI * 2);
      ctx.fillStyle = '#6c63ff'; ctx.fill();
    }
    ctx.setLineDash([3, 3]); ctx.strokeStyle = '#f87171';
    ctx.beginPath(); ctx.moveTo(30, sy(0)); ctx.lineTo(w - 20, sy(0)); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#f87171'; ctx.font = '10px Inter'; ctx.textAlign = 'right';
    ctx.fillText('→ 0', w - 15, sy(0) - 5);
  }

  function drawTaylorSeries(container) {
    const { ctx, w, h } = createCanvas(container, 340, 200);
    ctx.strokeStyle = '#333'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(30, h / 2); ctx.lineTo(w - 10, h / 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w / 2, 5); ctx.lineTo(w / 2, h - 5); ctx.stroke();
    const sx = x => w / 2 + x * 25, sy = y => h / 2 - y * 25;
    ctx.strokeStyle = '#6c63ff'; ctx.lineWidth = 2; ctx.beginPath();
    for (let px = -6; px <= 6; px += 0.05) { const py = sy(Math.sin(px)); if (px === -6) ctx.moveTo(sx(px), py); else ctx.lineTo(sx(px), py); }
    ctx.stroke();
    const colors = ['#f87171', '#f0b832', '#34d399', '#a78bfa'];
    const taylor = (x, n) => { let s = 0; for (let k = 0; k <= n; k++) { const t = 2 * k + 1; let coeff = Math.pow(-1, k); for (let j = 1; j <= t; j++) coeff /= j; s += coeff * Math.pow(x, t); } return s; };
    [1, 2, 3, 5].forEach((n, i) => {
      ctx.strokeStyle = colors[i]; ctx.lineWidth = 1.2; ctx.beginPath();
      for (let px = -6; px <= 6; px += 0.05) {
        const y = taylor(px, n); const py = sy(y);
        if (py < -10 || py > h + 10) { ctx.moveTo(sx(px), Math.max(-10, Math.min(h + 10, py))); continue; }
        if (px === -6) ctx.moveTo(sx(px), py); else ctx.lineTo(sx(px), py);
      }
      ctx.stroke();
    });
    ctx.fillStyle = '#a0a0b0'; ctx.font = '10px Inter'; ctx.textAlign = 'left';
    ctx.fillStyle = '#6c63ff'; ctx.fillText('sin(x)', 10, 15);
    colors.forEach((c, i) => { ctx.fillStyle = c; ctx.fillText('n=' + [1, 2, 3, 5][i], 10 + i * 45, 30); });
  }

  function drawEulerFormula(container) {
    const { ctx, w, h } = createCanvas(container, 300, 220);
    const cx = w / 2, cy = h / 2 + 10, r = 70;
    ctx.strokeStyle = '#333'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx - r - 30, cy); ctx.lineTo(cx + r + 30, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy - r - 30); ctx.lineTo(cx, cy + r + 30); ctx.stroke();
    ctx.strokeStyle = '#6c63ff'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    const theta = Math.PI / 3;
    const px = cx + r * Math.cos(theta), py = cy - r * Math.sin(theta);
    ctx.strokeStyle = '#f0b832'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();
    ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2); ctx.fillStyle = '#f0b832'; ctx.fill();
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = '#00d2ff'; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, cy); ctx.stroke();
    ctx.strokeStyle = '#34d399'; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, cy); ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = '12px JetBrains Mono'; ctx.textAlign = 'center';
    ctx.fillStyle = '#f0b832'; ctx.fillText('e^(iθ)', px + 15, py - 10);
    ctx.fillStyle = '#34d399'; ctx.fillText('cos θ', (cx + px) / 2, cy + 18);
    ctx.fillStyle = '#00d2ff'; ctx.fillText('i sin θ', px + 25, (cy + py) / 2);
    ctx.fillStyle = '#a78bfa'; ctx.font = '14px JetBrains Mono';
    ctx.fillText('e^(iπ) + 1 = 0', w / 2, 18);
    ctx.fillStyle = '#a0a0b0'; ctx.font = '10px Inter';
    ctx.fillText('Re', cx + r + 20, cy + 4); ctx.fillText('Im', cx + 5, cy - r - 15);
  }

  function drawMonotoneConvergence(container) {
    const { ctx, w, h } = createCanvas(container, 340, 180);
    ctx.strokeStyle = '#333'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(30, h - 25); ctx.lineTo(w - 10, h - 25); ctx.stroke();
    const terms = []; for (let n = 1; n <= 12; n++) terms.push(2 - 1 / n);
    const sup = 2;
    const sx = i => 40 + i * 23, sy = y => h - 25 - (y - 1) * 80;
    ctx.setLineDash([4, 3]); ctx.strokeStyle = '#f87171';
    ctx.beginPath(); ctx.moveTo(30, sy(sup)); ctx.lineTo(w - 10, sy(sup)); ctx.stroke();
    ctx.setLineDash([]);
    terms.forEach((v, i) => {
      ctx.beginPath(); ctx.arc(sx(i), sy(v), 4, 0, Math.PI * 2); ctx.fillStyle = '#6c63ff'; ctx.fill();
    });
    ctx.fillStyle = '#f87171'; ctx.font = '10px Inter'; ctx.textAlign = 'right';
    ctx.fillText('sup = 2 (limit)', w - 15, sy(sup) - 8);
    ctx.fillStyle = '#f0b832'; ctx.font = '10px Inter'; ctx.textAlign = 'center';
    ctx.fillText('aₙ = 2 − 1/n  (increasing, bounded → converges)', w / 2, 15);
  }

  function drawBolzanoWeierstrass(container) {
    const { ctx, w, h } = createCanvas(container, 340, 170);
    ctx.strokeStyle = '#333'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(30, h / 2); ctx.lineTo(w - 10, h / 2); ctx.stroke();
    const sx = i => 35 + i * 22, sy = y => h / 2 - y * 50;
    const seq = []; for (let n = 1; n <= 13; n++) seq.push(Math.sin(n) * (1 - 0.2 / n));
    seq.forEach((v, i) => {
      ctx.beginPath(); ctx.arc(sx(i), sy(v), 3, 0, Math.PI * 2);
      ctx.fillStyle = '#a0a0b0'; ctx.fill();
    });
    const sub = [0, 2, 5, 8, 11];
    sub.forEach(i => {
      if (i < seq.length) {
        ctx.beginPath(); ctx.arc(sx(i), sy(seq[i]), 5, 0, Math.PI * 2);
        ctx.fillStyle = '#f0b832'; ctx.fill();
      }
    });
    ctx.fillStyle = '#a0a0b0'; ctx.font = '10px Inter'; ctx.textAlign = 'center';
    ctx.fillText('Bounded sequence (gray) → convergent subsequence (gold)', w / 2, h - 10);
    ctx.fillStyle = '#f0b832'; ctx.fillText('Even wild sequences have convergent subsequences', w / 2, 15);
  }

  function drawCauchySequence(container) {
    const { ctx, w, h } = createCanvas(container, 340, 170);
    ctx.strokeStyle = '#333'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(30, h - 25); ctx.lineTo(w - 10, h - 25); ctx.stroke();
    const terms = []; for (let n = 1; n <= 14; n++) terms.push(1 + Math.pow(-0.5, n));
    const sx = i => 40 + i * 20, sy = y => h - 25 - (y - 0.5) * 90;
    terms.forEach((v, i) => {
      ctx.beginPath(); ctx.arc(sx(i), sy(v), 3.5, 0, Math.PI * 2); ctx.fillStyle = '#6c63ff'; ctx.fill();
    });
    ctx.setLineDash([4, 3]); ctx.strokeStyle = '#34d399';
    ctx.beginPath(); ctx.moveTo(30, sy(1)); ctx.lineTo(w - 10, sy(1)); ctx.stroke();
    ctx.setLineDash([]);
    const eps = 0.15;
    ctx.fillStyle = 'rgba(52,211,153,0.1)';
    ctx.fillRect(30, sy(1 + eps), w - 40, (sy(1 - eps) - sy(1 + eps)));
    ctx.fillStyle = '#34d399'; ctx.font = '10px Inter'; ctx.textAlign = 'right';
    ctx.fillText('L = 1', w - 12, sy(1) - 5);
    ctx.fillStyle = '#f0b832'; ctx.font = '10px Inter'; ctx.textAlign = 'center';
    ctx.fillText('Terms cluster together → Cauchy → convergent in ℝ', w / 2, 12);
  }

  function drawCompleteness(container) {
    const { ctx, w, h } = createCanvas(container, 340, 120);
    const y = 60; ctx.strokeStyle = '#6c63ff'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(40, y); ctx.lineTo(300, y); ctx.stroke();
    ctx.fillStyle = '#f0b832'; ctx.font = '12px JetBrains Mono'; ctx.textAlign = 'center';
    const gap = 170;
    ctx.beginPath(); ctx.arc(gap, y, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#0a0a0f'; ctx.fill(); ctx.strokeStyle = '#f87171'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#f87171'; ctx.font = '11px Inter'; ctx.fillText('√2 ≈ 1.414...', gap, y - 15);
    ctx.fillStyle = '#a0a0b0'; ctx.font = '10px Inter';
    ctx.fillText('ℚ has gaps (√2 is missing)', w / 2, y + 30);
    ctx.fillStyle = '#34d399';
    ctx.fillText('ℝ fills all gaps (completeness axiom)', w / 2, y + 48);
  }

  function drawSupInf(container) {
    const { ctx, w, h } = createCanvas(container, 340, 110);
    const y = 55; ctx.strokeStyle = '#555'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(30, y); ctx.lineTo(310, y); ctx.stroke();
    const pts = [80, 110, 130, 170, 190, 210, 240];
    pts.forEach(x => { ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fillStyle = '#6c63ff'; ctx.fill(); });
    ctx.beginPath(); ctx.arc(60, y, 6, 0, Math.PI * 2); ctx.fillStyle = '#34d399'; ctx.fill();
    ctx.beginPath(); ctx.arc(260, y, 6, 0, Math.PI * 2); ctx.fillStyle = '#f0b832'; ctx.fill();
    ctx.font = '11px Inter'; ctx.textAlign = 'center';
    ctx.fillStyle = '#34d399'; ctx.fillText('inf (GLB)', 60, y + 22);
    ctx.fillStyle = '#f0b832'; ctx.fillText('sup (LUB)', 260, y + 22);
    ctx.fillStyle = '#6c63ff'; ctx.fillText('set S', 160, y - 15);
  }

  function drawArchimedean(container) {
    const { ctx, w, h } = createCanvas(container, 340, 100);
    ctx.strokeStyle = '#555'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(20, 50); ctx.lineTo(320, 50); ctx.stroke();
    for (let n = 1; n <= 8; n++) {
      const x = 20 + n * 35;
      ctx.beginPath(); ctx.arc(x, 50, 4, 0, Math.PI * 2); ctx.fillStyle = '#6c63ff'; ctx.fill();
      ctx.fillStyle = '#a0a0b0'; ctx.font = '10px Inter'; ctx.textAlign = 'center'; ctx.fillText(n + '', x, 70);
    }
    ctx.fillStyle = '#f87171'; ctx.font = '10px Inter'; ctx.textAlign = 'center';
    ctx.fillText('No matter how large x is, some n > x', w / 2, 18);
    ctx.fillStyle = '#34d399'; ctx.fillText('→ 1/n can be made as small as needed', w / 2, 92);
  }

  function drawSequenceConvergence(container) {
    const { ctx, w, h } = createCanvas(container, 340, 180);
    ctx.strokeStyle = '#333'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(30, h - 20); ctx.lineTo(w - 10, h - 20); ctx.stroke();
    const terms = []; for (let n = 1; n <= 14; n++) terms.push(3 + 2 / n + 0.5 * Math.pow(-1, n) / n);
    const L = 3;
    const sx = i => 35 + i * 20, sy = y => h - 20 - (y - 2) * 50;
    const eps = 0.4;
    ctx.fillStyle = 'rgba(240,184,50,0.08)';
    ctx.fillRect(30, sy(L + eps), w - 40, sy(L - eps) - sy(L + eps));
    ctx.setLineDash([4, 3]); ctx.strokeStyle = '#f0b832';
    ctx.beginPath(); ctx.moveTo(30, sy(L)); ctx.lineTo(w - 10, sy(L)); ctx.stroke();
    ctx.setLineDash([]);
    terms.forEach((v, i) => {
      ctx.beginPath(); ctx.arc(sx(i), sy(v), 3.5, 0, Math.PI * 2);
      ctx.fillStyle = Math.abs(v - L) < eps ? '#34d399' : '#f87171'; ctx.fill();
    });
    ctx.fillStyle = '#f0b832'; ctx.font = '10px Inter'; ctx.textAlign = 'right';
    ctx.fillText('L', 25, sy(L) + 4);
    ctx.fillText('ε-band', w - 12, sy(L + eps) - 3);
    ctx.fillStyle = '#a0a0b0'; ctx.textAlign = 'center';
    ctx.fillText('After N, all terms (green) stay within ε of L', w / 2, 14);
  }

  function drawGroupDemo(container) {
    const { ctx, w, h } = createCanvas(container, 300, 180);
    ctx.fillStyle = '#f0b832'; ctx.font = '11px Inter'; ctx.textAlign = 'center';
    ctx.fillText('Group: (ℤ₄, +)', w / 2, 20);
    const elts = ['0', '1', '2', '3'];
    const table = [
      [0, 1, 2, 3], [1, 2, 3, 0], [2, 3, 0, 1], [3, 0, 1, 2]
    ];
    const ox = 80, oy = 35, cs = 35;
    ctx.strokeStyle = '#444'; ctx.lineWidth = 1;
    ctx.fillStyle = '#6c63ff'; ctx.font = 'bold 11px JetBrains Mono';
    ctx.fillText('+', ox - 8, oy + 12);
    elts.forEach((e, i) => {
      ctx.fillStyle = '#f0b832'; ctx.fillText(e, ox + cs / 2 + i * cs, oy + 12);
      ctx.fillText(e, ox - 8, oy + cs + 12 + i * cs);
    });
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
      const x = ox + c * cs, y = oy + cs + r * cs;
      ctx.strokeStyle = '#333'; ctx.strokeRect(x, y, cs, cs);
      ctx.fillStyle = table[r][c] === 0 ? '#34d399' : '#e0e0e0';
      ctx.font = '11px JetBrains Mono'; ctx.fillText(table[r][c] + '', x + cs / 2, y + cs / 2 + 4);
    }
  }

  function drawLagrangeTheorem(container) {
    const { ctx, w, h } = createCanvas(container, 340, 140);
    const cx = w / 2, cy = 75, r = 50;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(108,99,255,0.1)'; ctx.fill();
    ctx.strokeStyle = '#6c63ff'; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx - 10, cy + 5, 20, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(240,184,50,0.2)'; ctx.fill();
    ctx.strokeStyle = '#f0b832'; ctx.lineWidth = 2; ctx.stroke();
    ctx.font = '12px Inter'; ctx.textAlign = 'center';
    ctx.fillStyle = '#6c63ff'; ctx.fillText('G (|G| = 12)', cx, cy - r - 8);
    ctx.fillStyle = '#f0b832'; ctx.fillText('H', cx - 10, cy + 10);
    ctx.fillStyle = '#a0a0b0'; ctx.font = '10px Inter';
    ctx.fillText('|H| must divide |G|: so |H| ∈ {1,2,3,4,6,12}', w / 2, h - 8);
  }

  function drawProbabilityAxioms(container) {
    const { ctx, w, h } = createCanvas(container, 340, 160);
    ctx.font = '12px JetBrains Mono'; ctx.textAlign = 'left';
    const axioms = [
      { text: '1. P(E) ≥ 0  (non-negative)', color: '#6c63ff' },
      { text: '2. P(Ω) = 1  (certainty)', color: '#f0b832' },
      { text: '3. P(A∪B) = P(A)+P(B)  if disjoint', color: '#34d399' },
    ];
    axioms.forEach((a, i) => {
      ctx.fillStyle = a.color; ctx.fillText(a.text, 30, 30 + i * 35);
    });
    ctx.fillStyle = '#a78bfa'; ctx.font = '11px Inter'; ctx.textAlign = 'center';
    ctx.fillText('Everything in probability follows from these 3 rules', w / 2, h - 15);
  }

  function drawCLT(container) {
    const { ctx, w, h } = createCanvas(container, 340, 170);
    ctx.strokeStyle = '#333'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(30, h - 25); ctx.lineTo(w - 10, h - 25); ctx.stroke();
    const sx = x => 30 + (x + 4) * 35, sy = y => h - 25 - y * 600;
    ctx.strokeStyle = '#6c63ff'; ctx.lineWidth = 2; ctx.beginPath();
    for (let x = -3.5; x <= 3.5; x += 0.05) {
      const y = Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI);
      const px = sx(x), py = sy(y);
      if (x === -3.5) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.fillStyle = 'rgba(108,99,255,0.15)'; ctx.beginPath(); ctx.moveTo(sx(-3.5), sy(0));
    for (let x = -3.5; x <= 3.5; x += 0.05) { const y = Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI); ctx.lineTo(sx(x), sy(y)); }
    ctx.lineTo(sx(3.5), sy(0)); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#f0b832'; ctx.font = '12px Inter'; ctx.textAlign = 'center';
    ctx.fillText('Sum of many random variables → Normal', w / 2, 15);
    ctx.fillStyle = '#a0a0b0'; ctx.font = '10px Inter';
    ctx.fillText('This is why the bell curve appears everywhere', w / 2, h - 5);
  }

  function drawEigenvalues(container) {
    const { ctx, w, h } = createCanvas(container, 300, 200);
    const cx = w / 2, cy = h / 2;
    ctx.strokeStyle = '#333'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(20, cy); ctx.lineTo(w - 20, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, 20); ctx.lineTo(cx, h - 20); ctx.stroke();
    const drawArrow = (x, y, color, label) => {
      ctx.strokeStyle = color; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + x, cy - y); ctx.stroke();
      ctx.beginPath();
      const len = Math.sqrt(x * x + y * y); const nx = x / len, ny = -y / len;
      ctx.moveTo(cx + x, cy - y);
      ctx.lineTo(cx + x - 8 * nx - 4 * ny, cy - y + 8 * ny - 4 * nx);
      ctx.lineTo(cx + x - 8 * nx + 4 * ny, cy - y + 8 * ny + 4 * nx);
      ctx.fillStyle = color; ctx.fill();
      ctx.fillStyle = color; ctx.font = '11px Inter'; ctx.textAlign = 'left';
      ctx.fillText(label, cx + x + 5, cy - y);
    };
    drawArrow(50, 30, '#6c63ff', 'v');
    drawArrow(100, 60, '#f0b832', 'Av = λv');
    ctx.fillStyle = '#a0a0b0'; ctx.font = '10px Inter'; ctx.textAlign = 'center';
    ctx.fillText('Eigenvector: only stretched, not rotated', w / 2, h - 8);
  }

  // ============================================================
  //  PANEL INJECTION SYSTEM
  // ============================================================

  function cleanTitle(el) {
    return el.textContent.replace(/\s+/g, ' ').trim();
  }

  function findEnrichment(title) {
    if (E[title]) return E[title];
    for (const key of Object.keys(E)) {
      if (title.includes(key) || key.includes(title)) return E[key];
    }
    const cleaned = title.replace(/^(Theorem:|Definition:|Proof|Example:|Exemplar.*?:)\s*/i, '').trim();
    if (E[cleaned]) return E[cleaned];
    for (const key of Object.keys(E)) {
      if (cleaned.includes(key) || key.includes(cleaned)) return E[key];
    }
    return null;
  }

  function injectEnrichments() {
    const boxes = document.querySelectorAll('.theorem-box, .definition-box');
    boxes.forEach(box => {
      const titleEl = box.querySelector('.box-title');
      if (!titleEl) return;
      const title = cleanTitle(titleEl);
      const data = findEnrichment(title);
      if (!data) return;

      const toolbar = document.createElement('div');
      toolbar.className = 'enrich-toolbar';

      const vizBtn = document.createElement('button');
      vizBtn.className = 'enrich-btn enrich-btn-viz';
      vizBtn.innerHTML = '<span class="enrich-icon">◈</span> Explore';
      vizBtn.setAttribute('aria-label', 'Show visual explanation');

      const histBtn = document.createElement('button');
      histBtn.className = 'enrich-btn enrich-btn-hist';
      histBtn.innerHTML = '<span class="enrich-icon">⟳</span> History';
      histBtn.setAttribute('aria-label', 'Show historical context');

      toolbar.appendChild(vizBtn);
      toolbar.appendChild(histBtn);

      const vizPanel = document.createElement('div');
      vizPanel.className = 'enrich-panel enrich-panel-viz';
      vizPanel.innerHTML = `
        <div class="enrich-section">
          <div class="enrich-label">What is this?</div>
          <p>${data.what}</p>
        </div>
        <div class="enrich-section">
          <div class="enrich-label">Why does it matter?</div>
          <p>${data.usage}</p>
        </div>
        ${data.visual ? '<div class="enrich-section"><div class="enrich-label">Visual</div><div class="enrich-visual"></div></div>' : ''}
      `;

      const histPanel = document.createElement('div');
      histPanel.className = 'enrich-panel enrich-panel-hist';
      histPanel.innerHTML = `
        <div class="enrich-section">
          <div class="enrich-label">Historical Context</div>
          <p>${data.history}</p>
        </div>
      `;

      box.appendChild(toolbar);
      box.appendChild(vizPanel);
      box.appendChild(histPanel);

      let vizDrawn = false;

      vizBtn.addEventListener('click', () => {
        const isOpen = vizPanel.classList.contains('open');
        vizPanel.classList.toggle('open');
        histPanel.classList.remove('open');
        vizBtn.classList.toggle('active');
        histBtn.classList.remove('active');
        if (!isOpen && data.visual && !vizDrawn) {
          const target = vizPanel.querySelector('.enrich-visual');
          if (target) { data.visual(target); vizDrawn = true; }
        }
      });

      histBtn.addEventListener('click', () => {
        histPanel.classList.toggle('open');
        vizPanel.classList.remove('open');
        histBtn.classList.toggle('active');
        vizBtn.classList.remove('active');
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(injectEnrichments, 200));
  } else {
    setTimeout(injectEnrichments, 200);
  }
})();
