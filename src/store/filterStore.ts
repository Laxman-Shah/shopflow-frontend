import { create } from 'zustand';
import type { FilterState, SortOption, CategoryFilter } from '@/types';
import { PRICE_MAX } from '@/data/mockProducts';

interface FilterStore extends FilterState {
  setCategory: (category: CategoryFilter) => void;
  setPriceRange: (range: [number, number]) => void;
  setMinRating: (rating: number) => void;
  setInStockOnly: (val: boolean) => void;
  setSortBy: (sort: SortOption) => void;
  setSearch: (q: string) => void;
  resetFilters: () => void;
}

const defaults: FilterState = {
  category: 'all',
  priceRange: [0, PRICE_MAX],
  minRating: 0,
  inStockOnly: false,
  sortBy: 'featured',
  search: '',
};

export const useFilterStore = create<FilterStore>((set) => ({
  ...defaults,
  setCategory: (category) => set({ category }),
  setPriceRange: (priceRange) => set({ priceRange }),
  setMinRating: (minRating) => set({ minRating }),
  setInStockOnly: (inStockOnly) => set({ inStockOnly }),
  setSortBy: (sortBy) => set({ sortBy }),
  setSearch: (search) => set({ search }),
  resetFilters: () => set(defaults),
}));
