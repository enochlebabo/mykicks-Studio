import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Shield, Truck, Zap } from "lucide-react";
import heroImage from "@/assets/hero-sneakers.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/95"></div>
        </div>

        <div className="container mx-auto px-4 z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            <span className="gradient-hero bg-clip-text text-transparent">
              MY_KICKS_STUDIO
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto animate-fade-in">
            Premium Sneakers from Southern Africa. Where Style Meets Culture.
          </p>
          <div className="flex gap-4 justify-center animate-fade-in">
            <Link to="/shop">
              <Button size="lg" className="shadow-glow">
                Shop Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Us?</h2>
            <p className="text-muted-foreground">Your trusted sneaker destination in Southern Africa</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center shadow-card hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>10% Discount</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Buy 2 or more pairs and get an automatic 10% discount on your entire order
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center shadow-card hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Authentic Products</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  100% authentic sneakers sourced from verified suppliers across Southern Africa
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center shadow-card hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Fast Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Quick and reliable delivery throughout Lesotho and South Africa
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Ready to Elevate Your Style?
          </h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Join thousands of sneaker enthusiasts across Southern Africa
          </p>
          <Link to="/shop">
            <Button size="lg" variant="secondary" className="shadow-glow">
              Browse Collection <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © 2025 MY_KICKS_STUDIO. Premium Sneakers from Southern Africa.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
