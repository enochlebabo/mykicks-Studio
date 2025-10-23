import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Heart, Star, Eye, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { BookingDialog } from "./BookingDialog";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    image_url: string;
    stock_quantity: number;
    size: string;
    brand: string;
    color: string;
  };
  onAddToCart: (productId: string) => void;
  isInWishlist?: boolean;
  onWishlistToggle?: (productId: string) => void;
}

export const ProductCard = ({ product, onAddToCart, isInWishlist, onWishlistToggle }: ProductCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReview, setLoadingReview] = useState(false);
  const { user } = useAuth();

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from("product_reviews")
      .select(`
        *,
        profiles:user_id (full_name)
      `)
      .eq("product_id", product.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setReviews(data);
    }
  };

  const handleViewDetails = async () => {
    setShowDetails(true);
    await fetchReviews();
  };

  const handleReviewSubmit = async () => {
    if (!user) {
      toast({ title: "Please sign in to leave a review", variant: "destructive" });
      return;
    }

    if (rating === 0) {
      toast({ title: "Please select a rating", variant: "destructive" });
      return;
    }

    setLoadingReview(true);
    try {
      const { error } = await supabase
        .from("product_reviews")
        .insert({
          product_id: product.id,
          user_id: user.id,
          rating,
          review_text: reviewText,
        });

      if (error) throw error;

      toast({ title: "Review submitted successfully!" });
      setRating(0);
      setReviewText("");
      await fetchReviews();
    } catch (error: any) {
      toast({
        title: "Error submitting review",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingReview(false);
    }
  };

  const avgRating = reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 0;

  return (
    <>
      <Card className="group relative overflow-hidden shadow-card hover:shadow-hover transition-all duration-300 animate-fade-in">
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          {product.stock_quantity < 5 && product.stock_quantity > 0 && (
            <Badge variant="destructive" className="animate-scale-in">
              Low Stock
            </Badge>
          )}
          {user && onWishlistToggle && (
            <Button
              variant="secondary"
              size="icon"
              className={`h-8 w-8 rounded-full ${isInWishlist ? "text-red-500" : ""}`}
              onClick={() => onWishlistToggle(product.id)}
            >
              <Heart className={`h-4 w-4 ${isInWishlist ? "fill-current" : ""}`} />
            </Button>
          )}
        </div>

        <div className="aspect-square overflow-hidden rounded-t-lg relative">
          <img
            src={product.image_url || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleViewDetails}
              className="animate-slide-up"
            >
              <Eye className="mr-2 h-4 w-4" />
              Quick View
            </Button>
          </div>
        </div>

        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <CardTitle className="text-lg line-clamp-1">{product.name}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                {product.brand} • {product.color}
                {avgRating > 0 && (
                  <span className="flex items-center text-accent">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    {avgRating.toFixed(1)}
                  </span>
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{product.description}</p>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-2xl font-bold text-primary">R {product.price.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Size: {product.size}</p>
            </div>
            <Badge variant={product.stock_quantity > 0 ? "secondary" : "destructive"}>
              {product.stock_quantity > 0 ? `${product.stock_quantity} left` : "Out of stock"}
            </Badge>
          </div>
        </CardContent>

        <CardFooter className="flex gap-2">
          <Button
            className="flex-1"
            onClick={() => onAddToCart(product.id)}
            disabled={product.stock_quantity === 0}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Cart
          </Button>
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => setShowBooking(true)}
            disabled={product.stock_quantity === 0}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Book
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{product.name}</DialogTitle>
            <DialogDescription>{product.brand} • {product.color} • Size {product.size}</DialogDescription>
          </DialogHeader>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="aspect-square rounded-lg overflow-hidden">
              <img
                src={product.image_url || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-3xl font-bold text-primary">R {product.price.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : "Out of stock"}
                </p>
              </div>

              <p className="text-muted-foreground">{product.description}</p>

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => {
                    onAddToCart(product.id);
                    setShowDetails(false);
                  }}
                  disabled={product.stock_quantity === 0}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setShowDetails(false);
                    setShowBooking(true);
                  }}
                  disabled={product.stock_quantity === 0}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Book Now
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t">
            <h3 className="text-xl font-bold">Reviews ({reviews.length})</h3>

            {user && (
              <div className="space-y-3 p-4 bg-muted rounded-lg">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-6 w-6 cursor-pointer transition-colors ${
                        star <= rating ? "fill-accent text-accent" : "text-muted-foreground"
                      }`}
                      onClick={() => setRating(star)}
                    />
                  ))}
                </div>
                <textarea
                  className="w-full p-2 rounded border bg-background"
                  rows={3}
                  placeholder="Share your experience..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                />
                <Button onClick={handleReviewSubmit} disabled={loadingReview}>
                  Submit Review
                </Button>
              </div>
            )}

            <div className="space-y-3">
              {reviews.map((review) => (
                <div key={review.id} className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating ? "fill-accent text-accent" : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {review.profiles?.full_name || "Anonymous"}
                    </span>
                  </div>
                  {review.review_text && (
                    <p className="text-sm">{review.review_text}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BookingDialog
        open={showBooking}
        onOpenChange={setShowBooking}
        product={product}
      />
    </>
  );
};
