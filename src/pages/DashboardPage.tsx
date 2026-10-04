import { Link } from 'react-router-dom';
import { ArrowRight, Compass, MapPin, Plus, Trash2 } from 'lucide-react';
import type { CurrentWeather } from '@/types';
import { useTripStore } from '@/store/tripStore';
import { getDestination, DESTINATIONS } from '@/data/destinations';
import { weatherProvider } from '@/services/providers/weather';
import { summariseBudget } from '@/services/planner/budget';
import { TRIP_MODULES, tripPath } from '@/components/trip/tripNav';
import { DayTimeline } from '@/components/trip/DayTimeline';
import { AssistantPanel, BriefingList } from '@/components/trip/AssistantPanel';
import { Figure } from '@/components/ui/Figure';
import { Card, CardHeader, SectionTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/Progress';
import { Stat } from '@/components/ui/Stat';
import { DataSourceNote, EmptyState, Skeleton } from '@/components/ui/States';
import { useAsync } from '@/hooks/useAsync';
import { daysUntil, greetingForNow, todayISO, tripLengthDays } from '@/utils/dates';
import { formatDateRange, formatINR, formatINRCompact, formatRelativeDays } from '@/utils/format';

export default function DashboardPage() {
  const { traveller, trips, activeTrip, deleteTrip, setActiveTrip } = useTripStore();
  const destination = getDestination(activeTrip?.destinationId);

  const weatherState = useAsync<{ weather: CurrentWeather; demo: boolean } | undefined>(async () => {
    if (!destination) return undefined;
    const envelope = await weatherProvider.getCurrentWeather(destination);
    return { weather: envelope.data, demo: envelope.source === 'demo' };
  }, [destination?.id]);

  if (!activeTrip || !destination) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <h1 className="font-display text-[30px] leading-tight sm:text-[36px]">
          {greetingForNow()}
          {traveller.isDemo ? '' : `, ${traveller.name}`} 👋
        </h1>
        <p className="mt-2.5 max-w-xl text-[15px] leading-relaxed text-ink-soft">
          You don’t have a trip yet. Onboarding takes about a minute and produces a timed itinerary, a budget split, a
          packing list and a safety brief.
        </p>
        <ButtonLink to="/onboarding" size="lg" className="mt-6">
          Plan my trip <ArrowRight size={16} />
        </ButtonLink>

        <div className="mt-12">
          <SectionTitle eyebrow="Or start from a place" title="Where people go" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {DESTINATIONS.slice(0, 4).map((candidate) => (
              <Link key={candidate.id} to={`/destination/${candidate.id}`} className="group">
                <Figure
                  src={candidate.thumbnail}
                  alt={candidate.name}
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="aspect-[4/3] rounded-2xl"
                >
                  <p className="absolute bottom-3 left-3 font-display text-[17px] text-white">{candidate.name}</p>
                </Figure>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const days = tripLengthDays(activeTrip.startDate, activeTrip.endDate);
  const until = daysUntil(activeTrip.startDate);
  const budget = summariseBudget(activeTrip.budgetPlan, activeTrip.expenses, activeTrip.itinerary, activeTrip.preferences, days);
  const today = todayISO();
  const todayIndex = activeTrip.itinerary.findIndex((day) => day.date === today);
  const focusDay = todayIndex >= 0 ? activeTrip.itinerary[todayIndex] : activeTrip.itinerary[0];
  const packedCount = activeTrip.packing.filter((item) => item.checked).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-9">
      <header>
        <h1 className="font-display text-[28px] leading-tight sm:text-[34px]">
          {greetingForNow()}
          {traveller.isDemo ? '' : `, ${traveller.name}`} 👋
        </h1>
        <p className="mt-2 text-[15px] text-ink-soft">
          {until > 0
            ? `Your ${destination.name} trip is ${until} ${until === 1 ? 'day' : 'days'} away.`
            : until === 0
              ? `Your ${destination.name} trip starts today.`
              : daysUntil(activeTrip.endDate) >= 0
                ? `You’re in ${destination.name} — day ${Math.abs(until) + 1} of ${days}.`
                : `Your ${destination.name} trip finished ${formatRelativeDays(daysUntil(activeTrip.endDate))}.`}
        </p>
      </header>

      {/* ---------------------------- Trip card ---------------------------- */}
      <div className="mt-6 overflow-hidden rounded-card border border-line">
        <div className="relative">
          <Figure
            src={destination.heroImage}
            srcSmall={destination.thumbnail}
            alt={destination.name}
            priority
            sizes="(max-width: 1024px) 100vw, 1100px"
            className="h-[220px] w-full sm:h-[260px]"
          />
          <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-4 p-5 sm:p-6">
            <div className="min-w-0">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white/70">
                {destination.state}
              </p>
              <h2 className="mt-1 font-display text-[28px] leading-tight text-white sm:text-[32px]">
                {destination.name}
              </h2>
              <p className="mt-1.5 text-[13.5px] text-white/80">
                {days} {days === 1 ? 'day' : 'days'} · {formatINRCompact(activeTrip.budgetPlan.totalINR)} ·{' '}
                {activeTrip.preferences.travellers}{' '}
                {activeTrip.preferences.travellers === 1 ? 'traveller' : 'travellers'}
              </p>
              <p className="mt-0.5 text-[12.5px] text-white/60">
                {formatDateRange(activeTrip.startDate, activeTrip.endDate)}
              </p>
            </div>

            <div className="flex items-end gap-3">
              {weatherState.loading ? (
                <Skeleton className="h-14 w-24 bg-white/20" />
              ) : weatherState.data ? (
                <div className="rounded-2xl bg-black/35 px-3.5 py-2.5 text-right backdrop-blur">
                  <p className="font-display text-[22px] leading-none text-white tabular-nums">
                    {weatherState.data.weather.tempC}°C
                  </p>
                  <p className="mt-1 text-[11.5px] leading-none text-white/75">{weatherState.data.weather.label}</p>
                </div>
              ) : null}
              <ButtonLink to={tripPath(activeTrip.id, 'itinerary')} variant="secondary">
                Continue planning <ArrowRight size={15} />
              </ButtonLink>
            </div>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-5 border-t border-line bg-surface p-5 sm:grid-cols-4">
          <Stat
            label="Budget used"
            value={`${Math.round((budget.spentINR / Math.max(1, budget.totalINR)) * 100)}%`}
            sub={`${formatINR(budget.spentINR)} of ${formatINR(budget.totalINR)}`}
            tone={budget.status === 'over' ? 'danger' : budget.status === 'watch' ? 'warn' : 'default'}
          />
          <Stat label="Days planned" value={`${activeTrip.itinerary.length}/${days}`} sub="Editable at any time" />
          <Stat
            label="Packed"
            value={`${packedCount}/${activeTrip.packing.length}`}
            sub={`${activeTrip.packing.filter((i) => i.essential && !i.checked).length} essentials left`}
          />
          <Stat label="Pace" value={activeTrip.preferences.pace} sub={`${activeTrip.preferences.travelType} trip`} />
        </dl>
      </div>

      {weatherState.data?.demo ? (
        <DataSourceNote
          className="mt-3"
          envelope={{
            source: 'demo',
            provider: 'Climate averages',
            note: 'Temperature modelled from this destination’s published monthly averages. Add a weather key for live conditions.',
          }}
        />
      ) : null}

      {/* ---------------------------- Briefing ----------------------------- */}
      <section className="mt-8">
        <SectionTitle eyebrow="Worth knowing" title="Before you go" />
        <BriefingList trip={activeTrip} destination={destination} weather={weatherState.data?.weather} />
      </section>

      {/* ------------------------- Plan + assistant ------------------------ */}
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_1fr] [&>*]:min-w-0">
        <Card>
          <CardHeader
            title={todayIndex >= 0 ? 'Today’s plan' : `Day ${focusDay?.dayNumber ?? 1}: ${focusDay?.title ?? ''}`}
            subtitle={focusDay?.summary}
            action={
              <Link
                to={tripPath(activeTrip.id, 'itinerary')}
                className="text-[13px] font-medium text-saffron underline-offset-4 hover:underline"
              >
                Full itinerary
              </Link>
            }
          />
          <div className="px-4 pb-5 pt-4 sm:px-5">
            {focusDay ? (
              <DayTimeline day={focusDay} compact travellers={activeTrip.preferences.travellers} />
            ) : (
              <EmptyState
                title="No days planned"
                description="Regenerate the plan from the itinerary screen."
                action={<ButtonLink to={tripPath(activeTrip.id, 'itinerary')}>Open itinerary</ButtonLink>}
              />
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <AssistantPanel trip={activeTrip} destination={destination} weather={weatherState.data?.weather} />

          <Card className="p-5">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="font-display text-[17px]">Budget</h3>
              <Badge tone={budget.status === 'over' ? 'danger' : budget.status === 'watch' ? 'warn' : 'jade'}>
                {budget.status === 'over' ? 'Over' : budget.status === 'watch' ? 'Watch' : 'Healthy'}
              </Badge>
            </div>
            <p className="mt-3 font-display text-[26px] leading-none tabular-nums">
              {formatINR(budget.remainingINR)}
              <span className="ml-1.5 font-sans text-[12.5px] font-normal text-ink-faint">left</span>
            </p>
            <ProgressBar
              className="mt-3"
              value={budget.spentINR}
              max={budget.totalINR}
              tone={budget.status === 'over' ? 'danger' : budget.status === 'watch' ? 'warn' : 'jade'}
              label="Budget used"
            />
            <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">{budget.headline}</p>
            <Link
              to={tripPath(activeTrip.id, 'budget')}
              className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-saffron transition hover:gap-2.5"
            >
              Log an expense <ArrowRight size={13} />
            </Link>
          </Card>
        </div>
      </div>

      {/* ---------------------------- Modules ------------------------------ */}
      <section className="mt-9">
        <SectionTitle eyebrow="Quick access" title="Everything for this trip" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {TRIP_MODULES.map(({ slug, label, icon: Icon, description }) => (
            <Link
              key={slug}
              to={tripPath(activeTrip.id, slug)}
              className="group rounded-card border border-line bg-surface p-4 transition duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-[var(--shadow-card)]"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-2 text-saffron transition group-hover:bg-saffron-soft">
                <Icon size={17} aria-hidden />
              </span>
              <p className="mt-3 text-[14.5px] font-medium leading-snug text-ink">{label}</p>
              <p className="mt-1 text-[12px] leading-snug text-ink-faint">{description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ----------------------------- Trips ------------------------------- */}
      <section className="mt-9">
        <SectionTitle
          eyebrow="Your trips"
          title={`${trips.length} ${trips.length === 1 ? 'trip' : 'trips'} saved`}
          description="Stored in this browser only — no account, no server."
          action={
            <ButtonLink to="/onboarding" variant="outline" size="sm">
              <Plus size={14} /> New trip
            </ButtonLink>
          }
        />
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map((candidate) => {
            const candidateDestination = getDestination(candidate.destinationId);
            if (!candidateDestination) return null;
            const isActive = candidate.id === activeTrip.id;
            return (
              <li key={candidate.id} className="flex items-stretch overflow-hidden rounded-card border border-line bg-surface">
                <Link to={tripPath(candidate.id)} className="flex min-w-0 flex-1 items-center gap-3 p-3" onClick={() => setActiveTrip(candidate.id)}>
                  <Figure
                    src={candidateDestination.thumbnail}
                    alt=""
                    overlay={false}
                    sizes="64px"
                    className="h-14 w-14 shrink-0 rounded-xl"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-[14.5px] font-medium text-ink">{candidateDestination.name}</p>
                    <p className="mt-0.5 truncate text-[12px] text-ink-faint">
                      {formatDateRange(candidate.startDate, candidate.endDate)}
                    </p>
                    {isActive ? <Badge tone="saffron" className="mt-1.5">Active</Badge> : null}
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  aria-label={`Delete trip to ${candidateDestination.name}`}
                  onClick={() => deleteTrip(candidate.id)}
                  className="h-auto rounded-none px-3 text-ink-faint hover:bg-danger-soft hover:text-danger"
                >
                  <Trash2 size={15} />
                </Button>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="mt-9 flex flex-wrap items-center gap-3 rounded-card border border-line bg-surface-2/50 p-5">
        <Compass size={18} className="text-saffron" />
        <p className="flex-1 text-[14px] text-ink-soft">
          Thinking about somewhere else? Compare destinations by month, budget and interest.
        </p>
        <ButtonLink to="/explore" variant="outline" size="sm">
          <MapPin size={14} /> Explore India
        </ButtonLink>
      </div>
    </div>
  );
}
