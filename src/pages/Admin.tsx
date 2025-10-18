import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Order {
  id: string;
  created_at: string;
  final_amount: number;
  status: string;
  profiles: { full_name: string; email: string };
}

const Admin = () => {
  const { userRole, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userRole && userRole !== "admin") {
      navigate("/");
    }
    if (userRole === "admin") {
      fetchOrders();
    }
  }, [userRole, navigate]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          created_at,
          final_amount,
          status,
          user_id,
          profiles!orders_user_id_fkey (full_name, email)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data as any || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const registerCashier = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create the cashier account
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (signUpError) throw signUpError;

      if (authData.user) {
        // Assign cashier role
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({
            user_id: authData.user.id,
            role: "cashier",
          });

        if (roleError) throw roleError;

        toast({
          title: "Cashier registered!",
          description: `${fullName} has been registered as a cashier`,
        });

        setEmail("");
        setPassword("");
        setFullName("");
      }
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

  if (!user || userRole !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8">
          <CardTitle>Access Denied</CardTitle>
          <CardDescription className="mt-2">You don't have permission to access this page</CardDescription>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <h1 className="text-4xl font-bold mb-8 animate-fade-in">Admin Dashboard</h1>

        <Tabs defaultValue="cashiers" className="space-y-6">
          <TabsList>
            <TabsTrigger value="cashiers">Manage Cashiers</TabsTrigger>
            <TabsTrigger value="orders">View Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="cashiers">
            <Card className="shadow-glow">
              <CardHeader>
                <CardTitle>Register New Cashier</CardTitle>
                <CardDescription>Create a cashier account to manage stock and orders</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={registerCashier} className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Registering..." : "Register Cashier"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card className="shadow-glow">
              <CardHeader>
                <CardTitle>All Orders</CardTitle>
                <CardDescription>View and manage customer orders</CardDescription>
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
                              <p className="font-semibold">{order.profiles.full_name}</p>
                              <p className="text-sm text-muted-foreground">{order.profiles.email}</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {new Date(order.created_at).toLocaleDateString()}
                              </p>
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
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
