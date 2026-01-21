import axios from 'axios';
import { ExchangeRate, IRateRepository } from '../core/domain/entities';

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
 * 本地儲存管理 (Favorites/Preferences)
 */
export class LocalStorageManager {
    private readonly FAVORITES_KEY = 'exchange_favorites';

    getFavorites(): string[] {
        const data = localStorage.getItem(this.FAVORITES_KEY);
        return data ? JSON.parse(data) : ['TWD', 'USD', 'JPY', 'EUR', 'CNY'];
    }

    saveFavorites(favorites: string[]): void {
        localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(favorites));
    }
}
