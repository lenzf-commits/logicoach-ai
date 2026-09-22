# Supabase

Dieser Ordner enthaelt die SQL-Migrationen fuer LogiCoach AI.

## Phase 2 Migration ausfuehren

1. Supabase Dashboard oeffnen.
2. Projekt auswaehlen.
3. Links `SQL Editor` oeffnen.
4. Neue Query erstellen.
5. Inhalt aus `supabase/migrations/0001_auth_database.sql` einfuegen.
6. Query ausfuehren.

Die erste Migration erstellt:

- `public.users`
- `public.resumes`
- `public.job_postings`
- `public.interviews`
- `public.progress_history`
- Row-Level-Security Policies fuer nutzereigene Daten
- Trigger, der nach Supabase-Auth-Registrierung automatisch ein Profil in `public.users` anlegt

## Phase 3 Storage und Resume Parsing

Vor dem Lebenslauf-Upload muss in Supabase ein privater Storage Bucket angelegt werden:

1. `Storage` oeffnen.
2. `New bucket` anklicken.
3. Name exakt `resumes` setzen.
4. `Public bucket` ausgeschaltet lassen.
5. Bucket erstellen.

Danach `supabase/migrations/0002_resume_upload_parsing.sql` im SQL Editor ausfuehren.

Die zweite Migration:

- erweitert `public.resumes` um `extracted_text`
- erweitert `public.resumes` um `parsed_data jsonb`
- legt Storage Policies fuer `storage.objects` an
- erlaubt Nutzern nur Zugriff auf Dateien unter `user_id/dateiname.pdf`

## Phase 4 Stellenanzeigen-Parsing

Fuehre `supabase/migrations/0003_job_posting_parsing.sql` im SQL Editor aus.

Die dritte Migration:

- erweitert `public.job_postings` um `parsed_data jsonb`
- nutzt die bestehenden RLS Policies von `public.job_postings`

## Phase 5 Interview-Session-Setup

Fuehre `supabase/migrations/0004_interview_session_setup.sql` im SQL Editor aus.

Die vierte Migration:

- erweitert `public.interviews` um `level`
- erweitert `public.interviews` um `persona`
- ergaenzt den Statuswert `ready` fuer vorbereitete Sessions

## Phase 6 Interview-Nachrichten

Fuehre `supabase/migrations/0005_interview_messages.sql` im SQL Editor aus.

Die fuenfte Migration:

- erstellt `public.interview_messages`
- speichert Nachrichten mit `role = interviewer` oder `role = candidate`
- ergaenzt den Statuswert `active`
- legt RLS Policies an, sodass Nutzer nur Nachrichten ihrer eigenen Interviews lesen und schreiben koennen

## Phase 8 Progress-System

Fuehre `supabase/migrations/0006_progress_system.sql` im SQL Editor aus.

Die sechste Migration:

- erweitert `public.users` um `current_xp`
- erweitert `public.users` um `total_interviews_completed`
- erweitert `public.users` um `longest_streak_days`
- erweitert `public.progress_history` um `xp_gained`
- erweitert `public.progress_history` um `previous_level`
- erweitert `public.progress_history` um `new_level`

## Phase 7 Regelbasierte Bewertung

Fuehre `supabase/migrations/0007_rule_based_evaluation.sql` im SQL Editor aus.

Die siebte Migration:

- erstellt `public.interview_evaluations`
- speichert Scores, Fuellwortanzahl, Antwortlaenge und Feedbacklisten
- legt RLS Policies an, sodass Nutzer nur Bewertungen ihrer eigenen Interviews lesen und schreiben koennen

## Inhaltliche Replay-Analyse

Nach den bestehenden Migrationen `supabase/migrations/0009_replay_analyses.sql`
im Supabase SQL Editor ausführen. Die Migration legt eine neue Tabelle mit
Eigentümerprüfung (RLS) an und verändert keine vorhandenen Interviewinhalte.

Im Replay Center ein Gespräch öffnen und „Antworten analysieren“ wählen.
Die Analyse wird einmal pro unverändertem Gespräch und Kontext gespeichert.
Markierungen enthalten Begründung, Formulierungsvorschlag und gegebenenfalls
ein geprüftes Lebenslaufzitat. Änderungen am Gespräch oder Kontext erfordern
eine Aktualisierung. Beim Löschen des Interviews wird die Analyse mit gelöscht.

Ohne diese Migration zeigt die App einen Einrichtungszustand; der Verlauf
bleibt lesbar. Das Präsentationsformular benötigt keine zusätzliche Tabelle:
Der erzeugte Plan bleibt nur in der geöffneten Seite.
