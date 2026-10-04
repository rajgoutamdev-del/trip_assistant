import { useMemo, useState } from 'react';
import { Plus, Receipt, Trash2, TriangleAlert } from 'lucide-react';
import type { ExpenseCategory } from '@/types';
import { useTripContext } from '@/hooks/useTripContext';
import { useTripStore } from '@/store/tripStore';
import {
  BUDGET_WARNING_THRESHOLD, CATEGORY_LABELS, EXPENSE_CATEGORIES, summariseBudget,
} from '@/services/planner/budget';
import { currencyProvider, CURRENCY_TIPS, SUPPORTED_CURRENCIES } from '@/services/providers/currency';
import { Card, CardHeader, SectionTitle } from '@/components/ui/Card';
import { Donut, ProgressBar } from '@/components/ui/Progress';
import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';
import { RangeField, SelectField, TextField } from '@/components/ui/Field';
import { Stat } from '@/components/ui/Stat';
import { Badge } from '@/components/ui/Badge';
import { DataSourceNote, EmptyState } from '@/components/ui/States';
import { useAsync } from '@/hooks/useAsync';
import { tripLengthDays, todayISO } from '@/utils/dates';
import { formatCurrency, formatDate, formatINR } from '@/utils/format';

const CATEGORY_COLOR: Record<ExpenseCategory, string> = {
  accommodation: 'hsl(var(--indigo))',
  food: 'hsl(var(--jade))',
  transport: 'hsl(var(--saffron))',
  activities: 'hsl(var(--clay))',
  shopping: 'hsl(var(--warn))',
  other: 'hsl(var(--ink-faint))',
};

export default function BudgetPage() {
  const { trip, destination } = useTripContext();
  const { addExpense, removeExpense, setBudgetTotal } = useTripStore();

  const [adding, setAdding] = useState(false);
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayISO());
  const [hovered, setHovered] = useState<string>();
  const [showConverter, setShowConverter] = useState(trip.preferences.isInternationalVisitor);
  const [quote, setQuote] = useState(trip.preferences.homeCurrency === 'INR' ? 'USD' : trip.preferences.homeCurrency);

  const days = tripLengthDays(trip.startDate, trip.endDate);
  const budget = summariseBudget(trip.budgetPlan, trip.expenses, trip.itinerary, trip.preferences, days);

  const rate = useAsync(() => currencyProvider.getRate('INR', quote), [quote]);

  const slices = useMemo(
    () =>
      budget.byCategory
        .filter((row) => row.allocatedINR > 0)
        .map((row) => ({
          id: row.category,
          label: CATEGORY_LABELS[row.category],
          value: row.allocatedINR,
          color: CATEGORY_COLOR[row.category],
        })),
    [budget.byCategory],
  );

  const submit = () => {
    const amountINR = Number(amount);
    if (!label.trim() || !Number.isFinite(amountINR) || amountINR <= 0) return;
    addExpense(trip.id, { category, label: label.trim(), amountINR, date });
    setLabel('');
    setAmount('');
    setAdding(false);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-9">
      <SectionTitle
        eyebrow="Budget"
        title={`${formatINR(budget.totalINR)} for ${days} days`}
        description={`Allocation is derived from your ${trip.preferences.budgetTier} tier. Expenses you log are tracked against it per category.`}
        action={
          <Button size="sm" onClick={() => setAdding(true)}>
            <Plus size={14} /> Add expense
          </Button>
        }
      />

      {budget.status !== 'healthy' ? (
        <div
          role="status"
          className={`mb-5 flex items-start gap-3 rounded-card border p-4 ${
            budget.status === 'over' ? 'border-danger/30 bg-danger-soft/50' : 'border-warn/30 bg-warn-soft/50'
          }`}
        >
          <TriangleAlert size={18} className={`mt-0.5 shrink-0 ${budget.status === 'over' ? 'text-danger' : 'text-warn'}`} />
          <div>
            <p className="text-[14.5px] font-medium text-ink">
              {budget.status === 'over' ? 'Projected over budget' : `Over ${Math.round(BUDGET_WARNING_THRESHOLD * 100)}% committed`}
            </p>
            <p className="mt-1 text-[13.5px] leading-relaxed text-ink-soft">{budget.headline}</p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr] [&>*]:min-w-0">
        <Card className="p-5">
          <div className="flex flex-wrap items-center gap-6">
            <Donut
              slices={slices}
              activeId={hovered}
              onHover={setHovered}
              centreValue={formatINR(budget.totalINR)}
              centreLabel="Total budget"
            />
            <ul className="min-w-[180px] flex-1 space-y-2">
              {budget.byCategory.map((row) => (
                <li
                  key={row.category}
                  onMouseEnter={() => setHovered(row.category)}
                  onMouseLeave={() => setHovered(undefined)}
                  className="flex items-center justify-between gap-3 text-[13px]"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      aria-hidden
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: CATEGORY_COLOR[row.category] }}
                    />
                    <span className="truncate text-ink-soft">{CATEGORY_LABELS[row.category]}</span>
                  </span>
                  <span className="shrink-0 font-medium tabular-nums text-ink">{formatINR(row.allocatedINR)}</span>
                </li>
              ))}
            </ul>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-5 border-t border-line pt-5 sm:grid-cols-4">
            <Stat label="Total" value={formatINR(budget.totalINR)} />
            <Stat label="Spent" value={formatINR(budget.spentINR)} sub={`${trip.expenses.length} entries`} />
            <Stat
              label="Remaining"
              value={formatINR(budget.remainingINR)}
              tone={budget.remainingINR < 0 ? 'danger' : 'jade'}
            />
            <Stat
              label="Projected"
              value={formatINR(budget.projectedINR)}
              sub="Spent plus what the plan implies"
              tone={budget.projectedINR > budget.totalINR ? 'warn' : 'default'}
            />
          </dl>

          <div className="mt-6 border-t border-line pt-5">
            <RangeField
              label="Adjust total budget"
              valueLabel={formatINR(trip.budgetPlan.totalINR)}
              min={2000}
              max={400000}
              step={500}
              value={trip.budgetPlan.totalINR}
              onChange={(event) => setBudgetTotal(trip.id, Number(event.target.value))}
            />
            <p className="mt-2 text-[12px] text-ink-faint">
              A {trip.preferences.budgetTier} trip to {destination.name} typically runs{' '}
              {formatINR(destination.dailyBudgetINR[trip.preferences.budgetTier])} per person per day.
            </p>
          </div>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader title="Category tracking" subtitle="Allocation versus what you have actually spent" />
            <ul className="space-y-4 px-5 pb-5 pt-4">
              {budget.byCategory.map((row) => {
                const over = row.spentINR > row.allocatedINR && row.allocatedINR > 0;
                return (
                  <li key={row.category}>
                    <div className="flex items-baseline justify-between gap-3 text-[13.5px]">
                      <span className="font-medium text-ink">{CATEGORY_LABELS[row.category]}</span>
                      <span className="tabular-nums text-ink-soft">
                        {formatINR(row.spentINR)}{' '}
                        <span className="text-ink-faint">/ {formatINR(row.allocatedINR)}</span>
                      </span>
                    </div>
                    <ProgressBar
                      className="mt-2"
                      value={row.spentINR}
                      max={Math.max(1, row.allocatedINR)}
                      tone={over ? 'danger' : 'jade'}
                      label={`${CATEGORY_LABELS[row.category]} spend`}
                    />
                    {row.plannedINR > 0 ? (
                      <p
                        className={`mt-1.5 text-[11.5px] ${
                          row.plannedINR > row.allocatedINR ? 'font-medium text-warn' : 'text-ink-faint'
                        }`}
                      >
                        Your itinerary implies about {formatINR(row.plannedINR)} in this category
                        {row.plannedINR > row.allocatedINR ? ' — more than you have allocated to it' : ''}.
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card>
            <CardHeader
              title="Expenses"
              subtitle={trip.expenses.length ? `${trip.expenses.length} logged` : 'Nothing logged yet'}
              icon={<Receipt size={16} />}
              action={
                <Button variant="outline" size="sm" onClick={() => setAdding(true)}>
                  <Plus size={13} /> Add
                </Button>
              }
            />
            {trip.expenses.length === 0 ? (
              <EmptyState
                className="py-8"
                title="No expenses yet"
                description="Log what you actually spend and the categories above fill in. Everything stays on this device."
              />
            ) : (
              <ul className="divide-y divide-line px-5 pb-4">
                {trip.expenses.map((expense) => (
                  <li key={expense.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-medium text-ink">{expense.label}</p>
                      <p className="mt-0.5 text-[12px] text-ink-faint">
                        {CATEGORY_LABELS[expense.category]} · {formatDate(expense.date)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="font-display text-[15px] tabular-nums">{formatINR(expense.amountINR)}</span>
                      <button
                        type="button"
                        onClick={() => removeExpense(trip.id, expense.id)}
                        aria-label={`Delete ${expense.label}`}
                        className="rounded-full p-1.5 text-ink-faint transition hover:bg-danger-soft hover:text-danger"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <CardHeader
              title="Currency"
              subtitle="For international travellers budgeting in another currency"
              action={
                <Button variant="ghost" size="sm" onClick={() => setShowConverter((open) => !open)}>
                  {showConverter ? 'Hide' : 'Show'}
                </Button>
              }
            />
            {showConverter ? (
              <div className="space-y-4 px-5 pb-5 pt-3">
                <SelectField
                  label="Convert to"
                  value={quote}
                  onChange={(event) => setQuote(event.target.value)}
                  options={SUPPORTED_CURRENCIES.filter((code) => code !== 'INR').map((code) => ({
                    value: code,
                    label: code,
                  }))}
                />
                {rate.data ? (
                  <>
                    <div className="rounded-2xl bg-surface-2 p-4">
                      <p className="text-[12.5px] text-ink-faint">Your total budget</p>
                      <p className="mt-1 font-display text-[24px] tabular-nums">
                        {formatCurrency(trip.budgetPlan.totalINR * rate.data.data.rate, quote)}
                      </p>
                      <p className="mt-1.5 text-[12px] text-ink-faint tabular-nums">
                        ₹100 ≈ {formatCurrency(100 * rate.data.data.rate, quote)}
                      </p>
                    </div>
                    <DataSourceNote envelope={rate.data} />
                  </>
                ) : null}
                <ul className="space-y-2">
                  {CURRENCY_TIPS.map((tip, index) => (
                    <li key={index} className="flex gap-2.5 text-[13px] leading-relaxed text-ink-soft">
                      <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-saffron" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </Card>
        </div>
      </div>

      <Sheet
        open={adding}
        onClose={() => setAdding(false)}
        title="Log an expense"
        description="Amounts are in rupees. This is stored on this device only."
        footer={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setAdding(false)} full>
              Cancel
            </Button>
            <Button onClick={submit} disabled={!label.trim() || !Number(amount)} full>
              Add expense
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <TextField
            label="What was it?"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder="Auto to Amber Fort"
            autoFocus
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Amount (₹)"
              type="number"
              min={1}
              step={10}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0"
            />
            <TextField label="Date" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </div>
          <div>
            <p className="mb-2 text-[13px] font-medium text-ink-soft">Category</p>
            <div className="flex flex-wrap gap-2">
              {EXPENSE_CATEGORIES.map((candidate) => (
                <button
                  key={candidate}
                  type="button"
                  onClick={() => setCategory(candidate)}
                  aria-pressed={category === candidate}
                  className={`rounded-full border px-3.5 py-2 text-[13px] font-medium transition ${
                    category === candidate
                      ? 'border-ink bg-ink text-paper'
                      : 'border-line text-ink-soft hover:border-line-strong hover:text-ink'
                  }`}
                >
                  {CATEGORY_LABELS[candidate]}
                </button>
              ))}
            </div>
          </div>
          {Number(amount) > 0 ? (
            <p className="rounded-xl bg-surface-2 px-4 py-3 text-[13px] text-ink-soft">
              After this, {formatINR(budget.remainingINR - Number(amount))} would remain of{' '}
              {formatINR(budget.totalINR)}.{' '}
              {budget.remainingINR - Number(amount) < 0 ? (
                <Badge tone="danger">That puts you over budget</Badge>
              ) : null}
            </p>
          ) : null}
        </div>
      </Sheet>
    </div>
  );
}
