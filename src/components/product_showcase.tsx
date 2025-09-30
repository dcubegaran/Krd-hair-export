"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductService } from "@/lib/services/productService";
import { Product } from "@/lib/types/database";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export function ProductShowcase() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const featuredProducts = await ProductService.getFeaturedProducts();
        // Limit to 6 products for showcase
        setProducts(featuredProducts.slice(0, 6));
      } catch (error) {
        console.error("Error fetching featured products:", error);
        // Fallback to empty array if error
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <section id="products" className="py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-balance mb-4">
            Our Premium Collection
          </h2>
          <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
            Discover our extensive range of virgin human hair products,
            carefully sourced and processed to maintain natural beauty and
            quality.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2 text-lg">Loading featured products...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No featured products available at the moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <Card
                key={product.id}
                className="group overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={product.images?.[0] || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.isFeatured && (
                    <Badge className="absolute top-4 left-4 bg-accent text-accent-foreground">
                      Featured
                    </Badge>
                  )}
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-3">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="space-y-3 mb-4">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">
                        Available Lengths:
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {product.lengths?.map((length, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-xs"
                          >
                            {length}"
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-sm font-medium text-muted-foreground">
                        Origin & Texture:
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {product.origin}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {product.texture}
                        </Badge>
                      </div>
                    </div>

                    <div className="text-lg font-bold text-primary">
                      ${product.pricePerBundle}{" "}
                      <span className="text-sm font-normal text-muted-foreground">
                        per bundle
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link href="/quote" className="flex-1">
                      <Button
                        size="sm"
                        className="w-full bg-accent hover:bg-accent/90"
                      >
                        Get Quote
                      </Button>
                    </Link>
                    <Link
                      href={`/products?search=${encodeURIComponent(
                        product.name
                      )}`}
                      className="flex-1"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-transparent"
                      >
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link href="/products">
            <Button size="lg" variant="outline" className="px-8 bg-transparent">
              View Full Catalog
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
