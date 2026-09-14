alter type public.interview_status add value if not exists 'ready';

alter table public.interviews
add column if not exists level integer check (level between 1 and 10),
add column if not exists persona text;
