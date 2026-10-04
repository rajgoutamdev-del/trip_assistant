import { useState } from 'react';
import { cn } from '@/utils/cn';

/**
 * Destination imagery. Two widths are shipped per destination, so the browser
 * can pick; a tinted placeholder holds the layout until the file decodes.
 */
export function Figure({
  src,
  srcSmall,
  alt,
  className,
  imgClassName,
  priority,
  sizes = '(max-width: 768px) 100vw, 50vw',
  overlay = true,
  children,
}: {
  src: string;
  srcSmall?: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  sizes?: string;
  overlay?: boolean;
  children?: React.ReactNode;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={cn('grain relative isolate overflow-hidden bg-surface-2', className)}>
      <img
        src={src}
        srcSet={srcSmall ? `${srcSmall} 560w, ${src} 1400w` : undefined}
        sizes={srcSmall ? sizes : undefined}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        onLoad={() => setLoaded(true)}
        className={cn(
          'h-full w-full object-cover transition-[opacity,transform] duration-700 ease-out',
          loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.04]',
          imgClassName,
        )}
      />
      {overlay ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0b0f14]/90 via-[#0b0f14]/45 to-[#0b0f14]/10"
        />
      ) : null}
      {children}
    </div>
  );
}
