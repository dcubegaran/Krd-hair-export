"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useCart } from "@/lib/cart_context"
import { Heart, ShoppingCart, Trash2, ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, addToCart, clearWishlist } = useCart()

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />

        <main className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <Heart className="h-24 w-24 mx-auto mb-6 text-muted-foreground" />
            <h1 className="text-3xl font-bold mb-4">Your Wishlist is Empty</h1>
            <p className="text-muted-foreground mb-8">
              Looks like you haven't added any products to your wishlist yet.
            </p>
            <Button asChild>
              <Link href="/products">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continue Shopping
              </Link>
            </Button>
          </div>
        </main>

        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">My Wishlist</h1>
          <p className="text-muted-foreground text-lg">
            {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} in your wishlist
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Wishlist Items */}
          <div className="lg:col-span-2 space-y-4">
            {wishlist.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="outline">{item.origin}</Badge>
                        <Badge variant="outline">{item.texture}</Badge>
                        <Badge variant="outline">{item.length}"</Badge>
                        <Badge variant="outline">{item.color}</Badge>
                      </div>
                      <p className="text-2xl font-bold text-primary">${item.price}</p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromWishlist(item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>

                      <Button
                        className="flex-1"
                        onClick={() => {
                          addToCart({
                            id: item.productId,
                            name: item.name,
                            images: [item.image],
                            pricePerBundle: item.price,
                            lengths: [item.length],
                            color: item.color,
                            texture: item.texture,
                            origin: item.origin
                          })
                        }}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Wishlist Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Wishlist Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Items:</span>
                  <span>{wishlist.length}</span>
                </div>

                <div className="flex justify-between">
                  <span>Total Value:</span>
                  <span>${wishlist.reduce((sum, item) => sum + item.price, 0).toFixed(2)}</span>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <Button
                    className="w-full"
                    onClick={() => {
                      // Add all wishlist items to cart
                      wishlist.forEach(item => {
                        addToCart({
                          id: item.productId,
                          name: item.name,
                          images: [item.image],
                          pricePerBundle: item.price,
                          lengths: [item.length],
                          color: item.color,
                          texture: item.texture,
                          origin: item.origin
                        })
                      })
                    }}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add All to Cart
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={clearWishlist}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Wishlist
                  </Button>
                </div>

                <Button variant="outline" className="w-full" asChild>
                  <Link href="/products">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Continue Shopping
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}