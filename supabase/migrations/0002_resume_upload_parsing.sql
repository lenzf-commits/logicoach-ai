alter table public.resumes
add column if not exists extracted_text text,
add column if not exists parsed_data jsonb not null default '{}'::jsonb;

create policy "Users can read own resume files"
on storage.objects for select
using (
  bucket_id = 'resumes'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can upload own resume files"
on storage.objects for insert
with check (
  bucket_id = 'resumes'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can update own resume files"
on storage.objects for update
using (
  bucket_id = 'resumes'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'resumes'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can delete own resume files"
on storage.objects for delete
using (
  bucket_id = 'resumes'
  and (storage.foldername(name))[1] = auth.uid()::text
);
