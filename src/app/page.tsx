import { ButtonLink } from "@/components/ui/button-link";

const audiences = [
  ["Dein erster Job", "Nach Schule, Ausbildung oder Studium: Übe, deine Stärken zu zeigen – auch ohne jahrelange Berufserfahrung."],
  ["Dein nächster Schritt", "Für eine neue Position oder mehr Verantwortung: Bring deine Erfahrung und Erfolge verständlich auf den Punkt."],
  ["Dein neuer Weg", "Bei Branchenwechsel oder Wiedereinstieg: Trainiere, deinen Weg zu erklären und deine Motivation sichtbar zu machen."]
];
const steps = [
  ["Mach es persönlich", "Lade deinen Lebenslauf hoch, füge eine Stellenanzeige hinzu und wähle Dauer, Schwierigkeit und Interviewer."],
  ["Komm ins Gespräch", "Beantworte Fragen im KI-Textinterview. Übe mit Rückfragen zu deinen Antworten und deiner Zielposition."],
  ["Nimm etwas mit", "Nutze deine Auswertung, einen optionalen KI-Coaching-Bericht und gespeicherte Gespräche für dein nächstes Training."]
];
const mindset = [
  ["Was werden sie mich fragen?", "Ich kenne solche Situationen.", "Wiederkehrende Fragetypen können vertrauter werden. Du kannst schwierige Momente schon vor dem echten Gespräch durchspielen."],
  ["Wo soll ich anfangen?", "Ich habe ein konkretes Beispiel.", "Beim Üben sammelst du passende Erfahrungen und ordnest deine Gedanken: Was war die Situation, was hast du getan und was kam dabei heraus?"],
  ["Das war bestimmt alles falsch.", "Daran arbeite ich als Nächstes.", "Konkretes Feedback gibt dir Ansatzpunkte. So kann aus einem diffusen Gefühl ein überschaubarer nächster Schritt werden."]
];

export default function LandingPage() {
  return (
    <main>
      <section className="bg-asphalt text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-signal">Dein nächster Schritt beginnt hier</p>
            <h1 className="mt-6 text-5xl font-bold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">Mit LogiCoach<br />zum <span className="text-signal">Traumjob.</span></h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/78">
              Zeig im Bewerbungsgespräch, was in dir steckt. Trainiere mit KI, finde klare Worte und bereite dich auf die Fragen vor, die für dich zählen.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/register">Jetzt Training starten</ButtonLink>
              <ButtonLink href="#training" variant="secondary-dark">So funktioniert’s</ButtonLink>
            </div>
            <p className="mt-5 text-sm text-white/60">Alle Branchen · Dein Berufsweg · Dein Tempo</p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/5 p-5 shadow-soft sm:p-7">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-signal font-bold text-ink">L</span><div><p className="text-sm font-semibold">Dein Übungsinterview</p><p className="mt-0.5 text-xs text-white/55">Bewerbungsgespräch · Beispiel</p></div></div>
              <span className="flex items-center gap-2 rounded-full bg-route/20 px-3 py-1.5 text-xs font-semibold text-emerald-200"><span className="h-2 w-2 rounded-full bg-emerald-300" />Live</span>
            </div>
            <div className="mt-5 flex items-center justify-between text-xs text-white/55"><span>Frage 3 von 8</span><span>2:14 min</span></div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[38%] rounded-full bg-signal" /></div>
            <div className="mt-6 space-y-4 text-sm leading-6">
              <div className="flex gap-3"><span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-signal/20 text-xs font-bold text-signal">KI</span><div className="rounded-2xl rounded-tl-md bg-white/10 p-4 text-white/85">Erzähl mir von einer Herausforderung, die du gut gelöst hast. Was war dein Beitrag?</div></div>
              <div className="flex justify-end gap-3"><div className="max-w-[88%] rounded-2xl rounded-tr-md bg-route/30 p-4 text-white/90">In unserem Projekt wurde die Zeit knapp. Ich habe die Aufgaben neu priorisiert und …</div><span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-route text-xs font-bold text-white">Du</span></div>
              <div className="flex gap-3"><span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-signal/20 text-xs font-bold text-signal">KI</span><div className="rounded-2xl rounded-tl-md bg-white/10 p-4 text-white/85">Wie hast du entschieden, welche Aufgaben zuerst wichtig waren?</div></div>
            </div>
            <div className="mt-6 flex items-center gap-2 border-t border-white/10 pt-4 text-xs text-white/55"><span className="text-base" aria-hidden="true">✨</span> Die KI hört zu und fragt passend zu deiner Antwort nach.</div>
          </div>
        </div>
      </section>
      <nav aria-label="Abschnitte der Startseite" className="border-b border-ink/10 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap gap-x-7 gap-y-3 px-4 py-5 text-sm font-medium text-steel sm:px-6 lg:px-8">
          {[["#zielgruppen", "Für wen?"], ["#training", "Dein Training"], ["#motivation", "Deine Serie"], ["#fortschritt", "Fortschritt"], ["#im-kopf", "Was sich verändert"], ["#vision", "Unsere Vision"]].map(([href, label]) => <a key={href} href={href} className="hover:text-route focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-route">{label}</a>)}
        </div>
      </nav>

      <section id="zielgruppen" aria-labelledby="audience-title" className="mx-auto max-w-6xl scroll-mt-8 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-route">Für wen ist LogiCoach?</p>
        <h2 id="audience-title" className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Dein Beruf ist individuell.<br />Deine Vorbereitung auch.</h2>
        <p className="mt-4 max-w-2xl leading-7 text-steel">Egal, wo du gerade stehst: LogiCoach hilft dir, für dein nächstes Bewerbungsgespräch zu üben.</p>
        <div className="mt-9 grid gap-5 md:grid-cols-3">{audiences.map(([title, text], index) => <article key={title} className="rounded-xl border border-ink/10 bg-white p-7"><span className="text-sm font-bold text-route">0{index + 1}</span><h3 className="mt-5 text-xl font-semibold">{title}</h3><p className="mt-3 leading-7 text-steel">{text}</p></article>)}</div>
      </section>

      <section id="training" aria-labelledby="training-title" className="scroll-mt-8 border-y border-ink/10 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-route">Das kannst du heute schon tun</p>
          <h2 id="training-title" className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Vorbereiten. Ausprobieren. Weiterkommen.</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">{steps.map(([title, text], index) => <article key={title}><span className="flex h-11 w-11 items-center justify-center rounded-full bg-route/10 font-bold text-route">{index + 1}</span><h3 className="mt-5 text-xl font-semibold">{title}</h3><p className="mt-3 leading-7 text-steel">{text}</p></article>)}</div>
        </div>
      </section>

      <section id="motivation" aria-labelledby="motivation-title" className="scroll-mt-8 bg-signal/10">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-route">Dein täglicher Lernloop</p><h2 id="motivation-title" className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Jede Übung zählt.</h2><p className="mt-3 max-w-xl leading-7 text-steel">Wie bei einer Lern-App bleibst du mit kleinen Zielen am Ball: eine Runde starten, XP sammeln, deine Serie halten und den nächsten Meilenstein erreichen.</p></div>
            <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-steel shadow-sm">Spielerisch üben · ernsthaft vorbereitet</span>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <article className="rounded-xl border border-signal/30 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><span className="text-3xl" aria-hidden="true">🔥</span><span className="rounded-full bg-signal/20 px-3 py-1 text-xs font-bold text-ink">Beispiel</span></div><p className="mt-5 text-xs font-bold uppercase tracking-wider text-steel">Lernserie</p><p className="mt-1 text-3xl font-bold text-ink">7 Tage</p><p className="mt-2 text-sm leading-6 text-steel">Ein kurzer Trainingsmoment pro Tag hält deine Serie am Leben.</p></article>
            <article className="rounded-xl border border-route/20 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><span className="text-3xl" aria-hidden="true">⚡</span><span className="rounded-full bg-route/10 px-3 py-1 text-xs font-bold text-route">Heute</span></div><p className="mt-5 text-xs font-bold uppercase tracking-wider text-steel">Tagesziel</p><p className="mt-1 text-3xl font-bold text-ink">20 XP</p><div className="mt-3 h-2 overflow-hidden rounded-full bg-ink/10"><div className="h-full w-3/4 rounded-full bg-route" /></div><p className="mt-2 text-sm leading-6 text-steel">15 von 20 XP gesammelt – eine Übung fehlt noch.</p></article>
            <article className="rounded-xl border border-ink/10 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><span className="text-3xl" aria-hidden="true">🏆</span><span className="rounded-full bg-ink/5 px-3 py-1 text-xs font-bold text-steel">Nächstes Ziel</span></div><p className="mt-5 text-xs font-bold uppercase tracking-wider text-steel">Level 3</p><p className="mt-1 text-3xl font-bold text-ink">250 XP</p><p className="mt-2 text-sm leading-6 text-steel">Schalte neue Herausforderungen und anspruchsvollere Rückfragen frei.</p></article>
          </div>
          <p className="mt-5 text-xs leading-5 text-steel">Die Werte dienen als illustrative Beispiele. Deine tatsächlichen XP, Serien und Levels werden im Dashboard aus deinen abgeschlossenen Trainings berechnet.</p>
        </div>
      </section>

      <section id="fortschritt" aria-labelledby="progress-title" className="mx-auto max-w-6xl scroll-mt-8 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-route">Fortschritt sichtbar machen</p>
        <h2 id="progress-title" className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Kleine Schritte. Klarere Antworten.</h2>
        <p className="mt-4 text-sm font-semibold text-steel">Illustrative Beispiele · keine echten Nutzerdaten</p>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <article className="rounded-xl bg-asphalt p-7 text-white sm:p-9"><p className="text-sm text-white/70">Fiktiver Verlauf · Interview-Punktzahl</p><p className="mt-5 flex flex-wrap items-baseline gap-4"><span className="text-3xl text-white/55">38</span><span aria-label="steigt auf" className="text-2xl text-signal">→</span><span className="text-6xl font-bold text-signal">76</span><span className="text-sm text-white/60">/ 100</span></p><h3 className="mt-5 text-xl font-semibold">In diesem Beispiel: doppelte Punktzahl.</h3><p className="mt-3 leading-7 text-white/70">Tag 1 bis Tag 7: Konkretere Beispiele und klarer aufgebaute Antworten zeigen, wie ein Trainingsverlauf aussehen könnte.</p></article>
          <article className="rounded-xl border border-ink/10 bg-white p-7 sm:p-9"><p className="text-sm text-steel">Fiktives Beispiel · Eine Antwort weiterentwickeln</p><p className="mt-5 text-xs font-bold uppercase tracking-wider text-steel">Vor dem Training</p><p className="mt-2 text-lg leading-7">„Ich bin gut darin, Probleme zu lösen.“</p><p className="mt-6 text-xs font-bold uppercase tracking-wider text-route">Nach mehreren Übungsrunden</p><p className="mt-2 text-lg leading-7">„Als unser Termin gefährdet war, habe ich die Aufgaben priorisiert. Dadurch konnten wir die wichtigsten Ergebnisse pünktlich liefern.“</p></article>
        </div>
        <p className="mt-5 max-w-3xl text-sm leading-6 text-steel">Die Beispiele sind erfunden und zeigen keine gemessenen Erfolge. Dein Fortschritt kann anders aussehen. Trainingsscores dienen der Orientierung und garantieren weder eine Verbesserung noch eine Jobzusage.</p>
      </section>

      <section id="im-kopf" aria-labelledby="mindset-title" className="scroll-mt-8 bg-route/5">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-route">Was sich im Kopf verändern kann</p>
          <h2 id="mindset-title" className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Mehr Vertrautheit.<br />Mehr Raum für deine Stärken.</h2>
          <p className="mt-4 max-w-2xl leading-7 text-steel">Es geht nicht darum, perfekte Sätze auswendig zu lernen. Regelmäßiges Üben gibt dir Raum, Antworten auszuprobieren und deinen eigenen Zugang zum Gespräch zu finden.</p>
          <div className="mt-9 grid gap-5 md:grid-cols-3">{mindset.map(([before, after, text]) => <article key={after} className="rounded-xl border border-route/15 bg-white p-7"><p className="text-sm leading-6 text-steel">„{before}“</p><span aria-hidden="true" className="mt-4 block text-xl text-route">↓</span><h3 className="mt-3 text-xl font-semibold">„{after}“</h3><p className="mt-4 leading-7 text-steel">{text}</p></article>)}</div>
        </div>
      </section>

      <section id="vision" aria-labelledby="vision-title" className="scroll-mt-8 bg-asphalt text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
            <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-signal">Die Vision hinter LogiCoach</p><h2 id="vision-title" className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Ein Ort zum Üben.<br />Bevor es darauf ankommt.</h2></div>
            <p className="text-lg leading-8 text-white/75">Gute Vorbereitung sollte nicht davon abhängen, ob gerade jemand Zeit zum Üben hat. Wir möchten dir ein KI-Gegenüber geben, mit dem du wichtige Gespräche und Auftritte wiederholt trainieren kannst – persönlich, zugänglich und mit hilfreichem Feedback.</p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">{[
            ["Echte Sprachgespräche", "Mit der KI sprechen, spontan reagieren und natürliche Rückfragen erleben."],
            ["Uni-Präsentationen", "Vor einem KI-Publikum präsentieren und anschließend inhaltliche Rückfragen beantworten."],
            ["Fach- und Prüfungsgespräche", "Wissen erklären und Entscheidungen begründen – zum Beispiel in der Meistervorbereitung."]
          ].map(([title, text]) => <article key={title} className="rounded-xl border border-white/15 p-6"><span className="text-xs font-semibold uppercase tracking-wider text-signal">Geplant</span><h3 className="mt-4 text-lg font-semibold">{title}</h3><p className="mt-3 leading-7 text-white/70">{text}</p></article>)}</div>
          <div className="mt-12 flex flex-wrap items-center justify-between gap-6 border-t border-white/15 pt-8"><p className="text-xl font-semibold">Dein nächstes Gespräch beginnt mit deiner Vorbereitung.</p><ButtonLink href="/register">Jetzt mit LogiCoach üben</ButtonLink></div>
        </div>
      </section>
    </main>
  );
}
