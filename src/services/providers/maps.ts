import type { GeoPoint } from '@/types';
import { PROVIDER_KEYS } from '@/services/config';
import { haversineKm } from '@/utils/misc';

export type TravelMode = 'walk' | 'auto' | 'car' | 'transit';

export interface RouteEstimate {
  distanceKm: number;
  minutes: number;
  mode: TravelMode;
  /** True when the numbers come from a routing API rather than a straight line. */
  routed: boolean;
}

export interface MapsProvider {
  readonly name: string;
  readonly interactive: boolean;
  estimateRoute(from: GeoPoint, to: GeoPoint, mode: TravelMode): Promise<RouteEstimate>;
  /** A URL that opens this point in the user's own map app — always safe. */
  externalLink(point: GeoPoint, label?: string): string;
  directionsLink(from: GeoPoint, to: GeoPoint, mode?: TravelMode): string;
}

/** Average door-to-door speeds in Indian cities, km/h, including stops. */
const SPEED_KMPH: Record<TravelMode, number> = {
  walk: 4.4,
  auto: 17,
  car: 21,
  transit: 15,
};

/** Straight-line routes under-read real road distance; this corrects for it. */
const DETOUR_FACTOR = 1.35;

/**
 * Demo maps provider. It never claims to be routing — `routed: false` tells the
 * UI to label estimates as approximate, and the map component renders a
 * schematic plot rather than pretending to be a live tile map.
 */
export class DemoMapsProvider implements MapsProvider {
  readonly name = 'Schematic map (demo)';
  readonly interactive = false;

  async estimateRoute(from: GeoPoint, to: GeoPoint, mode: TravelMode): Promise<RouteEstimate> {
    const straight = haversineKm(from, to);
    const distanceKm = straight * DETOUR_FACTOR;
    const minutes = Math.max(5, Math.round((distanceKm / SPEED_KMPH[mode]) * 60));
    return { distanceKm: Number(distanceKm.toFixed(1)), minutes, mode, routed: false };
  }

  externalLink(point: GeoPoint, label?: string): string {
    const query = label ? `${encodeURIComponent(label)}@${point.lat},${point.lng}` : `${point.lat},${point.lng}`;
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  }

  directionsLink(from: GeoPoint, to: GeoPoint, mode: TravelMode = 'car'): string {
    const travelmode = mode === 'walk' ? 'walking' : mode === 'transit' ? 'transit' : 'driving';
    return `https://www.google.com/maps/dir/?api=1&origin=${from.lat},${from.lng}&destination=${to.lat},${to.lng}&travelmode=${travelmode}`;
  }
}

export const mapsProvider: MapsProvider = new DemoMapsProvider();
export const mapsIsLive = Boolean(PROVIDER_KEYS.googleMaps);
