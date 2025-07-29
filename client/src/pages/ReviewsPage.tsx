import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectFilteredReviews,
  selectReviewAnalytics,
  selectReviewFilters,
  selectReviewsLoading,
  selectReviewsError,
} from "@/store/selectors";
import {
  fetchReviews,
  fetchReviewAnalytics,
  setFilters,
  clearFilters,
  updateReviewSentiment,
} from "@/store/slices/reviewsSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Star, TrendingDown, MessageSquare, AlertTriangle, X } from "lucide-react";
import { format } from "date-fns";

export default function ReviewsPage() {
  const dispatch = useAppDispatch();
  
  // Select state from Redux
  const reviews = useAppSelector(selectFilteredReviews);
  const analytics = useAppSelector(selectReviewAnalytics);
  const filters = useAppSelector(selectReviewFilters);
  const isLoading = useAppSelector(selectReviewsLoading);
  const error = useAppSelector(selectReviewsError);

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchReviews());
    dispatch(fetchReviewAnalytics());
  }, [dispatch]);

  const handleFilterChange = (key: string, value: string) => {
    dispatch(setFilters({ [key]: value }));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  const handleSentimentUpdate = (reviewId: number, sentiment: string) => {
    dispatch(updateReviewSentiment({ reviewId, sentiment }));
  };

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

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600 dark:text-red-400">Failed to load reviews: {error}</p>
            <Button 
              onClick={() => {
                dispatch(fetchReviews());
                dispatch(fetchReviewAnalytics());
              }}
              className="mt-2"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const lowRatedReviews = reviews.filter(r => r.rating <= 2);
  const avgRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : 0;

  return (
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
            <div className="text-2xl font-bold">
              {isLoading ? "..." : analytics?.totalReviews?.toLocaleString() || reviews.length.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {isLoading ? "..." : analytics?.averageRating?.toFixed(1) || avgRating.toFixed(1)}
              <div className="flex">
                {renderStars(Math.round(analytics?.averageRating || avgRating))}
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
              {isLoading ? "..." : analytics?.lowRatedReviews || lowRatedReviews.length}
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
              {isLoading ? "..." : analytics?.positiveReviews || reviews.filter(r => r.sentiment === "positive").length}
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
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filters.ratingFilter} onValueChange={(value) => handleFilterChange('ratingFilter', value)}>
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
            
            <Select value={filters.sentimentFilter} onValueChange={(value) => handleFilterChange('sentimentFilter', value)}>
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
            
            <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
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
              onClick={() => handleFilterChange('sortOrder', filters.sortOrder === "asc" ? "desc" : "asc")}
            >
              {filters.sortOrder === "asc" ? "↑" : "↓"}
            </Button>

            {(filters.searchTerm || filters.ratingFilter !== 'all' || filters.sentimentFilter !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Reviews ({reviews.length})</h2>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {reviews.map((review) => (
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

                    {/* Sentiment Update Controls */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={review.sentiment === 'positive' ? 'default' : 'outline'}
                        onClick={() => handleSentimentUpdate(review.id, 'positive')}
                      >
                        Positive
                      </Button>
                      <Button
                        size="sm"
                        variant={review.sentiment === 'neutral' ? 'default' : 'outline'}
                        onClick={() => handleSentimentUpdate(review.id, 'neutral')}
                      >
                        Neutral
                      </Button>
                      <Button
                        size="sm"
                        variant={review.sentiment === 'negative' ? 'default' : 'outline'}
                        onClick={() => handleSentimentUpdate(review.id, 'negative')}
                      >
                        Negative
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {reviews.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No reviews found matching your criteria</p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}