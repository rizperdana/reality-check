import { NextResponse } from 'next/server';
import { computeJobOfferDecision } from '../../../core/modules/job-offer/verdict';
import type { JobOfferInput } from '../../../core/modules/job-offer/types';
import type { Lang } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import { getAIRecommendation } from '@/lib/ai-service';

export async function POST(req: Request) {
    try {
        // 1. Client Source Validation
        const clientHeader = req.headers.get('x-rc-client');
        if (clientHeader !== 'pindahkerja-web') {
            return NextResponse.json({ ok: false, error: 'Unauthorized source' }, { status: 403 });
        }

        const body = await req.json();
        const input = body as JobOfferInput;
        const result = computeJobOfferDecision(input);

        // 1.5. AI Recommendation - Use language from request body
        const lang = (body.lang as Lang) || 'id';

        const aiRecommendation = await getAIRecommendation(result, input, lang);
        if (aiRecommendation) {
            result.aiRecommendation = aiRecommendation;
        }

        // 2. Metadata Extraction
        const forwarded = req.headers.get("x-forwarded-for");
        const ip = forwarded ? forwarded.split(/, /)[0] : "unknown";
        const userAgent = req.headers.get("user-agent") || "unknown";

        // 3. Rate Limiting (using Supabase if available)
        if (supabase && ip !== 'unknown') {
            const { count, error: countErr } = await supabase
                .from('job_offers')
                .select('*', { count: 'exact', head: true })
                .eq('ip_hash', ip)
                .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString());

            if (!countErr && count !== null && count >= 5) {
                return NextResponse.json({
                    ok: false,
                    error: 'Terlalu banyak request. Coba lagi 5 menit lagi ya.'
                }, { status: 429 });
            }
        }

        // 4. Persistence (Best Effort)
        if (supabase) {
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

        return NextResponse.json({ ok: true, result });
    } catch (err) {
        return NextResponse.json({
            ok: false,
            error: (err as Error).message
        }, { status: 500 });
    }
}
