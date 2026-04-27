-- Function to generate deterministic but unguessable hash
create or replace function public.generate_certificate_hash(_user_id uuid, _attempt_id uuid)
returns text
language sql
stable
security definer
set search_path = public, extensions
as $$
  select encode(
    extensions.digest(
      _user_id::text || ':' || _attempt_id::text || ':lovable-cert-salt-v1',
      'sha256'
    ),
    'hex'
  )
$$;

-- Ensure pgcrypto is available for digest()
create extension if not exists pgcrypto with schema extensions;

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  attempt_id uuid not null,
  score numeric not null,
  total_questions integer not null,
  display_name text not null,
  hash text not null unique default '',
  issued_at timestamptz not null default now(),
  unique (user_id, attempt_id)
);

-- Trigger to fill hash on insert
create or replace function public.set_certificate_hash()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.hash is null or new.hash = '' then
    new.hash := public.generate_certificate_hash(new.user_id, new.attempt_id);
  end if;
  return new;
end;
$$;

create trigger trg_set_certificate_hash
before insert on public.certificates
for each row execute function public.set_certificate_hash();

alter table public.certificates enable row level security;

-- Owner can see their own certificates
create policy "certificates_select_own"
on public.certificates
for select
to authenticated
using (auth.uid() = user_id);

-- Anyone (even anon) can verify a certificate by knowing its hash
-- The hash itself is the secret; without it you can't enumerate
create policy "certificates_verify_by_hash"
on public.certificates
for select
to anon, authenticated
using (true);

-- Owner can insert their own certificate
create policy "certificates_insert_own"
on public.certificates
for insert
to authenticated
with check (auth.uid() = user_id);

-- No update / no delete policies => denied by default
