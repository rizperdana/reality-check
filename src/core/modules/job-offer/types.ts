export type MaritalStatus = 'single' | 'married';
export type FreeTimeValue = 'low' | 'medium' | 'high';
export type EmploymentType = 'fulltime' | 'contract';
export type WorkMode = 'onsite' | 'hybrid' | 'remote';

export type JobOfferForm = JobOfferInput;

export interface BPJSConfig {
    kesehatan: boolean;
    ketenagakerjaan: boolean;
}

export interface JobOfferInput {
    // Financials
    currentGrossMonthly: number;
    newGrossMonthly: number;
    allowancesMonthly?: number; // Added optional allowance

    // Tax & Dependents
    maritalStatus: MaritalStatus;
    dependents: number; // 0..3

    // BPJS Detailed Flags (optional, usually mapped from boolean bundles)
    bpjsCurrent: boolean;
    bpjsNew: boolean;
    bpjsCurrentConfig?: BPJSConfig; // granular overrides
    bpjsNewConfig?: BPJSConfig;

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

    // Testing & Overrides
    explicitTaxParams?: any;
}

export type VerdictType = 'POSITIVE' | 'TRADEOFF' | 'NEGATIVE';

export interface MonthlyBPJSBreakdown {
    kesehatan: number;
    jht: number;
    jkm: number; // usually 0 on employee side
    jp: number;
    total: number;
}

export interface JobOfferResult {
    monthlyGrossCurrent: number;
    monthlyGrossNew: number;

    monthlyBpjsEmployeeCurrent: MonthlyBPJSBreakdown;
    monthlyBpjsEmployeeNew: MonthlyBPJSBreakdown;

    monthlyTaxCurrent: number;
    monthlyTaxNew: number;
    annualTaxCurrent: number;
    annualTaxNew: number;

    netMonthlyCurrent: number;
    netMonthlyNew: number;

    moneyDelta: number;
    moneyScore: number;
    timePenalty: number;
    lifestylePenalty: number;
    statusPenalty: number;
    flexibilityScore: number;
    finalScore: number;
    verdict: VerdictType;

    keyDrivers: string[];
    explanation: string;
    aiRecommendation?: string;

    assumptions: string[];
    uncertainFlags: string[];

    raw: {
        estimatedCurrentNet: number;
        estimatedNewNet: number;
        taxDetails: string;
    };
}
