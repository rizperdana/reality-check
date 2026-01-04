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
  const [showDonatePopup, setShowDonatePopup] = useState<boolean>(false);

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
    lifestyleFlags: {
      likelyMoreStress: false,
      lessFamilyTime: false,
      unclearExpectations: false,
    },
  });

  // Language Detection
  useEffect(() => {
    const detected = detectLangFromNavigator(typeof navigator !== 'undefined' ? navigator.language : undefined);
    setLang(detected);
  }, []);

  // Helpers
  const t = (path: string) => translate(lang, path);

  const update = <K extends keyof JobOfferForm>(key: K, value: JobOfferForm[K]) => {
    setForm((s) => ({ ...s, [key]: value }));
  };

  const updateLifestyle = (flag: keyof JobOfferForm['lifestyleFlags'], checked: boolean) => {
    setForm((s) => ({ ...s, lifestyleFlags: { ...s.lifestyleFlags, [flag]: checked } }));
  };

  const validate = (): string | null => {
    if (form.currentGrossMonthly <= 0) return String(t('ui.errors.invalidCurrent'));
    if (form.newGrossMonthly <= 0) return String(t('ui.errors.invalidNew'));
    if (form.newGrossMonthly < 10000) return String(t('ui.errors.tooSmall'));
    return null;
  };

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    setResult(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const payloadPromise = fetch('/api/job-offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      }).then(r => r.json());

      const delayMs = 3000 + Math.floor(Math.random() * 2000);
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
    <main className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-emerald-500/30">
      <div className="mx-auto max-w-4xl px-4 py-12">
        {/* Header Section */}
        <header className="mb-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight text-white">{String(t('ui.title'))}</h1>
            <p className="mt-2 text-neutral-400 leading-relaxed">{String(t('ui.description'))}</p>
            <div className="mt-4 flex flex-wrap gap-4 text-xs font-mono text-neutral-500">
              <span>{String(t('ui.dataLabel'))}: {DATA_VERSION.id}</span>
              <span>{String(t('ui.updated'))}: {DATA_VERSION.updatedAt}</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">{String(t('ui.languageLabel'))}</span>
            <div className="flex p-1 bg-neutral-900 rounded-lg border border-neutral-800">
              {(['id', 'en'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                    lang === l ? 'bg-emerald-600 text-white shadow-lg' : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Warning Callout */}
        <div className="mb-10 rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-4 text-sm text-emerald-200/80">
          <strong className="text-emerald-400 block mb-1">{String(t('ui.attentionTitle'))}</strong>
          {String(t('ui.attentionText'))}
        </div>

        {/* Result Display */}
        {result && !loading && (
          <section className="mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className={`rounded-2xl border p-8 ${
              result.verdict === 'POSITIVE' ? 'border-emerald-500/30 bg-emerald-500/5' :
              result.verdict === 'TRADEOFF' ? 'border-amber-500/30 bg-amber-500/5' :
              'border-red-500/30 bg-red-500/5'
            }`}>
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm font-medium uppercase tracking-widest text-neutral-400">{String(t('ui.scoreLabel'))}: {result.finalScore}</span>
                <span className={`px-4 py-1 rounded-full text-xs font-bold tracking-wide border ${
                  result.verdict === 'POSITIVE' ? 'border-emerald-500 text-emerald-400' :
                  result.verdict === 'TRADEOFF' ? 'border-amber-500 text-amber-400' :
                  'border-red-500 text-red-400'
                }`}>
                  {shortVerdictLabel(result.verdict, lang)}
                </span>
              </div>

              <h2 className="text-xl font-semibold mb-4">{String(t('ui.shortSummaryTitle'))}</h2>
              <ul className="space-y-3 mb-8">
                {friendlySummary(result, form, lang).map((line, i) => (
                  <li key={i} className="text-neutral-300 flex gap-3 italic">
                    <span className="text-neutral-600">→</span> {line}
                  </li>
                ))}
              </ul>

              <h2 className="text-xl font-semibold mb-4">{String(t('ui.suggestionsTitle'))}</h2>
              <div className="grid gap-3">
                {suggestionsFor(result, lang).map((s, i) => (
                  <div key={i} className="bg-neutral-900/50 p-4 rounded-lg border border-neutral-800 text-sm">
                    {s}
                  </div>
                ))}
              </div>

              {/* Donation Call-to-Action */}
              <div className="mt-8 pt-8 border-t border-neutral-800/50">
                <div className="bg-gradient-to-br from-amber-500/10 to-transparent p-6 rounded-xl border border-amber-500/20">
                  <h3 className="text-amber-400 font-bold mb-2 flex items-center gap-2">
                    <span className="text-lg">☕</span> {String(t('ui.donateTitle'))}
                  </h3>
                  <p className="text-neutral-400 text-sm mb-5 leading-relaxed">
                    {String(t('ui.donateText'))}
                  </p>
                  <a
                    href="https://saweria.co/rizperdana"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg transition-colors w-full sm:w-auto"
                  >
                    {String(t('ui.donateButton'))}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-neutral-900/30 p-8 rounded-2xl border border-neutral-800">
          {/* Financials */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-white border-b border-neutral-800 pb-2">{lang === 'id' ? 'Finansial' : 'Financials'}</h3>

            <div className="space-y-2">
              <label className="text-sm text-neutral-400">{String(t('form.currentGross'))}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm font-mono">Rp</span>
                <input
                  type="number"
                  value={form.currentGrossMonthly}
                  onChange={(e) => update('currentGrossMonthly', Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-neutral-400 font-bold text-emerald-400">{String(t('form.newGross'))}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm font-mono">Rp</span>
                <input
                  type="number"
                  value={form.newGrossMonthly}
                  onChange={(e) => update('newGrossMonthly', Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-emerald-500/50 rounded-lg py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-mono"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 py-2">
              <input
                type="checkbox"
                checked={form.bpjsParticipation}
                onChange={(e) => update('bpjsParticipation', e.target.checked)}
                className="w-4 h-4 rounded border-neutral-700 bg-neutral-950 text-emerald-500 focus:ring-emerald-500"
              />
              <label className="text-sm text-neutral-300">{String(t('form.bpjs'))}</label>
            </div>
          </div>

          {/* Lifestyle & Commute */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-white border-b border-neutral-800 pb-2">{lang === 'id' ? 'Waktu & Biaya' : 'Time & Cost'}</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-neutral-400">{String(t('form.commuteMinutes'))}</label>
                <input
                  type="number"
                  value={form.commuteMinutesDelta}
                  onChange={(e) => update('commuteMinutesDelta', Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-neutral-400">{String(t('form.commuteCost'))}</label>
                <input
                  type="number"
                  value={form.commuteCostDelta}
                  onChange={(e) => update('commuteCostDelta', Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-neutral-400">{String(t('form.freeTimeValue'))}</label>
              <select
                value={form.freeTimeValue}
                onChange={(e) => update('freeTimeValue', e.target.value as any)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="low">{String(t('form.low'))}</option>
                <option value="medium">{String(t('form.medium'))}</option>
                <option value="high">{String(t('form.high'))}</option>
              </select>
            </div>

            <div className="space-y-3 pt-2">
              <label className="text-sm text-neutral-400">{String(t('form.lifeConditions'))}</label>
              <div className="space-y-2">
                {(Object.keys(form.lifestyleFlags) as Array<keyof typeof form.lifestyleFlags>).map((flag) => (
                  <label key={flag} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={form.lifestyleFlags[flag]}
                      onChange={(e) => updateLifestyle(flag, e.target.checked)}
                      className="w-4 h-4 rounded border-neutral-700 bg-neutral-950 text-emerald-500"
                    />
                    <span className="text-sm text-neutral-300 group-hover:text-white transition-colors">
                      {String(t(`form.${flag}`))}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="md:col-span-2 pt-6">
            {error && <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-bold rounded-xl transition-all shadow-xl shadow-emerald-900/20 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  {String(t('ui.loading'))}
                </>
              ) : (
                String(t('ui.startButton'))
              )}
            </button>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full mt-4 py-2 text-neutral-500 hover:text-neutral-300 text-sm transition-colors"
            >
              {String(t('ui.reset'))}
            </button>
          </div>
        </form>

        {/* Explainer / Disclaimer Footer */}
        <footer className="mt-12 space-y-8 border-t border-neutral-800 pt-8">
          <div>
            <button
              onClick={() => setShowWhy(!showWhy)}
              className="text-sm text-neutral-400 underline decoration-neutral-700 underline-offset-4 hover:text-neutral-200 transition-colors"
            >
              {String(t('ui.whyToggle'))}
            </button>
            {showWhy && (
              <ul className="mt-4 space-y-2">
                {(t('ui.whyList') as string[]).map((item, i) => (
                  <li key={i} className="text-xs text-neutral-500 flex gap-2">
                    <span>•</span> {item}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-sm font-semibold text-neutral-300 mb-3">{String(t('ui.notConsideredTitle'))}</h4>
              <div className="flex flex-wrap gap-2">
                {(t('ui.notConsideredList') as string[]).map((item, i) => (
                  <span key={i} className="px-2 py-1 bg-neutral-900 border border-neutral-800 rounded text-[10px] text-neutral-500 uppercase tracking-wider font-medium">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
