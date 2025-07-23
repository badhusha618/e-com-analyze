import { useState } from 'react';
import { useSentiment, type SentimentData } from '@/hooks/useSentiment';
import { AnimatedGauge } from '@/components/ui/animated-gauge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, TrendingUp, TrendingDown, Minus, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SentimentDashboardProps {
  className?: string;
}

export function SentimentDashboard({ className }: SentimentDashboardProps) {
  const { sentimentData, metrics, isConnected, error, connect, disconnect } = useSentiment();
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1h' | '4h' | '24h'>('1h');

  const filterDataByTimeframe = (data: SentimentData[], timeframe: '1h' | '4h' | '24h') => {
    const now = new Date();
    const hours = timeframe === '1h' ? 1 : timeframe === '4h' ? 4 : 24;
    const cutoff = new Date(now.getTime() - hours * 60 * 60 * 1000);
    
    return data.filter(item => new Date(item.timestamp) >= cutoff);
  };

  const filteredData = filterDataByTimeframe(sentimentData, selectedTimeframe);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'negative': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Real-time Sentiment Monitoring</h2>
          <p className="text-muted-foreground">
            Live analysis of customer reviews and feedback
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="h-4 w-4 text-green-600" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-600" />
            )}
            <span className={cn(
              "text-sm font-medium",
              isConnected ? "text-green-600" : "text-red-600"
            )}>
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={isConnected ? disconnect : connect}
          >
            {isConnected ? "Disconnect" : "Connect"}
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <CardContent className="flex items-center gap-2 pt-6">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-red-600">{error}</span>
          </CardContent>
        </Card>
      )}

      {/* Main Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sentiment Gauge */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Overall Sentiment Score
              {getTrendIcon(metrics.trend)}
            </CardTitle>
            <CardDescription>
              Average sentiment across all reviews
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatedGauge
              value={metrics.averageScore}
              label="Sentiment"
              size={200}
              className="w-full"
            />
          </CardContent>
        </Card>

        {/* Metrics Cards */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalReviews.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">
                {filteredData.length} in selected timeframe
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Positive Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{metrics.positiveCount}</div>
              <div className="text-xs text-muted-foreground">
                {metrics.totalReviews > 0 
                  ? `${Math.round((metrics.positiveCount / metrics.totalReviews) * 100)}%`
                  : '0%'
                } of total
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Negative Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{metrics.negativeCount}</div>
              <div className="text-xs text-muted-foreground">
                {metrics.totalReviews > 0 
                  ? `${Math.round((metrics.negativeCount / metrics.totalReviews) * 100)}%`
                  : '0%'
                } of total
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Neutral Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{metrics.neutralCount}</div>
              <div className="text-xs text-muted-foreground">
                {metrics.totalReviews > 0 
                  ? `${Math.round((metrics.neutralCount / metrics.totalReviews) * 100)}%`
                  : '0%'
                } of total
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Live Reviews */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Live Review Stream</CardTitle>
              <CardDescription>
                Real-time incoming reviews with sentiment analysis
              </CardDescription>
            </div>
            <Tabs value={selectedTimeframe} onValueChange={(value) => setSelectedTimeframe(value as any)}>
              <TabsList>
                <TabsTrigger value="1h">1h</TabsTrigger>
                <TabsTrigger value="4h">4h</TabsTrigger>
                <TabsTrigger value="24h">24h</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No reviews in the selected timeframe
              </div>
            ) : (
              filteredData
                .slice()
                .reverse()
                .slice(0, 20)
                .map((review) => (
                  <div
                    key={`${review.reviewId}-${review.timestamp}`}
                    className="flex items-start gap-3 p-4 rounded-lg border bg-card"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{review.productName}</span>
                        <Badge className={getSentimentColor(review.sentiment)}>
                          {review.sentiment}
                        </Badge>
                        <Badge variant="outline">
                          {review.score}/100
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {review.reviewText}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{new Date(review.timestamp).toLocaleTimeString()}</span>
                        {review.keywords && review.keywords.length > 0 && (
                          <>
                            <span>•</span>
                            <span>Keywords: {review.keywords.slice(0, 3).join(', ')}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}