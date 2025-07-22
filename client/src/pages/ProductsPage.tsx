import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Loader2, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FilterBar from '@/components/products/FilterBar';
import SortDropdown from '@/components/products/SortDropdown';
import ProductCard from '@/components/products/ProductCard';
import { fetchProductsWithAnalytics, selectProduct, clearFilters } from '@/store/slices/productsPageSlice';
import type { RootState, AppDispatch } from '@/store';
import type { EnrichedProduct } from '@/store/slices/productsPageSlice';

const ProductsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    products,
    selectedProduct,
    filters,
    sorting,
    loading,
    error,
    categories,
    vendors
  } = useSelector((state: RootState) => state.productsPage);

  useEffect(() => {
    dispatch(fetchProductsWithAnalytics());
  }, [dispatch]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    // Apply filters
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query)
      );
    }

    if (filters.category) {
      // Note: In a real app, you'd join with categories table
      // For now, we'll filter by categoryId matching category names
      const categoryMap: Record<string, number> = {
        'Electronics': 1,
        'Gaming': 2,
        'Wearables': 3,
        'Computer Accessories': 4
      };
      const categoryId = categoryMap[filters.category];
      if (categoryId) {
        filtered = filtered.filter(product => product.categoryId === categoryId);
      }
    }

    if (filters.vendor) {
      // Similar mapping for vendors
      const vendorMap: Record<string, number> = {
        'TechCorp': 1,
        'GameSupply': 2,
        'WearableTech': 3,
        'AccessoryPro': 4
      };
      const vendorId = vendorMap[filters.vendor];
      if (vendorId) {
        filtered = filtered.filter(product => product.vendorId === vendorId);
      }
    }

    if (filters.ratingRange) {
      const [min, max] = filters.ratingRange;
      filtered = filtered.filter(product => {
        const rating = parseFloat(product.rating || '0');
        return rating >= min && rating <= max;
      });
    }

    if (filters.priceRange) {
      const [min, max] = filters.priceRange;
      filtered = filtered.filter(product => {
        const price = parseFloat(product.price);
        return price >= min && price <= max;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (sorting.field) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'price':
          aValue = parseFloat(a.price);
          bValue = parseFloat(b.price);
          break;
        case 'rating':
          aValue = parseFloat(a.rating || '0');
          bValue = parseFloat(b.rating || '0');
          break;
        case 'sales':
          aValue = a.analytics.totalSales;
          bValue = b.analytics.totalSales;
          break;
        case 'revenue':
          aValue = a.analytics.revenue;
          bValue = b.analytics.revenue;
          break;
        case 'healthScore':
        default:
          aValue = a.analytics.healthScore;
          bValue = b.analytics.healthScore;
          break;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sorting.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        const numA = Number(aValue);
        const numB = Number(bValue);
        return sorting.direction === 'asc' ? numA - numB : numB - numA;
      }
    });

    return filtered;
  }, [products, filters, sorting]);

  const handleProductSelect = (product: EnrichedProduct) => {
    dispatch(selectProduct(product));
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading products...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">Error loading products</p>
              <p className="text-gray-600 text-sm mb-4">{error}</p>
              <Button onClick={() => dispatch(fetchProductsWithAnalytics())}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">
            Manage and analyze your product performance
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            {filteredAndSortedProducts.length} of {products.length} products
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        categories={categories}
        vendors={vendors}
      />

      {/* Sort Controls */}
      <div className="flex items-center justify-between">
        <SortDropdown sorting={sorting} />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAndSortedProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={handleProductSelect}
            isSelected={selectedProduct?.id === product.id}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredAndSortedProducts.length === 0 && products.length > 0 && (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <Grid className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your filters to see more results.
            </p>
            <Button
              variant="outline"
              onClick={() => dispatch(clearFilters())}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && products.length > 0 && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-gray-600">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Updating products...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;