import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Minus, MessageSquare, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
}

interface SentimentTrend {
  date: string;
  score: number;
  reviewCount: number;
}

interface CommonComplaint {
  keyword: string;
  frequency: number;
  impact: 'high' | 'medium' | 'low';
}

interface ResponseMetrics {
  avgResponseTime: number;
  responseRate: number;
  escalationRate: number;
}

interface ProductComparisonProps {
  className?: string;
}

export function ProductComparison({ className }: ProductComparisonProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct1, setSelectedProduct1] = useState<number | null>(null);
  const [selectedProduct2, setSelectedProduct2] = useState<number | null>(null);
  const [sentimentData1, setSentimentData1] = useState<SentimentTrend[]>([]);
  const [sentimentData2, setSentimentData2] = useState<SentimentTrend[]>([]);
  const [complaints1, setComplaints1] = useState<CommonComplaint[]>([]);
  const [complaints2, setComplaints2] = useState<CommonComplaint[]>([]);
  const [responseMetrics1, setResponseMetrics1] = useState<ResponseMetrics | null>(null);
  const [responseMetrics2, setResponseMetrics2] = useState<ResponseMetrics | null>(null);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  const [loading, setLoading] = useState(false);

  // Load products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (response.ok) {
          const data = await response.json();
          setProducts(data.slice(0, 20)); // Limit to first 20 products
        }
      } catch (error) {
        console.error('Failed to load products:', error);
      }
    };

    loadProducts();
  }, []);

  // Load comparison data when products are selected
  useEffect(() => {
    if (selectedProduct1 && selectedProduct2) {
      loadComparisonData();
    }
  }, [selectedProduct1, selectedProduct2, timeframe]);

  const loadComparisonData = async () => {
    if (!selectedProduct1 || !selectedProduct2) return;

    setLoading(true);
    try {
      // Load sentiment trends
      const [sentiment1Response, sentiment2Response] = await Promise.all([
        fetch(`/api/products/${selectedProduct1}/sentiment-trend?timeframe=${timeframe}`),
        fetch(`/api/products/${selectedProduct2}/sentiment-trend?timeframe=${timeframe}`)
      ]);

      if (sentiment1Response.ok && sentiment2Response.ok) {
        const sentiment1Data = await sentiment1Response.json();
        const sentiment2Data = await sentiment2Response.json();
        setSentimentData1(sentiment1Data);
        setSentimentData2(sentiment2Data);
      }

      // Load common complaints
      const [complaints1Response, complaints2Response] = await Promise.all([
        fetch(`/api/products/${selectedProduct1}/complaints?timeframe=${timeframe}`),
        fetch(`/api/products/${selectedProduct2}/complaints?timeframe=${timeframe}`)
      ]);

      if (complaints1Response.ok && complaints2Response.ok) {
        const complaints1Data = await complaints1Response.json();
        const complaints2Data = await complaints2Response.json();
        setComplaints1(complaints1Data);
        setComplaints2(complaints2Data);
      }

      // Load response metrics
      const [metrics1Response, metrics2Response] = await Promise.all([
        fetch(`/api/products/${selectedProduct1}/response-metrics?timeframe=${timeframe}`),
        fetch(`/api/products/${selectedProduct2}/response-metrics?timeframe=${timeframe}`)
      ]);

      if (metrics1Response.ok && metrics2Response.ok) {
        const metrics1Data = await metrics1Response.json();
        const metrics2Data = await metrics2Response.json();
        setResponseMetrics1(metrics1Data);
        setResponseMetrics2(metrics2Data);
      }

    } catch (error) {
      console.error('Failed to load comparison data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProduct1 = () => products.find(p => p.id === selectedProduct1);
  const getProduct2 = () => products.find(p => p.id === selectedProduct2);

  const calculateAverageSentiment = (data: SentimentTrend[]) => {
    if (data.length === 0) return 0;
    return data.reduce((sum, item) => sum + item.score, 0) / data.length;
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous + 5) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (current < previous - 5) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      default: return 'text-green-600 bg-green-100 dark:bg-green-900/20';
    }
  };

  // Combine data for side-by-side chart
  const combinedSentimentData = sentimentData1.map((item1, index) => {
    const item2 = sentimentData2[index];
    return {
      date: item1.date,
      product1: item1.score,
      product2: item2?.score || 0,
      reviews1: item1.reviewCount,
      reviews2: item2?.reviewCount || 0
    };
  });

  return (
    <div className={cn("space-y-6", className)}>
      {/* Product Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Product Comparison</CardTitle>
          <CardDescription>
            Compare sentiment analysis and customer feedback between two products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Product 1</label>
              <Select value={selectedProduct1?.toString()} onValueChange={(value) => setSelectedProduct1(Number(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select first product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name} ({product.sku})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Product 2</label>
              <Select value={selectedProduct2?.toString()} onValueChange={(value) => setSelectedProduct2(Number(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select second product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name} ({product.sku})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Timeframe</label>
              <Select value={timeframe} onValueChange={(value) => setTimeframe(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedProduct1 && selectedProduct2 && (
        <>
          {/* Sentiment Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getProduct1()?.name}
                  {sentimentData1.length > 1 && getTrendIcon(
                    calculateAverageSentiment(sentimentData1.slice(-7)),
                    calculateAverageSentiment(sentimentData1.slice(-14, -7))
                  )}
                </CardTitle>
                <CardDescription>{getProduct1()?.category}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Average Sentiment</span>
                    <span className="text-2xl font-bold">
                      {calculateAverageSentiment(sentimentData1).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Reviews</span>
                    <span className="font-medium">
                      {sentimentData1.reduce((sum, item) => sum + item.reviewCount, 0)}
                    </span>
                  </div>
                  {responseMetrics1 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Avg Response Time</span>
                        <span className="font-medium">{responseMetrics1.avgResponseTime}h</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Response Rate</span>
                        <span className="font-medium">{responseMetrics1.responseRate}%</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getProduct2()?.name}
                  {sentimentData2.length > 1 && getTrendIcon(
                    calculateAverageSentiment(sentimentData2.slice(-7)),
                    calculateAverageSentiment(sentimentData2.slice(-14, -7))
                  )}
                </CardTitle>
                <CardDescription>{getProduct2()?.category}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Average Sentiment</span>
                    <span className="text-2xl font-bold">
                      {calculateAverageSentiment(sentimentData2).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Reviews</span>
                    <span className="font-medium">
                      {sentimentData2.reduce((sum, item) => sum + item.reviewCount, 0)}
                    </span>
                  </div>
                  {responseMetrics2 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Avg Response Time</span>
                        <span className="font-medium">{responseMetrics2.avgResponseTime}h</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Response Rate</span>
                        <span className="font-medium">{responseMetrics2.responseRate}%</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Analysis */}
          <Tabs defaultValue="sentiment" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="sentiment">Sentiment Trends</TabsTrigger>
              <TabsTrigger value="complaints">Common Complaints</TabsTrigger>
              <TabsTrigger value="response">Response Metrics</TabsTrigger>
            </TabsList>

            <TabsContent value="sentiment" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Sentiment Score Comparison</CardTitle>
                  <CardDescription>
                    Side-by-side sentiment trends over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={combinedSentimentData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => new Date(value).toLocaleDateString()}
                        />
                        <YAxis domain={[0, 100]} />
                        <Tooltip 
                          labelFormatter={(value) => new Date(value).toLocaleDateString()}
                          formatter={(value: number, name: string) => [
                            `${value.toFixed(1)}`,
                            name === 'product1' ? getProduct1()?.name : getProduct2()?.name
                          ]}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="product1" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          name="product1"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="product2" 
                          stroke="hsl(var(--destructive))" 
                          strokeWidth={2}
                          name="product2"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="complaints" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      {getProduct1()?.name}
                    </CardTitle>
                    <CardDescription>Most frequent complaint keywords</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {complaints1.map((complaint, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{complaint.keyword}</span>
                            <Badge className={getImpactColor(complaint.impact)}>
                              {complaint.impact}
                            </Badge>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {complaint.frequency} mentions
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      {getProduct2()?.name}
                    </CardTitle>
                    <CardDescription>Most frequent complaint keywords</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {complaints2.map((complaint, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{complaint.keyword}</span>
                            <Badge className={getImpactColor(complaint.impact)}>
                              {complaint.impact}
                            </Badge>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {complaint.frequency} mentions
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="response" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Response Time Comparison
                  </CardTitle>
                  <CardDescription>
                    Customer service response metrics comparison
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {responseMetrics1 && responseMetrics2 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-medium">Average Response Time</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">{getProduct1()?.name}</span>
                            <span className="font-medium">{responseMetrics1.avgResponseTime}h</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">{getProduct2()?.name}</span>
                            <span className="font-medium">{responseMetrics2.avgResponseTime}h</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-medium">Response Rate</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">{getProduct1()?.name}</span>
                            <span className="font-medium">{responseMetrics1.responseRate}%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">{getProduct2()?.name}</span>
                            <span className="font-medium">{responseMetrics2.responseRate}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-medium">Escalation Rate</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">{getProduct1()?.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{responseMetrics1.escalationRate}%</span>
                              {responseMetrics1.escalationRate > 20 && (
                                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">{getProduct2()?.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{responseMetrics2.escalationRate}%</span>
                              {responseMetrics2.escalationRate > 20 && (
                                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}