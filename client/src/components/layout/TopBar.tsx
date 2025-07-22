import { memo, useState } from 'react';
import { Search, Bell } from 'lucide-react';
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

interface TopBarProps {
  title?: string;
  unreadAlerts?: number;
}

const TopBar = memo(({ title = 'Sales Dashboard', unreadAlerts = 0 }: TopBarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('7days');

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    // TODO: Implement search functionality
  };

  const handleNotificationClick = () => {
    // TODO: Implement notification panel
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          <div className="flex items-center space-x-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
                <SelectItem value="custom">Custom range</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-64 pl-10 pr-4"
            />
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={handleNotificationClick}
          >
            <Bell className="w-6 h-6" />
            {unreadAlerts > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center text-xs"
              >
                {unreadAlerts}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
});

TopBar.displayName = 'TopBar';

export default TopBar;
