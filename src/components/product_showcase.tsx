import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function ProductShowcase() {
  const products = [
    {
      name: "Virgin Straight Hair",
      image: "/beautiful-straight-black-human-hair-bundles.jpg",
      lengths: ['12"', '14"', '16"', '18"', '20"', '22"', '24"', '26"'],
      origins: ["Indian", "Brazilian", "Peruvian"],
      featured: true,
    },
    {
      name: "Body Wave Hair",
      image: "/luxurious-wavy-human-hair-bundles-with-natural-wav.jpg",
      lengths: ['14"', '16"', '18"', '20"', '22"', '24"'],
      origins: ["Brazilian", "Malaysian", "Peruvian"],
      featured: false,
    },
    {
      name: "Lace Closures",
      image: "/premium-lace-closure-with-natural-hairline-and-par.jpg",
      lengths: ["4x4", "5x5", "6x6"],
      origins: ["Swiss Lace", "HD Lace"],
      featured: true,
    },
    {
      name: "Lace Frontals",
      image: "/high-quality-lace-frontal-with-ear-to-ear-coverage.jpg",
      lengths: ["13x4", "13x6"],
      origins: ["Swiss Lace", "Transparent Lace"],
      featured: false,
    },
    {
      name: "Curly Hair",
      image: "/natural-curly-human-hair-with-defined-curl-pattern.jpg",
      lengths: ['12"', '14"', '16"', '18"', '20"', '22"'],
      origins: ["Indian", "Brazilian"],
      featured: false,
    },
    {
      name: "Deep Wave Hair",
      image: "/deep-wave-human-hair-with-rich-texture-and-volume.jpg",
      lengths: ['14"', '16"', '18"', '20"', '22"', '24"'],
      origins: ["Brazilian", "Peruvian"],
      featured: true,
    },
  ]

  return (
    <section id="products" className="py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-balance mb-4">Our Premium Collection</h2>
          <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
            Discover our extensive range of virgin human hair products, carefully sourced and processed to maintain
            natural beauty and quality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <Card
              key={index}
              className="group overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <div className="relative overflow-hidden">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {product.featured && (
                  <Badge className="absolute top-4 left-4 bg-accent text-accent-foreground">Featured</Badge>
                )}
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-3">{product.name}</h3>

                <div className="space-y-3 mb-4">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Available Lengths:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {product.lengths.map((length, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {length}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Origins:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {product.origins.map((origin, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {origin}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 bg-accent hover:bg-accent/90">
                    Get Quote
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" variant="outline" className="px-8 bg-transparent">
            View Full Catalog
          </Button>
        </div>
      </div>
    </section>
  )
}
