import { Suspense, useEffect } from 'react';
import { Link, NavLink, Outlet, useParams } from 'react-router-dom';
import { CalendarDays, MapPin, Moon, Users, Wallet } from 'lucide-react';
import { TRIP_MODULES, tripPath } from '@/components/trip/tripNav';
import { EmptyState, Skeleton } from '@/components/ui/States';
import { ButtonLink } from '@/components/ui/Button';
import { useTripStore } from '@/store/tripStore';
import { getDestination } from '@/data/destinations';
import { formatDateRange, formatINRCompact } from '@/utils/format';
import { tripLengthDays } from '@/utils/dates';
import { cn } from '@/utils/cn';

export function TripLayout() {
  const { tripId } = useParams();
  const { trips, nightMode, setNightMode, setActiveTrip, activeTripId } = useTripStore();
  const trip = trips.find((t) => t.id === tripId);
  const destination = getDestination(trip?.destinationId);

  // Opening a trip by URL makes it the active one everywhere else in the app.
  useEffect(() => {
    if (trip && activeTripId !== trip.id) setActiveTrip(trip.id);
  }, [trip, activeTripId, setActiveTrip]);

  if (!trip || !destination) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <EmptyState
          as="h1"
          icon={<MapPin size={22} />}
          title="That trip isn’t here"
          description="It may have been deleted, or this link came from a different device — trips are stored locally in this prototype."
          action={<ButtonLink to="/onboarding">Plan a new trip</ButtonLink>}
        />
      </div>
    );
  }

  const days = tripLengthDays(trip.startDate, trip.endDate);

  return (
    <div>
      <div className="border-b border-line bg-surface/50">
        <div className="mx-auto max-w-6xl px-4 pt-5 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <Link
                to={`/destination/${destination.id}`}
                className="text-[12px] font-medium uppercase tracking-[0.12em] text-saffron transition hover:opacity-80"
              >
                {destination.state}
              </Link>
              <h1 className="mt-1 font-display text-[26px] leading-tight sm:text-3xl">
                {days} {days === 1 ? 'day' : 'days'} in {destination.name}
              </h1>
              <dl className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-ink-soft">
                <div className="inline-flex items-center gap-1.5">
                  <CalendarDays size={14} aria-hidden />
                  <dt className="sr-only">Dates</dt>
                  <dd>{formatDateRange(trip.startDate, trip.endDate)}</dd>
                </div>
                <div className="inline-flex items-center gap-1.5">
                  <Users size={14} aria-hidden />
                  <dt className="sr-only">Travellers</dt>
                  <dd>
                    {trip.preferences.travellers} {trip.preferences.travellers === 1 ? 'traveller' : 'travellers'} ·{' '}
                    {trip.preferences.travelType}
                  </dd>
                </div>
                <div className="inline-flex items-center gap-1.5">
                  <Wallet size={14} aria-hidden />
                  <dt className="sr-only">Budget</dt>
                  <dd>{formatINRCompact(trip.budgetPlan.totalINR)} budget</dd>
                </div>
              </dl>
            </div>

            <button
              type="button"
              onClick={() => setNightMode(!nightMode)}
              aria-pressed={nightMode}
              className={cn(
                'inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-[13px] font-medium transition',
                nightMode
                  ? 'border-indigo bg-indigo/15 text-indigo'
                  : 'border-line text-ink-soft hover:border-line-strong hover:text-ink',
              )}
            >
              <Moon size={15} /> Night mode {nightMode ? 'on' : 'off'}
            </button>
          </div>

          <nav aria-label="Trip sections" className="-mx-4 mt-4 overflow-x-auto px-4 scrollbar-none sm:mx-0 sm:px-0">
            <div className="flex w-max gap-1 pb-px">
              {[{ slug: '', label: 'Overview' }, ...TRIP_MODULES].map(({ slug, label }) => (
                <NavLink
                  key={slug || 'overview'}
                  to={tripPath(trip.id, slug || undefined)}
                  end={!slug}
                  className={({ isActive }) =>
                    cn(
                      'relative whitespace-nowrap rounded-t-lg px-3.5 py-2.5 text-[13.5px] font-medium transition',
                      isActive
                        ? 'text-ink after:absolute after:inset-x-2 after:-bottom-px after:h-[2.5px] after:rounded-full after:bg-saffron'
                        : 'text-ink-faint hover:text-ink',
                    )
                  }
                >
                  {label}
                </NavLink>
              ))}
            </div>
          </nav>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="mx-auto max-w-6xl space-y-4 px-4 py-8 sm:px-6">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-64 rounded-card" />
          </div>
        }
      >
        <Outlet context={{ trip, destination }} />
      </Suspense>
    </div>
  );
}
