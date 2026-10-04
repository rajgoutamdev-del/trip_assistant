import {
  Cloud, CloudFog, CloudLightning, CloudRain, CloudSun, Droplets, Haze, Snowflake, Sun, Sunrise, Sunset, Wind,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Destination, WeatherCondition } from '@/types';
import { assessSuitability, weatherProvider, type Suitability } from '@/services/providers/weather';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DataSourceNote, ErrorState, Skeleton } from '@/components/ui/States';
import { useAsync } from '@/hooks/useAsync';
import { formatDate } from '@/utils/format';
import { cn } from '@/utils/cn';

export const WEATHER_ICON: Record<WeatherCondition, LucideIcon> = {
  clear: Sun,
  'partly-cloudy': CloudSun,
  cloudy: Cloud,
  rain: CloudRain,
  'heavy-rain': CloudRain,
  thunderstorm: CloudLightning,
  haze: Haze,
  snow: Snowflake,
  fog: CloudFog,
};

const SUITABILITY_TONE: Record<Suitability, 'jade' | 'saffron' | 'warn' | 'danger'> = {
  great: 'jade',
  fine: 'saffron',
  caution: 'warn',
  poor: 'danger',
};

export function WeatherPanel({
  destination,
  startDate,
  days = 5,
  activityKinds = ['outdoor', 'photography'],
  compact,
}: {
  destination: Destination;
  startDate?: string;
  days?: number;
  activityKinds?: ('outdoor' | 'trek' | 'beach' | 'indoor' | 'photography')[];
  compact?: boolean;
}) {
  const state = useAsync(async () => {
    const [current, forecast] = await Promise.all([
      weatherProvider.getCurrentWeather(destination, startDate),
      weatherProvider.getForecast(destination, startDate ?? new Date().toISOString().slice(0, 10), days),
    ]);
    return { current, forecast };
  }, [destination.id, startDate, days]);

  if (state.loading) {
    return (
      <Card className="p-5">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="mt-4 h-16 w-full" />
        <Skeleton className="mt-3 h-20 w-full" />
      </Card>
    );
  }

  if (state.error || !state.data) {
    return (
      <ErrorState
        title="Weather unavailable"
        message={state.error?.message ?? 'No weather could be loaded for this destination.'}
        onRetry={state.reload}
      />
    );
  }

  const { current, forecast } = state.data;
  const weather = current.data;
  const Icon = WEATHER_ICON[weather.condition];

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-5 p-5">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2 text-saffron">
            <Icon size={28} aria-hidden />
          </span>
          <div>
            <p className="font-display text-[34px] leading-none tabular-nums">{weather.tempC}°C</p>
            <p className="mt-1 text-[14px] text-ink-soft">
              {weather.label} · feels like {weather.feelsLikeC}°C
            </p>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-[13px] sm:grid-cols-4">
          {[
            { icon: Droplets, label: 'Rain', value: `${weather.rainChance}%` },
            { icon: Wind, label: 'Wind', value: `${weather.windKph} km/h` },
            { icon: Sunrise, label: 'Sunrise', value: weather.sunrise },
            { icon: Sunset, label: 'Sunset', value: weather.sunset },
          ].map(({ icon: ItemIcon, label, value }) => (
            <div key={label}>
              <dt className="flex items-center gap-1.5 text-ink-faint">
                <ItemIcon size={12} aria-hidden /> {label}
              </dt>
              <dd className="mt-0.5 font-medium tabular-nums text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="border-t border-line px-5 py-4">
        <h3 className="mb-3 text-[12px] font-semibold uppercase tracking-[0.1em] text-ink-faint">
          {startDate ? 'Your trip dates' : 'Next days'}
        </h3>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-none">
          {forecast.data.map((day) => {
            const DayIcon = WEATHER_ICON[day.condition];
            return (
              <div
                key={day.date}
                className="flex min-w-[88px] flex-1 flex-col items-center gap-1.5 rounded-xl bg-surface-2/70 px-3 py-3 text-center"
              >
                <span className="text-[11.5px] font-medium text-ink-faint">{formatDate(day.date, { weekday: 'short' })}</span>
                <DayIcon size={19} aria-hidden className="text-saffron" />
                <span className="text-[13.5px] font-medium tabular-nums text-ink">
                  {day.highC}° <span className="text-ink-faint">{day.lowC}°</span>
                </span>
                <span className="text-[10.5px] text-ink-faint tabular-nums">{day.rainChance}% rain</span>
              </div>
            );
          })}
        </div>
      </div>

      {!compact ? (
        <div className="border-t border-line px-5 py-4">
          <h3 className="mb-3 text-[12px] font-semibold uppercase tracking-[0.1em] text-ink-faint">
            Fit for your plans
          </h3>
          <ul className="space-y-2.5">
            {activityKinds.map((kind) => {
              const verdict = assessSuitability(weather, kind);
              return (
                <li key={kind} className="flex items-start gap-3">
                  <Badge tone={SUITABILITY_TONE[verdict.rating]} className="mt-0.5 shrink-0 capitalize">
                    {kind}
                  </Badge>
                  <div className="min-w-0">
                    <p className="text-[14px] font-medium leading-snug text-ink">{verdict.headline}</p>
                    <p className="mt-0.5 text-[13px] leading-relaxed text-ink-soft">{verdict.reason}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      <div className="px-5 pb-5">
        <DataSourceNote envelope={current} />
      </div>
    </Card>
  );
}

export function ClimateStrip({ destination, highlightMonth }: { destination: Destination; highlightMonth?: number }) {
  const tone: Record<string, string> = {
    ideal: 'bg-jade text-white',
    good: 'bg-jade-soft text-jade',
    mixed: 'bg-warn-soft text-warn',
    avoid: 'bg-danger-soft text-danger',
  };

  return (
    <div>
      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-2 scrollbar-none">
        {destination.monthNotes.map((note) => (
          <div
            key={note.month}
            className={cn(
              'min-w-[74px] flex-1 rounded-xl border p-2.5 text-center transition',
              highlightMonth === note.month ? 'border-ink' : 'border-transparent',
            )}
            title={note.note}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">{note.label.slice(0, 3)}</p>
            <p className="mt-1.5 text-[13px] font-medium tabular-nums text-ink">
              {note.avgHighC}° <span className="text-ink-faint">{note.avgLowC}°</span>
            </p>
            <span className={cn('mt-2 block rounded-full px-1.5 py-0.5 text-[10px] font-semibold capitalize', tone[note.rating])}>
              {note.rating}
            </span>
          </div>
        ))}
      </div>
      {highlightMonth ? (
        <p className="mt-2 rounded-xl bg-surface-2/70 px-3.5 py-2.5 text-[13px] leading-relaxed text-ink-soft">
          <strong className="font-medium text-ink">{destination.monthNotes[highlightMonth - 1].label}:</strong>{' '}
          {destination.monthNotes[highlightMonth - 1].note}
        </p>
      ) : null}
    </div>
  );
}
