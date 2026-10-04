import { useTripContext } from '@/hooks/useTripContext';
import { NearbyHelp } from '@/components/destination/NearbyHelp';
import { SectionTitle } from '@/components/ui/Card';
import { ComingSoon } from '@/components/ui/States';

export default function EmergencyPage() {
  const { destination } = useTripContext();

  return (
    <div className="mx-auto max-w-5xl px-4 py-7 sm:px-6 sm:py-9">
      <SectionTitle
        eyebrow="Nearby help"
        title="Hospitals, police, pharmacies, ATMs"
        description={`Reachable from any screen via the Help button. Helpline numbers are national and published; facility listings for ${destination.name} are a curated sample.`}
      />

      <NearbyHelp destination={destination} />

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <ComingSoon
          title="Live results around you"
          description="A PlacesProvider interface already drives this screen. With a Places API key and the browser location permission, these lists become live results sorted by road distance from where you are standing."
        />
        <ComingSoon
          title="One-tap emergency assist"
          description="Sharing your live location with a chosen contact or an emergency service needs consent flows, a backend and local regulatory review. The UI entry point is the Help button; the capability is deliberately not faked."
        />
      </div>
    </div>
  );
}
