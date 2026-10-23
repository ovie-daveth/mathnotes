import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { FileText, Loader2, Pin, PinOff, Search, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { NewNoteDialog } from "@/components/NewNoteDialog"
import { deleteNote, listNotes, updateNote } from "@/lib/notes"
import { NOTE_KINDS, kindLabel, type Note } from "@/lib/types"

/** Plain-text snippet for the card, with markdown and LaTeX noise trimmed. */
function snippet(content: string) {
  return content
    .replace(/^#+\s.*$/m, "")
    .replace(/\$\$[\s\S]*?\$\$/g, " [equation] ")
    .replace(/[#>*_`|]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 140)
}

const ALL = "all"

export function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [kind, setKind] = useState(ALL)
  const [subject, setSubject] = useState(ALL)

  useEffect(() => {
    listNotes()
      .then(setNotes)
      .catch((e) => toast.error(e instanceof Error ? e.message : "Could not load notes"))
      .finally(() => setLoading(false))
  }, [])

  const subjects = useMemo(
    () => Array.from(new Set(notes.map((n) => n.subject).filter(Boolean))).sort(),
    [notes],
  )

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return notes.filter((n) => {
      if (kind !== ALL && n.kind !== kind) return false
      if (subject !== ALL && n.subject !== subject) return false
      if (!q) return true
      return (
        n.title.toLowerCase().includes(q) ||
        n.subject.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.tags.some((t) => t.toLowerCase().includes(q))
      )
    })
  }, [notes, query, kind, subject])

  const togglePin = async (note: Note) => {
    try {
      const updated = await updateNote(note.id, { pinned: !note.pinned })
      setNotes((list) =>
        [...list.map((n) => (n.id === note.id ? updated : n))].sort(
          (a, b) =>
            Number(b.pinned) - Number(a.pinned) ||
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
        ),
      )
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update the note")
    }
  }

  const remove = async (note: Note) => {
    if (!window.confirm(`Delete "${note.title}"? Its study material is deleted too.`)) return
    try {
      await deleteNote(note.id)
      setNotes((list) => list.filter((n) => n.id !== note.id))
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not delete the note")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="mr-auto text-2xl font-bold">Your notes</h1>
        <NewNoteDialog subjects={subjects} />
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search titles, content and tags"
            aria-label="Search notes"
            className="pl-9"
          />
        </div>
        <Select value={kind} onValueChange={setKind}>
          <SelectTrigger className="w-44" aria-label="Filter by type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All types</SelectItem>
            {NOTE_KINDS.map((k) => (
              <SelectItem key={k.value} value={k.value}>
                {k.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={subject} onValueChange={setSubject}>
          <SelectTrigger className="w-44" aria-label="Filter by subject">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All subjects</SelectItem>
            {subjects.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-12 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading notes…
        </div>
      ) : notes.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <FileText className="size-8 text-muted-foreground" />
          <p className="font-medium">No notes yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Create your first note to start writing equations, then turn it into flashcards and quizzes.
          </p>
          <NewNoteDialog subjects={subjects} />
        </div>
      ) : visible.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">No notes match your filters.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((note) => (
            <Card key={note.id} className="group relative transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-start gap-2">
                  <Link
                    to={`/note/${note.id}`}
                    className="line-clamp-2 flex-1 after:absolute after:inset-0 after:content-['']"
                  >
                    {note.title}
                  </Link>
                  {note.pinned && <Pin className="size-4 shrink-0 text-primary" />}
                </CardTitle>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="secondary">{kindLabel(note.kind)}</Badge>
                  {note.subject && <Badge variant="outline">{note.subject}</Badge>}
                  {note.tags.slice(0, 3).map((t) => (
                    <Badge key={t} variant="outline">
                      #{t}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="line-clamp-3 text-sm text-muted-foreground">
                  {snippet(note.content) || "Empty note"}
                </p>
              </CardContent>
              <CardContent className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Edited {new Date(note.updated_at).toLocaleDateString()}
                </span>
                <div className="relative z-10 flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    title={note.pinned ? "Unpin" : "Pin"}
                    aria-label={note.pinned ? "Unpin note" : "Pin note"}
                    onClick={() => void togglePin(note)}
                  >
                    {note.pinned ? <PinOff /> : <Pin />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    title="Delete"
                    aria-label="Delete note"
                    onClick={() => void remove(note)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
