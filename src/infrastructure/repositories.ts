import axios from 'axios';
import type { ExchangeRate, IRateRepository } from '../core/domain/entities';

/**
 * 實作外部 API 串接 (Infrastructure Layer)
 * 使用 ExchangeRate-API (免費版)
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
            // 使用 Frankfurter API 獲取歷史數據 (例如: 2024-01-20)
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
}

/**
 * 本地儲存管理 (依據規格對齊匯存結構)
 */
export interface UserSettings {
    baseCurrency: string;
    favoriteCurrencies: string[];
    lastUpdated: number;
}

export class LocalStorageManager {
    private readonly STORAGE_KEY = 'fx_currency_settings';

    private readonly defaultSettings: UserSettings = {
        baseCurrency: 'JPY',
        favoriteCurrencies: ['USD', 'TWD', 'EUR', 'CNY', 'KRW'],
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
}
