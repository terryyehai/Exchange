import type { IRateRepository, ExchangeRate } from '../domain/entities';

/**
 * 獲取最新匯率的 Use Case
 */
export class GetLatestRates {
    private rateRepo: IRateRepository;

    constructor(rateRepo: IRateRepository) {
        this.rateRepo = rateRepo;
    }

    async execute(base: string = 'USD'): Promise<ExchangeRate> {
        try {
            return await this.rateRepo.getLatestRates(base);
        } catch (error) {
            throw new Error(`無法獲取匯率資料: ${error instanceof Error ? error.message : '未知錯誤'}`);
        }
    }
}

/**
 * 貨幣換算邏輯 Use Case
 */
export class ConvertCurrency {
    execute(amount: number, fromRate: number, toRate: number): number {
        if (fromRate === 0) return 0;
        // 計算邏輯：(金額 / 來源匯率) * 目標匯率
        const result = (amount / fromRate) * toRate;
        return Number(result.toFixed(4));
    }
}

/**
 * 獲取歷史匯率的 Use Case
 */
export class GetHistoryRates {
    private rateRepo: IRateRepository;

    constructor(rateRepo: IRateRepository) {
        this.rateRepo = rateRepo;
    }

    async execute(base: string, date: string): Promise<ExchangeRate> {
        return await this.rateRepo.getHistoricalRates(base, date);
    }
}

/**
 * 獲取匯率走勢數據的 Use Case
 */
export class GetTimeSeriesRates {
    private rateRepo: IRateRepository;

    constructor(rateRepo: IRateRepository) {
        this.rateRepo = rateRepo;
    }

    async execute(base: string, start: string, end: string, target: string): Promise<any[]> {
        const raw = await this.rateRepo.getTimeSeriesRates(base, start, end, target);
        // 轉換為 Recharts 格式: [{ date: '01/01', rate: 1.23 }, ...]
        return Object.keys(raw).map(date => ({
            date: date.slice(5), // 只取 MM-DD 方便顯示
            rate: raw[date]
        })).sort((a, b) => a.date.localeCompare(b.date));
    }
}
