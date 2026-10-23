export const NOTE_KINDS = [
  { value: "lecture", label: "Lecture notes" },
  { value: "formula_sheet", label: "Formula sheet" },
  { value: "problem_set", label: "Problem set" },
  { value: "proof", label: "Proof" },
  { value: "definition", label: "Definitions" },
  { value: "summary", label: "Summary" },
  { value: "scratch", label: "Scratchpad" },
] as const

export type NoteKind = (typeof NOTE_KINDS)[number]["value"]

export const kindLabel = (kind: string) =>
  NOTE_KINDS.find((k) => k.value === kind)?.label ?? kind

export interface Note {
  id: string
  user_id: string
  title: string
  content: string
  kind: NoteKind
  subject: string
  tags: string[]
  pinned: boolean
  created_at: string
  updated_at: string
}

export type NoteUpdate = Partial<Pick<Note, "title" | "content" | "kind" | "subject" | "tags" | "pinned">>

export type StudyType = "flashcards" | "quiz" | "summary"

export interface Flashcard {
  front: string
  back: string
}

export interface QuizQuestion {
  question: string
  options: string[]
  answerIndex: number
  explanation: string
}

export interface StudyMaterial {
  id: string
  note_id: string
  type: StudyType
  title: string
  data: {
    cards?: Flashcard[]
    questions?: QuizQuestion[]
    markdown?: string
  }
  created_at: string
}

export const NEW_NOTE_TEMPLATE = `# Untitled note

Write normally, and use LaTeX for math. Inline math goes between single dollars, like $e^{i\\pi} + 1 = 0$.

Display equations go between double dollars:

$$
\\int_{0}^{\\infty} e^{-x^2}\\,dx = \\frac{\\sqrt{\\pi}}{2}
$$
`
