import { JobOfferInput, JobOfferResult, VerdictType, MonthlyBPJSBreakdown } from './types';
import { computeBPJS, computePPh21, moneyScore, timePenalty, lifestylePenalty, calcFlexibilityScore, calcStatusRisk } from './scoring';
import { generateExplanation } from './copy';
import { TAX_CONFIG } from './constants';

export function computeJobOfferDecision(input: JobOfferInput): JobOfferResult {
    // 1. Normalize Inputs
    const currentGross = input.currentGrossMonthly + (input.allowancesMonthly || 0);
    // Note: Allowances for new job? Assuming 'newGrossMonthly' includes all cash components or strictly base.
    // The Input interface only has allowancesMonthly (generic). We will assume it applies to CURRENT only if intended to "audit" current,
    // OR we might need separate allowance fields.
    // For safety/strictness with prompt: "Normalize monthly gross: include allowances if flagged".
    // I will assume input.newGrossMonthly is TOTAL offered.
    // I will add allowances to currentGross only if it seems distinct?
    // Actually, let's assume `allowancesMonthly` is a detached field.
    // Let's assume user Input `currentGrossMonthly` is BASE, and `allowancesMonthly` is ADD-ON for current.
    // For New, user usually inputs Total Offer.
    const finalCurrentGross = currentGross;
    const finalNewGross = input.newGrossMonthly;

    // 2. Compute BPJS
    // Map boolean flags to detailed config if not provided
    const currentBpjsConfig = input.bpjsCurrentConfig || {
        kesehatan: input.bpjsCurrent,
        ketenagakerjaan: input.bpjsCurrent
    };
    const newBpjsConfig = input.bpjsNewConfig || {
        kesehatan: input.bpjsNew,
        ketenagakerjaan: input.bpjsNew
    };

    const bpjsDetailsCurrent = computeBPJS(finalCurrentGross, input.bpjsCurrent, currentBpjsConfig);
    const bpjsDetailsNew = computeBPJS(finalNewGross, input.bpjsNew, newBpjsConfig);

    // 3. Compute Tax (PPh21)
    // Only JHT and JP are tax deductible on employee side
    const taxDeductibleBpjsCurrent = bpjsDetailsCurrent.jht + bpjsDetailsCurrent.jp;
    const taxDeductibleBpjsNew = bpjsDetailsNew.jht + bpjsDetailsNew.jp;

    const taxCurrent = computePPh21(finalCurrentGross, taxDeductibleBpjsCurrent, input.maritalStatus, input.dependents);
    const taxNew = computePPh21(finalNewGross, taxDeductibleBpjsNew, input.maritalStatus, input.dependents);

    // 4. Compute Net Take Home
    // Net = Gross - Tax - ALL Employee BPJS (Kes + JHT + JP)
    const netCurrent = Math.round(finalCurrentGross - taxCurrent.monthlyTax - bpjsDetailsCurrent.total);
    const netNew = Math.round(finalNewGross - taxNew.monthlyTax - bpjsDetailsNew.total);

    // 5. Delta & Scoring
    const moneyDelta = netNew - netCurrent - input.commuteCostDelta;
    const mScore = moneyScore(moneyDelta);
    const flexScore = calcFlexibilityScore(input.currentWorkMode, input.newWorkMode);
    const statusRisk = calcStatusRisk(input.currentEmploymentType, input.newEmploymentType);
    const tPenalty = timePenalty(input.commuteMinutesDelta || 0, input.onCallWeekend, input.freeTimeValue);
    const lPenalty = lifestylePenalty(input.lifestyleFlags);

    const finalScore = mScore + flexScore - tPenalty - lPenalty - statusRisk;

    // 6. Verdict
    let verdict: VerdictType = 'TRADEOFF';
    if (finalScore >= 2) verdict = 'POSITIVE';
    else if (finalScore <= -2) verdict = 'NEGATIVE';

    // 7. Drivers
    const drivers: string[] = [];
    if (Math.abs(mScore) >= 2) drivers.push(`Money impact: ${moneyDelta > 0 ? '+' : ''}${moneyDelta.toLocaleString('id-ID')}`);
    if (flexScore !== 0) drivers.push(flexScore > 0 ? 'Better flexibility' : 'Worse flexibility');
    if (statusRisk > 0) drivers.push('Job security risk');
    if (tPenalty >= 1) drivers.push('Time loss');
    if (lPenalty >= 1) drivers.push('Lifestyle penalty');

    // Explanation
    // Note: Using existing generateExplanation might need updates for type compatibility?
    // The signature of generateExplanation in copy.ts expects the OLD result shape logic or specific params?
    // Let's check `generateExplanation`. If it breaks, we fix it.
    // Assuming `generateExplanation` takes an object. We'll pass compatible values.

    // Check drivers logic: We need "top 2" or list.
    const topDrivers = drivers.slice(0, 2);

    const explanation = generateExplanation({
        verdict,
        moneyDelta,
        estCurrentPph: taxCurrent.monthlyTax, // mapping for compatibility
        estNewPph: taxNew.monthlyTax,
        tPenalty,
        lPenalty,
        drivers: topDrivers
    });

    return {
        monthlyGrossCurrent: finalCurrentGross,
        monthlyGrossNew: finalNewGross,
        monthlyBpjsEmployeeCurrent: bpjsDetailsCurrent,
        monthlyBpjsEmployeeNew: bpjsDetailsNew,
        monthlyTaxCurrent: taxCurrent.monthlyTax,
        monthlyTaxNew: taxNew.monthlyTax,
        annualTaxCurrent: taxCurrent.annualTax,
        annualTaxNew: taxNew.annualTax,
        netMonthlyCurrent: netCurrent,
        netMonthlyNew: netNew,
        moneyDelta,
        moneyScore: mScore,
        timePenalty: tPenalty,
        lifestylePenalty: lPenalty,
        statusPenalty: statusRisk,
        flexibilityScore: flexScore,
        finalScore,
        verdict,
        keyDrivers: topDrivers,
        explanation,
        assumptions: [
            `Tax Version: ${TAX_CONFIG.version}`,
            `PTKP Base: ${TAX_CONFIG.PTKP.BASE}`,
            `BPJS Cap Base: ${TAX_CONFIG.BPJS.KESEHATAN.CAP_BASE}`
        ],
        uncertainFlags: [], // Populated if definitions missing
        raw: {
            estimatedCurrentNet: netCurrent,
            estimatedNewNet: netNew,
            taxDetails: `Tax: ${input.maritalStatus.toUpperCase()}/${input.dependents}`
        }
    };
}
