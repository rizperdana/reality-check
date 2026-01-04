import { NextResponse } from 'next/server';
import { computeJobOfferDecision } from '../../../core/modules/job-offer/verdict';
import type { JobOfferInput } from '../../../core/modules/job-offer/types';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const input = body as JobOfferInput;
        const result = computeJobOfferDecision(input);
        return NextResponse.json({ok: true, result});
    } catch (err) {
        return NextResponse.json({ ok: false, error: (err as Error).message }, {status: 500});
    }
}
