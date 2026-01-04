// src/lib/ui-helpers.ts
import type { JobOfferResult, JobOfferForm } from '@/core/modules/job-offer/types';
import { translate } from './i18n';
import type { Lang } from './i18n';
import { idr as idrFormat } from './format';

export function shortVerdictLabel(verdict: JobOfferResult['verdict'], lang: Lang): string {
    const key = verdict === 'POSITIVE' ? 'ui.resultFor.positive' : verdict === 'TRADEOFF' ? 'ui.resultFor.tradeoff' : 'ui.resultFor.negative';
    return String(translate(lang, key));
}

export function suggestionsFor(result: JobOfferResult, lang: Lang): string[] {
    const out: string[] = [];
    if (result.keyDrivers.includes('money') && result.moneyDelta < 1000000) {
        out.push(String(translate(lang, 'suggestions.negotiatePay')));
    }
    if (result.keyDrivers.includes('time') || result.timePenalty >= 1) {
        out.push(String(translate(lang, 'suggestions.askHybrid')));
    }
    if (result.keyDrivers.includes('lifestyle') || result.lifestylePenalty >= 1) {
        out.push(String(translate(lang, 'suggestions.clarifyWork')));
    }
    if (out.length === 0) {
        out.push(String(translate(lang, 'suggestions.considerLongTerm')));
    }
    return out;
}

export function friendlySummary(result: JobOfferResult, form: JobOfferForm, lang: Lang): string[] {
    const lines: string[] = [];
    const delta = result.moneyDelta;
    const moneyLine =
    delta >= 0
    ? `${lang === 'id' ? 'Perkiraan gaji bersih take-home' : 'Estimated additional take-home'}: +Rp ${idrFormat(delta, lang)} / ${lang === 'id' ? 'bulan' : 'month'}.`
    : `${lang === 'id' ? 'Perkiraan pengurangan take-home' : 'Estimated reduction in take-home'}: -Rp ${idrFormat(Math.abs(delta), lang)} / ${lang === 'id' ? 'bulan' : 'month'}.`;
    lines.push(moneyLine);

    lines.push(`${lang === 'id' ? 'Take-home saat ini' : 'Current take-home'}: Rp ${idrFormat(result.raw.estimatedCurrentNet, lang)} · ${lang === 'id' ? 'Setelah pindah' : 'After move'}: Rp ${idrFormat(result.raw.estimatedNewNet, lang)}`);

    if (form.commuteCostDelta !== 0) {
        const sign = form.commuteCostDelta > 0 ? '+' : '-';
        lines.push(`${lang === 'id' ? 'Biaya transport' : 'Transport cost'}: ${sign}Rp ${idrFormat(Math.abs(form.commuteCostDelta), lang)} / ${lang === 'id' ? 'bulan' : 'month'}.`);
    }

    if (form.commuteMinutesDelta !== 0) {
        const signWord = form.commuteMinutesDelta > 0 ? (lang === 'id' ? 'bertambah' : 'increase') : (lang === 'id' ? 'berkurang' : 'decrease');
        lines.push(`${lang === 'id' ? 'Waktu perjalanan' : 'Commute time'}: ${Math.abs(form.commuteMinutesDelta)} ${lang === 'id' ? 'menit/hari' : 'min/day'} (${signWord}).`);
    }

    if (form.onCallWeekend) {
        lines.push(lang === 'id' ? 'Ada kerja on-call / akhir pekan — ini mengurangi waktu luang.' : 'On-call / weekend work reduces free time and energy.');
    }

    if (result.keyDrivers.length > 0) {
        lines.push(`${lang === 'id' ? 'Faktor utama' : 'Main factors'}: ${result.keyDrivers.join(', ')}.`);
    }

    const rec = result.verdict === 'POSITIVE' ? (lang === 'id' ? 'Masuk akal.' : 'Reasonable.') : result.verdict === 'TRADEOFF' ? (lang === 'id' ? 'Perlu pertimbangan / negosiasi.' : 'Needs trade-off / negotiation.') : (lang === 'id' ? 'Kemungkinan downgrade.' : 'Likely a downgrade.');
    lines.push(`${lang === 'id' ? 'Ringkasan' : 'Summary'}: ${rec}`);

    return lines;
}
