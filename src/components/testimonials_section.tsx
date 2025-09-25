import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      company: "Luxe Hair Salon",
      location: "New York, USA",
      rating: 5,
      text: "KRD Hair Exports has been our trusted supplier for over 3 years. The quality is consistently excellent, and their customer service is outstanding.",
      image: "/professional-woman-salon-owner.jpg",
    },
    {
      name: "Maria Rodriguez",
      company: "Beauty Supply Co.",
      location: "Madrid, Spain",
      rating: 5,
      text: "The virgin hair quality is unmatched. Our customers love the natural feel and longevity. Shipping to Europe is always fast and secure.",
      image: "/professional-businesswoman-beauty-industry.jpg",
    },
    {
      name: "Aisha Patel",
      company: "Hair Extensions Plus",
      location: "London, UK",
      rating: 5,
      text: "Bulk orders are handled professionally with competitive pricing. The hair maintains its quality even after multiple washes and styling.",
      image: "/professional-woman-hair-business-owner.jpg",
    },
  ]

  return (
    <section className="py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-balance mb-4">What Our Clients Say</h2>
          <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
            Join thousands of satisfied customers worldwide who trust KRD Hair Exports for their premium human hair
            needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>

                <p className="text-muted-foreground mb-6 leading-relaxed">"{testimonial.text}"</p>

                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.image || "/placeholder.svg"}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-sm">{testimonial.name}</div>
                    <div className="text-xs text-muted-foreground">{testimonial.company}</div>
                    <div className="text-xs text-muted-foreground">{testimonial.location}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
