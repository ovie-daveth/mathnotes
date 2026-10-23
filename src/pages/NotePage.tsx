import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NoteEditor } from "@/components/NoteEditor"
import { getNote } from "@/lib/notes"
import type { Note } from "@/lib/types"

export function NotePage() {
  const { id } = useParams<{ id: string }>()
  const [note, setNote] = useState<Note | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setNote(null)
    setError(null)
    getNote(id)
      .then((n) => !cancelled && setNote(n))
      .catch(() => !cancelled && setError("We couldn't find that note."))
    return () => {
      cancelled = true
    }
  }, [id])

  if (error) {
    return (
      <div className="space-y-4 py-12 text-center">
        <p className="text-muted-foreground">{error}</p>
        <Button asChild variant="outline">
          <Link to="/">Back to notes</Link>
        </Button>
      </div>
    )
  }

  if (!note) {
    return (
      <div className="flex items-center gap-2 py-12 text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Opening note…
      </div>
    )
  }

  // key resets the editor's draft state when navigating between notes.
  return <NoteEditor key={note.id} note={note} />
}
