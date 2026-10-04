import { useTripContext } from '@/hooks/useTripContext';
import { PhotoSpotList } from '@/components/destination/panels';
import { SchematicMap } from '@/components/map/SchematicMap';
import { SectionTitle } from '@/components/ui/Card';

export default function PhotosPage() {
  const { destination } = useTripContext();

  return (
    <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-9">
      <SectionTitle
        eyebrow="Photography"
        title={`Where to shoot in ${destination.name}`}
        description="Each spot carries the hour the light works, how known it is, and whether a permit applies."
      />

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr] [&>*]:min-w-0">
        <PhotoSpotList spots={destination.photoSpots} />
        <div className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="mb-2.5 text-[12px] font-semibold uppercase tracking-[0.1em] text-ink-faint">
            Spread across the city
          </h2>
          <SchematicMap
            height={340}
            points={destination.photoSpots.map((spot) => ({
              id: spot.id,
              label: spot.name,
              coords: spot.coords,
              sublabel: `${spot.area} · best at ${spot.bestTime.join('/')}`,
              tone: 'saffron',
            }))}
          />
          <p className="mt-3 text-[12.5px] leading-relaxed text-ink-faint">
            Sunrise and sunset times shift by about an hour across the year. Check the weather screen for the exact
            times on your dates.
          </p>
        </div>
      </div>
    </div>
  );
}
