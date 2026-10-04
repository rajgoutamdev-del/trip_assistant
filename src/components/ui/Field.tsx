import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

const CONTROL =
  'w-full rounded-xl border border-line bg-surface px-4 py-3 text-[15px] text-ink placeholder:text-ink-faint/70 ' +
  'transition focus:border-saffron focus:outline-none focus:ring-2 focus:ring-saffron/25';

export function Field({
  label,
  hint,
  error,
  children,
  htmlFor,
  className,
}: {
  label: string;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
  htmlFor?: string;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={htmlFor} className="block text-[13px] font-medium text-ink-soft">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-[12.5px] text-danger">{error}</p>
      ) : hint ? (
        <p className="text-[12.5px] leading-snug text-ink-faint">{hint}</p>
      ) : null}
    </div>
  );
}

export function TextField({
  label,
  hint,
  error,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: ReactNode; error?: string }) {
  const id = useId();
  return (
    <Field label={label} hint={hint} error={error} htmlFor={id} className={className}>
      <input id={id} aria-invalid={Boolean(error)} className={CONTROL} {...props} />
    </Field>
  );
}

export function SelectField({
  label,
  hint,
  error,
  options,
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  hint?: ReactNode;
  error?: string;
  options: { value: string; label: string }[];
}) {
  const id = useId();
  return (
    <Field label={label} hint={hint} error={error} htmlFor={id} className={className}>
      <div className="relative">
        <select id={id} className={cn(CONTROL, 'appearance-none pr-10')} {...props}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span aria-hidden className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-faint">
          ▾
        </span>
      </div>
    </Field>
  );
}

export function RangeField({
  label,
  valueLabel,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; valueLabel: string }) {
  const id = useId();
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-[13px] font-medium text-ink-soft">
          {label}
        </label>
        <span className="font-display text-xl tabular-nums">{valueLabel}</span>
      </div>
      <input
        id={id}
        type="range"
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-surface-2 accent-saffron"
        {...props}
      />
    </div>
  );
}
