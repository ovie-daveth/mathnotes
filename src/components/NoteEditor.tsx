import { useCallback, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import {
  ArrowLeft,
  CheckCircle2,
  Columns2,
  Eye,
  GraduationCap,
  Loader2,
  PenLine,
  Save,
  TriangleAlert,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MathPreview } from "@/components/MathPreview"
import { MathToolbar, type FormatAction } from "@/components/MathToolbar"
import { StudyPanel } from "@/components/StudyPanel"
import { updateNote } from "@/lib/notes"
import { applySnippet, prefixLines, wrapSelection, type InsertResult } from "@/lib/insert"
import type { Snippet } from "@/lib/snippets"
import { NOTE_KINDS, type Note, type NoteKind } from "@/lib/types"
import { cn } from "@/lib/utils"

type ViewMode = "write" | "split" | "preview"
type SaveStatus = "saved" | "dirty" | "saving" | "error"

interface Draft {
  title: string
  content: string
  kind: NoteKind
  subject: string
  tags: string
}

const parseTags = (raw: string) =>
  Array.from(new Set(raw.split(",").map((t) => t.trim()).filter(Boolean)))

const toDraft = (note: Note): Draft => ({
  title: note.title,
  content: note.content,
  kind: note.kind,
  subject: note.subject,
  tags: note.tags.join(", "),
})

export function NoteEditor({ note }: { note: Note }) {
  const [draft, setDraft] = useState<Draft>(() => toDraft(note))
  const [status, setStatus] = useState<SaveStatus>("saved")
  const [view, setView] = useState<ViewMode>("split")
  const [tab, setTab] = useState<"edit" | "study">("edit")

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const draftRef = useRef(draft)
  draftRef.current = draft
  const lastSaved = useRef(JSON.stringify(toDraft(note)))
  const inFlight = useRef<Promise<boolean> | null>(null)
  const saveRef = useRef<() => Promise<boolean>>(async () => true)

  const save = useCallback(async (): Promise<boolean> => {
    // If a save is already running, wait for it, then save anything newer.
    if (inFlight.current) {
      await inFlight.current
      return saveRef.current()
    }
    const d = draftRef.current
    const snapshot = JSON.stringify(d)
    if (snapshot === lastSaved.current) {
      setStatus("saved")
      return true
    }

    const run = (async () => {
      setStatus("saving")
      try {
        await updateNote(note.id, {
          title: d.title.trim() || "Untitled note",
          content: d.content,
          kind: d.kind,
          subject: d.subject.trim(),
          tags: parseTags(d.tags),
        })
        lastSaved.current = snapshot
        setStatus(JSON.stringify(draftRef.current) !== snapshot ? "dirty" : "saved")
        return true
      } catch (e) {
        setStatus("error")
        toast.error(e instanceof Error ? e.message : "Could not save the note")
        return false
      }
    })()

    inFlight.current = run
    const ok = await run
    inFlight.current = null
    return ok
  }, [note.id])

  saveRef.current = save

  // Debounced autosave.
  useEffect(() => {
    if (JSON.stringify(draft) === lastSaved.current) return
    setStatus((s) => (s === "saving" ? s : "dirty"))
    const timer = setTimeout(() => void saveRef.current(), 1500)
    return () => clearTimeout(timer)
  }, [draft])

  // Flush on unmount and warn before closing the tab with unsaved changes.
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (JSON.stringify(draftRef.current) !== lastSaved.current) {
        e.preventDefault()
        e.returnValue = ""
      }
    }
    window.addEventListener("beforeunload", onBeforeUnload)
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload)
      void saveRef.current()
    }
  }, [])

  const patch = (p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p }))

  const commit = (result: InsertResult) => {
    patch({ content: result.value })
    requestAnimationFrame(() => {
      const ta = textareaRef.current
      if (!ta) return
      ta.focus()
      ta.setSelectionRange(result.selectionStart, result.selectionEnd)
    })
  }

  const withSelection = (fn: (value: string, start: number, end: number) => InsertResult) => {
    const ta = textareaRef.current
    const start = ta?.selectionStart ?? draftRef.current.content.length
    const end = ta?.selectionEnd ?? start
    commit(fn(draftRef.current.content, start, end))
  }

  const insertSnippet = (snippet: Snippet) =>
    withSelection((value, start, end) => applySnippet(value, start, end, snippet))

  const format = (action: FormatAction) => {
    withSelection((value, start, end) => {
      switch (action) {
        case "bold":
          return wrapSelection(value, start, end, "**")
        case "italic":
          return wrapSelection(value, start, end, "*")
        case "heading":
          return prefixLines(value, start, end, "## ")
        case "bullet":
          return prefixLines(value, start, end, "- ")
        case "numbered":
          return prefixLines(value, start, end, "1. ")
        case "quote":
          return prefixLines(value, start, end, "> ")
      }
    })
  }

  const onKeyDown = (e: ReactKeyboardEvent) => {
    const mod = e.metaKey || e.ctrlKey
    if (!mod) return
    const key = e.key.toLowerCase()
    if (key === "s") {
      e.preventDefault()
      void save()
      return
    }
    // Formatting shortcuts only apply while typing in the note body.
    if (e.target !== textareaRef.current) return
    if (key === "b") {
      e.preventDefault()
      format("bold")
    } else if (key === "i") {
      e.preventDefault()
      format("italic")
    } else if (key === "m") {
      e.preventDefault()
      insertSnippet(
        e.shiftKey
          ? { id: "k-block", title: "", latex: "§", kind: "block", force: true }
          : { id: "k-inline", title: "", latex: "§", kind: "inline", force: true },
      )
    }
  }

  const statusView = {
    saved: { icon: CheckCircle2, text: "Saved", cls: "text-emerald-600 dark:text-emerald-400" },
    dirty: { icon: PenLine, text: "Unsaved changes", cls: "text-muted-foreground" },
    saving: { icon: Loader2, text: "Saving…", cls: "text-muted-foreground" },
    error: { icon: TriangleAlert, text: "Not saved", cls: "text-destructive" },
  }[status]
  const StatusIcon = statusView.icon

  const showWrite = view !== "preview"
  const showPreview = view !== "write"

  return (
    <div className="space-y-4" onKeyDown={onKeyDown}>
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild variant="ghost" size="icon" title="Back to notes">
          <Link to="/">
            <ArrowLeft />
          </Link>
        </Button>
        <Input
          value={draft.title}
          onChange={(e) => patch({ title: e.target.value })}
          placeholder="Note title"
          aria-label="Note title"
          className="h-11 min-w-48 flex-1 border-transparent px-2 text-xl font-semibold shadow-none hover:border-input"
        />
        <span className={cn("flex items-center gap-1.5 text-sm", statusView.cls)}>
          <StatusIcon className={cn("size-4", status === "saving" && "animate-spin")} />
          {statusView.text}
        </span>
        <Button variant="outline" size="sm" onClick={() => void save()} disabled={status === "saving"}>
          <Save /> Save
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select value={draft.kind} onValueChange={(v) => patch({ kind: v as NoteKind })}>
          <SelectTrigger className="w-44" aria-label="Note type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {NOTE_KINDS.map((k) => (
              <SelectItem key={k.value} value={k.value}>
                {k.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          value={draft.subject}
          onChange={(e) => patch({ subject: e.target.value })}
          placeholder="Subject (e.g. Calculus II)"
          aria-label="Subject"
          className="w-56"
        />
        <Input
          value={draft.tags}
          onChange={(e) => patch({ tags: e.target.value })}
          placeholder="Tags, comma separated"
          aria-label="Tags"
          className="min-w-48 flex-1"
        />
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as "edit" | "study")}>
        <TabsList>
          <TabsTrigger value="edit">
            <PenLine /> Notes
          </TabsTrigger>
          <TabsTrigger value="study">
            <GraduationCap /> Study
          </TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="space-y-3 pt-2">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <MathToolbar onSnippet={insertSnippet} onFormat={format} />
            </div>
            <div className="flex shrink-0 rounded-lg bg-muted p-[3px]">
              {(
                [
                  ["write", PenLine, "Write"],
                  ["split", Columns2, "Split"],
                  ["preview", Eye, "Preview"],
                ] as const
              ).map(([mode, Icon, label]) => (
                <Button
                  key={mode}
                  type="button"
                  variant={view === mode ? "secondary" : "ghost"}
                  size="icon-sm"
                  title={label}
                  aria-pressed={view === mode}
                  onClick={() => setView(mode)}
                  className={view === mode ? "bg-background shadow-sm" : ""}
                >
                  <Icon />
                </Button>
              ))}
            </div>
          </div>

          <div className={cn("grid gap-4", view === "split" && "lg:grid-cols-2")}>
            {showWrite && (
              <Textarea
                ref={textareaRef}
                value={draft.content}
                onChange={(e) => patch({ content: e.target.value })}
                spellCheck
                placeholder="Start writing. Use $x^2$ for inline math and $$ ... $$ for display equations."
                aria-label="Note content"
                className="min-h-[65vh] resize-y font-mono text-[0.95rem] leading-relaxed"
              />
            )}
            {showPreview && (
              <div className="min-h-[65vh] overflow-auto rounded-md border bg-card p-5">
                {draft.content.trim() ? (
                  <MathPreview source={draft.content} />
                ) : (
                  <p className="text-sm text-muted-foreground">Nothing to preview yet.</p>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="study" className="pt-2">
          <StudyPanel noteId={note.id} saveBeforeGenerate={save} hasUnsaved={status !== "saved"} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
