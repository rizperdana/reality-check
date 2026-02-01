import type { JobOfferResult, JobOfferInput } from '@/core/modules/job-offer/types';
import type { Lang } from './i18n';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

function formatIDR(n: number): string {
    return 'Rp ' + n.toLocaleString('id-ID');
}

async function fetchFromGroq(prompt: string, lang: Lang): Promise<string> {
    if (!GROQ_API_KEY) {
        throw new Error('Groq API key not configured');
    }

    const systemPrompt = lang === 'id'
        ? 'Anda adalah konselor karir spesialis pasar kerja Indonesia. Berikan saran praktis dalam BAHASA INDONESIA SAJA. Gunakan format poin markdown (• atau -) yang ringkas (2-3 poin) dan fokus pada saran karir umum dan strategi negosiasi spesifik.'
        : 'You are a career advisor specializing in Indonesian job market. Provide practical advice in ENGLISH ONLY. Use markdown bullet points (• or -) format with 2-3 bullets focusing on general career advice and specific negotiation strategies.';

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'system',
                    content: systemPrompt,
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: 200,
            temperature: 0.7,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Unable to generate recommendation.';
}

async function fetchFromOpenRouter(prompt: string, lang: Lang): Promise<string> {
    if (!OPENROUTER_API_KEY) {
        throw new Error('OpenRouter API key not configured');
    }

    const systemPrompt = lang === 'id'
        ? 'Anda adalah konselor karir spesialis pasar kerja Indonesia. Berikan saran praktis dalam BAHASA INDONESIA SAJA. Gunakan format poin markdown (• atau -) yang ringkas (2-3 poin) dan fokus pada saran karir umum dan strategi negosiasi spesifik.'
        : 'You are a career advisor specializing in Indonesian job market. Provide practical advice in ENGLISH ONLY. Use markdown bullet points (• or -) format with 2-3 bullets focusing on general career advice and specific negotiation strategies.';

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://pindahkerja.vercel.app',
            'X-Title': 'PindahKerja - Job Offer Analyzer',
        },
        body: JSON.stringify({
            model: 'openai/gpt-oss-120b:free',
            messages: [
                {
                    role: 'system',
                    content: systemPrompt,
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: 200,
            temperature: 0.7,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Unable to generate recommendation.';
}

export async function getAIRecommendation(
    result: JobOfferResult,
    input: JobOfferInput,
    lang: Lang
): Promise<string | null> {
    const moneyText = result.moneyDelta >= 0
        ? `+${formatIDR(result.moneyDelta)}`
        : `-${formatIDR(Math.abs(result.moneyDelta))}`;

    const verdictText = result.verdict === 'POSITIVE'
        ? (lang === 'id' ? 'positif' : 'positive')
        : result.verdict === 'TRADEOFF'
        ? (lang === 'id' ? 'perlu pertimbangan' : 'requires consideration')
        : (lang === 'id' ? 'negatif' : 'negative');

    const workModeChange = input.currentWorkMode !== input.newWorkMode
        ? ` from ${input.currentWorkMode} to ${input.newWorkMode}`
        : '';

    const employmentChange = input.currentEmploymentType !== input.newEmploymentType
        ? ` from ${input.currentEmploymentType} to ${input.newEmploymentType}`
        : '';

    const promptBase = lang === 'id'
        ? `Analisis tawaran kerja berikut:
- Gaji bersih: ${moneyText}/bulan
- Verdict: ${verdictText}
- Skor: ${result.finalScore}
- Perubahan mode kerja:${workModeChange}
- Perubahan status kerja:${employmentChange}
- Perubahan waktu commute: ${input.commuteMinutesDelta || 0} menit
- Biaya commute: ${input.commuteCostDelta > 0 ? '+' : ''}${formatIDR(input.commuteCostDelta)}/bulan
- Faktor gaya hidup: ${result.keyDrivers.join(', ')}

Berikan rekomendasi dalam format markdown poin (maksimal 3 poin) yang mencakup:
• Nasihat karir umum berdasarkan situasi ini
• Strategi negosiasi spesifik yang bisa dilakukan

Gunakan tanda • atau - untuk bullet points dalam markdown. Jawab dalam bahasa Indonesia.`
        : `Analyze this job offer:
- Net salary: ${moneyText}/month
- Verdict: ${verdictText}
- Score: ${result.finalScore}
- Work mode change:${workModeChange}
- Employment type change:${employmentChange}
- Commute time change: ${input.commuteMinutesDelta || 0} minutes
- Commute cost: ${input.commuteCostDelta > 0 ? '+' : ''}${formatIDR(input.commuteCostDelta)}/month
- Lifestyle factors: ${result.keyDrivers.join(', ')}

Provide a recommendation in markdown bulleted format (max 3 bullets) covering:
• General career advice based on this situation
• Specific negotiation strategies that can be done

Use • or - for bullet points in markdown. Answer in English.`;

    try {
        return await fetchFromGroq(promptBase, lang);
    } catch (error) {
        console.warn('Groq failed, trying OpenRouter:', error);
        try {
            return await fetchFromOpenRouter(promptBase, lang);
        } catch (fallbackError) {
            console.warn('OpenRouter also failed:', fallbackError);
            return null;
        }
    }
}
