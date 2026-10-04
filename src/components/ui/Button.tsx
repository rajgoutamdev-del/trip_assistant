import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { cn } from '@/utils/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type Size = 'sm' | 'md' | 'lg';

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-[transform,background-color,color,box-shadow] duration-200 ' +
  'disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] whitespace-nowrap';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-ink text-paper hover:bg-ink/90 shadow-[0_1px_2px_rgba(0,0,0,0.12)]',
  secondary: 'bg-saffron text-[#231404] hover:brightness-105 shadow-[0_1px_2px_rgba(0,0,0,0.1)]',
  outline: 'border border-line-strong bg-surface text-ink hover:bg-surface-2',
  ghost: 'text-ink-soft hover:bg-surface-2 hover:text-ink',
  danger: 'bg-danger text-white hover:brightness-110',
};

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-4 text-[13px]',
  md: 'h-11 px-5 text-sm',
  lg: 'h-13 px-7 text-[15px]',
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  full?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & CommonProps>(
  ({ variant = 'primary', size = 'md', full, className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(BASE, VARIANTS[variant], SIZES[size], full && 'w-full', className)}
      {...props}
    />
  ),
);
Button.displayName = 'Button';

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  full,
  className,
  ...props
}: LinkProps & CommonProps) {
  return (
    <Link className={cn(BASE, VARIANTS[variant], SIZES[size], full && 'w-full', className)} {...props} />
  );
}

export function IconButton({
  label,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-soft transition hover:bg-surface-2 hover:text-ink active:scale-95',
        className,
      )}
      {...props}
    />
  );
}
