import type { DataEnvelope, Destination, StayOption, StayPreference } from '@/types';
import { seededInt } from '@/utils/misc';

export interface StaySearch {
  destination: Destination;
  preference: StayPreference;
  maxNightlyINR?: number;
  travellers: number;
}

export interface StayProvider {
  readonly name: string;
  /** False until a booking partner is connected — the UI must not offer booking. */
  readonly canBook: boolean;
  search(query: StaySearch): Promise<DataEnvelope<StayOption[]>>;
}

const VIBE_SUFFIX: Record<StayPreference, string[]> = {
  hostel: ['Hostel', 'Backpackers', 'Bunk House'],
  'budget-hotel': ['Lodge', 'Residency', 'Inn'],
  boutique: ['Haveli', 'House', 'Heritage Rooms'],
  resort: ['Resort & Spa', 'Retreat', 'Beach Resort'],
  homestay: ['Homestay', 'Family Stay', 'Village Home'],
};

/**
 * Demo stay provider. It deliberately returns *neighbourhood-level* guidance
 * built from each destination's stay areas rather than invented hotel listings
 * with fake prices — and `canBook` is false, so no booking flow is offered.
 */
export class DemoStayProvider implements StayProvider {
  readonly name = 'Neighbourhood guidance (demo)';
  readonly canBook = false;

  async search({ destination, preference, maxNightlyINR, travellers }: StaySearch): Promise<DataEnvelope<StayOption[]>> {
    const areas = destination.stayAreas.filter((area) => area.suitsFor.includes(preference));
    const pool = areas.length ? areas : destination.stayAreas;

    const data: StayOption[] = pool.flatMap((area) => {
      const suffixes = VIBE_SUFFIX[preference];
      return suffixes.slice(0, 2).map((suffix, index) => {
        const seed = `${destination.id}:${area.id}:${preference}:${index}`;
        const [low, high] = area.nightlyRangeINR;
        const base = seededInt(seed, low, Math.round(low + (high - low) * 0.55));
        const nightly = travellers > 2 ? Math.round(base * 1.4) : base;
        return {
          id: `${area.id}-${index}`,
          name: `${area.name.split(' ')[0]} ${suffix}`,
          area: area.name,
          kind: preference,
          nightlyFromINR: nightly,
          rating: Number((3.8 + seededInt(seed + 'r', 0, 10) / 10).toFixed(1)),
          highlights: [area.vibe, ...area.pros.slice(0, 1)],
        };
      });
    });

    const filtered = maxNightlyINR ? data.filter((option) => option.nightlyFromINR <= maxNightlyINR * 1.15) : data;

    return {
      data: (filtered.length ? filtered : data).sort((a, b) => a.nightlyFromINR - b.nightlyFromINR),
      source: 'demo',
      provider: this.name,
      fetchedAt: new Date().toISOString(),
      note: 'Illustrative price bands for each neighbourhood, built from typical published ranges. These are not live rates and nothing here is bookable.',
    };
  }
}

export const stayProvider: StayProvider = new DemoStayProvider();