import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { BookOpen, FileText, Layers, ListChecks, Loader2, Sparkles, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Flashcards } from "@/components/Flashcards"
import { Quiz } from "@/components/Quiz"
import { MathPreview } from "@/components/MathPreview"
import { deleteStudyMaterial, generateStudyMaterial, listStudyMaterials } from "@/lib/notes"
import type { StudyMaterial, StudyType } from "@/lib/types"

const OPTIONS: { type: StudyType; label: string; description: string; icon: typeof Layers }[] = [
  { type: "flashcards", label: "Flashcards", description: "Definitions, formulas and key ideas as flip cards.", icon: Layers },
  { type: "quiz", label: "Quiz", description: "Multiple-choice questions with worked explanations.", icon: ListChecks },
  { type: "summary", label: "Summary", description: "A short revision sheet of the essentials.", icon: FileText },
]

const typeLabel = (t: StudyType) => OPTIONS.find((o) => o.type === t)?.label ?? t

function itemCount(m: StudyMaterial) {
  if (m.type === "flashcards") return `${m.data.cards?.length ?? 0} cards`
  if (m.type === "quiz") return `${m.data.questions?.length ?? 0} questions`
  return "Summary"
}

interface Props {
  noteId: string
  saveBeforeGenerate: () => Promise<boolean>
  hasUnsaved: boolean
}

export function StudyPanel({ noteId, saveBeforeGenerate, hasUnsaved }: Props) {
  const [materials, setMaterials] = useState<StudyMaterial[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<StudyType | null>(null)
  const [count, setCount] = useState("10")
  const [open, setOpen] = useState<StudyMaterial | null>(null)

  const refresh = useCallback(async () => {
    try {
      setMaterials(await listStudyMaterials(noteId))
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not load study material")
    } finally {
      setLoading(false)
    }
  }, [noteId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const generate = async (type: StudyType) => {
    setGenerating(type)
    try {
      // The AI reads the saved copy of the note, so make sure it is current.
      const saved = await saveBeforeGenerate()
      if (!saved) return
      const material = await generateStudyMaterial(noteId, type, Number(count))
      setMaterials((m) => [material, ...m])
      setOpen(material)
      toast.success(`${typeLabel(type)} ready`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed")
    } finally {
      setGenerating(null)
    }
  }

  const remove = async (m: StudyMaterial) => {
    if (!window.confirm(`Delete "${m.title}"?`)) return
    try {
      await deleteStudyMaterial(m.id)
      setMaterials((list) => list.filter((x) => x.id !== m.id))
      if (open?.id === m.id) setOpen(null)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not delete")
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" /> Generate study material
          </CardTitle>
          <CardDescription>
            An AI model reads this note and builds practice material from it.
            {hasUnsaved && " Your latest edits are saved automatically first."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Items per set</span>
            <Select value={count} onValueChange={setCount}>
              <SelectTrigger className="w-20" aria-label="Items per set">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["5", "10", "15", "20"].map((n) => (
                  <SelectItem key={n} value={n}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {OPTIONS.map(({ type, label, description, icon: Icon }) => (
              <button
                key={type}
                type="button"
                disabled={generating !== null}
                onClick={() => void generate(type)}
                className="flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
              >
                {generating === type ? (
                  <Loader2 className="size-5 animate-spin text-primary" />
                ) : (
                  <Icon className="size-5 text-primary" />
                )}
                <span className="font-medium">{label}</span>
                <span className="text-xs text-muted-foreground">{description}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h3 className="flex items-center gap-2 font-semibold">
          <BookOpen className="size-4" /> Saved study sets
        </h3>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : materials.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nothing yet. Generate flashcards, a quiz or a summary above and it will be kept here.
          </p>
        ) : (
          <ul className="space-y-2">
            {materials.map((m) => (
              <li key={m.id} className="flex items-center gap-3 rounded-lg border bg-card p-3">
                <Badge variant="secondary">{typeLabel(m.type)}</Badge>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{m.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {itemCount(m)} · {new Date(m.created_at).toLocaleString()}
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => setOpen(m)}>
                  Open
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  title="Delete"
                  aria-label={`Delete ${m.title}`}
                  onClick={() => void remove(m)}
                >
                  <Trash2 />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={open !== null} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="sm:max-w-3xl">
          {open && (
            <>
              <DialogHeader>
                <DialogTitle>{open.title}</DialogTitle>
                <DialogDescription>{itemCount(open)}</DialogDescription>
              </DialogHeader>
              {open.type === "flashcards" && <Flashcards cards={open.data.cards ?? []} />}
              {open.type === "quiz" && <Quiz questions={open.data.questions ?? []} />}
              {open.type === "summary" && <MathPreview source={open.data.markdown ?? ""} />}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
