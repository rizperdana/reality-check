type CopyParams = {
    verdict: 'POSITIVE' | 'TRADEOFF' | 'NEGATIVE';
    moneyDelta: number;
    estCurrentPph: number;
    estNewPph: number;
    tPenalty: number;
    lPenalty: number;
    drivers: string[];
}

function formatIDR(n: number) {
    return 'Rp ' + n.toLocaleString('id-ID');
}

export function generateExplanation(p: CopyParams): string {
    const moneyText = p.moneyDelta >= 0 ? `net gain of ${formatIDR(p.moneyDelta)}/month` : `net loss of ${formatIDR(Math.abs(p.moneyDelta))}/month`;
    const reasons: string[] = [];

    if (p.drivers.includes('money')) {
        reasons.push(
            `Perbedaan pajak dan penyesuaian BPJS memengaruhi gaji bersih yang diterima (estimasi PPh: saat ini ${formatIDR(p.estCurrentPph)}, baru ${formatIDR(p.estNewPph)}).`
        );
    }

    if (p.drivers.includes('time')) {
        reasons.push(
            `Tambahan waktu perjalanan atau kewajiban on-call mengurangi waktu efektif yang bisa Anda gunakan (penalti waktu: ${p.tPenalty}).`
        );
    }

    if (p.drivers.includes('lifestyle')) {
        reasons.push(
            `Terdapat risiko gaya hidup yang terdeteksi (tingkat stres, waktu untuk keluarga, kejelasan peran).`
        );
    }

    const base = {
        POSITIVE: `✅ Penawaran ini terlihat sebagai keuntungan bersih: ${moneyText}. ${reasons.join(' ')}`,
        TRADEOFF: `⚠️ Ini merupakan sebuah trade-off: ${moneyText}. ${reasons.join(' ')} Pertimbangkan apakah tambahan penghasilan tersebut sebanding dengan biaya waktu dan gaya hidup.`,
        NEGATIVE: `❌ Kemungkinan merupakan penurunan: ${moneyText}. ${reasons.join(' ')} Anda mungkin perlu menolak atau menegosiasikan perubahan.`,
    }

    return base[p.verdict];
}
