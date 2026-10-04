import { useMemo, useState } from 'react';
import { Compass, Search, SlidersHorizontal, X } from 'lucide-react';
import type { CurrentWeather, InterestId } from '@/types';
import { DESTINATIONS } from '@/data/destinations';
import { INTERESTS } from '@/data/preferences';
import { MONTH_LABELS, MONTH_SHORT } from '@/data/months';
import { weatherProvider } from '@/services/providers/weather';
import { DestinationCard } from '@/components/explore/DestinationCard';
import { FilterPill } from '@/components/ui/Chip';
import { Button, ButtonLink } from '@/components/ui/Button';
import { SectionTitle } from '@/components/ui/Card';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/States';
import { useAsync } from '@/hooks/useAsync';
import { PROVIDER_KEYS } from '@/services/config';
import { cn } from '@/utils/cn';

type DurationFilter = 'any' | 'short' | 'medium' | 'long';

const DURATIONS: { id: DurationFilter; label: string }[] = [
  { id: 'any', label: 'Any length' },
  { id: 'short', label: '1–3 days' },
  { id: 'medium', label: '4–5 days' },
  { id: 'long', label: '6+ days' },
];

const BUDGET_BANDS: { id: string; label: string; max: number }[] = [
  { id: 'any', label: 'Any budget', max: Infinity },
  { id: 'low', label: 'Under ₹3,000/day', max: 3000 },
  { id: 'mid', label: 'Under ₹4,000/day', max: 4000 },
];

export default function ExplorePage() {
  const [query, setQuery] = useState('');
  const [interests, setInterests] = useState<InterestId[]>([]);
  const [duration, setDuration] = useState<DurationFilter>('any');
  const [budget, setBudget] = useState('any');
  const [month, setMonth] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const weatherState = useAsync<Record<string, { weather: CurrentWeather; demo: boolean }>>(async () => {
    const entries = await Promise.all(
      DESTINATIONS.map(async (destination) => {
        const envelope = await weatherProvider.getCurrentWeather(destination);
        return [destination.id, { weather: envelope.data, demo: envelope.source === 'demo' }] as const;
      }),
    );
    return Object.fromEntries(entries);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const band = BUDGET_BANDS.find((b) => b.id === budget) ?? BUDGET_BANDS[0];

    return DESTINATIONS.filter((destination) => {
      if (q) {
        const haystack = [
          destination.name, destination.state, destination.tagline, destination.summary,
          ...destination.places.map((p) => p.name),
          ...destination.dishes.map((d) => d.name),
        ].join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (interests.length && !interests.every((interest) => destination.interests.includes(interest))) return false;
      if (destination.dailyBudgetINR.comfort > band.max) return false;
      if (month && !destination.bestMonths.includes(month)) return false;

      const [min] = destination.idealDays;
      if (duration === 'short' && min > 3) return false;
      if (duration === 'medium' && (min < 3 || min > 5)) return false;
      if (duration === 'long' && min < 5) return false;
      return true;
    });
  }, [query, interests, duration, budget, month]);

  const activeFilterCount =
    interests.length + (duration === 'any' ? 0 : 1) + (budget === 'any' ? 0 : 1) + (month ? 1 : 0);

  const clearAll = () => {
    setInterests([]);
    setDuration('any');
    setBudget('any');
    setMonth(0);
    setQuery('');
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <SectionTitle
        eyebrow="Explore"
        as="h1"
        title="Where in India?"
        description="Eight destinations with full working data — attractions, food, safety, photo spots, phrases, stays and climate, month by month."
      />

      <div className="sticky top-[57px] z-20 -mx-4 bg-paper/95 px-4 pb-3 pt-1 backdrop-blur lg:top-0 lg:mx-0 lg:px-0">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={17} aria-hidden className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search a city, a dish, a fort…"
              aria-label="Search destinations"
              className="w-full rounded-full border border-line bg-surface py-2.5 pl-11 pr-4 text-[14.5px] placeholder:text-ink-faint/70 focus:border-saffron focus:outline-none focus:ring-2 focus:ring-saffron/25"
            />
          </div>
          <Button
            variant={activeFilterCount ? 'primary' : 'outline'}
            onClick={() => setFiltersOpen((open) => !open)}
            aria-expanded={filtersOpen}
            className="shrink-0"
          >
            <SlidersHorizontal size={15} />
            Filters{activeFilterCount ? ` (${activeFilterCount})` : ''}
          </Button>
        </div>

        <div className={cn('mt-3 space-y-3', filtersOpen ? 'block' : 'hidden')}>
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none lg:mx-0 lg:flex-wrap lg:px-0">
            {INTERESTS.map((interest) => (
              <FilterPill
                key={interest.id}
                active={interests.includes(interest.id)}
                onClick={() =>
                  setInterests((prev) =>
                    prev.includes(interest.id) ? prev.filter((i) => i !== interest.id) : [...prev, interest.id],
                  )
                }
              >
                {interest.emoji} {interest.label}
              </FilterPill>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {DURATIONS.map((option) => (
              <FilterPill key={option.id} active={duration === option.id} onClick={() => setDuration(option.id)}>
                {option.label}
              </FilterPill>
            ))}
            {BUDGET_BANDS.map((band) => (
              <FilterPill key={band.id} active={budget === band.id} onClick={() => setBudget(band.id)}>
                {band.label}
              </FilterPill>
            ))}
          </div>

          <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 scrollbar-none lg:mx-0 lg:flex-wrap lg:px-0">
            <FilterPill active={month === 0} onClick={() => setMonth(0)}>
              Any month
            </FilterPill>
            {MONTH_LABELS.map((label, index) => (
              <FilterPill key={label} active={month === index + 1} onClick={() => setMonth(index + 1)}>
                {MONTH_SHORT[index]}
              </FilterPill>
            ))}
          </div>

          {activeFilterCount ? (
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-faint underline-offset-4 hover:text-ink hover:underline"
            >
              <X size={13} /> Clear all filters
            </button>
          ) : null}
        </div>
      </div>

      <p className="mb-4 mt-2 text-[13px] text-ink-faint" aria-live="polite">
        {results.length} {results.length === 1 ? 'destination' : 'destinations'}
        {month ? ` best visited in ${MONTH_LABELS[month - 1]}` : ''}
      </p>

      {weatherState.error ? (
        <ErrorState
          className="mb-5"
          title="Weather could not be loaded"
          message={weatherState.error.message}
          onRetry={weatherState.reload}
        />
      ) : null}

      {weatherState.loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="overflow-hidden rounded-card border border-line">
              <Skeleton className="aspect-[16/10] rounded-none" />
              <div className="space-y-2.5 p-4">
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-2/3" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : results.length === 0 ? (
        <EmptyState
          icon={<Compass size={22} />}
          title="No destinations match those filters"
          description="This build ships eight destinations in full depth. Try loosening the month or interest filters."
          action={
            <Button variant="outline" onClick={clearAll}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((destination) => (
            <DestinationCard
              key={destination.id}
              destination={destination}
              weather={weatherState.data?.[destination.id]?.weather}
              weatherIsDemo={weatherState.data?.[destination.id]?.demo}
            />
          ))}
        </div>
      )}

      <div className="mt-10 rounded-card border border-line bg-surface-2/50 p-5 sm:p-6">
        <h2 className="font-display text-lg">Ready to turn one of these into a plan?</h2>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-soft">
          Onboarding takes about a minute and produces a timed itinerary, a budget split, a packing list and a safety
          brief for the dates you pick.
        </p>
        <ButtonLink to="/onboarding" className="mt-4">
          Plan my trip
        </ButtonLink>
        {!PROVIDER_KEYS.openWeather ? (
          <p className="mt-4 text-[12px] leading-relaxed text-ink-faint">
            Temperatures shown on these cards are modelled from each destination’s published monthly climate averages.
            Add <code className="rounded bg-surface px-1 py-0.5">VITE_OPENWEATHER_API_KEY</code> for live conditions.
          </p>
        ) : null}
      </div>
    </div>
  );
}
