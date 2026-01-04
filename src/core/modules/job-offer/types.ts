export type MaritalStatus = 'single' | 'married';
export type FreeTimeValue = 'low' | 'medium' | 'high';

export interface JobOfferInput {
    currentGrossMonthly: number; // IDR
    newGrossMonthly: number; // IDR
    allowances?: {
        currentTransport?: number;
        newTransport?: number;
        currentMeal?: number;
        newMeal?: number;
    };
    maritalStatus?: MaritalStatus;
    dependents?: number; // 0..
    bpjsParticipation?: boolean;
    commuteMinutesDelta?: number; // new - current
    commuteCostDelta?: number; // monthly (new - current)
    onCallWeekend?: boolean;
    freeTimeValue?: FreeTimeValue;
    lifestyleFlags?: {
        likelyMoreStress?: boolean;
        lessFamilyTime?: boolean;
        unclearExpectations?: boolean;
    };
}

export type VerdictType = 'POSITIVE' | 'TRADEOFF' | 'NEGATIVE';

export interface JobOfferResult {
    moneyDelta: number;
    moneyScore: number;
    timePenalty: number;
    lifestylePenalty: number;
    finalScore: number;
    verdict: VerdictType;
    keyDrivers: string[]; // e.g., ['tax','time']
    explanation: string;
    raw: {
        estimatedCurrentNet: number;
        estimatedNewNet: number;
    };
}
