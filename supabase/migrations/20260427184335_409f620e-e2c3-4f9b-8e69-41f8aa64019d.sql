-- =========================================================
--  0001_dashboard.sql — Personal cabinet schema + RLS
-- =========================================================

-- ---------- helper: updated_at trigger ----------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- profiles ----------
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text,
  specialization text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = user_id);

create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = user_id);

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- auto-create profile on signup, pulling display_name / specialization from raw_user_meta_data
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, display_name, specialization)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'specialization'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- user_progress ----------
create table public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id text not null,
  started_at timestamptz,
  completed_at timestamptz,
  percent integer not null default 0 check (percent between 0 and 100),
  updated_at timestamptz not null default now(),
  unique (user_id, module_id)
);

alter table public.user_progress enable row level security;

create policy "progress_select_own" on public.user_progress
  for select to authenticated using (auth.uid() = user_id);
create policy "progress_insert_own" on public.user_progress
  for insert to authenticated with check (auth.uid() = user_id);
create policy "progress_update_own" on public.user_progress
  for update to authenticated using (auth.uid() = user_id);
create policy "progress_delete_own" on public.user_progress
  for delete to authenticated using (auth.uid() = user_id);

create trigger trg_progress_updated_at
  before update on public.user_progress
  for each row execute function public.set_updated_at();

create index idx_progress_user_updated on public.user_progress(user_id, updated_at desc);

-- ---------- saved_calculations ----------
create table public.saved_calculations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  params jsonb not null default '{}'::jsonb,
  result jsonb not null default '{}'::jsonb,
  note text,
  created_at timestamptz not null default now()
);

alter table public.saved_calculations enable row level security;

create policy "calc_select_own" on public.saved_calculations
  for select to authenticated using (auth.uid() = user_id);
create policy "calc_insert_own" on public.saved_calculations
  for insert to authenticated with check (auth.uid() = user_id);
create policy "calc_update_own" on public.saved_calculations
  for update to authenticated using (auth.uid() = user_id);
create policy "calc_delete_own" on public.saved_calculations
  for delete to authenticated using (auth.uid() = user_id);

create index idx_calc_user_created on public.saved_calculations(user_id, created_at desc);

-- ---------- bookmarks (glossary) ----------
create table public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  term_id text not null,
  created_at timestamptz not null default now(),
  unique (user_id, term_id)
);

alter table public.bookmarks enable row level security;

create policy "bookmarks_select_own" on public.bookmarks
  for select to authenticated using (auth.uid() = user_id);
create policy "bookmarks_insert_own" on public.bookmarks
  for insert to authenticated with check (auth.uid() = user_id);
create policy "bookmarks_delete_own" on public.bookmarks
  for delete to authenticated using (auth.uid() = user_id);

-- ---------- quiz_attempts ----------
create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  quiz_id text not null,
  score numeric(5,2) not null check (score between 0 and 100),
  total_questions integer,
  duration_seconds integer,
  created_at timestamptz not null default now()
);

alter table public.quiz_attempts enable row level security;

create policy "quiz_select_own" on public.quiz_attempts
  for select to authenticated using (auth.uid() = user_id);
create policy "quiz_insert_own" on public.quiz_attempts
  for insert to authenticated with check (auth.uid() = user_id);
create policy "quiz_delete_own" on public.quiz_attempts
  for delete to authenticated using (auth.uid() = user_id);

create index idx_quiz_user_created on public.quiz_attempts(user_id, created_at desc);
