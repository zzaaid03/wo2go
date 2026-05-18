import { TrainFront } from 'lucide-react';

import { cn } from '@/lib/utils';

interface SiteLogoProps {
  size?: 'default' | 'large';
  className?: string;
}

export function SiteLogo({ size = 'default', className }: SiteLogoProps) {
  const large = size === 'large';

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div
        className={cn(
          'flex items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25',
          large ? 'size-16' : 'size-10'
        )}
      >
        <TrainFront
          className={cn(large ? 'size-8' : 'size-5')}
          strokeWidth={2.25}
          aria-hidden
        />
      </div>
      <span
        className={cn(
          'font-bold tracking-tight text-foreground',
          large ? 'text-4xl sm:text-5xl' : 'text-xl'
        )}
      >
        wo<span className="text-primary">2</span>go
      </span>
    </div>
  );
}

