"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Upload, X, Plus, Minus } from "lucide-react";
import { ProductService } from "@/lib/services/productService";

interface ProductFormData {
  name: string;
  sku: string;
  description: string;
  category: string;
  subcategory: string;
  origin: string;
  hairType: string;
  texture: string;
  lengths: number[];
  colors: string[];
  pricePerBundle: number;
  bulkPricing: Array<{ minQuantity: number; pricePerUnit: number }>;
  stockQuantity: number;
  minOrderQuantity: number;
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
}

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded: (product: any) => void;
}

export function AddProductModal({
  isOpen,
  onClose,
  onProductAdded,
}: AddProductModalProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    sku: "",
    description: "",
    category: "",
    subcategory: "",
    origin: "",
    hairType: "",
    texture: "",
    lengths: [8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30],
    colors: [
      "Natural Black",
      "Dark Brown",
      "Medium Brown",
      "Light Brown",
      "Blonde",
      "Auburn",
      "Red",
      "Grey",
    ],
    pricePerBundle: 0,
    bulkPricing: [],
    stockQuantity: 0,
    minOrderQuantity: 1,
    images: [],
    isActive: true,
    isFeatured: false,
  });

  const [loading, setLoading] = useState(false);
  const [newLength, setNewLength] = useState("");
  const [newColor, setNewColor] = useState("");
  const [newBulkPrice, setNewBulkPrice] = useState({
    minQuantity: 0,
    pricePerUnit: 0,
  });

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addLength = () => {
    if (newLength && !formData.lengths.includes(parseInt(newLength))) {
      setFormData((prev) => ({
        ...prev,
        lengths: [...prev.lengths, parseInt(newLength)].sort((a, b) => a - b),
      }));
      setNewLength("");
    }
  };

  const removeLength = (length: number) => {
    setFormData((prev) => ({
      ...prev,
      lengths: prev.lengths.filter((l) => l !== length),
    }));
  };

  const addColor = () => {
    if (newColor && !formData.colors.includes(newColor)) {
      setFormData((prev) => ({
        ...prev,
        colors: [...prev.colors, newColor],
      }));
      setNewColor("");
    }
  };

  const removeColor = (color: string) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((c) => c !== color),
    }));
  };

  const addBulkPrice = () => {
    if (newBulkPrice.minQuantity > 0 && newBulkPrice.pricePerUnit > 0) {
      setFormData((prev) => ({
        ...prev,
        bulkPricing: [...prev.bulkPricing, newBulkPrice].sort(
          (a, b) => a.minQuantity - b.minQuantity
        ),
      }));
      setNewBulkPrice({ minQuantity: 0, pricePerUnit: 0 });
    }
  };

  const removeBulkPrice = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      bulkPricing: prev.bulkPricing.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("🔄 Creating product with data:", formData);

      // Create product using Firebase service (returns product ID)
      const productId = await ProductService.createProduct(formData);
      console.log("✅ Product created with ID:", productId);

      // Fetch the complete product object
      const newProduct = await ProductService.getProductById(productId);
      console.log("📦 Fetched complete product:", newProduct);

      if (newProduct) {
        // Call the callback with the complete product object
        onProductAdded(newProduct);
      } else {
        throw new Error("Failed to fetch created product");
      }

      // Reset form
      setFormData({
        name: "",
        sku: "",
        description: "",
        category: "",
        subcategory: "",
        origin: "",
        hairType: "",
        texture: "",
        lengths: [8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30],
        colors: [
          "Natural Black",
          "Dark Brown",
          "Medium Brown",
          "Light Brown",
          "Blonde",
          "Auburn",
          "Red",
          "Grey",
        ],
        pricePerBundle: 0,
        bulkPricing: [],
        stockQuantity: 0,
        minOrderQuantity: 1,
        images: [],
        isActive: true,
        isFeatured: false,
      });

      onClose();
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Error adding product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Add New Product
          </DialogTitle>
          <DialogDescription>
            Create a new hair product for your inventory
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Product name, SKU, and description
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                    placeholder="e.g., Brazilian Straight Hair"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU *</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => handleInputChange("sku", e.target.value)}
                    required
                    placeholder="e.g., BS-001"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  required
                  placeholder="Detailed description of the product..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      handleInputChange("category", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="straight">Straight</SelectItem>
                      <SelectItem value="wavy">Wavy</SelectItem>
                      <SelectItem value="curly">Curly</SelectItem>
                      <SelectItem value="kinky">Kinky</SelectItem>
                      <SelectItem value="closure">Closure</SelectItem>
                      <SelectItem value="frontal">Frontal</SelectItem>
                      <SelectItem value="wig">Wig</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="origin">Origin *</Label>
                  <Select
                    value={formData.origin}
                    onValueChange={(value) =>
                      handleInputChange("origin", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select origin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="brazilian">Brazilian</SelectItem>
                      <SelectItem value="peruvian">Peruvian</SelectItem>
                      <SelectItem value="indian">Indian</SelectItem>
                      <SelectItem value="malaysian">Malaysian</SelectItem>
                      <SelectItem value="vietnamese">Vietnamese</SelectItem>
                      <SelectItem value="cambodian">Cambodian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hairType">Hair Type *</Label>
                  <Select
                    value={formData.hairType}
                    onValueChange={(value) =>
                      handleInputChange("hairType", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select hair type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="virgin">Virgin</SelectItem>
                      <SelectItem value="raw">Raw</SelectItem>
                      <SelectItem value="processed">Processed</SelectItem>
                      <SelectItem value="synthetic">Synthetic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="texture">Texture *</Label>
                <Input
                  id="texture"
                  value={formData.texture}
                  onChange={(e) => handleInputChange("texture", e.target.value)}
                  required
                  placeholder="e.g., Straight, Body Wave, Deep Wave"
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Inventory */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Inventory</CardTitle>
              <CardDescription>
                Set pricing and stock information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pricePerBundle">Price per Bundle *</Label>
                  <Input
                    id="pricePerBundle"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.pricePerBundle}
                    onChange={(e) =>
                      handleInputChange(
                        "pricePerBundle",
                        parseFloat(e.target.value)
                      )
                    }
                    required
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stockQuantity">Stock Quantity *</Label>
                  <Input
                    id="stockQuantity"
                    type="number"
                    min="0"
                    value={formData.stockQuantity}
                    onChange={(e) =>
                      handleInputChange(
                        "stockQuantity",
                        parseInt(e.target.value)
                      )
                    }
                    required
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minOrderQuantity">
                    Minimum Order Quantity
                  </Label>
                  <Input
                    id="minOrderQuantity"
                    type="number"
                    min="1"
                    value={formData.minOrderQuantity}
                    onChange={(e) =>
                      handleInputChange(
                        "minOrderQuantity",
                        parseInt(e.target.value)
                      )
                    }
                    placeholder="1"
                  />
                </div>
              </div>

              {/* Bulk Pricing */}
              <div className="space-y-2">
                <Label>Bulk Pricing</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="1"
                    placeholder="Min quantity"
                    value={newBulkPrice.minQuantity}
                    onChange={(e) =>
                      setNewBulkPrice((prev) => ({
                        ...prev,
                        minQuantity: parseInt(e.target.value),
                      }))
                    }
                  />
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Price per unit"
                    value={newBulkPrice.pricePerUnit}
                    onChange={(e) =>
                      setNewBulkPrice((prev) => ({
                        ...prev,
                        pricePerUnit: parseFloat(e.target.value),
                      }))
                    }
                  />
                  <Button type="button" onClick={addBulkPrice}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.bulkPricing.length > 0 && (
                  <div className="space-y-2">
                    {formData.bulkPricing.map((pricing, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-muted rounded"
                      >
                        <span>
                          {pricing.minQuantity}+ bundles: $
                          {pricing.pricePerUnit} each
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeBulkPrice(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Specifications */}
          <Card>
            <CardHeader>
              <CardTitle>Specifications</CardTitle>
              <CardDescription>Available lengths and colors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Lengths */}
              <div className="space-y-2">
                <Label>Available Lengths (inches)</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.lengths.map((length) => (
                    <Badge
                      key={length}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {length}"
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0"
                        onClick={() => removeLength(length)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="8"
                    max="32"
                    placeholder="Add length"
                    value={newLength}
                    onChange={(e) => setNewLength(e.target.value)}
                  />
                  <Button type="button" onClick={addLength}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Colors */}
              <div className="space-y-2">
                <Label>Available Colors</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.colors.map((color) => (
                    <Badge
                      key={color}
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      {color}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0"
                        onClick={() => removeColor(color)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add color"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                  />
                  <Button type="button" onClick={addColor}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Product visibility and status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    handleInputChange("isActive", e.target.checked)
                  }
                  className="rounded"
                />
                <Label htmlFor="isActive">Active (visible to customers)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onChange={(e) =>
                    handleInputChange("isFeatured", e.target.checked)
                  }
                  className="rounded"
                />
                <Label htmlFor="isFeatured">Featured product</Label>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding Product..." : "Add Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
