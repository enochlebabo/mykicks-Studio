import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: {
    id: string;
    name: string;
    price: number;
    stock_quantity: number;
  };
}

export const BookingDialog = ({ open, onOpenChange, product }: BookingDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookingData, setBookingData] = useState({
    quantity: 1,
    pickupDate: "",
    notes: "",
  });

  const handleBooking = async () => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to make a booking",
        variant: "destructive",
      });
      return;
    }

    if (!bookingData.pickupDate) {
      toast({
        title: "Missing information",
        description: "Please select a pickup date",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("bookings").insert({
        user_id: user.id,
        product_id: product.id,
        quantity: bookingData.quantity,
        pickup_date: bookingData.pickupDate,
        total_amount: product.price * bookingData.quantity,
        notes: bookingData.notes,
        status: "confirmed", // Auto-confirm bookings
      });

      if (error) throw error;

      toast({
        title: "Booking confirmed!",
        description: "Your booking has been automatically confirmed. Check your bookings page for details.",
      });

      onOpenChange(false);
      setBookingData({ quantity: 1, pickupDate: "", notes: "" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Book {product.name}</DialogTitle>
          <DialogDescription>
            Reserve this product for pickup. Booking will be automatically confirmed.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={product.stock_quantity}
              value={bookingData.quantity}
              onChange={(e) =>
                setBookingData({ ...bookingData, quantity: parseInt(e.target.value) || 1 })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pickupDate">Pickup Date</Label>
            <Input
              id="pickupDate"
              type="date"
              min={new Date().toISOString().split("T")[0]}
              value={bookingData.pickupDate}
              onChange={(e) =>
                setBookingData({ ...bookingData, pickupDate: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any special requests?"
              value={bookingData.notes}
              onChange={(e) =>
                setBookingData({ ...bookingData, notes: e.target.value })
              }
            />
          </div>
          <div className="text-sm bg-muted p-3 rounded-lg">
            <div className="flex justify-between mb-1">
              <span>Price per item:</span>
              <span className="font-medium">R {product.price}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span>R {(product.price * bookingData.quantity).toFixed(2)}</span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleBooking}>Confirm Booking</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
