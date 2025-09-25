"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Heart, Star, Package, Truck, Award } from "lucide-react"
import Image from "next/image"
import { useCart } from "@/lib/cart_context"

interface Product {
  id: string
  name: string
  sku: string
  category: string
  hairType: string
  origin: string
  lengths: number[]
  color: string
  texture: string
  pricePerBundle: number
  bulkPricing: Array<{ minQuantity: number; pricePerUnit: number }>
  stockQuantity: number
  minOrderQuantity: number
  description: string
  images: string[]
  isActive: boolean
  isFeatured: boolean
}

interface ProductDetailsModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onAddToCart: (product: Product) => void
  onAddToWishlist: (product: Product) => void
}

export function ProductDetailsModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onAddToWishlist
}: ProductDetailsModalProps) {
  const { isInCart, isInWishlist } = useCart()

  if (!product) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{product.name}</DialogTitle>
          <DialogDescription className="text-base">
            {product.description}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
              <Image
                src={product.images[0] || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover"
              />
              {product.isFeatured && (
                <Badge className="absolute top-3 left-3 bg-accent">
                  Featured
                </Badge>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(1, 5).map((image, index) => (
                  <div key={index} className="relative aspect-square rounded-md overflow-hidden bg-muted">
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 2}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Price and Rating */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-primary">${product.pricePerBundle}</p>
                  <p className="text-muted-foreground">per bundle</p>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">4.8</span>
                  <span className="text-muted-foreground">(120 reviews)</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Product Info */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Product Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">SKU:</span>
                      <span>{product.sku}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Category:</span>
                      <span>{product.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Hair Type:</span>
                      <span>{product.hairType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Origin:</span>
                      <span>{product.origin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Texture:</span>
                      <span>{product.texture}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Color:</span>
                      <span>{product.color}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Availability</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Stock:</span>
                      <span className={product.stockQuantity > 0 ? "text-green-600" : "text-red-600"}>
                        {product.stockQuantity > 0 ? `${product.stockQuantity} bundles` : "Out of stock"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Min Order:</span>
                      <span>{product.minOrderQuantity} bundles</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Available Lengths */}
            <div>
              <h4 className="font-semibold mb-3">Available Lengths</h4>
              <div className="flex flex-wrap gap-2">
                {product.lengths.map((length) => (
                  <Badge key={length} variant="secondary" className="text-sm">
                    {length}"
                  </Badge>
                ))}
              </div>
            </div>

            {/* Bulk Pricing */}
            {product.bulkPricing.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Bulk Pricing
                  </h4>
                  <div className="space-y-2">
                    {product.bulkPricing.map((pricing, index) => (
                      <div key={index} className="flex justify-between text-sm p-2 bg-muted rounded">
                        <span>{pricing.minQuantity}+ bundles</span>
                        <span className="font-medium">${pricing.pricePerUnit} each</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Features */}
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Award className="h-4 w-4" />
                <span>Premium quality guaranteed</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Truck className="h-4 w-4" />
                <span>Free shipping on orders over $500</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                className="flex-1"
                variant={isInCart(product.id) ? "secondary" : "default"}
                onClick={() => {
                  onAddToCart(product)
                  onClose()
                }}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {isInCart(product.id) ? "In Cart" : "Add to Cart"}
              </Button>
              <Button
                variant={isInWishlist(product.id) ? "default" : "outline"}
                onClick={() => {
                  onAddToWishlist(product)
                  onClose()
                }}
              >
                <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}