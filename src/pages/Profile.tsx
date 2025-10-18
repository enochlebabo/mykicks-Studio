import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

interface Order {
  id: string;
  created_at: string;
  final_amount: number;
  status: string;
  discount_amount: number;
  total_amount: number;
}

interface Profile {
  full_name: string;
  phone: string;
}

const Profile = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState<Profile>({ full_name: "", phone: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchOrders();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("id", user?.id)
        .single();

      if (error) throw error;
      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
        })
        .eq("id", user?.id);

      if (error) throw error;

      toast({
        title: "Profile updated!",
        description: "Your profile has been updated successfully",
      });
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <h1 className="text-4xl font-bold mb-8 animate-fade-in">My Profile</h1>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="shadow-glow">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={updateProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ""}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profile.phone || ""}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Update Profile"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="shadow-glow">
            <CardHeader>
              <CardTitle>Order History</CardTitle>
              <CardDescription>View your past orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No orders yet</p>
                ) : (
                  orders.map((order) => (
                    <Card key={order.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                            <p className="text-sm mt-1">
                              Subtotal: R {order.total_amount.toFixed(2)}
                            </p>
                            {order.discount_amount > 0 && (
                              <p className="text-sm text-accent">
                                Discount: -R {order.discount_amount.toFixed(2)}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-primary">
                              R {order.final_amount.toFixed(2)}
                            </p>
                            <p className={`text-sm mt-1 ${
                              order.status === "approved" ? "text-green-600" :
                              order.status === "pending" ? "text-yellow-600" :
                              "text-red-600"
                            }`}>
                              {order.status.toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;
