import { useMemo, useState } from 'react';
import { Check, Plus, RefreshCw, Trash2 } from 'lucide-react';
import type { PackingItem } from '@/types';
import { useTripContext } from '@/hooks/useTripContext';
import { useTripStore } from '@/store/tripStore';
import { PACKING_CATEGORY_LABELS } from '@/services/planner/packing';
import { Card, CardHeader, SectionTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { FilterPill } from '@/components/ui/Chip';
import { SelectField, TextField } from '@/components/ui/Field';
import { Sheet } from '@/components/ui/Sheet';
import { groupBy } from '@/utils/misc';
import { monthOf, tripLengthDays } from '@/utils/dates';
import { cn } from '@/utils/cn';

const CATEGORY_ORDER: PackingItem['category'][] = [
  'documents', 'clothing', 'footwear', 'weather', 'health', 'tech', 'activity',
];

export default function PackingPage() {
  const { trip, destination } = useTripContext();
  const { togglePackingItem, addPackingItem, removePackingItem, resetPacking } = useTripStore();

  const [filter, setFilter] = useState<'all' | 'essential' | 'remaining'>('all');
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState('');
  const [category, setCategory] = useState<PackingItem['category']>('activity');

  const packed = trip.packing.filter((item) => item.checked).length;
  const essentialsLeft = trip.packing.filter((item) => item.essential && !item.checked).length;
  const month = destination.monthNotes[monthOf(trip.startDate) - 1];
  const days = tripLengthDays(trip.startDate, trip.endDate);

  const visible = useMemo(() => {
    const list =
      filter === 'essential'
        ? trip.packing.filter((item) => item.essential)
        : filter === 'remaining'
          ? trip.packing.filter((item) => !item.checked)
          : trip.packing;
    return groupBy(list, (item) => item.category);
  }, [trip.packing, filter]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-7 sm:px-6 sm:py-9">
      <SectionTitle
        eyebrow="Packing"
        title={`${trip.packing.length} items for ${days} days`}
        description={`Generated from ${destination.name} in ${month.label} (${month.avgLowC}–${month.avgHighC}°C), your ${trip.preferences.travelType} travel type and the activities you picked.`}
        action={
          <div className="flex gap-1.5">
            <Button variant="outline" size="sm" onClick={() => resetPacking(trip.id)}>
              <RefreshCw size={13} /> Regenerate
            </Button>
            <Button size="sm" onClick={() => setAdding(true)}>
              <Plus size={13} /> Add
            </Button>
          </div>
        }
      />

      <Card className="mb-5 p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <p className="font-display text-[22px] tabular-nums">
            {packed}
            <span className="text-ink-faint"> / {trip.packing.length}</span>
            <span className="ml-2 font-sans text-[13px] font-normal text-ink-faint">packed</span>
          </p>
          {essentialsLeft > 0 ? (
            <Badge tone="warn">{essentialsLeft} essentials still to pack</Badge>
          ) : (
            <Badge tone="jade">All essentials packed</Badge>
          )}
        </div>
        <ProgressBar
          className="mt-3"
          value={packed}
          max={Math.max(1, trip.packing.length)}
          tone={essentialsLeft > 0 ? 'saffron' : 'jade'}
          label="Packing progress"
        />
      </Card>

      <div className="mb-5 flex flex-wrap gap-2">
        <FilterPill active={filter === 'all'} onClick={() => setFilter('all')} count={trip.packing.length}>
          Everything
        </FilterPill>
        <FilterPill
          active={filter === 'essential'}
          onClick={() => setFilter('essential')}
          count={trip.packing.filter((item) => item.essential).length}
        >
          Essentials
        </FilterPill>
        <FilterPill
          active={filter === 'remaining'}
          onClick={() => setFilter('remaining')}
          count={trip.packing.length - packed}
        >
          Still to pack
        </FilterPill>
      </div>

      <div className="space-y-5">
        {CATEGORY_ORDER.filter((key) => visible[key]?.length).map((key) => (
          <Card key={key}>
            <CardHeader title={PACKING_CATEGORY_LABELS[key]} subtitle={`${visible[key].length} items`} />
            <ul className="divide-y divide-line px-5 pb-3">
              {visible[key].map((item) => (
                <li key={item.id} className="flex items-start gap-3 py-3">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={item.checked}
                    onClick={() => togglePackingItem(trip.id, item.id)}
                    aria-label={item.label}
                    className={cn(
                      'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition',
                      item.checked
                        ? 'border-jade bg-jade text-white'
                        : 'border-line-strong text-transparent hover:border-ink-faint',
                    )}
                  >
                    <Check size={14} strokeWidth={3} />
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <p
                        className={cn(
                          'text-[14.5px] font-medium leading-snug transition',
                          item.checked ? 'text-ink-faint line-through' : 'text-ink',
                        )}
                      >
                        {item.label}
                      </p>
                      {item.essential ? <Badge tone="saffron">Essential</Badge> : null}
                    </div>
                    <p className="mt-0.5 text-[12.5px] leading-snug text-ink-faint">{item.reason}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removePackingItem(trip.id, item.id)}
                    aria-label={`Remove ${item.label}`}
                    className="mt-0.5 shrink-0 rounded-full p-1.5 text-ink-faint transition hover:bg-danger-soft hover:text-danger"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <Sheet
        open={adding}
        onClose={() => setAdding(false)}
        title="Add an item"
        description="Anything the rules engine missed."
        footer={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setAdding(false)} full>
              Cancel
            </Button>
            <Button
              full
              disabled={!label.trim()}
              onClick={() => {
                addPackingItem(trip.id, label.trim(), category);
                setLabel('');
                setAdding(false);
              }}
            >
              Add item
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <TextField
            label="Item"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder="Spare contact lenses"
            autoFocus
          />
          <SelectField
            label="Category"
            value={category}
            onChange={(event) => setCategory(event.target.value as PackingItem['category'])}
            options={CATEGORY_ORDER.map((key) => ({ value: key, label: PACKING_CATEGORY_LABELS[key] }))}
          />
        </div>
      </Sheet>
    </div>
  );
}
