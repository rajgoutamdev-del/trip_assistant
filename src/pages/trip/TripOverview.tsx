import { Link } from 'react-router-dom';
import { ArrowRight, RefreshCw } from 'lucide-react';
import type { CurrentWeather } from '@/types';
import { useTripContext } from '@/hooks/useTripContext';
import { useTripStore } from '@/store/tripStore';
import { weatherProvider } from '@/services/providers/weather';
import { summariseBudget } from '@/services/planner/budget';
import { dayCostINR, dayEndMinutes } from '@/services/planner/itinerary';
import { TRIP_MODULES, tripPath } from '@/components/trip/tripNav';
import { AssistantPanel, BriefingList } from '@/components/trip/AssistantPanel';
import { WeatherPanel } from '@/components/destination/WeatherPanel';
import { Card, CardHeader, SectionTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Stat } from '@/components/ui/Stat';
import { ProgressBar } from '@/components/ui/Progress';
import { useAsync } from '@/hooks/useAsync';
import { tripLengthDays } from '@/utils/dates';
import { formatClock, formatDate, formatINR } from '@/utils/format';

export default function TripOverview() {
  const { trip, destination } = useTripContext();
  const { regenerateItinerary, planning } = useTripStore();

  const weatherState = useAsync<CurrentWeather | undefined>(async () => {
    const envelope = await weatherProvider.getCurrentWeather(destination, trip.startDate);
    return envelope.data;
  }, [destination.id, trip.startDate]);

  const days = tripLengthDays(trip.startDate, trip.endDate);
  const budget = summariseBudget(trip.budgetPlan, trip.expenses, trip.itinerary, trip.preferences, days);
  const totalStops = trip.itinerary.reduce((sum, day) => sum + day.items.length, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-9">
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] [&>*]:min-w-0">
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Your plan at a glance"
              subtitle={`${totalStops} scheduled stops across ${trip.itinerary.length} days`}
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void regenerateItinerary(trip.id)}
                  disabled={planning}
                >
                  <RefreshCw size={14} className={planning ? 'animate-spin' : undefined} /> Regenerate
                </Button>
              }
            />
            <ul className="divide-y divide-line px-5 pb-4">
              {trip.itinerary.map((day) => (
                <li key={day.id} className="py-3.5">
                  <Link to={tripPath(trip.id, 'itinerary')} className="group flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        <p className="text-[14.5px] font-medium text-ink">
                          Day {day.dayNumber} · {day.title}
                        </p>
                        <span className="text-[12px] text-ink-faint">{formatDate(day.date, { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                      </div>
                      <p className="mt-1 line-clamp-1 text-[13px] text-ink-soft">
                        {day.items.map((item) => item.title).join(' → ')}
                      </p>
                      <p className="mt-1 text-[12px] text-ink-faint tabular-nums">
                        {day.items.length} stops ·{' '}
                        {day.items[0] ? `${formatClock(day.items[0].startMinutes)}–${formatClock(dayEndMinutes(day))}` : '—'}{' '}
                        · {formatINR(dayCostINR(day))}
                      </p>
                    </div>
                    <ArrowRight
                      size={15}
                      className="mt-1 shrink-0 text-ink-faint transition group-hover:translate-x-0.5 group-hover:text-ink"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>

          <section>
            <SectionTitle eyebrow="Worth knowing" title="Checks for this trip" />
            <BriefingList trip={trip} destination={destination} weather={weatherState.data} />
          </section>

          <section>
            <SectionTitle eyebrow="Modules" title="Everything else for this trip" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {TRIP_MODULES.filter((module) => module.slug !== 'itinerary').map(({ slug, label, icon: Icon, description }) => (
                <Link
                  key={slug}
                  to={tripPath(trip.id, slug)}
                  className="group rounded-card border border-line bg-surface p-4 transition hover:-translate-y-0.5 hover:border-line-strong hover:shadow-[var(--shadow-card)]"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-2 text-saffron transition group-hover:bg-saffron-soft">
                    <Icon size={17} aria-hidden />
                  </span>
                  <p className="mt-3 text-[14px] font-medium leading-snug text-ink">{label}</p>
                  <p className="mt-1 text-[12px] leading-snug text-ink-faint">{description}</p>
                </Link>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <Card className="p-5">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="font-display text-[17px]">Budget</h3>
              <Badge tone={budget.status === 'over' ? 'danger' : budget.status === 'watch' ? 'warn' : 'jade'}>
                {budget.status}
              </Badge>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-4">
              <Stat label="Total" value={formatINR(budget.totalINR)} />
              <Stat
                label="Remaining"
                value={formatINR(budget.remainingINR)}
                tone={budget.remainingINR < 0 ? 'danger' : 'jade'}
              />
            </dl>
            <ProgressBar
              className="mt-4"
              value={budget.spentINR}
              max={budget.totalINR}
              tone={budget.status === 'over' ? 'danger' : budget.status === 'watch' ? 'warn' : 'jade'}
              label="Budget used"
            />
            <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">{budget.headline}</p>
            <Link
              to={tripPath(trip.id, 'budget')}
              className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-saffron transition hover:gap-2.5"
            >
              Open budget <ArrowRight size={13} />
            </Link>
          </Card>

          <WeatherPanel destination={destination} startDate={trip.startDate} days={Math.min(days, 7)} compact />

          <AssistantPanel trip={trip} destination={destination} weather={weatherState.data} />
        </div>
      </div>
    </div>
  );
}
