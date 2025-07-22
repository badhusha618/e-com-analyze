import { memo } from 'react';
import { useDispatch } from 'react-redux';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Search, Filter, X } from 'lucide-react';
import { setFilters, clearFilters, type ProductFilters } from '@/store/slices/productsPageSlice';
import type { AppDispatch } from '@/store';

interface FilterBarProps {
  filters: ProductFilters;
  categories: string[];
  vendors: string[];
  onFiltersChange?: (filters: ProductFilters) => void;
}

const FilterBar = memo(({ filters, categories, vendors }: FilterBarProps) => {
  const dispatch = useDispatch<AppDispatch>();

  const updateFilter = (key: keyof ProductFilters, value: any) => {
    dispatch(setFilters({ [key]: value }));
  };

  const removeFilter = (key: keyof ProductFilters) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    dispatch(setFilters(newFilters));
  };

  const handleClearAll = () => {
    dispatch(clearFilters());
  };

  const activeFiltersCount = Object.keys(filters).filter(key => 
    filters[key as keyof ProductFilters] !== undefined
  ).length;

  const getFilterBadges = () => {
    const badges = [];
    
    if (filters.searchQuery) {
      badges.push(
        <Badge key="search" variant="secondary" className="flex items-center gap-1">
          Search: {filters.searchQuery}
          <X 
            className="w-3 h-3 cursor-pointer" 
            onClick={() => removeFilter('searchQuery')}
          />
        </Badge>
      );
    }
    
    if (filters.category) {
      badges.push(
        <Badge key="category" variant="secondary" className="flex items-center gap-1">
          Category: {filters.category}
          <X 
            className="w-3 h-3 cursor-pointer" 
            onClick={() => removeFilter('category')}
          />
        </Badge>
      );
    }
    
    if (filters.vendor) {
      badges.push(
        <Badge key="vendor" variant="secondary" className="flex items-center gap-1">
          Vendor: {filters.vendor}
          <X 
            className="w-3 h-3 cursor-pointer" 
            onClick={() => removeFilter('vendor')}
          />
        </Badge>
      );
    }
    
    if (filters.ratingRange) {
      badges.push(
        <Badge key="rating" variant="secondary" className="flex items-center gap-1">
          Rating: {filters.ratingRange[0]}-{filters.ratingRange[1]}★
          <X 
            className="w-3 h-3 cursor-pointer" 
            onClick={() => removeFilter('ratingRange')}
          />
        </Badge>
      );
    }
    
    if (filters.priceRange) {
      badges.push(
        <Badge key="price" variant="secondary" className="flex items-center gap-1">
          Price: ${filters.priceRange[0]}-${filters.priceRange[1]}
          <X 
            className="w-3 h-3 cursor-pointer" 
            onClick={() => removeFilter('priceRange')}
          />
        </Badge>
      );
    }
    
    return badges;
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          <Input
            type="text"
            placeholder="Search products..."
            value={filters.searchQuery || ''}
            onChange={(e) => updateFilter('searchQuery', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <Select 
            value={filters.category || 'all-categories'} 
            onValueChange={(value) => updateFilter('category', value === 'all-categories' ? undefined : value)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-categories">All Categories</SelectItem>
              {categories.filter(category => category && category.trim()).map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Vendor Filter */}
        {vendors.length > 0 && (
          <Select 
            value={filters.vendor || 'all-vendors'} 
            onValueChange={(value) => updateFilter('vendor', value === 'all-vendors' ? undefined : value)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Vendor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-vendors">All Vendors</SelectItem>
              {vendors.filter(vendor => vendor && vendor.trim()).map((vendor) => (
                <SelectItem key={vendor} value={vendor}>
                  {vendor}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Advanced Filters */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Rating Range
                </label>
                <div className="px-2">
                  <Slider
                    value={filters.ratingRange || [1, 5]}
                    onValueChange={(value) => updateFilter('ratingRange', value as [number, number])}
                    max={5}
                    min={1}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{filters.ratingRange?.[0] || 1}★</span>
                    <span>{filters.ratingRange?.[1] || 5}★</span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Price Range ($)
                </label>
                <div className="px-2">
                  <Slider
                    value={filters.priceRange || [0, 500]}
                    onValueChange={(value) => updateFilter('priceRange', value as [number, number])}
                    max={500}
                    min={0}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>${filters.priceRange?.[0] || 0}</span>
                    <span>${filters.priceRange?.[1] || 500}</span>
                  </div>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Clear Filters */}
        {activeFiltersCount > 0 && (
          <Button variant="ghost" onClick={handleClearAll} className="text-gray-600">
            Clear All
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {getFilterBadges()}
        </div>
      )}
    </div>
  );
});

FilterBar.displayName = 'FilterBar';

export default FilterBar;