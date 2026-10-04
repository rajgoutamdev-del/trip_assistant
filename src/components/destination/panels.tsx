import { useMemo, useState } from 'react';
import {
  Camera, Car, Clock, Copy, ExternalLink, Flame, Leaf, MapPin, ShieldAlert,
  ShieldCheck, Ticket, TriangleAlert, Volume2,
} from 'lucide-react';
import type {
  CrowdLevel, Destination, Dish, LanguagePack, ParkingSpot, Phrase, PhotoSpot, Place, StayArea,
} from '@/types';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge, MetaRow } from '@/components/ui/Badge';
import { Disclosure } from '@/components/ui/Disclosure';
import { FilterPill } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/States';
import { mapsProvider } from '@/services/providers/maps';
import { timeOfDayLabel } from '@/services/providers/places';
import { formatINR, formatDuration, titleCase } from '@/utils/format';
import { cn } from '@/utils/cn';

/* --------------------------------- Places -------------------------------- */

export function PlaceList({
  places,
  isInternational,
  onAdd,
}: {
  places: Place[];
  isInternational?: boolean;
  onAdd?: (place: Place) => void;
}) {
  const [category, setCategory] = useState<string>('all');
  const categories = useMemo(() => ['all', ...new Set(places.map((p) => p.category))], [places]);
  const filtered = category === 'all' ? places : places.filter((p) => p.category === category);

  return (
    <div className="space-y-4">
      {categories.length > 2 ? (
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:flex-wrap sm:px-0">
          {categories.map((value) => (
            <FilterPill key={value} active={category === value} onClick={() => setCategory(value)}>
              {value === 'all' ? 'All places' : titleCase(value)}
            </FilterPill>
          ))}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {filtered.map((place) => {
          const fee = isInternational ? place.entryFeeINR.foreign : place.entryFeeINR.indian;
          const quietest = (Object.entries(place.crowdPattern) as [string, CrowdLevel][]).find(
            ([, level]) => level === 'quiet',
          );
          return (
            <Card key={place.id} className="flex flex-col p-5" interactive>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-display text-[17px] leading-tight">{place.name}</h3>
                  <p className="mt-1 text-[12.5px] text-ink-faint">
                    {titleCase(place.category)} · {place.area}
                  </p>
                </div>
                <Badge tone="neutral" className="shrink-0 capitalize">
                  {place.bestTime[0] ?? 'anytime'}
                </Badge>
              </div>

              <p className="mt-3 text-[13.5px] leading-relaxed text-ink-soft">{place.blurb}</p>

              <MetaRow
                className="mt-3.5"
                items={[
                  <span key="t" className="inline-flex items-center gap-1.5">
                    <Clock size={12} aria-hidden /> {formatDuration(place.typicalVisitMinutes)}
                  </span>,
                  <span key="f" className="inline-flex items-center gap-1.5">
                    <Ticket size={12} aria-hidden /> {fee === 0 ? 'Free' : formatINR(fee)}
                  </span>,
                  place.openingHours ? <span key="h">{place.openingHours}</span> : undefined,
                ]}
              />

              {quietest ? (
                <p className="mt-3 rounded-xl bg-jade-soft/60 px-3 py-2 text-[12.5px] leading-snug text-ink-soft">
                  <strong className="font-medium text-ink">Quietest {timeOfDayLabel(quietest[0] as never)}.</strong>{' '}
                  {Object.entries(place.crowdPattern)
                    .filter(([, level]) => level === 'packed')
                    .map(([time]) => `Packed ${timeOfDayLabel(time as never)}.`)
                    .join(' ')}
                </p>
              ) : null}

              {place.accessibilityNote ? (
                <p className="mt-2 text-[12.5px] leading-snug text-ink-faint">
                  <strong className="font-medium">Access:</strong> {place.accessibilityNote}
                </p>
              ) : null}

              <div className="mt-4 flex flex-wrap items-center gap-2 pt-1">
                <a
                  href={mapsProvider.externalLink(place.coords, place.name)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[12.5px] font-medium text-ink-soft transition hover:border-line-strong hover:text-ink"
                >
                  <MapPin size={12} /> Map <ExternalLink size={11} />
                </a>
                {onAdd ? (
                  <button
                    type="button"
                    onClick={() => onAdd(place)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-[12.5px] font-medium text-paper transition hover:bg-ink/90"
                  >
                    Add to itinerary
                  </button>
                ) : null}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------- Food --------------------------------- */

export function DishCard({ dish, why }: { dish: Dish; why?: string }) {
  return (
    <Card className="flex flex-col p-5" interactive>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-[17px] leading-tight">{dish.name}</h3>
          {dish.localName ? <p className="mt-0.5 text-[13px] text-ink-faint">{dish.localName}</p> : null}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          {dish.mustTry ? <Badge tone="saffron">Must try</Badge> : null}
          <Badge tone={dish.isVegetarian ? 'jade' : 'neutral'} icon={dish.isVegetarian ? <Leaf size={10} /> : undefined}>
            {dish.isVegetarian ? 'Veg' : 'Non-veg'}
          </Badge>
        </div>
      </div>

      <p className="mt-3 text-[13.5px] leading-relaxed text-ink-soft">{dish.description}</p>

      <p className="mt-3 rounded-xl bg-surface-2/70 px-3.5 py-2.5 text-[12.5px] leading-relaxed text-ink-soft">
        <strong className="font-medium text-ink">Why it matters:</strong> {dish.culturalNote}
      </p>

      {why ? <p className="mt-2 text-[12.5px] leading-relaxed text-saffron">{why}</p> : null}

      <dl className="mt-3.5 space-y-1.5 text-[12.5px]">
        <div className="flex gap-2">
          <dt className="shrink-0 text-ink-faint">Where</dt>
          <dd className="text-ink-soft">{dish.whereToTry.join(' · ')}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="shrink-0 text-ink-faint">Typically</dt>
          <dd className="text-ink-soft">
            {formatINR(dish.approxPriceINR)} · {dish.mealTime.join(', ')}
          </dd>
        </div>
      </dl>

      <div className="mt-3.5 flex flex-wrap gap-1.5">
        <Badge tone={dish.spice === 'fiery' ? 'danger' : dish.spice === 'medium' ? 'warn' : 'neutral'} icon={<Flame size={10} />}>
          {dish.spice}
        </Badge>
        {dish.diet.map((diet) => (
          <Badge key={diet} tone="neutral">
            {diet}
          </Badge>
        ))}
      </div>
    </Card>
  );
}

/* --------------------------------- Safety -------------------------------- */

const SEVERITY: Record<string, { tone: 'danger' | 'warn' | 'neutral'; label: string }> = {
  avoid: { tone: 'danger', label: 'Do not' },
  caution: { tone: 'warn', label: 'Caution' },
  info: { tone: 'neutral', label: 'Good to know' },
};

export function SafetyPanel({ destination }: { destination: Destination }) {
  const { safety } = destination;
  const overall = {
    'generally-safe': { tone: 'jade' as const, label: 'Generally safe', Icon: ShieldCheck },
    'stay-alert': { tone: 'warn' as const, label: 'Stay alert', Icon: ShieldAlert },
    'extra-care': { tone: 'danger' as const, label: 'Extra care needed', Icon: TriangleAlert },
  }[safety.overall];

  return (
    <div className="space-y-5">
      <Card className="p-5">
        <div className="flex items-start gap-3.5">
          <span
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl',
              overall.tone === 'jade' ? 'bg-jade-soft text-jade' : overall.tone === 'warn' ? 'bg-warn-soft text-warn' : 'bg-danger-soft text-danger',
            )}
          >
            <overall.Icon size={21} aria-hidden />
          </span>
          <div>
            <Badge tone={overall.tone}>{overall.label}</Badge>
            <p className="mt-2.5 text-[14.5px] leading-relaxed text-ink-soft">{safety.summary}</p>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="What actually goes wrong here" subtitle="Ordered by how much it matters" />
        <ul className="divide-y divide-line px-5 pb-2">
          {safety.tips.map((tip) => (
            <li key={tip.id} className="py-3.5">
              <div className="flex items-start gap-3">
                <Badge tone={SEVERITY[tip.severity].tone} className="mt-0.5 shrink-0">
                  {SEVERITY[tip.severity].label}
                </Badge>
                <div className="min-w-0">
                  <p className="text-[14.5px] font-medium leading-snug text-ink">{tip.title}</p>
                  <p className="mt-1 text-[13.5px] leading-relaxed text-ink-soft">{tip.detail}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Cultural norms" subtitle="Getting these right changes how you are treated" />
          <div className="px-5 pb-2">
            {safety.culturalNorms.map((norm) => (
              <Disclosure key={norm.id} summary={norm.title}>
                {norm.detail}
              </Disclosure>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Where and when to avoid" subtitle="Specific places, specific hours" />
          <ul className="divide-y divide-line px-5 pb-4">
            {safety.avoidAreas.map((area) => (
              <li key={area.id} className="py-3.5">
                <p className="text-[14.5px] font-medium leading-snug text-ink">{area.name}</p>
                <p className="mt-0.5 text-[12.5px] font-medium text-danger">{area.when}</p>
                <p className="mt-1 text-[13.5px] leading-relaxed text-ink-soft">{area.why}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="After dark" subtitle={`How ${destination.name} behaves at night`} />
          <ul className="space-y-2.5 px-5 pb-5 pt-3">
            {safety.nightGuidance.map((line, index) => (
              <li key={index} className="flex gap-2.5 text-[13.5px] leading-relaxed text-ink-soft">
                <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo" />
                {line}
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader title="Solo women travellers" subtitle="Written for this destination, not in general" />
          <ul className="space-y-2.5 px-5 pb-5 pt-3">
            {safety.soloWomenNotes.map((line, index) => (
              <li key={index} className="flex gap-2.5 text-[13.5px] leading-relaxed text-ink-soft">
                <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-saffron" />
                {line}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

/* ------------------------------- Photo spots ------------------------------ */

const SHOT_LABEL: Record<string, string> = {
  landscape: 'Best for landscapes',
  portrait: 'Best for portraits',
  architecture: 'Best for architecture',
  street: 'Best for street',
  wildlife: 'Best for wildlife',
  night: 'Best after dark',
};

export function PhotoSpotList({ spots }: { spots: PhotoSpot[] }) {
  if (!spots.length) {
    return <EmptyState icon={<Camera size={20} />} title="No photo spots listed yet" />;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {spots.map((spot) => (
        <Card key={spot.id} className="p-5" interactive>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-display text-[17px] leading-tight">{spot.name}</h3>
              <p className="mt-1 text-[12.5px] text-ink-faint">{spot.area}</p>
            </div>
            <Badge tone={spot.popularity === 'hidden-gem' ? 'jade' : spot.popularity === 'iconic' ? 'saffron' : 'neutral'}>
              {spot.popularity.replace('-', ' ')}
            </Badge>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {spot.shotType.map((type) => (
              <Badge key={type} tone="neutral">
                {SHOT_LABEL[type] ?? type}
              </Badge>
            ))}
            {spot.bestTime.map((time) => (
              <Badge key={time} tone="saffron" className="capitalize">
                {time}
              </Badge>
            ))}
          </div>

          <p className="mt-3 text-[13.5px] leading-relaxed text-ink-soft">{spot.tip}</p>
          {spot.permitNote ? (
            <p className="mt-2.5 rounded-xl bg-warn-soft/70 px-3 py-2 text-[12.5px] leading-snug text-ink-soft">
              {spot.permitNote}
            </p>
          ) : null}

          <a
            href={mapsProvider.externalLink(spot.coords, spot.name)}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-soft transition hover:text-ink"
          >
            <MapPin size={12} /> Open location <ExternalLink size={11} />
          </a>
        </Card>
      ))}
    </div>
  );
}

/* -------------------------------- Phrases -------------------------------- */

const PHRASE_CATEGORIES: Phrase['category'][] = [
  'greetings', 'food', 'transport', 'shopping', 'emergency', 'smalltalk',
];

export function PhraseBook({ packs }: { packs: LanguagePack[] }) {
  const [packIndex, setPackIndex] = useState(0);
  const [category, setCategory] = useState<Phrase['category'] | 'all'>('all');
  const [copied, setCopied] = useState<string>();

  const pack = packs[packIndex];
  if (!pack) return <EmptyState title="No phrasebook for this destination yet" />;

  const available = PHRASE_CATEGORIES.filter((c) => pack.phrases.some((p) => p.category === c));
  const phrases = category === 'all' ? pack.phrases : pack.phrases.filter((p) => p.category === category);

  const speak = (phrase: Phrase) => {
    if (!('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(phrase.roman);
    utterance.lang = pack.language === 'Hindi' ? 'hi-IN' : pack.language === 'Marathi' ? 'mr-IN' : 'en-IN';
    utterance.rate = 0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const copy = async (phrase: Phrase) => {
    try {
      await navigator.clipboard.writeText(phrase.script);
      setCopied(phrase.id);
      window.setTimeout(() => setCopied(undefined), 1600);
    } catch {
      /* Clipboard can be blocked; the script is on screen either way. */
    }
  };

  return (
    <div className="space-y-4">
      {packs.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          {packs.map((candidate, index) => (
            <FilterPill key={candidate.language} active={index === packIndex} onClick={() => setPackIndex(index)}>
              {candidate.language} · {candidate.nativeName}
            </FilterPill>
          ))}
        </div>
      ) : null}

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:flex-wrap sm:px-0">
        <FilterPill active={category === 'all'} onClick={() => setCategory('all')} count={pack.phrases.length}>
          All
        </FilterPill>
        {available.map((value) => (
          <FilterPill
            key={value}
            active={category === value}
            onClick={() => setCategory(value)}
            count={pack.phrases.filter((p) => p.category === value).length}
          >
            {titleCase(value)}
          </FilterPill>
        ))}
      </div>

      <ul className="divide-y divide-line overflow-hidden rounded-card border border-line bg-surface">
        {phrases.map((phrase) => (
          <li key={phrase.id} className="flex items-start justify-between gap-4 px-4 py-3.5">
            <div className="min-w-0">
              <p className="text-[13px] text-ink-faint">{phrase.english}</p>
              <p className="mt-1 font-display text-[18px] leading-snug text-ink">{phrase.script}</p>
              <p className="mt-0.5 text-[13px] italic text-ink-soft">{phrase.roman}</p>
            </div>
            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                onClick={() => speak(phrase)}
                aria-label={`Hear ${phrase.english}`}
                className="flex h-8 w-8 items-center justify-center rounded-full text-ink-faint transition hover:bg-surface-2 hover:text-ink"
              >
                <Volume2 size={15} />
              </button>
              <button
                type="button"
                onClick={() => copy(phrase)}
                aria-label={`Copy ${phrase.english}`}
                className="flex h-8 w-8 items-center justify-center rounded-full text-ink-faint transition hover:bg-surface-2 hover:text-ink"
              >
                <Copy size={14} />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {copied ? (
        <p role="status" className="text-[12.5px] text-jade">
          Copied to clipboard.
        </p>
      ) : (
        <p className="text-[12px] leading-relaxed text-ink-faint">
          Pronunciation uses your browser’s speech engine where available, so quality varies by device. The romanised
          line is the one to read aloud.
        </p>
      )}
    </div>
  );
}

/* ------------------------------ Stays, parking ---------------------------- */

export function StayAreaList({ areas }: { areas: StayArea[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {areas.map((area) => (
        <Card key={area.id} className="flex flex-col p-5" interactive>
          <h3 className="font-display text-[17px] leading-tight">{area.name}</h3>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">{area.vibe}</p>
          <p className="mt-3 font-display text-[19px] tabular-nums">
            {formatINR(area.nightlyRangeINR[0])} – {formatINR(area.nightlyRangeINR[1])}
            <span className="ml-1 font-sans text-[12px] font-normal text-ink-faint">/night</span>
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {area.suitsFor.map((kind) => (
              <Badge key={kind} tone="neutral">
                {kind.replace('-', ' ')}
              </Badge>
            ))}
          </div>
          <dl className="mt-4 space-y-2 border-t border-line pt-3.5 text-[12.5px]">
            <div>
              <dt className="font-medium text-jade">Good</dt>
              <dd className="mt-0.5 leading-snug text-ink-soft">{area.pros.join(' · ')}</dd>
            </div>
            <div>
              <dt className="font-medium text-warn">Trade-off</dt>
              <dd className="mt-0.5 leading-snug text-ink-soft">{area.cons.join(' · ')}</dd>
            </div>
          </dl>
        </Card>
      ))}
    </div>
  );
}

export function ParkingList({ spots }: { spots: (ParkingSpot & { distanceKm?: number })[] }) {
  return (
    <ul className="divide-y divide-line overflow-hidden rounded-card border border-line bg-surface">
      {spots.map((spot) => (
        <li key={spot.id} className="flex items-start gap-3.5 px-4 py-4">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-ink-soft">
            <Car size={16} aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-2">
              <p className="text-[14.5px] font-medium text-ink">{spot.name}</p>
              <Badge tone="neutral">{spot.type.replace('-', ' ')}</Badge>
            </div>
            <p className="mt-0.5 text-[12.5px] text-ink-faint">
              Near {spot.near} · {spot.approxRateINR}
              {spot.distanceKm !== undefined ? ` · ${spot.distanceKm.toFixed(1)} km away` : ''}
            </p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">{spot.note}</p>
          </div>
          <a
            href={mapsProvider.externalLink(spot.coords, spot.name)}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open ${spot.name} in maps`}
            className="mt-0.5 shrink-0 rounded-full p-2 text-ink-faint transition hover:bg-surface-2 hover:text-ink"
          >
            <ExternalLink size={14} />
          </a>
        </li>
      ))}
    </ul>
  );
}
