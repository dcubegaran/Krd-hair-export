"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { UploadQueueStatus } from "@/components/upload-queue-status";
import { QuoteService } from "@/lib/services/quoteService";
import { ProductService } from "@/lib/services/productService";
import { StorageService } from "@/lib/services/storageService";
import { useAuth } from "@/lib/auth_context";
import { QuoteRequest, QuoteProduct, Product } from "@/lib/types/database";
import { Upload, Plus, Minus, FileText, Send, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Address } from "@/lib/types/database";

export default function QuotePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<QuoteProduct[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    customerName: user?.displayName || "",
    email: user?.email || "",
    phone: "",
    companyName: "",
    businessType: "salon" as const,
    website: "",
    taxId: "",
    licenseNumber: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
    } as Address,
    quality: "premium" as const,
    texture: [] as string[],
    lengths: [] as number[],
    colors: [] as string[],
    minimumOrderQuantity: 1,
    preferredDeliveryDate: "",
    shippingMethod: "air" as const,
    destinationPort: "",
    paymentTerms: "net_30" as const,
    creditLimit: "",
    existingSupplier: false,
    monthlyVolume: "",
    specialRequirements: "",
    competitorProducts: "",
    targetPriceRange: {
      min: "",
      max: "",
      currency: "USD",
    },
    source: "website" as const,
    campaign: "",
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }));
  };

  const addProduct = () => {
    setSelectedProducts((prev) => [
      ...prev,
      {
        productId: "",
        productName: "",
        category: "",
        texture: "",
        origin: "",
        length: 0,
        color: "",
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0,
      },
    ]);
  };

  const updateProduct = (
    index: number,
    field: keyof QuoteProduct,
    value: any
  ) => {
    setSelectedProducts((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      // Auto-calculate total price
      if (field === "quantity" || field === "unitPrice") {
        updated[index].totalPrice =
          updated[index].quantity * updated[index].unitPrice;
      }

      return updated;
    });
  };

  const removeProduct = (index: number) => {
    setSelectedProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments((prev) => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const totalQuantity = selectedProducts.reduce(
      (sum, product) => sum + product.quantity,
      0
    );
    const totalValue = selectedProducts.reduce(
      (sum, product) => sum + product.totalPrice,
      0
    );
    return { totalQuantity, totalValue };
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setErrors([]);

    try {
      // Convert form data to proper types for validation
      const quoteDataForValidation: Partial<QuoteRequest> = {
        ...formData,
        products: selectedProducts,
        totalQuantity: calculateTotals().totalQuantity,
        totalValue: calculateTotals().totalValue,
        preferredDeliveryDate: formData.preferredDeliveryDate
          ? new Date(formData.preferredDeliveryDate)
          : undefined,
        creditLimit: formData.creditLimit
          ? parseFloat(formData.creditLimit)
          : undefined,
        monthlyVolume: formData.monthlyVolume
          ? parseFloat(formData.monthlyVolume)
          : undefined,
        targetPriceRange:
          formData.targetPriceRange.min && formData.targetPriceRange.max
            ? {
                min: parseFloat(formData.targetPriceRange.min),
                max: parseFloat(formData.targetPriceRange.max),
                currency: formData.targetPriceRange.currency,
              }
            : undefined,
      };

      // Filter out undefined values immediately after creating the validation data
      const filteredValidationData = Object.fromEntries(
        Object.entries(quoteDataForValidation).filter(
          ([_, value]) => value !== undefined
        )
      );

      // Validate form
      const validation = QuoteService.validateQuoteData(filteredValidationData);

      if (!validation.isValid) {
        setErrors(validation.errors);
        return;
      }

      // Create quote request first (without attachments)
      const quoteData: Omit<QuoteRequest, "id" | "createdAt" | "updatedAt"> = {
        ...filteredValidationData,
        currency: formData.targetPriceRange
          .currency as QuoteRequest["currency"],
        attachments: [], // Will be updated after upload
        status: "submitted",
        priority: "medium",
        createdBy: user?.uid,
      } as Omit<QuoteRequest, "id" | "createdAt" | "updatedAt">;

      const quoteId = await QuoteService.createQuote(quoteData);

      // Upload attachments with optimized queue system (if any)
      if (attachments.length > 0 && user?.uid) {
        const attachmentUrls = await StorageService.uploadQuoteAttachments(
          attachments,
          quoteId,
          user.uid
        );

        // Update quote with attachment URLs (single additional write operation)
        await QuoteService.updateQuoteStatus(quoteId, "submitted", {
          attachments: attachmentUrls,
        });
      }

      // Redirect to success page or show success message
      alert(`Quote request submitted successfully! Quote ID: ${quoteId}`);

      // Reset form
      setSelectedProducts([]);
      setAttachments([]);
      setFormData({
        customerName: user?.displayName || "",
        email: user?.email || "",
        phone: "",
        companyName: "",
        businessType: "salon",
        website: "",
        taxId: "",
        licenseNumber: "",
        address: {
          street: "",
          city: "",
          state: "",
          country: "",
          zipCode: "",
        },
        quality: "premium",
        texture: [],
        lengths: [],
        colors: [],
        minimumOrderQuantity: 1,
        preferredDeliveryDate: "",
        shippingMethod: "air",
        destinationPort: "",
        paymentTerms: "net_30",
        creditLimit: "",
        existingSupplier: false,
        monthlyVolume: "",
        specialRequirements: "",
        competitorProducts: "",
        targetPriceRange: {
          min: "",
          max: "",
          currency: "USD",
        },
        source: "website",
        campaign: "",
      });
    } catch (error: any) {
      console.error("Error submitting quote:", error);
      setErrors([error.message || "Failed to submit quote request"]);
    } finally {
      setLoading(false);
    }
  };

  const { totalQuantity, totalValue } = calculateTotals();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Request a Quote</h1>
            <p className="text-muted-foreground text-lg">
              Get a customized quote for your hair extension needs
            </p>
          </div>

          {errors.length > 0 && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
                <CardDescription>
                  Please provide your contact and business details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Full Name *</Label>
                    <Input
                      id="customerName"
                      value={formData.customerName}
                      onChange={(e) =>
                        handleInputChange("customerName", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) =>
                        handleInputChange("companyName", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessType">Business Type *</Label>
                    <Select
                      value={formData.businessType}
                      onValueChange={(value) =>
                        handleInputChange("businessType", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="salon">Hair Salon</SelectItem>
                        <SelectItem value="distributor">Distributor</SelectItem>
                        <SelectItem value="wholesaler">Wholesaler</SelectItem>
                        <SelectItem value="retailer">Retailer</SelectItem>
                        <SelectItem value="online_store">
                          Online Store
                        </SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) =>
                        handleInputChange("website", e.target.value)
                      }
                      placeholder="https://"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxId">
                    Tax ID / Business Registration Number
                  </Label>
                  <Input
                    id="taxId"
                    value={formData.taxId}
                    onChange={(e) => handleInputChange("taxId", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
                <CardDescription>
                  Where should we ship your order?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address *</Label>
                  <Input
                    id="street"
                    value={formData.address.street}
                    onChange={(e) =>
                      handleAddressChange("street", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.address.city}
                      onChange={(e) =>
                        handleAddressChange("city", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State/Province *</Label>
                    <Input
                      id="state"
                      value={formData.address.state}
                      onChange={(e) =>
                        handleAddressChange("state", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      value={formData.address.country}
                      onChange={(e) =>
                        handleAddressChange("country", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP/Postal Code *</Label>
                    <Input
                      id="zipCode"
                      value={formData.address.zipCode}
                      onChange={(e) =>
                        handleAddressChange("zipCode", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Product Requirements</CardTitle>
                <CardDescription>
                  Specify the products you need for your quote
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quality">Quality Level *</Label>
                    <Select
                      value={formData.quality}
                      onValueChange={(value) =>
                        handleInputChange("quality", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="economy">Economy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minimumOrderQuantity">
                      Minimum Order Quantity *
                    </Label>
                    <Input
                      id="minimumOrderQuantity"
                      type="number"
                      min="1"
                      value={formData.minimumOrderQuantity}
                      onChange={(e) =>
                        handleInputChange(
                          "minimumOrderQuantity",
                          parseInt(e.target.value)
                        )
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency *</Label>
                    <Select
                      value={formData.targetPriceRange.currency}
                      onValueChange={(value) =>
                        handleInputChange("targetPriceRange", {
                          ...formData.targetPriceRange,
                          currency: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="CAD">CAD (C$)</SelectItem>
                        <SelectItem value="AUD">AUD (A$)</SelectItem>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Products *</Label>
                  {selectedProducts.map((product, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 space-y-4"
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Product {index + 1}</h4>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeProduct(index)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Product Name *</Label>
                          <Input
                            value={product.productName}
                            onChange={(e) =>
                              updateProduct(
                                index,
                                "productName",
                                e.target.value
                              )
                            }
                            placeholder="e.g., Brazilian Straight Hair"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Category *</Label>
                          <Input
                            value={product.category}
                            onChange={(e) =>
                              updateProduct(index, "category", e.target.value)
                            }
                            placeholder="e.g., Straight, Wavy, Curly"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Origin *</Label>
                          <Input
                            value={product.origin}
                            onChange={(e) =>
                              updateProduct(index, "origin", e.target.value)
                            }
                            placeholder="e.g., Brazilian, Indian"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Length (inches) *</Label>
                          <Input
                            type="number"
                            value={product.length}
                            onChange={(e) =>
                              updateProduct(
                                index,
                                "length",
                                parseInt(e.target.value)
                              )
                            }
                            min="8"
                            max="32"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Color *</Label>
                          <Input
                            value={product.color}
                            onChange={(e) =>
                              updateProduct(index, "color", e.target.value)
                            }
                            placeholder="e.g., Natural Black"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Quantity *</Label>
                          <Input
                            type="number"
                            value={product.quantity}
                            onChange={(e) =>
                              updateProduct(
                                index,
                                "quantity",
                                parseInt(e.target.value)
                              )
                            }
                            min="1"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Unit Price *</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={product.unitPrice}
                            onChange={(e) =>
                              updateProduct(
                                index,
                                "unitPrice",
                                parseFloat(e.target.value)
                              )
                            }
                            min="0"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Total Price</Label>
                          <Input
                            value={product.totalPrice.toFixed(2)}
                            readOnly
                            className="bg-muted"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Notes</Label>
                        <Textarea
                          value={product.notes || ""}
                          onChange={(e) =>
                            updateProduct(index, "notes", e.target.value)
                          }
                          placeholder="Any special requirements for this product..."
                        />
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={addProduct}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </div>

                {/* Order Summary */}
                {selectedProducts.length > 0 && (
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Order Summary</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Total Products:</span>
                        <span>{selectedProducts.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Quantity:</span>
                        <span>{totalQuantity} bundles</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>Total Value:</span>
                        <span>
                          ${totalValue.toFixed(2)}{" "}
                          {formData.targetPriceRange.currency}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Business Terms */}
            <Card>
              <CardHeader>
                <CardTitle>Business Terms</CardTitle>
                <CardDescription>
                  Specify your preferred business terms and conditions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="paymentTerms">Payment Terms *</Label>
                    <Select
                      value={formData.paymentTerms}
                      onValueChange={(value) =>
                        handleInputChange("paymentTerms", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="net_30">Net 30 Days</SelectItem>
                        <SelectItem value="net_60">Net 60 Days</SelectItem>
                        <SelectItem value="cash_on_delivery">
                          Cash on Delivery
                        </SelectItem>
                        <SelectItem value="letter_of_credit">
                          Letter of Credit
                        </SelectItem>
                        <SelectItem value="advance_payment">
                          Advance Payment
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shippingMethod">Shipping Method *</Label>
                    <Select
                      value={formData.shippingMethod}
                      onValueChange={(value) =>
                        handleInputChange("shippingMethod", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="air">Air Freight</SelectItem>
                        <SelectItem value="sea">Sea Freight</SelectItem>
                        <SelectItem value="land">Land Transport</SelectItem>
                        <SelectItem value="express">Express Courier</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destinationPort">
                    Destination Port (if applicable)
                  </Label>
                  <Input
                    id="destinationPort"
                    value={formData.destinationPort}
                    onChange={(e) =>
                      handleInputChange("destinationPort", e.target.value)
                    }
                    placeholder="e.g., Port of New York, JFK Airport"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferredDeliveryDate">
                    Preferred Delivery Date
                  </Label>
                  <Input
                    id="preferredDeliveryDate"
                    type="date"
                    value={formData.preferredDeliveryDate}
                    onChange={(e) =>
                      handleInputChange("preferredDeliveryDate", e.target.value)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
                <CardDescription>
                  Help us serve you better with additional details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="specialRequirements">
                    Special Requirements
                  </Label>
                  <Textarea
                    id="specialRequirements"
                    value={formData.specialRequirements}
                    onChange={(e) =>
                      handleInputChange("specialRequirements", e.target.value)
                    }
                    placeholder="Any special packaging, labeling, or customization requirements..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="competitorProducts">
                    Current Suppliers/Competitor Products
                  </Label>
                  <Textarea
                    id="competitorProducts"
                    value={formData.competitorProducts}
                    onChange={(e) =>
                      handleInputChange("competitorProducts", e.target.value)
                    }
                    placeholder="Tell us about products you're currently using or considering..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Target Price Range per Bundle</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Min price"
                      value={formData.targetPriceRange.min}
                      onChange={(e) =>
                        handleInputChange("targetPriceRange", {
                          ...formData.targetPriceRange,
                          min: e.target.value,
                        })
                      }
                    />
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Max price"
                      value={formData.targetPriceRange.max}
                      onChange={(e) =>
                        handleInputChange("targetPriceRange", {
                          ...formData.targetPriceRange,
                          max: e.target.value,
                        })
                      }
                    />
                    <Select
                      value={formData.targetPriceRange.currency}
                      onValueChange={(value) =>
                        handleInputChange("targetPriceRange", {
                          ...formData.targetPriceRange,
                          currency: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="CAD">CAD</SelectItem>
                        <SelectItem value="AUD">AUD</SelectItem>
                        <SelectItem value="INR">INR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* File Attachments */}
            <Card>
              <CardHeader>
                <CardTitle>File Attachments</CardTitle>
                <CardDescription>
                  Upload any relevant documents, specifications, or reference
                  images
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Attachments</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Drop files here or click to browse
                    </p>
                    <Input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        document.getElementById("file-upload")?.click()
                      }
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Choose Files
                    </Button>
                  </div>
                </div>

                {attachments.length > 0 && (
                  <div className="space-y-2">
                    <Label>Selected Files ({attachments.length})</Label>
                    <div className="space-y-2">
                      {attachments.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-muted rounded"
                        >
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4" />
                            <span className="text-sm">{file.name}</span>
                            <Badge variant="secondary">
                              {(file.size / 1024 / 1024).toFixed(1)} MB
                            </Badge>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAttachment(index)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-center">
              <Button
                type="submit"
                size="lg"
                disabled={loading || selectedProducts.length === 0}
                className="px-8"
              >
                {loading ? (
                  "Submitting Quote Request..."
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Quote Request
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
      <UploadQueueStatus />
    </div>
  );
}
