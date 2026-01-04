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
        reasons.push(`Tax difference and BPJS adjustments affect take-home pay (PPh est: current ${formatIDR(p.estCurrentPph)}, new ${formatIDR(p.estNewPph)}).`);
    }
    if (p.drivers.includes('time')) {
        reasons.push(`Extra commute or on-call obligations reduce your usable time (time penalty: ${p.tPenalty}).`);
    }
    if (p.drivers.includes('lifestyle')) {
        reasons.push(`Lifestyle risks flagged (stress, family-time, role clarity).`);
    }
    const base = {
        POSITIVE: `✅ This offer appears to be a net positive: ${moneyText}. ${reasons.join(' ')}`,
        TRADEOFF: `⚠️ This is a trade-off: ${moneyText}. ${reasons.join(' ')} Consider whether the added income is worth the time/lifestyle cost.`,
        NEGATIVE: `❌ Likely a downgrade: ${moneyText}. ${reasons.join(' ')} You may want to decline or negotiate changes.`,
    }

    return base[p.verdict];
}
