import { useState } from 'react';
import { Phone, Siren } from 'lucide-react';
import { NATIONAL_HELPLINES } from '@/data/emergencyNumbers';
import { Sheet } from '@/components/ui/Sheet';
import { ButtonLink } from '@/components/ui/Button';
import { useTripStore } from '@/store/tripStore';
import { cn } from '@/utils/cn';

/**
 * Always-reachable help. It deliberately does *not* claim to call anyone
 * automatically or share a location — it surfaces the official published
 * helplines and the directory, and lets the traveller act.
 */
export function EmergencySheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { activeTrip, activeDestination } = useTripStore();
  const priority = NATIONAL_HELPLINES.filter((line) => line.priority);
  const others = NATIONAL_HELPLINES.filter((line) => !line.priority);

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Emergency help"
      description="Official national helplines for India. Tapping a number opens your phone dialler — nothing is called automatically."
      size="md"
    >
      <div className="space-y-5">
        <div className="grid gap-2.5 sm:grid-cols-2">
          {priority.map((line) => (
            <a
              key={line.id}
              href={`tel:${line.number}`}
              className="flex items-center gap-3 rounded-2xl border border-danger/30 bg-danger-soft/50 px-4 py-3 transition hover:border-danger/60"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger text-white">
                <Phone size={17} />
              </span>
              <span className="min-w-0">
                <span className="block font-display text-[19px] leading-none tabular-nums text-ink">{line.number}</span>
                <span className="mt-1 block truncate text-[12.5px] text-ink-soft">{line.label}</span>
              </span>
            </a>
          ))}
        </div>

        <div>
          <h3 className="mb-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-ink-faint">Other helplines</h3>
          <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line">
            {others.map((line) => (
              <li key={line.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <div className="min-w-0">
                  <p className="text-[14px] font-medium text-ink">{line.label}</p>
                  <p className="truncate text-[12.5px] text-ink-faint">{line.detail}</p>
                </div>
                <a
                  href={`tel:${line.number}`}
                  className="shrink-0 font-display text-[16px] tabular-nums text-ink-soft underline-offset-4 hover:text-ink hover:underline"
                >
                  {line.number}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {activeTrip && activeDestination ? (
          <div className="rounded-2xl bg-surface-2 p-4">
            <p className="text-[13.5px] leading-relaxed text-ink-soft">
              Your trip to <strong className="text-ink">{activeDestination.name}</strong> has a directory of hospitals,
              police stations, pharmacies and ATMs, with the areas they cover.
            </p>
            <ButtonLink
              to={`/trip/${activeTrip.id}/emergency`}
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={onClose}
            >
              Open nearby help
            </ButtonLink>
          </div>
        ) : null}

        <p className="text-[12px] leading-relaxed text-ink-faint">
          Helpline numbers are the published national emergency numbers for India. Facility listings in this prototype
          are a curated sample, not live location data — always confirm before relying on one.
        </p>
      </div>
    </Sheet>
  );
}

export function EmergencyButton({ className, compact }: { className?: string; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'inline-flex items-center gap-2 rounded-full border border-danger/40 bg-danger-soft font-medium text-danger transition hover:bg-danger hover:text-white active:scale-95',
          compact ? 'h-9 w-9 justify-center' : 'h-9 px-3.5 text-[13px]',
          className,
        )}
        aria-label="Emergency help"
      >
        <Siren size={16} />
        {compact ? null : 'Help'}
      </button>
      <EmergencySheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}
