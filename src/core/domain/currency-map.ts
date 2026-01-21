/**
 * 貨幣代碼 (3位) 映射至 國家代碼 (2位)
 * 用於 FlagCDN (https://flagcdn.com/)
 */
export const currencyToCountry: Record<string, string> = {
    TWD: 'tw', USD: 'us', JPY: 'jp', EUR: 'eu', CNY: 'cn',
    HKD: 'hk', KRW: 'kr', SGD: 'sg', MYR: 'my', THB: 'th',
    AUD: 'au', CAD: 'ca', GBP: 'gb', CHF: 'ch', NZD: 'nz',
    VND: 'vn', PHP: 'ph', IDR: 'id', INR: 'in', KR: 'kr',
    ZAR: 'za', TRY: 'tr', BRL: 'br', MXN: 'mx', RUB: 'ru',
    AED: 'ae', ARS: 'ar', BHD: 'bh', CLP: 'cl', COP: 'co',
    CZK: 'cz', DKK: 'dk', EGP: 'eg', HUF: 'hu', ILS: 'il',
    ISK: 'is', JOD: 'jo', KWD: 'kw', LBP: 'lb', MAD: 'ma',
    NOK: 'no', OMR: 'om', PLN: 'pl', QAR: 'qa', RON: 'ro',
    SAR: 'sa', SEK: 'se', TH: 'th', TRY_LIRA: 'tr', TWD_NT: 'tw',
    // 更多映射可持續補充...
};

/**
 * 貨幣符號映射
 */
export const currencySymbols: Record<string, string> = {
    USD: '$', TWD: 'NT$', JPY: '¥', EUR: '€', CNY: 'CN¥',
    HKD: 'HK$', KRW: '₩', SGD: 'S$', GBP: '£', CHF: 'Fr',
    AUD: 'A$', CAD: 'C$', NZD: 'NZ$', THB: '฿', PHP: '₱',
    VND: '₫', MYR: 'RM', IDR: 'Rp', INR: '₹', ISK: 'kr'
};

/**
 * 獲取國旗 URL
 */
export const getFlagUrl = (currencyCode: string): string => {
    const countryCode = currencyToCountry[currencyCode]?.toLowerCase() || 'unknown';
    if (countryCode === 'unknown') return 'https://flagcdn.com/w80/un.png';
    return `https://flagcdn.com/w80/${countryCode}.png`;
};

/**
 * 使用瀏覽器內建 API 取得繁體中文名稱 (台灣用語)
 */
export const getCurrencyName = (code: string): string => {
    try {
        const displayNames = new Intl.DisplayNames(['zh-TW'], { type: 'currency' });
        return displayNames.of(code) || code;
    } catch {
        return code;
    }
};
