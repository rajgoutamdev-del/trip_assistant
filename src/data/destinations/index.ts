import type { Destination } from '@/types';
import { goa } from './goa';
import { mumbai } from './mumbai';
import { pune } from './pune';
import { jaipur } from './jaipur';
import { delhi } from './delhi';
import { kerala } from './kerala';
import { manali } from './manali';
import { varanasi } from './varanasi';

/**
 * Demo destination catalogue. Everything here is hand-written editorial content
 * compiled for the prototype — it is not fetched live, and the UI labels it so.
 */
export const DESTINATIONS: Destination[] = [jaipur, goa, kerala, mumbai, delhi, varanasi, manali, pune];

const BY_ID = new Map(DESTINATIONS.map((d) => [d.id, d]));

export function getDestination(id: string | undefined): Destination | undefined {
  return id ? BY_ID.get(id) : undefined;
}

export function findDestinationByName(query: string): Destination | undefined {
  const q = query.trim().toLowerCase();
  if (!q) return undefined;
  return (
    DESTINATIONS.find((d) => d.id === q || d.name.toLowerCase() === q) ??
    DESTINATIONS.find((d) => d.name.toLowerCase().startsWith(q)) ??
    DESTINATIONS.find((d) => d.name.toLowerCase().includes(q) || d.state.toLowerCase().includes(q))
  );
}

/** Cities travellers commonly start from — used for the origin field in onboarding. */
export const ORIGIN_CITIES = [
  'Mumbai', 'Delhi', 'Bengaluru', 'Pune', 'Hyderabad', 'Chennai', 'Kolkata',
  'Ahmedabad', 'Jaipur', 'Kochi', 'Chandigarh', 'Lucknow', 'Indore', 'Nagpur',
  'London', 'New York', 'Dubai', 'Singapore', 'Sydney', 'Toronto', 'Berlin', 'Tokyo',
];
