alter table public.interview_evaluations
  add column if not exists ai_summary text,
  add column if not exists ai_strengths jsonb not null default '[]'::jsonb,
  add column if not exists ai_weaknesses jsonb not null default '[]'::jsonb,
  add column if not exists ai_recommendations jsonb not null default '[]'::jsonb,
  add column if not exists ai_top_risks jsonb not null default '[]'::jsonb,
  add column if not exists ai_improved_answers jsonb not null default '[]'::jsonb,
  add column if not exists ai_created_at timestamp with time zone;
