import { useTripContext } from '@/hooks/useTripContext';
import { stayProvider } from '@/services/providers/stays';
import { placesProvider } from '@/services/providers/places';
import { ParkingList, StayAreaList } from '@/components/destination/panels';
import { SchematicMap } from '@/components/map/SchematicMap';
import { Card, CardHeader, SectionTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ComingSoon, DataSourceNote, ErrorState, Skeleton } from '@/components/ui/States';
import { useAsync } from '@/hooks/useAsync';
import { formatINR } from '@/utils/format';
import { tripLengthDays } from '@/utils/dates';

export default function StaysPage() {
  const { trip, destination } = useTripContext();
  const nights = Math.max(1, tripLengthDays(trip.startDate, trip.endDate) - 1);
  const nightlyAllowance = Math.round(trip.budgetPlan.allocations.accommodation / nights);

  const stays = useAsync(
    () =>
      stayProvider.search({
        destination,
        preference: trip.preferences.stay,
        maxNightlyINR: nightlyAllowance,
        travellers: trip.preferences.travellers,
      }),
    [destination.id, trip.preferences.stay, nightlyAllowance, trip.preferences.travellers],
  );

  const parking = useAsync(() => placesProvider.findParking(destination), [destination.id]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-9">
      <SectionTitle
        eyebrow="Stays"
        title="Where to base yourself"
        description={`Your budget allows about ${formatINR(nightlyAllowance)} a night across ${nights} ${nights === 1 ? 'night' : 'nights'}. Neighbourhood matters more than the room.`}
      />

      <StayAreaList areas={destination.stayAreas} />

      <Card className="mt-6">
        <CardHeader
          title={`Typical ${trip.preferences.stay.replace('-', ' ')} options`}
          subtitle="Illustrative price bands per neighbourhood — not live rates, and not bookable here"
        />
        {stays.loading ? (
          <div className="space-y-2 px-5 py-4">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : stays.error ? (
          <div className="px-5 py-4">
            <ErrorState message={stays.error.message} onRetry={stays.reload} />
          </div>
        ) : stays.data ? (
          <>
            <ul className="divide-y divide-line px-5">
              {stays.data.data.map((option) => (
                <li key={option.id} className="flex items-center justify-between gap-4 py-3.5">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <p className="text-[14.5px] font-medium text-ink">{option.name}</p>
                      <Badge tone="neutral">{option.area}</Badge>
                    </div>
                    <p className="mt-1 text-[12.5px] leading-snug text-ink-faint">{option.highlights.join(' · ')}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-display text-[16px] tabular-nums">{formatINR(option.nightlyFromINR)}</p>
                    <p className="text-[11.5px] text-ink-faint">per night band</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="px-5 pb-5 pt-3">
              <DataSourceNote envelope={stays.data} />
            </div>
          </>
        ) : null}
      </Card>

      <div className="mt-5">
        <ComingSoon
          title="Live availability and booking"
          description="Swapping DemoStayProvider for a booking partner behind the same StayProvider interface turns these bands into live rates and an actual reservation flow. Until then nothing here claims to be bookable."
        />
      </div>

      <div className="mt-9 grid gap-6 lg:grid-cols-[1.3fr_1fr] [&>*]:min-w-0">
        <div>
          <SectionTitle
            eyebrow="Parking"
            title="If you are driving"
            description="Published rates and the local enforcement reality — live occupancy needs a parking data provider."
          />
          {parking.loading ? (
            <Skeleton className="h-40 rounded-card" />
          ) : parking.data ? (
            <>
              <ParkingList spots={parking.data.data} />
              <DataSourceNote className="mt-3" envelope={parking.data} />
            </>
          ) : null}
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="mb-2.5 text-[12px] font-semibold uppercase tracking-[0.1em] text-ink-faint">
            Parking locations
          </h2>
          <SchematicMap
            height={300}
            points={destination.parking.map((spot) => ({
              id: spot.id,
              label: spot.name,
              coords: spot.coords,
              sublabel: `${spot.type.replace('-', ' ')} · ${spot.approxRateINR}`,
              tone: 'jade',
            }))}
          />
        </div>
      </div>
    </div>
  );
}
