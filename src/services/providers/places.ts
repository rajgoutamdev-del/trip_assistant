import type {
  DataEnvelope, Destination, EmergencyService, GeoPoint, ParkingSpot, Place, TimeOfDay,
} from '@/types';
import { haversineKm } from '@/utils/misc';

export interface NearbyQuery {
  destination: Destination;
  kinds?: EmergencyService['kind'][];
  near?: GeoPoint;
  limit?: number;
}

export interface PlacesProvider {
  readonly name: string;
  listAttractions(destination: Destination): Promise<DataEnvelope<Place[]>>;
  findNearbyHelp(query: NearbyQuery): Promise<DataEnvelope<(EmergencyService & { distanceKm: number })[]>>;
  findParking(destination: Destination, near?: GeoPoint): Promise<DataEnvelope<(ParkingSpot & { distanceKm: number })[]>>;
}

const TIME_LABELS: Record<TimeOfDay, string> = {
  sunrise: 'before 8am',
  morning: '8–11am',
  midday: '11am–2pm',
  afternoon: '2–5pm',
  sunset: '5–7pm',
  night: 'after 7pm',
};

export const timeOfDayLabel = (time: TimeOfDay): string => TIME_LABELS[time];

/**
 * Demo places provider. Reads the curated per-destination directory shipped
 * with the app. Distances are straight-line, which the UI states.
 */
export class DemoPlacesProvider implements PlacesProvider {
  readonly name = 'Curated destination directory (demo)';

  async listAttractions(destination: Destination): Promise<DataEnvelope<Place[]>> {
    return {
      data: destination.places,
      source: 'demo',
      provider: this.name,
      fetchedAt: new Date().toISOString(),
      note: 'Editorial list compiled for this prototype.',
    };
  }

  async findNearbyHelp({ destination, kinds, near, limit = 20 }: NearbyQuery) {
    const origin = near ?? destination.coords;
    const data = destination.emergency
      .filter((service) => !kinds?.length || kinds.includes(service.kind))
      .map((service) => ({ ...service, distanceKm: haversineKm(origin, service.coords) }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, limit);

    return {
      data,
      source: 'demo' as const,
      provider: this.name,
      fetchedAt: new Date().toISOString(),
      note: 'A curated directory of well-known facilities, ordered by straight-line distance. Not live availability — always call ahead or dial 112.',
    };
  }

  async findParking(destination: Destination, near?: GeoPoint) {
    const origin = near ?? destination.coords;
    return {
      data: destination.parking
        .map((spot) => ({ ...spot, distanceKm: haversineKm(origin, spot.coords) }))
        .sort((a, b) => a.distanceKm - b.distanceKm),
      source: 'demo' as const,
      provider: this.name,
      fetchedAt: new Date().toISOString(),
      note: 'Known parking locations with typical published rates. Live occupancy needs a parking data provider.',
    };
  }
}

export const placesProvider: PlacesProvider = new DemoPlacesProvider();
