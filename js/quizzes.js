(function () {
  'use strict';

  // ============================================================
  //  MULTIPLE CHOICE QUIZ SYSTEM
  //  Instant feedback per question + detailed explanations
  // ============================================================

  const Q = {
    'precalculus': [
      { q: 'Which number is irrational?', o: ['$\\frac{22}{7}$', '$0.\\overline{3}$', '$\\sqrt{2}$', '$-5$'], a: 2,
        why: ['$\\frac{22}{7}$ is a ratio of two integers — that\'s the definition of rational.', '$0.\\overline{3} = \\frac{1}{3}$, a repeating decimal, which is always rational.', '$\\sqrt{2}$ cannot be expressed as any fraction $p/q$. This was proved by the ancient Greeks using contradiction.', '$-5 = \\frac{-5}{1}$ is an integer and therefore rational.'] },
      { q: 'The set of integers $\\mathbb{Z}$ is a subset of which set?', o: ['$\\mathbb{N}$', '$\\mathbb{Q}$', 'Neither', 'The empty set'], a: 1,
        why: ['$\\mathbb{N} \\subset \\mathbb{Z}$, not the other way around — integers include negatives, which naturals don\'t.', 'Every integer $n$ can be written as $\\frac{n}{1}$, making it rational. So $\\mathbb{Z} \\subset \\mathbb{Q}$.', 'The number sets are nested: $\\mathbb{N} \\subset \\mathbb{Z} \\subset \\mathbb{Q} \\subset \\mathbb{R} \\subset \\mathbb{C}$.', 'The empty set has no elements, so nothing can be a subset of it (except itself).'] },
      { q: 'Which interval notation represents $\\{x : -2 \\leq x < 5\\}$?', o: ['$(-2, 5)$', '$[-2, 5]$', '$[-2, 5)$', '$(-2, 5]$'], a: 2,
        why: ['$(-2, 5)$ excludes both endpoints. But $-2$ is included ($\\leq$).', '$[-2, 5]$ includes both endpoints. But $5$ is excluded ($<$).', '$[-2, 5)$: square bracket at $-2$ (included, $\\leq$) and parenthesis at $5$ (excluded, $<$). Correct!', '$(-2, 5]$ excludes $-2$ and includes $5$ — the opposite of what we need.'] },
      { q: 'If $z = 3 + 4i$, what is $|z|$?', o: ['$7$', '$5$', '$\\sqrt{7}$', '$25$'], a: 1,
        why: ['$7 = 3 + 4$ — you added the parts, but modulus uses the Pythagorean theorem, not addition.', '$|z| = \\sqrt{3^2 + 4^2} = \\sqrt{9+16} = \\sqrt{25} = 5$. This is the distance from the origin in the complex plane.', '$\\sqrt{7}$ doesn\'t come from any correct calculation here.', '$25 = 3^2 + 4^2$ — you forgot to take the square root. The modulus is $\\sqrt{25}$, not $25$.'] },
      { q: 'Which statement is FALSE?', o: ['$\\pi$ is irrational', '$0$ is a natural number in some conventions', 'Every real number is complex', '$\\sqrt{4}$ is irrational'], a: 3,
        why: ['True — $\\pi$ is famously irrational (proved by Lambert in 1761).', 'True — some textbooks include 0 in the naturals, others start at 1. Both conventions exist.', 'True — every real $r$ can be written as $r + 0i$, so $\\mathbb{R} \\subset \\mathbb{C}$.', 'FALSE — $\\sqrt{4} = 2$, which is an integer and therefore rational. This is the answer.'] },
      { q: 'Simplify: $(x^3)(x^5)$', o: ['$x^{15}$', '$x^8$', '$2x^8$', '$x^{35}$'], a: 1,
        why: ['You multiplied the exponents ($3 \\times 5 = 15$), but the product rule says to ADD them.', 'Product rule: $x^a \\cdot x^b = x^{a+b}$, so $x^{3+5} = x^8$. Correct!', 'The coefficient stays 1 (there\'s only one $x^8$), not 2.', '$x^{35}$? No exponent rule gives this result.'] },
      { q: 'What is $\\log_2(32)$?', o: ['$4$', '$5$', '$6$', '$16$'], a: 1,
        why: ['$2^4 = 16 \\neq 32$. Close but one power off.', '$2^5 = 32$, so $\\log_2(32) = 5$. The logarithm asks: "2 to what power gives 32?"', '$2^6 = 64 \\neq 32$. One power too many.', '$16 = 2^4$; this confuses the answer with a power of 2.'] },
      { q: 'Factor: $x^2 - 9$', o: ['$(x-3)^2$', '$(x+3)(x-3)$', '$(x+9)(x-1)$', '$(x-9)(x+1)$'], a: 1,
        why: ['$(x-3)^2 = x^2 - 6x + 9 \\neq x^2 - 9$. This has a middle term; difference of squares does not.', 'Difference of squares: $a^2 - b^2 = (a+b)(a-b)$. Here $a=x, b=3$, giving $(x+3)(x-3)$. Correct!', '$(x+9)(x-1) = x^2 + 8x - 9 \\neq x^2 - 9$. The signs and constant are wrong.', '$(x-9)(x+1) = x^2 - 8x - 9 \\neq x^2 - 9$. Not the right factorization.'] },
      { q: 'Using the quadratic formula, the discriminant of $2x^2 + 3x + 5 = 0$ is:', o: ['$-31$', '$31$', '$49$', '$-49$'], a: 0,
        why: ['$\\Delta = b^2 - 4ac = 3^2 - 4(2)(5) = 9 - 40 = -31$. Negative means complex (non-real) roots. Correct!', 'You may have computed $|9 - 40| = 31$, but the discriminant keeps its sign — negative matters!', '$49 = 7^2$; this doesn\'t correspond to any correct computation with these coefficients.', 'Check: $4ac = 4(2)(5) = 40$, and $b^2 = 9$. So $\\Delta = 9 - 40 = -31$, not $-49$.'] },
      { q: 'Simplify: $\\frac{x^{-2}}{x^3}$', o: ['$x^{-5}$', '$x^{5}$', '$x^{-1}$', '$x$'], a: 0,
        why: ['Quotient rule: $\\frac{x^a}{x^b} = x^{a-b}$. So $x^{-2-3} = x^{-5}$. Correct!', 'You added the exponents instead of subtracting: $-2 + 3 = 1$... wait, that would give $x^1$. And $-2 - 3 = -5$, not $5$.', '$x^{-1}$ would come from $x^{-2}/x^{-1}$, not $x^{-2}/x^3$.', '$x = x^1$ doesn\'t match any correct simplification here.'] },
      { q: 'If $f(x) = x^2$ and $g(x) = x + 1$, what is $(f \\circ g)(2)$?', o: ['$5$', '$9$', '$6$', '$4$'], a: 1,
        why: ['$5 = f(2) + 1 = 4 + 1$. But composition means $f(g(2))$, not $f(2) + 1$.', '$(f \\circ g)(2) = f(g(2)) = f(3) = 3^2 = 9$. First apply $g$, then $f$. Correct!', '$6 = 2 \\cdot 3$? No rule of composition gives this.', '$4 = f(2) = 2^2$. You forgot to apply $g$ first!'] },
      { q: 'Which function is even?', o: ['$f(x) = x^3$', '$f(x) = x^2 + 1$', '$f(x) = x$', '$f(x) = \\sin x$'], a: 1,
        why: ['$(-x)^3 = -x^3 = -f(x)$. This is odd, not even.', '$(-x)^2 + 1 = x^2 + 1 = f(x)$. Since $f(-x) = f(x)$, this is even. Correct!', '$f(-x) = -x = -f(x)$. This is odd.', '$\\sin(-x) = -\\sin(x)$. Sine is odd, not even.'] },
      { q: 'The domain of $f(x) = \\sqrt{x - 3}$ is:', o: ['$x > 3$', '$x \\geq 3$', '$x \\leq 3$', 'All reals'], a: 1,
        why: ['Close! But $x = 3$ gives $\\sqrt{0} = 0$, which is defined. So $x = 3$ is included.', 'Need $x - 3 \\geq 0$, so $x \\geq 3$. The domain is $[3, \\infty)$. Correct!', 'If $x < 3$, then $x - 3 < 0$ and the square root is undefined (in reals).', 'Negative inputs to the square root are undefined, so not all reals work.'] },
      { q: 'What is $\\sin(\\pi/6)$?', o: ['$\\frac{\\sqrt{3}}{2}$', '$\\frac{1}{2}$', '$\\frac{\\sqrt{2}}{2}$', '$1$'], a: 1,
        why: ['$\\frac{\\sqrt{3}}{2}$ is $\\cos(\\pi/6)$ or $\\sin(\\pi/3)$. Easy to mix up!', '$\\sin(\\pi/6) = \\sin(30°) = \\frac{1}{2}$. A must-know unit circle value. Correct!', '$\\frac{\\sqrt{2}}{2}$ is $\\sin(\\pi/4) = \\sin(45°)$. Wrong angle.', '$\\sin(\\pi/2) = 1$, not $\\sin(\\pi/6)$.'] },
      { q: '$\\sin^2\\theta + \\cos^2\\theta = $?', o: ['$0$', '$1$', '$2$', '$\\tan^2\\theta$'], a: 1,
        why: ['It\'s never 0 (unless both sin and cos are 0, which never happens simultaneously).', 'The fundamental Pythagorean identity. Follows directly from $x^2 + y^2 = 1$ on the unit circle. Correct!', 'The maximum of $\\sin^2 + \\cos^2$ is always exactly 1, never 2.', '$\\tan^2\\theta = \\sin^2\\theta/\\cos^2\\theta$, which is a different expression entirely.'] },
      { q: 'What is $\\cos(\\pi)$?', o: ['$0$', '$1$', '$-1$', '$\\frac{1}{2}$'], a: 2,
        why: ['$\\cos(\\pi/2) = 0$, not $\\cos(\\pi)$. Different angle.', '$\\cos(0) = 1$, not $\\cos(\\pi)$. At $\\pi$, we\'re at the opposite side of the circle.', 'At $\\pi$ (180°), the point is $(-1, 0)$. So $\\cos(\\pi) = -1$. Correct!', '$\\cos(\\pi/3) = 1/2$, not $\\cos(\\pi)$.'] },
      { q: 'Simplify: $\\sec^2 x - \\tan^2 x$', o: ['$0$', '$1$', '$\\sin^2 x$', '$-1$'], a: 1,
        why: ['They don\'t cancel — $\\sec^2 x$ and $\\tan^2 x$ differ by exactly 1.', 'From $1 + \\tan^2 x = \\sec^2 x$, we get $\\sec^2 x - \\tan^2 x = 1$. Correct!', '$\\sin^2 x$ doesn\'t appear in this identity.', 'It\'s $+1$, not $-1$. The Pythagorean identity has a plus sign.'] },
    ],
    'limits': [
      { q: '$\\lim_{x \\to 3} (2x + 1) = $?', o: ['$5$', '$6$', '$7$', '$8$'], a: 2,
        why: ['$2(3) + 1 = 7$, not 5. Check your arithmetic.', '$2(3) = 6$, but you forgot the $+1$.', 'Direct substitution: $2(3) + 1 = 7$. Polynomials are continuous, so just plug in. Correct!', '$2(4) = 8$? The limit is at $x = 3$, not $x = 4$.'] },
      { q: '$\\lim_{x \\to 0} \\frac{\\sin x}{x} = $?', o: ['$0$', '$1$', '$\\infty$', 'Does not exist'], a: 1,
        why: ['As $x \\to 0$, both $\\sin x \\to 0$ and $x \\to 0$, but their ratio approaches 1, not 0.', 'This is THE most important special limit in calculus, proved by the Squeeze Theorem. It equals 1. Correct!', 'The ratio stays bounded near 1, it doesn\'t blow up.', 'The limit does exist — it\'s 1. Both sides agree.'] },
      { q: 'If $\\lim_{x \\to a^-} f(x) = 3$ and $\\lim_{x \\to a^+} f(x) = 5$, then $\\lim_{x \\to a} f(x)$:', o: ['$= 3$', '$= 5$', '$= 4$', 'Does not exist'], a: 3,
        why: ['The left limit is 3, but the two-sided limit requires BOTH sides to agree.', 'The right limit is 5, but again, both sides must match.', 'We don\'t average the limits — that\'s not how limits work.', 'Left limit (3) ≠ right limit (5), so the two-sided limit does not exist. This is a jump discontinuity. Correct!'] },
      { q: '$\\lim_{x \\to \\infty} \\frac{3x^2 + 1}{x^2 - 2} = $?', o: ['$0$', '$3$', '$1$', '$\\infty$'], a: 1,
        why: ['The limit is 0 when the denominator\'s degree is higher. Here they\'re equal.', 'Same degree top and bottom → ratio of leading coefficients: $3/1 = 3$. Correct!', 'You\'d get 1 if the leading coefficients were equal, but they\'re $3$ and $1$.', 'The limit is $\\infty$ when the numerator\'s degree is higher. Here they\'re equal.'] },
      { q: '$\\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2} = $?', o: ['$0$', '$2$', '$4$', 'Does not exist'], a: 2,
        why: ['Both top and bottom are 0 at $x=2$, but after canceling the common factor, the limit is 4.', '$x + 2$ evaluated at $x = 2$ gives 4, not 2.', 'Factor: $\\frac{(x-2)(x+2)}{x-2} = x+2$. At $x=2$: $2+2 = 4$. Correct!', 'The limit exists after canceling — the discontinuity is removable.'] },
      { q: 'Which condition is NOT required for continuity at $x = a$?', o: ['$f(a)$ is defined', '$\\lim_{x \\to a} f(x)$ exists', '$f\'(a)$ exists', '$\\lim_{x \\to a} f(x) = f(a)$'], a: 2,
        why: ['Required — if $f(a)$ isn\'t defined, continuity fails at step 1.', 'Required — the limit must exist for continuity.', 'NOT required! $f(x) = |x|$ is continuous at 0 but not differentiable there (sharp corner). Differentiability is stronger than continuity. Correct!', 'Required — this is the third and final condition for continuity.'] },
      { q: 'The Intermediate Value Theorem requires $f$ to be:', o: ['Differentiable', 'Continuous on $[a,b]$', 'Increasing', 'Bounded'], a: 1,
        why: ['Differentiability is stronger than needed — IVT only requires continuity.', 'IVT: if $f$ is continuous on $[a,b]$ and $k$ is between $f(a)$ and $f(b)$, then $f(c) = k$ for some $c \\in (a,b)$. Correct!', 'The function doesn\'t need to be increasing — it just needs to be continuous.', 'Continuity on a closed interval implies boundedness, but the key hypothesis is continuity.'] },
      { q: 'Given $\\varepsilon > 0$, the $\\varepsilon$-$\\delta$ definition says $|f(x) - L| < \\varepsilon$ when:', o: ['$|x - a| < \\varepsilon$', '$0 < |x - a| < \\delta$', '$|x| < \\delta$', '$f(x) < \\varepsilon$'], a: 1,
        why: ['The bound on $x$ involves $\\delta$, not $\\varepsilon$. These are different quantities.', 'Correct! The $0 <$ excludes $x = a$ itself, and $|x - a| < \\delta$ controls how close $x$ is to $a$.', 'It\'s $|x - a|$ (distance from $a$), not $|x|$ (distance from 0).', 'We bound $|f(x) - L|$, not $f(x)$ alone.'] },
      { q: '$\\lim_{x \\to 0} \\frac{1 - \\cos x}{x} = $?', o: ['$1$', '$0$', '$\\frac{1}{2}$', '$-1$'], a: 1,
        why: ['You might be confusing this with $\\lim \\frac{\\sin x}{x} = 1$. This is a different limit.', 'Multiply by $\\frac{1+\\cos x}{1+\\cos x}$: the limit becomes $\\frac{\\sin x}{x} \\cdot \\frac{\\sin x}{1+\\cos x} \\to 1 \\cdot 0 = 0$. Correct!', '$\\frac{1}{2}$ is actually $\\lim_{x \\to 0} \\frac{1 - \\cos x}{x^2}$. Note the $x^2$ vs $x$.', 'The expression is always non-negative near 0, so it can\'t approach $-1$.'] },
      { q: 'A function with a removable discontinuity at $x=a$ has:', o: ['No limit at $a$', 'A limit at $a$ but $f(a) \\neq \\lim$', 'An infinite limit at $a$', 'A jump at $a$'], a: 1,
        why: ['If there\'s no limit, the discontinuity is essential (oscillating), not removable.', 'Removable: the limit exists but $f(a)$ either isn\'t defined or doesn\'t equal the limit. You can "fill the hole." Correct!', 'An infinite limit means a vertical asymptote — that\'s not removable.', 'A jump means different one-sided limits — also not removable.'] },
    ],
    'derivatives': [
      { q: 'The derivative of $f(x) = x^4$ is:', o: ['$x^3$', '$4x^3$', '$4x^4$', '$3x^4$'], a: 1,
        why: ['You reduced the exponent but forgot the coefficient. Power rule: bring the 4 down.', 'Power rule: $\\frac{d}{dx}x^n = nx^{n-1}$. So $4x^{4-1} = 4x^3$. Correct!', 'The exponent decreases by 1, so $x^4 \\to x^3$, not $x^4$.', 'The coefficient is the old exponent (4), and the new exponent is $n-1 = 3$, not 4.'] },
      { q: '$\\frac{d}{dx}[\\sin x] = $?', o: ['$-\\cos x$', '$\\cos x$', '$\\sin x$', '$\\tan x$'], a: 1,
        why: ['$-\\cos x$ is the derivative of $\\cos x$ (with a negative sign), not $\\sin x$.', 'The derivative of $\\sin x$ is $\\cos x$. Must memorize! Correct!', '$\\sin x$ is its own integral (sort of), not its own derivative. Only $e^x$ has that property.', '$\\tan x$ is $\\sin x / \\cos x$; it\'s not the derivative of $\\sin x$.'] },
      { q: 'If $f(x) = e^{3x}$, then $f\'(x) = $?', o: ['$e^{3x}$', '$3e^{3x}$', '$3e^x$', '$e^{3x}/3$'], a: 1,
        why: ['You forgot the chain rule — the inner function $3x$ has derivative 3.', 'Chain rule: $\\frac{d}{dx}e^{u} = e^u \\cdot u\'$. Here $u=3x$, $u\'=3$, so $3e^{3x}$. Correct!', 'The $3x$ in the exponent stays as $3x$, not $x$. The chain rule multiplies by 3 outside.', 'Dividing by 3 is integration, not differentiation. Derivatives multiply by the inner derivative.'] },
      { q: 'The product rule states $(fg)\' = $?', o: ['$f\'g\'$', '$f\'g + fg\'$', '$f\'g - fg\'$', '$fg\' + f\'g\'$'], a: 1,
        why: ['The "freshman\'s dream" — the most common mistake! $(fg)\' \\neq f\'g\'$.', '$(fg)\' = f\'g + fg\'$. Both terms: differentiate the first × keep second + keep first × differentiate second. Correct!', 'That\'s the numerator of the quotient rule ($(f/g)\' = \\frac{f\'g - fg\'}{g^2}$), not the product rule.', 'Each term should have exactly one prime: $f\'g$ and $fg\'$, not $f\'g\'$.'] },
      { q: '$\\frac{d}{dx}[\\ln x] = $?', o: ['$\\frac{1}{x}$', '$\\frac{1}{x^2}$', '$e^x$', '$\\ln x$'], a: 0,
        why: ['$\\frac{d}{dx}\\ln x = \\frac{1}{x}$ for $x > 0$. A must-know derivative. Correct!', '$\\frac{1}{x^2} = \\frac{d}{dx}(-\\frac{1}{x})$. Not related to $\\ln x$.', '$e^x$ is the derivative of itself, not of $\\ln x$. They\'re inverse functions.', 'No function is its own derivative except $e^x$ (and constant multiples of it). $\\ln x$ is not.'] },
      { q: 'If $f\'(c) = 0$, then at $x = c$:', o: ['$f$ has a maximum', '$f$ has a minimum', '$f$ has a critical point', '$f$ is discontinuous'], a: 2,
        why: ['Not necessarily — $f\'(c) = 0$ could be a min, max, or inflection point (like $x^3$ at $x=0$).', 'Same issue — you need the second derivative test or first derivative test to determine max vs min.', '$f\'(c) = 0$ or undefined means $c$ is a critical point. It COULD be a max, min, or neither. Correct!', 'Having $f\'(c) = 0$ has nothing to do with discontinuity. The function is differentiable there!'] },
      { q: 'The Mean Value Theorem guarantees $f\'(c) = \\frac{f(b)-f(a)}{b-a}$ when $f$ is:', o: ['Continuous on $[a,b]$ and differentiable on $(a,b)$', 'Differentiable on $[a,b]$', 'Continuous everywhere', 'Increasing on $[a,b]$'], a: 0,
        why: ['MVT requires continuity on the CLOSED interval $[a,b]$ AND differentiability on the OPEN interval $(a,b)$. Correct!', 'Close, but MVT needs continuity on the closed interval, not differentiability at the endpoints.', 'Continuity everywhere is more than needed — just on $[a,b]$ suffices.', 'The function doesn\'t need to be increasing. MVT works for any continuous + differentiable function.'] },
      { q: '$\\frac{d}{dx}[\\tan x] = $?', o: ['$\\cot x$', '$-\\sec^2 x$', '$\\sec^2 x$', '$\\sec x \\tan x$'], a: 2,
        why: ['$\\cot x = 1/\\tan x$. It\'s not the derivative of $\\tan x$.', 'Almost! But there\'s no negative sign. $\\frac{d}{dx}\\tan x = +\\sec^2 x$.', '$\\frac{d}{dx}\\tan x = \\sec^2 x$. Can be derived from $\\frac{d}{dx}(\\sin x/\\cos x)$ using the quotient rule. Correct!', '$\\sec x \\tan x$ is the derivative of $\\sec x$, not $\\tan x$.'] },
      { q: 'L\'Hôpital\'s Rule applies when the limit has the form:', o: ['$0 \\cdot \\infty$', '$1^\\infty$', '$\\frac{0}{0}$ or $\\frac{\\infty}{\\infty}$', 'Any form'], a: 2,
        why: ['$0 \\cdot \\infty$ must be rewritten as $0/0$ or $\\infty/\\infty$ first (e.g., $x \\cdot \\frac{1}{1/x}$).', '$1^\\infty$ must also be rewritten, usually via $e^{\\ln}$, before L\'Hôpital applies.', 'L\'Hôpital\'s Rule directly applies to $\\frac{0}{0}$ and $\\frac{\\pm\\infty}{\\pm\\infty}$. Other indeterminate forms must be converted first. Correct!', 'It does NOT apply to every form. For example, $\\frac{3}{0}$ or $\\frac{\\infty}{0}$ are not valid applications.'] },
      { q: 'If $f\'\'(c) > 0$ at a critical point $c$, then $f(c)$ is a:', o: ['Local maximum', 'Local minimum', 'Inflection point', 'Cannot determine'], a: 1,
        why: ['$f\'\' > 0$ means concave UP (like a cup), which holds a minimum, not maximum.', '$f\'\' > 0$ = concave up = the curve bends upward = local minimum. Think "smile = min." Correct!', 'Inflection points have $f\'\' = 0$ (change of concavity), not $f\'\' > 0$.', 'We CAN determine: the second derivative test says $f\'\' > 0$ at a critical point means local min.'] },
      { q: '$\\frac{d}{dx}[x \\cdot e^x] = $?', o: ['$e^x$', '$xe^x$', '$e^x + xe^x$', '$e^x(x+1)$'], a: 2,
        why: ['You differentiated $x$ and $e^x$ separately and only kept $e^x$. Product rule needs both terms.', 'You forgot the term where $x$ is differentiated: $(1)(e^x)$. Only kept $(x)(e^x)$.', 'Product rule: $(x)\'e^x + x(e^x)\' = 1 \\cdot e^x + x \\cdot e^x = e^x + xe^x = e^x(x+1)$. Correct! (Note: D is the same answer factored.)', 'This is the same as C, just factored: $e^x(x+1) = e^x + xe^x$. Both C and D are correct forms!'] },
      { q: 'The derivative of $\\arctan(x)$ is:', o: ['$\\frac{1}{1+x^2}$', '$\\frac{1}{\\sqrt{1-x^2}}$', '$\\sec^2 x$', '$\\frac{-1}{1+x^2}$'], a: 0,
        why: ['$\\frac{d}{dx}\\arctan x = \\frac{1}{1+x^2}$. One of the three inverse trig derivatives to memorize. Correct!', '$\\frac{1}{\\sqrt{1-x^2}}$ is the derivative of $\\arcsin x$, not $\\arctan x$. Easy to mix up!', '$\\sec^2 x$ is the derivative of $\\tan x$. The inverse $\\arctan$ has a completely different derivative.', 'The derivative of $\\arctan$ is positive (since $\\arctan$ is increasing), so no negative sign.'] },
    ],
    'integration': [
      { q: '$\\int x^3\\,dx = $?', o: ['$3x^2 + C$', '$\\frac{x^4}{4} + C$', '$\\frac{x^4}{3} + C$', '$x^4 + C$'], a: 1,
        why: ['$3x^2$ is the derivative of $x^3$, not its antiderivative. You went the wrong direction!', 'Power rule for integration: $\\int x^n dx = \\frac{x^{n+1}}{n+1} + C$. So $\\frac{x^4}{4} + C$. Correct!', 'You divide by the NEW exponent ($4$), not the old one ($3$).', 'You increased the exponent but forgot to divide by it.'] },
      { q: '$\\int_0^\\pi \\sin x\\,dx = $?', o: ['$0$', '$1$', '$2$', '$-2$'], a: 2,
        why: ['$\\sin x \\geq 0$ on $[0, \\pi]$, so the integral is positive, not zero. (You\'d get 0 on $[0, 2\\pi]$).', 'Check: $[-\\cos x]_0^\\pi = -\\cos\\pi + \\cos 0 = -(-1) + 1 = 2$, not 1.', '$[-\\cos x]_0^\\pi = -\\cos\\pi - (-\\cos 0) = 1 + 1 = 2$. The area under one arch of sine. Correct!', 'The antiderivative of $\\sin x$ is $-\\cos x$ (negative), but evaluating gives $+2$.'] },
      { q: 'The Fundamental Theorem of Calculus (Part 2) states:', o: ['$\\frac{d}{dx}\\int_a^x f = f(x)$', '$\\int_a^b f = F(b) - F(a)$', '$\\int f\' = f + C$', 'All of the above'], a: 1,
        why: ['This is Part 1 of FTC, not Part 2.', 'FTC Part 2: $\\int_a^b f(x)dx = F(b) - F(a)$ where $F\' = f$. This makes definite integrals computable! Correct!', 'This is the basic antiderivative property, not specifically the FTC.', 'Only B is Part 2 specifically. A is Part 1, and C is just a restatement of what antiderivatives mean.'] },
      { q: '$\\int \\frac{1}{x}\\,dx = $?', o: ['$\\frac{1}{x^2} + C$', '$\\ln x + C$', '$\\ln|x| + C$', '$-\\frac{1}{x^2} + C$'], a: 2,
        why: ['$\\frac{1}{x^2} = x^{-2}$ is the derivative of $-x^{-1}$, not the antiderivative of $1/x$.', 'Almost! But $\\ln x$ is only defined for $x > 0$. The absolute value $\\ln|x|$ handles $x < 0$ too.', '$\\int \\frac{1}{x}dx = \\ln|x| + C$. The absolute value is essential because $\\ln$ is only defined for positive arguments. Correct!', 'This is the derivative of $\\frac{1}{x}$, not the antiderivative of $\\frac{1}{x}$.'] },
      { q: 'To evaluate $\\int x e^x dx$, you should use:', o: ['u-substitution', 'Integration by parts', 'Partial fractions', 'Trig substitution'], a: 1,
        why: ['u-sub works when you see $f(g(x)) \\cdot g\'(x)$. Here there\'s no obvious inner/outer structure.', 'Product of algebraic ($x$) and exponential ($e^x$) → use IBP with $u = x$, $dv = e^x dx$. Correct!', 'Partial fractions requires a rational function $P(x)/Q(x)$, which this is not.', 'Trig sub is for square roots like $\\sqrt{a^2 - x^2}$. Not relevant here.'] },
      { q: '$\\int_a^a f(x)\\,dx = $?', o: ['$f(a)$', '$1$', '$0$', 'Undefined'], a: 2,
        why: ['$f(a)$ is the function value, not the integral. Integrals measure area, not height.', 'There\'s no reason for the integral to equal 1.', 'When the upper and lower limits are the same, the "width" is 0, so the integral is always 0. Correct!', 'It\'s perfectly well-defined — it\'s just zero. No width = no area.'] },
      { q: 'In IBP, the LIATE rule suggests choosing $u$ as:', o: ['The exponential function', 'The trig function', 'The algebraic function', 'The logarithmic function'], a: 3,
        why: ['Exponentials are LAST in LIATE (L-I-A-T-E). They should be $dv$, not $u$.', 'Trig is second-to-last in LIATE. It\'s preferred as $dv$.', 'Algebraic is in the middle. Use as $u$ only if no Log or Inverse Trig is present.', 'LIATE: Log → Inverse Trig → Algebraic → Trig → Exponential. Logs are the FIRST choice for $u$ because they simplify when differentiated. Correct!'] },
      { q: '$\\int e^x\\,dx = $?', o: ['$xe^x + C$', '$e^x + C$', '$e^{x+1}/(x+1) + C$', '$\\frac{e^x}{x} + C$'], a: 1,
        why: ['$xe^x$ would require IBP to produce. The antiderivative of $e^x$ alone is just $e^x$.', '$e^x$ is its own antiderivative (and its own derivative). The most remarkable property in calculus! Correct!', 'The power rule $\\frac{x^{n+1}}{n+1}$ does NOT apply to $e^x$. That rule is for $x^n$, not $n^x$ or $e^x$.', 'Division by $x$ would create a more complex function, not simplify. $\\int e^x dx = e^x + C$.'] },
      { q: 'For $\\int \\frac{2x}{x^2+1}dx$, the best method is:', o: ['IBP', 'u-sub with $u = x^2 + 1$', 'Partial fractions', 'Trig sub'], a: 1,
        why: ['IBP would work but is unnecessarily complicated. There\'s a much simpler approach.', 'Let $u = x^2 + 1$, then $du = 2x\\,dx$. The integral becomes $\\int \\frac{du}{u} = \\ln|u| + C = \\ln(x^2+1) + C$. Correct!', 'Partial fractions requires factorable polynomial denominators. $x^2 + 1$ doesn\'t factor over reals.', 'Trig sub would work ($x = \\tan\\theta$) but is massive overkill when u-sub works perfectly.'] },
      { q: '$\\int \\cos x\\,dx = $?', o: ['$-\\sin x + C$', '$\\sin x + C$', '$\\cos x + C$', '$\\tan x + C$'], a: 1,
        why: ['$-\\sin x$ is the antiderivative of $-\\cos x$, or equivalently, $\\frac{d}{dx}(-\\sin x) = -\\cos x$.', '$\\frac{d}{dx}\\sin x = \\cos x$, so $\\int \\cos x\\, dx = \\sin x + C$. Correct!', '$\\cos x$ is not its own antiderivative. Only $e^x$ has that property.', '$\\frac{d}{dx}\\tan x = \\sec^2 x \\neq \\cos x$.'] },
    ],
    'series': [
      { q: 'The geometric series $\\sum_{n=0}^\\infty r^n$ converges when:', o: ['$r < 1$', '$|r| < 1$', '$r > 0$', '$r \\neq 1$'], a: 1,
        why: ['$r < 1$ allows $r = -2$, which makes the series diverge. You need the absolute value.', '$|r| < 1$ is the convergence condition. Sum = $\\frac{1}{1-r}$. For example, $r = -0.5$ converges. Correct!', '$r = 2 > 0$ but the series $1 + 2 + 4 + 8 + \\cdots$ clearly diverges.', '$r = -2 \\neq 1$ but the series diverges. Being $\\neq 1$ isn\'t enough.'] },
      { q: 'If $\\lim_{n \\to \\infty} a_n \\neq 0$, then $\\sum a_n$:', o: ['Converges', 'Diverges', 'May converge', 'Equals 0'], a: 1,
        why: ['If terms don\'t approach 0, the partial sums can\'t stabilize. Convergence is impossible.', 'The Divergence Test: if $\\lim a_n \\neq 0$, the series MUST diverge. No exceptions. Correct!', 'There\'s no "may" — non-zero limit guarantees divergence.', 'The series doesn\'t equal 0; it diverges (partial sums grow without bound or oscillate).'] },
      { q: 'The $p$-series $\\sum \\frac{1}{n^p}$ converges when:', o: ['$p > 0$', '$p > 1$', '$p \\geq 1$', '$p > 2$'], a: 1,
        why: ['$p = 0.5 > 0$ gives $\\sum 1/\\sqrt{n}$, which diverges. Not strong enough.', 'The $p$-series converges iff $p > 1$. At $p = 1$ (harmonic series), it famously diverges. Correct!', 'At $p = 1$: the harmonic series $\\sum 1/n$ diverges. Must be strictly greater than 1.', '$p > 2$ is sufficient but too restrictive. $p = 1.5$ also converges.'] },
      { q: 'The Maclaurin series for $e^x$ is:', o: ['$\\sum \\frac{x^n}{n}$', '$\\sum \\frac{x^n}{n!}$', '$\\sum \\frac{x^{2n}}{(2n)!}$', '$\\sum nx^n$'], a: 1,
        why: ['$\\sum x^n/n$ starts at $n=1$ and gives $-\\ln(1-x)$, not $e^x$.', '$e^x = \\sum_{n=0}^\\infty \\frac{x^n}{n!} = 1 + x + \\frac{x^2}{2!} + \\frac{x^3}{3!} + \\cdots$. The most important series in math! Correct!', '$\\sum x^{2n}/(2n)!$ is $\\cosh x$ (only even powers). $e^x$ needs ALL powers.', '$\\sum nx^n$ is the derivative of $\\sum x^n = 1/(1-x)$, giving $1/(1-x)^2$.'] },
      { q: 'The Ratio Test says $\\sum a_n$ converges if:', o: ['$\\lim |a_{n+1}/a_n| > 1$', '$\\lim |a_{n+1}/a_n| < 1$', '$\\lim |a_{n+1}/a_n| = 1$', '$\\lim a_n = 0$'], a: 1,
        why: ['$L > 1$ means terms grow → the series DIVERGES.', 'If $L = \\lim|a_{n+1}/a_n| < 1$, terms shrink fast enough to converge (absolutely). Correct!', '$L = 1$ is INCONCLUSIVE — the ratio test gives no information. Must use another test.', '$\\lim a_n = 0$ is necessary but not sufficient. The harmonic series has $a_n \\to 0$ but diverges.'] },
      { q: '$\\sum_{n=0}^\\infty \\frac{1}{2^n} = $?', o: ['$1$', '$2$', '$\\infty$', '$1/2$'], a: 1,
        why: ['$1$ is just the first term ($n=0$). The full sum is larger.', 'Geometric with $a = 1$, $r = 1/2$: $S = \\frac{1}{1 - 1/2} = 2$. Alternatively: $1 + 0.5 + 0.25 + \\cdots = 2$. Correct!', '$|r| = 1/2 < 1$, so the series converges (not infinity).', '$1/2$ is the second term. The sum of ALL terms is 2.'] },
      { q: 'An alternating series $\\sum (-1)^n b_n$ converges if $b_n$ is:', o: ['Increasing and $b_n \\to 0$', 'Decreasing and $b_n \\to 0$', 'Bounded', 'Positive'], a: 1,
        why: ['If $b_n$ is increasing, the oscillations grow — the series diverges.', 'Alternating Series Test: $b_n$ must be (1) decreasing and (2) $\\lim b_n = 0$. Both conditions needed. Correct!', 'Boundedness alone isn\'t enough. $b_n = 1$ (constant, bounded) gives $\\sum(-1)^n$ which diverges.', '$b_n$ being positive is assumed (it\'s the absolute value of the terms), but it\'s not sufficient by itself.'] },
      { q: 'The Taylor series of $\\sin x$ centered at $0$ contains:', o: ['Only even powers', 'Only odd powers', 'All powers', 'Only constant terms'], a: 1,
        why: ['Even powers give $\\cos x$ ($\\sum (-1)^n x^{2n}/(2n)!$). $\\sin$ is the odd one.', '$\\sin x = x - \\frac{x^3}{3!} + \\frac{x^5}{5!} - \\cdots$. Only odd powers because $\\sin$ is an odd function ($\\sin(-x) = -\\sin x$). Correct!', 'If it had all powers, it wouldn\'t be an odd function. Odd functions only have odd-power terms.', 'A constant term would mean $\\sin(0) \\neq 0$, but $\\sin(0) = 0$.'] },
      { q: 'The radius of convergence of $\\sum \\frac{x^n}{n!}$ is:', o: ['$1$', '$e$', '$\\infty$', '$0$'], a: 2,
        why: ['Ratio test: $\\lim \\frac{|x|^{n+1}/(n+1)!}{|x|^n/n!} = \\lim \\frac{|x|}{n+1} = 0 < 1$ for ALL $x$. So $R \\neq 1$.', '$e$ is the value of the series at $x = 1$, not the radius of convergence.', 'The ratio limit is 0 for any $x$, so the series converges for ALL $x$. $R = \\infty$. Correct!', '$R = 0$ would mean it only converges at $x = 0$. But $e^x$ converges everywhere!'] },
    ],
    'parametric-polar': [
      { q: 'For $x = \\cos t$, $y = \\sin t$, the curve is a:', o: ['Line', 'Parabola', 'Circle', 'Ellipse'], a: 2,
        why: ['A line would need $x$ and $y$ both linear in $t$.', 'A parabola has $y = ax^2$. Here $x^2 + y^2 = \\cos^2 t + \\sin^2 t = 1$, which is a circle.', '$\\cos^2 t + \\sin^2 t = 1 \\Rightarrow x^2 + y^2 = 1$. A unit circle centered at origin. Correct!', 'An ellipse would need different coefficients, like $x = 2\\cos t, y = 3\\sin t$.'] },
      { q: '$\\frac{dy}{dx}$ for parametric curves equals:', o: ['$\\frac{dx/dt}{dy/dt}$', '$\\frac{dy/dt}{dx/dt}$', '$\\frac{dy}{dt}$', '$\\frac{dx}{dt}$'], a: 1,
        why: ['That\'s $dx/dy$, the reciprocal. The fraction is flipped.', 'Chain rule: $\\frac{dy}{dx} = \\frac{dy/dt}{dx/dt}$. $dy$ goes on top! Correct!', 'This gives the rate of change of $y$ with respect to $t$, not $x$.', 'This gives the rate of change of $x$ with respect to $t$.'] },
      { q: 'In polar coordinates, the area enclosed by $r = f(\\theta)$ from $\\alpha$ to $\\beta$ is:', o: ['$\\int_\\alpha^\\beta r\\,d\\theta$', '$\\frac{1}{2}\\int_\\alpha^\\beta r^2\\,d\\theta$', '$\\int_\\alpha^\\beta r^2\\,d\\theta$', '$\\pi r^2$'], a: 1,
        why: ['$\\int r\\, d\\theta$ gives arc length (roughly), not area.', 'Polar area = $\\frac{1}{2}\\int_\\alpha^\\beta r^2 d\\theta$. The $\\frac{1}{2}$ comes from the triangular area elements $\\frac{1}{2}r^2 d\\theta$. Correct!', 'Missing the crucial $\\frac{1}{2}$ factor. This would give twice the actual area.', '$\\pi r^2$ is the area of a full circle with constant radius. Polar curves have varying $r$.'] },
      { q: 'The polar curve $r = 1 + \\cos\\theta$ is called a:', o: ['Rose', 'Limaçon', 'Cardioid', 'Lemniscate'], a: 2,
        why: ['Roses have the form $r = a\\cos(n\\theta)$ or $r = a\\sin(n\\theta)$.', 'Limaçons are $r = a + b\\cos\\theta$. A cardioid is the special case $a = b$.', 'When $a = b$ in $r = a + b\\cos\\theta$, the curve is heart-shaped: a cardioid ("kardia" = heart). Correct!', 'Lemniscates have the form $r^2 = a^2\\cos(2\\theta)$ — a figure-eight shape.'] },
      { q: 'Convert $(r, \\theta) = (2, \\pi/3)$ to Cartesian:', o: ['$(1, \\sqrt{3})$', '$(\\sqrt{3}, 1)$', '$(1, 1)$', '$(2, 2)$'], a: 0,
        why: ['$x = r\\cos\\theta = 2\\cos(\\pi/3) = 2 \\cdot \\frac{1}{2} = 1$. $y = r\\sin\\theta = 2\\sin(\\pi/3) = 2 \\cdot \\frac{\\sqrt{3}}{2} = \\sqrt{3}$. Correct!', 'You swapped $\\cos$ and $\\sin$ — $x$ uses cosine, $y$ uses sine.', '$\\cos(\\pi/3) = 1/2$ and $\\sin(\\pi/3) = \\sqrt{3}/2$, not both $1/2$.', 'You used $r = 2$ as both coordinates. Must multiply by trig values.'] },
    ],
    'multivariable': [
      { q: 'If $f(x,y) = x^2 y + y^3$, then $\\frac{\\partial f}{\\partial x} = $?', o: ['$2xy$', '$x^2 + 3y^2$', '$2xy + 3y^2$', '$2x + y$'], a: 0,
        why: ['Treat $y$ as constant: $\\frac{\\partial}{\\partial x}(x^2 y) = 2xy$ and $\\frac{\\partial}{\\partial x}(y^3) = 0$. So $2xy$. Correct!', 'This is $\\frac{\\partial f}{\\partial y}$, not $\\frac{\\partial f}{\\partial x}$. You differentiated with respect to the wrong variable.', 'You computed the sum of both partial derivatives, not just $\\partial f/\\partial x$.', '$y^3$ is constant w.r.t. $x$ (derivative = 0), and $x^2 y$ gives $2xy$, not $2x$.'] },
      { q: 'The gradient $\\nabla f$ points in the direction of:', o: ['Steepest descent', 'Steepest ascent', 'Zero change', 'The tangent line'], a: 1,
        why: ['The NEGATIVE gradient $-\\nabla f$ points downhill. $\\nabla f$ itself points uphill.', 'The gradient points in the direction of maximum rate of increase (steepest ascent). Its magnitude is that rate. Correct!', 'Zero change is perpendicular to the gradient — that\'s along level curves.', 'The tangent line is in 2D. The gradient is a vector, not a line.'] },
      { q: 'Green\'s Theorem relates a line integral to a:', o: ['Triple integral', 'Surface integral', 'Double integral', 'Volume integral'], a: 2,
        why: ['Triple integrals are 3D. Green\'s Theorem is a 2D result.', 'Surface integrals relate to Stokes\' Theorem, not Green\'s.', 'Green\'s: $\\oint_C \\mathbf{F} \\cdot d\\mathbf{r} = \\iint_D (\\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y})\\,dA$. Line integral → double integral. Correct!', 'Volume integrals relate to the Divergence Theorem in 3D.'] },
      { q: '$\\frac{\\partial^2 f}{\\partial x \\partial y} = \\frac{\\partial^2 f}{\\partial y \\partial x}$ when $f$ has:', o: ['First derivatives', 'Continuous second partial derivatives', 'A maximum', 'No critical points'], a: 1,
        why: ['Having first derivatives doesn\'t guarantee the mixed partials are equal.', 'Clairaut\'s Theorem: if both mixed second partials are continuous, they\'re equal. Correct!', 'Having a maximum is irrelevant to whether mixed partials commute.', 'Critical points don\'t affect Clairaut\'s theorem.'] },
      { q: 'In Lagrange multipliers, we solve:', o: ['$\\nabla f = 0$', '$\\nabla f = \\lambda \\nabla g$', '$f = g$', '$\\nabla g = 0$'], a: 1,
        why: ['$\\nabla f = 0$ finds unconstrained extrema. Lagrange handles constrained optimization.', 'At a constrained extremum, $\\nabla f$ is parallel to $\\nabla g$, giving $\\nabla f = \\lambda \\nabla g$ (plus $g = 0$). Correct!', 'Setting $f = g$ isn\'t part of the method. The constraint is $g = 0$ (or $g = c$).', '$\\nabla g = 0$ would mean the constraint surface has a singularity — not what we\'re solving for.'] },
    ],
    'linear-algebra': [
      { q: 'If $A$ is a $3 \\times 2$ matrix and $B$ is $2 \\times 4$, then $AB$ is:', o: ['$3 \\times 4$', '$2 \\times 2$', '$3 \\times 2$', 'Undefined'], a: 0,
        why: ['$(m \\times n)(n \\times p) = m \\times p$. Inner dimensions ($2 = 2$) match, result is $3 \\times 4$. Correct!', 'The result dimensions come from the OUTER numbers: rows of $A$ × columns of $B$.', '$3 \\times 2$ is the size of $A$ itself, not the product.', 'It IS defined because the inner dimensions match ($2 = 2$).'] },
      { q: 'The determinant of $\\begin{pmatrix} 2 & 1 \\\\ 3 & 4 \\end{pmatrix}$ is:', o: ['$5$', '$11$', '$-5$', '$8$'], a: 0,
        why: ['$\\det = ad - bc = 2(4) - 1(3) = 8 - 3 = 5$. For a 2×2 matrix: top-left × bottom-right minus top-right × bottom-left. Correct!', '$11 = 2(4) + 1(3) = 8 + 3$. You ADDED instead of subtracting. The formula is $ad - bc$.', 'You may have computed $bc - ad = 3 - 8 = -5$. The order matters: it\'s $ad - bc$.', '$8 = 2 \\times 4$. You only computed $ad$ and forgot to subtract $bc$.'] },
      { q: '$A\\mathbf{v} = \\lambda\\mathbf{v}$ means $\\mathbf{v}$ is a(n):', o: ['Basis vector', 'Null vector', 'Eigenvector', 'Unit vector'], a: 2,
        why: ['Any set of independent vectors can be a basis. Eigenvectors are special.', 'Null vectors satisfy $A\\mathbf{v} = \\mathbf{0}$, which is the special case $\\lambda = 0$.', '$A\\mathbf{v} = \\lambda\\mathbf{v}$: the matrix only SCALES $v$ by $\\lambda$, without changing direction. This defines an eigenvector. Correct!', 'Unit vectors have $|\\mathbf{v}| = 1$. Eigenvectors can have any length.'] },
      { q: 'A set of vectors is linearly independent if:', o: ['They span the whole space', 'No vector is a linear combination of the others', 'They are all unit vectors', 'They are all orthogonal'], a: 1,
        why: ['Spanning is a different property. Vectors can span a space without being independent (if there are too many).', 'Linear independence means $c_1\\mathbf{v}_1 + \\cdots + c_n\\mathbf{v}_n = \\mathbf{0}$ only when all $c_i = 0$. No redundancy. Correct!', 'Length doesn\'t matter for independence. $\\mathbf{v}$ and $2\\mathbf{v}$ are both unit-normalizable but dependent.', 'Orthogonal vectors ARE independent, but independence doesn\'t require orthogonality.'] },
      { q: 'The rank of a matrix equals:', o: ['The number of rows', 'The number of pivot positions', 'The determinant', 'The trace'], a: 1,
        why: ['A $5 \\times 3$ matrix can have rank at most 3, not 5. Rank ≤ min(rows, cols).', 'Rank = number of pivots after row reduction = dimension of column space = dimension of row space. Correct!', 'The determinant is a single number, not a count. It can be zero even for a high-rank matrix (only square matrices have determinants).', 'The trace is the sum of diagonal entries. Different concept entirely.'] },
      { q: 'If $\\det(A) = 0$, then $A$ is:', o: ['Invertible', 'Singular (not invertible)', 'Symmetric', 'Diagonal'], a: 1,
        why: ['Invertible matrices have $\\det \\neq 0$. Zero determinant means NOT invertible.', '$\\det = 0$ means the matrix is singular: no inverse exists, columns are dependent, null space is nontrivial. Correct!', 'Symmetry ($A = A^T$) is unrelated to the determinant being zero.', 'Diagonal matrices can have zero determinant (if a diagonal entry is 0), but not all $\\det = 0$ matrices are diagonal.'] },
      { q: 'The dimension of the null space of a $5 \\times 3$ matrix with rank 2 is:', o: ['$1$', '$2$', '$3$', '$5$'], a: 0,
        why: ['Rank-Nullity Theorem: rank + nullity = # columns. $2 + \\text{nullity} = 3 \\Rightarrow \\text{nullity} = 1$. Correct!', 'If rank were 1, nullity would be 2. But rank is 2 here.', 'Nullity = # columns = 3 only when rank = 0 (the zero matrix).', 'Nullity can\'t exceed the number of columns (3), and 5 is the number of rows.'] },
    ],
    'diff-eq': [
      { q: 'The ODE $\\frac{dy}{dx} = ky$ has the general solution:', o: ['$y = kx + C$', '$y = Ce^{kx}$', '$y = \\sin(kx)$', '$y = Cx^k$'], a: 1,
        why: ['$y = kx + C$ solves $y\' = k$ (constant), not $y\' = ky$ (proportional to $y$).', 'Separate: $\\frac{dy}{y} = k\\,dx \\Rightarrow \\ln|y| = kx + C_1 \\Rightarrow y = Ce^{kx}$. Exponential growth/decay! Correct!', '$\\sin(kx)$ solves $y\'\' = -k^2 y$ (second order), not $y\' = ky$.', '$y = Cx^k$ solves $xy\' = ky$ (Euler-type), not $y\' = ky$.'] },
      { q: 'A separable ODE has the form:', o: ['$y\'\' + y = 0$', '$\\frac{dy}{dx} = f(x)g(y)$', '$y\' + P(x)y = Q(x)$', '$y\' = x + y$'], a: 1,
        why: ['This is second-order, not first-order separable.', 'Separable: $\\frac{dy}{g(y)} = f(x)dx$, then integrate both sides. The variables separate! Correct!', 'This is a first-order LINEAR equation (solved with integrating factor), not separable in general.', '$y\' = x + y$ mixes $x$ and $y$ in a sum — you can\'t separate them. (It\'s linear, solved by integrating factor.)'] },
      { q: 'The characteristic equation of $y\'\' - 5y\' + 6y = 0$ is:', o: ['$r^2 + 5r + 6 = 0$', '$r^2 - 5r + 6 = 0$', '$r^2 - 5r - 6 = 0$', '$r^2 + 6r - 5 = 0$'], a: 1,
        why: ['Signs should match the ODE: $y\'\' - 5y\' + 6y$ → $r^2 - 5r + 6$, not $+5$.', 'Replace $y\'\'$ with $r^2$, $y\'$ with $r$, $y$ with $1$: $r^2 - 5r + 6 = 0$. Factors as $(r-2)(r-3) = 0$. Correct!', 'The coefficient of $y$ is $+6$, not $-6$. Copy the signs directly from the ODE.', 'This doesn\'t correspond to any rearrangement of the original coefficients.'] },
      { q: 'If the characteristic roots are $r = 2 \\pm 3i$, the general solution involves:', o: ['$e^{2x}$ and $e^{3x}$', '$e^{2x}\\cos(3x)$ and $e^{2x}\\sin(3x)$', '$e^{3x}\\cos(2x)$', '$\\cos(2x)$ and $\\sin(3x)$'], a: 1,
        why: ['These would be the solutions for real roots $r = 2$ and $r = 3$, not complex $2 \\pm 3i$.', 'Complex roots $\\alpha \\pm \\beta i$ give $e^{\\alpha x}\\cos(\\beta x)$ and $e^{\\alpha x}\\sin(\\beta x)$. Here $\\alpha = 2$, $\\beta = 3$. Correct!', 'The real part ($\\alpha = 2$) goes in the exponential, the imaginary part ($\\beta = 3$) goes in cos/sin. You swapped them.', 'Both trig functions need the same exponential factor $e^{2x}$ in front. They don\'t separate.'] },
      { q: 'An integrating factor for $y\' + P(x)y = Q(x)$ is:', o: ['$e^{P(x)}$', '$e^{\\int P(x)dx}$', '$P(x)$', '$\\int Q(x)dx$'], a: 1,
        why: ['You need the INTEGRAL of $P(x)$, not $P(x)$ itself, in the exponent.', '$\\mu(x) = e^{\\int P(x)dx}$. Multiplying both sides by $\\mu$ makes the left side $(\\mu y)\'$. Correct!', '$P(x)$ alone is just the coefficient, not the integrating factor.', '$\\int Q(x)dx$ involves the right-hand side, not the integrating factor formula.'] },
      { q: 'The equation $y\' = -2y$ with $y(0) = 5$ has solution:', o: ['$y = 5e^{2t}$', '$y = 5e^{-2t}$', '$y = -2e^{5t}$', '$y = 5 - 2t$'], a: 1,
        why: ['$e^{2t}$ means exponential GROWTH, but $k = -2$ means DECAY (negative constant).', 'General solution: $y = Ce^{-2t}$. Initial condition: $y(0) = C = 5$. So $y = 5e^{-2t}$ (exponential decay). Correct!', 'The initial value (5) multiplies the exponential; $-2$ goes in the exponent. You mixed them up.', 'That\'s a linear function, but $y\' = ky$ has exponential solutions, not linear ones.'] },
    ],
    'real-analysis': [
      { q: 'The Completeness Axiom states that every bounded-above nonempty subset of $\\mathbb{R}$ has a:', o: ['Maximum', 'Supremum in $\\mathbb{R}$', 'Limit point', 'Minimum'], a: 1,
        why: ['A maximum must be IN the set, but the supremum might not be. Example: $(0,1)$ has sup $= 1$, but no max.', 'Every nonempty set bounded above has a least upper bound (supremum) that IS a real number. This is what makes $\\mathbb{R}$ complete. Correct!', 'Limit points are related but different — the Bolzano-Weierstrass theorem, not the Completeness Axiom.', 'The axiom is about upper bounds, not lower bounds (though an analogous statement holds for infimum).'] },
      { q: 'A sequence $\\{a_n\\}$ converges to $L$ if for every $\\varepsilon > 0$:', o: ['$|a_n - L| < \\varepsilon$ for all $n$', '$\\exists N$ such that $n \\geq N \\implies |a_n - L| < \\varepsilon$', '$a_n < L + \\varepsilon$', '$|a_n| < \\varepsilon$'], a: 1,
        why: ['Requiring ALL $n$ is too strong — early terms can be far from $L$. Only "eventually" matters.', 'After some index $N$, ALL subsequent terms stay within $\\varepsilon$ of $L$. This captures "eventually stays close." Correct!', 'This only bounds from above and doesn\'t require closeness from below.', 'This says $a_n$ is small, not that it\'s close to $L$. If $L = 100$, this fails.'] },
      { q: 'The Bolzano-Weierstrass Theorem states:', o: ['Every sequence converges', 'Every bounded sequence has a convergent subsequence', 'Every Cauchy sequence converges', 'Every monotone sequence converges'], a: 1,
        why: ['False! $a_n = (-1)^n$ is bounded but doesn\'t converge (it oscillates).', 'Bolzano-Weierstrass: bounded → has a convergent subsequence (even if the sequence itself doesn\'t converge). Correct!', 'That\'s the completeness of $\\mathbb{R}$: Cauchy $\\Leftrightarrow$ convergent.', 'Monotone + bounded → convergent (Monotone Convergence Theorem). Different result, and needs boundedness.'] },
      { q: 'In $\\mathbb{R}$, a sequence is convergent if and only if it is:', o: ['Bounded', 'Monotone', 'Cauchy', 'Increasing'], a: 2,
        why: ['Bounded is necessary but not sufficient. $(-1)^n$ is bounded but not convergent.', 'Monotone alone doesn\'t guarantee convergence — you also need boundedness.', 'In $\\mathbb{R}$, convergent ⟺ Cauchy. This equivalence is a consequence of completeness. (It fails in $\\mathbb{Q}$!) Correct!', 'Increasing sequences only converge if also bounded above.'] },
      { q: '$\\sup\\{1 - 1/n : n \\in \\mathbb{N}\\} = $?', o: ['$0$', '$1$', '$1 - 1/n$', '$\\infty$'], a: 1,
        why: ['$0 = 1 - 1/1$, the smallest element. The sup is the LARGEST bound, not the smallest element.', 'The terms $1 - 1/n$ approach 1 from below but never reach it. $\\sup = 1$ (not attained, not a maximum, but IS the least upper bound). Correct!', '$1 - 1/n$ depends on $n$ — the sup must be a single number, not an expression.', 'The set is bounded above (by 1), so the sup is finite.'] },
      { q: 'A bounded monotone increasing sequence:', o: ['Diverges', 'Converges to its supremum', 'Oscillates', 'Is Cauchy but not convergent'], a: 1,
        why: ['Bounded monotone sequences always converge — the Monotone Convergence Theorem.', 'MCT: bounded + increasing → converges, and the limit equals $\\sup\\{a_n\\}$. Correct!', 'Monotone sequences don\'t oscillate — they go in one direction.', 'In $\\mathbb{R}$, Cauchy = convergent. A bounded monotone sequence is both.'] },
    ],
    'abstract-algebra': [
      { q: 'A group must satisfy all of the following EXCEPT:', o: ['Closure', 'Commutativity', 'Associativity', 'Existence of inverses'], a: 1,
        why: ['Closure IS required: $a, b \\in G \\Rightarrow a \\cdot b \\in G$.', 'Commutativity ($ab = ba$) is NOT required for a general group. Groups with commutativity are called "abelian." Correct!', 'Associativity IS required: $(ab)c = a(bc)$.', 'Inverses ARE required: for every $a$, there exists $a^{-1}$ with $a \\cdot a^{-1} = e$.'] },
      { q: 'The order of $\\mathbb{Z}_6$ is:', o: ['$3$', '$6$', '$12$', '$\\infty$'], a: 1,
        why: ['$\\mathbb{Z}_6$ has 6 elements, not 3. (You might be thinking of $\\mathbb{Z}_3$.)', '$\\mathbb{Z}_6 = \\{0, 1, 2, 3, 4, 5\\}$ has 6 elements, so its order is 6. Correct!', '12 doesn\'t correspond to the structure of $\\mathbb{Z}_6$.', '$\\mathbb{Z}_6$ is finite — it has exactly 6 elements. ($\\mathbb{Z}$ would be infinite.)'] },
      { q: 'Lagrange\'s Theorem says $|H|$ divides $|G|$ when $H$ is a:', o: ['Normal subgroup', 'Subgroup', 'Subset', 'Coset'], a: 1,
        why: ['Normal subgroups DO satisfy this, but the theorem applies to ALL subgroups — normality isn\'t needed.', 'For ANY subgroup $H \\leq G$ of a finite group, $|H|$ divides $|G|$. No extra conditions! Correct!', 'A subset isn\'t necessarily a subgroup. The theorem requires subgroup structure (closure, identity, inverses).', 'A coset isn\'t a subgroup — it\'s a "shifted copy" of a subgroup.'] },
      { q: 'The identity element in $(\\mathbb{Z}, +)$ is:', o: ['$1$', '$0$', '$-1$', 'Does not exist'], a: 1,
        why: ['$1$ is the identity for multiplication ($a \\cdot 1 = a$), not addition.', '$0 + a = a + 0 = a$ for all integers. So $0$ is the additive identity. Correct!', '$-1$ is its own additive inverse, not the identity.', 'It does exist — every group has an identity by definition, and for $(\\mathbb{Z}, +)$ it\'s $0$.'] },
      { q: 'A group where $ab = ba$ for all elements is called:', o: ['Cyclic', 'Simple', 'Abelian', 'Normal'], a: 2,
        why: ['Cyclic means generated by a single element ($G = \\langle g \\rangle$). Cyclic groups happen to be abelian, but the definition is different.', 'Simple means no normal subgroups other than $\\{e\\}$ and $G$.', 'Abelian = commutative ($ab = ba$ for all $a, b$). Named after Niels Henrik Abel. Correct!', 'Normal describes a subgroup property ($gHg^{-1} = H$), not a group property.'] },
    ],
    'probability': [
      { q: 'If $P(A) = 0.3$ and $P(B) = 0.5$ and $A, B$ are independent, then $P(A \\cap B) = $?', o: ['$0.8$', '$0.15$', '$0.2$', '$0.35$'], a: 1,
        why: ['$0.8 = 0.3 + 0.5 = P(A) + P(B)$. That\'s $P(A \\cup B)$ for mutually exclusive events, not $P(A \\cap B)$ for independent events.', 'Independent: $P(A \\cap B) = P(A) \\cdot P(B) = 0.3 \\times 0.5 = 0.15$. Multiply, don\'t add! Correct!', '$0.2 = 0.5 - 0.3$. Subtraction has no role in the independence formula.', '$0.35$ doesn\'t come from any standard probability formula with these values.'] },
      { q: 'For a discrete random variable, $E[X] = $?', o: ['$\\sum x_i$', '$\\sum x_i \\cdot P(x_i)$', '$\\int x f(x) dx$', '$P(X = x)$'], a: 1,
        why: ['Just summing the values ignores their probabilities. Rare outcomes should count less.', '$E[X] = \\sum x_i P(X = x_i)$: each value weighted by its probability. The "average" in the long run. Correct!', 'The integral formula is for CONTINUOUS random variables, not discrete.', '$P(X = x)$ is a single probability, not the expected value.'] },
      { q: 'The Central Limit Theorem says that sample means approach a:', o: ['Uniform distribution', 'Binomial distribution', 'Normal distribution', 'Poisson distribution'], a: 2,
        why: ['The original data might be uniform, but the sample MEANS are approximately normal.', 'Binomial counts successes. The CLT is about averages/sums of any random variables.', 'CLT: $\\bar{X} \\to \\text{Normal}(\\mu, \\sigma/\\sqrt{n})$ as $n \\to \\infty$, regardless of the original distribution. This is why the bell curve appears everywhere! Correct!', 'Poisson models rare events. The CLT gives the normal distribution.'] },
      { q: 'Bayes\' Theorem relates $P(A|B)$ to:', o: ['$P(B|A)$', '$P(A \\cup B)$', '$P(A) + P(B)$', '$1 - P(A)$'], a: 0,
        why: ['$P(A|B) = \\frac{P(B|A) \\cdot P(A)}{P(B)}$. Bayes\' "flips" the conditioning. Correct!', '$P(A \\cup B)$ is the probability of either event. Not related to conditional flipping.', 'Addition of probabilities doesn\'t appear in Bayes\' Theorem.', '$1 - P(A)$ is the complement $P(A^c)$. Not related to Bayes\'.'] },
      { q: '$\\text{Var}(X) = $?', o: ['$E[X]^2$', '$E[X^2] - (E[X])^2$', '$E[X^2]$', '$\\sqrt{E[X]}$'], a: 1,
        why: ['$E[X]^2$ is the square of the mean. Variance subtracts this from $E[X^2]$.', '$\\text{Var}(X) = E[X^2] - (E[X])^2$ — "the mean of the squares minus the square of the mean." Correct!', '$E[X^2]$ is the second moment, not the variance. You need to subtract $(E[X])^2$.', '$\\sqrt{E[X]}$ is not a standard quantity. You\'re thinking of $\\sigma = \\sqrt{\\text{Var}(X)}$.'] },
      { q: 'A Binomial($n, p$) random variable counts:', o: ['Time until first success', 'Number of successes in $n$ trials', 'Number of events in a time period', 'The median value'], a: 1,
        why: ['Time until first success is the Geometric distribution, not Binomial.', 'Binomial: count successes in $n$ independent trials, each with probability $p$. $P(X=k) = \\binom{n}{k}p^k(1-p)^{n-k}$. Correct!', 'Number of events in a time period is the Poisson distribution.', 'The median is a single statistic, not what a random variable "counts."'] },
      { q: 'If $P(A) = 0$, then event $A$ is:', o: ['Certain', 'Impossible (in probability terms)', 'Independent of all events', 'Complementary'], a: 1,
        why: ['Certain means $P(A) = 1$, the opposite of 0.', '$P(A) = 0$ means $A$ (almost surely) never occurs. In finite sample spaces, it\'s impossible. Correct!', 'Technically true (any event with probability 0 is independent of everything), but "impossible" is the primary classification.', 'Complementary refers to the relationship between $A$ and $A^c$, not the probability being 0.'] },
    ],
  };

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

    let html = `<div class="mc-quiz" id="${qid}" data-chapter="${chapterId}">`;
    html += `<div class="mc-quiz-header">`;
    html += `<h4>📝 Quick-Check: Multiple Choice</h4>`;
    html += `<span class="mc-score" id="${qid}-score"></span>`;
    html += `</div>`;
    html += `<p class="mc-instruction">Click your answer for instant feedback.</p>`;

    picked.forEach((q, i) => {
      html += `<div class="mc-question" data-correct="${q.a}" data-idx="${i}">`;
      html += `<div class="mc-q-text"><span class="mc-q-num">${i + 1}.</span> ${q.q}</div>`;
      html += `<div class="mc-options">`;
      q.o.forEach((opt, j) => {
        const whyText = (q.why && q.why[j]) ? q.why[j] : '';
        html += `<button class="mc-option" data-choice="${j}" data-why="${encodeURIComponent(whyText)}"><span class="mc-option-letter">${'ABCD'[j]}</span><span class="mc-option-text">${opt}</span></button>`;
      });
      html += `</div>`;
      html += `<div class="mc-feedback" style="display:none"></div>`;
      html += `</div>`;
    });

    html += `<div class="mc-quiz-footer">`;
    html += `<button class="mc-retry-btn" style="display:none">🔄 Try New Questions</button>`;
    html += `</div>`;
    html += `</div>`;
    return html;
  }

  function attachQuizListeners(container) {
    container.querySelectorAll('.mc-option').forEach(btn => {
      btn.addEventListener('click', function () {
        const question = this.closest('.mc-question');
        if (question.classList.contains('mc-answered')) return;

        question.classList.add('mc-answered');
        const correctIdx = parseInt(question.dataset.correct);
        const chosenIdx = parseInt(this.dataset.choice);
        const isCorrect = chosenIdx === correctIdx;

        const correctBtn = question.querySelector(`.mc-option[data-choice="${correctIdx}"]`);
        correctBtn.classList.add('mc-correct');

        if (!isCorrect) {
          this.classList.add('mc-wrong');
        }

        const feedback = question.querySelector('.mc-feedback');
        const chosenWhy = decodeURIComponent(this.dataset.why || '');
        const correctWhy = decodeURIComponent(correctBtn.dataset.why || '');

        let fbHTML = '';
        if (isCorrect) {
          fbHTML = `<div class="mc-fb-correct"><strong>✓ Correct!</strong> ${correctWhy}</div>`;
        } else {
          fbHTML = `<div class="mc-fb-wrong"><strong>✗ Incorrect.</strong> ${chosenWhy}</div>`;
          fbHTML += `<div class="mc-fb-right"><strong>✓ The answer is ${'ABCD'[correctIdx]}:</strong> ${correctWhy}</div>`;
        }
        feedback.innerHTML = fbHTML;
        feedback.style.display = 'block';

        if (typeof renderMathInElement === 'function') {
          renderMathInElement(feedback, {
            delimiters: [{ left: '$$', right: '$$', display: true }, { left: '$', right: '$', display: false }],
            throwOnError: false
          });
        }

        const quiz = question.closest('.mc-quiz');
        const allQs = quiz.querySelectorAll('.mc-question');
        const answered = quiz.querySelectorAll('.mc-question.mc-answered');
        if (answered.length === allQs.length) {
          let correct = 0;
          allQs.forEach(q => {
            const ci = parseInt(q.dataset.correct);
            const sel = q.querySelector('.mc-option.mc-correct.mc-wrong') ? false :
                        q.querySelector('.mc-option.mc-wrong') ? false : true;
            if (!q.querySelector('.mc-option.mc-wrong')) correct++;
          });
          const scoreEl = quiz.querySelector('.mc-score');
          scoreEl.textContent = `${correct}/${allQs.length}`;
          scoreEl.className = 'mc-score ' + (correct === allQs.length ? 'mc-perfect' : correct >= allQs.length * 0.7 ? 'mc-good' : 'mc-needs-work');
          quiz.querySelector('.mc-retry-btn').style.display = '';
        }
      });
    });

    container.querySelectorAll('.mc-retry-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        const quiz = this.closest('.mc-quiz');
        const chapterId = quiz.dataset.chapter;
        if (Q[chapterId]) {
          const wrapper = quiz.parentElement;
          quiz.remove();
          wrapper.insertAdjacentHTML('beforeend', buildQuizHTML(Q[chapterId], chapterId));
          attachQuizListeners(wrapper);
          const renderKatex = () => {
            if (window.renderMathInElement) {
              wrapper.querySelectorAll('.mc-quiz').forEach(el => {
                window.renderMathInElement(el, {
                  delimiters: [{ left: '$$', right: '$$', display: true }, { left: '$', right: '$', display: false }],
                  throwOnError: false
                });
              });
            }
          };
          setTimeout(renderKatex, 100);
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
            delimiters: [{ left: '$$', right: '$$', display: true }, { left: '$', right: '$', display: false }],
            throwOnError: false
          });
        });
      }
    };
    setTimeout(renderKatex, 300);
    const obs = new MutationObserver(() => { injectQuizzes(); setTimeout(renderKatex, 300); });
    const main = document.querySelector('.main-content') || document.body;
    obs.observe(main, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(initQuizzes, 400));
  } else {
    setTimeout(initQuizzes, 400);
  }
})();
