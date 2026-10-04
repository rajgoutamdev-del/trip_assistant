import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export function Stat({
  label,
  value,
  sub,
  tone,
  className,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  tone?: 'default' | 'danger' | 'jade' | 'warn';
  className?: string;
}) {
  const valueTone = {
    default: 'text-ink',
    danger: 'text-danger',
    jade: 'text-jade',
    warn: 'text-warn',
  }[tone ?? 'default'];

  return (
    <div className={cn('min-w-0', className)}>
      <dt className="text-[11.5px] font-medium uppercase tracking-[0.1em] text-ink-faint">{label}</dt>
      <dd className={cn('mt-1.5 font-display text-[21px] leading-none tabular-nums', valueTone)}>{value}</dd>
      {sub ? <p className="mt-1.5 text-[12.5px] leading-snug text-ink-faint">{sub}</p> : null}
    </div>
  );
}
