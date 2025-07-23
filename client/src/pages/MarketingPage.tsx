import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  Users, 
  Eye, 
  MousePointer,
  BarChart3,
  Calendar
} from "lucide-react";
import { format } from "date-fns";
import type { MarketingCampaign } from "@shared/schema";

interface CampaignMetrics extends MarketingCampaign {
  roi: number;
  costPerConversion: number;
  conversionRate: number;
  ctr: number; // Click-through rate
}

export default function MarketingPage() {
  const [channelFilter, setChannelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<string>("roi");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const { data: campaigns = [], isLoading, error } = useQuery<MarketingCampaign[]>({
    queryKey: ["/api/marketing/campaigns"],
  });

  // Calculate campaign metrics
  const campaignsWithMetrics: CampaignMetrics[] = campaigns.map(campaign => {
    const spent = parseFloat(campaign.spent || "0");
    const revenue = parseFloat(campaign.revenue || "0");
    const roi = spent > 0 ? ((revenue - spent) / spent) * 100 : 0;
    const costPerConversion = (campaign.conversions || 0) > 0 ? spent / (campaign.conversions || 1) : 0;
    const conversionRate = (campaign.clicks || 0) > 0 ? ((campaign.conversions || 0) / (campaign.clicks || 1)) * 100 : 0;
    const ctr = (campaign.impressions || 0) > 0 ? ((campaign.clicks || 0) / (campaign.impressions || 1)) * 100 : 0;

    return {
      ...campaign,
      roi,
      costPerConversion,
      conversionRate,
      ctr,
    };
  });

  // Filter and sort campaigns
  const filteredCampaigns = campaignsWithMetrics
    .filter(campaign => {
      const matchesChannel = channelFilter === "all" || campaign.channel === channelFilter;
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "active" && campaign.isActive) ||
        (statusFilter === "inactive" && !campaign.isActive);
      
      return matchesChannel && matchesStatus;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "roi":
          aValue = a.roi;
          bValue = b.roi;
          break;
        case "revenue":
          aValue = parseFloat(a.revenue || "0");
          bValue = parseFloat(b.revenue || "0");
          break;
        case "spent":
          aValue = parseFloat(a.spent || "0");
          bValue = parseFloat(b.spent || "0");
          break;
        case "conversions":
          aValue = a.conversions || 0;
          bValue = b.conversions || 0;
          break;
        case "startDate":
          aValue = new Date(a.startDate).getTime();
          bValue = new Date(b.startDate).getTime();
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }
      
      if (sortOrder === "desc") {
        return aValue > bValue ? -1 : 1;
      }
      return aValue < bValue ? -1 : 1;
    });

  const getChannelIcon = (channel: string) => {
    switch (channel.toLowerCase()) {
      case "google_ads": return "🔍";
      case "facebook_ads": return "📘";
      case "email": return "📧";
      case "influencer": return "👤";
      default: return "📊";
    }
  };

  const getChannelColor = (channel: string) => {
    switch (channel.toLowerCase()) {
      case "google_ads": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "facebook_ads": return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200";
      case "email": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "influencer": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const getROIColor = (roi: number) => {
    if (roi >= 200) return "text-green-600 dark:text-green-400";
    if (roi >= 100) return "text-yellow-600 dark:text-yellow-400";
    if (roi >= 0) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  const getROIBadge = (roi: number) => {
    if (roi >= 200) return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Excellent</Badge>;
    if (roi >= 100) return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Good</Badge>;
    if (roi >= 0) return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">Average</Badge>;
    return <Badge variant="destructive">Poor</Badge>;
  };

  // Calculate overall metrics
  const totalSpent = campaigns.reduce((sum, c) => sum + parseFloat(c.spent || "0"), 0);
  const totalRevenue = campaigns.reduce((sum, c) => sum + parseFloat(c.revenue || "0"), 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + (c.conversions || 0), 0);
  const overallROI = totalSpent > 0 ? ((totalRevenue - totalSpent) / totalSpent) * 100 : 0;
  const avgCostPerConversion = totalConversions > 0 ? totalSpent / totalConversions : 0;

  // Channel performance
  const channelPerformance = campaigns.reduce((acc, campaign) => {
    const channel = campaign.channel;
    if (!acc[channel]) {
      acc[channel] = {
        spent: 0,
        revenue: 0,
        conversions: 0,
        campaigns: 0
      };
    }
    acc[channel].spent += parseFloat(campaign.spent || "0");
    acc[channel].revenue += parseFloat(campaign.revenue || "0");
    acc[channel].conversions += campaign.conversions || 0;
    acc[channel].campaigns += 1;
    return acc;
  }, {} as Record<string, any>);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <AppLayout title="Marketing">
        <div className="p-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-red-600 dark:text-red-400">Failed to load marketing data</p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Marketing" loading={isLoading}>
      <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Marketing Dashboard</h1>
          <p className="text-muted-foreground">Track campaign performance and ROI across channels</p>
        </div>
      </div>

      {/* Overall Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSpent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all campaigns</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Generated from marketing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall ROI</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getROIColor(overallROI)}`}>
              {overallROI.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Return on investment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConversions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              ${avgCostPerConversion.toFixed(2)} per conversion
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Channel Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Channel Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(channelPerformance).map(([channel, data]) => {
              const roi = data.spent > 0 ? ((data.revenue - data.spent) / data.spent) * 100 : 0;
              return (
                <div key={channel} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getChannelIcon(channel)}</span>
                    <div>
                      <p className="font-medium capitalize">
                        {channel.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {data.campaigns} campaign(s)
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${getROIColor(roi)}`}>
                        {roi.toFixed(1)}% ROI
                      </span>
                      {getROIBadge(roi)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      ${data.revenue.toLocaleString()} revenue / ${data.spent.toLocaleString()} spent
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={channelFilter} onValueChange={setChannelFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                <SelectItem value="google_ads">Google Ads</SelectItem>
                <SelectItem value="facebook_ads">Facebook Ads</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="influencer">Influencer</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Campaigns</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="roi">ROI</SelectItem>
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="spent">Spend</SelectItem>
                <SelectItem value="conversions">Conversions</SelectItem>
                <SelectItem value="startDate">Start Date</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Details */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Campaigns ({filteredCampaigns.length})</h2>
        
        <div className="grid gap-4">
          {filteredCampaigns.map((campaign) => (
            <Card key={campaign.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{campaign.name}</h3>
                      <Badge className={getChannelColor(campaign.channel)}>
                        {getChannelIcon(campaign.channel)} {campaign.channel.replace('_', ' ')}
                      </Badge>
                      {campaign.isActive ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</Badge>
                      ) : (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(campaign.startDate), "MMM d, yyyy")} 
                        {campaign.endDate && ` - ${format(new Date(campaign.endDate), "MMM d, yyyy")}`}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getROIColor(campaign.roi)}`}>
                      {campaign.roi.toFixed(1)}%
                    </div>
                    <p className="text-sm text-muted-foreground">ROI</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Budget</p>
                    <p className="font-medium">${parseFloat(campaign.budget || "0").toLocaleString()}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Spent</p>
                    <p className="font-medium">${parseFloat(campaign.spent || "0").toLocaleString()}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Revenue</p>
                    <p className="font-medium">${parseFloat(campaign.revenue || "0").toLocaleString()}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Conversions</p>
                    <p className="font-medium">{campaign.conversions}</p>
                  </div>
                </div>
                
                {/* Budget Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Budget Usage</span>
                    <span>
                      {((parseFloat(campaign.spent || "0") / parseFloat(campaign.budget || "1")) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={(parseFloat(campaign.spent || "0") / parseFloat(campaign.budget || "1")) * 100} 
                    className="h-2"
                  />
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Impressions</p>
                      <p className="font-medium">{(campaign.impressions || 0).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MousePointer className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Clicks</p>
                      <p className="font-medium">{(campaign.clicks || 0).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">CTR</p>
                      <p className="font-medium">{campaign.ctr.toFixed(2)}%</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Conv. Rate</p>
                      <p className="font-medium">{campaign.conversionRate.toFixed(2)}%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {filteredCampaigns.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No campaigns found matching your criteria</p>
            </CardContent>
          </Card>
        )}
      </div>
      </div>
    </AppLayout>
  );
}