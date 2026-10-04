import { useMemo, useState } from 'react';
import { Check, Minus, Plus, Search } from 'lucide-react';
import type { DraftTrip } from '@/store/tripStore';
import type { ActivityId, DietId, InterestId } from '@/types';
import {
  ACTIVITIES, BUDGET_TIERS, DIETS, HOME_CURRENCIES, INTERESTS, MOBILITY_NEEDS,
  PACES, SPICE_LEVELS, STAY_PREFERENCES, TRANSPORT_PREFERENCES, TRAVEL_TYPES,
} from '@/data/preferences';
import { DESTINATIONS, ORIGIN_CITIES } from '@/data/destinations';
import { ChoiceChip } from '@/components/ui/Chip';
import { Figure } from '@/components/ui/Figure';
import { RangeField, SelectField, TextField } from '@/components/ui/Field';
import { suggestBudgetINR } from '@/services/planner/budget';
import { formatINR } from '@/utils/format';
import { MONTH_SHORT } from '@/data/months';
import { todayISO, tripLengthDays } from '@/utils/dates';
import { cn } from '@/utils/cn';

export interface StepProps {
  draft: DraftTrip;
  patch: (next: Partial<DraftTrip>) => void;
  patchPrefs: (next: Partial<DraftTrip['preferences']>) => void;
}

const toggle = <T,>(list: T[] | undefined, value: T): T[] => {
  const current = list ?? [];
  return current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
};

/* ----------------------------- 1. Destination ----------------------------- */

export function DestinationStep({ draft, patch }: StepProps) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return DESTINATIONS;
    return DESTINATIONS.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.state.toLowerCase().includes(q) ||
        d.tagline.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="space-y-5">
      <div className="relative">
        <Search size={17} aria-hidden className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Try Jaipur, Goa, Kerala…"
          aria-label="Search destinations"
          className="w-full rounded-xl border border-line bg-surface py-3 pl-11 pr-4 text-[15px] placeholder:text-ink-faint/70 focus:border-saffron focus:outline-none focus:ring-2 focus:ring-saffron/25"
        />
      </div>

      {results.length === 0 ? (
        <p className="rounded-xl bg-surface-2 px-4 py-6 text-center text-[14px] text-ink-faint">
          Nothing matches “{query}”. This prototype ships eight destinations in full depth — clear the search to see
          them.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {results.map((destination) => {
            const selected = draft.destinationId === destination.id;
            return (
              <button
                key={destination.id}
                type="button"
                aria-pressed={selected}
                onClick={() => patch({ destinationId: destination.id })}
                className={cn(
                  'group flex items-stretch gap-0 overflow-hidden rounded-2xl border text-left transition duration-200',
                  selected ? 'border-saffron shadow-[0_0_0_1px_hsl(var(--saffron)/0.6)]' : 'border-line hover:border-line-strong',
                )}
              >
                <Figure
                  src={destination.thumbnail}
                  alt=""
                  sizes="120px"
                  overlay={false}
                  className="h-auto w-[104px] shrink-0"
                  imgClassName="group-hover:scale-105"
                />
                <span className="min-w-0 flex-1 bg-surface px-4 py-3">
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-display text-[16px] leading-tight">{destination.name}</span>
                    {selected ? <Check size={16} className="shrink-0 text-saffron" strokeWidth={3} /> : null}
                  </span>
                  <span className="mt-0.5 block text-[11.5px] uppercase tracking-wide text-ink-faint">
                    {destination.state}
                  </span>
                  <span className="mt-1.5 line-clamp-2 block text-[12.5px] leading-snug text-ink-soft">
                    {destination.tagline}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ------------------------------ 2. Basics -------------------------------- */

export function BasicsStep({ draft, patch, patchPrefs }: StepProps) {
  const destination = DESTINATIONS.find((d) => d.id === draft.destinationId);
  const nights = draft.startDate && draft.endDate ? tripLengthDays(draft.startDate, draft.endDate) : 0;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Your name"
          value={draft.travellerName}
          onChange={(event) => patch({ travellerName: event.target.value })}
          placeholder="So the dashboard can greet you"
          autoComplete="given-name"
        />
        <SelectField
          label="Starting from"
          value={draft.originCity}
          onChange={(event) => {
            const city = event.target.value;
            const international = !ORIGIN_CITIES.slice(0, 14).includes(city);
            patch({ originCity: city });
            patchPrefs({ isInternationalVisitor: international, homeCurrency: international ? 'USD' : 'INR' });
          }}
          options={ORIGIN_CITIES.map((city) => ({ value: city, label: city }))}
          hint="Used for travel-time buffers on day one and for ticket pricing."
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Start date"
          type="date"
          min={todayISO()}
          value={draft.startDate ?? ''}
          onChange={(event) => {
            const startDate = event.target.value;
            const endDate = draft.endDate && draft.endDate >= startDate ? draft.endDate : startDate;
            patch({ startDate, endDate });
          }}
        />
        <TextField
          label="End date"
          type="date"
          min={draft.startDate ?? todayISO()}
          value={draft.endDate ?? ''}
          onChange={(event) => patch({ endDate: event.target.value })}
          hint={nights ? `${nights} ${nights === 1 ? 'day' : 'days'} on the ground.` : undefined}
        />
      </div>

      {draft.preferences.isInternationalVisitor ? (
        <SelectField
          label="Home currency"
          value={draft.preferences.homeCurrency ?? 'USD'}
          onChange={(event) => patchPrefs({ homeCurrency: event.target.value })}
          options={HOME_CURRENCIES.map((code) => ({ value: code, label: code }))}
          hint="Budgets stay in rupees; the converter uses this as your reference."
        />
      ) : null}

      {destination ? (
        <div className="rounded-2xl border border-line bg-surface-2/60 p-4">
          <p className="text-[13px] font-medium text-ink">
            Best months for {destination.name}:{' '}
            <span className="text-saffron">
              {destination.bestMonths.map((month) => MONTH_SHORT[month - 1]).join(', ')}
            </span>
          </p>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-faint">{destination.climateSummary}</p>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-faint">
            Most people spend {destination.idealDays[0]}–{destination.idealDays[1]} days here.
          </p>
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------ 3. Who ----------------------------------- */

export function TravellersStep({ draft, patchPrefs }: StepProps) {
  const count = draft.preferences.travellers ?? 2;

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2">
        {TRAVEL_TYPES.map((type) => (
          <ChoiceChip
            key={type.id}
            selected={draft.preferences.travelType === type.id}
            onToggle={() =>
              patchPrefs({
                travelType: type.id,
                travellers: type.id === 'solo' ? 1 : type.id === 'couple' ? 2 : Math.max(3, count),
              })
            }
            hint={type.hint}
            emoji={type.emoji}
          >
            {type.label}
          </ChoiceChip>
        ))}
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-line bg-surface px-4 py-3.5">
        <div>
          <p className="text-[14.5px] font-medium">How many travellers?</p>
          <p className="mt-0.5 text-[12.5px] text-ink-faint">Ticket prices and meal costs scale with this.</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Fewer travellers"
            onClick={() => patchPrefs({ travellers: Math.max(1, count - 1) })}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-soft transition hover:border-line-strong hover:text-ink active:scale-95"
          >
            <Minus size={15} />
          </button>
          <span className="w-10 text-center font-display text-[20px] tabular-nums">{count}</span>
          <button
            type="button"
            aria-label="More travellers"
            onClick={() => patchPrefs({ travellers: Math.min(12, count + 1) })}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-soft transition hover:border-line-strong hover:text-ink active:scale-95"
          >
            <Plus size={15} />
          </button>
        </div>
      </div>

      <div>
        <p className="mb-2.5 text-[13px] font-medium text-ink-soft">Anything we should plan around?</p>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {MOBILITY_NEEDS.map((need) => (
            <ChoiceChip
              key={need.id}
              selected={draft.preferences.mobility === need.id}
              onToggle={() => patchPrefs({ mobility: need.id })}
              hint={need.hint}
            >
              {need.label}
            </ChoiceChip>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- 4. Budget --------------------------------- */

export function BudgetStep({ draft, patchPrefs }: StepProps) {
  const destination = DESTINATIONS.find((d) => d.id === draft.destinationId);
  const tier = draft.preferences.budgetTier ?? 'comfort';
  const travellers = draft.preferences.travellers ?? 2;
  const days = draft.startDate && draft.endDate ? tripLengthDays(draft.startDate, draft.endDate) : 3;
  const suggested = destination ? suggestBudgetINR(destination, tier, travellers, days) : 30000;
  const total = draft.preferences.budgetTotalINR ?? suggested;

  return (
    <div className="space-y-6">
      <div className="grid gap-2.5 sm:grid-cols-2">
        {BUDGET_TIERS.map((option) => (
          <ChoiceChip
            key={option.id}
            selected={tier === option.id}
            onToggle={() =>
              patchPrefs({
                budgetTier: option.id,
                budgetTotalINR: destination ? suggestBudgetINR(destination, option.id, travellers, days) : total,
              })
            }
            hint={
              destination
                ? `${option.hint} · about ${formatINR(destination.dailyBudgetINR[option.id])}/person/day`
                : option.hint
            }
          >
            {option.label}
          </ChoiceChip>
        ))}
      </div>

      <div className="rounded-2xl border border-line bg-surface p-5">
        <RangeField
          label="Total trip budget"
          valueLabel={formatINR(total)}
          min={2000}
          max={400000}
          step={500}
          value={total}
          onChange={(event) => patchPrefs({ budgetTotalINR: Number(event.target.value) })}
        />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[12.5px] text-ink-faint">
          <span>
            {formatINR(Math.round(total / Math.max(1, travellers)))} per traveller ·{' '}
            {formatINR(Math.round(total / Math.max(1, days)))} per day
          </span>
          {total !== suggested ? (
            <button
              type="button"
              onClick={() => patchPrefs({ budgetTotalINR: suggested })}
              className="font-medium text-saffron underline-offset-4 hover:underline"
            >
              Reset to suggested {formatINR(suggested)}
            </button>
          ) : (
            <span>Suggested for a {tier} {days}-day trip.</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------- 5. Interests -------------------------------- */

export function InterestsStep({ draft, patchPrefs }: StepProps) {
  const selected = draft.preferences.interests ?? [];
  return (
    <div className="space-y-4">
      <p className="text-[13.5px] text-ink-faint">
        Pick as many as apply — these directly decide which places get scheduled and in what order. {selected.length}{' '}
        selected.
      </p>
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {INTERESTS.map((interest) => (
          <ChoiceChip
            key={interest.id}
            selected={selected.includes(interest.id)}
            onToggle={() => patchPrefs({ interests: toggle<InterestId>(selected, interest.id) })}
            emoji={interest.emoji}
          >
            {interest.label}
          </ChoiceChip>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------- 6. Food ---------------------------------- */

export function FoodStep({ draft, patchPrefs }: StepProps) {
  const diets = draft.preferences.diet ?? ['no-preference'];

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2.5 text-[13px] font-medium text-ink-soft">Dietary preferences</p>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {DIETS.map((diet) => (
            <ChoiceChip
              key={diet.id}
              selected={diets.includes(diet.id)}
              onToggle={() => {
                if (diet.id === 'no-preference') {
                  patchPrefs({ diet: ['no-preference'] });
                  return;
                }
                const next = toggle<DietId>(diets.filter((d) => d !== 'no-preference'), diet.id);
                patchPrefs({ diet: next.length ? next : ['no-preference'] });
              }}
            >
              {diet.label}
            </ChoiceChip>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2.5 text-[13px] font-medium text-ink-soft">Chilli tolerance</p>
        <div className="grid gap-2.5 sm:grid-cols-3">
          {SPICE_LEVELS.map((level) => (
            <ChoiceChip
              key={level.id}
              selected={draft.preferences.spice === level.id}
              onToggle={() => patchPrefs({ spice: level.id })}
              hint={level.hint}
            >
              {level.label}
            </ChoiceChip>
          ))}
        </div>
        <p className="mt-3 text-[12.5px] leading-relaxed text-ink-faint">
          We use this to pick which local dishes land in your itinerary — and to flag the ones worth asking for mild.
        </p>
      </div>
    </div>
  );
}

/* --------------------------- 7. Activities & pace ------------------------- */

export function ActivitiesStep({ draft, patchPrefs }: StepProps) {
  const selected = draft.preferences.activities ?? [];

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2.5 text-[13px] font-medium text-ink-soft">What do you want to actually do?</p>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {ACTIVITIES.map((activity) => (
            <ChoiceChip
              key={activity.id}
              selected={selected.includes(activity.id)}
              onToggle={() => patchPrefs({ activities: toggle<ActivityId>(selected, activity.id) })}
            >
              {activity.label}
            </ChoiceChip>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2.5 text-[13px] font-medium text-ink-soft">Pace</p>
        <div className="grid gap-2.5 sm:grid-cols-3">
          {PACES.map((pace) => (
            <ChoiceChip
              key={pace.id}
              selected={draft.preferences.pace === pace.id}
              onToggle={() => patchPrefs({ pace: pace.id })}
              hint={pace.hint}
            >
              {pace.label}
            </ChoiceChip>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------- 8. Stay & transport ---------------------------- */

export function LogisticsStep({ draft, patchPrefs }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2.5 text-[13px] font-medium text-ink-soft">Where would you rather stay?</p>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {STAY_PREFERENCES.map((stay) => (
            <ChoiceChip
              key={stay.id}
              selected={draft.preferences.stay === stay.id}
              onToggle={() => patchPrefs({ stay: stay.id })}
              hint={stay.hint}
            >
              {stay.label}
            </ChoiceChip>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2.5 text-[13px] font-medium text-ink-soft">How do you want to get around?</p>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {TRANSPORT_PREFERENCES.map((transport) => (
            <ChoiceChip
              key={transport.id}
              selected={draft.preferences.transport === transport.id}
              onToggle={() => patchPrefs({ transport: transport.id })}
              hint={transport.hint}
            >
              {transport.label}
            </ChoiceChip>
          ))}
        </div>
        <p className="mt-3 text-[12.5px] leading-relaxed text-ink-faint">
          Travel times between stops are estimated using this — walking a Varanasi lane and driving a Goa coast road
          are not the same day.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------ Summary ----------------------------------- */

export function SummaryStep({ draft }: StepProps) {
  const destination = DESTINATIONS.find((d) => d.id === draft.destinationId);
  const days = draft.startDate && draft.endDate ? tripLengthDays(draft.startDate, draft.endDate) : 0;
  const prefs = draft.preferences;

  const rows: [string, string][] = [
    ['Destination', destination ? `${destination.name}, ${destination.state}` : '—'],
    ['Dates', draft.startDate && draft.endDate ? `${draft.startDate} → ${draft.endDate} (${days} days)` : '—'],
    ['From', draft.originCity],
    ['Travellers', `${prefs.travellers} · ${prefs.travelType}`],
    ['Budget', `${formatINR(prefs.budgetTotalINR ?? 0)} · ${prefs.budgetTier}`],
    ['Pace', prefs.pace ?? '—'],
    ['Interests', (prefs.interests ?? []).map((i) => INTERESTS.find((x) => x.id === i)?.label).join(', ') || '—'],
    ['Food', `${(prefs.diet ?? []).join(', ')} · ${prefs.spice} spice`],
    ['Stay', prefs.stay ?? '—'],
    ['Transport', prefs.transport ?? '—'],
  ];

  return (
    <div className="space-y-5">
      <p className="text-[14px] leading-relaxed text-ink-soft">
        This is everything the planner will use. Nothing is sent anywhere — your trip is stored in this browser.
      </p>
      <dl className="divide-y divide-line overflow-hidden rounded-2xl border border-line">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-start justify-between gap-4 px-4 py-3">
            <dt className="text-[13px] text-ink-faint">{label}</dt>
            <dd className="max-w-[62%] text-right text-[13.5px] font-medium capitalize text-ink">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
