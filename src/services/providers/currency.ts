import type { CurrencyRate, DataEnvelope } from '@/types';
import { PROVIDER_KEYS } from '@/services/config';

export interface CurrencyProvider {
  readonly name: string;
  getRate(from: string, to: string): Promise<DataEnvelope<CurrencyRate>>;
}

/**
 * Indicative reference rates, recorded on the date below. They are *not* live
 * and the UI must always show the recorded date alongside any converted value.
 */
const REFERENCE_DATE = '2025-09-01';
const PER_INR: Record<string, number> = {
  INR: 1,
  USD: 0.0114,
  EUR: 0.0103,
  GBP: 0.0088,
  AED: 0.0419,
  AUD: 0.0172,
  SGD: 0.0147,
  CAD: 0.0156,
  JPY: 1.68,
};

export const SUPPORTED_CURRENCIES = Object.keys(PER_INR);

export class ReferenceCurrencyProvider implements CurrencyProvider {
  readonly name = 'Indicative reference rates (demo)';

  async getRate(from: string, to: string): Promise<DataEnvelope<CurrencyRate>> {
    const fromRate = PER_INR[from];
    const toRate = PER_INR[to];
    if (!fromRate || !toRate) throw new Error(`No reference rate for ${from}→${to}`);
    return {
      data: { base: from, quote: to, rate: toRate / fromRate },
      source: 'demo',
      provider: this.name,
      fetchedAt: new Date().toISOString(),
      note: `Indicative rate recorded on ${REFERENCE_DATE}. Use it for rough budgeting only — check a live rate before exchanging money.`,
    };
  }
}

export class ExchangeRateApiProvider implements CurrencyProvider {
  readonly name = 'ExchangeRate API';

  constructor(private readonly apiKey: string, private readonly fallback: CurrencyProvider) {}

  async getRate(from: string, to: string): Promise<DataEnvelope<CurrencyRate>> {
    try {
      const response = await fetch(`https://v6.exchangerate-api.com/v6/${this.apiKey}/pair/${from}/${to}`);
      if (!response.ok) throw new Error(`Rate API responded ${response.status}`);
      const json = (await response.json()) as { conversion_rate?: number };
      if (!json.conversion_rate) throw new Error('Rate missing from response');
      return {
        data: { base: from, quote: to, rate: json.conversion_rate },
        source: 'live',
        provider: this.name,
        fetchedAt: new Date().toISOString(),
      };
    } catch (error) {
      const fallback = await this.fallback.getRate(from, to);
      return { ...fallback, note: `${fallback.note} (Live rate failed: ${(error as Error).message})` };
    }
  }
}

const reference = new ReferenceCurrencyProvider();

export const currencyProvider: CurrencyProvider = PROVIDER_KEYS.exchangeRate
  ? new ExchangeRateApiProvider(PROVIDER_KEYS.exchangeRate, reference)
  : reference;

export const CURRENCY_TIPS = [
  'Airport exchange counters carry the worst spreads in India. Change a small amount on arrival and the rest in town.',
  'ATMs give close to the interbank rate. Expect a ₹150–250 fee per withdrawal plus whatever your home bank charges.',
  'UPI is near-universal. International cards can be linked to UPI apps through some banks — check before you fly.',
  'Count notes before leaving any counter, and keep ₹100 and ₹200 notes for autos, tickets and tips.',
  'Only exchange at RBI-authorised dealers (look for the FFMC licence). Street exchange is illegal.',
];
