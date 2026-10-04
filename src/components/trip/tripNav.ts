import {
  AlertTriangle, BackpackIcon, Banknote, Camera, CloudSun, Languages,
  LifeBuoy, Map, ShieldCheck, UtensilsCrossed, BedDouble,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface TripModule {
  slug: string;
  label: string;
  short: string;
  icon: LucideIcon;
  description: string;
}

export const TRIP_MODULES: TripModule[] = [
  { slug: 'itinerary', label: 'Itinerary', short: 'Plan', icon: Map, description: 'Your day-by-day plan, editable' },
  { slug: 'budget', label: 'Budget', short: 'Budget', icon: Banknote, description: 'Allocation, spending and alerts' },
  { slug: 'weather', label: 'Weather', short: 'Weather', icon: CloudSun, description: 'Conditions and activity fit' },
  { slug: 'food', label: 'Food & culture', short: 'Food', icon: UtensilsCrossed, description: 'Dishes, where to try, etiquette' },
  { slug: 'safety', label: 'Safety centre', short: 'Safety', icon: ShieldCheck, description: 'Tips, norms, areas to avoid' },
  { slug: 'packing', label: 'Packing', short: 'Packing', icon: BackpackIcon, description: 'Checklist built from your trip' },
  { slug: 'photos', label: 'Photo spots', short: 'Photos', icon: Camera, description: 'Where and when to shoot' },
  { slug: 'language', label: 'Language', short: 'Phrases', icon: Languages, description: 'Phrases you will actually use' },
  { slug: 'stays', label: 'Stays & parking', short: 'Stays', icon: BedDouble, description: 'Neighbourhoods and parking' },
  { slug: 'emergency', label: 'Nearby help', short: 'Help', icon: LifeBuoy, description: 'Hospitals, police, ATMs, pharmacies' },
  { slug: 'night', label: 'Night mode', short: 'Night', icon: AlertTriangle, description: 'After-dark guidance for this city' },
];

export const tripPath = (tripId: string, slug?: string): string =>
  slug ? `/trip/${tripId}/${slug}` : `/trip/${tripId}`;
