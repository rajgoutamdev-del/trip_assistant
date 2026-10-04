import { useState } from 'react';
import {
  Banknote, Building2, Cross, ExternalLink, Info, MapPin, Phone, Pill, ShieldCheck, ShoppingBasket, Toilet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Destination, EmergencyService } from '@/types';
import { placesProvider } from '@/services/providers/places';
import { mapsProvider } from '@/services/providers/maps';
import { SchematicMap } from '@/components/map/SchematicMap';
import { FilterPill } from '@/components/ui/Chip';
import { Badge } from '@/components/ui/Badge';
import { DataSourceNote, EmptyState, ErrorState, Skeleton } from '@/components/ui/States';
import { NATIONAL_HELPLINES } from '@/data/emergencyNumbers';
import { useAsync } from '@/hooks/useAsync';

const KIND_META: Record<EmergencyService['kind'], { label: string; icon: LucideIcon; tone: 'danger' | 'jade' | 'saffron' | 'default' }> = {
  hospital: { label: 'Hospitals', icon: Cross, tone: 'danger' },
  police: { label: 'Police', icon: ShieldCheck, tone: 'default' },
  pharmacy: { label: 'Pharmacies', icon: Pill, tone: 'jade' },
  atm: { label: 'ATMs', icon: Banknote, tone: 'saffron' },
  grocery: { label: 'Groceries', icon: ShoppingBasket, tone: 'jade' },
  restroom: { label: 'Restrooms', icon: Toilet, tone: 'default' },
  'tourist-help': { label: 'Tourist help', icon: Building2, tone: 'saffron' },
};

const KIND_ORDER: EmergencyService['kind'][] = [
  'hospital', 'police', 'pharmacy', 'atm', 'grocery', 'restroom', 'tourist-help',
];

export function NearbyHelp({ destination, showHelplines = true }: { destination: Destination; showHelplines?: boolean }) {
  const [kind, setKind] = useState<EmergencyService['kind'] | 'all'>('all');

  const state = useAsync(
    () => placesProvider.findNearbyHelp({ destination, kinds: kind === 'all' ? undefined : [kind] }),
    [destination.id, kind],
  );

  const availableKinds = KIND_ORDER.filter((candidate) => destination.emergency.some((e) => e.kind === candidate));
  const priority = NATIONAL_HELPLINES.filter((line) => line.priority);

  return (
    <div className="space-y-5">
      {showHelplines ? (
        <div>
          <h2 className="mb-2.5 text-[12px] font-semibold uppercase tracking-[0.1em] text-ink-faint">
            National helplines — published, and the same everywhere in India
          </h2>
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {priority.map((line) => (
              <a
                key={line.id}
                href={`tel:${line.number}`}
                className="flex items-center gap-3 rounded-2xl border border-danger/25 bg-danger-soft/40 px-4 py-3 transition hover:border-danger/60"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-danger text-white">
                  <Phone size={15} />
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-[18px] leading-none tabular-nums text-ink">{line.number}</span>
                  <span className="mt-0.5 block truncate text-[12px] text-ink-soft">{line.label}</span>
                </span>
              </a>
            ))}
          </div>
        </div>
      ) : null}

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:flex-wrap sm:px-0">
        <FilterPill active={kind === 'all'} onClick={() => setKind('all')} count={destination.emergency.length}>
          Everything
        </FilterPill>
        {availableKinds.map((candidate) => (
          <FilterPill
            key={candidate}
            active={kind === candidate}
            onClick={() => setKind(candidate)}
            count={destination.emergency.filter((e) => e.kind === candidate).length}
          >
            {KIND_META[candidate].label}
          </FilterPill>
        ))}
      </div>

      {state.loading ? (
        <div className="space-y-2.5">
          <Skeleton className="h-64 rounded-card" />
          <Skeleton className="h-20 rounded-card" />
        </div>
      ) : state.error ? (
        <ErrorState title="Directory unavailable" message={state.error.message} onRetry={state.reload} />
      ) : !state.data?.data.length ? (
        <EmptyState
          icon={<MapPin size={20} />}
          title="Nothing listed in this category"
          description="This prototype ships a curated sample per destination. Connecting a Places provider fills this with live results around you."
        />
      ) : (
        <>
          <SchematicMap
            height={280}
            points={state.data.data.map((service) => ({
              id: service.id,
              label: service.name,
              coords: service.coords,
              sublabel: `${KIND_META[service.kind].label.replace(/s$/, '')} · ${service.area}`,
              tone: service.kind === 'hospital' ? 'danger' : service.kind === 'police' ? 'default' : 'jade',
            }))}
          />

          <ul className="divide-y divide-line overflow-hidden rounded-card border border-line bg-surface">
            {state.data.data.map((service) => {
              const meta = KIND_META[service.kind];
              return (
                <li key={service.id} className="flex items-start gap-3.5 px-4 py-4">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-ink-soft">
                    <meta.icon size={16} aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                      <p className="text-[14.5px] font-medium leading-snug text-ink">{service.name}</p>
                      {service.open24h ? <Badge tone="jade">Open 24h</Badge> : null}
                    </div>
                    <p className="mt-0.5 text-[12.5px] text-ink-faint">
                      {service.area} · {service.distanceKm.toFixed(1)} km from the city centre
                    </p>
                    {service.note ? (
                      <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">{service.note}</p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {service.phone ? (
                      <a
                        href={`tel:${service.phone}`}
                        aria-label={`Call ${service.name}`}
                        className="rounded-full p-2 text-ink-faint transition hover:bg-surface-2 hover:text-ink"
                      >
                        <Phone size={14} />
                      </a>
                    ) : null}
                    <a
                      href={mapsProvider.externalLink(service.coords, service.name)}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Open ${service.name} in maps`}
                      className="rounded-full p-2 text-ink-faint transition hover:bg-surface-2 hover:text-ink"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>

          <DataSourceNote envelope={state.data} />
        </>
      )}

      <div className="flex items-start gap-2.5 rounded-xl border border-line bg-surface-2/50 px-4 py-3 text-[12.5px] leading-relaxed text-ink-soft">
        <Info size={14} className="mt-0.5 shrink-0 text-ink-faint" />
        <p>
          Listings name well-known public institutions and are ordered by straight-line distance from the city centre,
          not by road. Phone numbers are only shown where a published helpline exists. In a real emergency, dial{' '}
          <strong className="text-ink">112</strong> first.
        </p>
      </div>
    </div>
  );
}
