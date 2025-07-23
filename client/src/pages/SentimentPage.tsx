import { useState } from 'react';
import { SentimentDashboard } from '@/components/sentiment/SentimentDashboard';
import { ProductComparison } from '@/components/sentiment/ProductComparison';
import { NotificationCenter } from '@/components/alerts/NotificationCenter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, GitCompare, Bell } from 'lucide-react';

export default function SentimentPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sentiment Analysis</h1>
        <p className="text-muted-foreground">
          Real-time customer sentiment monitoring and analysis
        </p>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Live Dashboard
          </TabsTrigger>
          <TabsTrigger value="comparison" className="flex items-center gap-2">
            <GitCompare className="h-4 w-4" />
            Product Comparison
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notification Center
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <SentimentDashboard />
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <ProductComparison />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <NotificationCenter />
        </TabsContent>
      </Tabs>
    </div>
  );
}