-- Add foreign key relationship between bookings and products
ALTER TABLE public.bookings
ADD CONSTRAINT fk_bookings_products
FOREIGN KEY (product_id)
REFERENCES public.products(id)
ON DELETE CASCADE;