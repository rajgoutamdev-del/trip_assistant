import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowRight, Bus, Compass, ExternalLink, Languages, MapPin, Plane, Play, Sparkles,
} from 'lucide-react';
import { getDestination } from '@/data/destinations';
import { contentProvider } from '@/services/providers/content';
import { ClimateStrip, WeatherPanel } from '@/components/destination/WeatherPanel';
import {
  DishCard, ParkingList, PhotoSpotList, PhraseBook, PlaceList, SafetyPanel, StayAreaList,
} from '@/components/destination/panels';
import { NearbyHelp } from '@/components/destination/NearbyHelp';
import { SchematicMap } from '@/components/map/SchematicMap';
import { Figure } from '@/components/ui/Figure';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, SectionTitle } from '@/components/ui/Card';
import { ButtonLink } from '@/components/ui/Button';
import { ComingSoon, DataSourceNote, EmptyState, Skeleton } from '@/components/ui/States';
import { useAsync } from '@/hooks/useAsync';
import { INTEREST_LABELS } from '@/data/preferences';
import { MONTH_SHORT } from '@/data/months';
import { formatINR } from '@/utils/format';
import { cn } from '@/utils/cn';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'places', label: 'Places' },
  { id: 'food', label: 'Food' },
  { id: 'safety', label: 'Safety' },
  { id: 'photos', label: 'Photos' },
  { id: 'practical', label: 'Practical' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function DestinationPage() {
  const { destinationId } = useParams();
  const destination = getDestination(destinationId);
  const [tab, setTab] = useState<TabId>('overview');

  const content = useAsync(
    () => (destination ? contentProvider.getDestinationContent(destination) : Promise.reject(new Error('No destination'))),
    [destination?.id],
  );

  if (!destination) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <EmptyState
          icon={<Compass size={22} />}
          title="Destination not found"
          description="This build ships eight Indian destinations in full depth."
          action={<ButtonLink to="/explore">Browse destinations</ButtonLink>}
        />
      </div>
    );
  }

  return (
    <div>
      {/* ------------------------------- Hero ------------------------------- */}
      <div className="relative">
        <Figure
          src={destination.heroImage}
          srcSmall={destination.thumbnail}
          alt={`${destination.name}, ${destination.state}`}
          priority
          sizes="100vw"
          className="h-[44vh] min-h-[300px] w-full sm:h-[52vh]"
        />
        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto max-w-6xl px-4 pb-6 sm:px-6 sm:pb-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">{destination.state}</p>
            <h1 className="mt-1.5 font-display text-[36px] leading-[1.05] text-white sm:text-[46px]">
              {destination.name}
            </h1>
            <p className="mt-2.5 max-w-2xl text-balance text-[15px] leading-relaxed text-white/80">
              {destination.tagline}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/15 px-3 py-1.5 text-[12.5px] font-medium text-white backdrop-blur">
                {destination.idealDays[0]}–{destination.idealDays[1]} days
              </span>
              <span className="rounded-full bg-white/15 px-3 py-1.5 text-[12.5px] font-medium text-white backdrop-blur">
                {formatINR(destination.dailyBudgetINR.comfort)}/person/day
              </span>
              <span className="rounded-full bg-white/15 px-3 py-1.5 text-[12.5px] font-medium capitalize text-white backdrop-blur">
                {destination.crowdLevel}
              </span>
              <span className="rounded-full bg-white/15 px-3 py-1.5 text-[12.5px] font-medium text-white backdrop-blur">
                Best: {destination.bestMonths.map((m) => MONTH_SHORT[m - 1]).slice(0, 4).join(', ')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------- Tabs ------------------------------- */}
      <div className="sticky top-[57px] z-20 border-b border-line bg-paper/95 backdrop-blur lg:top-0">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <nav aria-label="Destination sections" className="-mx-1 flex overflow-x-auto scrollbar-none">
            {TABS.map((candidate) => (
              <button
                key={candidate.id}
                type="button"
                onClick={() => setTab(candidate.id)}
                aria-current={tab === candidate.id}
                className={cn(
                  'relative whitespace-nowrap px-3.5 py-3.5 text-[13.5px] font-medium transition',
                  tab === candidate.id
                    ? 'text-ink after:absolute after:inset-x-2 after:bottom-0 after:h-[2.5px] after:rounded-full after:bg-saffron'
                    : 'text-ink-faint hover:text-ink',
                )}
              >
                {candidate.label}
              </button>
            ))}
          </nav>
          <ButtonLink to="/onboarding" size="sm" className="hidden shrink-0 sm:inline-flex">
            Plan a trip here <ArrowRight size={14} />
          </ButtonLink>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-9">
        {tab === 'overview' ? (
          <div className="space-y-8">
            <div className="grid gap-7 lg:grid-cols-[1.4fr_1fr] [&>*]:min-w-0">
              <div>
                <h2 className="font-display text-2xl leading-tight">Why go</h2>
                <p className="mt-3 text-[15.5px] leading-relaxed text-ink-soft">{destination.summary}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {destination.interests.map((interest) => (
                    <Badge key={interest} tone="saffron">
                      {INTEREST_LABELS[interest]}
                    </Badge>
                  ))}
                </div>

                <dl className="mt-6 space-y-4">
                  <div className="flex gap-3.5">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-ink-soft">
                      <Plane size={16} aria-hidden />
                    </span>
                    <div>
                      <dt className="text-[14px] font-medium text-ink">Getting there</dt>
                      <dd className="mt-1 text-[13.5px] leading-relaxed text-ink-soft">{destination.gettingThere}</dd>
                    </div>
                  </div>
                  <div className="flex gap-3.5">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-ink-soft">
                      <Bus size={16} aria-hidden />
                    </span>
                    <div>
                      <dt className="text-[14px] font-medium text-ink">Getting around</dt>
                      <dd className="mt-1 text-[13.5px] leading-relaxed text-ink-soft">{destination.localTransport}</dd>
                    </div>
                  </div>
                  <div className="flex gap-3.5">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-ink-soft">
                      <Languages size={16} aria-hidden />
                    </span>
                    <div>
                      <dt className="text-[14px] font-medium text-ink">Languages</dt>
                      <dd className="mt-1 text-[13.5px] leading-relaxed text-ink-soft">
                        {destination.languages.join(', ')}
                      </dd>
                    </div>
                  </div>
                </dl>
              </div>

              <WeatherPanel destination={destination} />
            </div>

            <div>
              <SectionTitle
                eyebrow="Climate"
                title="Month by month"
                description="Average highs and lows with a verdict on each month — the single most useful thing to know before booking."
              />
              <ClimateStrip destination={destination} highlightMonth={new Date().getMonth() + 1} />
            </div>

            <div>
              <SectionTitle eyebrow="Orientation" title="Where things are" />
              <SchematicMap
                height={360}
                points={destination.places.map((place, index) => ({
                  id: place.id,
                  label: place.name,
                  coords: place.coords,
                  sublabel: place.area,
                  order: index + 1,
                  tone: 'saffron',
                }))}
              />
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <Card>
                <CardHeader title="Watch before you go" subtitle="Opens a YouTube search per topic" icon={<Play size={16} />} />
                {content.loading ? (
                  <div className="space-y-2 px-5 py-4">
                    <Skeleton className="h-9 w-full" />
                    <Skeleton className="h-9 w-full" />
                    <Skeleton className="h-9 w-2/3" />
                  </div>
                ) : content.data ? (
                  <>
                    <ul className="divide-y divide-line px-5">
                      {content.data.data.map((video) => (
                        <li key={video.id}>
                          <a
                            href={video.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-between gap-3 py-3 text-[14px] text-ink-soft transition hover:text-ink"
                          >
                            <span className="min-w-0">
                              <span className="block truncate font-medium text-ink">{video.topic}</span>
                              <span className="block truncate text-[12.5px] text-ink-faint">{video.title}</span>
                            </span>
                            <ExternalLink size={14} className="shrink-0" />
                          </a>
                        </li>
                      ))}
                    </ul>
                    <div className="px-5 pb-5 pt-3">
                      <DataSourceNote envelope={content.data} />
                    </div>
                  </>
                ) : null}
              </Card>

              <Card>
                <CardHeader
                  title="Documents & entry"
                  subtitle="What you need before you travel"
                  icon={<Sparkles size={16} />}
                />
                <ul className="space-y-2.5 px-5 py-4">
                  {destination.visaNotes.map((note, index) => (
                    <li key={index} className="flex gap-2.5 text-[13.5px] leading-relaxed text-ink-soft">
                      <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-saffron" />
                      {note}
                    </li>
                  ))}
                </ul>
                <div className="px-5 pb-5">
                  <ComingSoon
                    title="Per-nationality visa guidance"
                    description="Full visa, permit and ID requirements by passport and state are architected behind a documents provider — the entry points are here, the data source is not connected yet."
                  />
                </div>
              </Card>
            </div>
          </div>
        ) : null}

        {tab === 'places' ? (
          <div className="space-y-5">
            <SectionTitle
              eyebrow="Places"
              title={`${destination.places.length} places worth your time`}
              description="With typical visit length, entry fees for Indian and foreign nationals, and the hours each one is quietest."
            />
            <PlaceList places={destination.places} />
          </div>
        ) : null}

        {tab === 'food' ? (
          <div className="space-y-5">
            <SectionTitle
              eyebrow="Food & culture"
              title={`What ${destination.name} actually eats`}
              description="Dishes rather than restaurants: what it is, where to try it, what it costs, and why it exists here."
            />
            <div className="grid gap-4 lg:grid-cols-2">
              {destination.dishes.map((dish) => (
                <DishCard key={dish.id} dish={dish} />
              ))}
            </div>
          </div>
        ) : null}

        {tab === 'safety' ? (
          <div className="space-y-5">
            <SectionTitle
              eyebrow="Safety & awareness"
              title={`Travelling safely in ${destination.name}`}
              description="Specific, local and actionable — not generic advice about keeping your valuables close."
            />
            <SafetyPanel destination={destination} />
            <div className="pt-2">
              <SectionTitle eyebrow="Nearby help" title="Hospitals, police, pharmacies and ATMs" />
              <NearbyHelp destination={destination} />
            </div>
          </div>
        ) : null}

        {tab === 'photos' ? (
          <div className="space-y-5">
            <SectionTitle
              eyebrow="Photography"
              title="Where and when to shoot"
              description="Including the hour the light works, how crowded it gets, and where permits apply."
            />
            <PhotoSpotList spots={destination.photoSpots} />
          </div>
        ) : null}

        {tab === 'practical' ? (
          <div className="space-y-9">
            <div>
              <SectionTitle
                eyebrow="Stays"
                title="Pick the neighbourhood first"
                description="Where you sleep decides how your days work. These are the trade-offs, with typical nightly bands."
              />
              <StayAreaList areas={destination.stayAreas} />
              <ComingSoon
                title="Live rates and booking"
                description="A StayProvider interface already drives this screen. Connecting a booking partner swaps neighbourhood guidance for live availability without touching the UI."
              />
            </div>

            <div>
              <SectionTitle
                eyebrow="Parking"
                title="Where to actually leave a vehicle"
                description="Published rates and the local enforcement reality. Live occupancy needs a parking data provider."
              />
              <ParkingList spots={destination.parking} />
            </div>

            <div>
              <SectionTitle
                eyebrow="Language"
                title="Phrases you will use in the first hour"
                description={`Spoken here: ${destination.languages.join(', ')}.`}
              />
              <PhraseBook packs={destination.languagePacks} />
            </div>

            <div>
              <SectionTitle eyebrow="After dark" title={`${destination.name} at night`} />
              <ul className="divide-y divide-line overflow-hidden rounded-card border border-line bg-surface">
                {destination.nightLife.map((entry) => (
                  <li key={entry.id} className="flex items-start justify-between gap-4 px-4 py-3.5">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        <p className="text-[14.5px] font-medium text-ink">{entry.name}</p>
                        <Badge tone="indigo">{entry.kind}</Badge>
                      </div>
                      <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">{entry.detail}</p>
                    </div>
                    <span className="shrink-0 text-[12.5px] font-medium tabular-nums text-ink-faint">
                      till {entry.openTill}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-card border border-line bg-surface-2/50 p-5">
          <div>
            <h2 className="font-display text-lg">Turn {destination.name} into a plan</h2>
            <p className="mt-1.5 max-w-xl text-[13.5px] leading-relaxed text-ink-soft">
              Pick your dates and preferences and the planner schedules these places around the light, the crowds and
              your budget.
            </p>
          </div>
          <div className="flex gap-2">
            <ButtonLink to="/onboarding">
              Plan my trip <ArrowRight size={15} />
            </ButtonLink>
            <Link
              to="/explore"
              className="inline-flex h-11 items-center gap-1.5 rounded-full border border-line px-4 text-[14px] font-medium text-ink-soft transition hover:border-line-strong hover:text-ink"
            >
              <MapPin size={14} /> Other destinations
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
