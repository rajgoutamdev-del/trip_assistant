import type {
  ActivityId, BudgetTier, DietId, InterestId, MobilityNeed, Pace,
  StayPreference, TransportPreference, TravelType,
} from '@/types';

export interface Option<T extends string> {
  id: T;
  label: string;
  hint?: string;
  emoji?: string;
}

export const TRAVEL_TYPES: Option<TravelType>[] = [
  { id: 'solo', label: 'Solo', hint: 'Flexible, social, safety-first planning', emoji: '🧍' },
  { id: 'couple', label: 'Couple', hint: 'Slower mornings, better dinners', emoji: '💞' },
  { id: 'family', label: 'Family', hint: 'Shorter days, fewer transfers, rest built in', emoji: '👨‍👩‍👧' },
  { id: 'friends', label: 'Friends', hint: 'Late nights and more activities per day', emoji: '🎉' },
];

export const PACES: Option<Pace>[] = [
  { id: 'relaxed', label: 'Relaxed', hint: '2–3 stops a day, long meals' },
  { id: 'balanced', label: 'Balanced', hint: '3–4 stops with real breaks' },
  { id: 'packed', label: 'Packed', hint: '5+ stops, early starts' },
];

export const BUDGET_TIERS: Option<BudgetTier>[] = [
  { id: 'shoestring', label: 'Shoestring', hint: 'Hostels, buses, street food' },
  { id: 'comfort', label: 'Comfort', hint: 'Mid hotels, cabs, sit-down meals' },
  { id: 'premium', label: 'Premium', hint: 'Boutique stays, private transport' },
  { id: 'luxury', label: 'Luxury', hint: 'Heritage hotels, guides, fine dining' },
];

export const INTERESTS: Option<InterestId>[] = [
  { id: 'heritage', label: 'Heritage & history', emoji: '🏛' },
  { id: 'food', label: 'Food & markets', emoji: '🍛' },
  { id: 'nature', label: 'Nature & landscapes', emoji: '🌄' },
  { id: 'beaches', label: 'Beaches & water', emoji: '🏝' },
  { id: 'adventure', label: 'Adventure & trekking', emoji: '🥾' },
  { id: 'spiritual', label: 'Temples & spirituality', emoji: '🕉' },
  { id: 'nightlife', label: 'Nightlife', emoji: '🌃' },
  { id: 'shopping', label: 'Shopping & crafts', emoji: '🧵' },
  { id: 'photography', label: 'Photography', emoji: '📷' },
  { id: 'wellness', label: 'Wellness & slow travel', emoji: '🧘' },
  { id: 'wildlife', label: 'Wildlife', emoji: '🐅' },
  { id: 'art', label: 'Art & museums', emoji: '🎨' },
];

export const DIETS: Option<DietId>[] = [
  { id: 'no-preference', label: 'No restrictions' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'eggetarian', label: 'Eggetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'jain', label: 'Jain' },
  { id: 'halal', label: 'Halal' },
  { id: 'gluten-free', label: 'Gluten-free' },
];

export const ACTIVITIES: Option<ActivityId>[] = [
  { id: 'walking-tours', label: 'Walking tours' },
  { id: 'museums', label: 'Museums & galleries' },
  { id: 'trekking', label: 'Trekking & hikes' },
  { id: 'water-sports', label: 'Water sports' },
  { id: 'street-food-crawl', label: 'Street-food crawls' },
  { id: 'temple-visits', label: 'Temple & shrine visits' },
  { id: 'markets', label: 'Local markets' },
  { id: 'sunset-points', label: 'Sunset & viewpoints' },
  { id: 'wildlife-safari', label: 'Wildlife safari' },
  { id: 'cafes', label: 'Cafés & slow mornings' },
  { id: 'live-music', label: 'Live music' },
  { id: 'cooking-class', label: 'Cooking classes' },
];

export const STAY_PREFERENCES: Option<StayPreference>[] = [
  { id: 'hostel', label: 'Hostel / dorm', hint: 'Social, cheapest' },
  { id: 'budget-hotel', label: 'Budget hotel', hint: 'Private room, no frills' },
  { id: 'boutique', label: 'Boutique / heritage', hint: 'Character over facilities' },
  { id: 'resort', label: 'Resort', hint: 'Pool, grounds, full service' },
  { id: 'homestay', label: 'Homestay', hint: 'Local hosts, home food' },
];

export const TRANSPORT_PREFERENCES: Option<TransportPreference>[] = [
  { id: 'public', label: 'Public transport', hint: 'Metro, buses, trains' },
  { id: 'cab', label: 'Cabs & autos', hint: 'App-booked, door to door' },
  { id: 'self-drive', label: 'Self-drive car', hint: 'Freedom, needs a licence' },
  { id: 'two-wheeler', label: 'Scooter / bike', hint: 'Best for Goa and hill roads' },
  { id: 'walk-first', label: 'Walk wherever possible', hint: 'Dense, compact plans' },
];

export const MOBILITY_NEEDS: Option<MobilityNeed>[] = [
  { id: 'none', label: 'No constraints' },
  { id: 'low-walking', label: 'Limited walking', hint: 'Keep days short, fewer steps' },
  { id: 'wheelchair', label: 'Wheelchair access needed' },
  { id: 'travelling-with-infant', label: 'Travelling with an infant' },
];

export const HOME_CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'AUD', 'SGD', 'CAD', 'JPY'];

export const SPICE_LEVELS = [
  { id: 'mild' as const, label: 'Mild', hint: 'Little to no chilli' },
  { id: 'medium' as const, label: 'Medium', hint: 'Standard Indian heat' },
  { id: 'fiery' as const, label: 'Fiery', hint: 'Bring on the thecha' },
];

export const INTEREST_LABELS: Record<InterestId, string> = Object.fromEntries(
  INTERESTS.map((i) => [i.id, i.label]),
) as Record<InterestId, string>;
