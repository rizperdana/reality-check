export const PTKP = {
    BASE: 54000000,
    MARRIED: 4500000,
    PER_DEPENDENT: 4500000,
    MAX_DEPENDENTS: 3,
};

export const BPJS_PERCENT = {
  kesehatan: 0.01, // estimate 1%
  ketenagakerjaan: 0.02, // estimate 2%
};

export const MONEY_BANDS = [
    { min: 2500000, score: 3 },
    { min: 1000000, score: 2 },
    { min: 300000, score: 1 },
    { min: -299000, score: 0 },
    { min: -1000000, score: -1 },
    { min: -Infinity, score: -2 },
];

export const FREE_TIME_MULT = { low: 1, medium: 1.3, high: 1.6 };

export const WORK_MODE_VALUE = {
    onsite: 0,
    hybrid: 1,
    remote: 2,
};

export const STATUS_RISK_PENALTY = 2;
