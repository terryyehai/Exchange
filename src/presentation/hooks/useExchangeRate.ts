import { useState, useEffect, useCallback, useMemo } from 'react';
import { ApiRateRepository, LocalStorageManager } from '../../infrastructure/repositories';
import { GetLatestRates, ConvertCurrency } from '../../core/usecases/rate-usecases';
import type { ExchangeRate } from '../../core/domain/entities';
import { getCurrencyName, currencyToCountry } from '../../core/domain/currency-map';

const rateRepo = new ApiRateRepository();
const storage = new LocalStorageManager();
const getRatesUseCase = new GetLatestRates(rateRepo);
const convertUseCase = new ConvertCurrency();

/**
 * 匯率邏輯 Custom Hook (Phase 2)
 */
export const useExchangeRate = (baseCurrency: string = 'USD') => {
    const [rates, setRates] = useState<ExchangeRate | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [favorites, setFavorites] = useState<string[]>(storage.getFavorites());
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
        fetchRates(baseCurrency);
    }, [baseCurrency, fetchRates]);

    const convert = (amount: number, targetCurrency: string): number => {
        if (!rates) return 0;
        const toRate = rates.rates[targetCurrency] || 0;
        return convertUseCase.execute(amount, 1, toRate);
    };

    const toggleFavorite = (code: string) => {
        const newFavorites = favorites.includes(code)
            ? favorites.filter(c => c !== code)
            : [...favorites, code];
        setFavorites(newFavorites);
        storage.saveFavorites(newFavorites);
    };

    /**
     * 過濾後的貨幣列表 (依照搜尋或常用)
     */
    const filteredCurrencies = useMemo(() => {
        if (!rates) return [];
        const allCodes = Object.keys(rates.rates);

        // 如果有搜尋字串，過濾所有幣別
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            return allCodes.filter(code =>
                code.toLowerCase().includes(term) ||
                getCurrencyName(code).includes(term)
            ).slice(0, 20); // 限制顯示數量以效能優化
        }

        // 預設顯示常用國家
        return favorites;
    }, [rates, searchTerm, favorites]);

    return {
        rates,
        loading,
        error,
        favorites,
        convert,
        toggleFavorite,
        refresh: () => fetchRates(baseCurrency),
        searchTerm,
        setSearchTerm,
        filteredCurrencies
    };
};
