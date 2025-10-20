-- Create wishlist table
CREATE TABLE IF NOT EXISTS public.wishlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Create product reviews table
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Wishlist policies
CREATE POLICY "Users can view their own wishlist" 
ON public.wishlist FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their wishlist" 
ON public.wishlist FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from their wishlist" 
ON public.wishlist FOR DELETE 
USING (auth.uid() = user_id);

-- Product review policies
CREATE POLICY "Anyone can view reviews" 
ON public.product_reviews FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own reviews" 
ON public.product_reviews FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" 
ON public.product_reviews FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" 
ON public.product_reviews FOR DELETE 
USING (auth.uid() = user_id);