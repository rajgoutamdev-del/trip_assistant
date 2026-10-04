/**
 * Runnable self-checks for the three pieces of real logic in the app: budget
 * maths, packing rules and the itinerary planner.
 *
 *   npm run check
 *
 * Deliberately framework-free — plain assertions, one file, fails loudly.
 */
import assert from 'node:assert/strict';
import type { TripPreferences } from '@/types';
import { getDestination } from '@/data/destinations';
import { buildBudgetPlan, EXPENSE_CATEGORIES, suggestBudgetINR, summariseBudget } from './budget';
import { generatePackingList } from './packing';
import { dayCostINR, dayEndMinutes, generateItinerary, resequenceDay } from './itinerary';
import { sum } from '@/utils/misc';

const prefs = (overrides: Partial<TripPreferences> = {}): TripPreferences => ({
  travelType: 'couple',
  travellers: 2,
  budgetTotalINR: 30000,
  budgetTier: 'comfort',
  pace: 'balanced',
  interests: ['heritage', 'food'],
  diet: ['no-preference'],
  spice: 'medium',
  activities: ['walking-tours'],
  stay: 'boutique',
  transport: 'cab',
  mobility: 'none',
  isInternationalVisitor: false,
  homeCurrency: 'INR',
  ...overrides,
});

const jaipur = getDestination('jaipur');
const manali = getDestination('manali');
const goa = getDestination('goa');
assert(jaipur && manali && goa, 'destination catalogue should load');

/* --------------------------------- budget -------------------------------- */

function checkBudget() {
  const plan = buildBudgetPlan(30000, 'comfort');
  const total = sum(EXPENSE_CATEGORIES.map((c) => plan.allocations[c]));
  assert(Math.abs(total - 30000) < 600, `allocations should roughly sum to the total, got ${total}`);
  assert.equal(plan.allocations.accommodation, 9900, 'comfort tier puts 33% into accommodation');

  // A shoestring trip spends proportionally less on a bed than a luxury one.
  const cheap = buildBudgetPlan(30000, 'shoestring');
  const lux = buildBudgetPlan(30000, 'luxury');
  assert(cheap.allocations.accommodation < lux.allocations.accommodation, 'tier should shift the split');
  assert(cheap.allocations.food > lux.allocations.food, 'cheaper trips weight food higher');

  const summary = summariseBudget(
    plan,
    [{ id: 'e1', category: 'food', label: 'Lunch', amountINR: 1200, date: '2026-01-01' }],
    [],
    prefs(),
    3,
  );
  assert.equal(summary.spentINR, 1200, 'spend totals the expenses');
  assert.equal(summary.remainingINR, 28800, 'remaining is total minus spend');
  assert.equal(summary.byCategory.find((c) => c.category === 'food')?.spentINR, 1200, 'spend lands in its category');
  assert.equal(summary.status, 'healthy', 'a small spend against 30k is healthy');

  const tight = summariseBudget(
    buildBudgetPlan(2000, 'comfort'),
    [{ id: 'e2', category: 'food', label: 'Dinner', amountINR: 2600, date: '2026-01-01' }],
    [],
    prefs({ travellers: 1 }),
    2,
  );
  assert.equal(tight.status, 'over', 'overspending flips the status to over');
  assert(tight.remainingINR < 0, 'remaining goes negative when overspent');

  // A suggested budget should scale with people, nights and tier.
  const solo = suggestBudgetINR(jaipur!, 'comfort', 1, 3);
  const pair = suggestBudgetINR(jaipur!, 'comfort', 2, 3);
  const longer = suggestBudgetINR(jaipur!, 'comfort', 1, 6);
  assert(pair > solo, 'two travellers cost more than one');
  assert(longer > solo, 'six days cost more than three');

  console.log('✓ budget');
}

/* -------------------------------- packing -------------------------------- */

function checkPacking() {
  // Mumbai in July is a monsoon trip; Manali in January is a snow trip.
  const monsoon = generatePackingList(getDestination('mumbai')!, prefs(), '2026-07-10', 4);
  const labels = monsoon.map((i) => i.label.toLowerCase()).join(' | ');
  assert(labels.includes('umbrella'), 'a July Mumbai trip should pack an umbrella');
  assert(labels.includes('quick-dry footwear'), 'a monsoon trip should pack quick-dry footwear');

  const winter = generatePackingList(manali!, prefs(), '2026-01-10', 4);
  const winterLabels = winter.map((i) => i.label.toLowerCase()).join(' | ');
  assert(winterLabels.includes('insulated jacket'), 'a January Manali trip should pack an insulated jacket');
  assert(!winterLabels.includes('reef-safe sunscreen'), 'a hill trip should not pack reef-safe sunscreen');

  const beach = generatePackingList(goa!, prefs({ interests: ['beaches'] }), '2026-12-10', 5);
  assert(
    beach.some((i) => i.label.toLowerCase().includes('reef-safe sunscreen')),
    'a beach trip should pack reef-safe sunscreen',
  );

  const trek = generatePackingList(manali!, prefs({ activities: ['trekking'] }), '2026-05-10', 5);
  assert(trek.some((i) => i.label.includes('Trekking shoes')), 'a trekking trip should pack trekking shoes');

  const foreign = generatePackingList(jaipur!, prefs({ isInternationalVisitor: true }), '2026-11-10', 4);
  assert(foreign.some((i) => i.label.includes('Passport')), 'international visitors need their passport listed');
  const domestic = generatePackingList(jaipur!, prefs(), '2026-11-10', 4);
  assert(!domestic.some((i) => i.label.includes('Passport')), 'domestic travellers should not be told to pack a passport');

  // Labels must be unique, and every item must carry a reason.
  const seen = new Set(monsoon.map((i) => i.label.toLowerCase()));
  assert.equal(seen.size, monsoon.length, 'packing list should not repeat an item');
  assert(monsoon.every((i) => i.reason.length > 10), 'every packing item explains itself');

  console.log('✓ packing');
}

/* ------------------------------- itinerary -------------------------------- */

async function checkItinerary() {
  const days = 4;
  const itinerary = await generateItinerary({
    destination: jaipur!,
    preferences: prefs(),
    startDate: '2026-11-10',
    days,
    originCity: 'Mumbai',
  });

  assert.equal(itinerary.length, days, 'one entry per day');
  assert(itinerary.every((d) => d.items.length > 0), 'no day should be empty');
  assert(
    itinerary.every((d) => d.items.every((a, i) => i === 0 || a.startMinutes >= d.items[i - 1].startMinutes)),
    'items within a day are in chronological order',
  );
  assert(itinerary.every((d) => d.items.some((i) => i.kind === 'food')), 'every day gets at least one meal');
  assert(itinerary.every((d) => d.items.every((i) => i.reason.length > 10)), 'every stop explains why it is there');

  // Meals rotate through the shortlist, so consecutive days never repeat a
  // dinner (the list may legitimately wrap on a long trip).
  const dinners = itinerary
    .map((d) => d.items.filter((i) => i.kind === 'food').at(-1)?.title)
    .filter(Boolean);
  assert(
    dinners.every((title, i) => i === 0 || title !== dinners[i - 1]),
    `consecutive dinners should differ, got ${dinners.join(' / ')}`,
  );
  assert(new Set(dinners).size > 1, 'a multi-day trip should see more than one dinner');

  // Places must not be scheduled twice across the trip.
  const placeIds = itinerary.flatMap((d) => d.items.map((i) => i.placeId).filter(Boolean));
  assert.equal(new Set(placeIds).size, placeIds.length, 'no place is scheduled twice');

  // A trip longer than the shortlist should still fill every day.
  const long = await generateItinerary({
    destination: jaipur!,
    preferences: prefs(),
    startDate: '2026-11-10',
    days: 9,
    originCity: 'Mumbai',
  });
  assert(long.every((d) => d.items.length > 0), 'long trips still give every day something');

  // Pace changes how much lands in a day.
  const relaxed = await generateItinerary({
    destination: goa!, preferences: prefs({ pace: 'relaxed' }), startDate: '2026-12-10', days: 3, originCity: 'Pune',
  });
  const packed = await generateItinerary({
    destination: goa!, preferences: prefs({ pace: 'packed' }), startDate: '2026-12-10', days: 3, originCity: 'Pune',
  });
  const sights = (plan: typeof relaxed) => plan[1].items.filter((i) => i.kind !== 'food').length;
  assert(sights(packed) >= sights(relaxed), 'a packed pace schedules at least as much as a relaxed one');

  // Vegetarians never get a non-vegetarian meal scheduled.
  const veg = await generateItinerary({
    destination: goa!,
    preferences: prefs({ diet: ['vegetarian'] }),
    startDate: '2026-12-10',
    days: 4,
    originCity: 'Pune',
  });
  const meals = veg.flatMap((d) => d.items.filter((i) => i.kind === 'food'));
  const nonVeg = goa!.dishes.filter((d) => !d.isVegetarian).map((d) => d.name);
  assert(
    meals.every((meal) => !nonVeg.some((name) => meal.title.includes(name))),
    'a vegetarian trip should never schedule a non-vegetarian dish',
  );

  // Foreign nationals pay the foreign entry fee, per traveller.
  const foreign = await generateItinerary({
    destination: jaipur!,
    preferences: prefs({ isInternationalVisitor: true, travellers: 2 }),
    startDate: '2026-11-10',
    days: 2,
    originCity: 'London',
  });
  const amber = foreign.flatMap((d) => d.items).find((i) => i.placeId === 'jaipur-amer');
  assert(amber, 'Amber Fort should be scheduled for a heritage traveller');
  assert.equal(amber!.estimatedCostINR, 500 * 2, 'foreign entry fee is charged per traveller');

  // Re-timing after an edit keeps the day contiguous and ordered.
  const day = itinerary[0];
  const trimmed = resequenceDay({ ...day, items: day.items.slice(1) }, 'balanced');
  assert(trimmed.items[0].startMinutes >= 540, 'a balanced day still starts at 9am');
  assert(
    trimmed.items.every((item, i) =>
      i === 0 ? true : item.startMinutes >= trimmed.items[i - 1].startMinutes + trimmed.items[i - 1].durationMinutes,
    ),
    'resequencing leaves no overlapping stops',
  );

  assert(dayCostINR(day) >= 0, 'day cost is never negative');
  assert(dayEndMinutes(day) > day.items[0].startMinutes, 'a day ends after it starts');

  console.log('✓ itinerary');
}

async function main() {
  checkBudget();
  checkPacking();
  await checkItinerary();
  console.log('\nAll planner self-checks passed.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
