import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Loader } from 'lucide-react';
import {
  ActivitiesStep, BasicsStep, BudgetStep, DestinationStep, FoodStep, InterestsStep,
  LogisticsStep, SummaryStep, TravellersStep, type StepProps,
} from '@/components/onboarding/steps';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/States';
import { DEFAULT_PREFERENCES, useTripStore, type DraftTrip } from '@/store/tripStore';
import { DESTINATIONS } from '@/data/destinations';
import { addDays, todayISO } from '@/utils/dates';
import { cn } from '@/utils/cn';

interface Step {
  id: string;
  title: string;
  question: string;
  Component: (props: StepProps) => React.ReactElement;
  isValid: (draft: DraftTrip) => string | undefined;
}

const STEPS: Step[] = [
  {
    id: 'destination',
    title: 'Destination',
    question: 'Where are you travelling?',
    Component: DestinationStep,
    isValid: (draft) => (draft.destinationId ? undefined : 'Pick a destination to continue.'),
  },
  {
    id: 'basics',
    title: 'Dates',
    question: 'When, and where from?',
    Component: BasicsStep,
    isValid: (draft) => {
      if (!draft.startDate || !draft.endDate) return 'Add both dates to continue.';
      if (draft.endDate < draft.startDate) return 'The end date is before the start date.';
      return undefined;
    },
  },
  {
    id: 'travellers',
    title: 'Who',
    question: 'Who’s going?',
    Component: TravellersStep,
    isValid: (draft) => ((draft.preferences.travellers ?? 0) > 0 ? undefined : 'At least one traveller.'),
  },
  {
    id: 'budget',
    title: 'Budget',
    question: 'What’s the budget?',
    Component: BudgetStep,
    isValid: (draft) =>
      (draft.preferences.budgetTotalINR ?? 0) >= 2000 ? undefined : 'Set a budget of at least ₹2,000.',
  },
  {
    id: 'interests',
    title: 'Interests',
    question: 'What are you here for?',
    Component: InterestsStep,
    isValid: (draft) => ((draft.preferences.interests ?? []).length ? undefined : 'Pick at least one interest.'),
  },
  {
    id: 'food',
    title: 'Food',
    question: 'How do you eat?',
    Component: FoodStep,
    isValid: () => undefined,
  },
  {
    id: 'activities',
    title: 'Activities',
    question: 'What should your days look like?',
    Component: ActivitiesStep,
    isValid: () => undefined,
  },
  {
    id: 'logistics',
    title: 'Logistics',
    question: 'Stay and transport',
    Component: LogisticsStep,
    isValid: () => undefined,
  },
  {
    id: 'summary',
    title: 'Review',
    question: 'Ready to build your plan',
    Component: SummaryStep,
    isValid: () => undefined,
  },
];

const PLANNING_MESSAGES = [
  'Reading your preferences…',
  'Ranking places against your interests…',
  'Grouping each day by area to cut travel time…',
  'Slotting in meals that match your diet…',
  'Splitting your budget across categories…',
  'Building your packing list from the month and activities…',
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { createTrip, planning, traveller } = useTripStore();
  const [index, setIndex] = useState(0);
  const [error, setError] = useState<string>();
  const [failed, setFailed] = useState<string>();
  const [messageIndex, setMessageIndex] = useState(0);

  const [draft, setDraft] = useState<DraftTrip>(() => ({
    originCity: traveller.homeCity,
    travellerName: traveller.isDemo ? '' : traveller.name,
    startDate: addDays(todayISO(), 14),
    endDate: addDays(todayISO(), 17),
    preferences: { ...DEFAULT_PREFERENCES },
  }));

  const patch = useCallback((next: Partial<DraftTrip>) => {
    setDraft((prev) => ({ ...prev, ...next }));
    setError(undefined);
  }, []);

  const patchPrefs = useCallback((next: Partial<DraftTrip['preferences']>) => {
    setDraft((prev) => ({ ...prev, preferences: { ...prev.preferences, ...next } }));
    setError(undefined);
  }, []);

  const step = STEPS[index];
  const progress = ((index + 1) / STEPS.length) * 100;
  const destination = useMemo(() => DESTINATIONS.find((d) => d.id === draft.destinationId), [draft.destinationId]);

  useEffect(() => {
    if (!planning) return;
    const timer = window.setInterval(
      () => setMessageIndex((value) => Math.min(value + 1, PLANNING_MESSAGES.length - 1)),
      550,
    );
    return () => window.clearInterval(timer);
  }, [planning]);

  const goNext = async () => {
    const problem = step.isValid(draft);
    if (problem) {
      setError(problem);
      return;
    }
    if (index < STEPS.length - 1) {
      setIndex(index + 1);
      return;
    }
    setFailed(undefined);
    try {
      const trip = await createTrip(draft);
      if (!trip) {
        setFailed('The planner could not build a trip from those inputs. Check the destination and dates.');
        return;
      }
      navigate(`/trip/${trip.id}`, { replace: true });
    } catch (caught) {
      setFailed(caught instanceof Error ? caught.message : 'Something went wrong while planning.');
    }
  };

  if (planning) {
    return (
      <div className="mx-auto flex min-h-[70dvh] max-w-md flex-col items-center justify-center px-6 text-center">
        <Loader size={26} className="animate-spin text-saffron" aria-hidden />
        <h1 className="mt-5 font-display text-2xl leading-tight">
          Building your {destination?.name ?? 'trip'} plan
        </h1>
        <p aria-live="polite" className="mt-3 min-h-[3rem] text-[14.5px] leading-relaxed text-ink-soft">
          {PLANNING_MESSAGES[messageIndex]}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
      <header className="mb-6">
        <div className="flex items-center justify-between gap-4">
          <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-saffron">
            Step {index + 1} of {STEPS.length}
          </p>
          <Link to="/" className="text-[13px] text-ink-faint underline-offset-4 hover:text-ink hover:underline">
            Save for later
          </Link>
        </div>

        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-saffron transition-[width] duration-500 ease-out"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Onboarding progress"
          />
        </div>

        <nav aria-label="Onboarding steps" className="mt-3 -mx-4 overflow-x-auto px-4 scrollbar-none">
          <ol className="flex w-max gap-1.5">
            {STEPS.map((candidate, candidateIndex) => {
              const done = candidateIndex < index;
              const current = candidateIndex === index;
              return (
                <li key={candidate.id}>
                  <button
                    type="button"
                    disabled={candidateIndex > index}
                    onClick={() => setIndex(candidateIndex)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium transition',
                      current ? 'bg-ink text-paper' : done ? 'text-saffron hover:bg-saffron-soft' : 'text-ink-faint/60',
                    )}
                  >
                    {done ? <Check size={11} strokeWidth={3} /> : null}
                    {candidate.title}
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <h1 key={step.id} className="mt-6 animate-[var(--animate-rise)] font-display text-[28px] leading-tight sm:text-[34px]">
          {step.question}
        </h1>
      </header>

      <div key={`${step.id}-body`} className="animate-[var(--animate-fade)]">
        <step.Component draft={draft} patch={patch} patchPrefs={patchPrefs} />
      </div>

      {error ? (
        <p role="alert" className="mt-5 rounded-xl bg-danger-soft px-4 py-3 text-[13.5px] text-danger">
          {error}
        </p>
      ) : null}
      {failed ? <ErrorState className="mt-5" message={failed} onRetry={goNext} /> : null}

      <div className="safe-bottom sticky bottom-0 mt-8 flex items-center justify-between gap-3 border-t border-line bg-paper/95 py-4 backdrop-blur lg:static lg:border-0 lg:bg-transparent lg:backdrop-blur-none">
        <Button
          variant="ghost"
          onClick={() => (index === 0 ? navigate('/') : setIndex(index - 1))}
          className="shrink-0"
        >
          <ArrowLeft size={16} /> {index === 0 ? 'Home' : 'Back'}
        </Button>
        <Button onClick={goNext} size="lg" className="flex-1 sm:flex-none">
          {index === STEPS.length - 1 ? 'Build my plan' : 'Continue'} <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
}
