import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Order {
  id: string;
  created_at: string;
  final_amount: number;
  status: string;
  profiles: { full_name: string; email: string };
}

const Cashier = () => {
  const { userRole, user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Product form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [size, setSize] = useState("");
  const [brand, setBrand] = useState("");
  const [color, setColor] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (userRole && userRole !== "cashier" && userRole !== "admin") {
      navigate("/");
    }
    if (userRole === "cashier" || userRole === "admin") {
      fetchPendingOrders();
    }
  }, [userRole, navigate]);

  const fetchPendingOrders = async () => {
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
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data as any || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("products").insert({
        name,
        description,
        price: parseFloat(price),
        stock_quantity: parseInt(stockQuantity),
        size,
        brand,
        color,
        image_url: imageUrl,
        created_by: user?.id,
      });

      if (error) throw error;

      toast({
        title: "Product added!",
        description: `${name} has been added to the store`,
      });

      // Reset form
      setName("");
      setDescription("");
      setPrice("");
      setStockQuantity("");
      setSize("");
      setBrand("");
      setColor("");
      setImageUrl("");
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

  const approveOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({
          status: "approved",
          approved_by: user?.id,
        })
        .eq("id", orderId);

      if (error) throw error;

      toast({
        title: "Order approved!",
        description: "The order has been approved",
      });

      fetchPendingOrders();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!user || (userRole !== "cashier" && userRole !== "admin")) {
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
        <h1 className="text-4xl font-bold mb-8 animate-fade-in">Cashier Dashboard</h1>

        <Tabs defaultValue="stock" className="space-y-6">
          <TabsList>
            <TabsTrigger value="stock">Add Stock</TabsTrigger>
            <TabsTrigger value="orders">Pending Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="stock">
            <Card className="shadow-glow">
              <CardHeader>
                <CardTitle>Add New Product</CardTitle>
                <CardDescription>Add sneakers to the store inventory</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={addProduct} className="space-y-4 max-w-2xl">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Product Name*</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="brand">Brand*</Label>
                      <Input
                        id="brand"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (ZAR)*</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stock">Stock Quantity*</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={stockQuantity}
                        onChange={(e) => setStockQuantity(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="size">Size*</Label>
                      <Input
                        id="size"
                        value={size}
                        onChange={(e) => setSize(e.target.value)}
                        placeholder="e.g., US 9, UK 8"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="color">Color*</Label>
                      <Input
                        id="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <Input
                      id="imageUrl"
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://..."
                    />
                  </div>

                  <Button type="submit" disabled={loading}>
                    {loading ? "Adding..." : "Add Product"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card className="shadow-glow">
              <CardHeader>
                <CardTitle>Pending Orders</CardTitle>
                <CardDescription>Review and approve customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No pending orders</p>
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
                            <div className="text-right space-y-2">
                              <p className="text-2xl font-bold text-primary">
                                R {order.final_amount.toFixed(2)}
                              </p>
                              <Button size="sm" onClick={() => approveOrder(order.id)}>
                                Approve Order
                              </Button>
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

export default Cashier;
