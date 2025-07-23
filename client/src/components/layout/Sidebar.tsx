import { memo } from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import {
  BarChart3,
  Package,
  Users,
  Star,
  Lightbulb,
  AlertTriangle,
  Brain,
  Settings,
  Shield,
} from 'lucide-react';

const navigationItems = [
  {
    label: 'Dashboard',
    href: '/',
    icon: BarChart3,
  },
  {
    label: 'Products',
    href: '/products',
    icon: Package,
  },
  {
    label: 'Customers',
    href: '/customers',
    icon: Users,
  },
  {
    label: 'Reviews',
    href: '/reviews',
    icon: Star,
  },
  {
    label: 'Sentiment',
    href: '/sentiment',
    icon: Brain,
  },
  {
    label: 'Marketing',
    href: '/marketing',
    icon: Lightbulb,
  },
  {
    label: 'Alerts',
    href: '/alerts',
    icon: AlertTriangle,
  },
];

const Sidebar = memo(() => {
  const [location] = useLocation();
  const { user, hasPermission } = useAuth();

  const adminItems = [
    {
      label: 'User Management',
      href: '/admin/users',
      icon: Shield,
      permission: 'admin:users'
    }
  ];

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col">
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">EcomAnalytics</span>
        </div>
      </div>

      <nav className="flex-1 px-4 pb-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  'flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer',
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
        
        {/* Admin Section */}
        {user && adminItems.some(item => hasPermission(item.permission)) && (
          <>
            <div className="pt-4 pb-2">
              <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Administration
              </h3>
            </div>
            {adminItems.map((item) => {
              if (!hasPermission(item.permission)) return null;
              
              const Icon = item.icon;
              const isActive = location === item.href;

              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={cn(
                      'flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer',
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    )}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </>
        )}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">
                {user ? (user.firstName[0] + user.lastName[0]) : 'U'}
              </span>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">
              {user ? `${user.firstName} ${user.lastName}` : 'User'}
            </p>
            <p className="text-xs text-gray-500">
              {user ? user.role.replace('_', ' ') : 'Guest'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;
