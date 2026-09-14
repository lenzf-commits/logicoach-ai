alter type public.interview_status add value if not exists 'active';

create table if not exists public.interview_messages (
  id uuid primary key default gen_random_uuid(),
  interview_id uuid not null references public.interviews(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role text not null check (role in ('interviewer', 'candidate')),
  content text not null,
  message_order integer not null,
  created_at timestamptz not null default now(),
  unique (interview_id, message_order)
);

create index if not exists interview_messages_interview_id_idx
on public.interview_messages(interview_id);

create index if not exists interview_messages_user_id_idx
on public.interview_messages(user_id);

alter table public.interview_messages enable row level security;

create policy "Users can read own interview messages"
on public.interview_messages for select
using (
  user_id = auth.uid()
  and exists (
    select 1
    from public.interviews
    where interviews.id = interview_messages.interview_id
    and interviews.user_id = auth.uid()
  )
);

create policy "Users can insert own interview messages"
on public.interview_messages for insert
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.interviews
    where interviews.id = interview_messages.interview_id
    and interviews.user_id = auth.uid()
  )
);
