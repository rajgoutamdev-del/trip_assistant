import { Link } from 'react-router-dom';
import { ArrowRight, Moon } from 'lucide-react';
import { useTripContext } from '@/hooks/useTripContext';
import { SafetyPanel } from '@/components/destination/panels';
import { SectionTitle } from '@/components/ui/Card';
import { NATIONAL_HELPLINES } from '@/data/emergencyNumbers';
import { tripPath } from '@/components/trip/tripNav';

export default function SafetyPage() {
  const { trip, destination } = useTripContext();
  const priority = NATIONAL_HELPLINES.filter((line) => line.priority).slice(0, 4);

  return (
    <div className="mx-auto max-w-5xl px-4 py-7 sm:px-6 sm:py-9">
      <SectionTitle
        eyebrow="Safety centre"
        title={`Staying safe in ${destination.name}`}
        description="Written for this destination: what actually goes wrong, the norms that matter, and where not to be after dark."
      />

      <div className="mb-6 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {priority.map((line) => (
          <a
            key={line.id}
            href={`tel:${line.number}`}
            className="rounded-2xl border border-danger/25 bg-danger-soft/40 px-4 py-3 transition hover:border-danger/60"
          >
            <p className="font-display text-[20px] leading-none tabular-nums text-ink">{line.number}</p>
            <p className="mt-1 text-[12px] text-ink-soft">{line.label}</p>
          </a>
        ))}
      </div>

      <SafetyPanel destination={destination} />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-card border border-indigo/30 bg-indigo/10 p-5">
        <div className="flex items-start gap-3">
          <Moon size={18} className="mt-0.5 text-indigo" />
          <div>
            <p className="text-[14.5px] font-medium text-ink">Travelling after dark tonight?</p>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
              Night mode pulls together what is open late, how to get around, and which areas to stay out of.
            </p>
          </div>
        </div>
        <Link
          to={tripPath(trip.id, 'night')}
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-indigo px-4 text-[13.5px] font-medium text-white transition hover:brightness-110"
        >
          Open night mode <ArrowRight size={14} />
        </Link>
      </div>

      <div className="mt-6">
        <Link
          to={tripPath(trip.id, 'emergency')}
          className="inline-flex items-center gap-1.5 text-[14px] font-medium text-saffron transition hover:gap-2.5"
        >
          Hospitals, police, pharmacies and ATMs <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
