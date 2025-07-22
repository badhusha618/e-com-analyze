import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SentimentData {
  rating: number;
  label: string;
  percentage: number;
  count: number;
  color: string;
}

const CustomerSentiment = memo(() => {
  const sentimentData: SentimentData[] = [
    { rating: 5, label: 'Excellent', percentage: 45, count: 892, color: 'bg-green-500' },
    { rating: 4, label: 'Good', percentage: 32, count: 634, color: 'bg-green-400' },
    { rating: 3, label: 'Average', percentage: 15, count: 297, color: 'bg-yellow-400' },
    { rating: 2, label: 'Poor', percentage: 5, count: 99, color: 'bg-orange-400' },
    { rating: 1, label: 'Very Poor', percentage: 3, count: 59, color: 'bg-red-400' },
  ];

  const positivePercentage = sentimentData
    .filter(item => item.rating >= 4)
    .reduce((sum, item) => sum + item.percentage, 0);

  const recentIssues = [
    {
      product: 'Premium Headphones',
      issue: 'Poor sound quality',
      rating: 1,
      time: '2 hours ago',
      severity: 'high' as const,
    },
    {
      product: 'Gaming Keyboard',
      issue: 'Keys stopped working',
      rating: 2,
      time: '5 hours ago',
      severity: 'medium' as const,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Customer Sentiment
          </CardTitle>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            {positivePercentage}% Positive
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sentimentData.map((item) => (
            <div key={item.rating} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="flex text-yellow-400">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm text-gray-600 ml-1">{item.rating}.0</span>
                </div>
                <span className="text-sm text-gray-900">
                  {item.label} ({item.percentage}%)
                </span>
              </div>
              <div className="flex-1 mx-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={cn('h-2 rounded-full', item.color)}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
              <span className="text-sm text-gray-600">{item.count}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Recent Reviews Requiring Attention
          </h4>
          <div className="space-y-3">
            {recentIssues.map((issue, index) => (
              <div
                key={index}
                className={cn(
                  'p-3 border rounded-lg',
                  issue.severity === 'high'
                    ? 'bg-red-50 border-red-100'
                    : 'bg-yellow-50 border-yellow-100'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      {issue.product} - {issue.issue}
                    </p>
                    <p className="text-xs text-gray-500">{issue.time}</p>
                  </div>
                  <Badge
                    variant={issue.severity === 'high' ? 'destructive' : 'secondary'}
                    className={cn(
                      'text-xs',
                      issue.severity === 'high'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    )}
                  >
                    {issue.rating}★
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

CustomerSentiment.displayName = 'CustomerSentiment';

export default CustomerSentiment;
