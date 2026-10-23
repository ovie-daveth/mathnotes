import { supabase } from "@/lib/supabase"
import type { Note, NoteUpdate, StudyMaterial, StudyType } from "@/lib/types"
import { NEW_NOTE_TEMPLATE } from "@/lib/types"

export async function listNotes(): Promise<Note[]> {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .order("pinned", { ascending: false })
    .order("updated_at", { ascending: false })
  if (error) throw error
  return (data ?? []) as Note[]
}

export async function getNote(id: string): Promise<Note> {
  const { data, error } = await supabase.from("notes").select("*").eq("id", id).single()
  if (error) throw error
  return data as Note
}

export async function createNote(partial: NoteUpdate = {}): Promise<Note> {
  const { data, error } = await supabase
    .from("notes")
    .insert({ title: "Untitled note", content: NEW_NOTE_TEMPLATE, ...partial })
    .select()
    .single()
  if (error) throw error
  return data as Note
}

export async function updateNote(id: string, patch: NoteUpdate): Promise<Note> {
  const { data, error } = await supabase
    .from("notes")
    .update(patch)
    .eq("id", id)
    .select()
    .single()
  if (error) throw error
  return data as Note
}

export async function deleteNote(id: string): Promise<void> {
  const { error } = await supabase.from("notes").delete().eq("id", id)
  if (error) throw error
}

export async function listStudyMaterials(noteId: string): Promise<StudyMaterial[]> {
  const { data, error } = await supabase
    .from("study_materials")
    .select("*")
    .eq("note_id", noteId)
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data ?? []) as StudyMaterial[]
}

export async function deleteStudyMaterial(id: string): Promise<void> {
  const { error } = await supabase.from("study_materials").delete().eq("id", id)
  if (error) throw error
}

export async function generateStudyMaterial(
  noteId: string,
  type: StudyType,
  count: number,
): Promise<StudyMaterial> {
  const { data, error } = await supabase.functions.invoke("generate-study", {
    body: { noteId, type, count },
  })
  if (error) {
    // Edge function errors carry a JSON body with a friendly message.
    let message = error.message
    try {
      const body = await (error as { context?: Response }).context?.json()
      if (body?.error) message = body.error
    } catch {
      /* keep default message */
    }
    throw new Error(message)
  }
  if (data?.error) throw new Error(data.error)
  return data.material as StudyMaterial
}
