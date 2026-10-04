import type { ReactNode } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/utils/cn';

export function ChoiceChip({
  selected,
  onToggle,
  children,
  hint,
  emoji,
  className,
}: {
  selected: boolean;
  onToggle: () => void;
  children: ReactNode;
  hint?: string;
  emoji?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={onToggle}
      className={cn(
        'group relative flex items-start gap-3 rounded-2xl border px-4 py-3 text-left transition duration-200',
        selected
          ? 'border-saffron bg-saffron-soft/70 shadow-[0_0_0_1px_hsl(var(--saffron)/0.5)]'
          : 'border-line bg-surface hover:border-line-strong hover:bg-surface-2',
        className,
      )}
    >
      {emoji ? <span className="text-lg leading-none" aria-hidden>{emoji}</span> : null}
      <span className="min-w-0 flex-1">
        <span className="block text-[14.5px] font-medium leading-snug text-ink">{children}</span>
        {hint ? <span className="mt-0.5 block text-[12.5px] leading-snug text-ink-faint">{hint}</span> : null}
      </span>
      <span
        aria-hidden
        className={cn(
          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition',
          selected ? 'border-saffron bg-saffron text-[#231404]' : 'border-line-strong text-transparent',
        )}
      >
        <Check size={13} strokeWidth={3} />
      </span>
    </button>
  );
}

export function FilterPill({
  active,
  onClick,
  children,
  count,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  count?: number;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] font-medium transition',
        active
          ? 'border-ink bg-ink text-paper'
          : 'border-line bg-surface text-ink-soft hover:border-line-strong hover:text-ink',
      )}
    >
      {children}
      {count !== undefined ? (
        <span className={cn('tabular-nums text-[11.5px]', active ? 'text-paper/70' : 'text-ink-faint')}>{count}</span>
      ) : null}
    </button>
  );
}
