-- MathNotes schema. Run in the Supabase SQL editor (or `supabase db push`).

create table if not exists public.notes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title       text not null default 'Untitled note',
  content     text not null default '',
  kind        text not null default 'lecture'
              check (kind in ('lecture','formula_sheet','problem_set','proof','definition','summary','scratch')),
  subject     text not null default '',
  tags        text[] not null default '{}',
  pinned      boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists notes_user_updated_idx on public.notes (user_id, updated_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists notes_set_updated_at on public.notes;
create trigger notes_set_updated_at
  before update on public.notes
  for each row execute function public.set_updated_at();

create table if not exists public.study_materials (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  note_id     uuid not null references public.notes (id) on delete cascade,
  type        text not null check (type in ('flashcards','quiz','summary')),
  title       text not null default '',
  data        jsonb not null,
  created_at  timestamptz not null default now()
);

create index if not exists study_materials_note_idx on public.study_materials (note_id, created_at desc);

-- Row level security: every row is private to its owner.
alter table public.notes enable row level security;
alter table public.study_materials enable row level security;

drop policy if exists "notes: owner select" on public.notes;
drop policy if exists "notes: owner insert" on public.notes;
drop policy if exists "notes: owner update" on public.notes;
drop policy if exists "notes: owner delete" on public.notes;

create policy "notes: owner select" on public.notes
  for select using (auth.uid() = user_id);
create policy "notes: owner insert" on public.notes
  for insert with check (auth.uid() = user_id);
create policy "notes: owner update" on public.notes
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "notes: owner delete" on public.notes
  for delete using (auth.uid() = user_id);

drop policy if exists "study: owner select" on public.study_materials;
drop policy if exists "study: owner insert" on public.study_materials;
drop policy if exists "study: owner delete" on public.study_materials;

create policy "study: owner select" on public.study_materials
  for select using (auth.uid() = user_id);
create policy "study: owner insert" on public.study_materials
  for insert with check (
    auth.uid() = user_id
    and exists (select 1 from public.notes n where n.id = note_id and n.user_id = auth.uid())
  );
create policy "study: owner delete" on public.study_materials
  for delete using (auth.uid() = user_id);
