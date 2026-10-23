// Snippet palette for the math toolbar.
//
// `§` marks where the caret lands (or where the current selection is placed).
// kind "inline": wrapped in $...$ when the caret is outside math, raw when inside.
// kind "block":  wrapped in $$...$$ when outside math, raw when inside.
// kind "raw":    always inserted exactly as written (used for text blocks).
// force:         wrap even when the caret is already inside math.

export type SnippetKind = "inline" | "block" | "raw"

export interface Snippet {
  id: string
  title: string
  latex: string
  /** LaTeX rendered on the button. Falls back to `label`. */
  preview?: string
  label?: string
  kind?: SnippetKind
  force?: boolean
}

export interface SnippetGroup {
  id: string
  label: string
  snippets: Snippet[]
}

const s = (
  id: string,
  title: string,
  latex: string,
  preview?: string,
  extra: Partial<Snippet> = {},
): Snippet => ({ id, title, latex, preview: preview ?? latex.replace("§", ""), ...extra })

export const WRAP_INLINE: Snippet = {
  id: "wrap-inline",
  title: "Inline math  ($ … $)",
  latex: "§",
  label: "$ x $",
  kind: "inline",
  force: true,
}

export const WRAP_BLOCK: Snippet = {
  id: "wrap-block",
  title: "Display math  ($$ … $$)",
  latex: "§",
  label: "$$ x $$",
  kind: "block",
  force: true,
}

export const SNIPPET_GROUPS: SnippetGroup[] = [
  {
    id: "structure",
    label: "Structure",
    snippets: [
      s("frac", "Fraction", String.raw`\frac{§}{}`, String.raw`\frac{a}{b}`),
      s("sqrt", "Square root", String.raw`\sqrt{§}`, String.raw`\sqrt{x}`),
      s("nroot", "nth root", String.raw`\sqrt[n]{§}`, String.raw`\sqrt[n]{x}`),
      s("sup", "Superscript", String.raw`^{§}`, String.raw`x^{n}`),
      s("sub", "Subscript", String.raw`_{§}`, String.raw`x_{n}`),
      s("abs", "Absolute value", String.raw`\left| § \right|`, String.raw`\left|x\right|`),
      s("paren", "Auto-sized parentheses", String.raw`\left( § \right)`, String.raw`\left(x\right)`),
      s("binom", "Binomial", String.raw`\binom{n}{§}`, String.raw`\binom{n}{k}`),
      s("vec", "Vector", String.raw`\vec{§}`, String.raw`\vec{v}`),
      s("hat", "Hat", String.raw`\hat{§}`, String.raw`\hat{x}`),
      s("bar", "Overline", String.raw`\overline{§}`, String.raw`\overline{x}`),
      s("text", "Text inside math", String.raw`\text{§}`, String.raw`\text{if }`),
    ],
  },
  {
    id: "calculus",
    label: "Calculus",
    snippets: [
      s("deriv", "Derivative", String.raw`\frac{d}{dx}\left(§\right)`, String.raw`\frac{d}{dx}`),
      s("deriv2", "Second derivative", String.raw`\frac{d^{2}}{dx^{2}}§`, String.raw`\frac{d^2}{dx^2}`),
      s("partial", "Partial derivative", String.raw`\frac{\partial §}{\partial x}`, String.raw`\frac{\partial f}{\partial x}`),
      s("int", "Indefinite integral", String.raw`\int § \, dx`, String.raw`\int f\,dx`),
      s("dint", "Definite integral", String.raw`\int_{a}^{b} § \, dx`, String.raw`\int_a^b`),
      s("iint", "Double integral", String.raw`\iint_{D} § \, dA`, String.raw`\iint_D`, { kind: "block" }),
      s("iiint", "Triple integral", String.raw`\iiint_{E} § \, dV`, String.raw`\iiint_E`, { kind: "block" }),
      s("oint", "Line integral", String.raw`\oint_{C} § \cdot d\mathbf{r}`, String.raw`\oint_C`),
      s("eval", "Evaluate between limits", String.raw`\left. § \right|_{a}^{b}`, String.raw`\Big|_a^b`),
      s("lim", "Limit", String.raw`\lim_{x \to §} `, String.raw`\lim_{x\to a}`),
      s("limsup", "Limit at infinity", String.raw`\lim_{n \to \infty} §`, String.raw`\lim_{n\to\infty}`),
      s("sum", "Summation", String.raw`\sum_{n=1}^{\infty} §`, String.raw`\sum_{n=1}^{\infty}`),
      s("prod", "Product", String.raw`\prod_{i=1}^{n} §`, String.raw`\prod_{i=1}^{n}`),
      s("nabla", "Gradient", String.raw`\nabla §`, String.raw`\nabla f`),
      s("div", "Divergence", String.raw`\nabla \cdot §`, String.raw`\nabla\cdot\mathbf{F}`),
      s("curl", "Curl", String.raw`\nabla \times §`, String.raw`\nabla\times\mathbf{F}`),
      s("inf", "Infinity", String.raw`\infty`),
    ],
  },
  {
    id: "algebra",
    label: "Matrices & systems",
    snippets: [
      s(
        "matrix",
        "2×2 matrix",
        String.raw`\begin{bmatrix} § & \\ & \end{bmatrix}`,
        String.raw`\begin{bmatrix}a&b\\c&d\end{bmatrix}`,
        { kind: "block" },
      ),
      s(
        "matrix3",
        "3×3 matrix",
        String.raw`\begin{bmatrix} § & & \\ & & \\ & & \end{bmatrix}`,
        String.raw`\begin{bmatrix}a&b&c\\d&e&f\\g&h&i\end{bmatrix}`,
        { kind: "block" },
      ),
      s(
        "det",
        "Determinant",
        String.raw`\begin{vmatrix} § & \\ & \end{vmatrix}`,
        String.raw`\begin{vmatrix}a&b\\c&d\end{vmatrix}`,
        { kind: "block" },
      ),
      s(
        "cases",
        "Piecewise function",
        String.raw`f(x) = \begin{cases} § & x \ge 0 \\ & x < 0 \end{cases}`,
        String.raw`\begin{cases}a&x\ge0\\b&x<0\end{cases}`,
        { kind: "block" },
      ),
      s(
        "aligned",
        "Aligned equations",
        String.raw`\begin{aligned} § &= \\ &= \end{aligned}`,
        String.raw`\begin{aligned}a&=b\\&=c\end{aligned}`,
        { kind: "block" },
      ),
      s(
        "system",
        "System of equations",
        String.raw`\begin{cases} § \\ \end{cases}`,
        String.raw`\begin{cases}x+y=1\\x-y=0\end{cases}`,
        { kind: "block" },
      ),
      s("transpose", "Transpose", String.raw`§^{\mathsf{T}}`, String.raw`A^{\mathsf{T}}`),
      s("inverse", "Inverse", String.raw`§^{-1}`, String.raw`A^{-1}`),
      s("norm", "Norm", String.raw`\left\lVert § \right\rVert`, String.raw`\left\lVert v\right\rVert`),
      s("inner", "Inner product", String.raw`\langle §, \rangle`, String.raw`\langle u,v\rangle`),
    ],
  },
  {
    id: "greek",
    label: "Greek",
    snippets: [
      ["alpha", "α"], ["beta", "β"], ["gamma", "γ"], ["delta", "δ"], ["epsilon", "ε"],
      ["varepsilon", "ϵ"], ["zeta", "ζ"], ["eta", "η"], ["theta", "θ"], ["lambda", "λ"],
      ["mu", "μ"], ["nu", "ν"], ["xi", "ξ"], ["pi", "π"], ["rho", "ρ"],
      ["sigma", "σ"], ["tau", "τ"], ["phi", "φ"], ["varphi", "ϕ"], ["chi", "χ"],
      ["psi", "ψ"], ["omega", "ω"], ["Gamma", "Γ"], ["Delta", "Δ"], ["Theta", "Θ"],
      ["Lambda", "Λ"], ["Pi", "Π"], ["Sigma", "Σ"], ["Phi", "Φ"], ["Psi", "Ψ"],
      ["Omega", "Ω"],
    ].map(([name, glyph]) => s(`g-${name}`, name, `\\${name}`, `\\${name}`, { label: glyph })),
  },
  {
    id: "symbols",
    label: "Symbols",
    snippets: [
      s("leq", "Less than or equal", String.raw`\leq`),
      s("geq", "Greater than or equal", String.raw`\geq`),
      s("neq", "Not equal", String.raw`\neq`),
      s("approx", "Approximately", String.raw`\approx`),
      s("equiv", "Equivalent", String.raw`\equiv`),
      s("pm", "Plus or minus", String.raw`\pm`),
      s("times", "Times", String.raw`\times`),
      s("cdot", "Dot", String.raw`\cdot`),
      s("to", "Arrow", String.raw`\to`),
      s("mapsto", "Maps to", String.raw`\mapsto`),
      s("implies", "Implies", String.raw`\Rightarrow`),
      s("iff", "If and only if", String.raw`\iff`),
      s("in", "Element of", String.raw`\in`),
      s("notin", "Not element of", String.raw`\notin`),
      s("subset", "Subset", String.raw`\subset`),
      s("subseteq", "Subset or equal", String.raw`\subseteq`),
      s("cup", "Union", String.raw`\cup`),
      s("cap", "Intersection", String.raw`\cap`),
      s("forall", "For all", String.raw`\forall`),
      s("exists", "There exists", String.raw`\exists`),
      s("empty", "Empty set", String.raw`\emptyset`),
      s("R", "Real numbers", String.raw`\mathbb{R}`),
      s("N", "Natural numbers", String.raw`\mathbb{N}`),
      s("Z", "Integers", String.raw`\mathbb{Z}`),
      s("Q", "Rationals", String.raw`\mathbb{Q}`),
      s("C", "Complex numbers", String.raw`\mathbb{C}`),
      s("ldots", "Ellipsis", String.raw`\ldots`),
      s("therefore", "Therefore", String.raw`\therefore`),
      s("square", "End of proof", String.raw`\blacksquare`),
    ],
  },
  {
    id: "blocks",
    label: "Theorem blocks",
    snippets: [
      ["Theorem", "Theorem."], ["Lemma", "Lemma."], ["Definition", "Definition."],
      ["Proposition", "Proposition."], ["Corollary", "Corollary."], ["Example", "Example."],
      ["Remark", "Remark."],
    ].map(([name]) => ({
      id: `b-${name}`,
      title: name,
      latex: `\n> **${name}.** §\n`,
      label: name,
      kind: "raw" as const,
    })).concat([
      {
        id: "b-Proof",
        title: "Proof",
        latex: "\n> *Proof.* § $\\blacksquare$\n",
        label: "Proof",
        kind: "raw" as const,
      },
    ]),
  },
]
