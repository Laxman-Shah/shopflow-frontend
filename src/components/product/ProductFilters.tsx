import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { useFilterStore } from '@/store/filterStore';
import { PRICE_MAX } from '@/data/mockProducts';
import { categoryService } from '@/services/categoryService';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function ProductFilters({ onClose }: { onClose?: () => void }) {
  const {
    category,
    priceRange,
    minRating,
    inStockOnly,
    setCategory,
    setPriceRange,
    setMinRating,
    setInStockOnly,
    resetFilters,
  } = useFilterStore();

  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const response = await categoryService.getAllCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Filters</h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-muted-foreground gap-1"
          onClick={() => { resetFilters(); onClose?.(); }}
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </Button>
      </div>

      <Separator />

      {/* Category */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Category
        </h4>
        {isLoadingCategories ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <p className="text-sm text-muted-foreground px-3 py-2">No categories available</p>
        ) : (
          <div className={cn(
            'space-y-1',
            categories.length > 5 && 'max-h-48 overflow-y-auto pr-2'
          )}>
            <button
              className={cn(
                'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                category === 'all'
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'hover:bg-muted text-foreground'
              )}
              onClick={() => setCategory('all')}
            >
              All Products
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                  category === cat.id
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'hover:bg-muted text-foreground'
                )}
                onClick={() => setCategory(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Price range */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Price Range
        </h4>
        <Slider
          min={0}
          max={PRICE_MAX}
          step={10}
          value={priceRange}
          onValueChange={(v) => setPriceRange(v as [number, number])}
          className="mt-2"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1] === PRICE_MAX ? `${PRICE_MAX}+` : priceRange[1]}</span>
        </div>
      </div>

      <Separator />

      {/* Minimum rating */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Minimum Rating
        </h4>
        <div className="space-y-1">
          {[4, 3, 2, 0].map((r) => (
            <button
              key={r}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
                minRating === r
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'hover:bg-muted'
              )}
              onClick={() => setMinRating(r)}
            >
              {r === 0 ? (
                <span className="text-muted-foreground">All ratings</span>
              ) : (
                <>
                  <div className="flex">
                    {Array.from({ length: r }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 text-amber fill-amber" />
                    ))}
                  </div>
                  <span>{r}+ stars</span>
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Availability */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Availability
        </h4>
        <div className="flex items-center gap-2 px-1">
          <Checkbox
            id="in-stock"
            checked={inStockOnly}
            onCheckedChange={(v) => setInStockOnly(Boolean(v))}
          />
          <Label htmlFor="in-stock" className="text-sm cursor-pointer">
            In stock only
          </Label>
        </div>
      </div>

      {onClose && (
        <>
          <Separator />
          <Button className="w-full" onClick={onClose}>
            Apply Filters
          </Button>
        </>
      )}
    </div>
  );
}
