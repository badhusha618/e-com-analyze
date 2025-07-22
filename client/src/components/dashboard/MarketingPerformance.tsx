import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { MarketingCampaign } from '@shared/schema';

interface MarketingPerformanceProps {
  campaigns: MarketingCampaign[];
}

const MarketingPerformance = memo(({ campaigns }: MarketingPerformanceProps) => {
  const calculateROI = (revenue: string, spent: string) => {
    const rev = parseFloat(revenue);
    const spend = parseFloat(spent);
    if (spend === 0) return 0;
    return ((rev - spend) / spend) * 100;
  };

  const getPerformanceWidth = (roi: number) => {
    // Normalize ROI to percentage for progress bar (max 500% ROI = 100% width)
    return Math.min((roi / 500) * 100, 100);
  };

  const getChannelColor = (channel: string) => {
    const colors: Record<string, string> = {
      google_ads: 'bg-green-500',
      facebook_ads: 'bg-blue-500',
      email: 'bg-purple-500',
      influencer: 'bg-pink-500',
    };
    return colors[channel] || 'bg-gray-500';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Marketing Performance
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-primary">
            View Details
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {campaigns.slice(0, 4).map((campaign) => {
            const roi = calculateROI(campaign.revenue || '0', campaign.spent || '0');
            const performanceWidth = getPerformanceWidth(roi);
            const channelColor = getChannelColor(campaign.channel);

            return (
              <div key={campaign.id}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 capitalize">
                    {campaign.name.replace('_', ' ')}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    ROI: {roi.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                  <div
                    className={cn('h-2 rounded-full', channelColor)}
                    style={{ width: `${performanceWidth}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>${parseFloat(campaign.spent || '0').toLocaleString()} spent</span>
                  <span>${parseFloat(campaign.revenue || '0').toLocaleString()} revenue</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Customer Acquisition Cost
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">$23.50</p>
              <p className="text-xs text-gray-500">Average CAC</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">$185.40</p>
              <p className="text-xs text-gray-500">Avg LTV</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

MarketingPerformance.displayName = 'MarketingPerformance';

export default MarketingPerformance;
