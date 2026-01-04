import { MONEY_BANDS, FREE_TIME_MULT } from "./constants";

export function estimatePphMonthly(grossMonthly: number, maritalStatus: string, dependents: number) {
    const annual = grossMonthly * 12;
    let annualTax = 0;
    const lowCeiling = 60000000;
    const highCeiling = 250000000;
    if (annual <= lowCeiling) annualTax = annual * 0.05;
    else if (annual <= highCeiling) annualTax = lowCeiling * 0.05 + (annual - lowCeiling) * 0.15;
    else annualTax = lowCeiling * 0.05 + (highCeiling - lowCeiling) * 0.15 + (annual - highCeiling) * 0.25;

    const familyRelief = maritalStatus == 'married' ? Math.min(3000000, dependents * 1500000) : 0;
    annualTax = Math.max(0, annualTax - familyRelief);

    return Math.round(annualTax / 12);
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
    else basePenalty = 0;

    if (onCallWeekend) basePenalty += 1;

    const mult = FREE_TIME_MULT[freeTimeValue];
    return Math.round(basePenalty * mult);
}

export function lifestylePenalty(flags: {
    likelyMoreStress?: boolean;
    lessFamilyTime?: boolean;
    unclearExpectations?: boolean;
}) {
    const keys = ['likelyMoreStress', 'lessFamilyTime', 'unclearExpectations'] as const;

    let pen = 0;
    for (const k of keys) {
        if (flags[k]) pen += 1;
        if (pen >= 2) return 2;
    }
    return pen;
}

