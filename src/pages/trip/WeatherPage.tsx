import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useTripContext } from '@/hooks/useTripContext';
import { ClimateStrip, WeatherPanel } from '@/components/destination/WeatherPanel';
import { Card, CardHeader, SectionTitle } from '@/components/ui/Card';
import { tripPath } from '@/components/trip/tripNav';
import { monthOf, tripLengthDays } from '@/utils/dates';

export default function WeatherPage() {
  const { trip, destination } = useTripContext();
  const days = tripLengthDays(trip.startDate, trip.endDate);
  const month = monthOf(trip.startDate);
  const note = destination.monthNotes[month - 1];

  const kinds = [
    'outdoor' as const,
    ...(trip.preferences.activities.includes('trekking') ? (['trek'] as const) : []),
    ...(trip.preferences.interests.includes('beaches') ? (['beach'] as const) : []),
    ...(trip.preferences.interests.includes('photography') ? (['photography'] as const) : []),
    'indoor' as const,
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-7 sm:px-6 sm:py-9">
      <SectionTitle
        eyebrow="Weather"
        title={`${destination.name} in ${note.label}`}
        description={note.note}
      />

      <div className="space-y-6">
        <WeatherPanel destination={destination} startDate={trip.startDate} days={Math.min(days, 7)} activityKinds={kinds} />

        <Card>
          <CardHeader title="The whole year" subtitle="So you know whether you picked a good month" />
          <div className="px-5 pb-5 pt-3">
            <ClimateStrip destination={destination} highlightMonth={month} />
            <p className="mt-4 text-[13.5px] leading-relaxed text-ink-soft">{destination.climateSummary}</p>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-display text-[17px]">What this means for your bag</h3>
          <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">
            Your packing list was generated from these conditions — {note.avgLowC}–{note.avgHighC}°C, a{' '}
            {note.rating} month, and the activities you chose.
          </p>
          <Link
            to={tripPath(trip.id, 'packing')}
            className="mt-3 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-saffron transition hover:gap-2.5"
          >
            Open packing list <ArrowRight size={14} />
          </Link>
        </Card>
      </div>
    </div>
  );
}
