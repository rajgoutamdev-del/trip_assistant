import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';

export function Logo({ className, size = 20 }: { className?: string; size?: number }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden className="shrink-0">
        <rect width="32" height="32" rx="9" fill="currentColor" />
        <path
          d="M16 6.5c4.2 0 7.6 3.2 7.6 7.2 0 5-5.3 9.8-7.1 11.3a.75.75 0 0 1-.98 0C13.7 23.5 8.4 18.7 8.4 13.7c0-4 3.4-7.2 7.6-7.2z"
          fill="hsl(var(--saffron))"
        />
        <circle cx="16" cy="13.6" r="2.7" fill="currentColor" />
      </svg>
      <span className="font-display text-[19px] font-semibold tracking-tight">Safar</span>
    </span>
  );
}

export function BrandLink({ className }: { className?: string }) {
  return (
    <Link to="/" aria-label="Safar home" className={cn('text-ink transition hover:opacity-80', className)}>
      <Logo />
    </Link>
  );
}
