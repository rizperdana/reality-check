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

type ApiPayload = { ok: boolean; result?: JobOfferResult; error?: string };

const DATA_VERSION = { id: 'pph21_v1', updatedAt: '2026-01-01' };

const idr = (n: number): string => {
  return new Intl.NumberFormat('id-ID').format(n);
};

function shortVerdictLabel(verdict: JobOfferResult['verdict']): string {
  if (verdict === 'POSITIVE') return 'Layak';
  if (verdict === 'TRADEOFF') return 'Trade-off';
  return 'Tidak layak';
}

function suggestionsFor(result: JobOfferResult): string[] {
  const out: string[] = [];
  if (result.keyDrivers.includes('money') && result.moneyDelta < 1000000) {
    out.push('Negosiasikan gaji atau tunjangan transport/remote.');
  }
  if (result.keyDrivers.includes('time') || result.timePenalty >= 1) {
    out.push('Coba minta opsi hybrid / kompensasi waktu / work-from-home.');
  }
  if (result.keyDrivers.includes('lifestyle') || result.lifestylePenalty >= 1) {
    out.push('Minta penjelasan jam kerja, beban on-call, dan cuti.');
  }
  if (out.length === 0) {
    out.push('Pertimbangkan benefit jangka panjang (karier, perkembangan, bonus).');
  }
  return out;
}

function friendlySummary(result: JobOfferResult, form: JobOfferForm): string[] {
  const lines: string[] = [];
  const delta = result.moneyDelta;
  const moneyLine =
    delta >= 0 ? `Perkiraan tambahan take-home: +Rp ${idr(delta)} / bulan.` : `Perkiraan pengurangan take-home: -Rp ${idr(Math.abs(delta))} / bulan.`;
  lines.push(moneyLine);

  lines.push(`Take-home saat ini: Rp ${idr(result.raw.estimatedCurrentNet)} / bulan · Setelah pindah: Rp ${idr(result.raw.estimatedNewNet)} / bulan.`);

  if (form.commuteCostDelta !== 0) {
    const sign = form.commuteCostDelta > 0 ? '+' : '-';
    lines.push(`Biaya transport: ${sign}Rp ${idr(Math.abs(form.commuteCostDelta))} / bulan.`);
  }

  if (form.commuteMinutesDelta !== 0) {
    const signWord = form.commuteMinutesDelta > 0 ? 'bertambah' : 'berkurang';
    lines.push(`Waktu perjalanan: ${Math.abs(form.commuteMinutesDelta)} menit/hari (${signWord}).`);
  }

  if (form.onCallWeekend) {
    lines.push('Ada kerja on-call / akhir pekan — ini mengurangi waktu luang.');
  }

  if (result.keyDrivers.length > 0) {
    lines.push(`Faktor utama: ${result.keyDrivers.join(', ')}.`);
  }

  const rec = result.verdict === 'POSITIVE' ? 'Masuk akal.' : result.verdict === 'TRADEOFF' ? 'Perlu pertimbangan / negosiasi.' : 'Kemungkinan downgrade.';
  lines.push(`Ringkasan: ${rec}`);

  return lines;
}

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
  const [showWhy, setShowWhy] = useState<boolean>(false);

  function update<K extends keyof JobOfferForm>(key: K, value: JobOfferForm[K]) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  function updateLifestyle(flag: keyof LifestyleFlags, checked: boolean) {
    setForm((s) => ({ ...s, lifestyleFlags: { ...s.lifestyleFlags, [flag]: checked } }));
  }

  function validate(f: JobOfferForm): string | null {
    if (f.currentGrossMonthly <= 0) return 'Gaji sekarang harus lebih besar dari 0.';
    if (f.newGrossMonthly <= 0) return 'Gaji tawaran harus lebih besar dari 0.';
    if (f.newGrossMonthly < 10000) return 'Masukkan angka realistis untuk gaji.';
    return null;
  }

  async function handleSubmit(e?: React.FormEvent): Promise<void> {
    e?.preventDefault();
    setError(null);
    setResult(null);

    const validationMessage = validate(form);
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setLoading(true);
    try {
      const payloadPromise: Promise<ApiPayload> = fetch('/api/job-offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
        .then((r) => {
          if (!r.ok) {
            return r.json().catch(() => ({ ok: false, error: 'Server returned error' })) as ApiPayload;
          }
          return r.json() as Promise<ApiPayload>;
        })
        .catch(() => ({ ok: false, error: 'Network error' }));

      const delayMs = 3000 + Math.floor(Math.random() * 2000); // 3..5s
      const delayPromise = new Promise<void>((resolve) => setTimeout(resolve, delayMs));

      const [payload] = await Promise.all([payloadPromise, delayPromise]);

      if (!payload.ok) {
        setError(payload.error ?? 'Kesalahan server saat menghitung.');
        return;
      }
      if (!payload.result) {
        setError('Tidak ada hasil yang diterima dari server.');
        return;
      }

      setResult(payload.result);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto w-full max-w-4xl px-4 py-12">
        <header className="mb-6">
          <h1 className="text-3xl font-semibold">RealityCheck — Job Offer Reality</h1>
          <p className="mt-2 text-neutral-400">
            Masukkan gaji sekarang dan tawaran baru. Alat ini memberi gambaran realistis apakah gaji lebih tinggi benar-benar menambah uang yang
            Anda pegang dan kualitas hidup (waktu, biaya, stres).
          </p>

          <div className="mt-3 text-sm text-neutral-400">
            <span>Data: </span>
            <span className="font-mono text-xs text-neutral-300">{DATA_VERSION.id}</span>
            <span className="ml-2">· updated {DATA_VERSION.updatedAt}</span>
          </div>

          <div className="mt-3 rounded-md bg-neutral-900 p-3 border border-neutral-800 text-sm text-neutral-300">
            <strong>Perhatian singkat:</strong> Ini simulasi berbasis aturan umum. Angka bisa berbeda dari slip gaji final — gunakan untuk membandingkan dan
            mengambil keputusan, bukan sebagai pengganti konsultan pajak.
          </div>
        </header>

        <form onSubmit={handleSubmit} className="grid gap-4 bg-neutral-900 p-6 rounded-lg shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <div className="text-sm text-neutral-300">Gaji sekarang (gross / bulan)</div>
              <input
                className="mt-1 w-full rounded border border-neutral-800 bg-neutral-950 p-2 text-sm"
                type="number"
                value={form.currentGrossMonthly}
                onChange={(e) => update('currentGrossMonthly', Number(e.target.value))}
                min={0}
                step={10000}
                aria-label="Gaji sekarang"
              />
            </label>

            <label className="block">
              <div className="text-sm text-neutral-300">Gaji tawaran (gross / bulan)</div>
              <input
                className="mt-1 w-full rounded border border-neutral-800 bg-neutral-950 p-2 text-sm"
                type="number"
                value={form.newGrossMonthly}
                onChange={(e) => update('newGrossMonthly', Number(e.target.value))}
                min={0}
                step={10000}
                aria-label="Gaji tawaran"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="block">
              <div className="text-sm text-neutral-300">Perubahan waktu commute (menit/hari)</div>
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
              <div className="text-sm text-neutral-300">Perubahan biaya transport (Rp / bulan)</div>
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
              <div className="text-sm text-neutral-300">Nilai waktu luang</div>
              <select
                className="mt-1 w-full rounded border border-neutral-800 bg-neutral-950 p-2 text-sm"
                value={form.freeTimeValue}
                onChange={(e) => update('freeTimeValue', e.target.value as FreeTimeValue)}
              >
                <option value="low">Rendah</option>
                <option value="medium">Sedang</option>
                <option value="high">Tinggi</option>
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
              <span className="text-sm text-neutral-300">On-call / akhir pekan</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.bpjsParticipation}
                onChange={(e) => update('bpjsParticipation', e.target.checked)}
                className="h-4 w-4 rounded border-neutral-700 bg-neutral-900"
              />
              <span className="text-sm text-neutral-300">Ikut BPJS</span>
            </label>

            <label className="flex items-center gap-2">
              <div className="text-sm text-neutral-300">Status</div>
              <select
                className="ml-2 rounded border border-neutral-800 bg-neutral-950 p-2 text-sm"
                value={form.maritalStatus}
                onChange={(e) => update('maritalStatus', e.target.value as MaritalStatus)}
              >
                <option value="single">Lajang</option>
                <option value="married">Menikah</option>
              </select>
            </label>

            <label className="flex items-center gap-2">
              <div className="text-sm text-neutral-300">Tanggungan</div>
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
            <legend className="text-sm text-neutral-300">Kondisi kehidupan (opsional)</legend>
            <div className="mt-2 flex flex-wrap gap-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.lifestyleFlags.likelyMoreStress ?? false}
                  onChange={(e) => updateLifestyle('likelyMoreStress', e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-700 bg-neutral-900"
                />
                <span className="text-sm text-neutral-300">Kemungkinan stres meningkat</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.lifestyleFlags.lessFamilyTime ?? false}
                  onChange={(e) => updateLifestyle('lessFamilyTime', e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-700 bg-neutral-900"
                />
                <span className="text-sm text-neutral-300">Waktu untuk keluarga berkurang</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.lifestyleFlags.unclearExpectations ?? false}
                  onChange={(e) => updateLifestyle('unclearExpectations', e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-700 bg-neutral-900"
                />
                <span className="text-sm text-neutral-300">Peran / ekspektasi kurang jelas</span>
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
              >
                Reset
              </button>

              <button
                type="submit"
                disabled={loading}
                className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition
                  ${loading ? 'bg-neutral-700 text-neutral-400 cursor-not-allowed' : 'bg-emerald-500 text-black hover:brightness-95'}`}
                aria-busy={loading}
                aria-live="polite"
              >
                {loading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    <span>Menghitung…</span>
                  </>
                ) : (
                  'Run Reality Check'
                )}
              </button>
            </div>
          </div>
        </form>

        <div className="mt-4 text-sm text-neutral-400">
          <button
            type="button"
            onClick={() => setShowWhy((s) => !s)}
            className="text-left underline decoration-dashed underline-offset-2"
          >
            Mengapa hasil mungkin berbeda (klik untuk jelaskan)
          </button>

          {showWhy && (
            <div className="mt-2 rounded bg-neutral-900 p-3 border border-neutral-800 text-neutral-300">
              <ul className="list-disc pl-5 space-y-1">
                <li>Ini menggunakan asumsi konservatif untuk PPh21 & BPJS — bukan perhitungan slip final.</li>
                <li>Potongan lain (pinjaman, potongan lembur, tunjangan khusus) tidak ikut dihitung kecuali dimasukkan.</li>
                <li>Jika butuh angka akurat untuk pajak, minta slip/statement atau konsultasi pajak.</li>
              </ul>
            </div>
          )}
        </div>

        {result && (
          <section className="mt-6 p-4 rounded-lg bg-neutral-900 border border-neutral-800">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{shortVerdictLabel(result.verdict)}</h2>
              <div className="text-sm text-neutral-400">Skor akhir: {result.finalScore}</div>
            </div>

            <p className="mt-3 text-neutral-300">{result.explanation}</p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-neutral-950 rounded">
                <div className="text-xs text-neutral-400">Perubahan take-home / bulan</div>
                <div className="mt-1 font-medium">
                  {result.moneyDelta >= 0 ? `+Rp ${idr(result.moneyDelta)}` : `-Rp ${idr(Math.abs(result.moneyDelta))}`}
                </div>
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

            <div className="mt-4">
              <h3 className="text-sm font-medium text-neutral-200">Penjelasan singkat</h3>
              <ul className="mt-2 list-disc pl-5 text-neutral-300">
                {friendlySummary(result, form).map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-medium text-neutral-200">Apa yang membuat tawaran ini jelas layak?</h3>
              <ul className="mt-2 list-disc pl-5 text-neutral-300">
                {suggestionsFor(result).map((sugg) => (
                  <li key={sugg}>{sugg}</li>
                ))}
              </ul>
            </div>

            {/* <pre className="mt-4 text-xs bg-neutral-800 p-3 rounded text-neutral-300 overflow-auto">
              {JSON.stringify(result.raw, null, 2)}
            </pre> */}
          </section>
        )}
      </div>
    </main>
  );
}
