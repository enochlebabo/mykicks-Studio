import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface CartItem {
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string;
    stock_quantity: number;
  };
  quantity: number;
}

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadCartItems();
  }, []);

  const loadCartItems = async () => {
    try {
      const savedCart = localStorage.getItem("cart");
      if (!savedCart) {
        setLoading(false);
        return;
      }

      const cart = JSON.parse(savedCart);
      const productIds = Object.keys(cart);

      if (productIds.length === 0) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, image_url, stock_quantity")
        .in("id", productIds);

      if (error) throw error;

      const items: CartItem[] = data.map((product) => ({
        product,
        quantity: cart[product.id],
      }));

      setCartItems(items);
    } catch (error) {
      console.error("Error loading cart:", error);
      toast({
        title: "Error",
        description: "Failed to load cart items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (productId: string, change: number) => {
    const savedCart = localStorage.getItem("cart");
    if (!savedCart) return;

    const cart = JSON.parse(savedCart);
    const newQuantity = (cart[productId] || 0) + change;

    if (newQuantity <= 0) {
      delete cart[productId];
    } else {
      cart[productId] = newQuantity;
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    loadCartItems();
  };

  const removeItem = (productId: string) => {
    const savedCart = localStorage.getItem("cart");
    if (!savedCart) return;

    const cart = JSON.parse(savedCart);
    delete cart[productId];
    localStorage.setItem("cart", JSON.stringify(cart));
    loadCartItems();

    toast({
      title: "Removed from cart",
      description: "Item has been removed from your cart",
    });
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  };

  const calculateDiscount = () => {
    const totalPairs = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    if (totalPairs >= 2) {
      return calculateTotal() * 0.1; // 10% discount
    }
    return 0;
  };

  const finalAmount = calculateTotal() - calculateDiscount();

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to place an order",
      });
      navigate("/auth");
      return;
    }

    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total_amount: calculateTotal(),
          discount_amount: calculateDiscount(),
          final_amount: finalAmount,
          status: "pending",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart
      localStorage.removeItem("cart");
      
      toast({
        title: "Order placed!",
        description: "Your order has been submitted and is pending approval",
      });

      navigate("/profile");
    } catch (error) {
      console.error("Error placing order:", error);
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navigation cartItemCount={cartItemCount} />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <h1 className="text-4xl font-bold mb-8 animate-fade-in">Shopping Cart</h1>

        {loading ? (
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-1/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-muted rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : cartItems.length === 0 ? (
          <Card className="p-12 text-center">
            <CardTitle className="mb-4">Your cart is empty</CardTitle>
            <CardDescription className="mb-6">Add some sneakers to get started!</CardDescription>
            <Button onClick={() => navigate("/shop")}>Continue Shopping</Button>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.product.id} className="shadow-card">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <img
                        src={item.product.image_url || "/placeholder.svg"}
                        alt={item.product.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{item.product.name}</h3>
                        <p className="text-2xl font-bold text-primary mt-2">
                          R {item.product.price.toFixed(2)}
                        </p>
                        <div className="flex items-center gap-2 mt-4">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => updateQuantity(item.product.id, -1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-12 text-center font-semibold">{item.quantity}</span>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => updateQuantity(item.product.id, 1)}
                            disabled={item.quantity >= item.product.stock_quantity}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            className="ml-auto"
                            onClick={() => removeItem(item.product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="lg:col-span-1">
              <Card className="shadow-glow sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold">R {calculateTotal().toFixed(2)}</span>
                  </div>
                  {calculateDiscount() > 0 && (
                    <div className="flex justify-between text-accent">
                      <span>Discount (10% on 2+ pairs)</span>
                      <span className="font-semibold">-R {calculateDiscount().toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">R {finalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={handleCheckout}>
                    Proceed to Checkout
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Cart;
