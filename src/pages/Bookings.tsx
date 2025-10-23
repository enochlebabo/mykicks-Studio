import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Package, Clock, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Booking {
  id: string;
  product_id: string;
  quantity: number;
  pickup_date: string;
  status: string;
  total_amount: number;
  notes: string;
  created_at: string;
  products?: {
    name: string;
    image_url: string;
    brand: string;
  };
}

const Bookings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchBookings();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, navigate]);

  const fetchBookings = async () => {
    try {
      const { data: bookingsData, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch product details separately
      const bookingsWithProducts = await Promise.all(
        (bookingsData || []).map(async (booking) => {
          const { data: product } = await supabase
            .from("products")
            .select("name, image_url, brand")
            .eq("id", booking.product_id)
            .single();

          return {
            ...booking,
            products: product,
          };
        })
      );

      setBookings(bookingsWithProducts);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", bookingId)
        .eq("status", "pending");

      if (error) throw error;

      toast({
        title: "Success",
        description: "Booking cancelled successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      pending: { variant: "secondary", icon: Clock },
      confirmed: { variant: "default", icon: CheckCircle },
      completed: { variant: "default", icon: CheckCircle },
      cancelled: { variant: "destructive", icon: XCircle },
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Bookings</h1>
          <p className="text-muted-foreground">Track your product reservations</p>
        </div>

        {bookings.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No bookings yet</h3>
              <p className="text-muted-foreground mb-4">Start booking your favorite kicks!</p>
              <Button onClick={() => navigate("/shop")}>Browse Products</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden">
                <CardHeader className="bg-muted/50">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        Booking #{booking.id.slice(0, 8)}
                      </CardTitle>
                      <CardDescription>
                        Created on {format(new Date(booking.created_at), "PPP")}
                      </CardDescription>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex gap-6">
                    {booking.products?.image_url && (
                      <img
                        src={booking.products.image_url}
                        alt={booking.products.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">
                        {booking.products?.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {booking.products?.brand}
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Quantity:</span>
                          <span className="ml-2 font-medium">{booking.quantity}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Total:</span>
                          <span className="ml-2 font-medium">
                            R {Number(booking.total_amount).toFixed(2)}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Pickup Date:</span>
                          <span className="ml-2 font-medium">
                            {format(new Date(booking.pickup_date), "PPP")}
                          </span>
                        </div>
                        {booking.notes && (
                          <div className="col-span-2">
                            <span className="text-muted-foreground">Notes:</span>
                            <p className="mt-1 text-sm">{booking.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {booking.status === "pending" && (
                    <div className="mt-4 flex justify-end">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => cancelBooking(booking.id)}
                      >
                        Cancel Booking
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Bookings;
