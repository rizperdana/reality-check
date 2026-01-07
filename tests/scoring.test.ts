import { computeBPJS, computePPh21 } from '../src/core/modules/job-offer/scoring';
import { computeJobOfferDecision } from '../src/core/modules/job-offer/verdict';
import { JobOfferInput } from '../src/core/modules/job-offer/types';

describe('RealityCheck Calculation Engine', () => {

    describe('computeBPJS', () => {
        // Case 1: Standard Salary below cap
        test('Standard Salary 10M - Enrolled', () => {
            const gross = 10_000_000;
            const res = computeBPJS(gross, true);

            // Kes: 1% of 10M = 100k
            // JHT: 2% of 10M = 200k
            // JP: 1% of 10M (cap 10.04M) = 100k
            // Total: 400k
            expect(res.kesehatan).toBe(100_000);
            expect(res.jht).toBe(200_000);
            expect(res.jp).toBe(100_000); // 10M < 10.042M cap
            expect(res.total).toBe(400_000);
        });

        // Case 2: Salary above Caps
        test('High Salary 20M - Cap Checks', () => {
            const gross = 20_000_000;
            const res = computeBPJS(gross, true);

            // Kes: 1% of 12M Cap = 120k
            expect(res.kesehatan).toBe(120_000);

            // JHT: 2% of 20M (No Cap) = 400k
            expect(res.jht).toBe(400_000);

            // JP: 1% of 10.042.300 Cap = 100,423
            expect(res.jp).toBe(100_423);

            expect(res.total).toBe(120_000 + 400_000 + 100_423);
        });

        // Case 3: Not Enrolled
        test('Not Enrolled', () => {
            const res = computeBPJS(15_000_000, false);
            expect(res.total).toBe(0);
        });
    });

    describe('computePPh21 (Annualized)', () => {
        // Case A: Sanity Check - Single TK/0, 10M Gross, Zero BPJS
        // Annual Gross: 120M
        // Biaya Jabatan: 5% of 10M = 500k/mo -> 6M/year
        // Net Taxable (Bruto - BJ): 120 - 6 = 114M
        // PTKP TK/0: 54M
        // PKP: 114 - 54 = 60M
        // Tax: 5% of 60M = 3M
        // Monthly Tax: 250k
        test('TK/0, 10M Gross, No Deductions', () => {
            const res = computePPh21(10_000_000, 0, 'single', 0);
            expect(res.annualTax).toBeCloseTo(3_000_000, -3); // within 1000 rupiah
            expect(res.monthlyTax).toBeCloseTo(250_000, -3);
        });

        // Case B: Progressive Bracket - TK/0, 20M Gross
        // Annual: 240M
        // BJ: Max 6M
        // Net Taxable: 234M
        // PTKP: 54M
        // PKP: 180M
        // Layer 1 (60M @ 5%): 3M
        // Layer 2 (120M @ 15%): 18M
        // Total Annual: 21M
        // Monthly: 1.75M
        test('TK/0, 20M Gross (Layer 2)', () => {
             const res = computePPh21(20_000_000, 0, 'single', 0);
             expect(res.annualTax).toBe(21_000_000);
             expect(res.monthlyTax).toBe(1_750_000);
        });
    });

    describe('Full Decision Flow', () => {
        const baseInput: JobOfferInput = {
            currentGrossMonthly: 10_000_000,
            newGrossMonthly: 15_000_000,
            maritalStatus: 'single',
            dependents: 0,
            bpjsCurrent: true, // includes JHT(2%)+JP(1%)=3% deductible, Kes(1%) nondeductible
            bpjsNew: true,
            currentEmploymentType: 'fulltime',
            newEmploymentType: 'fulltime',
            currentWorkMode: 'onsite',
            newWorkMode: 'onsite',
            commuteCostDelta: 0,
            commuteMinutesDelta: 0,
            onCallWeekend: false,
            freeTimeValue: 'medium',
            lifestyleFlags: { likelyMoreStress: false }
        };

        test('Returns Positive Verdict for significant raise', () => {
            const result = computeJobOfferDecision(baseInput);
            expect(result.verdict).toBe('POSITIVE');
            expect(result.moneyDelta).toBeGreaterThan(0);
            // Verify breakdown presence
            expect(result.monthlyBpjsEmployeeCurrent.total).toBeGreaterThan(0);
        });
    });

});
