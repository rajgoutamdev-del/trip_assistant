import { ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

/** <details> gives keyboard support and open/close animation for free. */
export function Disclosure({
  summary,
  meta,
  children,
  defaultOpen,
  className,
}: {
  summary: ReactNode;
  meta?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  return (
    <details open={defaultOpen} className={cn('group border-b border-line last:border-0', className)}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0">
          <div className="text-[15px] font-medium leading-snug text-ink">{summary}</div>
          {meta ? <div className="mt-1 text-[13px] text-ink-faint">{meta}</div> : null}
        </div>
        <ChevronDown
          size={18}
          aria-hidden
          className="shrink-0 text-ink-faint transition-transform duration-300 group-open:rotate-180"
        />
      </summary>
      <div className="animate-[var(--animate-fade)] pb-4 text-[14px] leading-relaxed text-ink-soft">{children}</div>
    </details>
  );
}
