import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Star, TrendingDown, MessageSquare, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import type { Review, Product } from "@shared/schema";

interface ReviewWithProduct extends Review {
  product?: Product;
  sentimentScore?: number;
}

export default function ReviewsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [sortBy, setSortBy] = useState<string>("reviewDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const { data: reviews = [], isLoading, error } = useQuery<ReviewWithProduct[]>({
    queryKey: ["/api/reviews"],
  });

  const { data: reviewAnalytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/reviews/analytics"],
  });

  // Filter and sort reviews
  const filteredReviews = reviews
    .filter(review => {
      const matchesSearch = 
        review.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.product?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRating = ratingFilter === "all" || 
        (ratingFilter === "low" && review.rating <= 2) ||
        (ratingFilter === "high" && review.rating >= 4) ||
        review.rating.toString() === ratingFilter;
      
      const matchesSentiment = sentimentFilter === "all" || review.sentiment === sentimentFilter;
      
      return matchesSearch && matchesRating && matchesSentiment;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "rating":
          aValue = a.rating;
          bValue = b.rating;
          break;
        case "reviewDate":
          aValue = new Date(a.reviewDate || 0).getTime();
          bValue = new Date(b.reviewDate || 0).getTime();
          break;
        case "sentiment":
          aValue = a.sentimentScore || 0;
          bValue = b.sentimentScore || 0;
          break;
        default:
          aValue = a.title || "";
          bValue = b.title || "";
      }
      
      if (sortOrder === "desc") {
        return aValue > bValue ? -1 : 1;
      }
      return aValue < bValue ? -1 : 1;
    });

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating 
                ? "fill-yellow-400 text-yellow-400" 
                : "text-gray-300 dark:text-gray-600"
            }`}
          />
        ))}
      </div>
    );
  };

  const getSentimentBadge = (sentiment: string | null) => {
    if (!sentiment) return <Badge variant="outline">Unknown</Badge>;
    
    const variants = {
      positive: "default",
      negative: "destructive",
      neutral: "secondary"
    } as const;

    const colors = {
      positive: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      negative: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      neutral: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    };

    return (
      <Badge variant={variants[sentiment as keyof typeof variants] || "outline"}>
        {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
      </Badge>
    );
  };

  const getSentimentColor = (sentiment: string | null) => {
    switch (sentiment) {
      case "positive": return "border-l-green-500";
      case "negative": return "border-l-red-500";
      case "neutral": return "border-l-yellow-500";
      default: return "border-l-gray-300";
    }
  };

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
              <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <AppLayout title="Reviews">
        <div className="p-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-red-600 dark:text-red-400">Failed to load reviews</p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const lowRatedReviews = reviews.filter(r => r.rating <= 2);
  const avgRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : 0;

  return (
    <AppLayout title="Reviews" loading={isLoading}>
      <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Product Reviews</h1>
          <p className="text-muted-foreground">Monitor customer feedback and sentiment analysis</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviews.length.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {avgRating.toFixed(1)}
              <div className="flex">
                {renderStars(Math.round(avgRating))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Ratings</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {lowRatedReviews.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {((lowRatedReviews.length / Math.max(1, reviews.length)) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sentiment Score</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reviews.filter(r => r.sentiment === "positive").length}
            </div>
            <p className="text-xs text-muted-foreground">Positive reviews</p>
          </CardContent>
        </Card>
      </div>

      {/* Low-Rated Products Alert */}
      {lowRatedReviews.length > 0 && (
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
              <AlertTriangle className="h-5 w-5" />
              Products Requiring Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {lowRatedReviews.length} products have received low ratings (2 stars or below) recently.
            </p>
            <div className="space-y-2">
              {Array.from(new Set(lowRatedReviews.map(r => r.productId)))
                .slice(0, 5)
                .map(productId => {
                  const productReviews = lowRatedReviews.filter(r => r.productId === productId);
                  const product = productReviews[0]?.product;
                  return (
                    <div key={productId} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-950 rounded">
                      <span className="font-medium">{product?.name || `Product #${productId}`}</span>
                      <Badge variant="destructive">{productReviews.length} low rating(s)</Badge>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reviews or products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
                <SelectItem value="high">High (4-5 Stars)</SelectItem>
                <SelectItem value="low">Low (1-2 Stars)</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by sentiment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sentiments</SelectItem>
                <SelectItem value="positive">Positive</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="negative">Negative</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reviewDate">Date</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="sentiment">Sentiment</SelectItem>
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

      {/* Reviews List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Reviews ({filteredReviews.length})</h2>
        
        {filteredReviews.map((review) => (
          <Card key={review.id} className={`border-l-4 ${getSentimentColor(review.sentiment)}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    {renderStars(review.rating)}
                    <span className="text-sm text-muted-foreground">
                      {review.reviewDate 
                        ? format(new Date(review.reviewDate), "MMM d, yyyy")
                        : "Date unknown"
                      }
                    </span>
                    {review.isVerified && (
                      <Badge variant="outline" className="text-xs">Verified</Badge>
                    )}
                  </div>
                  
                  {review.title && (
                    <h3 className="font-semibold text-lg">{review.title}</h3>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Product: {review.product?.name || `#${review.productId}`}
                    </span>
                    {getSentimentBadge(review.sentiment)}
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {review.content && (
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {review.content}
                  </p>
                )}
                
                {review.vendorResponse && (
                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border-l-4 border-blue-500">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                      Vendor Response:
                    </p>
                    <p className="text-blue-700 dark:text-blue-300 text-sm">
                      {review.vendorResponse}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredReviews.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No reviews found matching your criteria</p>
            </CardContent>
          </Card>
        )}
      </div>
      </div>
    </AppLayout>
  );
}