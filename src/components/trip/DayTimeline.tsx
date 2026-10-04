import {
  BedDouble, Camera, Car, ChevronDown, ChevronUp, Clock, Coffee, Landmark,
  Navigation, ShoppingBasket, Ticket, Trash2, UtensilsCrossed,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ItineraryDay, ItineraryItem, ItineraryItemKind } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { formatClock, formatDuration, formatINR } from '@/utils/format';
import { cn } from '@/utils/cn';

const KIND_ICON: Record<ItineraryItemKind, LucideIcon> = {
  sight: Landmark,
  food: UtensilsCrossed,
  activity: Camera,
  transit: Car,
  rest: Coffee,
  shopping: ShoppingBasket,
  stay: BedDouble,
};

const KIND_TONE: Record<ItineraryItemKind, string> = {
  sight: 'bg-saffron-soft text-saffron',
  food: 'bg-jade-soft text-jade',
  activity: 'bg-surface-2 text-indigo',
  transit: 'bg-surface-2 text-ink-soft',
  rest: 'bg-surface-2 text-ink-soft',
  shopping: 'bg-warn-soft text-warn',
  stay: 'bg-surface-2 text-ink-soft',
};

export interface ItemActions {
  onMove?: (itemId: string, direction: -1 | 1) => void;
  onRemove?: (itemId: string) => void;
  onEdit?: (item: ItineraryItem) => void;
}

export function DayTimeline({
  day,
  actions,
  compact,
  travellers = 1,
}: {
  day: ItineraryDay;
  actions?: ItemActions;
  compact?: boolean;
  travellers?: number;
}) {
  if (!day.items.length) {
    return (
      <p className="rounded-xl bg-surface-2/60 px-4 py-6 text-center text-[13.5px] text-ink-faint">
        Nothing scheduled for this day yet.
      </p>
    );
  }

  return (
    <ol className="relative space-y-0">
      {day.items.map((item, index) => {
        const Icon = KIND_ICON[item.kind];
        const isLast = index === day.items.length - 1;

        return (
          <li key={item.id} className="relative flex gap-3.5 pb-1">
            {/* Time rail */}
            <div className="flex w-[62px] shrink-0 flex-col items-end pt-3">
              <span className="whitespace-nowrap font-display text-[13.5px] leading-none tabular-nums text-ink">
                {formatClock(item.startMinutes)}
              </span>
              {!compact ? (
                <span className="mt-1 text-[10.5px] leading-none text-ink-faint tabular-nums">
                  {formatDuration(item.durationMinutes)}
                </span>
              ) : null}
            </div>

            {/* Connector */}
            <div className="relative flex shrink-0 flex-col items-center pt-3">
              <span className={cn('flex h-8 w-8 items-center justify-center rounded-xl', KIND_TONE[item.kind])}>
                <Icon size={15} aria-hidden />
              </span>
              {!isLast ? <span aria-hidden className="mt-1 w-px flex-1 bg-line" /> : null}
            </div>

            {/* Body */}
            <div className={cn('min-w-0 flex-1', isLast ? 'pb-1' : 'pb-5')}>
              <div className="rounded-2xl border border-line bg-surface px-4 py-3 transition hover:border-line-strong">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[15px] font-medium leading-snug text-ink">{item.title}</p>
                    {item.area ? <p className="mt-0.5 truncate text-[12.5px] text-ink-faint">{item.area}</p> : null}
                  </div>
                  {actions ? (
                    <div className="flex shrink-0 items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => actions.onMove?.(item.id, -1)}
                        disabled={index === 0}
                        aria-label={`Move ${item.title} earlier`}
                        className="rounded-full p-1.5 text-ink-faint transition hover:bg-surface-2 hover:text-ink disabled:opacity-30"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => actions.onMove?.(item.id, 1)}
                        disabled={isLast}
                        aria-label={`Move ${item.title} later`}
                        className="rounded-full p-1.5 text-ink-faint transition hover:bg-surface-2 hover:text-ink disabled:opacity-30"
                      >
                        <ChevronDown size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => actions.onEdit?.(item)}
                        aria-label={`Edit ${item.title}`}
                        className="rounded-full p-1.5 text-ink-faint transition hover:bg-surface-2 hover:text-ink"
                      >
                        <Clock size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => actions.onRemove?.(item.id)}
                        aria-label={`Remove ${item.title}`}
                        className="rounded-full p-1.5 text-ink-faint transition hover:bg-danger-soft hover:text-danger"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ) : null}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ink-faint">
                  {item.travelMinutes > 0 ? (
                    <span className="inline-flex items-center gap-1">
                      <Navigation size={11} aria-hidden /> {formatDuration(item.travelMinutes)} travel
                    </span>
                  ) : null}
                  <span className="inline-flex items-center gap-1">
                    <Clock size={11} aria-hidden /> {formatDuration(item.durationMinutes)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Ticket size={11} aria-hidden />
                    {item.estimatedCostINR === 0 ? 'No cost' : formatINR(item.estimatedCostINR)}
                    {travellers > 1 && item.estimatedCostINR > 0 ? ` · ${travellers} people` : ''}
                  </span>
                  {item.bookingRequired ? <Badge tone="warn">Book ahead</Badge> : null}
                </div>

                {!compact ? (
                  <p className="mt-2.5 border-t border-line pt-2.5 text-[12.5px] leading-relaxed text-ink-soft">
                    <span className="font-medium text-ink">Why: </span>
                    {item.reason}
                  </p>
                ) : null}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
