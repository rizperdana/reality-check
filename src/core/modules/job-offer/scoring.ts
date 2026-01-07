import { TAX_CONFIG, MONEY_BANDS, FREE_TIME_MULT, WORK_MODE_VALUE, STATUS_RISK_PENALTY } from "./constants";
import { WorkMode, EmploymentType, JobOfferInput, MonthlyBPJSBreakdown, BPJSConfig } from "./types";

// --- 1. BPJS Calculation ---
export function computeBPJS(grossMonthly: number, enrolled: boolean, config?: BPJSConfig): MonthlyBPJSBreakdown {
    if (!enrolled) return { kesehatan: 0, jht: 0, jkm: 0, jp: 0, total: 0 };

    const useKes = config ? config.kesehatan : true; // default bundle true
    const useTK = config ? config.ketenagakerjaan : true;

    // A. BPJS Kesehatan (1% Employee, Cap 12M)
    // Source: Perpres 64/2020
    let kesehatan = 0;
    if (useKes) {
        const baseKes = Math.min(grossMonthly, TAX_CONFIG.BPJS.KESEHATAN.CAP_BASE);
        kesehatan = Math.round(baseKes * TAX_CONFIG.BPJS.KESEHATAN.EMPLOYEE_RATE);
    }

    // B. BPJS Ketenagakerjaan
    // JHT (2% Employee, No Cap usually applied to gross, but technically rule says 'upah' which is gross)
    let jht = 0;
    // JP (1% Employee, Cap ~9-10M)
    let jp = 0;

    if (useTK) {
        jht = Math.round(grossMonthly * TAX_CONFIG.BPJS.KETENAGAKERJAAN.JHT_EMPLOYEE_RATE);

        const baseJP = Math.min(grossMonthly, TAX_CONFIG.BPJS.KETENAGAKERJAAN.JP_CAP_BASE);
        jp = Math.round(baseJP * TAX_CONFIG.BPJS.KETENAGAKERJAAN.JP_EMPLOYEE_RATE);
    }

    // JKM is usually employer only (0.3%), not deducted from employee net.
    return {
        kesehatan,
        jht,
        jkm: 0,
        jp,
        total: kesehatan + jht + jp
    };
}

// --- 2. PPh21 Calculation (Annualized Pasal 17) ---
// Note: This approximates the "True Tax" liability for the year, rather than strictly the monthly TER withholding.
// This is better for decision making as TER over-withholds in some months and under in others, but annualizes to this.
export function computePPh21(grossMonthly: number, bpjsDeductions: number, maritalStatus: string, dependents: number): { annualTax: number, monthlyTax: number } {
    const annualGross = grossMonthly * 12;

    // A. Biaya Jabatan (5%, Max 500k/mo -> 6M/year)
    // Source: PMK 250/PMK.03/2008 & UU HPP updates
    const rawBiaya = grossMonthly * TAX_CONFIG.BIAYA_JABATAN.RATE;
    const monthlyBiaya = Math.min(rawBiaya, TAX_CONFIG.BIAYA_JABATAN.MAX_MONTHLY);
    const annualBiaya = monthlyBiaya * 12;

    // B. Absolute Deductions (Annualized)
    // Deductions usually include: Biaya Jabatan + Iuran Pensiun/JHT paid by employee
    // Note: BPJS Kesehatan employee share is NOT a tax deduction (only employer share is taxable income, employee share is just strict deduction from takehome).
    // Wait -> Actually strict rule:
    // Taxable Income (Bruto PPh) = Gaji + Tunjangan + Premi JKK/JKM (paid by employer) + BPJS Kes (paid by employer).
    // Deductions from Bruto = Biaya Jabatan + JHT (Employee) + JP (Employee).
    // BPJS Kesehatan (Employee) is NOT a deduction from Bruto for Tax purposes. It is paid from "Net" after tax?
    // CORRECTION: Standard payroll practice:
    // Pengurang Bruto = Biaya Jabatan + Iuran Pensiun/THT/JHT (yang dibayar sendiri).
    // BPJS Kesehatan Employee Share is NOT deductible from Bruto.
    // So `bpjsDeductions` passed here should ONLY be (JHT + JP).

    // HOWEVER: To compute "Net Take Home", we deduct ALL employee BPJS.
    // BUT for "Taxable Income" (PKP), we only deduct JHT+JP.
    // The Input `bpjsDeductions` to THIS function will be tricky if we don't separate them.
    // Let's rely on re-calculating or separating them outside?
    // Actually, `computeBPJS` returns breakdown. We should use that.
    // But since this function signature takes `bpjsDeductions` as a number (in the prompt assumption?), let's refine this function signature.
    // I will ignore the `bpjsDeductions` argument and assume the caller handles "Net" logic,
    // OR better: Assume `bpjsDeductions` passed here is ONLY the deductible portion (JHT+JP).
    // Let's refine the specific components passed.

    // For compliance, we need JHT+JP amounts specifically.
    // I will slightly deviate from strict signature if needed to be correct, or assume the caller passes *only deductible* BPJS here.
    // Let's change the parameter to `deductibleBpjsMonthly`.

    // C. PTKP
    let ptkp = TAX_CONFIG.PTKP.BASE;
    if (maritalStatus === 'married') ptkp += TAX_CONFIG.PTKP.MARRIED;
    const validDeps = Math.min(dependents, TAX_CONFIG.PTKP.MAX_DEPENDENTS);
    ptkp += (validDeps * TAX_CONFIG.PTKP.PER_DEPENDENT);

    // Calculate PKP
    const annualDeductibleBpjs = bpjsDeductions * 12;
    const netIncomeForTax = annualGross - annualBiaya - annualDeductibleBpjs;
    const pkp = Math.max(0, netIncomeForTax - ptkp);

    // Round down to thousands (standard DJP rounding)
    const pkpRounded = Math.floor(pkp / 1000) * 1000;

    // D. Tarif Pasal 17
    let tax = 0;
    let remainingPkp = pkpRounded;
    let prevLimit = 0;

    for (const bracket of TAX_CONFIG.PASAL17_BRACKETS) {
        if (remainingPkp <= 0) break;

        const width = bracket.limit - prevLimit;
        const taxableInThisBracket = Math.min(remainingPkp, width);

        tax += taxableInThisBracket * bracket.rate;
        remainingPkp -= taxableInThisBracket;
        prevLimit = bracket.limit;
    }

    return {
        annualTax: tax,
        monthlyTax: tax / 12
    };
}

// --- 3. Net & Scoring Wrappers ---
// ... Existing scoring logic adapted ...

export function calcFlexibilityScore(current: WorkMode, target: WorkMode) {
    const diff = WORK_MODE_VALUE[target] - WORK_MODE_VALUE[current];
    return diff;
}

export function calcStatusRisk(current: EmploymentType, target: EmploymentType) {
    if (current === 'fulltime' && target === 'contract') {
        return STATUS_RISK_PENALTY;
    }
    return 0;
}

export function moneyScore(deltaMonthly: number) {
    for (const band of MONEY_BANDS) {
        if (deltaMonthly >= band.min) return band.score;
    }
    return 0;
}

export function timePenalty(minutesDelta: number, onCallWeekend: boolean, freeTimeValue: 'low' | 'medium' | 'high') {
    let basePenalty = 0;
    if (minutesDelta >= 61) basePenalty = 2;
    else if (minutesDelta >= 30) basePenalty = 1;

    if (onCallWeekend) basePenalty += 1;
    const mult = FREE_TIME_MULT[freeTimeValue];
    return Math.round(basePenalty * mult);
}

export function lifestylePenalty(flags: JobOfferInput['lifestyleFlags']) {
    const keys = ['likelyMoreStress', 'lessFamilyTime', 'unclearExpectations', 'careerStagnation'] as const;
    let pen = 0;
    for (const k of keys) if (flags[k]) pen += 1;
    if (pen >= 2) return 2;
    return pen;
}
