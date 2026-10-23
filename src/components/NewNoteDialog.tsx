import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Loader2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createNote } from "@/lib/notes"
import { KIND_TEMPLATES } from "@/lib/templates"
import { NOTE_KINDS, type NoteKind } from "@/lib/types"

export function NewNoteDialog({ subjects }: { subjects: string[] }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [subject, setSubject] = useState("")
  const [kind, setKind] = useState<NoteKind>("lecture")
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
      const finalTitle = title.trim() || "Untitled note"
      // Swap the template's placeholder heading for the chosen title.
      const content = KIND_TEMPLATES[kind].replace(/^# .*$/m, `# ${finalTitle}`)
      const note = await createNote({ title: finalTitle, kind, subject: subject.trim(), content })
      setOpen(false)
      navigate(`/note/${note.id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create the note")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus /> New note
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={submit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>New note</DialogTitle>
            <DialogDescription>Pick a type to start from a matching template.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="new-title">Title</Label>
            <Input
              id="new-title"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Integration by parts"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-subject">Subject</Label>
            <Input
              id="new-subject"
              list="subject-options"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Calculus II"
            />
            <datalist id="subject-options">
              {subjects.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={kind} onValueChange={(v) => setKind(v as NoteKind)}>
              <SelectTrigger className="w-full">
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
          </div>
          <DialogFooter>
            <Button type="submit" disabled={busy}>
              {busy && <Loader2 className="animate-spin" />} Create note
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
