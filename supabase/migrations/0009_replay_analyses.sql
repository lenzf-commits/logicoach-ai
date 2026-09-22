create table if not exists public.replay_analyses (
  interview_id uuid primary key references public.interviews(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  input_hash text not null,
  report jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.replay_analyses enable row level security;

create policy "Users can read own replay analyses"
on public.replay_analyses for select to authenticated
using (user_id = auth.uid() and exists (
  select 1 from public.interviews where interviews.id = replay_analyses.interview_id and interviews.user_id = auth.uid()
));

create policy "Users can insert own replay analyses"
on public.replay_analyses for insert to authenticated
with check (user_id = auth.uid() and exists (
  select 1 from public.interviews where interviews.id = replay_analyses.interview_id and interviews.user_id = auth.uid()
));

create policy "Users can update own replay analyses"
on public.replay_analyses for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid() and exists (
  select 1 from public.interviews where interviews.id = replay_analyses.interview_id and interviews.user_id = auth.uid()
));

create index if not exists replay_analyses_user_id_idx on public.replay_analyses(user_id);
