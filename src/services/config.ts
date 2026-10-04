/**
 * Single place that decides whether a real provider is available.
 *
 * The app is designed to run with no keys at all: every provider has a demo
 * implementation, and the UI states clearly when data is demo rather than live.
 */
// Guarded so the planner self-checks can import this module outside Vite.
const env: Record<string, string | undefined> =
  (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};

const read = (key: string): string | undefined => {
  const value = env[key];
  return value && value.trim() ? value.trim() : undefined;
};

export const PROVIDER_KEYS = {
  openWeather: read('VITE_OPENWEATHER_API_KEY'),
  googleMaps: read('VITE_GOOGLE_MAPS_API_KEY'),
  googlePlaces: read('VITE_GOOGLE_PLACES_API_KEY'),
  exchangeRate: read('VITE_EXCHANGERATE_API_KEY'),
  youtube: read('VITE_YOUTUBE_API_KEY'),
  hotels: read('VITE_HOTEL_API_KEY'),
  assistantProxy: read('VITE_ANTHROPIC_PROXY_URL'),
} as const;

export type ProviderName = keyof typeof PROVIDER_KEYS;

export function isLive(provider: ProviderName): boolean {
  return Boolean(PROVIDER_KEYS[provider]);
}

/** Used by the Settings page to show integration status honestly. */
export const INTEGRATIONS: {
  provider: ProviderName;
  title: string;
  envVar: string;
  description: string;
  fallback: string;
}[] = [
  {
    provider: 'openWeather',
    title: 'Weather',
    envVar: 'VITE_OPENWEATHER_API_KEY',
    description: 'Current conditions and a multi-day forecast for the destination.',
    fallback: 'Climate averages for the destination and month, modelled locally.',
  },
  {
    provider: 'googleMaps',
    title: 'Maps',
    envVar: 'VITE_GOOGLE_MAPS_API_KEY',
    description: 'Interactive maps, routing and travel-time estimates.',
    fallback: 'A schematic coordinate map plus straight-line distance estimates.',
  },
  {
    provider: 'googlePlaces',
    title: 'Places & nearby help',
    envVar: 'VITE_GOOGLE_PLACES_API_KEY',
    description: 'Live hospital, pharmacy, ATM and police listings around your position.',
    fallback: 'A curated directory of well-known facilities per destination.',
  },
  {
    provider: 'exchangeRate',
    title: 'Currency',
    envVar: 'VITE_EXCHANGERATE_API_KEY',
    description: 'Live foreign-exchange rates for the currency converter.',
    fallback: 'Indicative reference rates with the date they were recorded.',
  },
  {
    provider: 'youtube',
    title: 'Travel content',
    envVar: 'VITE_YOUTUBE_API_KEY',
    description: 'Ranked destination videos from the YouTube Data API.',
    fallback: 'Pre-built YouTube search links per destination and topic.',
  },
  {
    provider: 'hotels',
    title: 'Stays & booking',
    envVar: 'VITE_HOTEL_API_KEY',
    description: 'Live availability and nightly rates from a booking provider.',
    fallback: 'Neighbourhood guidance with typical price bands, no live rates.',
  },
  {
    provider: 'assistantProxy',
    title: 'AI assistant',
    envVar: 'VITE_ANTHROPIC_PROXY_URL',
    description: 'Natural-language trip questions answered by a model through your own proxy.',
    fallback: 'A deterministic planner and rules engine — no model required.',
  },
];
