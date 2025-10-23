-- Create bookings table for product reservations
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  booking_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  pickup_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  total_amount NUMERIC NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_quantity CHECK (quantity > 0),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled'))
);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Users can view their own bookings
CREATE POLICY "Users can view their own bookings"
ON public.bookings
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own bookings
CREATE POLICY "Users can create their own bookings"
ON public.bookings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending bookings
CREATE POLICY "Users can update their own pending bookings"
ON public.bookings
FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending');

-- Cashiers and admins can view all bookings
CREATE POLICY "Cashiers and admins can view all bookings"
ON public.bookings
FOR SELECT
USING (has_role(auth.uid(), 'cashier'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Cashiers and admins can update any booking
CREATE POLICY "Cashiers and admins can update all bookings"
ON public.bookings
FOR UPDATE
USING (has_role(auth.uid(), 'cashier'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Trigger for automatic timestamp updates
CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for bookings
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;