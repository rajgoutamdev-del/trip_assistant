import type { Destination, PackingItem, TripPreferences } from '@/types';
import { monthOf } from '@/utils/dates';

type Rule = Omit<PackingItem, 'id' | 'checked'>;

const item = (
  label: string,
  category: PackingItem['category'],
  reason: string,
  essential = false,
): Rule => ({ label, category, reason, essential });

/**
 * Rules-based packing list. Deterministic on purpose: the inputs (month,
 * climate, duration, activities, travel type) fully determine the output, so
 * nothing here needs a model and nothing here is invented at runtime.
 */
export function generatePackingList(
  destination: Destination,
  preferences: TripPreferences,
  startDate: string,
  days: number,
): PackingItem[] {
  const month = destination.monthNotes[monthOf(startDate) - 1];
  const rules: Rule[] = [];

  /* Documents ----------------------------------------------------------- */
  if (preferences.isInternationalVisitor) {
    rules.push(
      item('Passport + visa printout', 'documents', 'Required at hotel check-in and for foreign-national monument rates.', true),
      item('Travel insurance details', 'documents', 'Private hospitals ask for this before admission.', true),
      item('International Driving Permit', 'documents', 'Needed alongside your home licence if you plan to rent anything with wheels.'),
    );
  } else {
    rules.push(item('Government photo ID (Aadhaar / licence)', 'documents', 'Hotels and railways require ID at check-in.', true));
  }
  rules.push(
    item('Digital + printed booking copies', 'documents', 'Phone batteries die at the worst moment; a paper copy has never failed.', true),
    item('Cash in small notes', 'documents', 'Autos, temple shoe-stands, entry tickets and street food are still cash-first.', true),
  );

  /* Clothing by climate -------------------------------------------------- */
  const nights = Math.max(1, days);
  rules.push(item(`${Math.min(nights + 1, 7)} changes of clothes`, 'clothing', `${days} days with laundry available at most stays beyond three nights.`, true));

  if (month.avgHighC >= 33) {
    rules.push(
      item('Loose cotton or linen clothing', 'clothing', `${destination.name} averages ${month.avgHighC}°C in ${month.label} — synthetics are miserable in that heat.`, true),
      item('Wide-brim hat or cap', 'weather', 'Shade is scarce at forts and open monuments.', true),
      item('Electrolyte sachets', 'health', 'Heat plus walking dehydrates faster than water alone can fix.', true),
    );
  }
  if (month.avgLowC <= 12) {
    rules.push(
      item('Warm layers / fleece', 'clothing', `Mornings drop to about ${month.avgLowC}°C in ${month.label}.`, true),
      item('Beanie and gloves', 'clothing', 'Early starts and open vehicles get genuinely cold at this time of year.', month.avgLowC <= 3),
    );
  }
  if (month.avgLowC <= 2) {
    rules.push(item('Insulated jacket', 'clothing', `Nights near or below freezing in ${month.label}.`, true));
  }

  const rainy = /rain|monsoon|wet|shower/i.test(month.note);
  if (rainy) {
    rules.push(
      item('Compact umbrella', 'weather', `${month.label} is a wet month here — ${month.note.toLowerCase()}`, true),
      item('Rain shell or poncho', 'weather', 'More useful than an umbrella in wind, and essential on ghat roads.', true),
      item('Dry bag for electronics', 'tech', 'Phones and cameras do not survive a sideways monsoon shower.'),
      item('Quick-dry footwear', 'footwear', 'Streets flood; leather shoes will not dry overnight.', true),
    );
  }

  /* Religious and cultural --------------------------------------------- */
  const spiritual =
    preferences.interests.includes('spiritual') ||
    preferences.activities.includes('temple-visits') ||
    destination.places.some((p) => p.category === 'temple');
  if (spiritual) {
    rules.push(
      item('Scarf or stole', 'clothing', 'Shoulders and heads need covering at temples, mosques, gurudwaras and dargahs.', true),
      item('Slip-on footwear', 'footwear', 'You will remove shoes repeatedly — laces become an irritation fast.'),
    );
  }

  /* Activity-driven ----------------------------------------------------- */
  if (preferences.activities.includes('trekking') || preferences.interests.includes('adventure')) {
    rules.push(
      item('Trekking shoes with grip', 'footwear', 'You listed trekking — basalt and wet stone are lethal in trainers.', true),
      item('Small daypack', 'activity', 'Water, snacks and a shell for the trail.'),
      item('Blister plasters', 'health', 'The single most useful item on any walking-heavy trip.'),
    );
  }
  if (preferences.interests.includes('beaches') || preferences.activities.includes('water-sports')) {
    rules.push(
      item('Swimwear + beach cover-up', 'clothing', 'Beachwear is fine on the sand, not in villages and restaurants.', true),
      item('Reef-safe sunscreen SPF 50', 'health', 'Coastal UV is stronger than the sea breeze suggests.', true),
      item('Flip-flops', 'footwear', 'Sand, boats and wet bathroom floors.'),
    );
  }
  if (preferences.interests.includes('photography') || preferences.activities.includes('sunset-points')) {
    rules.push(
      item('Spare camera battery + memory card', 'tech', 'Golden hour is not the moment to run out of either.'),
      item('Lens cloth', 'tech', 'Dust, sea spray and humidity all end up on the glass.'),
    );
  }
  if (preferences.activities.includes('wildlife-safari')) {
    rules.push(
      item('Neutral-coloured clothing', 'activity', 'Bright colours are discouraged on safari drives and forest treks.'),
      item('Binoculars', 'activity', 'Most sightings are further away than photographs suggest.'),
    );
  }

  /* Health and travel type ---------------------------------------------- */
  rules.push(
    item('Basic medicine kit (ORS, paracetamol, antiseptic)', 'health', 'Pharmacies are everywhere, but not at 2am on a hill road.', true),
    item('Prescription medicines + prescription copy', 'health', 'Carry more than the trip length and keep the prescription with it.', true),
    item('Mosquito repellent', 'health', 'Dengue and chikungunya occur across India, worst post-monsoon.', rainy),
    item('Hand sanitiser and tissues', 'health', 'Street food and public toilets both call for it.', true),
    item('Power bank', 'tech', 'Maps, tickets and payments all run off one battery.', true),
    item('Universal adapter (Type C/D/M)', 'tech', 'India uses 230V with Type C, D and M sockets.', preferences.isInternationalVisitor),
    item('Refillable water bottle', 'health', `${destination.name} has refill points at most hotels; bottled water adds up.`, true),
  );

  if (preferences.travelType === 'family') {
    rules.push(
      item('Snacks for children', 'activity', 'Gaps between meals get long on sightseeing days.'),
      item('Child-sized sun protection', 'health', 'Hats, sunscreen and a shaded carrier if you have one.', true),
    );
  }
  if (preferences.mobility === 'travelling-with-infant') {
    rules.push(
      item('Baby carrier (not a pram)', 'activity', 'Old-city lanes, steps and ghats defeat wheels almost everywhere.', true),
      item('Nappies and wipes for the full trip', 'health', 'Brands vary; stock up before leaving a major city.', true),
    );
  }
  if (preferences.travelType === 'solo') {
    rules.push(
      item('Door wedge or portable lock', 'activity', 'Cheap peace of mind in budget rooms.'),
      item('Offline maps downloaded', 'tech', 'Signal fails in lanes, hills and basements exactly when you need it.', true),
    );
  }
  if (days >= 5) {
    rules.push(item('Laundry bag + travel detergent', 'clothing', `A ${days}-day trip means at least one wash.`));
  }

  /* Destination-authored hints ----------------------------------------- */
  for (const hint of destination.packingHints) {
    const [label, ...rest] = hint.split(/ — |: /);
    rules.push(item(label.trim(), 'activity', rest.join(' — ').trim() || `Local advice for ${destination.name}.`));
  }

  /* Dedupe by label, keeping the first (most specific) reason. */
  const seen = new Set<string>();
  return rules
    .filter((rule) => {
      const key = rule.label.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((rule, index) => ({ ...rule, id: `pack-${index}`, checked: false }));
}

export const PACKING_CATEGORY_LABELS: Record<PackingItem['category'], string> = {
  documents: 'Documents & money',
  clothing: 'Clothing',
  footwear: 'Footwear',
  health: 'Health & hygiene',
  tech: 'Tech',
  weather: 'Weather gear',
  activity: 'Activity & extras',
};
