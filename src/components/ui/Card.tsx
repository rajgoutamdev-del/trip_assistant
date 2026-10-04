import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

export function Card({
  className,
  interactive,
  ...props
}: HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
  return (
    <div
      className={cn(
        'rounded-card border border-line bg-surface shadow-[var(--shadow-card)]',
        interactive && 'transition duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]',
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  title,
  subtitle,
  icon,
  action,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-start justify-between gap-4 px-5 pt-5', className)}>
      <div className="flex min-w-0 items-start gap-3">
        {icon ? (
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-ink-soft">
            {icon}
          </span>
        ) : null}
        <div className="min-w-0">
          <h3 className="truncate font-display text-[17px] leading-tight">{title}</h3>
          {subtitle ? <p className="mt-1 text-[13px] leading-snug text-ink-faint">{subtitle}</p> : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  description,
  action,
  as: Heading = 'h2',
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  /** Use 'h1' when this is the page's main title. */
  as?: 'h1' | 'h2';
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-saffron">{eyebrow}</p>
        ) : null}
        <Heading className="font-display text-2xl leading-tight sm:text-[28px]">{title}</Heading>
        {description ? <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
