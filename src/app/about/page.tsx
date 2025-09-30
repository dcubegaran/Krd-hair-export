"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Award, Globe, Users, Truck, Shield, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">About KRD Hair Exports</h1>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            Leading the global hair industry with premium quality virgin human hair products, 
            serving customers worldwide with excellence and integrity since our inception.
          </p>
        </div>

        {/* Company Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Our Story</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  KRD Hair Exports was founded with a vision to provide the finest quality human hair products 
                  to customers around the globe. Starting as a small family business, we have grown into one 
                  of the most trusted names in the hair export industry.
                </p>
                <p className="text-muted-foreground mb-4">
                  Our journey began with a simple commitment: to source only the highest quality virgin human hair 
                  and deliver it to our customers with uncompromising standards of quality and service.
                </p>
                <p className="text-muted-foreground">
                  Today, we serve customers in over 50 countries, maintaining our core values of quality, 
                  integrity, and customer satisfaction in every transaction.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  To be the world's leading supplier of premium virgin human hair products, 
                  empowering beauty professionals and individuals worldwide with the finest quality hair 
                  while maintaining ethical sourcing practices and exceptional customer service.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Why Choose Us?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Award className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h4 className="font-medium">Premium Quality</h4>
                      <p className="text-sm text-muted-foreground">
                        100% virgin human hair, carefully sourced and quality tested
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Globe className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h4 className="font-medium">Global Reach</h4>
                      <p className="text-sm text-muted-foreground">
                        Serving customers in 50+ countries worldwide
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Users className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h4 className="font-medium">Expert Team</h4>
                      <p className="text-sm text-muted-foreground">
                        Experienced professionals with deep industry knowledge
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Truck className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h4 className="font-medium">Fast Shipping</h4>
                      <p className="text-sm text-muted-foreground">
                        Quick and secure delivery to your doorstep
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h4 className="font-medium">Quality Guarantee</h4>
                      <p className="text-sm text-muted-foreground">
                        Comprehensive quality assurance and customer protection
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary mb-2">10+</div>
              <p className="text-sm text-muted-foreground">Years Experience</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary mb-2">50+</div>
              <p className="text-sm text-muted-foreground">Countries Served</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary mb-2">10K+</div>
              <p className="text-sm text-muted-foreground">Happy Customers</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary mb-2">99%</div>
              <p className="text-sm text-muted-foreground">Customer Satisfaction</p>
            </CardContent>
          </Card>
        </div>

        {/* Product Categories */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Our Product Range</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Virgin Hair Bundles</CardTitle>
                <CardDescription>Premium quality hair bundles in various textures</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="outline">Brazilian Hair</Badge>
                  <Badge variant="outline">Peruvian Hair</Badge>
                  <Badge variant="outline">Indian Hair</Badge>
                  <Badge variant="outline">Malaysian Hair</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Closures & Frontals</CardTitle>
                <CardDescription>Natural-looking closures and frontals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="outline">4x4 Closures</Badge>
                  <Badge variant="outline">5x5 Closures</Badge>
                  <Badge variant="outline">13x4 Frontals</Badge>
                  <Badge variant="outline">13x6 Frontals</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hair Extensions</CardTitle>
                <CardDescription>Various extension types for different needs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="outline">Clip-ins</Badge>
                  <Badge variant="outline">Tape-ins</Badge>
                  <Badge variant="outline">Weft Hair</Badge>
                  <Badge variant="outline">Bulk Hair</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quality Assurance */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-center">Our Quality Promise</CardTitle>
            <CardDescription className="text-center">
              Every product goes through rigorous quality checks before reaching you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h4 className="font-medium mb-2">Source Verification</h4>
                <p className="text-sm text-muted-foreground">
                  All hair is ethically sourced and verified for authenticity
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-primary" />
                </div>
                <h4 className="font-medium mb-2">Quality Testing</h4>
                <p className="text-sm text-muted-foreground">
                  Comprehensive testing for texture, strength, and durability
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <h4 className="font-medium mb-2">Final Inspection</h4>
                <p className="text-sm text-muted-foreground">
                  Every bundle is individually inspected before packaging
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Experience Premium Quality?</h2>
          <p className="text-muted-foreground text-lg mb-6">
            Join thousands of satisfied customers worldwide who trust KRD Hair Exports
          </p>
          <div className="space-x-4">
            <Button asChild size="lg">
              <Link href="/products">Browse Products</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}