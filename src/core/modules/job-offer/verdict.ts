import { JobOfferInput, JobOfferResult, VerdictType } from './types';
// import { normalize } from './normalize';
import { estimatePphMonthly, moneyScore, timePenalty, lifestylePenalty, calcFlexibilityScore, calcStatusRisk } from './scoring';
import { generateExplanation } from './copy';

export function computeJobOfferDecision(input: JobOfferInput): JobOfferResult {
    // Normalize input (ensure defaults)
    // Note: You need to update normalize.ts to pass through new fields, assumed done here.
    const n = input;

    // 1. Financials with Precise Tax
    const estCurrentPph = estimatePphMonthly(n.currentGrossMonthly, n.maritalStatus, n.dependents);
    const estNewPph = estimatePphMonthly(n.newGrossMonthly, n.maritalStatus, n.dependents);

    // BPJS (Simplified deduction logic)
    const bpjsRate = 0.03; // 1% health + 2% labor (approx employee share)
    const currentBpjs = n.bpjsCurrent ? n.currentGrossMonthly * bpjsRate : 0;
    const newBpjs = n.bpjsNew ? n.newGrossMonthly * bpjsRate : 0;

    const estimatedCurrentNet = Math.round(n.currentGrossMonthly - estCurrentPph - currentBpjs);
    const estimatedNewNet = Math.round(n.newGrossMonthly - estNewPph - newBpjs);

    const moneyDelta = estimatedNewNet - estimatedCurrentNet - n.commuteCostDelta;
    const mScore = moneyScore(moneyDelta);

    // 2. New Factors
    const flexScore = calcFlexibilityScore(n.currentWorkMode, n.newWorkMode);
    const statusRisk = calcStatusRisk(n.currentEmploymentType, n.newEmploymentType);

    // 3. Existing Factors
    // If going Remote, commuteMinutesDelta might be negative (saving time).
    // The UI should handle calculating the delta (New Mins - Old Mins).
    const tPenalty = timePenalty(n.commuteMinutesDelta || 0, n.onCallWeekend, n.freeTimeValue);
    const lPenalty = lifestylePenalty(n.lifestyleFlags);

    // 4. Final Formula
    // Score = Money + Flex - TimePenalty - LifestylePenalty - StatusRisk
    const finalScore = mScore + flexScore - tPenalty - lPenalty - statusRisk;

    // 5. Verdict
    let verdict: VerdictType = 'TRADEOFF';
    if (finalScore >= 2) verdict = 'POSITIVE';
    else if (finalScore <= -2) verdict = 'NEGATIVE';

    // 6. Drivers
    const drivers: string[] = [];
    if (Math.abs(mScore) >= 2) drivers.push('money');
    if (flexScore !== 0) drivers.push('flexibility'); // Remote/Onsite shift
    if (statusRisk > 0) drivers.push('security'); // Contract risk
    if (tPenalty >= 1) drivers.push('time');
    if (lPenalty >= 1) drivers.push('lifestyle');

    // Generate Explanation (You will need to update copy.ts to handle 'flexibility' and 'security' keys)
    const explanation = generateExplanation({
        verdict,
        moneyDelta,
        estCurrentPph,
        estNewPph,
        tPenalty,
        lPenalty,
        drivers
    });

    return {
        moneyDelta,
        moneyScore: mScore,
        timePenalty: tPenalty,
        lifestylePenalty: lPenalty,
        statusPenalty: statusRisk,
        flexibilityScore: flexScore,
        finalScore,
        verdict,
        keyDrivers: drivers,
        explanation,
        raw: {
            estimatedCurrentNet,
            estimatedNewNet,
            taxDetails: `Tax PTKP: ${n.maritalStatus}/${n.dependents}`,
        }
    }
}
