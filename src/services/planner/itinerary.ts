import type {
  Destination, Dish, ItineraryDay, ItineraryItem, Pace, Place, TripPreferences,
} from '@/types';
import { mapsProvider, type TravelMode } from '@/services/providers/maps';
import { eachDate, monthOf } from '@/utils/dates';
import { haversineKm, uid } from '@/utils/misc';

/** Sights per day by pace. Meals and breaks are added on top of these. */
const SIGHTS_PER_DAY: Record<Pace, number> = { relaxed: 2, balanced: 3, packed: 4 };

/** Day start time in minutes from midnight. */
const DAY_START: Record<Pace, number> = { relaxed: 570, balanced: 540, packed: 480 };

const LUNCH_AT = 780; // 13:00
const DINNER_AT = 1170; // 19:30
const MEAL_MINUTES = { lunch: 60, dinner: 75 } as const;

const TIME_ORDER = ['sunrise', 'morning', 'midday', 'afternoon', 'sunset', 'night'] as const;

const MODE_BY_PREFERENCE: Record<TripPreferences['transport'], TravelMode> = {
  public: 'transit',
  cab: 'auto',
  'self-drive': 'car',
  'two-wheeler': 'car',
  'walk-first': 'walk',
};

export interface PlannerInput {
  destination: Destination;
  preferences: TripPreferences;
  startDate: string;
  days: number;
  originCity: string;
}

/* ------------------------------- scoring -------------------------------- */

function scorePlace(place: Place, prefs: TripPreferences): number {
  let score = 0;
  for (const interest of place.interests) {
    if (prefs.interests.includes(interest)) score += 3;
  }
  if (prefs.activities.includes('museums') && place.category === 'museum') score += 2;
  if (prefs.activities.includes('temple-visits') && place.category === 'temple') score += 2;
  if (prefs.activities.includes('markets') && place.category === 'market') score += 2;
  if (prefs.activities.includes('trekking') && place.typicalVisitMinutes > 180) score += 2;
  if (prefs.activities.includes('sunset-points') && place.bestTime.includes('sunset')) score += 1;
  if (prefs.activities.includes('walking-tours') && place.category === 'neighbourhood') score += 2;

  // Mobility and family pacing: very long or steep visits move down the list.
  if (prefs.mobility !== 'none' && place.typicalVisitMinutes > 240) score -= 4;
  if (prefs.mobility === 'wheelchair' && !place.accessibilityNote) score -= 1;
  if (prefs.travelType === 'family' && place.typicalVisitMinutes > 300) score -= 3;
  if (prefs.pace === 'relaxed' && place.typicalVisitMinutes > 300) score -= 2;

  // Budget: a shoestring trip should not be led by the most expensive tickets.
  const fee = prefs.isInternationalVisitor ? place.entryFeeINR.foreign : place.entryFeeINR.indian;
  if (prefs.budgetTier === 'shoestring' && fee > 400) score -= 2;

  return score;
}

function reasonFor(place: Place, prefs: TripPreferences, destination: Destination): string {
  const matched = place.interests.filter((i) => prefs.interests.includes(i));
  const parts: string[] = [];

  if (matched.length) {
    parts.push(`it matches your interest in ${matched.slice(0, 2).join(' and ')}`);
  } else {
    parts.push(`it is one of the places that defines ${destination.name}`);
  }

  const quiet = (Object.entries(place.crowdPattern) as [string, string][]).find(([, level]) => level === 'quiet');
  if (quiet) parts.push(`and it is quietest ${quiet[0] === 'sunrise' ? 'before 8am' : `in the ${quiet[0]}`}`);
  else if (place.bestTime.length) parts.push(`and ${place.bestTime[0]} is the best light for it`);

  if (prefs.mobility === 'wheelchair' && place.accessibilityNote) {
    parts.push(`— access note: ${place.accessibilityNote.toLowerCase()}`);
  }

  return `Scheduled because ${parts.join(', ')}.`;
}

/* ------------------------------ meal picking ----------------------------- */

function dietOk(dish: Dish, prefs: TripPreferences): boolean {
  const diets = prefs.diet.filter((d) => d !== 'no-preference');
  if (!diets.length) return true;
  if (diets.includes('vegetarian') || diets.includes('jain') || diets.includes('vegan')) {
    if (!dish.isVegetarian) return false;
  }
  if (diets.includes('halal') && !dish.isVegetarian && !dish.diet.includes('halal')) return false;
  return diets.some((d) => dish.diet.includes(d as never)) || dish.isVegetarian;
}

/**
 * Ranked list of dishes that suit the traveller for a given meal. The planner
 * walks this list day by day so a four-day trip is four different meals rather
 * than the same "must try" dish four times.
 */
function mealRotation(destination: Destination, prefs: TripPreferences, meal: 'lunch' | 'dinner'): Dish[] {
  const spiceRank = { mild: 0, medium: 1, fiery: 2 } as const;
  const rank = (a: Dish, b: Dish) => {
    const mustTry = Number(b.mustTry) - Number(a.mustTry);
    if (mustTry !== 0) return mustTry;
    return (
      Math.abs(spiceRank[a.spice] - spiceRank[prefs.spice]) -
      Math.abs(spiceRank[b.spice] - spiceRank[prefs.spice])
    );
  };

  const forMeal = destination.dishes.filter((dish) => dish.mealTime.includes(meal) && dietOk(dish, prefs));
  if (forMeal.length) return forMeal.sort(rank);
  // Nothing is served at this meal that fits the diet — fall back to anything edible.
  return destination.dishes.filter((dish) => dietOk(dish, prefs)).sort(rank);
}

/* ------------------------------ day grouping ----------------------------- */

function groupIntoDays(places: Place[], days: number, perDay: number): Place[][] {
  const remaining = [...places];
  const result: Place[][] = [];

  for (let day = 0; day < days && remaining.length; day += 1) {
    const anchor = remaining.shift();
    if (!anchor) break;
    const group = [anchor];

    // Fill the day with whatever is geographically closest to the anchor —
    // this is what keeps travel time down across a real itinerary.
    while (group.length < perDay && remaining.length) {
      remaining.sort((a, b) => haversineKm(anchor.coords, a.coords) - haversineKm(anchor.coords, b.coords));
      group.push(remaining.shift() as Place);
    }

    group.sort((a, b) => {
      const at = TIME_ORDER.indexOf(a.bestTime[0] ?? 'morning');
      const bt = TIME_ORDER.indexOf(b.bestTime[0] ?? 'morning');
      return at - bt;
    });
    result.push(group);
  }

  return result;
}

function dayTitle(group: Place[], destination: Destination, index: number): string {
  if (!group.length) return `Day ${index + 1} in ${destination.name}`;
  const areas = [...new Set(group.map((p) => p.area))];
  return areas.length === 1 ? areas[0] : `${areas[0]} & ${areas[1]}`;
}

/* ------------------------------- generator ------------------------------- */

export async function generateItinerary(input: PlannerInput): Promise<ItineraryDay[]> {
  const { destination, preferences, startDate, days, originCity } = input;
  // Spread the available places across every day rather than filling the first
  // days to the pace limit and leaving the last ones empty.
  const perDay = Math.max(
    1,
    Math.min(SIGHTS_PER_DAY[preferences.pace], Math.ceil(destination.places.length / days)),
  );
  const mode = MODE_BY_PREFERENCE[preferences.transport];
  const travellers = Math.max(1, preferences.travellers);
  const feeFor = (place: Place) =>
    (preferences.isInternationalVisitor ? place.entryFeeINR.foreign : place.entryFeeINR.indian) * travellers;

  const ranked = [...destination.places].sort((a, b) => scorePlace(b, preferences) - scorePlace(a, preferences));
  const groups = groupIntoDays(ranked, days, perDay);
  const lunchOptions = mealRotation(destination, preferences, 'lunch');
  const dinnerOptions = mealRotation(destination, preferences, 'dinner');
  // A cursor rather than the day index, so skipping a clash still advances the
  // rotation and no two consecutive dinners repeat.
  let dinnerCursor = 0;
  const dates = eachDate(startDate, days);
  const monthNote = destination.monthNotes[monthOf(startDate) - 1];

  const result: ItineraryDay[] = [];

  for (let dayIndex = 0; dayIndex < days; dayIndex += 1) {
    const group = groups[dayIndex] ?? [];
    const items: ItineraryItem[] = [];
    let clock = DAY_START[preferences.pace];
    let previous: Place | undefined;

    if (dayIndex === 0 && originCity && originCity.toLowerCase() !== destination.name.toLowerCase()) {
      items.push({
        id: uid('item'),
        startMinutes: clock,
        durationMinutes: 90,
        title: `Arrive from ${originCity} and settle in`,
        kind: 'stay',
        estimatedCostINR: 0,
        travelMinutes: 0,
        area: destination.stayAreas[0]?.name,
        reason: `Day one keeps a buffer for the journey from ${originCity} and hotel check-in before sightseeing starts.`,
      });
      clock += 90;
    }

    if (!group.length) {
      items.push({
        id: uid('item'),
        startMinutes: clock,
        durationMinutes: 180,
        title: 'Open morning — keep it flexible',
        kind: 'rest',
        area: destination.stayAreas[0]?.name,
        estimatedCostINR: 0,
        travelMinutes: 0,
        reason:
          `Your trip is longer than the shortlist of must-see places in ${destination.name}. ` +
          'Leave this one open for a day trip, a slow morning, or anything you discover on the way.',
      });
      clock += 180;
    }

    for (const place of group) {
      const route = previous ? await mapsProvider.estimateRoute(previous.coords, place.coords, mode) : null;
      const travelMinutes = route?.minutes ?? 0;
      clock += travelMinutes;

      // Slot lunch in before the next sight if we have run past lunchtime.
      if (clock >= LUNCH_AT && !items.some((item) => item.kind === 'food' && item.startMinutes < DINNER_AT)) {
        const dish = lunchOptions[dayIndex % lunchOptions.length];
        if (dish) {
          items.push({
            id: uid('item'),
            startMinutes: clock,
            durationMinutes: MEAL_MINUTES.lunch,
            title: `Lunch — ${dish.name}`,
            kind: 'food',
            area: dish.whereToTry[0],
            estimatedCostINR: dish.approxPriceINR * travellers,
            travelMinutes: 0,
            reason: `${dish.culturalNote} Picked to suit your ${preferences.spice} spice preference.`,
          });
          clock += MEAL_MINUTES.lunch;
        }
      }

      items.push({
        id: uid('item'),
        startMinutes: clock,
        durationMinutes: place.typicalVisitMinutes,
        title: place.name,
        kind: place.category === 'market' ? 'shopping' : place.category === 'nature' ? 'activity' : 'sight',
        placeId: place.id,
        area: place.area,
        estimatedCostINR: feeFor(place),
        travelMinutes,
        reason: reasonFor(place, preferences, destination),
        bookingRequired: place.typicalVisitMinutes >= 300,
      });
      clock += place.typicalVisitMinutes;
      previous = place;
    }

    const lunchDish = lunchOptions[dayIndex % lunchOptions.length];
    let dinnerDish = dinnerOptions[dinnerCursor % dinnerOptions.length];
    // Do not serve the same dish twice in one day when there is an alternative.
    if (dinnerDish && lunchDish && dinnerDish.id === lunchDish.id && dinnerOptions.length > 1) {
      dinnerCursor += 1;
      dinnerDish = dinnerOptions[dinnerCursor % dinnerOptions.length];
    }
    dinnerCursor += 1;
    if (dinnerDish) {
      const dinnerStart = Math.max(clock + 30, DINNER_AT);
      items.push({
        id: uid('item'),
        startMinutes: dinnerStart,
        durationMinutes: MEAL_MINUTES.dinner,
        title: `Dinner — ${dinnerDish.name}`,
        kind: 'food',
        area: dinnerDish.whereToTry[0],
        estimatedCostINR: dinnerDish.approxPriceINR * travellers,
        travelMinutes: 20,
        reason: `${dinnerDish.description}${dinnerDish.mustTry ? ' Widely considered unmissable here.' : ''}`,
      });
      clock = dinnerStart + MEAL_MINUTES.dinner;
    }

    const wantsNight = preferences.interests.includes('nightlife') || preferences.activities.includes('live-music');
    const nightOption = destination.nightLife.find((n) => n.kind === 'experience' || n.kind === 'food');
    if (wantsNight && nightOption && preferences.pace !== 'relaxed') {
      items.push({
        id: uid('item'),
        startMinutes: Math.max(clock + 20, 1290),
        durationMinutes: 90,
        title: nightOption.name,
        kind: 'activity',
        area: destination.name,
        estimatedCostINR: 600 * travellers,
        travelMinutes: 15,
        reason: `${nightOption.detail} Open until ${nightOption.openTill}.`,
      });
    }

    result.push({
      id: uid('day'),
      dayNumber: dayIndex + 1,
      date: dates[dayIndex],
      title: group.length ? dayTitle(group, destination, dayIndex) : 'Open day',
      summary:
        dayIndex === 0
          ? `${monthNote.note} ${group.length ? `Starts around ${group[0].area}.` : ''}`.trim()
          : group.length
            ? `${group.length} main stops, grouped to keep travel between them short.`
            : 'Deliberately unplanned — a buffer day for rest, weather or a side trip.',
      items: items.sort((a, b) => a.startMinutes - b.startMinutes),
    });
  }

  return result;
}

/** Re-times a day after an item is added, removed, moved or resized. */
export function resequenceDay(day: ItineraryDay, pace: Pace): ItineraryDay {
  let clock = DAY_START[pace];
  const items = [...day.items]
    .sort((a, b) => a.startMinutes - b.startMinutes)
    .map((item) => {
      clock += item.travelMinutes;
      const startMinutes = clock;
      clock += item.durationMinutes;
      return { ...item, startMinutes };
    });
  return { ...day, items };
}

export const dayCostINR = (day: ItineraryDay): number =>
  day.items.reduce((total, item) => total + item.estimatedCostINR, 0);

export const dayEndMinutes = (day: ItineraryDay): number =>
  day.items.reduce((latest, item) => Math.max(latest, item.startMinutes + item.durationMinutes), 0);
