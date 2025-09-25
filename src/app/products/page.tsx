"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { mockProducts } from "@/lib/mock_data"
import { Search, Filter, ShoppingCart, Heart, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { ProductDetailsModal } from "@/components/product_details_modal"
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

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedOrigin, setSelectedOrigin] = useState("all")
  const [priceRange, setPriceRange] = useState([0, 200])
  const [sortBy, setSortBy] = useState("name")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { addToCart, addToWishlist, isInCart, isInWishlist } = useCart()

  const filteredProducts = useMemo(() => {
    const filtered = mockProducts.filter((product: Product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
      const matchesOrigin = selectedOrigin === "all" || product.origin === selectedOrigin
      const matchesPrice = product.pricePerBundle >= priceRange[0] && product.pricePerBundle <= priceRange[1]

      return matchesSearch && matchesCategory && matchesOrigin && matchesPrice
    })

    // Sort products
    filtered.sort((a: Product, b: Product) => {
      switch (sortBy) {
        case "price-low":
          return a.pricePerBundle - b.pricePerBundle
        case "price-high":
          return b.pricePerBundle - a.pricePerBundle
        case "name":
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

    return filtered
  }, [searchTerm, selectedCategory, selectedOrigin, priceRange, sortBy])


  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Our Products</h1>
          <p className="text-muted-foreground text-lg">Discover our premium collection of virgin human hair products</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="straight">Straight</SelectItem>
                      <SelectItem value="wavy">Wavy</SelectItem>
                      <SelectItem value="curly">Curly</SelectItem>
                      <SelectItem value="frontal">Frontal</SelectItem>
                      <SelectItem value="closure">Closure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Origin Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Origin</label>
                  <Select value={selectedOrigin} onValueChange={setSelectedOrigin}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Origins</SelectItem>
                      <SelectItem value="brazilian">Brazilian</SelectItem>
                      <SelectItem value="peruvian">Peruvian</SelectItem>
                      <SelectItem value="indian">Indian</SelectItem>
                      <SelectItem value="malaysian">Malaysian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Price Range: ${priceRange[0]} - ${priceRange[1]}
                  </label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={200}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Sort and Results */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-muted-foreground">Showing {filteredProducts.length} products</p>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Sort by Name</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product: Product) => (
                <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <Image
                      src={product.images[0] || "/placeholder.svg"}
                      alt={product.name}
                      width={400}
                      height={300}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 space-y-2">
                      {product.isFeatured && <Badge className="bg-accent">Featured</Badge>}
                      <Button
                        size="sm"
                        variant={isInWishlist(product.id) ? "default" : "secondary"}
                        className="h-8 w-8 p-0"
                        onClick={() => addToWishlist(product)}
                      >
                        <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                      </Button>
                    </div>
                  </div>

                  <CardHeader>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <CardDescription className="line-clamp-2">{product.description}</CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold">${product.pricePerBundle}</p>
                          <p className="text-sm text-muted-foreground">per bundle</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">4.8</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{product.origin}</Badge>
                        <Badge variant="outline">{product.texture}</Badge>
                        <Badge variant="outline">{product.hairType}</Badge>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Available Lengths:</p>
                        <div className="flex flex-wrap gap-1">
                          {product.lengths.map((length: number) => (
                            <Badge key={length} variant="secondary" className="text-xs">
                              {length}"
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          className="flex-1"
                          variant={isInCart(product.id) ? "secondary" : "default"}
                          onClick={() => addToCart(product)}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          {isInCart(product.id) ? "In Cart" : "Add to Cart"}
                        </Button>
                        <Button variant="outline" onClick={() => {
                          setSelectedProduct(product)
                          setIsModalOpen(true)
                        }}>
                          View Details
                        </Button>
                      </div>

                      {product.bulkPricing.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          Bulk pricing available from ${product.bulkPricing[0].pricePerUnit}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No products found matching your criteria.</p>
                <Button
                  variant="outline"
                  className="mt-4 bg-transparent"
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedCategory("all")
                    setSelectedOrigin("all")
                    setPriceRange([0, 200])
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Product Details Modal */}
        <ProductDetailsModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedProduct(null)
          }}
          onAddToCart={(product) => addToCart(product)}
          onAddToWishlist={(product) => addToWishlist(product)}
        />
      </main>

      <Footer />
    </div>
  )
}
