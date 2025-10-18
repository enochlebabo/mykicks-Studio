import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  stock_quantity: number;
  size: string;
  brand: string;
  color: string;
}

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    loadCart();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCart = () => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const addToCart = (productId: string) => {
    const newCart = { ...cart, [productId]: (cart[productId] || 0) + 1 };
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    
    toast({
      title: "Added to cart!",
      description: "Item has been added to your cart",
    });
  };

  const cartItemCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navigation cartItemCount={cartItemCount} />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2">Our Collection</h1>
          <p className="text-muted-foreground">Discover premium sneakers from Southern Africa</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-64 bg-muted"></div>
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2 mt-2"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : products.length === 0 ? (
          <Card className="p-12 text-center">
            <CardTitle className="mb-2">No products available</CardTitle>
            <CardDescription>Check back soon for new arrivals!</CardDescription>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="shadow-card hover:shadow-glow transition-all duration-300 animate-fade-in">
                <div className="aspect-square overflow-hidden rounded-t-lg">
                  <img
                    src={product.image_url || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription>{product.brand} • {product.color}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <p className="text-2xl font-bold text-primary">R {product.price.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">Size: {product.size}</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : "Out of stock"}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => addToCart(product.id)}
                    disabled={product.stock_quantity === 0}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Shop;
