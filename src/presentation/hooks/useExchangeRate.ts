import { useState, useEffect, useCallback, useMemo } from 'react';
import { ApiRateRepository, LocalStorageManager } from '../../infrastructure/repositories';
import { GetLatestRates, ConvertCurrency } from '../../core/usecases/rate-usecases';
import type { ExchangeRate } from '../../core/domain/entities';
import { getCurrencyName } from '../../core/domain/currency-map';

const rateRepo = new ApiRateRepository();
const storage = new LocalStorageManager();
const getRatesUseCase = new GetLatestRates(rateRepo);
const convertUseCase = new ConvertCurrency();

/**
 * 匯率邏輯 Custom Hook (Phase 4: 規格對齊)
 */
export const useExchangeRate = () => {
    const [settings, setSettings] = useState(storage.getSettings());
    const [rates, setRates] = useState<ExchangeRate | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');

    const fetchRates = useCallback(async (base: string) => {
        setLoading(true);
        try {
            const data = await getRatesUseCase.execute(base);
            setRates(data);
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
        // 規格要求: Result = Amount * (ToRate / FromRate)
        // 這裡因為 base 就是 JPY，如果 FromRate = 1 則直接乘
        return convertUseCase.execute(amount, 1, toRate);
    };

    const toggleFavorite = (code: string) => {
        const isFavorite = settings.favoriteCurrencies.includes(code);
        let newFavorites = [...settings.favoriteCurrencies];

        if (isFavorite) {
            newFavorites = newFavorites.filter(c => c !== code);
        } else {
            // 規格限制: 上限 20 種
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

    /**
     * 過濾後的貨幣列表 (依照搜尋或常用)
     */
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
        loading,
        error,
        settings,
        convert,
        toggleFavorite,
        setBaseCurrency,
        refresh: () => fetchRates(settings.baseCurrency),
        searchTerm,
        setSearchTerm,
        filteredCurrencies
    };
};
