import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero_section"
import { FeaturesSection } from "@/components/features_section"
import { ProductShowcase } from "@/components/product_showcase"
import { ProcessSection } from "@/components/process_section"
import { TestimonialsSection } from "@/components/testimonials_section"
import { ContactSection } from "@/components/contact_section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <ProductShowcase />
        <ProcessSection />
        <TestimonialsSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  )
}
