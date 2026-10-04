import { useMemo, useState } from 'react';
import { Clock, Plus, RefreshCw } from 'lucide-react';
import type { ItineraryItem, ItineraryItemKind, Place } from '@/types';
import { useTripContext } from '@/hooks/useTripContext';
import { useTripStore } from '@/store/tripStore';
import { dayCostINR, dayEndMinutes } from '@/services/planner/itinerary';
import { DayTimeline } from '@/components/trip/DayTimeline';
import { PlaceList } from '@/components/destination/panels';
import { SchematicMap } from '@/components/map/SchematicMap';
import { Card, CardHeader, SectionTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';
import { SelectField, TextField } from '@/components/ui/Field';
import { Stat } from '@/components/ui/Stat';
import { EmptyState } from '@/components/ui/States';
import { formatClock, formatDate, formatDuration, formatINR } from '@/utils/format';
import { cn } from '@/utils/cn';

const KINDS: { value: ItineraryItemKind; label: string }[] = [
  { value: 'sight', label: 'Sight' },
  { value: 'food', label: 'Food' },
  { value: 'activity', label: 'Activity' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'rest', label: 'Rest / break' },
  { value: 'transit', label: 'Travel' },
  { value: 'stay', label: 'Stay / check-in' },
];

interface DraftItem {
  title: string;
  kind: ItineraryItemKind;
  durationMinutes: number;
  travelMinutes: number;
  estimatedCostINR: number;
  area: string;
}

const EMPTY_DRAFT: DraftItem = {
  title: '',
  kind: 'sight',
  durationMinutes: 60,
  travelMinutes: 15,
  estimatedCostINR: 0,
  area: '',
};

export default function ItineraryPage() {
  const { trip, destination } = useTripContext();
  const { addItem, removeItem, moveItem, updateItem, regenerateItinerary, planning } = useTripStore();

  const [dayIndex, setDayIndex] = useState(0);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<DraftItem>(EMPTY_DRAFT);
  const [editing, setEditing] = useState<ItineraryItem>();
  const [showPlaces, setShowPlaces] = useState(false);

  const day = trip.itinerary[Math.min(dayIndex, trip.itinerary.length - 1)];

  const mapPoints = useMemo(() => {
    if (!day) return [];
    return day.items
      .map((item, index) => {
        const place = destination.places.find((candidate) => candidate.id === item.placeId);
        if (!place) return undefined;
        return {
          id: item.id,
          label: place.name,
          coords: place.coords,
          sublabel: `${formatClock(item.startMinutes)} · ${place.area}`,
          order: index + 1,
          tone: 'saffron' as const,
        };
      })
      .filter((point): point is NonNullable<typeof point> => Boolean(point));
  }, [day, destination.places]);

  const addPlaceToDay = (place: Place) => {
    if (!day) return;
    const fee = trip.preferences.isInternationalVisitor ? place.entryFeeINR.foreign : place.entryFeeINR.indian;
    addItem(trip.id, day.id, {
      startMinutes: dayEndMinutes(day) + 30,
      durationMinutes: place.typicalVisitMinutes,
      title: place.name,
      kind: place.category === 'market' ? 'shopping' : 'sight',
      placeId: place.id,
      area: place.area,
      estimatedCostINR: fee * trip.preferences.travellers,
      travelMinutes: 20,
      reason: `Added by you. ${place.blurb}`,
    });
    setShowPlaces(false);
  };

  const submitDraft = () => {
    if (!day || !draft.title.trim()) return;
    addItem(trip.id, day.id, {
      startMinutes: dayEndMinutes(day) + 30,
      durationMinutes: draft.durationMinutes,
      title: draft.title.trim(),
      kind: draft.kind,
      area: draft.area.trim() || undefined,
      estimatedCostINR: draft.estimatedCostINR,
      travelMinutes: draft.travelMinutes,
      reason: 'Added by you.',
    });
    setDraft(EMPTY_DRAFT);
    setAdding(false);
  };

  if (!trip.itinerary.length || !day) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <EmptyState
          icon={<Clock size={22} />}
          title="No itinerary yet"
          description="The planner can build one from the preferences you set during onboarding."
          action={
            <Button onClick={() => void regenerateItinerary(trip.id)} disabled={planning}>
              <RefreshCw size={15} className={planning ? 'animate-spin' : undefined} /> Generate plan
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-9">
      <SectionTitle
        eyebrow="Itinerary"
        title={`${trip.itinerary.length} days, planned around the light and the crowds`}
        description="Every stop carries its reasoning. Reorder, retime, remove or add anything — the day re-times itself."
        action={
          <Button variant="outline" size="sm" onClick={() => void regenerateItinerary(trip.id)} disabled={planning}>
            <RefreshCw size={14} className={planning ? 'animate-spin' : undefined} /> Regenerate
          </Button>
        }
      />

      {/* Day selector */}
      <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:px-0">
        {trip.itinerary.map((candidate, index) => (
          <button
            key={candidate.id}
            type="button"
            onClick={() => setDayIndex(index)}
            aria-current={index === dayIndex}
            className={cn(
              'min-w-[132px] shrink-0 rounded-2xl border px-4 py-3 text-left transition',
              index === dayIndex
                ? 'border-ink bg-ink text-paper'
                : 'border-line bg-surface text-ink-soft hover:border-line-strong hover:text-ink',
            )}
          >
            <p className={cn('text-[11px] font-semibold uppercase tracking-wide', index === dayIndex ? 'text-paper/70' : 'text-ink-faint')}>
              Day {candidate.dayNumber}
            </p>
            <p className="mt-1 truncate text-[14px] font-medium">{candidate.title}</p>
            <p className={cn('mt-0.5 text-[11.5px] tabular-nums', index === dayIndex ? 'text-paper/60' : 'text-ink-faint')}>
              {formatDate(candidate.date, { day: 'numeric', month: 'short' })} · {candidate.items.length} stops
            </p>
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] [&>*]:min-w-0">
        <div className="space-y-5">
          <Card>
            <CardHeader
              title={`Day ${day.dayNumber} · ${day.title}`}
              subtitle={day.summary}
              action={
                <div className="flex gap-1.5">
                  <Button variant="outline" size="sm" onClick={() => setShowPlaces(true)}>
                    <Plus size={13} /> Place
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setAdding(true)}>
                    <Plus size={13} /> Custom
                  </Button>
                </div>
              }
            />
            <div className="px-4 pb-5 pt-4 sm:px-5">
              <DayTimeline
                day={day}
                travellers={trip.preferences.travellers}
                actions={{
                  onMove: (itemId, direction) => moveItem(trip.id, day.id, itemId, direction),
                  onRemove: (itemId) => removeItem(trip.id, day.id, itemId),
                  onEdit: (item) => setEditing(item),
                }}
              />
            </div>
            <dl className="grid grid-cols-3 gap-4 border-t border-line bg-surface-2/40 px-5 py-4">
              <Stat
                label="Day window"
                value={day.items.length ? `${formatClock(day.items[0].startMinutes)}–${formatClock(dayEndMinutes(day))}` : '—'}
              />
              <Stat label="Estimated cost" value={formatINR(dayCostINR(day))} sub={`${trip.preferences.travellers} travellers`} />
              <Stat
                label="Travel time"
                value={formatDuration(day.items.reduce((total, item) => total + item.travelMinutes, 0))}
                sub="Approximate, straight-line based"
              />
            </dl>
          </Card>
        </div>

        <div className="space-y-5">
          <div>
            <h3 className="mb-2.5 text-[12px] font-semibold uppercase tracking-[0.1em] text-ink-faint">
              Day {day.dayNumber} route
            </h3>
            <SchematicMap
              points={mapPoints}
              connect
              height={300}
              emptyLabel="No mapped places on this day yet"
            />
          </div>

          <Card className="p-5">
            <h3 className="font-display text-[16px]">How this plan was built</h3>
            <ul className="mt-3 space-y-2 text-[13px] leading-relaxed text-ink-soft">
              <li>
                Places were ranked against your interests ({trip.preferences.interests.join(', ')}) and your{' '}
                {trip.preferences.pace} pace.
              </li>
              <li>Each day groups whatever is geographically closest, so you are not crossing the city twice.</li>
              <li>
                Meals are picked to match your diet and {trip.preferences.spice} spice preference, at local prices.
              </li>
              <li>
                Travel times are estimated from straight-line distance for {trip.preferences.transport} travel — they
                are approximations, not routed directions.
              </li>
            </ul>
          </Card>
        </div>
      </div>

      {/* ---------------------------- Add custom --------------------------- */}
      <Sheet
        open={adding}
        onClose={() => setAdding(false)}
        title="Add to this day"
        description={`It will be appended to day ${day.dayNumber} and the day re-times itself.`}
        footer={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setAdding(false)} full>
              Cancel
            </Button>
            <Button onClick={submitDraft} disabled={!draft.title.trim()} full>
              Add to day
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <TextField
            label="What is it?"
            value={draft.title}
            onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            placeholder="Coffee at a café you found"
            autoFocus
          />
          <SelectField
            label="Type"
            value={draft.kind}
            onChange={(event) => setDraft({ ...draft, kind: event.target.value as ItineraryItemKind })}
            options={KINDS}
          />
          <TextField
            label="Area (optional)"
            value={draft.area}
            onChange={(event) => setDraft({ ...draft, area: event.target.value })}
            placeholder="Neighbourhood or landmark"
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <TextField
              label="Duration (min)"
              type="number"
              min={10}
              step={10}
              value={draft.durationMinutes}
              onChange={(event) => setDraft({ ...draft, durationMinutes: Number(event.target.value) })}
            />
            <TextField
              label="Travel there (min)"
              type="number"
              min={0}
              step={5}
              value={draft.travelMinutes}
              onChange={(event) => setDraft({ ...draft, travelMinutes: Number(event.target.value) })}
            />
            <TextField
              label="Cost (₹)"
              type="number"
              min={0}
              step={50}
              value={draft.estimatedCostINR}
              onChange={(event) => setDraft({ ...draft, estimatedCostINR: Number(event.target.value) })}
            />
          </div>
        </div>
      </Sheet>

      {/* ----------------------------- Add place --------------------------- */}
      <Sheet
        open={showPlaces}
        onClose={() => setShowPlaces(false)}
        title={`Places in ${destination.name}`}
        description="Pick one and it is appended to the selected day with its real entry fee and typical visit length."
        size="lg"
      >
        <PlaceList
          places={destination.places}
          isInternational={trip.preferences.isInternationalVisitor}
          onAdd={addPlaceToDay}
        />
      </Sheet>

      {/* ---------------------------- Edit timing -------------------------- */}
      <Sheet
        open={Boolean(editing)}
        onClose={() => setEditing(undefined)}
        title={editing?.title ?? 'Edit stop'}
        description="Change how long you spend here and what you expect it to cost."
        footer={
          <Button onClick={() => setEditing(undefined)} full>
            Done
          </Button>
        }
      >
        {editing ? (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <TextField
                label="Duration (min)"
                type="number"
                min={10}
                step={10}
                value={editing.durationMinutes}
                onChange={(event) => {
                  const durationMinutes = Number(event.target.value);
                  setEditing({ ...editing, durationMinutes });
                  updateItem(trip.id, day.id, editing.id, { durationMinutes });
                }}
              />
              <TextField
                label="Travel there (min)"
                type="number"
                min={0}
                step={5}
                value={editing.travelMinutes}
                onChange={(event) => {
                  const travelMinutes = Number(event.target.value);
                  setEditing({ ...editing, travelMinutes });
                  updateItem(trip.id, day.id, editing.id, { travelMinutes });
                }}
              />
              <TextField
                label="Cost (₹)"
                type="number"
                min={0}
                step={50}
                value={editing.estimatedCostINR}
                onChange={(event) => {
                  const estimatedCostINR = Number(event.target.value);
                  setEditing({ ...editing, estimatedCostINR });
                  updateItem(trip.id, day.id, editing.id, { estimatedCostINR });
                }}
              />
            </div>
            <p className="rounded-xl bg-surface-2 px-4 py-3 text-[13px] leading-relaxed text-ink-soft">
              <strong className="font-medium text-ink">Why it was scheduled: </strong>
              {editing.reason}
            </p>
          </div>
        ) : null}
      </Sheet>
    </div>
  );
}
