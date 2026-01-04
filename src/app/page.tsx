'use client';
import { useState } from 'react';

export default function JobOfferPage() {
  const [loading, setLoading] = useState(false);
  type JobOfferResult = {
    verdict: string;
    explanation: string;
    raw: unknown;
  };

  const [result, setResult] = useState<JobOfferResult | null>(null);
  const [form, setForm] = useState({
      currentGrossMonthly: 3000000,
      newGrossMonthly: 5000000,
      commuteMinutesDelta: 60,
      commuteCostDelta: 500000,
      onCallWeekend: false,
      freeTimeValue: 'medium',
  });

  async function submit(e?: React.FormEvent<HTMLFormElement>) {
    e?.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/job-offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      setResult(json.result);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <form onSubmit={submit} className="space-y-4">
        <label>Current Gross / month
          <input type="number" value={form.currentGrossMonthly}
            onChange={e=>setForm({...form, currentGrossMonthly: Number(e.target.value)})} />
        </label>
        <label>New Offer Gross / month
          <input type="number" value={form.newGrossMonthly}
            onChange={e=>setForm({...form, newGrossMonthly: Number(e.target.value)})} />
        </label>
        <label>Commute minutes delta (new - current)
          <input type="number" value={form.commuteMinutesDelta}
            onChange={e=>setForm({...form, commuteMinutesDelta: Number(e.target.value)})} />
        </label>
        <label>Commute cost delta (monthly)
          <input type="number" value={form.commuteCostDelta}
            onChange={e=>setForm({...form, commuteCostDelta: Number(e.target.value)})} />
        </label>
        <label>
          <input type="checkbox" checked={form.onCallWeekend}
            onChange={e=>setForm({...form, onCallWeekend: e.target.checked})} /> On-call / weekend
        </label>
        <label>Free time value
          <select value={form.freeTimeValue}
            onChange={e=>setForm({...form, freeTimeValue: e.target.value})}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
        <button type="submit" disabled={loading}>Run Reality Check</button>
      </form>

      {result && (
        <section className="mt-6 p-4 border">
          <h3>Verdict: {result.verdict}</h3>
          <p>{result.explanation}</p>
          <pre>{JSON.stringify(result.raw, null, 2)}</pre>
        </section>
      )}
    </main>
  );
}
