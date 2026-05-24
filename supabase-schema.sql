create extension if not exists pgcrypto;

create table if not exists public.corporates (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique not null,
  slug text unique not null,
  company_name text not null,
  company_email text not null,
  access_status text not null default 'locked'
    check (access_status in ('locked', 'active')),
  registration_data jsonb not null default '{}'::jsonb,
  unlocked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.corporate_messages (
  id uuid primary key default gen_random_uuid(),
  corporate_id uuid not null references public.corporates(id) on delete cascade,
  sender_type text not null check (sender_type in ('corporate', 'admin')),
  body text not null,
  created_at timestamptz not null default now()
); 

alter table public.corporate_messages replica identity full;

alter table public.corporates enable row level security;
alter table public.corporate_messages enable row level security;

drop policy if exists "corporates read own profile" on public.corporates;
create policy "corporates read own profile"
on public.corporates
for select
to authenticated
using (auth.uid() = auth_user_id);

drop policy if exists "corporates read own messages" on public.corporate_messages;
create policy "corporates read own messages"
on public.corporate_messages
for select
to authenticated
using (
  exists (
    select 1
    from public.corporates
    where corporates.id = corporate_messages.corporate_id
      and corporates.auth_user_id = auth.uid()
  )
);

drop policy if exists "corporates send own messages" on public.corporate_messages;
create policy "corporates send own messages"
on public.corporate_messages
for insert
to authenticated
with check (
  sender_type = 'corporate'
  and exists (
    select 1
    from public.corporates
    where corporates.id = corporate_messages.corporate_id
      and corporates.auth_user_id = auth.uid()
  )
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_corporates_updated_at on public.corporates;
create trigger touch_corporates_updated_at
before update on public.corporates
for each row
execute function public.touch_updated_at();

do $$
begin
  alter publication supabase_realtime add table public.corporate_messages;
exception
  when duplicate_object then null;
end;
$$;
