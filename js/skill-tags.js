(function () {
  'use strict';

  // ============================================================
  //  SKILL TAGS — Shows "What you practiced" after viewing a solution
  //  Maps every problem number → skill/concept tested
  // ============================================================

  const S = {
    // ── 1.1 Number Systems ──
    '1.1.1': { skill: 'Number Classification', topic: 'Identifying which number sets (ℕ, ℤ, ℚ, ℝ, ℂ) a given number belongs to' },
    '1.1.2': { skill: 'Proof by Contradiction', topic: 'Using contradiction to prove a number is irrational — a foundational proof technique' },
    '1.1.3': { skill: 'Set → Interval Conversion', topic: 'Converting set-builder notation to interval notation by solving inequalities' },
    '1.1.4': { skill: 'Complex Arithmetic', topic: 'Adding and multiplying complex numbers using i² = −1 and distributing' },
    '1.1.5': { skill: 'Set Intersection', topic: 'Finding A ∩ B by solving each inequality, then taking the overlap' },

    // ── 1.2 Algebra ──
    '1.2.1': { skill: 'Repeated Factoring', topic: 'Applying difference of squares multiple times: a⁴ − b⁴ = (a² − b²)(a² + b²)' },
    '1.2.2': { skill: 'Simplifying Rational Expressions', topic: 'Factoring numerator and denominator, then canceling common factors' },
    '1.2.3': { skill: 'Logarithmic Equations', topic: 'Using log product rule to combine logs, then converting to exponential form to solve' },
    '1.2.4': { skill: 'Binomial Theorem', topic: 'Expanding (a + b)ⁿ using binomial coefficients C(n,k)' },
    '1.2.5': { skill: 'Mathematical Induction', topic: 'The two-step proof technique: base case + inductive step. Essential for discrete math.' },
    '1.2.6': { skill: 'Exponent Laws', topic: 'Simplifying expressions using aᵐ · aⁿ = aᵐ⁺ⁿ and related rules' },
    '1.2.7': { skill: 'Rational Equations', topic: 'Solving equations with fractions by finding common denominators and checking for extraneous solutions' },

    // ── 1.3 Functions ──
    '1.3.1': { skill: 'Domain & Range', topic: 'Finding the set of valid inputs (domain) and possible outputs (range) of a function' },
    '1.3.2': { skill: 'Function Composition', topic: 'Computing (f ∘ g)(x) = f(g(x)) and finding the domain of the composition' },
    '1.3.3': { skill: 'Inverse Functions', topic: 'Finding f⁻¹ by swapping x and y and solving — verifying with f(f⁻¹(x)) = x' },
    '1.3.4': { skill: 'Even/Odd Symmetry', topic: 'Testing f(−x) = f(x) (even) or f(−x) = −f(x) (odd) or neither' },
    '1.3.5': { skill: 'Function Transformations', topic: 'Applying shifts, reflections, and stretches: understanding how a·f(b(x−h))+k transforms the graph' },

    // ── 1.4 Trigonometry ──
    '1.4.1': { skill: 'Unit Circle Values', topic: 'Evaluating trig functions at standard angles using memorized unit circle coordinates' },
    '1.4.2': { skill: 'Trig Equation Solving', topic: 'Finding all solutions by using inverse trig + periodicity (adding 2πn)' },
    '1.4.3': { skill: 'Trig Identity Proof', topic: 'Transforming one side of an identity to match the other using Pythagorean and reciprocal identities' },
    '1.4.4': { skill: 'Reference Angles', topic: 'Using reference angles and ASTC signs to evaluate trig in any quadrant' },
    '1.4.5': { skill: 'Sum/Difference Formulas', topic: 'Applying sin(α ± β) and cos(α ± β) formulas to compute exact values' },
    '1.4.6': { skill: 'Inverse Trig Functions', topic: 'Evaluating compositions like sin(arccos(x)) by drawing a reference triangle' },
    '1.4.7': { skill: 'Sinusoidal Modeling', topic: 'Finding amplitude, period, phase shift, and vertical shift from a sinusoidal equation' },

    // ── 2.1 Limits ──
    '2.1.1': { skill: 'Limit by Factoring', topic: 'Canceling the common factor that causes 0/0, then direct substitution' },
    '2.1.2': { skill: 'Special Limit: sin(x)/x', topic: 'Recognizing and applying the fundamental limit lim sin(x)/x = 1' },
    '2.1.3': { skill: 'Algebraic Simplification for Limits', topic: 'Factoring to remove a removable discontinuity before evaluating' },
    '2.1.4': { skill: 'Conjugate Technique', topic: 'Multiplying by the conjugate to rationalize a square root in a limit' },
    '2.1.5': { skill: 'Limits at Infinity', topic: 'Dividing by the highest power of x to find horizontal asymptote behavior' },
    '2.1.6': { skill: 'One-Sided Limits', topic: 'Evaluating limits from the left and right separately to detect jumps or asymptotes' },
    '2.1.7': { skill: 'Squeeze Theorem', topic: 'Bounding a function between two others with known limits to determine its limit' },
    '2.1.8': { skill: 'Limit with Absolute Value', topic: 'Splitting |f(x)| into cases based on the sign of f(x) near the limit point' },

    // ── 2.2 Epsilon-Delta ──
    '2.2.1': { skill: 'ε-δ Proof (Linear)', topic: 'Writing a formal ε-δ limit proof for a linear function — the foundational exercise' },
    '2.2.2': { skill: 'ε-δ Proof (Quadratic)', topic: 'Bounding |x² − a²| using δ to control both |x − a| and |x + a| — a more advanced ε-δ proof' },

    // ── 2.3 Continuity ──
    '2.3.1': { skill: 'Continuity of Rational Functions', topic: 'Identifying where the denominator is zero to find points of discontinuity' },
    '2.3.2': { skill: 'Piecewise Continuity', topic: 'Matching one-sided limits at the boundary to find the parameter that makes pieces connect' },
    '2.3.3': { skill: 'Intermediate Value Theorem', topic: 'Using IVT to prove a root exists: show f changes sign on [a,b] with f continuous' },
    '2.3.4': { skill: 'Classifying Discontinuities', topic: 'Determining whether a discontinuity is removable, jump, or infinite' },
    '2.3.5': { skill: 'Piecewise Continuity (2 Parameters)', topic: 'Setting up a system of equations from two transition points to find parameters a and b' },
    '2.3.6': { skill: 'Removable Discontinuity', topic: 'Finding k to "fill the hole" — setting k equal to the limit at the point' },
    '2.3.7': { skill: 'Rigorous Continuity Proof', topic: 'Using the ε-δ definition to formally prove continuity at a specific point' },

    // ── 3.1 Derivative Definition ──
    '3.1.1': { skill: 'Derivative from Definition (Linear)', topic: 'Computing f\'(x) using lim [f(x+h)−f(x)]/h for a linear function' },
    '3.1.2': { skill: 'Derivative from Definition (1/x)', topic: 'Using the limit definition with algebraic manipulation for f(x) = 1/x' },
    '3.1.3': { skill: 'Derivative from Definition (√x)', topic: 'Applying the conjugate trick in the limit definition — a key algebraic technique' },
    '3.1.4': { skill: 'Recognizing Derivative as Limit', topic: 'Identifying that a given limit expression is actually a derivative in disguise' },

    // ── 3.2 Differentiation Rules ──
    '3.2.1': { skill: 'Power Rule', topic: 'Applying d/dx[xⁿ] = nxⁿ⁻¹' },
    '3.2.2': { skill: 'Power Rule', topic: 'Differentiating polynomials term by term' },
    '3.2.3': { skill: 'Chain Rule', topic: 'Differentiating composite functions: d/dx[f(g(x))] = f\'(g(x))·g\'(x)' },
    '3.2.4': { skill: 'Product Rule', topic: 'Applying (fg)\' = f\'g + fg\' for products of functions' },
    '3.2.5': { skill: 'Quotient Rule', topic: 'Applying (f/g)\' = (f\'g − fg\')/g² for ratios of functions' },
    '3.2.6': { skill: 'Chain Rule + Trig', topic: 'Combining the chain rule with trigonometric derivatives' },
    '3.2.7': { skill: 'Exponential Derivative', topic: 'Using d/dx[eᵘ] = eᵘ · u\' (chain rule with exponentials)' },
    '3.2.8': { skill: 'Logarithmic Derivative', topic: 'Using d/dx[ln u] = u\'/u' },
    '3.2.9': { skill: 'Implicit Differentiation', topic: 'Differentiating both sides of an equation treating y as a function of x, then solving for dy/dx' },
    '3.2.10': { skill: 'Implicit Differentiation', topic: 'Finding the slope of a curve defined implicitly (not as y = f(x))' },
    '3.2.11': { skill: 'Higher-Order Derivatives', topic: 'Computing f\'\' by differentiating f\' — useful for concavity and acceleration' },
    '3.2.12': { skill: 'Inverse Trig Derivatives', topic: 'Using d/dx[arctan(x)] = 1/(1+x²) and similar formulas' },
    '3.2.13': { skill: 'Logarithmic Differentiation', topic: 'Taking ln of both sides to handle products, quotients, or variable exponents' },
    '3.2.14': { skill: 'Implicit + Second Derivative', topic: 'Finding d²y/dx² via implicit differentiation — substituting dy/dx back in' },
    '3.2.15': { skill: 'Conceptual: Differentiability', topic: 'Understanding when a function fails to be differentiable (corners, cusps, vertical tangents)' },
    '3.2.16': { skill: 'Conceptual: Derivative Graphs', topic: 'Reading the derivative from a graph of f: where f\' is positive, negative, or zero' },
    '3.2.17': { skill: 'Conceptual: Tangent Line', topic: 'Understanding the tangent line as the best linear approximation at a point' },
    '3.2.18': { skill: 'AP: Related Derivatives', topic: 'Multi-step differentiation combining several rules in one problem' },
    '3.2.19': { skill: 'AP: Derivative Application', topic: 'Applying derivatives to real-world rate-of-change interpretation' },
    '3.2.20': { skill: 'AP: Implicit + Tangent Line', topic: 'Finding the equation of a tangent line to an implicitly defined curve' },

    // ── 3.3 Applications ──
    '3.3.1': { skill: 'L\'Hôpital\'s Rule', topic: 'Applying L\'Hôpital\'s Rule to evaluate 0/0 or ∞/∞ indeterminate limits' },
    '3.3.2': { skill: 'Absolute Extrema (Closed Interval)', topic: 'Finding absolute max/min: evaluate f at all critical points AND endpoints' },
    '3.3.3': { skill: 'Related Rates', topic: 'Setting up a geometric relationship, differentiating with respect to time, and solving for the unknown rate' },
    '3.3.4': { skill: 'L\'Hôpital\'s + Exp Rewrite', topic: 'Rewriting indeterminate forms (0⁰, 1^∞, ∞⁰) as e^(limit) to apply L\'Hôpital\'s' },
    '3.3.5': { skill: 'First/Second Derivative Test', topic: 'Using f\' and f\'\' to classify critical points as local max, min, or neither' },
    '3.3.6': { skill: 'AP: Curve Sketching', topic: 'Combining information from f, f\', f\'\' to sketch a complete graph' },
    '3.3.7': { skill: 'Optimization', topic: 'Setting up an objective function, using a constraint to reduce to one variable, then optimizing' },
    '3.3.8': { skill: 'AP: Mean Value Theorem', topic: 'Finding the c guaranteed by MVT where f\'(c) = [f(b)−f(a)]/(b−a)' },

    // ── 4.1 Antiderivatives ──
    '4.1.1': { skill: 'Basic Antiderivatives', topic: 'Applying the power rule for integration: ∫xⁿdx = xⁿ⁺¹/(n+1) + C' },
    '4.1.2': { skill: 'Trig Antiderivatives', topic: 'Recalling the antiderivatives of sin, cos, sec², and other trig functions' },
    '4.1.3': { skill: 'u-Substitution', topic: 'Identifying the inner function u and its derivative du to simplify the integral' },

    // ── 4.2 FTC ──
    '4.2.1': { skill: 'FTC Part 2 (Evaluation)', topic: 'Evaluating ∫ₐᵇ f(x)dx = F(b) − F(a) using an antiderivative' },
    '4.2.2': { skill: 'FTC Part 1 (Derivative of Integral)', topic: 'Applying d/dx[∫ₐˣ f(t)dt] = f(x), possibly with chain rule for variable bounds' },
    '4.2.3': { skill: 'Net vs Total Area', topic: 'Understanding that ∫ gives signed area; total area requires ∫|f|' },
    '4.2.4': { skill: 'FTC with Chain Rule', topic: 'Using d/dx[∫ₐ^(g(x)) f(t)dt] = f(g(x))·g\'(x)' },
    '4.2.5': { skill: 'Accumulation Functions', topic: 'Analyzing properties of F(x) = ∫ₐˣ f(t)dt using the graph of f' },

    // ── 4.3 Techniques ──
    '4.3.1': { skill: 'u-Substitution', topic: 'Basic substitution for a composite function' },
    '4.3.2': { skill: 'u-Substitution (Trig)', topic: 'Substituting within trigonometric integrals' },
    '4.3.3': { skill: 'Integration by Parts', topic: 'Choosing u and dv wisely using LIATE, then applying ∫u dv = uv − ∫v du' },
    '4.3.4': { skill: 'IBP (Special Case)', topic: 'Integration by parts where the integral cycles back, solving algebraically' },
    '4.3.5': { skill: 'Partial Fractions (Distinct)', topic: 'Decomposing P(x)/Q(x) into A/(x−r₁) + B/(x−r₂) for distinct linear factors' },
    '4.3.6': { skill: 'Partial Fractions (Repeated)', topic: 'Handling repeated factors: A/(x−r) + B/(x−r)²' },
    '4.3.7': { skill: 'Trig Substitution', topic: 'Using x = a sin θ, a tan θ, or a sec θ to eliminate square roots' },
    '4.3.8': { skill: 'Trig Powers', topic: 'Integrating sinⁿ(x)cosᵐ(x) using reduction or half-angle identities' },
    '4.3.9': { skill: 'Completing the Square + Integral', topic: 'Rewriting the denominator as (x−h)² + k² to use arctan substitution' },
    '4.3.10': { skill: 'Long Division + Integration', topic: 'Dividing first when degree(numerator) ≥ degree(denominator), then integrating the pieces' },
    '4.3.11': { skill: 'Definite Integral Substitution', topic: 'Changing limits of integration when doing u-substitution in a definite integral' },
    '4.3.12': { skill: 'Tabular Integration', topic: 'Using the tabular/DI method for repeated IBP — efficient for polynomials times exp/trig' },
    '4.3.13': { skill: 'Conceptual: Which Technique?', topic: 'Recognizing which integration technique to apply based on the integrand\'s structure' },
    '4.3.14': { skill: 'Conceptual: Integration Strategy', topic: 'Building intuition for the decision tree: try simplification → u-sub → IBP → partial fractions → trig sub' },
    '4.3.15': { skill: 'AP: Multi-Step Integration', topic: 'Combining multiple techniques (substitution + IBP, or trig identity + substitution) in one problem' },

    // ── 5.1 Series ──
    '5.1.1': { skill: 'Geometric Series', topic: 'Identifying and summing a geometric series using S = a/(1−r) for |r| < 1' },
    '5.1.2': { skill: 'Divergence Test', topic: 'If lim aₙ ≠ 0, the series diverges (necessary but not sufficient)' },
    '5.1.3': { skill: 'Comparison Test', topic: 'Comparing to a known series (p-series, geometric) to determine convergence' },
    '5.1.4': { skill: 'Telescoping Series', topic: 'Writing partial sums where most terms cancel, leaving only a few boundary terms' },
    '5.1.5': { skill: 'Ratio Test', topic: 'Computing lim |aₙ₊₁/aₙ| to determine absolute convergence (< 1) or divergence (> 1)' },
    '5.1.6': { skill: 'Integral Test', topic: 'Relating ∑f(n) to ∫f(x)dx when f is positive, continuous, and decreasing' },
    '5.1.7': { skill: 'Alternating Series + Error Bound', topic: 'Applying the Alternating Series Test and bounding the error by the first omitted term' },
    '5.1.8': { skill: 'AP: Series Reasoning', topic: 'Using multiple convergence tests and reasoning about series behavior' },
    '5.1.9': { skill: 'AP: Convergence at Endpoints', topic: 'Testing convergence at endpoints of a power series by plugging in and testing' },

    // ── 5.2 Taylor ──
    '5.2.1': { skill: 'Maclaurin Series from Definition', topic: 'Computing f(0), f\'(0), f\'\'(0), ... to build the series term by term' },
    '5.2.2': { skill: 'Taylor Series Manipulation', topic: 'Deriving new series by substituting, differentiating, or integrating known series' },
    '5.2.3': { skill: 'Lagrange Error Bound', topic: 'Bounding |f(x) − Tₙ(x)| using the (n+1)-th derivative bound' },
    '5.2.4': { skill: 'Known Series Recognition', topic: 'Recognizing eˣ, sin x, cos x, 1/(1−x) series and using them as building blocks' },
    '5.2.5': { skill: 'Series for Integration', topic: 'Integrating a Taylor series term by term when the antiderivative has no closed form' },
    '5.2.6': { skill: 'Radius of Convergence', topic: 'Using the Ratio Test on the series coefficients to find R, then testing endpoints' },
    '5.2.7': { skill: 'AP: Taylor Polynomial Approximation', topic: 'Using a Taylor polynomial to approximate a function value near the center' },
    '5.2.8': { skill: 'AP: Series with Error', topic: 'Combining Taylor series construction with error bound analysis' },

    // ── 6.1 Parametric ──
    '6.1.1': { skill: 'Parametric → Cartesian', topic: 'Eliminating the parameter t to get a relation between x and y' },
    '6.1.2': { skill: 'Parametric Derivatives', topic: 'Computing dy/dx = (dy/dt)/(dx/dt) for parametric curves' },
    '6.1.3': { skill: 'Parametric Arc Length', topic: 'Using L = ∫√((dx/dt)² + (dy/dt)²) dt' },
    '6.1.4': { skill: 'Parametric Second Derivative', topic: 'Finding d²y/dx² = d/dt[dy/dx] / (dx/dt) for concavity of parametric curves' },
    '6.1.5': { skill: 'Parametric Area', topic: 'Computing the area under a parametric curve using ∫y(dx/dt)dt' },

    // ── 6.2 Polar ──
    '6.2.1': { skill: 'Polar Area', topic: 'Using A = ½∫r² dθ to find the area enclosed by a polar curve' },
    '6.2.2': { skill: 'Polar → Cartesian', topic: 'Converting between (r, θ) and (x, y) using x = r cos θ, y = r sin θ' },
    '6.2.3': { skill: 'Polar Tangent Lines', topic: 'Finding dy/dx for polar curves and locating horizontal/vertical tangent lines' },

    // ── 7 Multivariable ──
    '7.1.1': { skill: 'Partial Derivatives', topic: 'Differentiating with respect to one variable while holding others constant' },
    '7.1.2': { skill: 'Gradient Vector', topic: 'Computing ∇f = (∂f/∂x, ∂f/∂y) and interpreting its direction and magnitude' },
    '7.1.3': { skill: 'Chain Rule (Multivariable)', topic: 'Applying the multi-variable chain rule: dz/dt = (∂z/∂x)(dx/dt) + (∂z/∂y)(dy/dt)' },
    '7.1.4': { skill: 'Lagrange Multipliers', topic: 'Solving ∇f = λ∇g with the constraint g = 0 to optimize with constraints' },
    '7.2.1': { skill: 'Double Integral (Rectangular)', topic: 'Evaluating ∬f dA by iterated integration over a rectangular region' },
    '7.2.2': { skill: 'Double Integral (Polar)', topic: 'Converting to polar coordinates with dA = r dr dθ for circular regions' },
    '7.2.3': { skill: 'Change of Integration Order', topic: 'Reversing the order of integration by re-describing the region' },
    '7.3.1': { skill: 'Line Integrals', topic: 'Evaluating ∫_C F · dr by parametrizing the curve' },
    '7.3.2': { skill: 'Green\'s Theorem', topic: 'Converting a line integral to a double integral (or vice versa) using Green\'s Theorem' },
    '7.3.3': { skill: 'Divergence Theorem', topic: 'Relating surface flux to volume integral of divergence' },

    // ── 8 Linear Algebra ──
    '8.1.1': { skill: 'Row Reduction (RREF)', topic: 'Using Gaussian elimination to solve a system of linear equations' },
    '8.1.2': { skill: 'Matrix Inverse', topic: 'Finding A⁻¹ using the augmented matrix method [A|I] → [I|A⁻¹]' },
    '8.1.3': { skill: 'Determinant (3×3)', topic: 'Computing det(A) by cofactor expansion or the rule of Sarrus' },
    '8.2.1': { skill: 'Linear Independence', topic: 'Determining if vectors are linearly independent by checking if the only solution to c₁v₁+...=0 is trivial' },
    '8.2.2': { skill: 'Basis & Dimension', topic: 'Finding a basis for a subspace and determining its dimension' },
    '8.3.1': { skill: 'Eigenvalues', topic: 'Solving det(A − λI) = 0 to find eigenvalues' },
    '8.3.2': { skill: 'Diagonalization', topic: 'Finding P and D such that A = PDP⁻¹, where D is diagonal' },
    '8.3.3': { skill: 'Eigenvectors', topic: 'Solving (A − λI)v = 0 to find eigenvectors for each eigenvalue' },

    // ── 9 Diff Eq ──
    '9.1.1': { skill: 'Separable ODE', topic: 'Separating variables: ∫(1/g(y))dy = ∫f(x)dx, then integrating both sides' },
    '9.1.2': { skill: 'Linear First-Order ODE', topic: 'Using the integrating factor μ = e^(∫P dx) to solve y\' + Py = Q' },
    '9.1.3': { skill: 'Initial Value Problem', topic: 'Solving the ODE generally, then using the initial condition to find the particular constant' },
    '9.1.4': { skill: 'Exact Equations', topic: 'Recognizing M dx + N dy = 0 as exact when ∂M/∂y = ∂N/∂x, then finding the potential function' },
    '9.1.5': { skill: 'Modeling with ODEs', topic: 'Translating a word problem (mixing, population, decay) into a differential equation' },
    '9.2.1': { skill: 'Characteristic Equation', topic: 'Solving ay\'\' + by\' + cy = 0 via the auxiliary equation ar² + br + c = 0' },
    '9.2.2': { skill: 'Undetermined Coefficients', topic: 'Guessing the form of a particular solution yₚ based on the right-hand side g(x)' },
    '9.2.3': { skill: 'Complex Roots', topic: 'Handling complex characteristic roots α ± βi → eᵅˣ(C₁cos βx + C₂sin βx)' },
    '9.2.4': { skill: 'Variation of Parameters', topic: 'Finding a particular solution when undetermined coefficients fails' },
    '9.2.5': { skill: 'Spring-Mass Systems', topic: 'Modeling mechanical vibrations: mx\'\' + cx\' + kx = F(t)' },

    // ── 10 Real Analysis ──
    '10.1.1': { skill: 'Supremum/Infimum', topic: 'Finding the least upper bound and greatest lower bound of a set' },
    '10.1.2': { skill: 'Archimedean Property Application', topic: 'Using "for any ε > 0, ∃n with 1/n < ε" in proofs' },
    '10.1.3': { skill: 'Density of ℚ in ℝ', topic: 'Proving there exists a rational between any two reals' },
    '10.1.4': { skill: 'Completeness Proofs', topic: 'Using the Completeness Axiom (every bounded-above set has a sup) to prove existence results' },
    '10.2.1': { skill: 'ε-N Convergence Proof', topic: 'Proving a sequence converges using the formal ∀ε>0, ∃N definition' },
    '10.2.2': { skill: 'Monotone Convergence', topic: 'Showing a sequence is monotone and bounded, then finding its limit from the recursion' },
    '10.2.3': { skill: 'Cauchy Sequence Proof', topic: 'Proving a sequence is Cauchy to establish convergence without knowing the limit' },

    // ── 11 Abstract Algebra ──
    '11.1.1': { skill: 'Verifying Group Axioms', topic: 'Checking closure, associativity, identity, and inverses for a set with an operation' },
    '11.1.2': { skill: 'Subgroup Test', topic: 'Using the two-step subgroup test: closed under the operation and under inverses' },
    '11.1.3': { skill: 'Cayley Table', topic: 'Constructing the multiplication table for a group and reading off its structure' },
    '11.1.4': { skill: 'Group Order', topic: 'Finding the order of an element (smallest n with aⁿ = e) and its relationship to group order' },
    '11.1.5': { skill: 'Cosets & Lagrange', topic: 'Computing cosets of a subgroup and applying Lagrange\'s Theorem to restrict possible subgroup orders' },
    '11.1.6': { skill: 'Isomorphisms', topic: 'Showing two groups are "the same" by constructing a bijection that preserves the operation' },
    '11.1.7': { skill: 'Quotient Groups', topic: 'Forming G/N for a normal subgroup N and understanding the resulting group structure' },

    // ── 12 Probability ──
    '12.1.1': { skill: 'Counting & Basic Probability', topic: 'Using P(E) = favorable/total and fundamental counting principles' },
    '12.1.2': { skill: 'Conditional Probability', topic: 'Computing P(A|B) = P(A∩B)/P(B) — probability given new information' },
    '12.1.3': { skill: 'Bayes\' Theorem', topic: 'Reversing conditional probabilities: P(A|B) = P(B|A)P(A)/P(B)' },
    '12.2.1': { skill: 'Expected Value', topic: 'Computing E[X] = Σ xᵢP(xᵢ) for discrete random variables' },
    '12.2.2': { skill: 'Binomial Probability', topic: 'Using P(X=k) = C(n,k)pᵏ(1−p)ⁿ⁻ᵏ for counting successes in n trials' },
    '12.2.3': { skill: 'Variance & Standard Deviation', topic: 'Computing Var(X) = E[X²] − (E[X])² and σ = √Var' },
    '12.2.4': { skill: 'Normal Distribution', topic: 'Using z-scores: z = (x−μ)/σ and the standard normal table/calculator' },
    '12.2.5': { skill: 'Central Limit Theorem', topic: 'Applying CLT: sample means ~ Normal(μ, σ/√n) for large n' },

    // ── 13 Math Tools ──
    '13.1.1': { skill: 'Calculator: Numerical Evaluation', topic: 'Using your TI-84 to evaluate expressions, store values, and check work' },
    '13.1.2': { skill: 'Calculator: Graphing', topic: 'Graphing functions, finding intersections, and adjusting the viewing window' },
    '13.1.3': { skill: 'Calculator: AP Strategy', topic: 'Knowing when and how to use the calculator efficiently on timed AP problems' },
    '13.2.1': { skill: 'Desmos: Basic Graphing', topic: 'Plotting functions, adding sliders, and exploring behavior interactively' },
    '13.2.2': { skill: 'Desmos: Advanced Features', topic: 'Using tables, regression, derivatives, integrals, and parametric plots in Desmos' },
    '13.2.3': { skill: 'Desmos: Exploration', topic: 'Using Desmos to investigate conjectures and build mathematical intuition' },
    '13.3.1': { skill: 'Wolfram Alpha: Queries', topic: 'Writing natural-language math queries to compute, simplify, or graph' },
    '13.3.2': { skill: 'Wolfram Alpha: Step-by-Step', topic: 'Using Wolfram Alpha to understand solution methods, not just answers' },
    '13.4.1': { skill: 'Mental Math', topic: 'Quick estimation and mental arithmetic techniques' },
    '13.4.2': { skill: 'Estimation & Reasonableness', topic: 'Checking answers with order-of-magnitude estimates and sanity checks' },
  };

  // ── Injection: add skill tags to solutions and MC quizzes ──

  function createTag(data) {
    const tag = document.createElement('div');
    tag.className = 'skill-tag';
    tag.innerHTML =
      '<div class="skill-tag-header">' +
        '<span class="skill-tag-icon">🎯</span>' +
        '<span class="skill-tag-label">Skill Practiced</span>' +
      '</div>' +
      '<div class="skill-tag-name">' + data.skill + '</div>' +
      '<div class="skill-tag-desc">' + data.topic + '</div>';
    return tag;
  }

  function injectSkillTags() {
    document.querySelectorAll('.problem').forEach(problem => {
      const numEl = problem.querySelector('.problem-number');
      if (!numEl) return;
      const num = numEl.textContent.trim();
      const data = S[num];
      if (!data) return;
      const solution = problem.querySelector('.problem-solution');
      if (!solution || solution.querySelector('.skill-tag')) return;
      solution.appendChild(createTag(data));
    });
  }

  function injectMcSkillTags() {
    document.querySelectorAll('.mc-question').forEach(q => {
      if (q.querySelector('.skill-tag')) return;
      const expEl = q.querySelector('.mc-explanation');
      if (!expEl || expEl.style.display === 'none') return;
      if (!q.classList.contains('mc-answered')) return;
      const qText = q.querySelector('.mc-q-text');
      if (!qText) return;
      const text = qText.textContent.toLowerCase();
      let skill = '', topic = '';
      if (text.includes('irrational') || text.includes('number') && text.includes('set')) { skill = 'Number Classification'; topic = 'Identifying number types and their properties'; }
      else if (text.includes('interval')) { skill = 'Interval Notation'; topic = 'Translating between set descriptions and interval notation'; }
      else if (text.includes('factor')) { skill = 'Factoring'; topic = 'Breaking expressions into products of simpler factors'; }
      else if (text.includes('log')) { skill = 'Logarithms'; topic = 'Evaluating and simplifying logarithmic expressions'; }
      else if (text.includes('quadratic') || text.includes('discriminant')) { skill = 'Quadratic Formula'; topic = 'Using the discriminant to determine root type'; }
      else if (text.includes('exponent') || text.includes('simplify')) { skill = 'Exponent Laws'; topic = 'Applying rules for combining and simplifying powers'; }
      else if (text.includes('composition') || text.includes('f ∘ g') || text.includes('f(g')) { skill = 'Function Composition'; topic = 'Computing f(g(x)) by evaluating the inner function first'; }
      else if (text.includes('even') || text.includes('odd') && text.includes('function')) { skill = 'Symmetry'; topic = 'Identifying even/odd functions from their algebraic form'; }
      else if (text.includes('domain')) { skill = 'Domain'; topic = 'Finding valid inputs by identifying restrictions'; }
      else if (text.includes('sin') || text.includes('cos') || text.includes('tan') || text.includes('sec') || text.includes('trig')) { skill = 'Trigonometry'; topic = 'Evaluating trig functions and applying identities'; }
      else if (text.includes('limit') || text.includes('lim')) { skill = 'Limit Evaluation'; topic = 'Computing limits using algebraic techniques or special rules'; }
      else if (text.includes('continuity') || text.includes('continuous')) { skill = 'Continuity'; topic = 'Checking the three conditions for continuity at a point'; }
      else if (text.includes('ivt') || text.includes('intermediate')) { skill = 'Intermediate Value Theorem'; topic = 'Using IVT to guarantee the existence of solutions'; }
      else if (text.includes('epsilon') || text.includes('delta') || text.includes('ε')) { skill = 'ε-δ Definition'; topic = 'The formal definition underlying all of calculus'; }
      else if (text.includes('derivative') || text.includes("f'") || text.includes('d/dx')) { skill = 'Differentiation'; topic = 'Computing derivatives using differentiation rules'; }
      else if (text.includes('product rule')) { skill = 'Product Rule'; topic = '(fg)\' = f\'g + fg\' for products'; }
      else if (text.includes('chain rule')) { skill = 'Chain Rule'; topic = 'Differentiating composite functions'; }
      else if (text.includes('critical') || text.includes('extrema')) { skill = 'Critical Points'; topic = 'Finding and classifying local extrema'; }
      else if (text.includes('mvt') || text.includes('mean value')) { skill = 'Mean Value Theorem'; topic = 'The theoretical backbone connecting derivatives to function values'; }
      else if (text.includes("l'hôpital") || text.includes('hopital') || text.includes('indeterminate')) { skill = 'L\'Hôpital\'s Rule'; topic = 'Evaluating indeterminate limits by differentiating'; }
      else if (text.includes('integral') || text.includes('∫') || text.includes('antiderivative')) { skill = 'Integration'; topic = 'Finding antiderivatives or evaluating definite integrals'; }
      else if (text.includes('ftc') || text.includes('fundamental')) { skill = 'Fundamental Theorem of Calculus'; topic = 'The connection between differentiation and integration'; }
      else if (text.includes('u-sub') || text.includes('substitution')) { skill = 'u-Substitution'; topic = 'The most common integration technique'; }
      else if (text.includes('ibp') || text.includes('parts') || text.includes('liate')) { skill = 'Integration by Parts'; topic = '∫u dv = uv − ∫v du'; }
      else if (text.includes('geometric') || text.includes('series') || text.includes('converge')) { skill = 'Series Convergence'; topic = 'Determining if an infinite sum has a finite value'; }
      else if (text.includes('taylor') || text.includes('maclaurin')) { skill = 'Taylor Series'; topic = 'Representing functions as infinite polynomials'; }
      else if (text.includes('ratio test')) { skill = 'Ratio Test'; topic = 'Using the limit of consecutive term ratios'; }
      else if (text.includes('parametric')) { skill = 'Parametric Curves'; topic = 'Working with curves defined by x(t) and y(t)'; }
      else if (text.includes('polar')) { skill = 'Polar Coordinates'; topic: 'Working in the (r, θ) coordinate system'; }
      else if (text.includes('partial derivative') || text.includes('∂')) { skill = 'Partial Derivatives'; topic = 'Multivariable differentiation'; }
      else if (text.includes('gradient') || text.includes('lagrange') || text.includes('green')) { skill = 'Multivariable Calculus'; topic = 'Vector calculus and multivariable optimization'; }
      else if (text.includes('matrix') || text.includes('det') || text.includes('rank') || text.includes('null')) { skill = 'Linear Algebra'; topic = 'Matrix operations and vector space properties'; }
      else if (text.includes('eigen')) { skill = 'Eigenvalues'; topic = 'Finding eigenvalues and eigenvectors of matrices'; }
      else if (text.includes('ode') || text.includes('differential equation') || text.includes('separable') || text.includes('integrating factor')) { skill = 'Differential Equations'; topic = 'Solving equations involving derivatives'; }
      else if (text.includes('completeness') || text.includes('supremum') || text.includes('cauchy') || text.includes('bolzano')) { skill = 'Real Analysis'; topic = 'Rigorous foundations of calculus'; }
      else if (text.includes('group') || text.includes('abelian') || text.includes('lagrange') && text.includes('subgroup')) { skill = 'Group Theory'; topic = 'Abstract algebraic structures'; }
      else if (text.includes('probability') || text.includes('bayes') || text.includes('binomial') || text.includes('expected') || text.includes('variance')) { skill = 'Probability'; topic = 'Computing probabilities and analyzing distributions'; }
      else { skill = 'Mathematical Reasoning'; topic = 'General problem-solving and mathematical thinking'; }

      if (skill) {
        const tag = createTag({ skill, topic });
        q.appendChild(tag);
      }
    });
  }

  function init() {
    injectSkillTags();
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('show-solution-btn') || e.target.classList.contains('mc-check-btn')) {
        setTimeout(() => { injectSkillTags(); injectMcSkillTags(); }, 100);
      }
    });
    const obs = new MutationObserver(() => { setTimeout(injectSkillTags, 200); });
    const main = document.querySelector('.main-content') || document.body;
    obs.observe(main, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 600));
  } else {
    setTimeout(init, 600);
  }
})();
