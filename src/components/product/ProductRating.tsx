import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductRatingProps {
  rating: number;
  reviewCount?: number;
  size?: 'sm' | 'md';
  className?: string;
}

export function ProductRating({
  rating,
  reviewCount,
  size = 'sm',
  className,
}: ProductRatingProps) {
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i < Math.floor(rating);
          const half = !filled && i < rating;
          return (
            <Star
              key={i}
              className={cn(
                iconSize,
                filled || half ? 'text-amber fill-amber' : 'text-muted-foreground/30'
              )}
              style={half ? { clipPath: 'inset(0 50% 0 0)', fill: 'var(--color-amber)' } : undefined}
            />
          );
        })}
      </div>
      <span className={cn('text-muted-foreground', size === 'sm' ? 'text-xs' : 'text-sm')}>
        {rating.toFixed(1)}
        {reviewCount !== undefined && ` (${reviewCount.toLocaleString()})`}
      </span>
    </div>
  );
}
