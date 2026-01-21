import { useState, useEffect, useCallback, useMemo } from 'react';
import { ApiRateRepository, LocalStorageManager } from '../../infrastructure/repositories';
import { GetLatestRates, ConvertCurrency, GetHistoryRates } from '../../core/usecases/rate-usecases';
import type { ExchangeRate } from '../../core/domain/entities';
import { getCurrencyName } from '../../core/domain/currency-map';

const rateRepo = new ApiRateRepository();
const storage = new LocalStorageManager();
const getRatesUseCase = new GetLatestRates(rateRepo);
const getHistoryUseCase = new GetHistoryRates(rateRepo);
const convertUseCase = new ConvertCurrency();

/**
 * 匯率邏輯 Custom Hook (Phase 5: 動態趨勢偵測)
 */
export const useExchangeRate = () => {
    const [settings, setSettings] = useState(storage.getSettings());
    const [rates, setRates] = useState<ExchangeRate | null>(null);
    const [prevRates, setPrevRates] = useState<ExchangeRate | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');

    const fetchRates = useCallback(async (base: string) => {
        setLoading(true);
        try {
            // 獲取最新匯率
            const currentData = await getRatesUseCase.execute(base);
            setRates(currentData);

            // 獲取昨日匯率 (簡單計算昨日日期 YYYY-MM-DD)
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const dateStr = yesterday.toISOString().split('T')[0];

            try {
                const historyData = await getHistoryUseCase.execute(base, dateStr);
                setPrevRates(historyData);
            } catch (hErr) {
                console.warn('無法獲取歷史匯率，漲跌功能將停用:', hErr);
            }

            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : '未知錯誤');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRates(settings.baseCurrency);
    }, [settings.baseCurrency, fetchRates]);

    const convert = (amount: number, targetCurrency: string): number => {
        if (!rates) return 0;
        const toRate = rates.rates[targetCurrency] || 0;
        return convertUseCase.execute(amount, 1, toRate);
    };

    /**
     * 計算匯率變動百分比
     */
    const getRateChange = (code: string): { value: number; percent: string; isUp: boolean } | null => {
        if (!rates || !prevRates) return null;
        const current = rates.rates[code];
        const prev = prevRates.rates[code];
        if (!current || !prev) return null;

        const diff = current - prev;
        const percent = (diff / prev) * 100;
        return {
            value: diff,
            percent: (diff >= 0 ? '+' : '') + percent.toFixed(2) + '%',
            isUp: diff >= 0
        };
    };

    const toggleFavorite = (code: string) => {
        const isFavorite = settings.favoriteCurrencies.includes(code);
        let newFavorites = [...settings.favoriteCurrencies];

        if (isFavorite) {
            newFavorites = newFavorites.filter(c => c !== code);
        } else {
            if (newFavorites.length >= 20) {
                alert('已達到 20 種貨幣上限');
                return;
            }
            newFavorites.push(code);
        }

        const newSettings = { ...settings, favoriteCurrencies: newFavorites };
        setSettings(newSettings);
        storage.saveSettings(newSettings);
    };

    const setBaseCurrency = (code: string) => {
        const newSettings = { ...settings, baseCurrency: code };
        setSettings(newSettings);
        storage.saveSettings(newSettings);
    };

    const filteredCurrencies = useMemo(() => {
        if (!rates) return [];
        const allCodes = Object.keys(rates.rates);

        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            return allCodes.filter(code =>
                code.toLowerCase().includes(term) ||
                getCurrencyName(code).includes(term)
            ).slice(0, 50);
        }

        return settings.favoriteCurrencies;
    }, [rates, searchTerm, settings.favoriteCurrencies]);

    return {
        rates,
        prevRates,
        loading,
        error,
        settings,
        convert,
        getRateChange,
        toggleFavorite,
        setBaseCurrency,
        refresh: () => fetchRates(settings.baseCurrency),
        searchTerm,
        setSearchTerm,
        filteredCurrencies
    };
};
