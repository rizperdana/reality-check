import { JobOfferInput } from './types';
import { BPJS_PERCENT } from './constants';

export function normalize(input: JobOfferInput) {
    const {
        currentGrossMonthly,
        newGrossMonthly,
        allowances = {},
        maritalStatus = 'single',
        dependents = 0,
        bpjsParticipation = true,
        commuteMinutesDelta = 0,
        commuteCostDelta = 0,
        onCallWeekend = false,
        freeTimeValue = 'medium',
        lifestyleFlags = {},
    } = input;

    const currentAllowances = (allowances.currentTransport || 0) + (allowances.currentMeal || 0);
    const newAllowances = (allowances.newTransport || 0) + (allowances.newMeal || 0);

    const bpjsValue = BPJS_PERCENT.kesehatan + BPJS_PERCENT.ketenagakerjaan
    const bpjsDeductionCurrent = bpjsParticipation
        ? Math.round(currentGrossMonthly * bpjsValue)
        : 0;

    const bpjsDeductionNew = bpjsParticipation
        ? Math.round(newGrossMonthly * bpjsValue)
        : 0;

    return {
        currentGrossMonthly,
        newGrossMonthly,
        currentAllowances,
        newAllowances,
        maritalStatus,
        dependents,
        bpjsDeductionCurrent,
        bpjsDeductionNew,
        commuteMinutesDelta,
        commuteCostDelta,
        onCallWeekend,
        freeTimeValue,
        lifestyleFlags,
    };
}
