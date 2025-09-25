import { Card, CardContent } from "@/components/ui/card"
import { Shield, Truck, Award, Users } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: Shield,
      title: "Quality Assurance",
      description:
        "Every strand is carefully selected and tested to ensure premium quality virgin human hair that meets international standards.",
    },
    {
      icon: Truck,
      title: "Global Shipping",
      description:
        "Fast and secure worldwide delivery with tracking. We serve over 50 countries with reliable logistics partners.",
    },
    {
      icon: Award,
      title: "Industry Leader",
      description:
        "15+ years of excellence in human hair exports with certifications and recognition from industry bodies.",
    },
    {
      icon: Users,
      title: "B2B Focused",
      description:
        "Specialized in bulk orders for salons, distributors, and retailers with competitive wholesale pricing.",
    },
  ]

  return (
    <section id="about" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-balance mb-4">Why Choose KRD Hair Exports</h2>
          <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
            We combine innovation, quality, and reliability to deliver exceptional human hair products that exceed
            expectations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
