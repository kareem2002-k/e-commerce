"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Star, ThumbsUp, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

// Mock reviews data
const mockReviews = [
  {
    id: "1",
    user: {
      name: "Alex Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "AJ",
    },
    rating: 5,
    date: "2023-04-15",
    title: "Absolutely Amazing Product",
    content:
      "This laptop exceeded all my expectations. The performance is incredible, and the display is stunning. Battery life is excellent, and it stays cool even under heavy load. Highly recommended!",
    helpful: 24,
    replies: 2,
  },
  {
    id: "2",
    user: {
      name: "Sarah Miller",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "SM",
    },
    rating: 4,
    date: "2023-03-28",
    title: "Great Value for Money",
    content:
      "I've been using this laptop for a month now, and I'm very satisfied with the purchase. The build quality is excellent, and it handles all my tasks smoothly. The only minor issue is the fan noise under heavy load.",
    helpful: 18,
    replies: 1,
  },
  {
    id: "3",
    user: {
      name: "Michael Chen",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "MC",
    },
    rating: 5,
    date: "2023-03-10",
    title: "Perfect for Professional Work",
    content:
      "As a graphic designer, I need a powerful machine that can handle resource-intensive applications. This laptop delivers exceptional performance and the color accuracy of the display is perfect for my work.",
    helpful: 32,
    replies: 0,
  },
  {
    id: "4",
    user: {
      name: "Emily Wilson",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "EW",
    },
    rating: 3,
    date: "2023-02-22",
    title: "Good but Could Be Better",
    content:
      "The laptop performs well for most tasks, but I've experienced some issues with the trackpad and occasional software glitches. Customer support was helpful in resolving these issues.",
    helpful: 7,
    replies: 3,
  },
]

// Rating distribution
const ratingDistribution = {
  5: 68,
  4: 24,
  3: 5,
  2: 2,
  1: 1,
}

interface ProductReviewsProps {
  productId: string
  rating: number
  reviewCount: number
}

export function ProductReviews({ productId, rating, reviewCount }: ProductReviewsProps) {
  const [helpfulReviews, setHelpfulReviews] = useState<string[]>([])

  const handleHelpfulClick = (reviewId: string) => {
    if (helpfulReviews.includes(reviewId)) {
      setHelpfulReviews(helpfulReviews.filter((id) => id !== reviewId))
    } else {
      setHelpfulReviews([...helpfulReviews, reviewId])
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
                    <button key={i} className="text-muted-foreground hover:text-voltBlue-500">
                      <Star className="h-6 w-6" />
                    </button>
                  ))}
              </div>
            </div>
            <div>
              <div className="mb-2 text-sm font-medium">Your Review</div>
              <Textarea placeholder="Share your thoughts about this product..." className="min-h-[120px]" />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button>Submit Review</Button>
        </CardFooter>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Customer Reviews</h3>
        {mockReviews.map((review) => (
          <Card key={review.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarImage src={review.user.avatar || "/placeholder.svg"} alt={review.user.name} />
                    <AvatarFallback>{review.user.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">{review.title}</CardTitle>
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
                        by {review.user.name} on {new Date(review.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{review.content}</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="ghost"
                size="sm"
                className={cn(helpfulReviews.includes(review.id) && "text-voltBlue-500")}
                onClick={() => handleHelpfulClick(review.id)}
              >
                <ThumbsUp className="mr-1 h-4 w-4" />
                Helpful ({helpfulReviews.includes(review.id) ? review.helpful + 1 : review.helpful})
              </Button>
              <Button variant="ghost" size="sm">
                <MessageSquare className="mr-1 h-4 w-4" />
                Reply ({review.replies})
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="flex justify-center">
        <Button variant="outline">Load More Reviews</Button>
      </div>
    </div>
  )
}
