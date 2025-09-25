import { Separator } from "@/components/ui/separator"
import { Facebook, Instagram, Twitter, Linkedin, Mail, Phone } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">KRD Hair Exports</h3>
            <p className="text-primary-foreground/80 text-sm leading-relaxed mb-4">
              Leading exporter of premium virgin human hair, serving salons and distributors worldwide with unmatched
              quality and reliability.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 hover:text-accent cursor-pointer transition-colors" />
              <Instagram className="h-5 w-5 hover:text-accent cursor-pointer transition-colors" />
              <Twitter className="h-5 w-5 hover:text-accent cursor-pointer transition-colors" />
              <Linkedin className="h-5 w-5 hover:text-accent cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-semibold mb-4">Products</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Virgin Straight Hair
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Body Wave Hair
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Curly Hair
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Lace Closures
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Lace Frontals
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Hair Extensions
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Bulk Orders
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Custom Processing
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Quality Testing
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Global Shipping
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Sample Requests
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Consultation
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact Info</h4>
            <div className="space-y-3 text-sm text-primary-foreground/80">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>krdhairexport@gmail.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+91 6383812225</span>
              </div>
              <div className="text-xs">
                <p>Business Hours:</p>
                <p>Monday - Sunday</p>
                <p>9:00 AM - 7:00 PM IST</p>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-primary-foreground/20" />

        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-primary-foreground/80">
          <p>&copy; 2025 KRD Hair Exports. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-accent transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-accent transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-accent transition-colors">
              Shipping Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
