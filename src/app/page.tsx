'use client';

import { useEffect, useState } from 'react';
import type { JobOfferForm, JobOfferResult } from '@/core/modules/job-offer/types';
import { detectLangFromNavigator, translate, DEFAULT_LANG, DATA_VERSION, type Lang } from '@/lib/i18n';
import { friendlySummary, suggestionsFor, shortVerdictLabel } from '@/lib/ui-helpers';

type ApiPayload = { ok: boolean; result?: JobOfferResult; error?: string };

export default function JobOfferPage(): JSX.Element {
  const [lang, setLang] = useState<Lang>(DEFAULT_LANG);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<JobOfferResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showWhy, setShowWhy] = useState<boolean>(false);

  const [form, setForm] = useState<JobOfferForm>({
    currentGrossMonthly: 8000000,
    newGrossMonthly: 10000000,
    commuteMinutesDelta: 0,
    commuteCostDelta: 0,
    onCallWeekend: false,
    freeTimeValue: 'medium',
    maritalStatus: 'single',
    dependents: 0,
    bpjsParticipation: true,
    lifestyleFlags: { likelyMoreStress: false, lessFamilyTime: false, unclearExpectations: false },
  });

  useEffect(() => {
    const detected = detectLangFromNavigator(typeof navigator !== 'undefined' ? navigator.language : undefined);
    setLang(detected);
  }, []);

  const t = (path: string) => translate(lang, path);

  const update = <K extends keyof JobOfferForm>(key: K, value: JobOfferForm[K]) => {
    setForm((s) => ({ ...s, [key]: value }));
  };

  const updateLifestyle = (flag: keyof JobOfferForm['lifestyleFlags'], checked: boolean) => {
    setForm((s) => ({ ...s, lifestyleFlags: { ...s.lifestyleFlags, [flag]: checked } }));
  };

  const formatInput = (val: number) => val.toLocaleString('en-US');
  const parseInput = (val: string) => Number(val.replace(/,/g, ''));

  // RetroUI Shared Classes
  const retroCard = "border-[3px] border-white shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] bg-neutral-900 p-6 mb-8 transition-all";
  const retroButton = "border-[3px] border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] font-bold uppercase tracking-wider transition-all";
  const retroInput = "bg-neutral-950 border-[3px] border-white p-3 font-mono text-white focus:bg-white focus:text-black outline-none transition-all w-full";

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    setResult(null);

    setLoading(true);
    try {
      // 2-3 second random delay to show "thinking" and prevent spam
      const delayMs = 2000 + Math.floor(Math.random() * 1000);

      const payloadPromise = fetch('/api/job-offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      }).then(r => r.json());

      const delayPromise = new Promise((resolve) => setTimeout(resolve, delayMs));

      const [payload] = await Promise.all([payloadPromise as Promise<ApiPayload>, delayPromise]);

      if (!payload.ok) throw new Error(payload.error || String(t('ui.errors.serverError')));
      if (!payload.result) throw new Error(String(t('ui.errors.noResult')));

      setResult(payload.result);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white font-mono p-4 md:p-8">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <header className={`${retroCard} !bg-emerald-500 !text-black !shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] flex flex-col md:flex-row justify-between items-start gap-4`}>
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2">{String(t('ui.title'))}</h1>
            <p className="font-bold text-sm leading-tight">{String(t('ui.description'))}</p>
          </div>
          <div className="flex gap-2 bg-black p-1 border-2 border-white">
            {(['id', 'en'] as const).map((l) => (
              <button key={l} onClick={() => setLang(l)} className={`px-4 py-1 text-xs font-black transition-colors ${lang === l ? 'bg-white text-black' : 'text-white hover:bg-white/10'}`}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </header>

        {/* Disclaimer Callout */}
        <div className="mb-10 border-[3px] border-white p-4 bg-yellow-400 text-black shadow-[4px_4px_0px_0px_white]">
          <strong className="block mb-1 uppercase font-black tracking-widest">{String(t('ui.attentionTitle'))}</strong>
          <p className="text-xs font-bold leading-relaxed">{String(t('ui.attentionText'))}</p>
        </div>

        {/* Result Display */}
        {result && !loading && (
          <section className={`${retroCard} border-white !bg-neutral-900 animate-in zoom-in-95 duration-300`}>
             <div className="flex justify-between border-b-2 border-white/20 pb-4 mb-6">
                <span className="bg-white text-black px-3 py-1 font-black">VERDICT: {shortVerdictLabel(result.verdict, lang)}</span>
                <span className="font-black text-2xl">SCORE: {result.finalScore}</span>
             </div>

             <div className="space-y-4 mb-8">
                {friendlySummary(result, form, lang).map((line, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <span className="bg-emerald-500 text-black px-1 font-black shrink-0">→</span>
                    <p className="font-bold italic">{line}</p>
                  </div>
                ))}
             </div>

             <div className="grid gap-3 mb-8">
                {suggestionsFor(result, lang).map((s, i) => (
                  <div key={i} className="bg-white/5 p-4 border-2 border-white/20 text-sm font-bold">
                    {s}
                  </div>
                ))}
              </div>

             {/* Small, Funny Donation Section */}
             <div className="border-t-2 border-white/20 pt-6">
                <div className="bg-emerald-500/10 text-white p-4 border-2 border-white flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-[11px] font-bold italic leading-tight">
                    <span className="mr-2">🍜</span>{String(t('ui.donateText'))}
                  </p>
                  <a href="https://saweria.co/rizperdana" target="_blank" className={`${retroButton} bg-yellow-400 text-black px-3 py-2 text-[10px] whitespace-nowrap`}>
                    {String(t('ui.donateButton'))}
                  </a>
                </div>
             </div>
          </section>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className={retroCard}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Financials Column */}
            <div className="space-y-6">
              <h2 className="bg-white text-black inline-block px-2 font-black uppercase mb-2 italic">01. Financials</h2>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-neutral-400 tracking-wider">{String(t('form.currentGross'))}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-neutral-500">RP</span>
                  <input
                    type="text" inputMode="numeric"
                    value={formatInput(form.currentGrossMonthly)}
                    onChange={(e) => update('currentGrossMonthly', parseInput(e.target.value))}
                    className={`${retroInput} pl-10`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-emerald-400 tracking-wider">{String(t('form.newGross'))}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-emerald-500">RP</span>
                  <input
                    type="text" inputMode="numeric"
                    value={formatInput(form.newGrossMonthly)}
                    onChange={(e) => update('newGrossMonthly', parseInput(e.target.value))}
                    className={`${retroInput} !border-emerald-500 pl-10`}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 py-2">
                <input
                  type="checkbox"
                  checked={form.bpjsParticipation}
                  onChange={(e) => update('bpjsParticipation', e.target.checked)}
                  className="appearance-none w-5 h-5 border-2 border-white checked:bg-emerald-500 transition-all cursor-pointer"
                />
                <label className="text-xs font-black uppercase">{String(t('form.bpjs'))}</label>
              </div>
            </div>

            {/* Lifestyle Column */}
            <div className="space-y-6">
              <h2 className="bg-white text-black inline-block px-2 font-black uppercase mb-2 italic">02. Time & Life</h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-neutral-400">{String(t('form.commuteMinutes'))}</label>
                   <input
                      type="number"
                      value={form.commuteMinutesDelta}
                      onChange={(e) => update('commuteMinutesDelta', Number(e.target.value))}
                      className={retroInput}
                    />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-neutral-400">{String(t('form.commuteCost'))}</label>
                   <input
                      type="text"
                      inputMode="numeric"
                      value={formatInput(form.commuteCostDelta)}
                      onChange={(e) => update('commuteCostDelta', parseInput(e.target.value))}
                      className={retroInput}
                    />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-neutral-400 tracking-wider">{String(t('form.freeTimeValue'))}</label>
                <select
                  value={form.freeTimeValue}
                  onChange={(e) => update('freeTimeValue', e.target.value as any)}
                  className={`${retroInput} appearance-none cursor-pointer`}
                >
                  <option value="low" className="text-black">{String(t('form.low'))}</option>
                  <option value="medium" className="text-black">{String(t('form.medium'))}</option>
                  <option value="high" className="text-black">{String(t('form.high'))}</option>
                </select>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                {(Object.keys(form.lifestyleFlags) as Array<keyof typeof form.lifestyleFlags>).map((flag) => (
                  <label key={flag} className="flex items-center gap-3 cursor-pointer group p-1 transition-all">
                    <input
                      type="checkbox"
                      checked={form.lifestyleFlags[flag]}
                      onChange={(e) => updateLifestyle(flag, e.target.checked)}
                      className="appearance-none w-5 h-5 border-2 border-white checked:bg-emerald-500 transition-all cursor-pointer"
                    />
                    <span className="text-[11px] font-black uppercase text-neutral-300 group-hover:text-white">
                      {String(t(`form.${flag}`))}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-6">
            {error && <div className="mb-6 p-4 border-2 border-red-500 bg-red-500/10 text-red-500 font-black uppercase text-xs">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className={`${retroButton} w-full py-5 text-xl bg-emerald-500 text-black hover:bg-white disabled:bg-neutral-800 disabled:text-neutral-500 disabled:shadow-none`}
            >
              {loading ? "THINKING..." : String(t('ui.startButton'))}
            </button>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full mt-6 text-xs font-black uppercase text-neutral-600 hover:text-white underline decoration-2 underline-offset-4"
            >
              {String(t('ui.reset'))}
            </button>
          </div>
        </form>

        {/* Footnotes */}
        <footer className="mt-12 space-y-8 opacity-60">
          <div className={`${retroCard} !shadow-none !p-4 !mb-0 text-[11px]`}>
            <button
              onClick={() => setShowWhy(!showWhy)}
              className="font-black uppercase underline decoration-2 underline-offset-4 mb-3 block"
            >
              {String(t('ui.whyToggle'))}
            </button>
            {showWhy && (
              <ul className="space-y-2 font-bold italic">
                {(t('ui.whyList') as string[]).map((item, i) => (
                  <li key={i}>// {item}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase">
            <div className="flex gap-4">
              <span>DATA: {DATA_VERSION.id}</span>
              <span>VER: {DATA_VERSION.updatedAt}</span>
            </div>
            <div>REALITYCHECK.ID // 2026</div>
          </div>
        </footer>
      </div>
    </main>
  );
}
