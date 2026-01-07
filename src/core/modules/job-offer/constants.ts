// Authoritative Tax & BPJS Constants
// Version: 2025-01-07.v1
// Sources:
// 1. PTKP: UU HPP (Harmonisasi Peraturan Perpajakan) -> 54jt base
// 2. BPJS Kesehatan: Perpres No 64 Tahun 2020 -> 1% employee, cap 12jt
// 3. JHT: PP No 46 Tahun 2015 -> 2% employee
// 4. JP: PP No 45 Tahun 2015 -> 1% employee, cap periodic review (approx 10,042,300 in 2024)

export const TAX_CONFIG = {
    version: "2025-01-07.v1",
    PTKP: {
        BASE: 54_000_000,
        MARRIED: 4_500_000,
        PER_DEPENDENT: 4_500_000,
        MAX_DEPENDENTS: 3,
    },
    BIAYA_JABATAN: {
        RATE: 0.05,
        MAX_MONTHLY: 500_000,
        MAX_ANNUAL: 6_000_000
    },
    BPJS: {
        KESEHATAN: {
            EMPLOYEE_RATE: 0.01,
            CAP_BASE: 12_000_000
        },
        KETENAGAKERJAAN: {
            JHT_EMPLOYEE_RATE: 0.02,
            JP_EMPLOYEE_RATE: 0.01,
            JP_CAP_BASE: 10_042_300 // 2024 Cap
        }
    },
    PASAL17_BRACKETS: [
        { limit: 60_000_000, rate: 0.05 },
        { limit: 250_000_000, rate: 0.15 },
        { limit: 500_000_000, rate: 0.25 },
        { limit: 5_000_000_000, rate: 0.30 },
        { limit: Infinity, rate: 0.35 }
    ]
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
