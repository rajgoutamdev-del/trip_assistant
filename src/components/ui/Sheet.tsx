import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { IconButton } from './Button';
import { cn } from '@/utils/cn';

/**
 * One dialog component used for both desktop modals and mobile bottom sheets.
 * Native <dialog> handles focus trapping, Escape and the backdrop for free.
 */
export function Sheet({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const width = { sm: 'sm:max-w-md', md: 'sm:max-w-xl', lg: 'sm:max-w-3xl' }[size];

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      aria-label={title}
      className={cn(
        'backdrop:bg-ink/45 backdrop:backdrop-blur-sm',
        'fixed bottom-0 left-0 right-0 top-auto m-0 w-full max-w-none translate-y-0 rounded-t-3xl border border-line bg-surface p-0 text-ink shadow-[var(--shadow-lift)]',
        'open:animate-[var(--animate-rise)]',
        'sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[calc(100%-2rem)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl',
        width,
      )}
    >
      <div className="flex max-h-[86vh] flex-col sm:max-h-[80vh]">
        <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <h2 className="font-display text-lg leading-tight">{title}</h2>
            {description ? <p className="mt-1 text-[13px] text-ink-faint">{description}</p> : null}
          </div>
          <IconButton label="Close" onClick={onClose}>
            <X size={18} />
          </IconButton>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer ? <footer className="safe-bottom border-t border-line px-5 py-4">{footer}</footer> : null}
      </div>
    </dialog>
  );
}
