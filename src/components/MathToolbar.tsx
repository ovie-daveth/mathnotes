import { useMemo, useState } from "react"
import katex from "katex"
import { Bold, Heading2, Italic, List, ListOrdered, Quote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SNIPPET_GROUPS, WRAP_BLOCK, WRAP_INLINE, type Snippet } from "@/lib/snippets"
import { cn } from "@/lib/utils"

export type FormatAction = "bold" | "italic" | "heading" | "bullet" | "numbered" | "quote"

interface Props {
  onSnippet: (snippet: Snippet) => void
  onFormat: (action: FormatAction) => void
}

function renderPreview(latex: string) {
  try {
    return katex.renderToString(latex, { throwOnError: false, strict: false, displayMode: false })
  } catch {
    return latex
  }
}

function SnippetButton({ snippet, onClick }: { snippet: Snippet; onClick: () => void }) {
  const html = useMemo(
    () => (snippet.label ? null : renderPreview(snippet.preview ?? snippet.latex)),
    [snippet],
  )
  return (
    <button
      type="button"
      title={snippet.title}
      // Keep focus (and the selection) in the textarea.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="flex h-8 min-w-8 items-center justify-center rounded-md border bg-background px-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      {html ? <span dangerouslySetInnerHTML={{ __html: html }} /> : <span>{snippet.label}</span>}
    </button>
  )
}

const FORMAT_BUTTONS: { action: FormatAction; icon: typeof Bold; title: string }[] = [
  { action: "bold", icon: Bold, title: "Bold (Ctrl+B)" },
  { action: "italic", icon: Italic, title: "Italic (Ctrl+I)" },
  { action: "heading", icon: Heading2, title: "Heading" },
  { action: "bullet", icon: List, title: "Bulleted list" },
  { action: "numbered", icon: ListOrdered, title: "Numbered list" },
  { action: "quote", icon: Quote, title: "Quote" },
]

export function MathToolbar({ onSnippet, onFormat }: Props) {
  const [groupId, setGroupId] = useState(SNIPPET_GROUPS[0].id)
  const group = SNIPPET_GROUPS.find((g) => g.id === groupId) ?? SNIPPET_GROUPS[0]

  return (
    <div className="space-y-2 rounded-lg border bg-card p-2">
      <div className="flex flex-wrap items-center gap-1">
        {FORMAT_BUTTONS.map(({ action, icon: Icon, title }) => (
          <Button
            key={action}
            type="button"
            variant="ghost"
            size="icon-sm"
            title={title}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onFormat(action)}
          >
            <Icon />
          </Button>
        ))}
        <span className="mx-1 h-5 w-px bg-border" />
        <SnippetButton snippet={WRAP_INLINE} onClick={() => onSnippet(WRAP_INLINE)} />
        <SnippetButton snippet={WRAP_BLOCK} onClick={() => onSnippet(WRAP_BLOCK)} />
        <span className="ml-auto hidden text-xs text-muted-foreground lg:inline">
          Ctrl+M inline math · Ctrl+Shift+M display math · Ctrl+S save
        </span>
      </div>

      <div className="flex flex-wrap gap-1">
        {SNIPPET_GROUPS.map((g) => (
          <button
            key={g.id}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setGroupId(g.id)}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              g.id === groupId
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            {g.label}
          </button>
        ))}
      </div>

      <div className="flex max-h-28 flex-wrap gap-1 overflow-y-auto">
        {group.snippets.map((sn) => (
          <SnippetButton key={sn.id} snippet={sn} onClick={() => onSnippet(sn)} />
        ))}
      </div>
    </div>
  )
}
