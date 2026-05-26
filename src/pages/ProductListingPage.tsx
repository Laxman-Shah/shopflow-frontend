import { useMemo, useState, useEffect } from 'react';
import { SlidersHorizontal, LayoutGrid, List, ChevronDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductFilters } from '@/components/product/ProductFilters';
import { useFilterStore } from '@/store/filterStore';
import type { SortOption, Product } from '@/types';
import { productService } from '@/services/productService';
import { inventoryService } from '@/services/inventoryService';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest Arrivals' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

const PAGE_SIZE = 9;

export function ProductListingPage() {
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [backendProducts, setBackendProducts] = useState<Product[]>([]);

  const { category, priceRange, minRating, inStockOnly, sortBy, search, setSortBy, setSearch } =
    useFilterStore();

  useEffect(() => {
    loadProducts();
  }, [page, search, sortBy, category, priceRange, minRating, inStockOnly]);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      console.log('=== Loading products from backend ===');
      console.log('Search term:', search);
      console.log('Category:', category);
      console.log('Price range:', priceRange);
      console.log('Min rating:', minRating);
      console.log('In stock only:', inStockOnly);
      console.log('Page:', page);
      console.log('Page size:', PAGE_SIZE);

      const response = await productService.getProducts({
        keyword: search || undefined,
        categoryId: category !== 'all' ? category : undefined,
        minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
        maxPrice: priceRange[1] < 800 ? priceRange[1] : undefined,
        minRating: minRating > 0 ? minRating : undefined,
        page: page - 1,
        size: PAGE_SIZE,
      });

      console.log('=== Backend products response ===');
      console.log('Full response:', response);
      console.log('Response success:', response.success);
      console.log('Response data:', response.data);

      if (!response.success || !response.data) {
        console.error('Invalid response from backend');
        setBackendProducts([]);
        return;
      }

      // Backend returns ProductPageResponse with 'products' field
      const backendProductList = response.data.products || [];

      console.log('=== Backend products list ===');
      console.log('Products count:', backendProductList.length);
      console.log('Products data:', JSON.stringify(backendProductList, null, 2));

      // Map backend ProductListResponse to frontend Product type
      const mappedProducts: Product[] = backendProductList.map((p) => {
        console.log(`Mapping product: ${p.name}, category: ${p.categoryName}, thumbnail: ${p.thumbnailUrl}`);
        return {
          id: p.id,
          name: p.name,
          slug: p.id,
          price: p.price,
          description: p.description || '',
          category: p.categoryId || 'all', // Use actual category ID from backend
          images: p.thumbnailUrl ? [p.thumbnailUrl] : [],
          thumbnailUrl: p.thumbnailUrl,
          inStock: true, // Default to true, will update with inventory if available
          rating: (p as any).averageRating || 0,
          reviewCount: (p as any).reviewCount || 0,
          tags: [],
          specs: {},
          sellerId: p.sellerId,
          categoryId: p.categoryId,
          status: p.status,
          createdAt: p.createdAt,
        };
      });

      console.log('=== Mapped products ===');
      console.log('Mapped products count:', mappedProducts.length);
      console.log('Mapped products data:', JSON.stringify(mappedProducts, null, 2));

      // Temporarily skip inventory fetching to debug product display
      setBackendProducts(mappedProducts);

      console.log('=== Products set in state ===');
      console.log('backendProducts length:', mappedProducts.length);

      // Try to fetch inventory for each product to update stock status (non-blocking)
      const productsWithInventory = await Promise.all(
        mappedProducts.map(async (product) => {
          try {
            const inventoryResponse = await inventoryService.getInventoryByProduct(product.id);
            if (inventoryResponse.success && inventoryResponse.data) {
              const inventory = inventoryResponse.data;
              return {
                ...product,
                inStock: inventory.availableQuantity > 0,
                stockQuantity: inventory.availableQuantity,
                stockStatus: inventory.status,
              };
            }
          } catch (error) {
            // If inventory fetch fails, keep product visible with default inStock=true
            console.log(`No inventory for product ${product.id}, showing as available`);
          }
          return product;
        })
      );

      console.log('=== Products with inventory ===');
      console.log('Products with inventory count:', productsWithInventory.length);
      setBackendProducts(productsWithInventory);
    } catch (error) {
      console.error('Failed to load products:', error);
      setBackendProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = useMemo(() => {
    console.log('=== Filtering products ===');
    console.log('backendProducts length:', backendProducts.length);
    console.log('backendProducts:', backendProducts);

    let products = [...backendProducts];

    // Apply client-side filtering for rating and inStock (backend handles category and price)
    if (minRating > 0) {
      products = products.filter((p) => (p.rating || 0) >= minRating);
    }

    if (inStockOnly) {
      products = products.filter((p) => p.inStock);
    }

    console.log('After filtering, products length:', products.length);

    // Client-side sorting
    switch (sortBy) {
      case 'price-asc':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        products.sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
        break;
      default:
        // featured - keep as is
        break;
    }

    console.log('After sorting, products length:', products.length);
    console.log('Filtered products:', products);

    return products;
  }, [backendProducts, sortBy, minRating, inStockOnly]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  console.log('=== Pagination ===');
  console.log('totalPages:', totalPages);
  console.log('currentPage:', page);
  console.log('paginated length:', paginated.length);
  console.log('paginated:', paginated);

  const handlePageChange = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeFilterCount = [
    category !== 'all',
    priceRange[0] > 0 || priceRange[1] < 800,
    minRating > 0,
    inStockOnly,
  ].filter(Boolean).length;

  return (
    <div className="container-page py-8">
      {/* Page header */}
      <div className="mb-8">
        <nav className="text-xs text-gray-500 mb-3 flex items-center gap-2">
          <span>Home</span>
          <ChevronDown className="w-4 h-4 -rotate-90" />
          <span className="text-gray-900 font-medium">Footwear Collection</span>
          {category !== 'all' && (
            <>
              <ChevronDown className="w-4 h-4 -rotate-90" />
              <span className="text-gray-900 font-medium capitalize">{category}</span>
            </>
          )}
        </nav>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {category === 'all' ? 'Footwear Collection' : category.charAt(0).toUpperCase() + category.slice(1)}
        </h1>
        <p className="text-base text-gray-600">
          {filtered.length} product{filtered.length !== 1 ? 's' : ''} found
          {search && <span> for "<strong className="text-orange-500">{search}</strong>"</span>}
        </p>
      </div>

      <div className="flex gap-8">
        {/* Desktop filter sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <ProductFilters />
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6 gap-4">
            {/* Mobile filter */}
            <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
              <SheetTrigger className="lg:hidden flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="h-5 w-5 flex items-center justify-center text-xs bg-orange-500 text-white rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <ProductFilters onClose={() => setMobileFilterOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>

            {/* Search input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search products by name..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10 h-10 border-gray-300"
              />
            </div>

            <div className="flex items-center gap-3 ml-auto">
              {/* Sort */}
              <Select
                value={sortBy}
                onValueChange={(v) => { setSortBy(v as SortOption); setPage(1); }}
              >
                <SelectTrigger className="w-48 h-10 text-sm border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* View mode */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="icon"
                  className="h-10 w-10 rounded-none"
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="icon"
                  className="h-10 w-10 rounded-none"
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Product grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-square w-full rounded-2xl" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-5 w-1/2" />
                </div>
              ))}
            </div>
          ) : paginated.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p className="text-lg font-medium mb-2">No products found</p>
              <p className="text-sm">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'
                  : 'flex flex-col gap-4'
              }
            >
              {paginated.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <button
                      onClick={() => {
                        if (page > 1) handlePageChange(page - 1);
                      }}
                      disabled={page <= 1}
                      className="px-3 py-1 rounded border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                      if (idx > 0 && arr[idx - 1] !== p - 1) acc.push('ellipsis');
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) =>
                      p === 'ellipsis' ? (
                        <PaginationItem key={`e-${i}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      ) : (
                        <PaginationItem key={p}>
                          <button
                            onClick={() => handlePageChange(p)}
                            className={`px-3 py-1 rounded border ${p === page ? 'bg-orange-500 text-white' : 'hover:bg-gray-100'}`}
                          >
                            {p}
                          </button>
                        </PaginationItem>
                      )
                    )}
                  <PaginationItem>
                    <button
                      onClick={() => {
                        if (page < totalPages) handlePageChange(page + 1);
                      }}
                      disabled={page >= totalPages}
                      className="px-3 py-1 rounded border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ProductListingPageSkeleton() {
  return (
    <div className="container-page py-8">
      <div className="flex gap-6">
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        </aside>
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
