import type {
  BudgetPlan, BudgetTier, Destination, Expense, ExpenseCategory, ItineraryDay, TripPreferences,
} from '@/types';
import { sum } from '@/utils/misc';

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'accommodation', 'food', 'transport', 'activities', 'shopping', 'other',
];

export const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  accommodation: 'Accommodation',
  food: 'Food',
  transport: 'Transport',
  activities: 'Activities',
  shopping: 'Shopping',
  other: 'Other',
};

/**
 * Share of the total budget per category, by tier. Cheaper trips spend
 * proportionally more on food and transport and less on a bed.
 */
const SHARES: Record<BudgetTier, Record<ExpenseCategory, number>> = {
  shoestring: { accommodation: 0.24, food: 0.26, transport: 0.22, activities: 0.16, shopping: 0.06, other: 0.06 },
  comfort: { accommodation: 0.33, food: 0.22, transport: 0.18, activities: 0.17, shopping: 0.05, other: 0.05 },
  premium: { accommodation: 0.4, food: 0.2, transport: 0.15, activities: 0.15, shopping: 0.05, other: 0.05 },
  luxury: { accommodation: 0.46, food: 0.19, transport: 0.13, activities: 0.13, shopping: 0.05, other: 0.04 },
};

/** Warn the traveller once estimated or actual spend passes this share. */
export const BUDGET_WARNING_THRESHOLD = 0.85;

export function buildBudgetPlan(totalINR: number, tier: BudgetTier): BudgetPlan {
  const shares = SHARES[tier];
  const allocations = EXPENSE_CATEGORIES.reduce((acc, category) => {
    acc[category] = Math.round((totalINR * shares[category]) / 100) * 100;
    return acc;
  }, {} as Record<ExpenseCategory, number>);
  return { totalINR, allocations };
}

/**
 * A realistic starting budget for a destination, before the traveller adjusts
 * it: per-person daily cost for the tier, times travellers and days, with a
 * flat allowance for getting there and back.
 */
export function suggestBudgetINR(
  destination: Destination,
  tier: BudgetTier,
  travellers: number,
  days: number,
): number {
  const daily = destination.dailyBudgetINR[tier];
  const travelAllowance = { shoestring: 1500, comfort: 4000, premium: 9000, luxury: 20000 }[tier];
  const raw = daily * days * travellers + travelAllowance * travellers;
  return Math.round(raw / 500) * 500;
}

export interface BudgetSummary {
  totalINR: number;
  plannedINR: number;
  spentINR: number;
  remainingINR: number;
  /** Estimated total exposure: what is already spent plus what the plan implies. */
  projectedINR: number;
  byCategory: {
    category: ExpenseCategory;
    allocatedINR: number;
    spentINR: number;
    plannedINR: number;
    share: number;
  }[];
  status: 'healthy' | 'watch' | 'over';
  headline: string;
}

const ITEM_CATEGORY: Record<string, ExpenseCategory> = {
  food: 'food',
  sight: 'activities',
  activity: 'activities',
  shopping: 'shopping',
  transit: 'transport',
  stay: 'accommodation',
  rest: 'other',
};

/** Cost the itinerary implies, grouped the same way expenses are. */
export function plannedByCategory(itinerary: ItineraryDay[]): Record<ExpenseCategory, number> {
  const planned = EXPENSE_CATEGORIES.reduce((acc, c) => ({ ...acc, [c]: 0 }), {} as Record<ExpenseCategory, number>);
  for (const day of itinerary) {
    for (const item of day.items) {
      const category = ITEM_CATEGORY[item.kind] ?? 'other';
      planned[category] += item.estimatedCostINR;
    }
  }
  return planned;
}

export function summariseBudget(
  plan: BudgetPlan,
  expenses: Expense[],
  itinerary: ItineraryDay[],
  preferences: TripPreferences,
  days: number,
): BudgetSummary {
  const planned = plannedByCategory(itinerary);

  // The itinerary covers tickets and meals, but not the bed — add the nights
  // the plan implies so the projection is not misleadingly low.
  const nights = Math.max(0, days - 1);
  const nightlyAllowance = plan.allocations.accommodation / Math.max(1, nights);
  planned.accommodation = Math.round(nightlyAllowance * nights);
  planned.transport += Math.round(plan.allocations.transport * 0.4);

  const spentByCategory = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] ?? 0) + expense.amountINR;
    return acc;
  }, {} as Partial<Record<ExpenseCategory, number>>);

  const spentINR = sum(expenses.map((e) => e.amountINR));
  const plannedINR = sum(EXPENSE_CATEGORIES.map((c) => planned[c]));

  const byCategory = EXPENSE_CATEGORIES.map((category) => {
    const allocatedINR = plan.allocations[category];
    const categorySpent = spentByCategory[category] ?? 0;
    return {
      category,
      allocatedINR,
      spentINR: categorySpent,
      plannedINR: planned[category],
      share: plan.totalINR ? allocatedINR / plan.totalINR : 0,
    };
  });

  // Projected exposure: for each category take the larger of what has been
  // spent and what the plan still implies, so neither is double counted away.
  const projectedINR = sum(byCategory.map((row) => Math.max(row.spentINR, row.plannedINR)));
  const remainingINR = plan.totalINR - spentINR;
  const ratio = plan.totalINR ? projectedINR / plan.totalINR : 0;

  const status: BudgetSummary['status'] = ratio > 1 ? 'over' : ratio >= BUDGET_WARNING_THRESHOLD ? 'watch' : 'healthy';
  const perPerson = Math.round(plan.totalINR / Math.max(1, preferences.travellers));

  const headline =
    status === 'over'
      ? `This plan projects about ${Math.round((ratio - 1) * 100)}% over your budget. Trim an activity day or drop a tier of accommodation.`
      : status === 'watch'
        ? `You are on track but close — roughly ${Math.round(ratio * 100)}% of the budget is already committed.`
        : `Comfortable so far: about ${Math.round(ratio * 100)}% committed, ${perPerson.toLocaleString('en-IN')} per traveller allocated.`;

  return { totalINR: plan.totalINR, plannedINR, spentINR, remainingINR, projectedINR, byCategory, status, headline };
}
