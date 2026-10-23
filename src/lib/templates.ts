import type { NoteKind } from "@/lib/types"

// Starting content for each kind of note.
export const KIND_TEMPLATES: Record<NoteKind, string> = {
  lecture: String.raw`# Lecture title

**Date:**  **Topic:**

## Key ideas

-

## Definitions

> **Definition.**

## Worked example

$$
\int_{0}^{1} x^2 \, dx = \left[\frac{x^3}{3}\right]_0^1 = \frac{1}{3}
$$

## Questions to revisit

-
`,
  formula_sheet: String.raw`# Formula sheet

## Derivatives

| Function | Derivative |
|---|---|
| $x^n$ | $n x^{n-1}$ |
| $e^x$ | $e^x$ |
| $\ln x$ | $\dfrac{1}{x}$ |
| $\sin x$ | $\cos x$ |

## Integrals

$$
\int x^n \, dx = \frac{x^{n+1}}{n+1} + C \quad (n \neq -1)
$$
`,
  problem_set: String.raw`# Problem set

## Problem 1

*Statement:*

**Solution.**

$$

$$

## Problem 2

*Statement:*

**Solution.**
`,
  proof: String.raw`# Proof

> **Theorem.**

> *Proof.* Let ... Then ... $\blacksquare$
`,
  definition: String.raw`# Definitions

> **Definition.** A ... is ...

**Notation:** $$ $$

**Examples:**

-

**Non-examples:**

-
`,
  summary: String.raw`# Chapter summary

## Main results

> **Theorem.**

## Key formulas

$$

$$

## Common mistakes

-
`,
  scratch: String.raw`# Scratchpad

`,
}
