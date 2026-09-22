"use client";

import { useActionState, useState } from "react";
import { preparePresentationAction } from "@/app/praesentationen/actions";
import { presentationLevels, type PresentationState, type SourceCitation, type PresentationSource } from "@/lib/presentations/training";

const fieldClass = "mt-2 w-full rounded-lg border border-ink/20 bg-white px-3 py-2.5 text-ink outline-none focus:border-route focus:ring-2 focus:ring-route/20";

function Citations({ citations, sources }: { citations: SourceCitation[]; sources: PresentationSource[] }) {
  if (!citations.length) return null;
  return <details className="mt-3 text-xs leading-5 text-steel"><summary className="cursor-pointer font-semibold text-route">Quellenbelege ansehen</summary><div className="mt-2 space-y-2">{citations.map((citation, index) => <blockquote key={`${citation.sourceId}-${index}`} className="border-l-2 border-route/30 pl-3"><span className="font-semibold">{sources.find((source) => source.id === citation.sourceId)?.title}</span><p>„{citation.quote}“</p></blockquote>)}</div></details>;
}

export function PresentationSetup() {
  const [state, action, pending] = useActionState<PresentationState, FormData>(preparePresentationAction, {});
  const [level, setLevel] = useState<keyof typeof presentationLevels>("bachelor");
  const [topic, setTopic] = useState("");
  const [subject, setSubject] = useState("");
  const [duration, setDuration] = useState("10");
  const [sourcesOnly, setSourcesOnly] = useState(false);
  const [sources, setSources] = useState([{ title: "", content: "" }]);
  const [changed, setChanged] = useState(false);
  const updateSource = (index: number, field: "title" | "content", value: string) => {
    setSources((previous) => previous.map((source, sourceIndex) => sourceIndex === index ? { ...source, [field]: value } : source));
  };

  return <div className="grid items-start gap-6 lg:grid-cols-[1.15fr_0.85fr]">
    <form action={action} onChange={() => setChanged(true)} onSubmit={() => setChanged(false)} className="rounded-xl border border-ink/10 bg-white p-5 shadow-soft sm:p-7">
      <fieldset disabled={pending} className="space-y-6 disabled:opacity-70">
        <legend className="text-xl font-semibold text-ink">Dein Vortrag, dein Rahmen</legend>
        <label className="block text-sm font-semibold text-ink">Thema der Präsentation<input name="topic" required minLength={3} maxLength={250} value={topic} onChange={(event) => setTopic(event.target.value)} className={fieldClass} placeholder="z. B. Chancen und Grenzen künstlicher Intelligenz" /></label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-ink">Für welchen Abschluss?<select name="level" value={level} onChange={(event) => setLevel(event.target.value as keyof typeof presentationLevels)} className={fieldClass}>{Object.entries(presentationLevels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label className="block text-sm font-semibold text-ink">{level === "abi" ? "Schulfach" : "Studiengang / Fach"}<input name="subject" required maxLength={120} value={subject} onChange={(event) => setSubject(event.target.value)} className={fieldClass} placeholder={level === "abi" ? "z. B. Geschichte" : "z. B. Betriebswirtschaftslehre"} /></label>
        </div>
        <label className="block text-sm font-semibold text-ink">Vortragsdauer in Minuten<input type="number" name="durationMinutes" required min={3} max={90} step={1} value={duration} onChange={(event) => setDuration(event.target.value)} className={fieldClass} /><span className="mt-2 block text-xs font-normal leading-5 text-steel">3–90 Minuten. Rückfragen kommen anschließend dazu.</span></label>

        <section aria-labelledby="sources-title" className="border-t border-ink/10 pt-5">
          <h2 id="sources-title" className="text-lg font-semibold text-ink">Deine Quellen <span className="text-sm font-normal text-steel">optional</span></h2>
          <p className="mt-2 text-sm leading-6 text-steel">Füge relevante Textauszüge aus deinen Materialien ein. Links kannst du als Bezeichnung angeben; ihre Inhalte werden nicht automatisch geladen.</p>
          <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-lg border border-route/20 bg-route/5 p-4"><input type="checkbox" name="sourcesOnly" checked={sourcesOnly} onChange={(event) => setSourcesOnly(event.target.checked)} className="mt-1 h-4 w-4 accent-emerald-700" /><span><span className="block text-sm font-bold text-route">Nur meine Quellen verwenden</span><span className="mt-1 block text-xs leading-5 text-steel">Die KI soll fachliche Inhalte und Rückfragen ausschließlich daraus ableiten und fehlende Informationen benennen.</span></span></label>
          <div className="mt-4 space-y-4">{sources.map((source, index) => <div key={index} className="rounded-lg border border-ink/10 bg-ink/[0.02] p-4">
            <div className="flex items-center justify-between"><h3 className="text-sm font-semibold">Quelle {index + 1}</h3>{sources.length > 1 ? <button type="button" onClick={() => { setSources((previous) => previous.filter((_, sourceIndex) => sourceIndex !== index)); setChanged(true); }} className="min-h-9 px-2 text-xs font-medium text-red-700">Entfernen</button> : null}</div>
            <label className="mt-2 block text-xs font-medium">Titel oder Quellenangabe<input name={`sourceTitle${index + 1}`} maxLength={200} required={Boolean(source.content) || (sourcesOnly && index === 0)} value={source.title} onChange={(event) => updateSource(index, "title", event.target.value)} className={fieldClass} placeholder="z. B. Lehrbuch, Kapitel 3, S. 42–44" /></label>
            <label className="mt-3 block text-xs font-medium">Quellentext / relevanter Auszug<textarea name={`sourceContent${index + 1}`} rows={5} minLength={20} maxLength={12000} required={Boolean(source.title) || (sourcesOnly && index === 0)} value={source.content} onChange={(event) => updateSource(index, "content", event.target.value)} className={fieldClass} placeholder="Hier den tatsächlichen Quellentext einfügen …" /></label>
          </div>)}</div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">{sources.length < 5 ? <button type="button" onClick={() => setSources((previous) => [...previous, { title: "", content: "" }])} className="min-h-10 rounded-lg border border-ink/15 px-3 py-2 text-sm font-semibold text-ink">+ Weitere Quelle</button> : null}<p className="text-xs text-steel">Bis zu 5 Quellen · insgesamt 30.000 Zeichen</p></div>
        </section>
        <button type="submit" className="min-h-11 w-full rounded-lg bg-route px-5 py-3 text-sm font-semibold text-white hover:bg-route/90 disabled:cursor-wait">{pending ? "Training wird vorbereitet …" : "Trainingsplan und Rückfragen erstellen"}</button>
      </fieldset>
      <div aria-live="polite">{state.error ? <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{state.error}</p> : null}{pending ? <p className="mt-3 text-sm text-steel">Die KI stimmt Ablauf und Fragen auf deine Angaben ab.</p> : null}</div>
    </form>

    <aside className="space-y-5" aria-label="Dein Präsentationstraining">
      <div className="rounded-xl bg-asphalt p-6 text-white"><p className="text-xs font-bold uppercase tracking-[0.18em] text-signal">Dein Trainingsrahmen</p><h2 className="mt-3 text-xl font-bold">{topic || "Worüber möchtest du sprechen?"}</h2><p className="mt-3 text-sm text-white/75">{presentationLevels[level]}{subject ? ` · ${subject}` : ""} · {duration || "–"} Minuten</p><span className="mt-4 inline-flex rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium">{sourcesOnly ? "Ausschließlich eigene Quellen" : "Eigene Quellen + allgemeines Wissen"}</span><p className="mt-4 text-sm leading-6 text-white/70">Du erhältst einen Ablauf mit Zeitbudgets und passende Fragen zum selbstständigen Üben. Sprachaufnahme und automatische Vortragsbewertung folgen später.</p></div>
      {state.plan && state.settings ? <section className="rounded-xl border border-route/20 bg-white p-6 shadow-soft">
        <p className="text-xs font-bold uppercase tracking-wide text-route">Dein erstellter Trainingsplan</p><h2 className="mt-2 text-xl font-bold">{state.settings.topic}</h2><p className="mt-2 text-xs text-steel">{presentationLevels[state.settings.level]} · {state.settings.subject} · {state.settings.durationMinutes} Minuten · {state.settings.sourcesOnly ? "Nur eigene Quellen" : "Allgemeines Wissen erlaubt"}</p>
        {changed ? <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-950">Deine Einstellungen wurden geändert. Erstelle den Plan erneut, damit er dazu passt.</p> : null}
        {state.plan.sourceGaps ? <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-950"><strong>Offene Grundlagen: </strong>{state.plan.sourceGaps}</p> : null}
        <ol className="mt-5 space-y-5">{state.plan.sections.map((section, index) => <li key={index}><div className="flex justify-between gap-3"><h3 className="font-semibold">{index + 1}. {section.title}</h3><span className="shrink-0 text-sm font-semibold text-route">{section.minutes} Min.</span></div><p className="mt-2 text-sm leading-6 text-steel">{section.focus}</p><Citations citations={section.citations} sources={state.settings!.sources} /></li>)}</ol>
        {state.plan.questions.length ? <div className="mt-6 border-t border-ink/10 pt-5"><h3 className="font-bold">Rückfragen zum Üben</h3><ol className="mt-4 space-y-4">{state.plan.questions.map((item, index) => <li key={index} className="rounded-lg bg-route/5 p-3"><p className="text-sm leading-6">{index + 1}. {item.question}</p><Citations citations={item.citations} sources={state.settings!.sources} /></li>)}</ol></div> : null}
        <p className="mt-5 text-xs leading-5 text-steel">Der Plan bleibt in dieser geöffneten Seite. Prüfe die fachlichen Aussagen und Quellenbezüge vor der Verwendung.</p>
      </section> : <div className="rounded-xl border border-ink/10 bg-white p-6"><h2 className="font-semibold">Passend zu deinem Niveau</h2><ul className="mt-4 space-y-3 text-sm leading-6 text-steel"><li><strong className="text-ink">Abitur:</strong> verständlich erklären und Zusammenhänge einordnen.</li><li><strong className="text-ink">Bachelor:</strong> fachlich argumentieren und Methoden begründen.</li><li><strong className="text-ink">Master:</strong> Grenzen diskutieren und kritische Rückfragen durchdenken.</li></ul></div>}
    </aside>
  </div>;
}
