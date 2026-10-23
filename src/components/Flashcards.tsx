import { useCallback, useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, RotateCcw, Shuffle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MathPreview } from "@/components/MathPreview"
import type { Flashcard } from "@/lib/types"
import { cn } from "@/lib/utils"

function shuffled<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function Flashcards({ cards }: { cards: Flashcard[] }) {
  const [deck, setDeck] = useState(cards)
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const go = useCallback(
    (delta: number) => {
      setFlipped(false)
      setIndex((i) => Math.min(Math.max(i + delta, 0), deck.length - 1))
    },
    [deck.length],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1)
      else if (e.key === "ArrowLeft") go(-1)
      else if (e.key === " ") {
        e.preventDefault()
        setFlipped((f) => !f)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [go])

  if (deck.length === 0) {
    return <p className="text-sm text-muted-foreground">This deck has no cards.</p>
  }

  const card = deck[index]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Card {index + 1} of {deck.length}
        </span>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setDeck(shuffled(cards))
              setIndex(0)
              setFlipped(false)
            }}
          >
            <Shuffle /> Shuffle
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setDeck(cards)
              setIndex(0)
              setFlipped(false)
            }}
          >
            <RotateCcw /> Reset
          </Button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        aria-label={flipped ? "Show question" : "Show answer"}
        className={cn(
          "flex min-h-64 w-full flex-col items-center justify-center rounded-xl border p-8 text-left shadow-sm transition-colors",
          flipped ? "bg-accent" : "bg-card hover:bg-muted/50",
        )}
      >
        <span className="mb-3 self-start text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {flipped ? "Answer" : "Question"}
        </span>
        <div className="w-full text-lg">
          <MathPreview source={flipped ? card.back : card.front} />
        </div>
        <span className="mt-4 self-center text-xs text-muted-foreground">
          Click or press space to flip
        </span>
      </button>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => go(-1)} disabled={index === 0}>
          <ChevronLeft /> Previous
        </Button>
        <Button variant="outline" onClick={() => go(1)} disabled={index === deck.length - 1}>
          Next <ChevronRight />
        </Button>
      </div>
    </div>
  )
}
