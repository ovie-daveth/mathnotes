import { memo, useMemo } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import { cn } from "@/lib/utils"

/**
 * remark-math understands $...$ and $$...$$. Notes copied from papers or
 * Overleaf often use \(...\) and \[...\], so convert those first.
 * (?<!\\) avoids touching the `\\[2pt]` row-spacing syntax inside matrices.
 */
export function normalizeMath(src: string): string {
  return src
    .replace(/(?<!\\)\\\[([\s\S]*?)(?<!\\)\\\]/g, (_m, inner: string) => `\n$$\n${inner.trim()}\n$$\n`)
    .replace(/(?<!\\)\\\(([\s\S]*?)(?<!\\)\\\)/g, (_m, inner: string) => `$${inner.trim()}$`)
}

const katexOptions = {
  throwOnError: false,
  strict: false,
  trust: false,
  macros: {
    "\\R": "\\mathbb{R}",
    "\\N": "\\mathbb{N}",
    "\\Z": "\\mathbb{Z}",
    "\\Q": "\\mathbb{Q}",
    "\\C": "\\mathbb{C}",
    "\\dd": "\\,\\mathrm{d}",
  },
}

interface Props {
  source: string
  className?: string
  /** Render without block margins, for flashcards and quiz options. */
  compact?: boolean
}

function MathPreviewImpl({ source, className, compact }: Props) {
  const text = useMemo(() => normalizeMath(source), [source])
  return (
    <div className={cn("math-prose break-words", compact && "[&_p]:my-0", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[[rehypeKatex, katexOptions]]}
      >
        {text}
      </ReactMarkdown>
    </div>
  )
}

export const MathPreview = memo(MathPreviewImpl)
