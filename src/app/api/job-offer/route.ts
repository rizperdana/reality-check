import { NextResponse } from 'next/server';
import { computeJobOfferDecision } from '../../../core/modules/job-offer/verdict';
import type { JobOfferInput } from '../../../core/modules/job-offer/types';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const input = body as JobOfferInput;
        const result = computeJobOfferDecision(input);

        // Store to Supabase asynchronously (best effort)
        if (supabase) {
            const forwarded = req.headers.get("x-forwarded-for");
            const ip = forwarded ? forwarded.split(/, /)[0] : "unknown";
            const userAgent = req.headers.get("user-agent") || "unknown";

            try {
                await supabase.from('job_offers').insert({
                    input: body,
                    result: result,
                    verdict: result.verdict,
                    money_delta: result.moneyDelta,
                    final_score: result.finalScore,
                    ip_hash: ip,
                    user_agent: userAgent,
                    created_at: new Date().toISOString(),
                });
            } catch (sbErr) {
                console.error('Supabase logging failed:', sbErr);
            }
        }

        return NextResponse.json({ok: true, result});
    } catch (err) {
        return NextResponse.json({ ok: false, error: (err as Error).message }, {status: 500});
    }
}
