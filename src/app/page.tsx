// src/app/job-offer/page.tsx
'use client';

import { useState } from 'react';

type FreeTimeValue = 'low' | 'medium' | 'high';
type MaritalStatus = 'single' | 'married';

type LifestyleFlags = {
  likelyMoreStress?: boolean;
  lessFamilyTime?: boolean;
  unclearExpectations?: boolean;
};

type JobOfferForm = {
  currentGrossMonthly: number;
  newGrossMonthly: number;
  commuteMinutesDelta: number;
  commuteCostDelta: number;
  onCallWeekend: boolean;
  freeTimeValue: FreeTimeValue;
  maritalStatus: MaritalStatus;
  dependents: number;
  bpjsParticipation: boolean;
  lifestyleFlags: LifestyleFlags;
};

type JobOfferResult = {
  moneyDelta: number;
  moneyScore: number;
  timePenalty: number;
  lifestylePenalty: number;
  finalScore: number;
  verdict: 'POSITIVE' | 'TRADEOFF' | 'NEGATIVE';
  keyDrivers: string[];
  explanation: string;
  raw: {
    estimatedCurrentNet: number;
    estimatedNewNet: number;
  };
};

export default function JobOfferPage(): JSX.Element {
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

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<JobOfferResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof JobOfferForm>(key: K, value: JobOfferForm[K]) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  function updateLifestyle(flag: keyof LifestyleFlags, checked: boolean) {
    setForm((s) => ({ ...s, lifestyleFlags: { ...s.lifestyleFlags, [flag]: checked } }));
  }

  function validate(f: JobOfferForm): string | null {
    if (f.currentGrossMonthly <= 0) return 'Current gross monthly must be greater than 0';
    if (f.newGrossMonthly <= 0) return 'New offer gross monthly must be greater than 0';
    return null;
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    setResult(null);

    const v = validate(form);
    if (v) {
      setError(v);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/job-offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown server error' }));
        setError(err?.error ?? 'Server error');
        return;
      }

      const payload = (await res.json()) as { ok: boolean; result?: JobOfferResult; error?: string };
      if (!payload.ok) {
        setError(payload.error ?? 'Computation failed');
        return;
      }
      if (!payload.result) {
        setError('No result returned');
        return;
      }

      setResult(payload.result);
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setError((err as any)?.message ?? 'Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto w-full max-w-4xl px-4 py-12">
        <h1 className="text-3xl font-semibold mb-4">RealityCheck — Job Offer Reality</h1>

        <form onSubmit={handleSubmit} className="grid gap-4 bg-neutral-900 p-6 rounded-lg shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <div className="text-sm text-neutral-300">Current gross / month</div>
              <input
                className="mt-1 w-full rounded border border-neutral-800 bg-neutral-950 p-2 text-sm"
                type="number"
                value={form.currentGrossMonthly}
                onChange={(e) => update('currentGrossMonthly', Number(e.target.value))}
                min={0}
                step={10000}
              />
            </label>

            <label className="block">
              <div className="text-sm text-neutral-300">New offer gross / month</div>
              <input
                className="mt-1 w-full rounded border border-neutral-800 bg-neutral-950 p-2 text-sm"
                type="number"
                value={form.newGrossMonthly}
                onChange={(e) => update('newGrossMonthly', Number(e.target.value))}
                min={0}
                step={10000}
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="block">
              <div className="text-sm text-neutral-300">Commute minutes delta (new − current)</div>
              <input
                className="mt-1 w-full rounded border border-neutral-800 bg-neutral-950 p-2 text-sm"
                type="number"
                value={form.commuteMinutesDelta}
                onChange={(e) => update('commuteMinutesDelta', Number(e.target.value))}
                step={5}
                min={-600}
                max={600}
              />
            </label>

            <label className="block">
              <div className="text-sm text-neutral-300">Commute cost delta (monthly)</div>
              <input
                className="mt-1 w-full rounded border border-neutral-800 bg-neutral-950 p-2 text-sm"
                type="number"
                value={form.commuteCostDelta}
                onChange={(e) => update('commuteCostDelta', Number(e.target.value))}
                step={1000}
                min={-1000000}
                max={10000000}
              />
            </label>

            <label className="block">
              <div className="text-sm text-neutral-300">Free time value</div>
              <select
                className="mt-1 w-full rounded border border-neutral-800 bg-neutral-950 p-2 text-sm"
                value={form.freeTimeValue}
                onChange={(e) => update('freeTimeValue', e.target.value as FreeTimeValue)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.onCallWeekend}
                onChange={(e) => update('onCallWeekend', e.target.checked)}
                className="h-4 w-4 rounded border-neutral-700 bg-neutral-900"
              />
              <span className="text-sm text-neutral-300">On-call / weekend</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.bpjsParticipation}
                onChange={(e) => update('bpjsParticipation', e.target.checked)}
                className="h-4 w-4 rounded border-neutral-700 bg-neutral-900"
              />
              <span className="text-sm text-neutral-300">BPJS participation</span>
            </label>

            <label className="flex items-center gap-2">
              <div className="text-sm text-neutral-300">Marital status</div>
              <select
                className="ml-2 rounded border border-neutral-800 bg-neutral-950 p-2 text-sm"
                value={form.maritalStatus}
                onChange={(e) => update('maritalStatus', e.target.value as MaritalStatus)}
              >
                <option value="single">Single</option>
                <option value="married">Married</option>
              </select>
            </label>

            <label className="flex items-center gap-2">
              <div className="text-sm text-neutral-300">Dependents</div>
              <input
                className="ml-2 w-20 rounded border border-neutral-800 bg-neutral-950 p-2 text-sm"
                type="number"
                value={form.dependents}
                onChange={(e) => update('dependents', Number(e.target.value))}
                min={0}
                max={10}
              />
            </label>
          </div>

          <fieldset className="mt-2 border-t border-neutral-800 pt-4">
            <legend className="text-sm text-neutral-300">Lifestyle flags (optional)</legend>
            <div className="mt-2 flex flex-wrap gap-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.lifestyleFlags.likelyMoreStress ?? false}
                  onChange={(e) => updateLifestyle('likelyMoreStress', e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-700 bg-neutral-900"
                />
                <span className="text-sm text-neutral-300">Likely more stress</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.lifestyleFlags.lessFamilyTime ?? false}
                  onChange={(e) => updateLifestyle('lessFamilyTime', e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-700 bg-neutral-900"
                />
                <span className="text-sm text-neutral-300">Less family time</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.lifestyleFlags.unclearExpectations ?? false}
                  onChange={(e) => updateLifestyle('unclearExpectations', e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-700 bg-neutral-900"
                />
                <span className="text-sm text-neutral-300">Unclear role / expectations</span>
              </label>
            </div>
          </fieldset>

          <div className="pt-4 flex items-center justify-between">
            <div className="text-sm text-rose-400">{error ?? null}</div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setForm({
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
                  setResult(null);
                  setError(null);
                }}
                className="rounded-md border border-neutral-800 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-900"
                type="button"
              >
                Reset
              </button>

              <button
                type="submit"
                disabled={loading}
                className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition
                  ${loading ? 'bg-neutral-700 text-neutral-400 cursor-not-allowed' : 'bg-emerald-500 text-black hover:brightness-95'}`}
              >
                {loading ? (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                ) : null}
                {loading ? 'Checking…' : 'Run Reality Check'}
              </button>
            </div>
          </div>
        </form>

        {result && (
          <section className="mt-6 p-4 rounded-lg bg-neutral-900 border border-neutral-800">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Verdict: {result.verdict}</h2>
              <div className="text-sm text-neutral-400">Final score: {result.finalScore}</div>
            </div>

            <p className="mt-3 text-neutral-300">{result.explanation}</p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-neutral-950 rounded">
                <div className="text-xs text-neutral-400">Net change / month</div>
                <div className="mt-1 font-medium">{result.raw.estimatedNewNet - result.raw.estimatedCurrentNet >= 0 ? `+Rp ${Math.abs(result.moneyDelta).toLocaleString('id-ID')}` : `-Rp ${Math.abs(result.moneyDelta).toLocaleString('id-ID')}`}</div>
              </div>

              <div className="p-3 bg-neutral-950 rounded">
                <div className="text-xs text-neutral-400">Time penalty</div>
                <div className="mt-1 font-medium">{result.timePenalty}</div>
              </div>

              <div className="p-3 bg-neutral-950 rounded">
                <div className="text-xs text-neutral-400">Lifestyle penalty</div>
                <div className="mt-1 font-medium">{result.lifestylePenalty}</div>
              </div>
            </div>

            <pre className="mt-4 text-xs bg-neutral-800 p-3 rounded text-neutral-300 overflow-auto">
              {JSON.stringify(result.raw, null, 2)}
            </pre>
          </section>
        )}
      </div>
    </main>
  );
}
