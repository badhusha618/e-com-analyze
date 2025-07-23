import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, X, Check, AlertTriangle, Info, AlertCircle, ExternalLink, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Alert {
  id: number;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: string;
  productId?: number;
  vendorId?: number;
  resolved: boolean;
  metadata?: {
    productName?: string;
    vendorName?: string;
    sentimentScore?: number;
    responseTime?: number;
  };
}

interface NotificationCenterProps {
  className?: string;
}

export function NotificationCenter({ className }: NotificationCenterProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedTab, setSelectedTab] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // WebSocket connection for real-time alerts
  useEffect(() => {
    const connectWebSocket = () => {
      const ws = new WebSocket(`ws://${window.location.host}/api/alerts/stream`);
      
      ws.onopen = () => {
        setIsConnected(true);
        console.log('Connected to alert stream');
      };

      ws.onmessage = (event) => {
        try {
          const newAlert: Alert = JSON.parse(event.data);
          
          // Add to alerts list
          setAlerts(prev => [newAlert, ...prev].slice(0, 100)); // Keep last 100 alerts
          setUnreadCount(prev => prev + 1);
          
          // Show toast notification
          toast({
            title: newAlert.title,
            description: newAlert.description,
            variant: newAlert.type === 'critical' ? 'destructive' : 'default',
          });
          
          // Show browser notification
          if (Notification.permission === 'granted') {
            new Notification(newAlert.title, {
              body: newAlert.description,
              icon: '/favicon.ico',
              badge: '/favicon.ico',
            });
          }
        } catch (error) {
          console.error('Error parsing alert:', error);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        console.log('Disconnected from alert stream');
        // Reconnect after 3 seconds
        setTimeout(connectWebSocket, 3000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    };

    connectWebSocket();
  }, [toast]);

  // Load initial alerts
  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const response = await fetch('/api/alerts');
        if (response.ok) {
          const data = await response.json();
          setAlerts(data);
          setUnreadCount(data.filter((alert: Alert) => !alert.resolved).length);
        }
      } catch (error) {
        console.error('Failed to load alerts:', error);
      }
    };

    loadAlerts();
  }, []);

  const markAsResolved = useCallback(async (alertId: number) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}/resolve`, {
        method: 'PATCH',
      });

      if (response.ok) {
        setAlerts(prev => 
          prev.map(alert => 
            alert.id === alertId ? { ...alert, resolved: true } : alert
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        
        toast({
          title: "Alert resolved",
          description: "Alert has been marked as resolved",
        });
      }
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
  }, [toast]);

  const markAllAsRead = useCallback(() => {
    setUnreadCount(0);
    // Optionally update server state
  }, []);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default: return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getAlertBadgeVariant = (type: string) => {
    switch (type) {
      case 'critical': return 'destructive';
      case 'warning': return 'secondary';
      default: return 'outline';
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (selectedTab === 'all') return true;
    return alert.type === selectedTab;
  });

  const handleViewProduct = (productId: number) => {
    // Navigate to product page
    window.open(`/products/${productId}`, '_blank');
  };

  const handleContactVendor = (vendorId: number) => {
    // Navigate to vendor contact page
    window.open(`/vendors/${vendorId}/contact`, '_blank');
  };

  return (
    <Card className={cn("w-full max-w-4xl", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <div>
              <CardTitle>Notification Center</CardTitle>
              <CardDescription>
                Real-time alerts and system notifications
                {isConnected ? (
                  <Badge variant="outline" className="ml-2 text-green-600 border-green-600">
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="outline" className="ml-2 text-red-600 border-red-600">
                    Disconnected
                  </Badge>
                )}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Badge variant="destructive" className="px-2 py-1">
                {unreadCount} unread
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              Mark all read
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as any)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="flex items-center gap-2">
              All
              <Badge variant="secondary" className="text-xs">
                {alerts.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="critical" className="flex items-center gap-2">
              Critical
              <Badge variant="destructive" className="text-xs">
                {alerts.filter(a => a.type === 'critical').length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="warning" className="flex items-center gap-2">
              Warning
              <Badge variant="secondary" className="text-xs">
                {alerts.filter(a => a.type === 'warning').length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="info" className="flex items-center gap-2">
              Info
              <Badge variant="outline" className="text-xs">
                {alerts.filter(a => a.type === 'info').length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {['all', 'critical', 'warning', 'info'].map(tab => (
            <TabsContent key={tab} value={tab} className="mt-4">
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {filteredAlerts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No {tab === 'all' ? '' : tab} alerts found
                    </div>
                  ) : (
                    filteredAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={cn(
                          "p-4 rounded-lg border transition-all duration-200",
                          alert.resolved 
                            ? "bg-muted/50 border-muted" 
                            : "bg-card border-border hover:border-primary/50"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {getAlertIcon(alert.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={cn(
                                "font-medium text-sm",
                                alert.resolved && "text-muted-foreground line-through"
                              )}>
                                {alert.title}
                              </h4>
                              <Badge variant={getAlertBadgeVariant(alert.type)} className="text-xs">
                                {alert.type}
                              </Badge>
                              {alert.resolved && (
                                <Badge variant="outline" className="text-xs text-green-600">
                                  Resolved
                                </Badge>
                              )}
                            </div>
                            
                            <p className={cn(
                              "text-sm mb-2",
                              alert.resolved ? "text-muted-foreground" : "text-foreground"
                            )}>
                              {alert.description}
                            </p>
                            
                            {alert.metadata && (
                              <div className="flex flex-wrap gap-2 mb-2 text-xs text-muted-foreground">
                                {alert.metadata.productName && (
                                  <span>Product: {alert.metadata.productName}</span>
                                )}
                                {alert.metadata.vendorName && (
                                  <span>Vendor: {alert.metadata.vendorName}</span>
                                )}
                                {alert.metadata.sentimentScore && (
                                  <span>Sentiment: {alert.metadata.sentimentScore}/100</span>
                                )}
                                {alert.metadata.responseTime && (
                                  <span>Response: {alert.metadata.responseTime}h</span>
                                )}
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {new Date(alert.timestamp).toLocaleString()}
                              </span>
                              
                              <div className="flex items-center gap-2">
                                {alert.productId && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2"
                                    onClick={() => handleViewProduct(alert.productId!)}
                                  >
                                    <Eye className="h-3 w-3 mr-1" />
                                    View Product
                                  </Button>
                                )}
                                
                                {alert.vendorId && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2"
                                    onClick={() => handleContactVendor(alert.vendorId!)}
                                  >
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    Contact Vendor
                                  </Button>
                                )}
                                
                                {!alert.resolved && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-green-600 hover:text-green-700"
                                    onClick={() => markAsResolved(alert.id)}
                                  >
                                    <Check className="h-3 w-3 mr-1" />
                                    Resolve
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}