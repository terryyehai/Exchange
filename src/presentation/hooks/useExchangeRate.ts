import { useState, useEffect, useCallback } from 'react';
import { ApiRateRepository, LocalStorageManager } from '../../infrastructure/repositories';
import { GetLatestRates, ConvertCurrency } from '../../core/usecases/rate-usecases';
import { ExchangeRate } from '../../core/domain/entities';

const rateRepo = new ApiRateRepository();
const storage = new LocalStorageManager();
const getRatesUseCase = new GetLatestRates(rateRepo);
const convertUseCase = new ConvertCurrency();

/**
 * 匯率邏輯 Custom Hook
 */
export const useExchangeRate = (baseCurrency: string = 'USD') => {
    const [rates, setRates] = useState<ExchangeRate | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [favorites, setFavorites] = useState<string[]>(storage.getFavorites());

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

    return { rates, loading, error, favorites, convert, toggleFavorite, refresh: () => fetchRates(baseCurrency) };
};
