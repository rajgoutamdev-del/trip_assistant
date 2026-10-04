import type { CurrentWeather, Destination, Dish, ItineraryDay, Trip } from '@/types';
import { PROVIDER_KEYS } from '@/services/config';
import { generateItinerary, type PlannerInput } from '@/services/planner/itinerary';
import { summariseBudget } from '@/services/planner/budget';
import { assessSuitability } from '@/services/providers/weather';
import { formatINR } from '@/utils/format';
import { monthOf, tripLengthDays } from '@/utils/dates';

export interface AssistantAnswer {
  /** Short answer, rendered as the headline. */
  headline: string;
  /** Supporting detail — one short paragraph or a few bullet lines. */
  detail: string[];
  /** Where in the app the traveller can act on this. */
  action?: { label: string; to: string };
  /** 'rules' when answered deterministically; 'model' when a model produced it. */
  basis: 'rules' | 'model';
}

export interface FoodRecommendation {
  dish: Dish;
  why: string;
}

export interface AssistantContext {
  trip: Trip;
  destination: Destination;
  weather?: CurrentWeather;
}

export interface TravelAssistantService {
  readonly name: string;
  readonly usesModel: boolean;
  planTrip(input: PlannerInput): Promise<ItineraryDay[]>;
  recommendFood(destination: Destination, trip: Trip, limit?: number): FoodRecommendation[];
  dailyBriefing(context: AssistantContext): AssistantAnswer[];
  ask(question: string, context: AssistantContext): Promise<AssistantAnswer>;
}

/* ------------------------------ rules engine ------------------------------ */

const SPICE_RANK = { mild: 0, medium: 1, fiery: 2 } as const;

type Topic = 'budget' | 'weather' | 'food' | 'safety' | 'packing' | 'emergency' | 'plan' | 'transport' | 'unknown';

const TOPIC_PATTERNS: [Topic, RegExp][] = [
  ['budget', /budget|cost|money|expensive|cheap|spend|afford|price/i],
  ['weather', /weather|rain|temperature|hot|cold|forecast|monsoon|climate/i],
  ['food', /food|eat|dish|restaurant|veg|vegan|meal|breakfast|lunch|dinner|drink/i],
  ['safety', /safe|safety|scam|danger|avoid|women|alone|night|theft|police/i],
  ['packing', /pack|carry|bring|luggage|clothes|wear/i],
  ['emergency', /emergency|hospital|doctor|pharmacy|ambulance|help|atm|lost/i],
  ['transport', /transport|metro|auto|taxi|cab|train|bus|drive|scooter|parking/i],
  ['plan', /plan|itinerary|schedule|day|visit|see|do|time/i],
];

function classify(question: string): Topic {
  for (const [topic, pattern] of TOPIC_PATTERNS) {
    if (pattern.test(question)) return topic;
  }
  return 'unknown';
}

/**
 * The default assistant. Entirely deterministic: it reads the trip, the
 * destination data and the rules engines, and never fabricates a fact that is
 * not already in the data. Works with no API key of any kind.
 */
export class RuleBasedAssistant implements TravelAssistantService {
  readonly name = 'Safar planner (rules-based)';
  readonly usesModel = false;

  planTrip(input: PlannerInput): Promise<ItineraryDay[]> {
    return generateItinerary(input);
  }

  recommendFood(destination: Destination, trip: Trip, limit = 6): FoodRecommendation[] {
    const { diet, spice } = trip.preferences;
    const restrictions = diet.filter((d) => d !== 'no-preference');
    const needsVeg = restrictions.some((d) => d === 'vegetarian' || d === 'vegan' || d === 'jain');

    return destination.dishes
      .filter((dish) => (needsVeg ? dish.isVegetarian : true))
      .filter((dish) => {
        if (restrictions.includes('halal')) return dish.isVegetarian || dish.diet.includes('halal');
        return true;
      })
      .map((dish) => {
        const spiceGap = Math.abs(SPICE_RANK[dish.spice] - SPICE_RANK[spice]);
        const score = (dish.mustTry ? 4 : 0) + (2 - spiceGap) + (restrictions.some((d) => dish.diet.includes(d as never)) ? 2 : 0);
        const reasons: string[] = [];
        if (dish.mustTry) reasons.push(`a dish ${destination.name} is known for`);
        if (spiceGap === 0) reasons.push(`matches your ${spice} spice preference`);
        else if (spiceGap >= 2) reasons.push(`hotter than your ${spice} preference — ask for it mild`);
        if (needsVeg && dish.isVegetarian) reasons.push('fully vegetarian');
        if (restrictions.includes('vegan') && !dish.diet.includes('vegan')) reasons.push('check for ghee or dairy before ordering');
        return {
          dish,
          score,
          why: reasons.length ? `Recommended: ${reasons.join(', ')}.` : `A solid local choice at around ${formatINR(dish.approxPriceINR)}.`,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ dish, why }) => ({ dish, why }));
  }

  dailyBriefing({ trip, destination, weather }: AssistantContext): AssistantAnswer[] {
    const answers: AssistantAnswer[] = [];
    const days = tripLengthDays(trip.startDate, trip.endDate);
    const budget = summariseBudget(trip.budgetPlan, trip.expenses, trip.itinerary, trip.preferences, days);
    const month = destination.monthNotes[monthOf(trip.startDate) - 1];

    if (weather) {
      const outdoorHeavy = trip.itinerary[0]?.items.some((i) => i.kind === 'sight' || i.kind === 'activity');
      const verdict = assessSuitability(weather, outdoorHeavy ? 'outdoor' : 'indoor');
      answers.push({
        headline: verdict.headline,
        detail: [verdict.reason],
        action: { label: 'See the forecast', to: `/trip/${trip.id}/weather` },
        basis: 'rules',
      });
    }

    if (budget.status !== 'healthy') {
      answers.push({
        headline: budget.status === 'over' ? 'Budget is projected to run over' : 'Budget is getting tight',
        detail: [budget.headline],
        action: { label: 'Open budget', to: `/trip/${trip.id}/budget` },
        basis: 'rules',
      });
    }

    if (month.rating === 'avoid' || month.rating === 'mixed') {
      answers.push({
        headline: `${month.label} is a ${month.rating === 'avoid' ? 'difficult' : 'mixed'} month in ${destination.name}`,
        detail: [month.note, `Typical range: ${month.avgLowC}–${month.avgHighC}°C.`],
        action: { label: 'Read destination intelligence', to: `/destination/${destination.id}` },
        basis: 'rules',
      });
    }

    const unchecked = trip.packing.filter((p) => p.essential && !p.checked).length;
    if (unchecked > 0) {
      answers.push({
        headline: `${unchecked} essential item${unchecked === 1 ? '' : 's'} still unpacked`,
        detail: ['Your packing list is built from the destination, the month and the activities you chose.'],
        action: { label: 'Open packing list', to: `/trip/${trip.id}/packing` },
        basis: 'rules',
      });
    }

    const topSafety = destination.safety.tips.find((tip) => tip.severity === 'avoid');
    if (topSafety) {
      answers.push({
        headline: topSafety.title,
        detail: [topSafety.detail],
        action: { label: 'Safety centre', to: `/trip/${trip.id}/safety` },
        basis: 'rules',
      });
    }

    return answers;
  }

  async ask(question: string, context: AssistantContext): Promise<AssistantAnswer> {
    const { trip, destination, weather } = context;
    const days = tripLengthDays(trip.startDate, trip.endDate);
    const topic = classify(question);

    switch (topic) {
      case 'budget': {
        const budget = summariseBudget(trip.budgetPlan, trip.expenses, trip.itinerary, trip.preferences, days);
        return {
          headline: budget.headline,
          detail: [
            `Total budget ${formatINR(budget.totalINR)} · spent ${formatINR(budget.spentINR)} · remaining ${formatINR(budget.remainingINR)}.`,
            `A ${trip.preferences.budgetTier} trip in ${destination.name} typically runs about ${formatINR(destination.dailyBudgetINR[trip.preferences.budgetTier])} per person per day.`,
          ],
          action: { label: 'Open budget', to: `/trip/${trip.id}/budget` },
          basis: 'rules',
        };
      }
      case 'weather': {
        const month = destination.monthNotes[monthOf(trip.startDate) - 1];
        return {
          headline: weather
            ? `${weather.tempC}°C, ${weather.label.toLowerCase()}, ${weather.rainChance}% chance of rain`
            : `${month.label} in ${destination.name}: ${month.avgLowC}–${month.avgHighC}°C`,
          detail: [month.note, destination.climateSummary],
          action: { label: 'Weather & forecast', to: `/trip/${trip.id}/weather` },
          basis: 'rules',
        };
      }
      case 'food': {
        const picks = this.recommendFood(destination, trip, 3);
        return {
          headline: picks.length
            ? `Start with ${picks[0].dish.name}`
            : `No dishes in the ${destination.name} list match your dietary choices`,
          detail: picks.map((p) => `${p.dish.name} — ${p.dish.description} Try it at ${p.dish.whereToTry[0]}. About ${formatINR(p.dish.approxPriceINR)}.`),
          action: { label: 'Food & culture', to: `/trip/${trip.id}/food` },
          basis: 'rules',
        };
      }
      case 'safety': {
        const womenRelevant = /women|alone|solo/i.test(question);
        const nightRelevant = /night|dark|late/i.test(question);
        const detail = womenRelevant
          ? destination.safety.soloWomenNotes
          : nightRelevant
            ? destination.safety.nightGuidance
            : destination.safety.tips.slice(0, 3).map((tip) => `${tip.title} — ${tip.detail}`);
        return {
          headline: destination.safety.summary,
          detail,
          action: { label: 'Safety centre', to: `/trip/${trip.id}/safety` },
          basis: 'rules',
        };
      }
      case 'packing': {
        const essentials = trip.packing.filter((p) => p.essential).slice(0, 5);
        return {
          headline: `${trip.packing.length} items on your list, ${trip.packing.filter((p) => p.essential).length} marked essential`,
          detail: essentials.map((p) => `${p.label} — ${p.reason}`),
          action: { label: 'Packing list', to: `/trip/${trip.id}/packing` },
          basis: 'rules',
        };
      }
      case 'emergency': {
        const hospital = destination.emergency.find((e) => e.kind === 'hospital');
        return {
          headline: 'Dial 112 for any emergency in India',
          detail: [
            '112 covers police, fire and ambulance nationwide. 108 is the dedicated ambulance line, 1091 the women’s helpline and 1363 the tourist helpline.',
            hospital ? `Nearest listed hospital in the directory: ${hospital.name}, ${hospital.area}.` : '',
          ].filter(Boolean),
          action: { label: 'Nearby help', to: `/trip/${trip.id}/emergency` },
          basis: 'rules',
        };
      }
      case 'transport': {
        return {
          headline: `Getting around ${destination.name}`,
          detail: [destination.localTransport, destination.gettingThere],
          action: { label: 'Destination intelligence', to: `/destination/${destination.id}` },
          basis: 'rules',
        };
      }
      case 'plan': {
        const today = trip.itinerary[0];
        return {
          headline: today ? `Day 1: ${today.title}` : 'No itinerary generated yet',
          detail: today
            ? today.items.slice(0, 4).map((i) => `${i.title}${i.area ? ` · ${i.area}` : ''} — ${i.reason}`)
            : ['Generate a plan from the trip dashboard and it will appear here.'],
          action: { label: 'Open itinerary', to: `/trip/${trip.id}/itinerary` },
          basis: 'rules',
        };
      }
      default:
        return {
          headline: 'I can answer this from your trip data',
          detail: [
            'Ask about the budget, weather, food, safety, packing, transport, nearby help or the plan itself and I will answer from your trip and the destination guide.',
            'Open-ended questions need a language model — set VITE_ANTHROPIC_PROXY_URL to connect one. Nothing else in the app depends on it.',
          ],
          basis: 'rules',
        };
    }
  }
}

/* ------------------------------ model-backed ------------------------------ */

/**
 * Optional model-backed assistant. It only ever handles open-ended questions —
 * itineraries, budgets and packing stay deterministic, because those are maths
 * and rules, not language. Falls back to the rules engine on any failure.
 */
export class ProxyModelAssistant implements TravelAssistantService {
  readonly name = 'Model-backed assistant';
  readonly usesModel = true;

  constructor(private readonly endpoint: string, private readonly fallback: TravelAssistantService) {}

  planTrip(input: PlannerInput): Promise<ItineraryDay[]> {
    return this.fallback.planTrip(input);
  }

  recommendFood(destination: Destination, trip: Trip, limit?: number): FoodRecommendation[] {
    return this.fallback.recommendFood(destination, trip, limit);
  }

  dailyBriefing(context: AssistantContext): AssistantAnswer[] {
    return this.fallback.dailyBriefing(context);
  }

  async ask(question: string, context: AssistantContext): Promise<AssistantAnswer> {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          trip: {
            destination: context.destination.name,
            state: context.destination.state,
            dates: [context.trip.startDate, context.trip.endDate],
            preferences: context.trip.preferences,
            itinerary: context.trip.itinerary,
          },
        }),
      });
      if (!response.ok) throw new Error(`Assistant proxy responded ${response.status}`);
      const json = (await response.json()) as { headline?: string; detail?: string[] };
      if (!json.headline) throw new Error('Assistant proxy returned no answer');
      return { headline: json.headline, detail: json.detail ?? [], basis: 'model' };
    } catch {
      const answer = await this.fallback.ask(question, context);
      return { ...answer, detail: [...answer.detail, 'The model endpoint was unreachable, so this was answered from your trip data instead.'] };
    }
  }
}

const rules = new RuleBasedAssistant();

export const travelAssistant: TravelAssistantService = PROVIDER_KEYS.assistantProxy
  ? new ProxyModelAssistant(PROVIDER_KEYS.assistantProxy, rules)
  : rules;

export const SUGGESTED_QUESTIONS = [
  'Am I on track with my budget?',
  'What should I eat here?',
  'Is it safe to walk around at night?',
  'What is the weather doing?',
  'What do I still need to pack?',
  'How do I get around?',
];
