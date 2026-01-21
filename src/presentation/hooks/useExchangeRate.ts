import { useState, useEffect, useCallback, useMemo } from 'react';
import { ApiRateRepository, LocalStorageManager } from '../../infrastructure/repositories';
import { GetLatestRates, ConvertCurrency, GetHistoryRates, GetTimeSeriesRates } from '../../core/usecases/rate-usecases';
import type { ExchangeRate } from '../../core/domain/entities';
import { getCurrencyName } from '../../core/domain/currency-map';
import { loginAnonymously } from '../../infrastructure/firebase';

const rateRepo = new ApiRateRepository();
const storage = new LocalStorageManager();
const getRatesUseCase = new GetLatestRates(rateRepo);
const getHistoryUseCase = new GetHistoryRates(rateRepo);
const getTimeSeriesUseCase = new GetTimeSeriesRates(rateRepo);
const convertUseCase = new ConvertCurrency();

/**
 * 匯率邏輯 Custom Hook (Phase 5: 動態趨勢偵測 + 雲端同步)
 */
export const useExchangeRate = () => {
    const [settings, setSettings] = useState(storage.getSettings());
    const [uid, setUid] = useState<string | null>(null);
    const [rates, setRates] = useState<ExchangeRate | null>(null);
    const [prevRates, setPrevRates] = useState<ExchangeRate | null>(null);
    const [historyData, setHistoryData] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');

    // 初始化 Firebase 認證與雲端同步
    useEffect(() => {
        loginAnonymously().then(id => {
            if (id) {
                setUid(id);
                storage.syncToCloud(id).then(() => {
                    const latest = storage.getSettings();
                    setSettings(latest);
                });
            }
        });
    }, []);

    // 當 Settings 變動時自動同步至雲端
    useEffect(() => {
        if (uid) {
            storage.syncToCloud(uid);
        }
    }, [settings, uid]);

    const fetchRates = useCallback(async (base: string) => {
        setLoading(true);
        try {
            const currentData = await getRatesUseCase.execute(base);
            setRates(currentData);

            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const dateStr = yesterday.toISOString().split('T')[0];

            try {
                const historyData = await getHistoryUseCase.execute(base, dateStr);
                setPrevRates(historyData);
            } catch (hErr) {
                console.warn('無法獲取歷史匯率:', hErr);
            }

            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : '未知錯誤');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchHistory = useCallback(async (base: string, target: string, days: number = 30) => {
        const end = new Date().toISOString().split('T')[0];
        const start = new Date();
        start.setDate(start.getDate() - days);
        const startStr = start.toISOString().split('T')[0];

        try {
            const chartData = await getTimeSeriesUseCase.execute(base, startStr, end, target);
            setHistoryData(chartData);
        } catch (err) {
            console.error('History fetch error:', err);
        }
    }, []);

    useEffect(() => {
        fetchRates(settings.baseCurrency);
    }, [settings.baseCurrency, fetchRates]);

    /**
     * 計算任意貨幣間的換算 (Phase 5 Update)
     * 支援從任意 Source Currency 換算到 Target Currency
     */
    const calculateExchange = (amount: number, sourceCode: string, targetCode: string): number => {
        if (!rates) return 0;
        // 如果來源就是 API Base (e.g. JPY/TWD), 直接取 Target Rate
        // 如果不是, 則先換算回 Base, 再換算到 Target
        // 但其實 ConvertCurrency UseCase 已經封裝了 (amount / fromRate) * toRate
        // 只要傳入正確的相對於 Base 的匯率即可
        const sourceRateRelToBase = rates.rates[sourceCode] || 1;
        const targetRateRelToBase = rates.rates[targetCode] || 1;

        // 特例：若 sourceCode 是 Base 本身 (例如 API Base 是 TWD, source 是 TWD, 則 rate = 1)
        // 由於 rates.rates[base] 雖通常為 1 但有時可能不存在，需防呆

        return convertUseCase.execute(amount, sourceRateRelToBase, targetRateRelToBase);
    };

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
            if (newFavorites.length >= 20) return;
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

    const reorderFavorites = (newOrder: string[]) => {
        const newSettings = { ...settings, favoriteCurrencies: newOrder };
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
        historyData,
        loading,
        error,
        settings,
        calculateExchange,
        getRateChange,
        fetchHistory,
        toggleFavorite,
        reorderFavorites,
        setBaseCurrency,
        refresh: () => fetchRates(settings.baseCurrency),
        searchTerm,
        setSearchTerm,
        filteredCurrencies
    };
};
