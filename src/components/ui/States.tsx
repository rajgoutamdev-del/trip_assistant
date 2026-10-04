import type { ReactNode } from 'react';
import { AlertTriangle, Info, RotateCw } from 'lucide-react';
import type { DataEnvelope } from '@/types';
import { Button } from './Button';
import { cn } from '@/utils/cn';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-[var(--animate-shimmer)] rounded-lg bg-surface-2', className)} />;
}

export function SkeletonLines({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2.5', className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className={cn('h-3.5', i === lines - 1 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  as: Heading = 'h3',
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  /** Use 'h1' when the empty state is the whole page. */
  as?: 'h1' | 'h2' | 'h3';
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-12 text-center', className)}>
      {icon ? (
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-2 text-ink-faint">
          {icon}
        </span>
      ) : null}
      <Heading className="font-display text-lg">{title}</Heading>
      {description ? <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-ink-faint">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  className,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div className={cn('rounded-card border border-danger/30 bg-danger-soft/50 p-5', className)}>
      <div className="flex items-start gap-3">
        <AlertTriangle size={18} className="mt-0.5 shrink-0 text-danger" />
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
          {message ? <p className="mt-1 text-[13.5px] leading-relaxed text-ink-soft">{message}</p> : null}
        </div>
      </div>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-4">
          <RotateCw size={14} /> Try again
        </Button>
      ) : null}
    </div>
  );
}

/**
 * The honesty component. Every provider-backed panel renders this so a
 * traveller always knows whether they are looking at live data or a sample.
 */
export function DataSourceNote({
  envelope,
  className,
  compact,
}: {
  envelope: Pick<DataEnvelope<unknown>, 'source' | 'provider' | 'note'> | undefined;
  className?: string;
  compact?: boolean;
}) {
  if (!envelope) return null;
  const demo = envelope.source === 'demo';

  if (compact) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium',
          demo ? 'bg-warn-soft text-warn' : 'bg-jade-soft text-jade',
          className,
        )}
        title={envelope.note ?? envelope.provider}
      >
        <span aria-hidden className={cn('h-1.5 w-1.5 rounded-full', demo ? 'bg-warn' : 'bg-jade')} />
        {demo ? 'Sample data' : 'Live'}
      </span>
    );
  }

  return (
    <div
      className={cn(
        'flex items-start gap-2.5 rounded-xl px-3.5 py-2.5 text-[12.5px] leading-snug',
        demo ? 'bg-warn-soft/70 text-ink-soft' : 'bg-jade-soft/70 text-ink-soft',
        className,
      )}
    >
      <Info size={14} className={cn('mt-0.5 shrink-0', demo ? 'text-warn' : 'text-jade')} />
      <p>
        <strong className="font-semibold text-ink">
          {demo ? 'Live data unavailable — showing sample information.' : `Live from ${envelope.provider}.`}
        </strong>{' '}
        {envelope.note}
      </p>
    </div>
  );
}

export function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-card border border-dashed border-line-strong bg-surface-2/50 p-5">
      <div className="flex items-center gap-2">
        <h3 className="font-display text-[16px]">{title}</h3>
        <span className="rounded-full bg-surface px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-ink-faint">
          Integration ready
        </span>
      </div>
      <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">{description}</p>
    </div>
  );
}
