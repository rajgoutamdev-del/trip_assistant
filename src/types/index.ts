/**
 * Domain model for Safar. Everything the UI renders is typed here so that
 * swapping a mock provider for a live one never changes component code.
 */

/* ------------------------------- Traveller ------------------------------- */

export type TravelType = 'solo' | 'couple' | 'family' | 'friends';
export type Pace = 'relaxed' | 'balanced' | 'packed';
export type BudgetTier = 'shoestring' | 'comfort' | 'premium' | 'luxury';

export type InterestId =
  | 'heritage'
  | 'food'
  | 'nature'
  | 'beaches'
  | 'adventure'
  | 'spiritual'
  | 'nightlife'
  | 'shopping'
  | 'photography'
  | 'wellness'
  | 'wildlife'
  | 'art';

export type DietId =
  | 'no-preference'
  | 'vegetarian'
  | 'vegan'
  | 'jain'
  | 'halal'
  | 'eggetarian'
  | 'gluten-free';

export type SpiceTolerance = 'mild' | 'medium' | 'fiery';

export type ActivityId =
  | 'walking-tours'
  | 'museums'
  | 'trekking'
  | 'water-sports'
  | 'street-food-crawl'
  | 'temple-visits'
  | 'markets'
  | 'sunset-points'
  | 'wildlife-safari'
  | 'cafes'
  | 'live-music'
  | 'cooking-class';

export type StayPreference = 'hostel' | 'budget-hotel' | 'boutique' | 'resort' | 'homestay';
export type TransportPreference = 'public' | 'cab' | 'self-drive' | 'two-wheeler' | 'walk-first';
export type MobilityNeed = 'none' | 'low-walking' | 'wheelchair' | 'travelling-with-infant';

export interface TripPreferences {
  travelType: TravelType;
  travellers: number;
  budgetTotalINR: number;
  budgetTier: BudgetTier;
  pace: Pace;
  interests: InterestId[];
  diet: DietId[];
  spice: SpiceTolerance;
  activities: ActivityId[];
  stay: StayPreference;
  transport: TransportPreference;
  mobility: MobilityNeed;
  isInternationalVisitor: boolean;
  homeCurrency: string;
}

export interface Traveller {
  id: string;
  name: string;
  homeCity: string;
  isDemo: boolean;
}

/* --------------------------------- Trips --------------------------------- */

export type ItineraryItemKind =
  | 'sight'
  | 'food'
  | 'activity'
  | 'transit'
  | 'rest'
  | 'shopping'
  | 'stay';

export interface ItineraryItem {
  id: string;
  /** Minutes from local midnight, e.g. 540 = 09:00. */
  startMinutes: number;
  durationMinutes: number;
  title: string;
  kind: ItineraryItemKind;
  placeId?: string;
  area?: string;
  estimatedCostINR: number;
  /** Travel time from the previous item, in minutes. */
  travelMinutes: number;
  /** Plain-language explanation of why the planner picked this. */
  reason: string;
  bookingRequired?: boolean;
}

export interface ItineraryDay {
  id: string;
  dayNumber: number;
  /** ISO date (yyyy-mm-dd). */
  date: string;
  title: string;
  summary: string;
  items: ItineraryItem[];
}

export type ExpenseCategory =
  | 'accommodation'
  | 'food'
  | 'transport'
  | 'activities'
  | 'shopping'
  | 'other';

export interface Expense {
  id: string;
  category: ExpenseCategory;
  label: string;
  amountINR: number;
  /** ISO date. */
  date: string;
}

export interface PackingItem {
  id: string;
  label: string;
  category: 'documents' | 'clothing' | 'footwear' | 'health' | 'tech' | 'weather' | 'activity';
  reason: string;
  essential: boolean;
  checked: boolean;
}

export interface Trip {
  id: string;
  destinationId: string;
  originCity: string;
  /** ISO dates. */
  startDate: string;
  endDate: string;
  preferences: TripPreferences;
  itinerary: ItineraryDay[];
  expenses: Expense[];
  packing: PackingItem[];
  budgetPlan: BudgetPlan;
  createdAt: string;
}

export interface BudgetPlan {
  totalINR: number;
  allocations: Record<ExpenseCategory, number>;
}

/* ----------------------------- Destinations ------------------------------ */

export type CrowdLevel = 'quiet' | 'moderate' | 'busy' | 'packed';
export type TimeOfDay = 'sunrise' | 'morning' | 'midday' | 'afternoon' | 'sunset' | 'night';

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Place {
  id: string;
  name: string;
  category: 'fort' | 'palace' | 'temple' | 'beach' | 'museum' | 'market' | 'nature' | 'viewpoint' | 'neighbourhood' | 'wildlife';
  area: string;
  blurb: string;
  typicalVisitMinutes: number;
  entryFeeINR: { indian: number; foreign: number };
  coords: GeoPoint;
  bestTime: TimeOfDay[];
  interests: InterestId[];
  crowdPattern: Partial<Record<TimeOfDay, CrowdLevel>>;
  openingHours?: string;
  accessibilityNote?: string;
}

export interface Dish {
  id: string;
  name: string;
  localName?: string;
  description: string;
  whereToTry: string[];
  approxPriceINR: number;
  diet: Exclude<DietId, 'no-preference'>[];
  isVegetarian: boolean;
  spice: SpiceTolerance;
  culturalNote: string;
  mealTime: ('breakfast' | 'lunch' | 'snack' | 'dinner')[];
  mustTry: boolean;
}

export interface PhotoSpot {
  id: string;
  name: string;
  area: string;
  bestTime: TimeOfDay[];
  shotType: ('landscape' | 'portrait' | 'architecture' | 'street' | 'wildlife' | 'night')[];
  popularity: 'hidden-gem' | 'known' | 'iconic';
  tip: string;
  coords: GeoPoint;
  permitNote?: string;
}

export interface StayArea {
  id: string;
  name: string;
  vibe: string;
  suitsFor: StayPreference[];
  nightlyRangeINR: [number, number];
  pros: string[];
  cons: string[];
}

export interface ParkingSpot {
  id: string;
  name: string;
  near: string;
  type: 'paid-lot' | 'street' | 'mall' | 'authorised-valet';
  approxRateINR: string;
  coords: GeoPoint;
  note: string;
}

export interface EmergencyService {
  id: string;
  name: string;
  kind: 'hospital' | 'police' | 'pharmacy' | 'atm' | 'grocery' | 'restroom' | 'tourist-help';
  area: string;
  coords: GeoPoint;
  open24h: boolean;
  /** Published landline/helpline, where one is part of the public record. */
  phone?: string;
  note?: string;
}

export interface SafetyGuidance {
  overall: 'generally-safe' | 'stay-alert' | 'extra-care';
  summary: string;
  tips: { id: string; title: string; detail: string; severity: 'info' | 'caution' | 'avoid' }[];
  culturalNorms: { id: string; title: string; detail: string }[];
  avoidAreas: { id: string; name: string; when: string; why: string }[];
  nightGuidance: string[];
  soloWomenNotes: string[];
}

export interface Phrase {
  id: string;
  category: 'greetings' | 'food' | 'transport' | 'shopping' | 'emergency' | 'smalltalk';
  english: string;
  script: string;
  roman: string;
}

export interface LanguagePack {
  language: string;
  nativeName: string;
  phrases: Phrase[];
}

export interface MonthNote {
  month: number;
  label: string;
  rating: 'ideal' | 'good' | 'mixed' | 'avoid';
  note: string;
  avgHighC: number;
  avgLowC: number;
}

export interface Destination {
  id: string;
  name: string;
  state: string;
  tagline: string;
  summary: string;
  heroImage: string;
  thumbnail: string;
  coords: GeoPoint;
  /** Rough map bounds used by the schematic map component. */
  bounds: { north: number; south: number; east: number; west: number };
  idealDays: [number, number];
  interests: InterestId[];
  languages: string[];
  currency: 'INR';
  dailyBudgetINR: Record<BudgetTier, number>;
  bestMonths: number[];
  monthNotes: MonthNote[];
  climateSummary: string;
  crowdLevel: CrowdLevel;
  gettingThere: string;
  localTransport: string;
  places: Place[];
  dishes: Dish[];
  photoSpots: PhotoSpot[];
  stayAreas: StayArea[];
  parking: ParkingSpot[];
  emergency: EmergencyService[];
  safety: SafetyGuidance;
  languagePacks: LanguagePack[];
  packingHints: string[];
  nightLife: { id: string; name: string; kind: 'food' | 'transport' | 'service' | 'experience'; detail: string; openTill: string }[];
  visaNotes: string[];
}

/* -------------------------------- Weather -------------------------------- */

export type WeatherCondition =
  | 'clear'
  | 'partly-cloudy'
  | 'cloudy'
  | 'rain'
  | 'heavy-rain'
  | 'thunderstorm'
  | 'haze'
  | 'snow'
  | 'fog';

export interface CurrentWeather {
  tempC: number;
  feelsLikeC: number;
  condition: WeatherCondition;
  label: string;
  humidity: number;
  windKph: number;
  rainChance: number;
  uvIndex: number;
  sunrise: string;
  sunset: string;
}

export interface ForecastDay {
  date: string;
  highC: number;
  lowC: number;
  condition: WeatherCondition;
  rainChance: number;
  label: string;
}

/* ------------------------- Provider plumbing types ------------------------ */

export type DataSource = 'live' | 'demo';

/**
 * Every provider returns data wrapped in an envelope so the UI can always be
 * honest about where a number came from. Demo data is never shown as live.
 */
export interface DataEnvelope<T> {
  data: T;
  source: DataSource;
  provider: string;
  fetchedAt: string;
  note?: string;
}

export interface StayOption {
  id: string;
  name: string;
  area: string;
  kind: StayPreference;
  nightlyFromINR: number;
  rating: number;
  highlights: string[];
}

export interface CurrencyRate {
  base: string;
  quote: string;
  rate: number;
}

export interface TravelVideo {
  id: string;
  title: string;
  channel: string;
  durationLabel: string;
  url: string;
  topic: string;
}
