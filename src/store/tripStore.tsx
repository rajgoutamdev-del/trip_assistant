import {
  createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode,
} from 'react';
import type {
  Destination, Expense, ItineraryDay, ItineraryItem, PackingItem,
  Trip, TripPreferences, Traveller,
} from '@/types';
import { getDestination } from '@/data/destinations';
import { buildBudgetPlan, suggestBudgetINR } from '@/services/planner/budget';
import { generatePackingList } from '@/services/planner/packing';
import { resequenceDay } from '@/services/planner/itinerary';
import { travelAssistant } from '@/services/assistant/travelAssistant';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { tripLengthDays } from '@/utils/dates';
import { uid } from '@/utils/misc';

const STORAGE_KEY = 'safar.state.v1';

/**
 * MVP session model: one demo traveller, no auth. `Traveller` is deliberately
 * the same shape a real authenticated user would have, so adding sign-in later
 * means swapping where this object comes from and nothing else.
 */
export const DEMO_TRAVELLER: Traveller = {
  id: 'demo-traveller',
  name: 'Traveller',
  homeCity: 'Pune',
  isDemo: true,
};

export interface DraftTrip {
  destinationId?: string;
  originCity: string;
  startDate?: string;
  endDate?: string;
  preferences: Partial<TripPreferences>;
  travellerName: string;
}

export const DEFAULT_PREFERENCES: TripPreferences = {
  travelType: 'couple',
  travellers: 2,
  budgetTotalINR: 30000,
  budgetTier: 'comfort',
  pace: 'balanced',
  interests: ['heritage', 'food'],
  diet: ['no-preference'],
  spice: 'medium',
  activities: ['walking-tours', 'markets'],
  stay: 'boutique',
  transport: 'cab',
  mobility: 'none',
  isInternationalVisitor: false,
  homeCurrency: 'INR',
};

interface PersistedState {
  traveller: Traveller;
  trips: Trip[];
  activeTripId?: string;
  nightMode: boolean;
}

const INITIAL_STATE: PersistedState = {
  traveller: DEMO_TRAVELLER,
  trips: [],
  nightMode: false,
};

interface TripStore extends PersistedState {
  activeTrip?: Trip;
  activeDestination?: Destination;
  planning: boolean;
  createTrip(draft: DraftTrip): Promise<Trip | undefined>;
  regenerateItinerary(tripId: string): Promise<void>;
  updateTraveller(patch: Partial<Traveller>): void;
  setActiveTrip(tripId: string): void;
  deleteTrip(tripId: string): void;
  setNightMode(on: boolean): void;
  /* Itinerary editing */
  updateItem(tripId: string, dayId: string, itemId: string, patch: Partial<ItineraryItem>): void;
  removeItem(tripId: string, dayId: string, itemId: string): void;
  addItem(tripId: string, dayId: string, item: Omit<ItineraryItem, 'id'>): void;
  moveItem(tripId: string, dayId: string, itemId: string, direction: -1 | 1): void;
  /* Budget */
  addExpense(tripId: string, expense: Omit<Expense, 'id'>): void;
  removeExpense(tripId: string, expenseId: string): void;
  setBudgetTotal(tripId: string, totalINR: number): void;
  /* Packing */
  togglePackingItem(tripId: string, itemId: string): void;
  addPackingItem(tripId: string, label: string, category: PackingItem['category']): void;
  removePackingItem(tripId: string, itemId: string): void;
  resetPacking(tripId: string): void;
}

const TripContext = createContext<TripStore | undefined>(undefined);

export function TripProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useLocalStorage<PersistedState>(STORAGE_KEY, INITIAL_STATE);
  const [planning, setPlanning] = useState(false);

  const patchTrip = useCallback(
    (tripId: string, update: (trip: Trip) => Trip) => {
      setState((prev) => ({
        ...prev,
        trips: prev.trips.map((trip) => (trip.id === tripId ? update(trip) : trip)),
      }));
    },
    [setState],
  );

  const patchDay = useCallback(
    (tripId: string, dayId: string, update: (day: ItineraryDay, trip: Trip) => ItineraryDay) => {
      patchTrip(tripId, (trip) => ({
        ...trip,
        itinerary: trip.itinerary.map((day) => (day.id === dayId ? update(day, trip) : day)),
      }));
    },
    [patchTrip],
  );

  const createTrip = useCallback(
    async (draft: DraftTrip): Promise<Trip | undefined> => {
      const destination = getDestination(draft.destinationId);
      if (!destination || !draft.startDate || !draft.endDate) return undefined;

      const preferences: TripPreferences = { ...DEFAULT_PREFERENCES, ...draft.preferences };
      const days = tripLengthDays(draft.startDate, draft.endDate);
      const budgetTotal =
        preferences.budgetTotalINR ||
        suggestBudgetINR(destination, preferences.budgetTier, preferences.travellers, days);

      setPlanning(true);
      try {
        const itinerary = await travelAssistant.planTrip({
          destination,
          preferences,
          startDate: draft.startDate,
          days,
          originCity: draft.originCity,
        });

        const trip: Trip = {
          id: uid('trip'),
          destinationId: destination.id,
          originCity: draft.originCity,
          startDate: draft.startDate,
          endDate: draft.endDate,
          preferences: { ...preferences, budgetTotalINR: budgetTotal },
          itinerary,
          expenses: [],
          packing: generatePackingList(destination, preferences, draft.startDate, days),
          budgetPlan: buildBudgetPlan(budgetTotal, preferences.budgetTier),
          createdAt: new Date().toISOString(),
        };

        setState((prev) => ({
          ...prev,
          traveller: { ...prev.traveller, name: draft.travellerName || prev.traveller.name, homeCity: draft.originCity },
          trips: [trip, ...prev.trips],
          activeTripId: trip.id,
        }));
        return trip;
      } finally {
        setPlanning(false);
      }
    },
    [setState],
  );

  const regenerateItinerary = useCallback(
    async (tripId: string) => {
      const trip = state.trips.find((t) => t.id === tripId);
      const destination = getDestination(trip?.destinationId);
      if (!trip || !destination) return;
      setPlanning(true);
      try {
        const itinerary = await travelAssistant.planTrip({
          destination,
          preferences: trip.preferences,
          startDate: trip.startDate,
          days: tripLengthDays(trip.startDate, trip.endDate),
          originCity: trip.originCity,
        });
        patchTrip(tripId, (current) => ({ ...current, itinerary }));
      } finally {
        setPlanning(false);
      }
    },
    [patchTrip, state.trips],
  );

  const activeTrip = useMemo(
    () => state.trips.find((trip) => trip.id === state.activeTripId) ?? state.trips[0],
    [state.trips, state.activeTripId],
  );

  const activeDestination = useMemo(() => getDestination(activeTrip?.destinationId), [activeTrip]);

  // Keep a stale activeTripId from breaking the dashboard after a delete.
  useEffect(() => {
    if (state.activeTripId && !state.trips.some((t) => t.id === state.activeTripId)) {
      setState((prev) => ({ ...prev, activeTripId: prev.trips[0]?.id }));
    }
  }, [state.activeTripId, state.trips, setState]);

  const value = useMemo<TripStore>(
    () => ({
      ...state,
      activeTrip,
      activeDestination,
      planning,
      createTrip,
      regenerateItinerary,
      updateTraveller: (patch) => setState((prev) => ({ ...prev, traveller: { ...prev.traveller, ...patch } })),
      setActiveTrip: (tripId) => setState((prev) => ({ ...prev, activeTripId: tripId })),
      deleteTrip: (tripId) =>
        setState((prev) => ({
          ...prev,
          trips: prev.trips.filter((trip) => trip.id !== tripId),
          activeTripId: prev.activeTripId === tripId ? undefined : prev.activeTripId,
        })),
      setNightMode: (on) => setState((prev) => ({ ...prev, nightMode: on })),

      updateItem: (tripId, dayId, itemId, patch) =>
        patchDay(tripId, dayId, (day, trip) =>
          resequenceDay(
            { ...day, items: day.items.map((item) => (item.id === itemId ? { ...item, ...patch } : item)) },
            trip.preferences.pace,
          ),
        ),

      removeItem: (tripId, dayId, itemId) =>
        patchDay(tripId, dayId, (day, trip) =>
          resequenceDay({ ...day, items: day.items.filter((item) => item.id !== itemId) }, trip.preferences.pace),
        ),

      addItem: (tripId, dayId, item) =>
        patchDay(tripId, dayId, (day, trip) =>
          resequenceDay({ ...day, items: [...day.items, { ...item, id: uid('item') }] }, trip.preferences.pace),
        ),

      moveItem: (tripId, dayId, itemId, direction) =>
        patchDay(tripId, dayId, (day, trip) => {
          const index = day.items.findIndex((item) => item.id === itemId);
          const target = index + direction;
          if (index < 0 || target < 0 || target >= day.items.length) return day;
          const items = [...day.items];
          [items[index], items[target]] = [items[target], items[index]];
          // Re-stamp order before resequencing, which sorts by start time.
          return resequenceDay(
            { ...day, items: items.map((item, i) => ({ ...item, startMinutes: i })) },
            trip.preferences.pace,
          );
        }),

      addExpense: (tripId, expense) =>
        patchTrip(tripId, (trip) => ({ ...trip, expenses: [{ ...expense, id: uid('exp') }, ...trip.expenses] })),

      removeExpense: (tripId, expenseId) =>
        patchTrip(tripId, (trip) => ({ ...trip, expenses: trip.expenses.filter((e) => e.id !== expenseId) })),

      setBudgetTotal: (tripId, totalINR) =>
        patchTrip(tripId, (trip) => ({
          ...trip,
          preferences: { ...trip.preferences, budgetTotalINR: totalINR },
          budgetPlan: buildBudgetPlan(totalINR, trip.preferences.budgetTier),
        })),

      togglePackingItem: (tripId, itemId) =>
        patchTrip(tripId, (trip) => ({
          ...trip,
          packing: trip.packing.map((item) => (item.id === itemId ? { ...item, checked: !item.checked } : item)),
        })),

      addPackingItem: (tripId, label, category) =>
        patchTrip(tripId, (trip) => ({
          ...trip,
          packing: [
            ...trip.packing,
            { id: uid('pack'), label, category, reason: 'Added by you.', essential: false, checked: false },
          ],
        })),

      removePackingItem: (tripId, itemId) =>
        patchTrip(tripId, (trip) => ({ ...trip, packing: trip.packing.filter((item) => item.id !== itemId) })),

      resetPacking: (tripId) =>
        patchTrip(tripId, (trip) => {
          const destination = getDestination(trip.destinationId);
          if (!destination) return trip;
          return {
            ...trip,
            packing: generatePackingList(
              destination,
              trip.preferences,
              trip.startDate,
              tripLengthDays(trip.startDate, trip.endDate),
            ),
          };
        }),
    }),
    [state, activeTrip, activeDestination, planning, createTrip, regenerateItinerary, patchTrip, patchDay, setState],
  );

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useTripStore(): TripStore {
  const store = useContext(TripContext);
  if (!store) throw new Error('useTripStore must be used inside <TripProvider>');
  return store;
}
