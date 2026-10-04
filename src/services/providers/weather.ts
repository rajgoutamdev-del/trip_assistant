import type {
  CurrentWeather, DataEnvelope, Destination, ForecastDay, WeatherCondition,
} from '@/types';
import { PROVIDER_KEYS } from '@/services/config';
import { addDays, monthOf, todayISO } from '@/utils/dates';
import { clamp, seededInt, seededRandom } from '@/utils/misc';

export interface WeatherProvider {
  readonly name: string;
  getCurrentWeather(destination: Destination, dateISO?: string): Promise<DataEnvelope<CurrentWeather>>;
  getForecast(destination: Destination, startISO: string, days: number): Promise<DataEnvelope<ForecastDay[]>>;
}

const CONDITION_LABELS: Record<WeatherCondition, string> = {
  clear: 'Clear sky',
  'partly-cloudy': 'Partly cloudy',
  cloudy: 'Overcast',
  rain: 'Light rain',
  'heavy-rain': 'Heavy rain',
  thunderstorm: 'Thunderstorms',
  haze: 'Hazy',
  snow: 'Snow',
  fog: 'Fog',
};

/**
 * Picks a plausible condition from the destination's own climate table for that
 * month. This is modelled from published monthly averages — not a forecast.
 */
function conditionForMonth(destination: Destination, month: number, seed: string): WeatherCondition {
  const note = destination.monthNotes[month - 1];
  const roll = seededRandom(seed);
  const monsoon = note.rating === 'avoid' && note.note.toLowerCase().includes('rain');
  const rainy = /rain|monsoon|wet/i.test(note.note);
  const cold = note.avgLowC <= 2;

  if (cold && roll > 0.7) return 'snow';
  if (monsoon) return roll > 0.45 ? 'heavy-rain' : 'thunderstorm';
  if (rainy) return roll > 0.6 ? 'rain' : 'cloudy';
  if (destination.id === 'delhi' && (month === 12 || month === 1)) return roll > 0.5 ? 'fog' : 'haze';
  if (note.avgHighC >= 38) return roll > 0.6 ? 'haze' : 'clear';
  if (roll > 0.62) return 'clear';
  if (roll > 0.25) return 'partly-cloudy';
  return 'cloudy';
}

const RAIN_CHANCE: Record<WeatherCondition, [number, number]> = {
  clear: [0, 8],
  'partly-cloudy': [5, 20],
  cloudy: [15, 40],
  rain: [45, 70],
  'heavy-rain': [75, 95],
  thunderstorm: [60, 90],
  haze: [0, 10],
  snow: [40, 70],
  fog: [5, 20],
};

/**
 * Demo weather provider. It derives numbers from each destination's published
 * monthly climate averages with a stable per-day jitter, so the UI looks real
 * without pretending to be a live forecast.
 */
export class DemoWeatherProvider implements WeatherProvider {
  readonly name = 'Climate averages (demo)';

  async getCurrentWeather(destination: Destination, dateISO = todayISO()): Promise<DataEnvelope<CurrentWeather>> {
    const month = monthOf(dateISO);
    const note = destination.monthNotes[month - 1];
    const seed = `${destination.id}:${dateISO}`;
    const condition = conditionForMonth(destination, month, seed);
    const [rainLow, rainHigh] = RAIN_CHANCE[condition];
    const spread = note.avgHighC - note.avgLowC;
    const tempC = Math.round(note.avgLowC + spread * (0.55 + seededRandom(`${seed}:t`) * 0.35));
    const humidity = seededInt(`${seed}:h`, condition === 'clear' ? 28 : 55, condition === 'heavy-rain' ? 95 : 80);

    return {
      data: {
        tempC,
        feelsLikeC: Math.round(tempC + (humidity > 70 ? 2 : -1)),
        condition,
        label: CONDITION_LABELS[condition],
        humidity,
        windKph: seededInt(`${seed}:w`, 4, 24),
        rainChance: seededInt(`${seed}:r`, rainLow, rainHigh),
        uvIndex: clamp(seededInt(`${seed}:u`, 2, 11) - (condition === 'cloudy' ? 3 : 0), 1, 11),
        sunrise: destination.coords.lat > 25 ? '06:20' : '06:35',
        sunset: destination.coords.lat > 25 ? '18:10' : '18:30',
      },
      source: 'demo',
      provider: this.name,
      fetchedAt: new Date().toISOString(),
      note: `Modelled from ${destination.name}'s published ${note.label} averages. Not a live forecast.`,
    };
  }

  async getForecast(destination: Destination, startISO: string, days: number): Promise<DataEnvelope<ForecastDay[]>> {
    const data: ForecastDay[] = Array.from({ length: days }, (_, i) => {
      const date = addDays(startISO, i);
      const note = destination.monthNotes[monthOf(date) - 1];
      const seed = `${destination.id}:${date}:f`;
      const condition = conditionForMonth(destination, monthOf(date), seed);
      const [rainLow, rainHigh] = RAIN_CHANCE[condition];
      return {
        date,
        highC: note.avgHighC + seededInt(`${seed}:hi`, -2, 2),
        lowC: note.avgLowC + seededInt(`${seed}:lo`, -2, 2),
        condition,
        rainChance: seededInt(`${seed}:r`, rainLow, rainHigh),
        label: CONDITION_LABELS[condition],
      };
    });

    return {
      data,
      source: 'demo',
      provider: this.name,
      fetchedAt: new Date().toISOString(),
      note: 'Derived from monthly climate averages for each date. Connect a weather API for a real forecast.',
    };
  }
}

const OPENWEATHER_CONDITIONS: Record<string, WeatherCondition> = {
  Clear: 'clear',
  Clouds: 'partly-cloudy',
  Rain: 'rain',
  Drizzle: 'rain',
  Thunderstorm: 'thunderstorm',
  Snow: 'snow',
  Mist: 'fog',
  Fog: 'fog',
  Haze: 'haze',
  Smoke: 'haze',
  Dust: 'haze',
};

/**
 * Live implementation. Only constructed when VITE_OPENWEATHER_API_KEY is set;
 * any failure is surfaced to the caller so the UI can fall back and say so.
 */
export class OpenWeatherProvider implements WeatherProvider {
  readonly name = 'OpenWeather';

  constructor(private readonly apiKey: string, private readonly fallback: WeatherProvider) {}

  private url(path: string, destination: Destination): string {
    const { lat, lng } = destination.coords;
    return `https://api.openweathermap.org/data/2.5/${path}?lat=${lat}&lon=${lng}&units=metric&appid=${this.apiKey}`;
  }

  async getCurrentWeather(destination: Destination, dateISO?: string): Promise<DataEnvelope<CurrentWeather>> {
    try {
      const response = await fetch(this.url('weather', destination));
      if (!response.ok) throw new Error(`OpenWeather responded ${response.status}`);
      const json = (await response.json()) as {
        main: { temp: number; feels_like: number; humidity: number };
        wind: { speed: number };
        weather: { main: string; description: string }[];
        sys: { sunrise: number; sunset: number };
        clouds?: { all: number };
      };
      const condition = OPENWEATHER_CONDITIONS[json.weather[0]?.main] ?? 'partly-cloudy';
      const time = (unix: number) =>
        new Date(unix * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
      return {
        data: {
          tempC: Math.round(json.main.temp),
          feelsLikeC: Math.round(json.main.feels_like),
          condition,
          label: json.weather[0]?.description ?? CONDITION_LABELS[condition],
          humidity: json.main.humidity,
          windKph: Math.round(json.wind.speed * 3.6),
          rainChance: json.clouds?.all ?? RAIN_CHANCE[condition][0],
          uvIndex: 0,
          sunrise: time(json.sys.sunrise),
          sunset: time(json.sys.sunset),
        },
        source: 'live',
        provider: this.name,
        fetchedAt: new Date().toISOString(),
      };
    } catch (error) {
      const fallback = await this.fallback.getCurrentWeather(destination, dateISO);
      return { ...fallback, note: `${fallback.note} (Live weather request failed: ${(error as Error).message})` };
    }
  }

  async getForecast(destination: Destination, startISO: string, days: number): Promise<DataEnvelope<ForecastDay[]>> {
    try {
      const response = await fetch(this.url('forecast', destination));
      if (!response.ok) throw new Error(`OpenWeather responded ${response.status}`);
      const json = (await response.json()) as {
        list: { dt: number; main: { temp_max: number; temp_min: number }; weather: { main: string; description: string }[]; pop?: number }[];
      };
      const byDate = new Map<string, ForecastDay>();
      for (const entry of json.list) {
        const date = new Date(entry.dt * 1000).toISOString().slice(0, 10);
        const condition = OPENWEATHER_CONDITIONS[entry.weather[0]?.main] ?? 'partly-cloudy';
        const existing = byDate.get(date);
        byDate.set(date, {
          date,
          highC: Math.round(Math.max(existing?.highC ?? -99, entry.main.temp_max)),
          lowC: Math.round(Math.min(existing?.lowC ?? 99, entry.main.temp_min)),
          condition: existing?.condition ?? condition,
          rainChance: Math.round(Math.max(existing?.rainChance ?? 0, (entry.pop ?? 0) * 100)),
          label: existing?.label ?? (entry.weather[0]?.description ?? CONDITION_LABELS[condition]),
        });
      }
      const live = [...byDate.values()].slice(0, days);
      if (!live.length) throw new Error('Empty forecast');
      return { data: live, source: 'live', provider: this.name, fetchedAt: new Date().toISOString() };
    } catch (error) {
      const fallback = await this.fallback.getForecast(destination, startISO, days);
      return { ...fallback, note: `${fallback.note} (Live forecast failed: ${(error as Error).message})` };
    }
  }
}

const demoWeather = new DemoWeatherProvider();

export const weatherProvider: WeatherProvider = PROVIDER_KEYS.openWeather
  ? new OpenWeatherProvider(PROVIDER_KEYS.openWeather, demoWeather)
  : demoWeather;

/* ---------------------------- Activity suitability ---------------------------- */

export type Suitability = 'great' | 'fine' | 'caution' | 'poor';

export interface SuitabilityVerdict {
  rating: Suitability;
  headline: string;
  reason: string;
}

/**
 * Deterministic rules — no model needed. Answers "is today good for this kind
 * of plan?" from temperature, rain probability and condition.
 */
export function assessSuitability(
  weather: CurrentWeather,
  kind: 'outdoor' | 'trek' | 'beach' | 'indoor' | 'photography',
): SuitabilityVerdict {
  const { tempC, rainChance, condition } = weather;
  const wet = condition === 'heavy-rain' || condition === 'thunderstorm' || rainChance >= 70;
  const hot = tempC >= 38;

  if (kind === 'indoor') {
    return wet || hot
      ? { rating: 'great', headline: 'Ideal for indoor plans', reason: wet ? 'Rain outside — museums and galleries are the right call.' : 'Too hot for the street; indoor sights are the sensible move.' }
      : { rating: 'fine', headline: 'Fine, but the weather is good', reason: 'Conditions outside are pleasant — consider saving indoor stops for the hottest hours.' };
  }

  if (wet) {
    return {
      rating: kind === 'trek' ? 'poor' : 'caution',
      headline: kind === 'trek' ? 'Not a trekking day' : 'Rain likely',
      reason:
        kind === 'trek'
          ? `${rainChance}% chance of rain with ${weather.label.toLowerCase()} — trails get slippery and streams rise fast.`
          : `${rainChance}% chance of rain. Carry a shell and keep an indoor option in reserve.`,
    };
  }

  if (hot) {
    return {
      rating: kind === 'trek' ? 'poor' : 'caution',
      headline: `${tempC}°C — heat is the limiting factor`,
      reason: 'Plan outdoor stops before 10:00 or after 17:00, and carry at least two litres of water.',
    };
  }

  if (kind === 'beach' && (tempC < 22 || condition === 'cloudy')) {
    return { rating: 'fine', headline: 'Beach is workable', reason: `${tempC}°C and ${weather.label.toLowerCase()} — pleasant for a walk, less so for swimming.` };
  }

  if (kind === 'photography') {
    return condition === 'clear' || condition === 'partly-cloudy'
      ? { rating: 'great', headline: 'Good light expected', reason: `${weather.label} with ${rainChance}% rain chance — golden hour should hold.` }
      : { rating: 'fine', headline: 'Flat but usable light', reason: `${weather.label} — good for detail and street work, weak for wide landscapes.` };
  }

  return {
    rating: 'great',
    headline: `${tempC}°C and ${weather.label.toLowerCase()}`,
    reason: `Only a ${rainChance}% chance of rain — a good day to be outdoors.`,
  };
}
