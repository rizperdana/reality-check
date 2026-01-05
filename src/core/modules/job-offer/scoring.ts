import { MONEY_BANDS, FREE_TIME_MULT, PTKP, WORK_MODE_VALUE, STATUS_RISK_PENALTY } from "./constants";
import { WorkMode, EmploymentType } from "./types";

// 1. Precise PPh Calculation (Progressive Rate)
export function estimatePphMonthly(grossMonthly: number, maritalStatus: string, dependents: number) {
    const annualGross = grossMonthly * 12;

    // Calculate PTKP (Penghasilan Tidak Kena Pajak)
    let ptkpTotal = PTKP.BASE;
    if (maritalStatus === 'married') ptkpTotal += PTKP.MARRIED;

    const validDependents = Math.min(dependents, PTKP.MAX_DEPENDENTS);
    ptkpTotal += (validDependents * PTKP.PER_DEPENDENT);

    // Taxable Income (PKP)
    const pkp = Math.max(0, annualGross - ptkpTotal);

    // Progressive Rates (UU HPP 2021/2022)
    let annualTax = 0;
    if (pkp <= 60000000) {
        annualTax = pkp * 0.05;
    } else if (pkp <= 250000000) {
        annualTax = (60000000 * 0.05) + ((pkp - 60000000) * 0.15);
    } else if (pkp <= 500000000) {
        annualTax = (60000000 * 0.05) + (190000000 * 0.15) + ((pkp - 250000000) * 0.25);
    } else if (pkp <= 5000000000) {
        annualTax = (60000000 * 0.05) + (190000000 * 0.15) + (250000000 * 0.25) + ((pkp - 500000000) * 0.30);
    } else {
        // Above 5M
        annualTax = (60000000 * 0.05) + (190000000 * 0.15) + (250000000 * 0.25) + (4500000000 * 0.30) + ((pkp - 5000000000) * 0.35);
    }

    return Math.round(annualTax / 12);
}

// 2. Flexibility Score (Work Mode)
export function calcFlexibilityScore(current: WorkMode, target: WorkMode) {
    const currentVal = WORK_MODE_VALUE[current];
    const newVal = WORK_MODE_VALUE[target];

    const diff = newVal - currentVal;

    // E.g. Onsite (0) -> Remote (2) = +2 Score
    // E.g. Remote (2) -> Onsite (0) = -2 Score (Huge penalty)
    return diff;
}

// 3. Status Risk (Employment Type)
export function calcStatusRisk(current: EmploymentType, target: EmploymentType) {
    // If you leave a Fulltime job for a Contract job, that's high risk.
    if (current === 'fulltime' && target === 'contract') {
        return STATUS_RISK_PENALTY; // Returns 2 (Bad thing)
    }
    // Contract -> Fulltime is good, but we usually count that as "absence of penalty" or slight bonus?
    // For now, let's keep it asymmetric. Risk is the killer.
    return 0;
}

// ... Keep existing moneyScore, timePenalty, lifestylePenalty ...
export function moneyScore(deltaMonthly: number) {
    for (const band of MONEY_BANDS) {
        if (deltaMonthly >= band.min) return band.score;
    }
    return 0;
}

export function timePenalty(minutesDelta: number, onCallWeekend: boolean, freeTimeValue: 'low' | 'medium' | 'high') {
    let basePenalty = 0;
    // Commute logic slightly adjusted: if you save time (negative delta), we don't punish, but we don't necessarily reward in *penalty* function,
    // we reward in flexibility score. But excessive commute > 60 is still a penalty.
    if (minutesDelta >= 61) basePenalty = 2;
    else if (minutesDelta >= 30) basePenalty = 1;

    if (onCallWeekend) basePenalty += 1;
    const mult = FREE_TIME_MULT[freeTimeValue];
    return Math.round(basePenalty * mult);
}

import { JobOfferInput } from "./types";

// ...

export function lifestylePenalty(flags: JobOfferInput['lifestyleFlags']) {
    const keys = ['likelyMoreStress', 'lessFamilyTime', 'unclearExpectations', 'careerStagnation'] as const;
    let pen = 0;
    for (const k of keys) if (flags[k]) pen += 1;
    if (pen >= 2) return 2;
    return pen;
}
