import { useState, useEffect, useCallback } from 'react';

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
  const [eventSource, setEventSource] = useState<EventSource | null>(null);

  const calculateMetrics = useCallback((data: SentimentData[]) => {
    if (data.length === 0) return;

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

  const connect = useCallback(() => {
    if (eventSource) {
      eventSource.close();
    }

    const newEventSource = new EventSource('/api/sentiment/updates');
    
    newEventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    newEventSource.onmessage = (event) => {
      try {
        const newSentimentData: SentimentData = JSON.parse(event.data);
        setSentimentData(prev => {
          const updated = [...prev, newSentimentData].slice(-100); // Keep last 100 reviews
          calculateMetrics(updated);
          return updated;
        });
      } catch (err) {
        console.error('Error parsing sentiment data:', err);
        setError('Failed to parse sentiment data');
      }
    };

    newEventSource.onerror = () => {
      setIsConnected(false);
      setError('Connection to sentiment stream lost');
    };

    setEventSource(newEventSource);
  }, [eventSource, calculateMetrics]);

  const disconnect = useCallback(() => {
    if (eventSource) {
      eventSource.close();
      setEventSource(null);
      setIsConnected(false);
    }
  }, [eventSource]);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // Fallback: Load initial data from API if SSE is not available
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const response = await fetch('/api/reviews/sentiment');
        if (response.ok) {
          const data = await response.json();
          setSentimentData(data);
          calculateMetrics(data);
        }
      } catch (err) {
        console.error('Failed to load initial sentiment data:', err);
      }
    };

    loadInitialData();
  }, [calculateMetrics]);

  return {
    sentimentData,
    metrics,
    isConnected,
    error,
    connect,
    disconnect
  };
}