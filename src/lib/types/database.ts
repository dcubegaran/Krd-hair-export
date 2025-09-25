// Database Types for KRD Hair Exports

export interface User {
  id: string
  email: string
  displayName: string
  role: 'admin' | 'staff' | 'customer'
  phone?: string
  address?: Address
  createdAt: Date
  updatedAt: Date
  isActive: boolean
}

export interface Product {
  id: string
  name: string
  sku: string
  description: string
  category: string
  subcategory?: string
  origin: string
  hairType: string
  texture: string
  lengths: number[]
  colors: string[]
  pricePerBundle: number
  bulkPricing: BulkPrice[]
  stockQuantity: number
  minOrderQuantity: number
  images: string[]
  isActive: boolean
  isFeatured: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Order {
  id: string
  orderNumber: string
  customerId: string
  customerInfo: CustomerInfo
  items: OrderItem[]
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed'
  totalAmount: number
  shippingAddress: Address
  trackingNumber?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  name: string
  description?: string
  image?: string
  isActive: boolean
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

export interface Inventory {
  id: string
  productId: string
  length: number
  color: string
  quantity: number
  reservedQuantity: number
  location?: string
  updatedAt: Date
}

export interface Inquiry {
  id: string
  customerName: string
  email: string
  phone?: string
  type: 'product' | 'bulk_order' | 'custom' | 'other'
  subject: string
  message: string
  status: 'new' | 'in_progress' | 'responded' | 'closed'
  priority: 'low' | 'medium' | 'high'
  assignedTo?: string
  createdAt: Date
  updatedAt: Date
}

export interface Address {
  street: string
  city: string
  state: string
  country: string
  zipCode: string
}

export interface CustomerInfo {
  name: string
  email: string
  phone?: string
}

export interface BulkPrice {
  minQuantity: number
  pricePerUnit: number
}

export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  length: number
  color?: string
  pricePerUnit: number
  totalPrice: number
}

export interface ImageUpload {
  id: string
  fileName: string
  originalName: string
  url: string
  thumbnailUrl?: string
  size: number
  mimeType: string
  uploadedBy: string
  uploadedAt: Date
  category: 'product' | 'user' | 'order' | 'general'
  referenceId?: string // ID of the related product, user, order, etc.
  tags?: string[]
  isActive: boolean
  metadata?: {
    width?: number
    height?: number
    alt?: string
    description?: string
  }
}

export interface QuoteRequest {
  id: string
  customerName: string
  email: string
  phone: string
  companyName: string
  businessType: 'salon' | 'distributor' | 'wholesaler' | 'retailer' | 'online_store' | 'other'
  address: Address
  website?: string
  taxId?: string
  licenseNumber?: string

  // Quote Details
  products: QuoteProduct[]
  totalQuantity: number
  totalValue: number
  currency: 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'INR'

  // Requirements
  quality: 'premium' | 'standard' | 'economy'
  texture: string[]
  lengths: number[]
  colors: string[]
  minimumOrderQuantity: number
  preferredDeliveryDate?: Date
  shippingMethod: 'air' | 'sea' | 'land' | 'express'
  destinationPort?: string

  // Business Terms
  paymentTerms: 'net_30' | 'net_60' | 'cash_on_delivery' | 'letter_of_credit' | 'advance_payment'
  creditLimit?: number
  existingSupplier?: boolean
  monthlyVolume?: number

  // Additional Information
  specialRequirements?: string
  competitorProducts?: string
  targetPriceRange?: {
    min: number
    max: number
    currency: string
  }

  // Processing
  status: 'draft' | 'submitted' | 'under_review' | 'quoted' | 'negotiating' | 'approved' | 'rejected' | 'expired'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignedTo?: string
  salesRep?: string

  // Quote Response
  quotedPrice?: number
  quotedCurrency?: string
  validUntil?: Date
  termsAndConditions?: string
  notes?: string

  // Tracking
  source: 'website' | 'referral' | 'cold_call' | 'trade_show' | 'advertisement' | 'other'
  campaign?: string
  leadScore?: number

  // Files
  attachments?: string[]
  certificates?: string[]

  // Audit
  createdAt: Date
  updatedAt: Date
  createdBy?: string
  updatedBy?: string
}

export interface QuoteProduct {
  productId: string
  productName: string
  category: string
  texture: string
  origin: string
  length: number
  color: string
  quantity: number
  unitPrice: number
  totalPrice: number
  notes?: string
}

export interface EnquirySubmission {
  id: string
  customerName: string
  email: string
  phone?: string
  companyName?: string
  inquiryType: 'product' | 'bulk_order' | 'custom_order' | 'wholesale' | 'distributorship' | 'quote' | 'other'
  subject: string
  message: string
  productInterest?: string[]
  quantity?: number
  budget?: string
  timeline?: string
  status: 'new' | 'in_progress' | 'responded' | 'closed' | 'archived'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignedTo?: string
  assignedBy?: string
  responses?: EnquiryResponse[]
  attachments?: string[] // URLs to uploaded files
  customerInfo?: {
    address?: string
    city?: string
    country?: string
    website?: string
    businessType?: string
  }
  followUpDate?: Date
  source: 'website' | 'social_media' | 'referral' | 'direct' | 'other'
  ipAddress?: string
  userAgent?: string
  createdAt: Date
  updatedAt: Date
}

export interface EnquiryResponse {
  id: string
  message: string
  respondedBy: string
  responseType: 'email' | 'phone' | 'meeting' | 'quote' | 'other'
  createdAt: Date
  attachments?: string[]
}

export interface DashboardStats {
  totalUsers: number
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  recentOrders: Order[]
  lowStockProducts: number
  pendingInquiries: number
  totalImages: number
  recentEnquiries: EnquirySubmission[]
  totalQuotes: number
}

