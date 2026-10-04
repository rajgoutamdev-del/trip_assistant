import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

type Tone = 'neutral' | 'saffron' | 'jade' | 'danger' | 'warn' | 'indigo';

const TONES: Record<Tone, string> = {
  neutral: 'bg-surface-2 text-ink-soft',
  saffron: 'bg-saffron-soft text-saffron',
  jade: 'bg-jade-soft text-jade',
  danger: 'bg-danger-soft text-danger',
  warn: 'bg-warn-soft text-warn',
  indigo: 'bg-surface-2 text-indigo',
};

export function Badge({
  children,
  tone = 'neutral',
  icon,
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-medium leading-none',
        TONES[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

export function MetaRow({ items, className }: { items: (ReactNode | undefined | false)[]; className?: string }) {
  const visible = items.filter(Boolean);
  return (
    <div className={cn('flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px] text-ink-faint', className)}>
      {visible.map((item, index) => (
        <span key={index} className="inline-flex items-center gap-2">
          {index > 0 ? <span aria-hidden className="text-line-strong">·</span> : null}
          {item}
        </span>
      ))}
    </div>
  );
}
