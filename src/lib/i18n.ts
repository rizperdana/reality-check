export type Lang = 'id' | 'en';
export const DEFAULT_LANG: Lang = 'id';

export const DATA_VERSION = { id: 'pph21_v1', updatedAt: '2026-01-01' } as const;

export const i18n = {
    id: {
        ui: {
            title: 'RealityCheck - Cek Tawaran Kerja',
            description:
            'Masukin gaji sekarang dan tawaran baru. Kita bantu lo cek: apa gaji lebih gede beneran bikin dompet tebal, atau cuma angka doang.',
            dataLabel: 'Data',
            updated: 'update',
            attentionTitle: 'BTW:',
            attentionText:
            'Ini simulasi berdasarkan aturan umum aja. Angka bisa beda dari slip gaji asli. Pake buat bandingin pilihan, bukan pengganti konsultan pajak.',
            whoFor:
            'Buat karyawan yang lagi banding-bandingin tawaran kerja baru, apalagi kalo ada perubahan pajak, commute, jam kerja, atau waktu bareng keluarga.',
            startButton: 'Mulai Cek',
            reset: 'Reset',
            loading: 'Lagi itung…',
            whyToggle: 'Kenapa hasilnya bisa beda?',
            whyList: [
                'Pake asumsi umum buat PPh21 & BPJS, bukan perhitungan slip final.',
                'Potongan lain (cicilan, tunjangan khusus) gak dihitung kecuali lo masukin manual.',
                'Buat angka pasti, mending minta slip gaji atau konsul ke ahli pajak.',
            ],
            resultFor: {
                positive: 'Worth it',
                tradeoff: 'Trade-off',
                negative: 'Skip aja',
            },
            scoreLabel: 'Skor',
            changeTakeHome: 'Selisih take-home per bulan',
            timePenalty: 'Waktu kebuang',
            lifestylePenalty: 'Hidup jadi susah',
            shortSummaryTitle: 'Kesimpulan',
            suggestionsTitle: 'Yang bisa lo lakuin',
            notConsideredTitle: 'Yang gak dihitung',
            notConsideredList: ['Bonus tahunan', 'Benefit non-cash', 'Reputasi perusahaan'],
            languageLabel: 'Bahasa',
            errors: {
                invalidCurrent: 'Gaji sekarang harus lebih dari 0.',
                invalidNew: 'Gaji tawaran harus lebih dari 0.',
                tooSmall: 'Angka gajinya realistis dong.',
                serverError: 'Error pas ngitung. Coba lagi.',
                noResult: 'Gak ada hasil dari server.',
            },
            donateTitle: 'Traktir dev ☕',
            donateText: 'Bantuin dev beli kopi biar gak ngantuk bikin tool ini.',
            donateButton: 'Traktir (Saweria)',
        },
        form: {
            currentGross: 'Gaji sekarang (gross per bulan)',
            newGross: 'Gaji tawaran (gross per bulan)',
            commuteMinutes: 'Selisih waktu commute (menit per hari)',
            commuteCost: 'Selisih biaya transport (Rp per bulan)',
            freeTimeValue: 'Seberapa penting waktu luang',
            onCall: 'On-call / weekend kerja',
            bpjs: 'Ikut BPJS',
            status: 'Status',
            dependents: 'Tanggungan',
            lifeConditions: 'Kondisi hidup (opsional)',
            likelyMoreStress: 'Kayaknya bakal lebih stress',
            lessFamilyTime: 'Waktu keluarga berkurang',
            unclearExpectations: 'Job desc gak jelas',
            careerStagnation: 'Jenjang karir gak jelas / mandek',
            low: 'Rendah',
            medium: 'Sedang',
            high: 'Tinggi',
            single: 'Single',
            married: 'Nikah',
        },
        suggestions: {
            negotiatePay: 'Nego gaji atau tunjangan transport/remote.',
            askHybrid: 'Tanya hybrid/WFH atau kompensasi waktu.',
            clarifyWork: 'Minta jelasnya soal jam kerja, on-call, sama cuti.',
            considerLongTerm: 'Pikirin benefit jangka panjang (karir, bonus).',
        },
    },
    en: {
        ui: {
            title: 'RealityCheck - Job Offer Reality',
            description:
            `Enter current salary and new offer. We'll check if that bigger number actually means more money in your pocket, or just looks good on paper.`,
            dataLabel: 'Data',
            updated: 'updated',
            attentionTitle: 'Heads up:',
            attentionText:
            'This is a simulation using general rules. Numbers may differ from actual payslips. Use it to compare options, not as tax advice.',
            whoFor:
            'For employees comparing job offers, especially when taxes, commute, hours, or family time change.',
            startButton: 'Run Check',
            reset: 'Reset',
            loading: 'Calculating…',
            whyToggle: 'Why numbers may differ?',
            whyList: [
                'Uses general assumptions for PPh21 & BPJS, not exact payslip calculations.',
                `Other deductions (loans, special allowances) aren't included unless you enter them.`,
                'For exact numbers, check your payslips or talk to a tax pro.',
            ],
            resultFor: {
                positive: 'Worth it',
                tradeoff: 'Trade-off',
                negative: 'Pass',
            },
            scoreLabel: 'Score',
            changeTakeHome: 'Take-home change per month',
            timePenalty: 'Time lost',
            lifestylePenalty: 'Life gets harder',
            shortSummaryTitle: 'Summary',
            suggestionsTitle: 'What you can do',
            notConsideredTitle: 'Not included',
            notConsideredList: ['Annual bonus', 'Non-cash perks', 'Company reputation'],
            languageLabel: 'Language',
            errors: {
                invalidCurrent: 'Current salary must be greater than 0.',
                invalidNew: 'Offer salary must be greater than 0.',
                tooSmall: 'Enter a realistic salary.',
                serverError: 'Server error. Try again.',
                noResult: 'No result from server.',
            },
            donateTitle: 'Buy dev coffee ☕',
            donateText: 'Help keep the dev caffeinated while building this.',
            donateButton: 'Send Tips',
        },
        form: {
            currentGross: 'Current gross (monthly)',
            newGross: 'Offer gross (monthly)',
            commuteMinutes: 'Commute time change (min/day)',
            commuteCost: 'Transport cost change (Rp/month)',
            freeTimeValue: 'How much you value free time',
            onCall: 'On-call / weekend work',
            bpjs: 'BPJS enrolled',
            status: 'Status',
            dependents: 'Dependents',
            lifeConditions: 'Life conditions (optional)',
            likelyMoreStress: 'Likely more stressful',
            lessFamilyTime: 'Less family time',
            unclearExpectations: 'Unclear job scope',
            careerStagnation: 'No clear career path',
            low: 'Low',
            medium: 'Medium',
            high: 'High',
            single: 'Single',
            married: 'Married',
        },
        suggestions: {
            negotiatePay: 'Negotiate salary or transport/remote allowances.',
            askHybrid: 'Ask about hybrid/WFH or time compensation.',
            clarifyWork: 'Get clarity on hours, on-call load, and leave.',
            considerLongTerm: 'Think long-term (career growth, bonuses).',
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
