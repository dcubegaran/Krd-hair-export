import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

export function ProcessSection() {
  const steps = [
    {
      number: "01",
      title: "Source Selection",
      description:
        "We carefully select hair from trusted donors, ensuring each strand meets our strict quality standards for virgin human hair.",
      image: "/hair-selection-process-with-quality-control.jpg",
    },
    {
      number: "02",
      title: "Quality Processing",
      description:
        "Our advanced processing techniques preserve the natural cuticle alignment while maintaining hair integrity and shine.",
      image: "/hair-processing-facility-with-modern-equipment.jpg",
    },
    {
      number: "03",
      title: "Quality Control",
      description:
        "Every batch undergoes rigorous testing for strength, texture, and color consistency before packaging.",
      image: "/quality-control-testing-of-human-hair-products.jpg",
    },
    {
      number: "04",
      title: "Global Delivery",
      description:
        "Secure packaging and worldwide shipping ensure your order arrives in perfect condition, anywhere in the world.",
      image: "/professional-packaging-and-shipping-of-hair-produc.jpg",
    },
  ]

  return (
    <section id="process" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-balance mb-4">Our Quality Process</h2>
          <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
            From source to delivery, every step is carefully managed to ensure you receive the highest quality human
            hair products.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex ${index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"} gap-8 items-center`}
            >
              <div className="flex-1">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-accent text-accent-foreground rounded-full flex items-center justify-center font-bold text-lg">
                        {step.number}
                      </div>
                      <h3 className="text-xl font-semibold">{step.title}</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                    <div className="flex items-center gap-2 mt-4 text-sm text-accent">
                      <CheckCircle className="h-4 w-4" />
                      <span>Quality Guaranteed</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="flex-1">
                <img
                  src={step.image || "/placeholder.svg"}
                  alt={step.title}
                  className="w-full h-64 object-cover rounded-lg shadow-sm"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
