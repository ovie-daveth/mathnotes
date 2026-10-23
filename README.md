# MathNotes

A note-taking web app for mathematics. Write full LaTeX (integrals, matrices, limits, proofs), organise notes by type and subject, save them to Supabase, and turn any note into flashcards, a quiz or a revision summary with an AI model.

**Stack:** React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui components (Radix), KaTeX, Supabase (Postgres, Auth, Edge Functions).

## Setup

### 1. Install and run

```bash
npm install
cp .env.example .env     # then fill in the two values below
npm run dev
```

### 2. Supabase

1. Create a project at supabase.com.
2. Open **SQL editor**, paste `supabase/migrations/0001_init.sql`, and run it. This creates the `notes` and `study_materials` tables with row level security, so each user only sees their own data.
3. **Project Settings, API**: copy the project URL and anon key into `.env` as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. **Authentication, Providers**: email is enabled by default. For quick local testing you can turn off "Confirm email".

### 3. AI study material (optional, can be done later)

Notes work without this. To enable flashcards, quizzes and summaries:

```bash
npm i -g supabase                       # or: npx supabase ...
supabase login
supabase link --project-ref YOUR-PROJECT-REF
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
supabase functions deploy generate-study
```

The function lives in `supabase/functions/generate-study/index.ts`. It forwards the signed-in user's token, so it can only read that user's notes. The model defaults to `claude-sonnet-5-5`; override it with `supabase secrets set ANTHROPIC_MODEL=...`.

## Using the editor

- Write Markdown with LaTeX: `$x^2$` inline, `$$ ... $$` for display equations. `\( \)` and `\[ \]` also work.
- The toolbar inserts snippets for fractions, integrals, limits, sums, matrices, piecewise functions, Greek letters, symbols and theorem/proof blocks. Select text first and it is placed inside the snippet. Outside math, a snippet wraps itself in `$`; inside math, it inserts raw LaTeX.
- Shortcuts: `Ctrl/Cmd+M` inline math, `Ctrl/Cmd+Shift+M` display math, `Ctrl/Cmd+B` bold, `Ctrl/Cmd+I` italic, `Ctrl/Cmd+S` save.
- Notes autosave 1.5 seconds after you stop typing.
- Views: write only, split (live preview), preview only.
- Note types: lecture notes, formula sheet, problem set, proof, definitions, summary, scratchpad. Each starts from a template.
- Built-in macros: `\R \N \Z \Q \C` for the number sets.

## Project layout

```
src/
  components/      editor, toolbar, preview, flashcards, quiz, study panel
  components/ui/   shadcn-style primitives (button, dialog, select, tabs, ...)
  lib/             supabase client, notes API, snippets, templates, types
  pages/           auth, notes library, note editor
supabase/
  migrations/      database schema and security policies
  functions/       generate-study edge function
```

## Status

This source was written without being installed or compiled (the build environment could not reach the npm registry). Run `npm install && npm run typecheck && npm run build` first; if the type-check reports anything, it will be a small fix.
