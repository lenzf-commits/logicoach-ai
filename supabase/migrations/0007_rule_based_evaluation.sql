create table if not exists public.interview_evaluations (
  id uuid primary key default gen_random_uuid(),
  interview_id uuid not null references public.interviews(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  overall_score integer not null check (overall_score between 0 and 100),
  self_presentation_score integer not null check (self_presentation_score between 0 and 100),
  communication_score integer not null check (communication_score between 0 and 100),
  structure_score integer not null check (structure_score between 0 and 100),
  logistics_keywords_score integer not null check (logistics_keywords_score between 0 and 100),
  confidence_score integer not null check (confidence_score between 0 and 100),
  filler_word_count integer not null default 0 check (filler_word_count >= 0),
  average_answer_length integer not null default 0 check (average_answer_length >= 0),
  strengths jsonb not null default '[]'::jsonb,
  weaknesses jsonb not null default '[]'::jsonb,
  recommendations jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique (interview_id)
);

create index if not exists interview_evaluations_interview_id_idx
on public.interview_evaluations(interview_id);

create index if not exists interview_evaluations_user_id_idx
on public.interview_evaluations(user_id);

alter table public.interview_evaluations enable row level security;

create policy "Users can read own interview evaluations"
on public.interview_evaluations for select
using (
  user_id = auth.uid()
  and exists (
    select 1
    from public.interviews
    where interviews.id = interview_evaluations.interview_id
    and interviews.user_id = auth.uid()
  )
);

create policy "Users can insert own interview evaluations"
on public.interview_evaluations for insert
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.interviews
    where interviews.id = interview_evaluations.interview_id
    and interviews.user_id = auth.uid()
  )
);
