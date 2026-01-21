import axios from 'axios';
import type { ExchangeRate, IRateRepository } from '../core/domain/entities';

/**
 * 實作外部 API 串接 (Infrastructure Layer)
 * 使用 ExchangeRate-API (免費版)
 */
export class ApiRateRepository implements IRateRepository {
    private readonly baseUrl = 'https://api.exchangerate-api.com/v4/latest';

    async getLatestRates(base: string): Promise<ExchangeRate> {
        try {
            const response = await axios.get(`${this.baseUrl}/${base}`);
            return {
                base: response.data.base,
                date: response.data.date,
                rates: response.data.rates,
            };
        } catch (error) {
            console.error('API Error:', error);
            throw new Error('無法從遠端 API 獲取匯率，請檢查網路連線。');
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
