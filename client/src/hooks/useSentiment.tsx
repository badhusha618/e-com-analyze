import { useState, useEffect, useCallback, useRef } from 'react';

export interface SentimentData {
  score: number;
  timestamp: string;
  reviewId: number;
  productId: number;
  productName: string;
  reviewText: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  keywords: string[];
}

export interface SentimentMetrics {
  averageScore: number;
  totalReviews: number;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  trend: 'up' | 'down' | 'stable';
}

interface UseSentimentReturn {
  sentimentData: SentimentData[];
  metrics: SentimentMetrics;
  isConnected: boolean;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
}

export function useSentiment(autoConnect: boolean = true): UseSentimentReturn {
  const [sentimentData, setSentimentData] = useState<SentimentData[]>([]);
  const [metrics, setMetrics] = useState<SentimentMetrics>({
    averageScore: 0,
    totalReviews: 0,
    positiveCount: 0,
    negativeCount: 0,
    neutralCount: 0,
    trend: 'stable'
  });
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Calculate metrics from data
  const calculateMetrics = useCallback((data: SentimentData[]) => {
    if (data.length === 0) {
      setMetrics({
        averageScore: 0,
        totalReviews: 0,
        positiveCount: 0,
        negativeCount: 0,
        neutralCount: 0,
        trend: 'stable'
      });
      return;
    }

    const totalReviews = data.length;
    const averageScore = data.reduce((sum, item) => sum + item.score, 0) / totalReviews;
    const positiveCount = data.filter(item => item.sentiment === 'positive').length;
    const negativeCount = data.filter(item => item.sentiment === 'negative').length;
    const neutralCount = data.filter(item => item.sentiment === 'neutral').length;

    // Calculate trend based on last 10 vs previous 10 reviews
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (data.length >= 20) {
      const recent = data.slice(-10);
      const previous = data.slice(-20, -10);
      const recentAvg = recent.reduce((sum, item) => sum + item.score, 0) / 10;
      const previousAvg = previous.reduce((sum, item) => sum + item.score, 0) / 10;
      
      if (recentAvg > previousAvg + 5) trend = 'up';
      else if (recentAvg < previousAvg - 5) trend = 'down';
    }

    setMetrics({
      averageScore,
      totalReviews,
      positiveCount,
      negativeCount,
      neutralCount,
      trend
    });
  }, []);

  // Connect to SSE stream
  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const newEventSource = new EventSource('/api/sentiment/updates');
    eventSourceRef.current = newEventSource;
    
    newEventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    newEventSource.onmessage = (event) => {
      try {
        const newSentimentData: SentimentData = JSON.parse(event.data);
        setSentimentData(prev => [...prev, newSentimentData].slice(-100)); // Keep last 100 reviews
      } catch (err) {
        console.error('Error parsing sentiment data:', err);
        setError('Failed to parse sentiment data');
      }
    };

    newEventSource.onerror = () => {
      setIsConnected(false);
      setError('Connection to sentiment stream lost');
    };
  }, []);

  // Disconnect from SSE stream
  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    }
  }, []);

  // Load initial data on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const response = await fetch('/api/reviews/sentiment');
        if (response.ok) {
          const data = await response.json();
          setSentimentData(data);
        }
      } catch (err) {
        console.error('Failed to load initial sentiment data:', err);
      }
    };

    loadInitialData();
  }, []);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // Recalculate metrics whenever data changes
  useEffect(() => {
    calculateMetrics(sentimentData);
  }, [sentimentData, calculateMetrics]);

  return {
    sentimentData,
    metrics,
    isConnected,
    error,
    connect,
    disconnect
  };
}