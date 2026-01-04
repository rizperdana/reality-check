export type Lang = 'id' | 'en';
export const DEFAULT_LANG: Lang = 'id';

export const DATA_VERSION = { id: 'pph21_v1', updatedAt: '2026-01-01' } as const;

export const i18n = {
    id: {
        ui: {
            title: 'RealityCheck — Job Offer Reality',
            description:
            'Masukkan gaji sekarang dan tawaran baru. Alat ini memberi gambaran realistis apakah gaji lebih tinggi benar-benar menambah uang yang Anda pegang dan kualitas hidup (waktu, biaya, stres).',
            dataLabel: 'Data',
            updated: 'updated',
            attentionTitle: 'Perhatian singkat:',
            attentionText:
            'Ini simulasi berbasis aturan umum. Angka bisa berbeda dari slip gaji final — gunakan untuk membandingkan dan mengambil keputusan, bukan sebagai pengganti konsultan pajak.',
            whoFor:
            'Cocok untuk karyawan bergaji tetap yang membandingkan tawaran kerja baru — terutama bila ada perubahan pajak, commute, jam kerja, atau waktu keluarga.',
            startButton: 'Run Reality Check',
            reset: 'Reset',
            loading: 'Menghitung…',
            whyToggle: 'Mengapa hasil mungkin berbeda (klik untuk jelaskan)',
            whyList: [
                'Menggunakan asumsi konservatif untuk PPh21 & BPJS — bukan perhitungan slip final.',
                'Potongan lain (pinjaman, tunjangan khusus) tidak ikut dihitung kecuali dimasukkan.',
                'Untuk angka pajak tepat, minta slip gaji atau konsultasi pajak.',
            ],
            resultFor: {
                positive: 'Layak',
                tradeoff: 'Trade-off',
                negative: 'Tidak layak',
            },
            scoreLabel: 'Skor akhir',
            changeTakeHome: 'Perubahan take-home / bulan',
            timePenalty: 'Time penalty',
            lifestylePenalty: 'Lifestyle penalty',
            shortSummaryTitle: 'Penjelasan singkat',
            suggestionsTitle: 'Langkah yang bisa ditempuh',
            notConsideredTitle: 'Tidak termasuk',
            notConsideredList: ['Bonus tahunan', 'Saham / ESOP', 'Benefit non-tunai', 'Reputasi perusahaan jangka panjang'],
            languageLabel: 'Language',
            errors: {
                invalidCurrent: 'Gaji sekarang harus lebih besar dari 0.',
                invalidNew: 'Gaji tawaran harus lebih besar dari 0.',
                tooSmall: 'Masukkan angka realistis untuk gaji.',
                serverError: 'Kesalahan server saat menghitung.',
                noResult: 'Tidak ada hasil yang diterima dari server.',
            },
            donateTitle: 'Bantu jaga alat ini tetap gratis',
            donateText: 'Jika simulasi ini membantumu mengambil keputusan, pertimbangkan untuk memberi dukungan kecil agar server tetap berjalan.',
            donateButton: 'Traktir Kopi (via Saweria)',
        },
        form: {
            currentGross: 'Gaji sekarang (gross / bulan)',
            newGross: 'Gaji tawaran (gross / bulan)',
            commuteMinutes: 'Perubahan waktu commute (menit/hari)',
            commuteCost: 'Perubahan biaya transport (Rp / bulan)',
            freeTimeValue: 'Nilai waktu luang',
            onCall: 'On-call / akhir pekan',
            bpjs: 'Ikut BPJS',
            status: 'Status',
            dependents: 'Tanggungan',
            lifeConditions: 'Kondisi kehidupan (opsional)',
            likelyMoreStress: 'Kemungkinan stres meningkat',
            lessFamilyTime: 'Waktu untuk keluarga berkurang',
            unclearExpectations: 'Peran / ekspektasi kurang jelas',
            low: 'Rendah',
            medium: 'Sedang',
            high: 'Tinggi',
            single: 'Lajang',
            married: 'Menikah',
        },
        suggestions: {
            negotiatePay: 'Negosiasikan gaji atau tunjangan transport/remote.',
            askHybrid: 'Coba minta opsi hybrid / kompensasi waktu / work-from-home.',
            clarifyWork: 'Minta penjelasan jam kerja, beban on-call, dan cuti.',
            considerLongTerm: 'Pertimbangkan benefit jangka panjang (karier, bonus).',
        },
    },
    en: {
        ui: {
            title: 'RealityCheck — Job Offer Reality',
            description:
            'Enter your current salary and the new offer. This tool gives a realistic view whether a higher gross salary actually improves your take-home pay and life (time, cost, stress).',
            dataLabel: 'Data',
            updated: 'updated',
            attentionTitle: 'Quick note:',
            attentionText:
            'This is a simulation using general rules. Numbers may differ from official payslips — use for comparison and decision-making, not as tax advice.',
            whoFor:
            'Suitable for salaried employees comparing a new job offer — especially when taxes, commute, working hours, or family time change.',
            startButton: 'Run Reality Check',
            reset: 'Reset',
            loading: 'Calculating…',
            whyToggle: 'Why numbers may differ (click to expand)',
            whyList: [
                'Uses conservative assumptions for PPh21 & BPJS — not an exact payslip calculation.',
                'Other deductions (loans, special allowances) are not included unless entered.',
                'For exact tax numbers, request payslips or consult a tax professional.',
            ],
            resultFor: {
                positive: 'Positive',
                tradeoff: 'Trade-off',
                negative: 'Negative',
            },
            scoreLabel: 'Final score',
            changeTakeHome: 'Change in take-home / month',
            timePenalty: 'Time penalty',
            lifestylePenalty: 'Lifestyle penalty',
            shortSummaryTitle: 'Short summary',
            suggestionsTitle: 'What you can do',
            notConsideredTitle: 'Not considered',
            notConsideredList: ['Annual bonus', 'Equity / ESOP', 'Non-cash benefits', 'Long-term company reputation'],
            languageLabel: 'Language',
            errors: {
                invalidCurrent: 'Current salary must be greater than 0.',
                invalidNew: 'Offer salary must be greater than 0.',
                tooSmall: 'Enter a realistic salary number.',
                serverError: 'Server error while computing.',
                noResult: 'No result returned from server.',
            },
            donateTitle: 'Help keep this tool free',
            donateText: 'If this simulation helped you make a decision, consider a small donation to keep the servers running.',
            donateButton: 'Buy a Coffee (via Saweria)',
        },
        form: {
            currentGross: 'Current gross (monthly)',
            newGross: 'Offer gross (monthly)',
            commuteMinutes: 'Commute time change (min/day)',
            commuteCost: 'Transport cost change (Rp / month)',
            freeTimeValue: 'Value of free time',
            onCall: 'On-call / weekend',
            bpjs: 'BPJS participation',
            status: 'Status',
            dependents: 'Dependents',
            lifeConditions: 'Life conditions (optional)',
            likelyMoreStress: 'Likely more stress',
            lessFamilyTime: 'Less family time',
            unclearExpectations: 'Unclear role / expectations',
            low: 'Low',
            medium: 'Medium',
            high: 'High',
            single: 'Single',
            married: 'Married',
        },
        suggestions: {
            negotiatePay: 'Negotiate pay or transport/remote allowances.',
            askHybrid: 'Ask for hybrid or time compensation / work-from-home.',
            clarifyWork: 'Ask for clear working hours, on-call load and leave policy.',
            considerLongTerm: 'Consider long-term benefits (career growth, bonuses).',
        },
    },
} as const;


export function translate(lang: Lang, path: string): string | string[] {
    const parts = path.split('.');
    let cur: unknown = i18n[lang];
    for (const p of parts) {
        if (typeof cur === 'object' && cur !== null && p in (cur as Record<string, unknown>)) {
            cur = (cur as Record<string, unknown>)[p];
        } else {
            return path;
        }
    }
    return cur as string | string[];
}

export function detectLangFromNavigator(navigatorLang?: string): Lang {
    if (!navigatorLang) return DEFAULT_LANG;
    const v = navigatorLang.toLowerCase();
    return v.startsWith('id') ? 'id' : 'en';
}
