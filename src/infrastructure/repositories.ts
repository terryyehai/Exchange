import axios from 'axios';
import type { ExchangeRate, IRateRepository } from '../core/domain/entities';
import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

/**
 * 實作外部 API 串接 (Infrastructure Layer)
 */
export class ApiRateRepository implements IRateRepository {
    private readonly latestUrl = 'https://api.exchangerate-api.com/v4/latest';
    private readonly historyUrl = 'https://api.frankfurter.app';

    async getLatestRates(base: string): Promise<ExchangeRate> {
        try {
            const response = await axios.get(`${this.latestUrl}/${base}`);
            return {
                base: response.data.base,
                date: response.data.date,
                rates: response.data.rates,
            };
        } catch (error) {
            console.error('Latest API Error:', error);
            throw new Error('無法獲取最新匯率。');
        }
    }

    async getHistoricalRates(base: string, date: string): Promise<ExchangeRate> {
        try {
            const response = await axios.get(`${this.historyUrl}/${date}?from=${base}`);
            return {
                base: response.data.base,
                date: response.data.date,
                rates: response.data.rates,
            };
        } catch (error) {
            console.error('History API Error:', error);
            throw new Error(`無法獲取 ${date} 的歷史匯率。`);
        }
    }

    async getTimeSeriesRates(base: string, start: string, end: string, target: string): Promise<Record<string, number>> {
        try {
            const response = await axios.get(`${this.historyUrl}/${start}..${end}?from=${base}&to=${target}`);
            const result: Record<string, number> = {};
            if (response.data.rates) {
                Object.keys(response.data.rates).forEach(date => {
                    result[date] = response.data.rates[date][target];
                });
            }
            return result;
        } catch (error) {
            console.error('TimeSeries API Error:', error);
            return {};
        }
    }
}

/**
 * 本地儲存與雲端同步管理 (Phase 5: Cloud Sync)
 */
export interface UserSettings {
    baseCurrency: string;
    favoriteCurrencies: string[];
    lastUpdated: number;
}

export class LocalStorageManager {
    private readonly STORAGE_KEY = 'fx_currency_settings';

    private readonly defaultSettings: UserSettings = {
        baseCurrency: 'TWD',
        favoriteCurrencies: ['TWD', 'CNY', 'USD', 'ISK', 'EUR', 'JPY', 'KRW', 'NZD'],
        lastUpdated: Date.now()
    };

    getSettings(): UserSettings {
        const data = localStorage.getItem(this.STORAGE_KEY);
        if (!data) return this.defaultSettings;
        try {
            return JSON.parse(data);
        } catch {
            return this.defaultSettings;
        }
    }

    saveSettings(settings: Partial<UserSettings>): void {
        const current = this.getSettings();
        const updated = { ...current, ...settings, lastUpdated: Date.now() };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    }

    /**
     * 向雲端同步資料 (Firebase / Firestore)
     */
    async syncToCloud(uid: string): Promise<void> {
        const localSettings = this.getSettings();
        try {
            const userRef = doc(db, 'users', uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const cloudSettings = userSnap.data() as UserSettings;
                if (cloudSettings.lastUpdated > localSettings.lastUpdated) {
                    this.saveSettings(cloudSettings);
                } else if (cloudSettings.lastUpdated < localSettings.lastUpdated) {
                    await updateDoc(userRef, { ...localSettings });
                }
            } else {
                await setDoc(userRef, { ...localSettings });
            }
        } catch (error) {
            console.error('Cloud Sync Error:', error);
        }
    }
}
