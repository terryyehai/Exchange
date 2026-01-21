/**
 * 匯率資料實體 (Domain Entity)
 */
export interface ExchangeRate {
  base: string;
  date: string;
  rates: Record<string, number>;
}

/**
 * 貨幣資訊實體
 */
export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

/**
 * 匯率存取介面 (Repository Interface)
 */
export interface IRateRepository {
  getLatestRates(base: string): Promise<ExchangeRate>;
  getHistoricalRates(base: string, date: string): Promise<ExchangeRate>;
}
