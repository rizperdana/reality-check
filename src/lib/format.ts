import type { Lang } from './i18n';

export function formatNumber(n: number, lang: Lang): string {
    return new Intl.NumberFormat(lang === 'id' ? 'id-ID' : 'en-US').format(n);
}

export function idr(n: number, lang: Lang): string {
    return formatNumber(n, lang);
}
