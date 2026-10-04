import { useMemo, useState } from 'react';
import { Leaf, UtensilsCrossed } from 'lucide-react';
import { useTripContext } from '@/hooks/useTripContext';
import { travelAssistant } from '@/services/assistant/travelAssistant';
import { DishCard } from '@/components/destination/panels';
import { FilterPill } from '@/components/ui/Chip';
import { Card, CardHeader, SectionTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/States';
import { Badge } from '@/components/ui/Badge';

type Filter = 'recommended' | 'all' | 'veg' | 'must-try';

export default function FoodPage() {
  const { trip, destination } = useTripContext();
  const [filter, setFilter] = useState<Filter>('recommended');

  const recommended = useMemo(
    () => travelAssistant.recommendFood(destination, trip, destination.dishes.length),
    [destination, trip],
  );

  const dishes = useMemo(() => {
    switch (filter) {
      case 'recommended':
        return recommended.slice(0, 6);
      case 'veg':
        return recommended.filter((entry) => entry.dish.isVegetarian);
      case 'must-try':
        return recommended.filter((entry) => entry.dish.mustTry);
      default:
        return destination.dishes.map((dish) => ({ dish, why: undefined }));
    }
  }, [filter, recommended, destination.dishes]);

  const restrictions = trip.preferences.diet.filter((d) => d !== 'no-preference');

  return (
    <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-9">
      <SectionTitle
        eyebrow="Food & culture"
        title={`What to eat in ${destination.name}`}
        description="Dishes, not restaurant listings — with where to find them, what they cost and why they exist here."
      />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <FilterPill active={filter === 'recommended'} onClick={() => setFilter('recommended')}>
          Recommended for you
        </FilterPill>
        <FilterPill active={filter === 'must-try'} onClick={() => setFilter('must-try')}>
          Must try
        </FilterPill>
        <FilterPill active={filter === 'veg'} onClick={() => setFilter('veg')}>
          Vegetarian
        </FilterPill>
        <FilterPill active={filter === 'all'} onClick={() => setFilter('all')} count={destination.dishes.length}>
          Everything
        </FilterPill>
      </div>

      <Card className="mb-6 p-5">
        <div className="flex flex-wrap items-center gap-2.5">
          <UtensilsCrossed size={17} className="text-saffron" />
          <p className="text-[14px] text-ink-soft">
            Filtered for{' '}
            <strong className="text-ink">
              {restrictions.length ? restrictions.join(', ') : 'no dietary restrictions'}
            </strong>{' '}
            at <strong className="text-ink">{trip.preferences.spice}</strong> spice.
          </p>
          {restrictions.includes('vegan') ? (
            <Badge tone="jade" icon={<Leaf size={10} />}>
              Check for ghee and curd — both are common here
            </Badge>
          ) : null}
        </div>
        {destination.dishes.some((dish) => dish.mustTry) ? (
          <p className="mt-3 border-t border-line pt-3 text-[13.5px] leading-relaxed text-ink-soft">
            <strong className="text-ink">Don’t leave {destination.name} without trying</strong>{' '}
            {destination.dishes.filter((dish) => dish.mustTry).map((dish) => dish.name).join(', ')}.
          </p>
        ) : null}
      </Card>

      {dishes.length === 0 ? (
        <EmptyState
          icon={<UtensilsCrossed size={20} />}
          title="Nothing matches those restrictions"
          description="Switch to Everything to see the full list, or ask a kitchen directly — most will adapt a dish."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {dishes.map(({ dish, why }) => (
            <DishCard key={dish.id} dish={dish} why={why} />
          ))}
        </div>
      )}

      <Card className="mt-7">
        <CardHeader title="Eating etiquette here" subtitle="The things worth knowing before the first meal" />
        <ul className="space-y-3 px-5 pb-5 pt-3">
          {destination.safety.culturalNorms.map((norm) => (
            <li key={norm.id} className="text-[13.5px] leading-relaxed text-ink-soft">
              <strong className="font-medium text-ink">{norm.title}.</strong> {norm.detail}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
