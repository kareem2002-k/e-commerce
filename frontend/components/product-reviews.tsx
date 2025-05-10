"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Star, ThumbsUp, MessageSquare, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/AuthContext"
import { getUrl } from "@/utils"

interface Review {
  id: string
  rating: number
  comment: string
  createdAt: string
  user: {
    id: string
    name: string
  }
}

interface RatingDistribution {
  [key: number]: number
}

interface ProductReviewsProps {
  productId: string
  rating: number
  reviewCount: number
}

export function ProductReviews({ productId, rating, reviewCount }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [ratingDistribution, setRatingDistribution] = useState<RatingDistribution>({
    5: 0, 4: 0, 3: 0, 2: 0, 1: 0
  })
  const [helpfulReviews, setHelpfulReviews] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [userReview, setUserReview] = useState<Review | null>(null)
  const [newReviewRating, setNewReviewRating] = useState(0)
  const [newReviewComment, setNewReviewComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const { user, token } = useAuth()

  // Fetch all reviews for the product
  useEffect(() => {
    if (productId && token) {
      fetchReviews()
    }
  }, [productId, token])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/reviews/product/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) throw new Error('Failed to fetch reviews')
      
      const data = await response.json()
      setReviews(data)
      
      // Calculate rating distribution
      const distribution: RatingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      data.forEach((review: Review) => {
        distribution[review.rating] = (distribution[review.rating] || 0) + 1
      })
      
      // Convert to percentages
      const total = data.length
      Object.keys(distribution).forEach((rating) => {
        const count = distribution[Number(rating)] || 0
        distribution[Number(rating)] = total > 0 ? Math.round((count / total) * 100) : 0
      })
      
      setRatingDistribution(distribution)
      
      // Check if current user has already reviewed
      if (user) {
        const userReviewFound = data.find((review: Review) => review.user.id === user.id)
        setUserReview(userReviewFound || null)
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Error fetching reviews:', error)
      setLoading(false)
    }
  }

  const handleHelpfulClick = (reviewId: string) => {
    if (helpfulReviews.includes(reviewId)) {
      setHelpfulReviews(helpfulReviews.filter((id) => id !== reviewId))
    } else {
      setHelpfulReviews([...helpfulReviews, reviewId])
    }
  }

  const handleRatingClick = (rating: number) => {
    setNewReviewRating(rating)
  }

  const handleSubmitReview = async () => {
    if (!user) {
      toast.error("Please log in to submit a review")
      return
    }
    
    if (newReviewRating === 0) {
      toast.error("Please select a rating")
      return
    }
    
    try {
      setSubmitting(true)
      const API_URL = getUrl(); 
      const response = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId,
          rating: newReviewRating,
          comment: newReviewComment
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        toast.error(data.message || "Failed to submit review")
        return
      }
      
      toast.success("Review submitted successfully")
      
      // Reset form
      setNewReviewRating(0)
      setNewReviewComment("")
      
      // Refresh reviews
      fetchReviews()
    } catch (error) {
      console.error('Error submitting review:', error)
      toast.error("Failed to submit review")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Overall Rating */}
        <Card>
          <CardHeader>
            <CardTitle>Overall Rating</CardTitle>
            <CardDescription>Based on {reviewCount} reviews</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="text-5xl font-bold mb-2">{rating.toFixed(1)}</div>
            <div className="flex items-center mb-4">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-5 w-5",
                      i < Math.floor(rating) ? "fill-voltBlue-500 text-voltBlue-500" : "fill-muted text-muted",
                    )}
                  />
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Rating Distribution */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(ratingDistribution)
              .sort((a, b) => Number(b[0]) - Number(a[0]))
              .map(([rating, percentage]) => (
                <div key={rating} className="flex items-center gap-2">
                  <div className="flex items-center gap-1 w-12">
                    <span>{rating}</span>
                    <Star className="h-4 w-4 fill-voltBlue-500 text-voltBlue-500" />
                  </div>
                  <Progress value={percentage} className="h-2" />
                  <span className="text-sm text-muted-foreground w-10">{percentage}%</span>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>

      {/* Write a Review */}
      {user && !userReview ? (
        <Card>
          <CardHeader>
            <CardTitle>Write a Review</CardTitle>
            <CardDescription>Share your experience with this product</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="mb-2 text-sm font-medium">Your Rating</div>
                <div className="flex items-center gap-1">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <button 
                        key={i} 
                        className={cn(
                          "text-muted-foreground hover:text-voltBlue-500", 
                          i < newReviewRating && "fill-voltBlue-500 text-voltBlue-500"
                        )}
                        onClick={() => handleRatingClick(i + 1)}
                      >
                        <Star className={cn("h-6 w-6", i < newReviewRating && "fill-voltBlue-500")} />
                      </button>
                    ))}
                </div>
              </div>
              <div>
                <div className="mb-2 text-sm font-medium">Your Review</div>
                <Textarea 
                  placeholder="Share your thoughts about this product..." 
                  className="min-h-[120px]"
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSubmitReview} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Review"
              )}
            </Button>
          </CardFooter>
        </Card>
      ) : userReview ? (
        <Card>
          <CardHeader>
            <CardTitle>Your Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-4 w-4",
                        i < userReview.rating ? "fill-voltBlue-500 text-voltBlue-500" : "fill-muted text-muted",
                      )}
                    />
                  ))}
              </div>
              <span className="text-sm text-muted-foreground">
                on {new Date(userReview.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p>{userReview.comment}</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Write a Review</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">Please log in to leave a review</p>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Customer Reviews</h3>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-voltBlue-500" />
          </div>
        ) : reviews.length > 0 ? (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarFallback>{review.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex">
                          {Array(5)
                            .fill(0)
                            .map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "h-4 w-4",
                                  i < review.rating ? "fill-voltBlue-500 text-voltBlue-500" : "fill-muted text-muted",
                                )}
                              />
                            ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          by {review.user.name} on {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{review.comment}</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(helpfulReviews.includes(review.id) && "text-voltBlue-500")}
                  onClick={() => handleHelpfulClick(review.id)}
                >
                  <ThumbsUp className="mr-1 h-4 w-4" />
                  Helpful ({helpfulReviews.includes(review.id) ? 1 : 0})
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-6">
              <p className="text-center text-muted-foreground">No reviews yet. Be the first to review this product!</p>
            </CardContent>
          </Card>
        )}
      </div>

      {reviews.length > 5 && (
        <div className="flex justify-center">
          <Button variant="outline">Load More Reviews</Button>
        </div>
      )}
    </div>
  )
}
