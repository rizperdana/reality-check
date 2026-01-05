export type MaritalStatus = 'single' | 'married';
export type FreeTimeValue = 'low' | 'medium' | 'high';
export type EmploymentType = 'fulltime' | 'contract';
export type WorkMode = 'onsite' | 'hybrid' | 'remote';

export type JobOfferForm = JobOfferInput;

export interface JobOfferInput {
    // Financials
    currentGrossMonthly: number;
    newGrossMonthly: number;

    // Tax & Dependents
    maritalStatus: MaritalStatus;
    dependents: number; // 0..3
    bpjsCurrent: boolean;
    bpjsNew: boolean;

    // Employment Status
    currentEmploymentType: EmploymentType;
    newEmploymentType: EmploymentType;

    // Work Mode & Commute
    currentWorkMode: WorkMode;
    newWorkMode: WorkMode;
    commuteMinutesDelta?: number;
    commuteCostDelta: number;

    // Soft Factors
    onCallWeekend: boolean;
    freeTimeValue: FreeTimeValue;
    lifestyleFlags: {
        likelyMoreStress?: boolean;
        lessFamilyTime?: boolean;
        unclearExpectations?: boolean;
        careerStagnation?: boolean;
    };
}
export type VerdictType = 'POSITIVE' | 'TRADEOFF' | 'NEGATIVE';

export interface JobOfferResult {
    moneyDelta: number;
    moneyScore: number;
    timePenalty: number;
    lifestylePenalty: number;
    statusPenalty: number; // New: Penalty for moving to contract
    flexibilityScore: number; // New: Bonus for remote
    finalScore: number;
    verdict: VerdictType;
    keyDrivers: string[]; // e.g., ['tax','time']
    explanation: string;
    raw: {
        estimatedCurrentNet: number;
        estimatedNewNet: number;
        taxDetails: string; // informative string about tax bracket
    };
}
