create extension if not exists "pgcrypto";

create type public.interview_status as enum (
  'draft',
  'prepared',
  'in_progress',
  'completed',
  'cancelled'
);

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  current_level integer not null default 1 check (current_level >= 1),
  total_xp integer not null default 0 check (total_xp >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  file_name text not null,
  file_path text,
  content_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.job_postings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  company_name text,
  description text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.interviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  resume_id uuid references public.resumes(id) on delete set null,
  job_posting_id uuid references public.job_postings(id) on delete set null,
  status public.interview_status not null default 'draft',
  duration_minutes integer check (duration_minutes in (10, 15, 20)),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.progress_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  interview_id uuid references public.interviews(id) on delete set null,
  xp_delta integer not null default 0,
  level_after integer not null check (level_after >= 1),
  total_xp_after integer not null check (total_xp_after >= 0),
  note text,
  created_at timestamptz not null default now()
);

create index resumes_user_id_idx on public.resumes(user_id);
create index job_postings_user_id_idx on public.job_postings(user_id);
create index interviews_user_id_idx on public.interviews(user_id);
create index interviews_resume_id_idx on public.interviews(resume_id);
create index interviews_job_posting_id_idx on public.interviews(job_posting_id);
create index progress_history_user_id_idx on public.progress_history(user_id);
create index progress_history_interview_id_idx on public.progress_history(interview_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_users_updated_at
before update on public.users
for each row execute function public.set_updated_at();

create trigger set_resumes_updated_at
before update on public.resumes
for each row execute function public.set_updated_at();

create trigger set_job_postings_updated_at
before update on public.job_postings
for each row execute function public.set_updated_at();

create trigger set_interviews_updated_at
before update on public.interviews
for each row execute function public.set_updated_at();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'full_name', '')
  );

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

alter table public.users enable row level security;
alter table public.resumes enable row level security;
alter table public.job_postings enable row level security;
alter table public.interviews enable row level security;
alter table public.progress_history enable row level security;

create policy "Users can read own profile"
on public.users for select
using (auth.uid() = id);

create policy "Users can update own profile"
on public.users for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Users can read own resumes"
on public.resumes for select
using (auth.uid() = user_id);

create policy "Users can insert own resumes"
on public.resumes for insert
with check (auth.uid() = user_id);

create policy "Users can update own resumes"
on public.resumes for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own resumes"
on public.resumes for delete
using (auth.uid() = user_id);

create policy "Users can read own job postings"
on public.job_postings for select
using (auth.uid() = user_id);

create policy "Users can insert own job postings"
on public.job_postings for insert
with check (auth.uid() = user_id);

create policy "Users can update own job postings"
on public.job_postings for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own job postings"
on public.job_postings for delete
using (auth.uid() = user_id);

create policy "Users can read own interviews"
on public.interviews for select
using (auth.uid() = user_id);

create policy "Users can insert own interviews"
on public.interviews for insert
with check (auth.uid() = user_id);

create policy "Users can update own interviews"
on public.interviews for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own interviews"
on public.interviews for delete
using (auth.uid() = user_id);

create policy "Users can read own progress history"
on public.progress_history for select
using (auth.uid() = user_id);

create policy "Users can insert own progress history"
on public.progress_history for insert
with check (auth.uid() = user_id);
