alter table public.job_postings
add column if not exists parsed_data jsonb not null default '{}'::jsonb;
