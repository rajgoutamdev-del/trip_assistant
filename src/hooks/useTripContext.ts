import { useOutletContext } from 'react-router-dom';
import type { Destination, Trip } from '@/types';

export interface TripRouteContext {
  trip: Trip;
  destination: Destination;
}

/** Typed access to the trip + destination that <TripLayout> resolved. */
export const useTripContext = (): TripRouteContext => useOutletContext<TripRouteContext>();
