import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  AlertTriangle, 
  TrendingDown, 
  MessageSquare, 
  Package, 
  BarChart3,
  Bell,
  CheckCircle,
  X,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import type { Alert } from "@shared/schema";

export default function AlertsPage() {
  const [typeFilter, setTypeFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [autoRefresh, setAutoRefresh] = useState(true);

  const queryClient = useQueryClient();

  const { data: alerts = [], isLoading, error } = useQuery<Alert[]>({
    queryKey: ["/api/alerts"],
    refetchInterval: autoRefresh ? 5000 : false, // Poll every 5 seconds if auto-refresh is on
  });

  const markAsReadMutation = useMutation({
    mutationFn: (alertId: number) =>
      apiRequest(`/api/alerts/${alertId}/read`, "PATCH"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
    },
  });

  // Filter alerts
  const filteredAlerts = alerts.filter(alert => {
    const matchesType = typeFilter === "all" || alert.type === typeFilter;
    const matchesSeverity = severityFilter === "all" || alert.severity === severityFilter;
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "unread" && !alert.isRead) ||
      (statusFilter === "read" && alert.isRead);
    
    return matchesType && matchesSeverity && matchesStatus;
  });

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "sales_drop": return <TrendingDown className="h-5 w-5" />;
      case "review_spike": return <MessageSquare className="h-5 w-5" />;
      case "inventory_low": return <Package className="h-5 w-5" />;
      case "campaign_underperform": return <BarChart3 className="h-5 w-5" />;
      default: return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getAlertColor = (severity: string, isRead: boolean) => {
    const opacity = isRead ? "opacity-60" : "";
    
    switch (severity) {
      case "high": return `border-red-500 bg-red-50 dark:bg-red-950 ${opacity}`;
      case "medium": return `border-yellow-500 bg-yellow-50 dark:bg-yellow-950 ${opacity}`;
      case "low": return `border-blue-500 bg-blue-50 dark:bg-blue-950 ${opacity}`;
      default: return `border-gray-300 bg-gray-50 dark:bg-gray-900 ${opacity}`;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high": return <Badge variant="destructive">High</Badge>;
      case "medium": return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Medium</Badge>;
      case "low": return <Badge variant="outline">Low</Badge>;
      default: return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const typeLabels = {
      sales_drop: "Sales Drop",
      review_spike: "Review Spike", 
      inventory_low: "Low Inventory",
      campaign_underperform: "Campaign Issue"
    };

    const typeColors = {
      sales_drop: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      review_spike: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      inventory_low: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      campaign_underperform: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
    };

    return (
      <Badge className={typeColors[type as keyof typeof typeColors] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"}>
        {typeLabels[type as keyof typeof typeLabels] || type}
      </Badge>
    );
  };

  const handleMarkAsRead = (alertId: number) => {
    markAsReadMutation.mutate(alertId);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
  };

  // Calculate summary metrics
  const unreadAlerts = alerts.filter(a => !a.isRead);
  const highSeverityUnread = unreadAlerts.filter(a => a.severity === "high");
  const mediumSeverityUnread = unreadAlerts.filter(a => a.severity === "medium");
  const lowSeverityUnread = unreadAlerts.filter(a => a.severity === "low");

  const alertsByType = alerts.reduce((acc, alert) => {
    acc[alert.type] = (acc[alert.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

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
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600 dark:text-red-400">Failed to load alerts</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Real-Time Alerts</h1>
          <p className="text-muted-foreground">Monitor critical business events and notifications</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Bell className="h-4 w-4 mr-2" />
            Auto-refresh {autoRefresh ? "On" : "Off"}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Alerts</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadAlerts.length}</div>
            <p className="text-xs text-muted-foreground">
              {alerts.length} total alerts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {highSeverityUnread.length}
            </div>
            <p className="text-xs text-muted-foreground">Requires immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medium Priority</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {mediumSeverityUnread.length}
            </div>
            <p className="text-xs text-muted-foreground">Needs review soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Priority</CardTitle>
            <AlertTriangle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {lowSeverityUnread.length}
            </div>
            <p className="text-xs text-muted-foreground">For information</p>
          </CardContent>
        </Card>
      </div>

      {/* Alert Types Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Alert Types Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(alertsByType).map(([type, count]) => (
              <div key={type} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="text-muted-foreground">
                  {getAlertIcon(type)}
                </div>
                <div>
                  <p className="font-medium">{count}</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {type.replace('_', ' ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="sales_drop">Sales Drop</SelectItem>
                <SelectItem value="review_spike">Review Spike</SelectItem>
                <SelectItem value="inventory_low">Low Inventory</SelectItem>
                <SelectItem value="campaign_underperform">Campaign Issues</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Alerts ({filteredAlerts.length})
          {autoRefresh && (
            <span className="ml-2 text-sm text-muted-foreground">
              • Auto-refreshing every 5 seconds
            </span>
          )}
        </h2>
        
        {filteredAlerts.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-muted-foreground">
                {alerts.length === 0 
                  ? "No alerts at this time. All systems are running smoothly!"
                  : "No alerts match your current filters."
                }
              </p>
            </CardContent>
          </Card>
        )}
        
        {filteredAlerts.map((alert) => (
          <Card key={alert.id} className={`border-l-4 ${getAlertColor(alert.severity, alert.isRead)}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`text-${alert.severity === 'high' ? 'red' : alert.severity === 'medium' ? 'yellow' : 'blue'}-600 dark:text-${alert.severity === 'high' ? 'red' : alert.severity === 'medium' ? 'yellow' : 'blue'}-400`}>
                    {getAlertIcon(alert.type)}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-semibold ${alert.isRead ? 'text-muted-foreground' : ''}`}>
                        {alert.title}
                      </h3>
                      {!Boolean(alert.isRead) && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getTypeBadge(alert.type)}
                      {getSeverityBadge(alert.severity)}
                      {alert.isRead && (
                        <Badge variant="outline" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Read
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {alert.createdAt 
                        ? format(new Date(alert.createdAt), "MMM d, yyyy 'at' h:mm a")
                        : "Time unknown"
                      }
                    </p>
                  </div>
                </div>
                
                {!Boolean(alert.isRead) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMarkAsRead(alert.id)}
                    disabled={markAsReadMutation.isPending}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Read
                  </Button>
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              <p className={`text-gray-700 dark:text-gray-300 ${Boolean(alert.isRead) ? 'opacity-70' : ''}`}>
                {alert.message}
              </p>
              
              {alert.metadata && (
                <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm font-medium mb-2">Additional Details:</p>
                  <pre className="text-xs text-muted-foreground overflow-x-auto">
                    {JSON.stringify(alert.metadata as any, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}