alter table public.users
add column if not exists current_xp integer not null default 0 check (current_xp >= 0),
add column if not exists total_interviews_completed integer not null default 0 check (total_interviews_completed >= 0),
add column if not exists longest_streak_days integer not null default 0 check (longest_streak_days >= 0);

alter table public.progress_history
add column if not exists xp_gained integer check (xp_gained >= 0),
add column if not exists previous_level integer check (previous_level >= 1),
add column if not exists new_level integer check (new_level >= 1);

update public.users
set current_xp = total_xp
where current_xp = 0
and total_xp > 0;
