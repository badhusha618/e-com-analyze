export interface MetricCard {
  label: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface TopProduct {
  id: number;
  name: string;
  sales: number;
  revenue: string;
  growth: string;
  rank: number;
}

export interface ReviewDistribution {
  rating: number;
  count: number;
  percentage: number;
}

export interface CampaignMetrics {
  name: string;
  channel: string;
  roi: number;
  spent: string;
  revenue: string;
  performance: number;
}

export interface AlertItem {
  id: number;
  type: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  isRead: boolean;
  createdAt: Date;
}
