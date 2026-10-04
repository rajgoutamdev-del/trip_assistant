import { useState } from 'react';
import { Check, Download, Trash2, X } from 'lucide-react';
import { INTEGRATIONS, isLive } from '@/services/config';
import { travelAssistant } from '@/services/assistant/travelAssistant';
import { useTripStore } from '@/store/tripStore';
import { useTheme, type ThemeChoice } from '@/store/ThemeProvider';
import { Card, CardHeader, SectionTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Segmented } from '@/components/ui/Segmented';
import { TextField } from '@/components/ui/Field';
import { Sheet } from '@/components/ui/Sheet';
import { getDestination } from '@/data/destinations';
import { formatDateRange } from '@/utils/format';

const THEME_OPTIONS: { id: ThemeChoice; label: string }[] = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'system', label: 'System' },
];

export default function SettingsPage() {
  const { traveller, updateTraveller, trips, deleteTrip, nightMode, setNightMode } = useTripStore();
  const { choice, setChoice } = useTheme();
  const [confirmReset, setConfirmReset] = useState(false);

  const exportTrips = () => {
    const blob = new Blob([JSON.stringify({ traveller, trips }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'safar-trips.json';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const resetEverything = () => {
    trips.forEach((trip) => deleteTrip(trip.id));
    setConfirmReset(false);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-7 sm:px-6 sm:py-9">
      <SectionTitle
        eyebrow="Settings"
        as="h1"
        title="Your session and integrations"
        description="This build runs on a demo session with no account. Everything you create is stored in this browser."
      />

      <div className="space-y-6">
        <Card>
          <CardHeader title="You" subtitle="Used for the greeting and as the default origin city" />
          <div className="grid gap-4 px-5 pb-5 pt-4 sm:grid-cols-2">
            <TextField
              label="Name"
              value={traveller.isDemo ? '' : traveller.name}
              placeholder="Traveller"
              onChange={(event) => updateTraveller({ name: event.target.value || 'Traveller', isDemo: false })}
            />
            <TextField
              label="Home city"
              value={traveller.homeCity}
              onChange={(event) => updateTraveller({ homeCity: event.target.value })}
            />
          </div>
          <p className="px-5 pb-5 text-[12.5px] leading-relaxed text-ink-faint">
            Authentication is deliberately out of scope for the MVP. The traveller object has the same shape a real
            signed-in user would, so adding sign-in later means changing where it comes from and nothing else.
          </p>
        </Card>

        <Card>
          <CardHeader title="Appearance" subtitle="Dark mode is a full theme, not an inverted filter" />
          <div className="flex flex-wrap items-center justify-between gap-4 px-5 pb-5 pt-4">
            <Segmented value={choice} options={THEME_OPTIONS} onChange={setChoice} label="Theme" />
            <label className="flex items-center gap-2.5 text-[14px] text-ink-soft">
              <input
                type="checkbox"
                checked={nightMode}
                onChange={(event) => setNightMode(event.target.checked)}
                className="h-4 w-4 accent-saffron"
              />
              Night travel mode
            </label>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Integrations"
            subtitle="Every provider has a working demo implementation. Add a key to go live."
          />
          <ul className="divide-y divide-line px-5 pb-4">
            {INTEGRATIONS.map((integration) => {
              const live = isLive(integration.provider);
              return (
                <li key={integration.provider} className="py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[14.5px] font-medium text-ink">{integration.title}</p>
                        <Badge tone={live ? 'jade' : 'warn'} icon={live ? <Check size={10} /> : <X size={10} />}>
                          {live ? 'Live' : 'Demo data'}
                        </Badge>
                      </div>
                      <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">{integration.description}</p>
                      {!live ? (
                        <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-faint">
                          <strong className="font-medium">Currently:</strong> {integration.fallback}
                        </p>
                      ) : null}
                    </div>
                    <code className="shrink-0 rounded-lg bg-surface-2 px-2 py-1 text-[11.5px] text-ink-faint">
                      {integration.envVar}
                    </code>
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="px-5 pb-5 text-[12.5px] leading-relaxed text-ink-faint">
            Copy <code className="rounded bg-surface-2 px-1 py-0.5">.env.example</code> to{' '}
            <code className="rounded bg-surface-2 px-1 py-0.5">.env.local</code>, add any keys you have, and restart
            the dev server. The assistant currently runs as{' '}
            <strong className="text-ink">{travelAssistant.name}</strong>.
          </p>
        </Card>

        <Card>
          <CardHeader title="Your data" subtitle={`${trips.length} ${trips.length === 1 ? 'trip' : 'trips'} in this browser`} />
          {trips.length ? (
            <ul className="divide-y divide-line px-5">
              {trips.map((trip) => {
                const destination = getDestination(trip.destinationId);
                return (
                  <li key={trip.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-medium text-ink">{destination?.name ?? trip.destinationId}</p>
                      <p className="mt-0.5 text-[12px] text-ink-faint">
                        {formatDateRange(trip.startDate, trip.endDate)} · {trip.expenses.length} expenses
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTrip(trip.id)}
                      aria-label={`Delete ${destination?.name ?? 'trip'}`}
                      className="text-ink-faint hover:bg-danger-soft hover:text-danger"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="px-5 text-[13.5px] text-ink-faint">No trips saved yet.</p>
          )}
          <div className="flex flex-wrap gap-2 px-5 pb-5 pt-4">
            <Button variant="outline" size="sm" onClick={exportTrips} disabled={!trips.length}>
              <Download size={14} /> Export as JSON
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmReset(true)}
              disabled={!trips.length}
              className="text-danger hover:bg-danger-soft"
            >
              <Trash2 size={14} /> Delete all trips
            </Button>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-display text-[17px]">How data honesty works here</h3>
          <ul className="mt-3 space-y-2 text-[13.5px] leading-relaxed text-ink-soft">
            <li>
              Every provider returns an envelope carrying <code className="rounded bg-surface-2 px-1">source</code>,
              the provider name and a note. The UI renders that, so sample data is always labelled.
            </li>
            <li>
              Weather is modelled from published monthly climate averages per destination — never presented as a
              forecast.
            </li>
            <li>
              Facility directories name real, well-known institutions, ordered by straight-line distance. They are not
              live search results.
            </li>
            <li>
              Exchange rates are indicative and carry the date they were recorded. Crowd levels are typical patterns,
              not live counts.
            </li>
            <li>India’s national emergency helplines are the one category stated as fact, because they are published and stable.</li>
          </ul>
        </Card>
      </div>

      <Sheet
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Delete all trips?"
        description="This clears every trip, expense and packing list stored in this browser. It cannot be undone."
        size="sm"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setConfirmReset(false)} full>
              Keep them
            </Button>
            <Button variant="danger" onClick={resetEverything} full>
              Delete everything
            </Button>
          </div>
        }
      >
        <p className="text-[14px] leading-relaxed text-ink-soft">
          Export your trips first if you want a copy — the export is a plain JSON file.
        </p>
      </Sheet>
    </div>
  );
}
