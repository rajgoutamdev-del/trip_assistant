import { Link } from 'react-router-dom';
import { CalendarCheck, ChevronRight, Thermometer, Users } from 'lucide-react';
import type { CrowdLevel, CurrentWeather, Destination } from '@/types';
import { Figure } from '@/components/ui/Figure';
import { Badge } from '@/components/ui/Badge';
import { DataSourceNote } from '@/components/ui/States';
import { MONTH_SHORT } from '@/data/months';
import { formatINR } from '@/utils/format';
import { cn } from '@/utils/cn';

const CROWD_TONE: Record<CrowdLevel, 'jade' | 'saffron' | 'warn' | 'danger'> = {
  quiet: 'jade',
  moderate: 'jade',
  busy: 'warn',
  packed: 'danger',
};

const SAFETY_TONE = {
  'generally-safe': { tone: 'jade' as const, label: 'Generally safe' },
  'stay-alert': { tone: 'warn' as const, label: 'Stay alert' },
  'extra-care': { tone: 'danger' as const, label: 'Extra care' },
};

export function DestinationCard({
  destination,
  weather,
  weatherIsDemo,
  className,
}: {
  destination: Destination;
  weather?: CurrentWeather;
  weatherIsDemo?: boolean;
  className?: string;
}) {
  const safety = SAFETY_TONE[destination.safety.overall];
  const topExperiences = destination.places.slice(0, 3).map((place) => place.name);
  const mustEat = destination.dishes.filter((dish) => dish.mustTry).slice(0, 3);

  return (
    <article
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-card border border-line bg-surface transition duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]',
        className,
      )}
    >
      <Link to={`/destination/${destination.id}`} className="block">
        <Figure
          src={destination.heroImage}
          srcSmall={destination.thumbnail}
          alt={`${destination.name}, ${destination.state}`}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="aspect-[16/10]"
          imgClassName="group-hover:scale-[1.04]"
        >
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white/70">
                {destination.state}
              </p>
              <h3 className="mt-0.5 font-display text-[22px] leading-tight text-white">{destination.name}</h3>
            </div>
            {weather ? (
              <div className="shrink-0 rounded-xl bg-black/35 px-2.5 py-1.5 text-right backdrop-blur-sm">
                <p className="font-display text-[17px] leading-none text-white tabular-nums">{weather.tempC}°C</p>
                <p className="mt-0.5 text-[10.5px] leading-none text-white/75">{weather.label}</p>
              </div>
            ) : null}
          </div>
        </Figure>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <p className="line-clamp-2 text-[13.5px] leading-relaxed text-ink-soft">{destination.tagline}</p>

        <dl className="mt-3.5 grid grid-cols-2 gap-x-4 gap-y-2.5 text-[12.5px]">
          <div>
            <dt className="flex items-center gap-1.5 text-ink-faint">
              <CalendarCheck size={12} aria-hidden /> Best time
            </dt>
            <dd className="mt-0.5 font-medium text-ink">
              {destination.bestMonths.map((m) => MONTH_SHORT[m - 1]).slice(0, 4).join(' · ')}
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-1.5 text-ink-faint">
              <Thermometer size={12} aria-hidden /> Daily budget
            </dt>
            <dd className="mt-0.5 font-medium text-ink">
              {formatINR(destination.dailyBudgetINR.comfort)} <span className="font-normal text-ink-faint">/person</span>
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-1.5 text-ink-faint">
              <Users size={12} aria-hidden /> Crowd level
            </dt>
            <dd className="mt-1">
              <Badge tone={CROWD_TONE[destination.crowdLevel]}>{destination.crowdLevel}</Badge>
            </dd>
          </div>
          <div>
            <dt className="text-ink-faint">Safety</dt>
            <dd className="mt-1">
              <Badge tone={safety.tone}>{safety.label}</Badge>
            </dd>
          </div>
        </dl>

        <div className="mt-3.5 space-y-2 border-t border-line pt-3.5 text-[12.5px]">
          <p className="leading-snug text-ink-soft">
            <span className="font-medium text-ink">Experiences:</span> {topExperiences.join(', ')}
          </p>
          {mustEat.length ? (
            <p className="leading-snug text-ink-soft">
              <span className="font-medium text-ink">Don’t miss:</span>{' '}
              {mustEat.map((dish) => dish.name).join(', ')}
            </p>
          ) : null}
        </div>

        {weather && weatherIsDemo ? (
          <DataSourceNote
            compact
            className="mt-3 self-start"
            envelope={{
              source: 'demo',
              provider: 'Climate averages',
              note: 'Temperature modelled from monthly averages, not a live reading.',
            }}
          />
        ) : null}

        <Link
          to={`/destination/${destination.id}`}
          className="mt-auto inline-flex items-center gap-1 pt-4 text-[13.5px] font-medium text-ink transition group-hover:gap-2"
        >
          Destination intelligence <ChevronRight size={15} aria-hidden />
        </Link>
      </div>
    </article>
  );
}
