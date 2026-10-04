import { cn } from '@/utils/cn';

export function ProgressBar({
  value,
  max = 100,
  tone = 'saffron',
  label,
  className,
}: {
  value: number;
  max?: number;
  tone?: 'saffron' | 'jade' | 'danger' | 'warn' | 'ink';
  label?: string;
  className?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  const fill = {
    saffron: 'bg-saffron',
    jade: 'bg-jade',
    danger: 'bg-danger',
    warn: 'bg-warn',
    ink: 'bg-ink',
  }[tone];

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn('h-2 w-full overflow-hidden rounded-full bg-surface-2', className)}
    >
      <div className={cn('h-full rounded-full transition-[width] duration-700 ease-out', fill)} style={{ width: `${pct}%` }} />
    </div>
  );
}

export interface DonutSlice {
  id: string;
  label: string;
  value: number;
  color: string;
}

export function Donut({
  slices,
  size = 184,
  thickness = 22,
  centreLabel,
  centreValue,
  activeId,
  onHover,
}: {
  slices: DonutSlice[];
  size?: number;
  thickness?: number;
  centreLabel?: string;
  centreValue?: string;
  activeId?: string;
  onHover?: (id: string | undefined) => void;
}) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0) || 1;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={centreLabel ?? 'Breakdown'}>
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--surface-2))"
            strokeWidth={thickness}
          />
          {slices.map((slice) => {
            const length = (slice.value / total) * circumference;
            const dash = `${Math.max(0, length - 2)} ${circumference - Math.max(0, length - 2)}`;
            const element = (
              <circle
                key={slice.id}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={slice.color}
                strokeWidth={activeId === slice.id ? thickness + 4 : thickness}
                strokeDasharray={dash}
                strokeDashoffset={-offset}
                strokeLinecap="round"
                className="transition-[stroke-width,opacity] duration-200"
                opacity={activeId && activeId !== slice.id ? 0.35 : 1}
                onMouseEnter={() => onHover?.(slice.id)}
                onMouseLeave={() => onHover?.(undefined)}
              />
            );
            offset += length;
            return element;
          })}
        </g>
      </svg>
      {centreValue ? (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-display text-[22px] leading-none tabular-nums">{centreValue}</span>
          {centreLabel ? <span className="mt-1 text-[11.5px] uppercase tracking-wide text-ink-faint">{centreLabel}</span> : null}
        </div>
      ) : null}
    </div>
  );
}
