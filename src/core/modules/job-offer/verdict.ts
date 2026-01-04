import { JobOfferInput, JobOfferResult, VerdictType } from './types';
import { normalize } from './normalize';
import { estimatePphMonthly, moneyScore, timePenalty, lifestylePenalty } from './scoring';
import { generateExplanation } from './copy';


export function computeJobOfferDecision(input: JobOfferInput): JobOfferResult {
    const n = normalize(input);

    const estCurrentPph = estimatePphMonthly(n.currentGrossMonthly, n.maritalStatus, n.dependents);
    const estNewPph = estimatePphMonthly(n.newGrossMonthly, n.maritalStatus, n.dependents);

    const estimatedCurrentNet = Math.round(n.currentGrossMonthly - estCurrentPph - n.bpjsDeductionCurrent);
    const estimatedNewNet = Math.round(n.newGrossMonthly - estNewPph - n.bpjsDeductionNew);

    const moneyDelta = estimatedNewNet - estimatedCurrentNet;
    const mScore = moneyScore(moneyDelta);

    const tPenalty = timePenalty(n.commuteMinutesDelta, n.onCallWeekend, n.freeTimeValue);
    const lPenalty = lifestylePenalty(n.lifestyleFlags);

    const finalScore = mScore - tPenalty - lPenalty;

    let verdict: VerdictType = 'TRADEOFF';
    if (finalScore >= 2) verdict = 'POSITIVE';
    else if (finalScore <= -2) verdict = 'NEGATIVE';
    else verdict = 'TRADEOFF';

    const drivers: string[] = [];
    if (Math.abs(mScore) >= 2) drivers.push('money');
    if (tPenalty >= 1) drivers.push('time');
    if (lPenalty >= 1) drivers.push('lifestyle');

    const explanation = generateExplanation({
        verdict,
        moneyDelta,
        estCurrentPph,
        estNewPph,
        tPenalty,
        lPenalty,
        drivers,
    });

    return {
        moneyDelta,
        moneyScore: mScore,
        timePenalty: tPenalty,
        lifestylePenalty: lPenalty,
        finalScore,
        verdict,
        keyDrivers: drivers,
        explanation,
        raw: {
            estimatedCurrentNet,
            estimatedNewNet,
        }
    }

}
