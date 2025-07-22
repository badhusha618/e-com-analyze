import { memo } from 'react';
import { useDispatch } from 'react-redux';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { setSorting, type ProductSorting } from '@/store/slices/productsPageSlice';
import type { AppDispatch } from '@/store';

interface SortDropdownProps {
  sorting: ProductSorting;
}

const sortOptions = [
  { value: 'name', label: 'Product Name' },
  { value: 'price', label: 'Price' },
  { value: 'rating', label: 'Rating' },
  { value: 'sales', label: 'Sales Volume' },
  { value: 'revenue', label: 'Revenue' },
  { value: 'healthScore', label: 'Health Score' },
] as const;

const SortDropdown = memo(({ sorting }: SortDropdownProps) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleSortFieldChange = (field: string) => {
    dispatch(setSorting({
      field: field as ProductSorting['field'],
      direction: sorting.direction
    }));
  };

  const handleDirectionToggle = () => {
    dispatch(setSorting({
      field: sorting.field,
      direction: sorting.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = () => {
    if (sorting.direction === 'asc') {
      return <ArrowUp className="w-4 h-4" />;
    } else {
      return <ArrowDown className="w-4 h-4" />;
    }
  };

  const getCurrentSortLabel = () => {
    const option = sortOptions.find(opt => opt.value === sorting.field);
    return option?.label || 'Health Score';
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-700">Sort by:</span>
      
      <Select value={sorting.field} onValueChange={handleSortFieldChange}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Sort by">
            {getCurrentSortLabel()}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="sm"
        onClick={handleDirectionToggle}
        className="flex items-center gap-1 px-3"
        title={`Sort ${sorting.direction === 'asc' ? 'Descending' : 'Ascending'}`}
      >
        {getSortIcon()}
        <span className="text-xs">
          {sorting.direction === 'asc' ? 'Asc' : 'Desc'}
        </span>
      </Button>
    </div>
  );
});

SortDropdown.displayName = 'SortDropdown';

export default SortDropdown;