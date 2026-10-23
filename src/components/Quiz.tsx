import { useState } from "react"
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MathPreview } from "@/components/MathPreview"
import type { QuizQuestion } from "@/lib/types"
import { cn } from "@/lib/utils"

export function Quiz({ questions }: { questions: QuizQuestion[] }) {
  const valid = questions.filter((q) => Array.isArray(q.options) && q.options.length >= 2)
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})

  if (valid.length === 0) {
    return <p className="text-sm text-muted-foreground">This quiz has no questions.</p>
  }

  const finished = index >= valid.length
  const score = valid.reduce((n, q, i) => (answers[i] === q.answerIndex ? n + 1 : n), 0)

  if (finished) {
    return (
      <div className="space-y-4 py-6 text-center">
        <p className="text-sm text-muted-foreground">Quiz complete</p>
        <p className="text-4xl font-bold">
          {score} / {valid.length}
        </p>
        <p className="text-muted-foreground">
          {score === valid.length
            ? "Perfect. You have this one down."
            : "Review the explanations, then try again."}
        </p>
        <Button
          onClick={() => {
            setAnswers({})
            setIndex(0)
          }}
        >
          <RotateCcw /> Retake quiz
        </Button>
      </div>
    )
  }

  const q = valid[index]
  const picked = answers[index]
  const answered = picked !== undefined

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Question {index + 1} of {valid.length}
        </span>
        <span>
          Score {score} / {Object.keys(answers).length}
        </span>
      </div>

      <div className="rounded-xl border bg-card p-5 text-lg">
        <MathPreview source={q.question} />
      </div>

      <div className="space-y-2">
        {q.options.map((option, i) => {
          const isCorrect = i === q.answerIndex
          const isPicked = picked === i
          return (
            <button
              key={i}
              type="button"
              disabled={answered}
              onClick={() => setAnswers((a) => ({ ...a, [index]: i }))}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors",
                !answered && "hover:bg-accent",
                answered && isCorrect && "border-emerald-500 bg-emerald-500/10",
                answered && isPicked && !isCorrect && "border-destructive bg-destructive/10",
              )}
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium">
                {String.fromCharCode(65 + i)}
              </span>
              <div className="min-w-0 flex-1">
                <MathPreview source={option} compact />
              </div>
              {answered && isCorrect && <CheckCircle2 className="size-5 text-emerald-600" />}
              {answered && isPicked && !isCorrect && <XCircle className="size-5 text-destructive" />}
            </button>
          )
        })}
      </div>

      {answered && (
        <div className="rounded-lg bg-muted p-4 text-sm">
          <p className="mb-1 font-medium">{picked === q.answerIndex ? "Correct" : "Not quite"}</p>
          <MathPreview source={q.explanation ?? ""} />
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={() => setIndex((i) => i + 1)} disabled={!answered}>
          {index === valid.length - 1 ? "See results" : "Next question"}
        </Button>
      </div>
    </div>
  )
}
