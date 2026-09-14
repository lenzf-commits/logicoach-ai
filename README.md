# LogiCoach AI

LogiCoach AI ist eine deutschsprachige Web-App fuer KI-gestuetzte Bewerbungsgespraeche in der Logistikbranche.

Dieses Repository enthaelt Phase 1 bis Phase 9: ein sauberes Next.js-Projektsetup mit TypeScript, Tailwind CSS, Supabase Auth, geschuetztem Dashboard, den ersten Datenbanktabellen, PDF-Lebenslauf-Upload, Stellenanzeigen-Parsing, Interview-Session-Setup, einem ersten textbasierten KI-Interview, regelbasierter Auswertung, einem XP-/Level-Fortschrittssystem und einem optionalen KI-Coaching-Bericht. Es gibt noch kein Audio und keine Zahlungsfunktion.

## Voraussetzungen

Installiere zuerst:

- Node.js LTS: https://nodejs.org
- Einen Paketmanager wie npm, der mit Node.js installiert wird
- Ein Supabase-Konto: https://supabase.com

## Lokales Setup

1. Abhaengigkeiten installieren:

```bash
npm install
```

2. Umgebungsvariablen vorbereiten:

```bash
cp .env.example .env.local
```

Unter Windows PowerShell kannst du alternativ ausfuehren:

```powershell
Copy-Item .env.example .env.local
```

3. Supabase-Werte in `.env.local` eintragen:

```env
NEXT_PUBLIC_SUPABASE_URL=https://dein-projekt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dein-anon-key
SUPABASE_SERVICE_ROLE_KEY=dein-service-role-key
OPENAI_API_KEY=spaeter
OPENAI_MODEL=gpt-5-mini
```

4. Entwicklungsserver starten:

```bash
npm run dev
```

5. App im Browser oeffnen:

```text
http://localhost:3000
```

## Supabase einrichten

Erstelle in Supabase ein neues Projekt. Die benoetigten Werte findest du danach in deinem Supabase Dashboard unter `Project Settings > API`.

Du brauchst spaeter:

- `NEXT_PUBLIC_SUPABASE_URL`: die Projekt-URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: der oeffentliche anon key fuer Browser-Zugriffe
- `SUPABASE_SERVICE_ROLE_KEY`: geheimer Admin-Key fuer serverseitige Aufgaben, niemals im Frontend verwenden

## SQL in Supabase ausfuehren

Phase 2 bis Phase 8 bringen Migrationen mit. Fuehre sie in dieser Reihenfolge in Supabase aus:

1. Supabase Dashboard oeffnen.
2. Dein Projekt auswaehlen.
3. Links `SQL Editor` oeffnen.
4. `New query` anklicken.
5. Den kompletten Inhalt aus [supabase/migrations/0001_auth_database.sql](supabase/migrations/0001_auth_database.sql) einfuegen.
6. `Run` ausfuehren.
7. Danach den kompletten Inhalt aus [supabase/migrations/0002_resume_upload_parsing.sql](supabase/migrations/0002_resume_upload_parsing.sql) einfuegen.
8. Wieder `Run` ausfuehren.
9. Danach den kompletten Inhalt aus [supabase/migrations/0003_job_posting_parsing.sql](supabase/migrations/0003_job_posting_parsing.sql) einfuegen.
10. Wieder `Run` ausfuehren.
11. Danach den kompletten Inhalt aus [supabase/migrations/0004_interview_session_setup.sql](supabase/migrations/0004_interview_session_setup.sql) einfuegen.
12. Wieder `Run` ausfuehren.
13. Danach den kompletten Inhalt aus [supabase/migrations/0005_interview_messages.sql](supabase/migrations/0005_interview_messages.sql) einfuegen.
14. Wieder `Run` ausfuehren.
15. Danach den kompletten Inhalt aus [supabase/migrations/0006_progress_system.sql](supabase/migrations/0006_progress_system.sql) einfuegen.
16. Wieder `Run` ausfuehren.
17. Danach den kompletten Inhalt aus [supabase/migrations/0007_rule_based_evaluation.sql](supabase/migrations/0007_rule_based_evaluation.sql) einfuegen.
18. Wieder `Run` ausfuehren.
19. Danach den kompletten Inhalt aus [supabase/migrations/0008_ai_coaching_report.sql](supabase/migrations/0008_ai_coaching_report.sql) einfuegen.
20. Wieder `Run` ausfuehren.

Die SQL erstellt:

- `public.users`
- `public.resumes`
- `public.job_postings`
- `public.interviews`
- `public.progress_history`
- Row-Level-Security Policies
- einen Trigger, der nach Supabase-Auth-Registrierung automatisch `public.users` befuellt
- `resumes.extracted_text`
- `resumes.parsed_data`
- Storage Policies fuer private Lebenslauf-Dateien
- `job_postings.parsed_data`
- `interviews.level`
- `interviews.persona`
- Statuswert `ready` fuer vorbereitete Interview-Sessions
- `public.interview_messages`
- Statuswert `active` fuer gestartete Interview-Sessions
- `users.current_xp`
- `users.total_interviews_completed`
- `users.longest_streak_days`
- Progress-History-Felder `xp_gained`, `previous_level`, `new_level`
- `public.interview_evaluations`
- KI-Coaching-Felder auf `public.interview_evaluations`

## Supabase Storage Bucket anlegen

Phase 3 braucht einen privaten Storage Bucket fuer Lebenslauf-PDFs.

1. Supabase Dashboard oeffnen.
2. Links `Storage` oeffnen.
3. `New bucket` anklicken.
4. Bucket-Name exakt setzen:

```text
resumes
```

5. `Public bucket` ausgeschaltet lassen. Der Bucket muss privat sein.
6. Bucket erstellen.
7. Danach die SQL aus [supabase/migrations/0002_resume_upload_parsing.sql](supabase/migrations/0002_resume_upload_parsing.sql) ausfuehren, falls noch nicht geschehen.

Die Storage Policies erlauben Nutzern nur Dateien in ihrem eigenen Ordner:

```text
user_id/dateiname.pdf
```

## Lebenslauf-Upload lokal testen

1. Lokale App starten:

```bash
npm run dev
```

2. Im Browser oeffnen:

```text
http://localhost:3000
```

3. Registrieren oder einloggen.
4. `Interview Vorbereitung` oeffnen.
5. Eine PDF-Datei bis maximal 5 MB hochladen.
6. Bei Erfolg erscheint eine Erfolgsmeldung und der Lebenslauf wird in der Liste angezeigt.
7. In Supabase pruefen:

```text
Storage > resumes > user_id/dateiname.pdf
Table Editor > resumes > extracted_text und parsed_data
```

Wichtig: Die einfache Parser-Funktion ist bewusst ohne OpenAI umgesetzt. Sie erkennt nur grob Name, Ausbildung, Berufserfahrung, Arbeitgeber, Positionen, Skills, Zertifikate und moegliche Fuehrungserfahrung anhand von Textmustern.

## Stellenanzeige lokal testen

1. Lokale App starten:

```bash
npm run dev
```

2. Im Browser oeffnen:

```text
http://localhost:3000/interview-vorbereitung
```

3. Einloggen, falls du noch nicht angemeldet bist.
4. Optional Jobtitel und Unternehmen eintragen.
5. Die komplette Stellenanzeige in das grosse Textfeld einfuegen.
6. `Stellenanzeige speichern` anklicken.
7. Bei Erfolg erscheint eine Erfolgsmeldung und die Anzeige wird in der Liste angezeigt.
8. In Supabase pruefen:

```text
Table Editor > job_postings > description und parsed_data
```

Wichtig: Das Stellenanzeigen-Parsing ist bewusst ohne OpenAI umgesetzt. Es erkennt grob Aufgaben, Anforderungen, Hard Skills, Soft Skills, Fuehrungsverantwortung, Schichtarbeit, Logistikbegriffe, Systeme und moegliche Interview-Risiken anhand einfacher Textmuster.

## Interview-Session lokal testen

1. Stelle sicher, dass mindestens ein Lebenslauf und eine Stellenanzeige gespeichert sind.
2. Lokale App starten:

```bash
npm run dev
```

3. Im Browser oeffnen:

```text
http://localhost:3000/interview-vorbereitung
```

4. Einen gespeicherten Lebenslauf auswaehlen.
5. Eine gespeicherte Stellenanzeige auswaehlen.
6. Dauer, Level und Interviewer-Persona auswaehlen.
7. `Interview-Session erstellen` anklicken.
8. Nach Erfolg wirst du weitergeleitet zu:

```text
/interview/[interviewId]
```

9. In Supabase pruefen:

```text
Table Editor > interviews
```

Der neue Datensatz sollte `resume_id`, `job_posting_id`, `duration_minutes`, `level`, `persona` und `status = ready` enthalten.

## Text-Interview lokal testen

1. In `.env.local` den OpenAI API Key eintragen:

```env
OPENAI_API_KEY=dein-openai-api-key
OPENAI_MODEL=gpt-5-mini
```

2. Migration [supabase/migrations/0005_interview_messages.sql](supabase/migrations/0005_interview_messages.sql) in Supabase ausfuehren.
3. Lokale App starten:

```bash
npm run dev
```

4. Eine vorbereitete Interview-Session oeffnen:

```text
http://localhost:3000/interview/[interviewId]
```

5. Beim ersten Oeffnen erzeugt die KI automatisch die erste Frage.
6. Antwort in das Textfeld schreiben und `Antwort senden` klicken.
7. Die Kandidatenantwort und die naechste Interviewfrage werden in `public.interview_messages` gespeichert.

Wenn `OPENAI_API_KEY` fehlt, zeigt die Interviewseite die Fehlermeldung `OPENAI_API_KEY fehlt.` an.

## XP- und Level-System

XP pro abgeschlossenem Interview:

```text
Basis: +100 XP
Level 1-3: +0 Bonus XP
Level 4-6: +25 Bonus XP
Level 7-8: +50 Bonus XP
Level 9-10: +100 Bonus XP
```

Level-Schwellen:

```text
Level 1: 0 XP
Level 2: 100 XP
Level 3: 250 XP
Level 4: 500 XP
Level 5: 1000 XP
Level 6: 1500 XP
Level 7: 2500 XP
Level 8: 4000 XP
Level 9: 6000 XP
Level 10: 10000 XP
```

Die zentrale Berechnung liegt in:

```text
src/lib/progress/levels.ts
```

`calculateLevel(xp)` gibt anhand der Gesamt-XP das aktuelle Level zurueck.

## Fortschritt lokal testen

1. Migration [supabase/migrations/0006_progress_system.sql](supabase/migrations/0006_progress_system.sql) in Supabase ausfuehren.
2. App starten:

```bash
npm run dev
```

3. Ein Interview oeffnen:

```text
http://localhost:3000/interview/[interviewId]
```

4. `Interview abschliessen und XP erhalten` anklicken.
5. Du wirst zum Dashboard weitergeleitet.
6. Dashboard pruefen:

```text
http://localhost:3000/dashboard
```

7. In Supabase pruefen:

```text
Table Editor > users > current_level, current_xp, total_interviews_completed
Table Editor > progress_history > xp_gained, previous_level, new_level
```

## Regelbasierte Bewertung lokal testen

1. Migration [supabase/migrations/0007_rule_based_evaluation.sql](supabase/migrations/0007_rule_based_evaluation.sql) in Supabase ausfuehren.
2. Ein Interview mit mindestens einer Kandidatenantwort oeffnen:

```text
http://localhost:3000/interview/[interviewId]
```

3. `Bewertung erstellen` anklicken.
4. Du wirst weitergeleitet zu:

```text
http://localhost:3000/auswertung/[interviewId]
```

5. In Supabase pruefen:

```text
Table Editor > interview_evaluations
```

Limitierungen:

- Keine OpenAI-Bewertung.
- Keine semantische Analyse.
- Die Bewertung basiert nur auf einfachen Regeln, Wortlisten und Antwortlaengen.
- Gute Antworten koennen schlechter bewertet werden, wenn sie wenige erkennbare Begriffe enthalten.
- Die Bewertung ist als erste Orientierung gedacht, nicht als finale Interviewanalyse.

## KI-Coaching-Bericht lokal testen

1. Migration [supabase/migrations/0008_ai_coaching_report.sql](supabase/migrations/0008_ai_coaching_report.sql) in Supabase ausfuehren.
2. In `.env.local` sicherstellen:

```env
OPENAI_API_KEY=dein-openai-api-key
OPENAI_MODEL=gpt-5-mini
```

3. Fuer ein Interview zuerst eine regelbasierte Bewertung erstellen.
4. Auswertungsseite oeffnen:

```text
http://localhost:3000/auswertung/[interviewId]
```

5. `KI-Coaching erstellen` anklicken.
6. Nach Erfolg erscheint der Bericht direkt auf der Auswertungsseite.
7. In Supabase pruefen:

```text
Table Editor > interview_evaluations > ai_summary, ai_strengths, ai_weaknesses, ai_recommendations, ai_top_risks, ai_improved_answers, ai_created_at
```

Wichtig:

- Der KI-Coaching-Bericht wird nur auf aktiven Button-Klick erzeugt.
- Die regelbasierte Bewertung bleibt bestehen.
- Das Coaching nutzt OpenAI und ist deshalb kostenpflichtig pro Klick.
- Die Ausgabe ist begrenzt mit `max_output_tokens: 1200` und `reasoning: { effort: "minimal" }`.

## Persona-Qualitaet automatisch testen

Phase 10.7 enthaelt ein separates Testsystem fuer die Interview-Personas. Es nutzt keine produktiven Nutzerkonten und schreibt keine Datenbankeintraege. Die bestehende Interview-Engine wird direkt mit einem In-Memory-Gespraechsverlauf ausgefuehrt.

Kostenkontrolle: Ohne ausdrueckliche Bestaetigung startet kein kostenpflichtiger Testlauf.

API-Aufrufe nur schaetzen:

```bash
npm run test:personas
```

Vollstaendigen Testlauf starten:

```bash
npm run test:personas -- --confirm-cost
```

Einzelne Persona testen:

```bash
npm run test:personas -- --persona anna --level 2 --runs 1 --confirm-cost
```

Unterstuetzte Personas:

```text
anna
thomas
michael
sabine
all
```

Runs begrenzen:

```env
PERSONA_TEST_MAX_RUNS=2
```

Der Runner begrenzt Runs bewusst auf maximal 2 pro Konfiguration, damit die API-Kosten kontrollierbar bleiben.

Optionalen AI-Judge aktivieren:

```env
PERSONA_TEST_AI_JUDGE=true
```

Der AI-Judge ist standardmaessig deaktiviert. Wenn aktiviert, erzeugt er maximal einen zusaetzlichen OpenAI-Aufruf pro vollstaendigem Testinterview.

Ergebnisdateien findest du danach in:

```text
test-results/
```

Pro Testlauf werden erzeugt:

```text
persona-qa-YYYY-MM-DD-HHMM.json
persona-qa-YYYY-MM-DD-HHMM.md
```

Der Markdown-Bericht enthaelt:

- getestete Persona und Level
- Bewerberprofil
- vollstaendigen Gespraechsverlauf
- Gesamtscore
- bestandene und fehlgeschlagene Checks
- problematische Stellen
- Wiederholungen
- unbeantwortete Kandidatenfragen
- Rueckfragen pro Thema
- empfohlene Prompt-Aenderungen
- Vergleichstabelle der Personas

## Supabase Auth konfigurieren

Im Supabase Dashboard:

1. `Authentication > Providers` oeffnen.
2. `Email` aktivieren.
3. Fuer lokale Entwicklung unter `Authentication > URL Configuration` setzen:

```text
Site URL: http://localhost:3000
Redirect URLs: http://localhost:3000/auth/callback
```

Wenn du spaeter deployest, fuegst du dort zusaetzlich deine Produktionsdomain ein.

## Projektstruktur

```text
src/
  app/
    page.tsx                    Landing Page
    (auth)/login/page.tsx       Login
    (auth)/register/page.tsx    Registrierung
    auth/actions.ts             Server Actions fuer Auth
    auth/callback/route.ts      Supabase Auth Callback
    dashboard/page.tsx          Dashboard
    interview-vorbereitung/     Interview-Vorbereitung
    interview/[interviewId]/     Interview-Session Detailseite
    live-interview/             Live Interview
    auswertung/                 Auswertung
    replay-center/              Replay Center
  components/
    layout/                     Navigation und Layout-Bausteine
    ui/                         Kleine wiederverwendbare UI-Komponenten
  lib/
    config/                     App-Konfiguration
    supabase/                   Supabase Clients
    queries/                    Datenbank-Queries
    resumes/                    PDF-Parsing und Lebenslauf-Heuristik
    job-postings/               Stellenanzeigen-Heuristik
    interviews/                 Interview-Personas
    ai/                         OpenAI-Services fuer Interview und Coaching
    progress/                   XP, Level, Achievements und Streaks
    testing/                    Persona-QA Runner, synthetische Kandidaten und Checks
  types/                        Gemeinsame TypeScript-Typen
middleware.ts                   Session Handling und Protected Routes
supabase/migrations/            SQL-Migrationen
```

## Nuetzliche Befehle

```bash
npm run dev        # Startet die lokale Entwicklung
npm run build      # Baut die App fuer Produktion
npm run start      # Startet den Produktionsbuild
npm run lint       # Fuehrt Next.js Linting aus
npm run typecheck  # Prueft TypeScript-Typen
npm run test:personas # Schaetzt Persona-QA Kosten; mit -- --confirm-cost starten
```

## Aktueller Umfang

Enthalten:

- Next.js App Router
- TypeScript
- Tailwind CSS
- Deutsche Platzhalterseiten
- Supabase Browser- und Server-Client-Grundlage
- Supabase Auth Registrierung, Login, Logout
- Session Handling via Middleware
- Protected Dashboard Route
- SQL-Migration fuer Auth-nahe Tabellen
- TypeScript Types fuer alle Tabellen
- Query-Helper fuer Nutzer, Lebenslauf und Stellenanzeige
- PDF-Upload fuer Lebenslaeufe
- Supabase Storage Integration fuer privaten Bucket `resumes`
- PDF-Text-Extraktion mit `pdf-parse`
- einfache Resume Parsing V1 Funktion ohne OpenAI
- Stellenanzeigen-Eingabe und Parsing V1 ohne OpenAI
- Interview-Session-Setup mit Resume, Stellenanzeige, Dauer, Level und Persona
- Textbasiertes KI-Interview mit OpenAI Responses API
- Speicherung von Interview-Nachrichten
- Regelbasierte Interview-Auswertung ohne OpenAI
- Optionaler KI-Coaching-Bericht als Zusatz zur Regelbewertung
- XP-/Level-System mit Fortschrittsbalken
- Achievements auf dem Dashboard
- Progress History pro abgeschlossenem Interview
- `.env.example`
- README fuer Einsteiger

Noch nicht enthalten:

- Audioaufnahme oder Wiedergabe
- Speech-to-Text
- Text-to-Speech
- Replay-Funktionen
- Zahlungsfunktionen
