import { useMemo, useState } from 'react';
import { ExternalLink, Map as MapIcon } from 'lucide-react';
import type { GeoPoint } from '@/types';
import { mapsProvider, mapsIsLive } from '@/services/providers/maps';
import { cn } from '@/utils/cn';

export interface MapPoint {
  id: string;
  label: string;
  coords: GeoPoint;
  tone?: 'default' | 'danger' | 'jade' | 'saffron';
  sublabel?: string;
  /** Shown as a numbered pin instead of a dot — used for itinerary order. */
  order?: number;
}

const TONE_FILL: Record<NonNullable<MapPoint['tone']>, string> = {
  default: 'hsl(var(--ink))',
  danger: 'hsl(var(--danger))',
  jade: 'hsl(var(--jade))',
  saffron: 'hsl(var(--saffron))',
};

/**
 * A deliberate placeholder, not a fake map. It plots real coordinates on a
 * normalised grid and links out to the traveller's own map app. The moment a
 * maps key is configured, this component is where the tile layer goes.
 */
export function SchematicMap({
  points,
  className,
  height = 320,
  connect,
  emptyLabel = 'No locations to plot',
}: {
  points: MapPoint[];
  className?: string;
  height?: number;
  connect?: boolean;
  emptyLabel?: string;
}) {
  const [active, setActive] = useState<string>();

  const plotted = useMemo(() => {
    if (!points.length) return [];
    const lats = points.map((p) => p.coords.lat);
    const lngs = points.map((p) => p.coords.lng);
    const pad = 0.12;
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const latRange = Math.max(maxLat - minLat, 0.01);
    const lngRange = Math.max(maxLng - minLng, 0.01);

    return points.map((point) => ({
      ...point,
      x: (pad + ((point.coords.lng - minLng) / lngRange) * (1 - pad * 2)) * 100,
      y: (pad + ((maxLat - point.coords.lat) / latRange) * (1 - pad * 2)) * 100,
    }));
  }, [points]);

  const activePoint = plotted.find((p) => p.id === active) ?? plotted[0];

  if (!points.length) {
    return (
      <div
        className={cn('flex items-center justify-center rounded-card border border-dashed border-line-strong bg-surface-2/40 text-[13px] text-ink-faint', className)}
        style={{ height }}
      >
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className={cn('overflow-hidden rounded-card border border-line bg-surface', className)}>
      <div className="relative bg-surface-2/60" style={{ height }}>
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
          role="img"
          aria-label={`Schematic plot of ${points.length} locations`}
        >
          <defs>
            <pattern id="safar-grid" width="8" height="8" patternUnits="userSpaceOnUse">
              <path d="M8 0H0v8" fill="none" stroke="hsl(var(--line))" strokeWidth="0.3" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#safar-grid)" />
          {connect && plotted.length > 1 ? (
            <polyline
              points={plotted.map((p) => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke="hsl(var(--saffron))"
              strokeWidth="0.6"
              strokeDasharray="2 1.6"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          ) : null}
        </svg>

        {plotted.map((point) => (
          <button
            key={point.id}
            type="button"
            onClick={() => setActive(point.id)}
            aria-label={point.label}
            aria-pressed={active === point.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full focus-visible:outline-offset-4"
            style={{ left: `${point.x}%`, top: `${point.y}%` }}
          >
            <span
              className={cn(
                'relative flex items-center justify-center rounded-full border-2 border-surface text-[10px] font-bold text-paper shadow-md transition-transform duration-200',
                point.order !== undefined ? 'h-6 w-6' : 'h-3.5 w-3.5',
                active === point.id && 'scale-125',
              )}
              style={{ background: TONE_FILL[point.tone ?? 'default'] }}
            >
              {point.order !== undefined ? point.order : null}
              {active === point.id ? (
                <span
                  aria-hidden
                  className="absolute inset-0 animate-[var(--animate-pulse-ring)] rounded-full"
                  style={{ background: TONE_FILL[point.tone ?? 'default'], opacity: 0.4 }}
                />
              ) : null}
            </span>
          </button>
        ))}

        <div className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-surface/90 px-2.5 py-1 text-[10.5px] font-medium text-ink-faint backdrop-blur">
          <MapIcon size={11} />
          {mapsIsLive ? 'Map provider configured' : 'Schematic plot — not a live map'}
        </div>
      </div>

      {activePoint ? (
        <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-[14px] font-medium text-ink">{activePoint.label}</p>
            <p className="truncate text-[12.5px] text-ink-faint">
              {activePoint.sublabel ?? `${activePoint.coords.lat.toFixed(4)}, ${activePoint.coords.lng.toFixed(4)}`}
            </p>
          </div>
          <a
            href={mapsProvider.externalLink(activePoint.coords, activePoint.label)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[12.5px] font-medium text-ink-soft transition hover:border-line-strong hover:text-ink"
          >
            Open in Maps <ExternalLink size={12} />
          </a>
        </div>
      ) : null}
    </div>
  );
}
