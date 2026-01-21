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
