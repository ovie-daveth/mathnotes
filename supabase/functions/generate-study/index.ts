// Supabase Edge Function: generate-study
// Turns a note into flashcards, a quiz, or a summary using the Anthropic API.
//
// Deploy:
//   supabase functions deploy generate-study
//   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
// Optional: supabase secrets set ANTHROPIC_MODEL=claude-sonnet-5-5
//
// The caller's JWT is forwarded to Supabase, so row level security guarantees
// a user can only generate material from their own notes.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

type StudyType = "flashcards" | "quiz" | "summary"

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })

function buildPrompt(type: StudyType, count: number, title: string, content: string) {
  const shared = `You are a mathematics tutor. The student's note is written in Markdown with LaTeX ($...$ inline, $$...$$ display). Use the same LaTeX conventions in everything you write. Only use ideas that are in or directly implied by the note. Respond with ONLY valid JSON, no prose and no code fences. Remember to escape backslashes in JSON strings (write \\\\frac, not \\frac).`

  const schemas: Record<StudyType, string> = {
    flashcards: `Create ${count} flashcards. Schema: {"cards":[{"front":"question or term","back":"answer or definition"}]}`,
    quiz: `Create ${count} multiple-choice questions with exactly 4 options each. Schema: {"questions":[{"question":"...","options":["...","...","...","..."],"answerIndex":0,"explanation":"why the answer is right"}]}`,
    summary: `Write a concise revision summary with key definitions, formulas and worked-example takeaways. Schema: {"markdown":"..."}`,
  }

  return `${shared}\n\n${schemas[type]}\n\nNote title: ${title}\n\nNote content:\n${content}`
}

function extractJson(text: string) {
  const start = text.indexOf("{")
  const end = text.lastIndexOf("}")
  if (start === -1 || end === -1) throw new Error("Model did not return JSON")
  return JSON.parse(text.slice(start, end + 1))
}

function validate(type: StudyType, data: any) {
  if (type === "flashcards" && !Array.isArray(data?.cards)) throw new Error("Bad flashcard JSON")
  if (type === "quiz" && !Array.isArray(data?.questions)) throw new Error("Bad quiz JSON")
  if (type === "summary" && typeof data?.markdown !== "string") throw new Error("Bad summary JSON")
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405)

  try {
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) return json({ error: "Not signed in" }, 401)

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    )

    const { noteId, type, count } = (await req.json()) as {
      noteId: string
      type: StudyType
      count?: number
    }
    if (!noteId || !["flashcards", "quiz", "summary"].includes(type)) {
      return json({ error: "noteId and a valid type are required" }, 400)
    }
    const n = Math.min(Math.max(Number(count) || 10, 3), 25)

    const { data: note, error: noteErr } = await supabase
      .from("notes")
      .select("id, title, content")
      .eq("id", noteId)
      .single()
    if (noteErr || !note) return json({ error: "Note not found" }, 404)
    if (note.content.trim().length < 20) {
      return json({ error: "This note is too short to generate study material from." }, 400)
    }

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY")
    if (!apiKey) return json({ error: "ANTHROPIC_API_KEY is not configured" }, 500)

    const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: Deno.env.get("ANTHROPIC_MODEL") ?? "claude-sonnet-5-5",
        max_tokens: 4096,
        messages: [
          { role: "user", content: buildPrompt(type, n, note.title, note.content) },
        ],
      }),
    })

    if (!aiRes.ok) {
      const detail = await aiRes.text()
      console.error("Anthropic error", aiRes.status, detail)
      return json({ error: `AI request failed (${aiRes.status})` }, 502)
    }

    const ai = await aiRes.json()
    const text: string = ai.content?.find((b: any) => b.type === "text")?.text ?? ""
    const data = extractJson(text)
    validate(type, data)

    const label = { flashcards: "Flashcards", quiz: "Quiz", summary: "Summary" }[type]
    const { data: saved, error: insertErr } = await supabase
      .from("study_materials")
      .insert({ note_id: note.id, type, title: `${label}: ${note.title}`, data })
      .select()
      .single()
    if (insertErr) return json({ error: insertErr.message }, 500)

    return json({ material: saved })
  } catch (e) {
    console.error(e)
    return json({ error: e instanceof Error ? e.message : "Unexpected error" }, 500)
  }
})
