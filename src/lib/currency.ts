export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateVsInr: number; // 1 unit of this currency = how many INR (e.g. 1 USD = 83.5 INR)
  locale: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee (INR)', rateVsInr: 1, locale: 'en-IN' },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar (USD)', rateVsInr: 83.5, locale: 'en-US' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro (EUR)', rateVsInr: 90.0, locale: 'en-IE' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound (GBP)', rateVsInr: 106.0, locale: 'en-GB' },
  AED: { code: 'AED', symbol: 'AED', name: 'UAE Dirham (AED)', rateVsInr: 22.7, locale: 'ar-AE' },
};

export function convertAndFormatPrice(priceInInr: number, targetCurrency: CurrencyCode): string {
  const config = CURRENCIES[targetCurrency] || CURRENCIES.INR;
  const converted = priceInInr / config.rateVsInr;
  
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.code,
    maximumFractionDigits: targetCurrency === 'INR' ? 0 : 2,
  }).format(converted);
}
