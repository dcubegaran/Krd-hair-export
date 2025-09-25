"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Menu, X, ShoppingBag, Search, Heart } from "lucide-react"
import { useCart } from "@/lib/cart_context"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { getCartItemCount, getWishlistCount } = useCart()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-primary">
              KRD Hair Exports
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-sm font-medium text-foreground hover:text-accent transition-colors">
              Home
            </Link>
            <Link href="/products" className="text-sm font-medium text-foreground hover:text-accent transition-colors">
              Products
            </Link>
            <Link href="/about" className="text-sm font-medium text-foreground hover:text-accent transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-sm font-medium text-foreground hover:text-accent transition-colors">
              Contact
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/products">
                <Search className="h-4 w-4" />
              </Link>
            </Button>

            <Button variant="ghost" size="sm" className="relative" asChild>
              <Link href="/cart">
                <ShoppingBag className="h-4 w-4" />
                {getCartItemCount() > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">{getCartItemCount()}</Badge>
                )}
              </Link>
            </Button>

            <Button variant="ghost" size="sm" className="relative" asChild>
              <Link href="/wishlist">
                <Heart className="h-4 w-4" />
                {getWishlistCount() > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">{getWishlistCount()}</Badge>
                )}
              </Link>
            </Button>

            <Button size="sm" className="bg-accent hover:bg-accent/90" asChild>
              <Link href="/quote">Get Quote</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
              <Link href="/" className="block px-3 py-2 text-base font-medium text-foreground hover:text-accent">
                Home
              </Link>
              <Link
                href="/products"
                className="block px-3 py-2 text-base font-medium text-foreground hover:text-accent"
              >
                Products
              </Link>
              <Link href="/about" className="block px-3 py-2 text-base font-medium text-foreground hover:text-accent">
                About
              </Link>
              <Link href="/contact" className="block px-3 py-2 text-base font-medium text-foreground hover:text-accent">
                Contact
              </Link>
              <div className="px-3 py-2 space-y-2">
                <Button size="sm" className="w-full bg-accent hover:bg-accent/90" asChild>
                  <Link href="/quote">Get Quote</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
