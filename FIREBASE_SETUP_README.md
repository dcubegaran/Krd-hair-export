# Firebase Backend Setup Guide - KRD Hair Exports

This guide will help you set up the complete Firebase backend for your KRD Hair Exports application.

## 🚀 Quick Start

### 1. Environment Variables Setup

Your Firebase configuration is already set up in `.env.local`. Make sure these environment variables are properly configured with your Firebase project credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## 📋 Database Collections Summary

1. **Users** - User profiles and roles
2. **Products** - Product catalog and inventory
3. **Orders** - Order management and tracking
4. **Categories** - Product categorization
5. **Inventory** - Stock management
6. **Inquiries** - Customer enquiry tracking ✨ **NEW**
7. **Quotes** - Quote request management ✨ **NEW**
8. **Images** - File upload metadata tracking ✨ **NEW**

### 2. Firebase Console Setup

#### Step 1: Enable Required Services
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `krd-hair-export`
3. Enable the following services:
   - **Authentication** (Email/Password)
   - **Firestore Database**
   - **Storage**
   - **Functions** (optional, for advanced features)

#### Step 2: Configure Authentication
1. Go to **Authentication** → **Sign-in method**
2. Enable **Email/Password** provider
3. Set up authorized domains (add your domain)

#### Step 3: Set Up Firestore Security Rules
1. Go to **Firestore Database** → **Rules**
2. Replace the default rules with the content from `firestore.rules`
3. Click **Publish**

#### Step 4: Configure Storage Rules
1. Go to **Storage** → **Rules**
2. Set up basic security rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 3. Database Schema Setup

#### Create Collections in Firestore:

1. **Users Collection**
   ```javascript
   // Document structure:
   {
     email: "user@example.com",
     displayName: "John Doe",
     role: "customer", // admin, staff, customer
     phone: "+1234567890",
     address: {
       street: "123 Main St",
       city: "New York",
       state: "NY",
       country: "USA",
       zipCode: "10001"
     },
     isActive: true,
     createdAt: timestamp,
     updatedAt: timestamp
   }
   ```

2. **Products Collection**
   ```javascript
   {
     name: "Brazilian Straight Hair",
     sku: "BSH-001",
     description: "Premium Brazilian straight hair",
     category: "straight",
     origin: "brazilian",
     hairType: "virgin",
     texture: "Straight",
     lengths: [12, 14, 16, 18, 20],
     colors: ["Natural Black", "Brown"],
     pricePerBundle: 85,
     bulkPricing: [
       { minQuantity: 10, pricePerUnit: 75 },
       { minQuantity: 50, pricePerUnit: 65 }
     ],
     stockQuantity: 150,
     minOrderQuantity: 3,
     images: ["https://...", "https://..."],
     isActive: true,
     isFeatured: false,
     createdAt: timestamp,
     updatedAt: timestamp
   }
   ```

3. **Orders Collection**
   ```javascript
   {
     orderNumber: "KRD-123456789-001",
     customerId: "user_id",
     customerInfo: {
       name: "John Doe",
       email: "john@example.com",
       phone: "+1234567890"
     },
     items: [
       {
         productId: "product_id",
         productName: "Brazilian Straight Hair",
         quantity: 3,
         length: 18,
         pricePerUnit: 85,
         totalPrice: 255
       }
     ],
     status: "pending", // pending, confirmed, processing, shipped, delivered, cancelled
     paymentStatus: "pending", // pending, paid, refunded, failed
     totalAmount: 255,
     shippingAddress: {
       street: "123 Main St",
       city: "New York",
       state: "NY",
       country: "USA",
       zipCode: "10001"
     },
     trackingNumber: "TRK123456789",
     notes: "Handle with care",
     createdAt: timestamp,
     updatedAt: timestamp
   }
   ```

4. **Categories Collection**
   ```javascript
   {
     name: "Straight Hair",
     description: "Premium straight hair extensions",
     image: "https://...",
     isActive: true,
     sortOrder: 1,
     createdAt: timestamp,
     updatedAt: timestamp
   }
   ```

5. **Inquiries Collection**
   ```javascript
   {
     customerName: "Jane Smith",
     email: "jane@example.com",
     phone: "+1234567890",
     companyName: "ABC Beauty",
     inquiryType: "bulk_order", // product, bulk_order, custom_order, wholesale, distributorship, other
     subject: "Bulk Order Inquiry",
     message: "I need 100 bundles...",
     productInterest: ["Brazilian Straight", "Deep Wave"],
     quantity: 100,
     budget: "$5000-$10000",
     timeline: "3 months",
     status: "new", // new, in_progress, responded, closed, archived
     priority: "high", // low, medium, high, urgent
     assignedTo: "admin_id",
     responses: [
       {
         id: "response_123",
         message: "Thank you for your inquiry...",
         respondedBy: "admin_id",
         responseType: "email",
         createdAt: timestamp
       }
     ],
     attachments: ["https://storage..."],
     customerInfo: {
       address: "123 Business St",
       city: "New York",
       country: "USA",
       website: "https://abcbeauty.com",
       businessType: "Salon"
     },
     source: "website",
     createdAt: timestamp,
     updatedAt: timestamp
   }
   ```

6. **Quotes Collection**
   ```javascript
   {
     customerName: "John Doe",
     email: "john@salon.com",
     phone: "+1234567890",
     companyName: "Elite Hair Salon",
     businessType: "salon",
     address: {
       street: "123 Main St",
       city: "New York",
       state: "NY",
       country: "USA",
       zipCode: "10001"
     },
     products: [
       {
         productId: "prod_123",
         productName: "Brazilian Straight Hair",
         category: "straight",
         texture: "Straight",
         origin: "brazilian",
         length: 18,
         color: "Natural Black",
         quantity: 10,
         unitPrice: 85,
         totalPrice: 850
       }
     ],
     totalQuantity: 10,
     totalValue: 850,
     currency: "USD",
     quality: "premium",
     paymentTerms: "net_30",
     shippingMethod: "air",
     status: "submitted", // draft, submitted, under_review, quoted, negotiating, approved, rejected, expired
     priority: "medium",
     assignedTo: "sales_rep_id",
     quotedPrice: 800,
     quotedCurrency: "USD",
     validUntil: timestamp,
     source: "website",
     createdAt: timestamp,
     updatedAt: timestamp
   }
   ```

7. **Images Collection**
   ```javascript
   {
     fileName: "product-image-123.jpg",
     originalName: "brazilian-hair.jpg",
     url: "https://storage.googleapis.com/...",
     thumbnailUrl: "https://storage.googleapis.com/...",
     size: 2048576, // bytes
     mimeType: "image/jpeg",
     uploadedBy: "user_id",
     uploadedAt: timestamp,
     category: "product", // product, user, order, general
     referenceId: "product_id", // ID of related product, user, order, etc.
     tags: ["brazilian", "straight", "hair"],
     isActive: true,
     metadata: {
       width: 1200,
       height: 800,
       alt: "Brazilian straight hair bundles",
       description: "Premium Brazilian straight hair"
     }
   }
   ```

## 🔧 Services Overview

### Authentication Service (`AuthService`)
- **Sign In/Up**: Email/password authentication
- **User Management**: Profile updates, role management
- **Password Reset**: Secure password recovery
- **Role-based Access**: Admin, staff, customer roles

### Product Service (`ProductService`)
- **CRUD Operations**: Create, read, update, delete products
- **Search & Filter**: Find products by category, search terms
- **Inventory Management**: Stock tracking, low stock alerts
- **Bulk Operations**: Batch updates for inventory

### Order Service (`OrderService`)
- **Order Management**: Create, update, track orders
- **Status Tracking**: Order lifecycle management
- **Analytics**: Revenue, order statistics
- **Customer Orders**: Order history for users

### Admin Service (`AdminService`)
- **Dashboard Stats**: Comprehensive analytics
- **User Management**: Admin controls for users
- **Bulk Operations**: Mass updates for orders/products
- **Reporting**: Export data for business intelligence

### Storage Service (`StorageService`)
- **File Uploads**: Product images, documents
- **Image Optimization**: Compression, resizing
- **File Management**: Delete, organize files
- **Security**: Access control for uploads
- **Database Integration**: Automatic image record creation

### Image Service (`ImageService`)
- **Image Management**: CRUD operations for image metadata
- **Categorization**: Organize images by type and reference
- **Search & Filter**: Find images by tags, category, uploader
- **Statistics**: Image analytics and reporting
- **Bulk Operations**: Mass delete and update operations

### Quote Service (`QuoteService`)
- **Quote Management**: Comprehensive quote request handling
- **Business Intelligence**: Track customer requirements and preferences
- **Pricing Management**: Handle multiple currencies and pricing tiers
- **Status Tracking**: Complete quote lifecycle management
- **Analytics**: Quote conversion rates and business metrics
- **Lead Scoring**: Prioritize high-value opportunities

### Enquiry Service (`EnquiryService`)
- **Enquiry Management**: Handle customer inquiries and requests
- **Status Tracking**: Track inquiry progress and responses
- **Response System**: Add responses and follow-ups
- **Search & Filter**: Find enquiries by status, type, priority
- **Statistics**: Enquiry analytics and reporting
- **Assignment**: Assign enquiries to staff members

## 📊 Dashboard Features

### Admin Dashboard
- **Real-time Stats**: Users, products, orders, revenue, images, quotes
- **Recent Activity**: Latest orders, inquiries, quotes, and uploads
- **Low Stock Alerts**: Inventory management
- **Quote Management**: Track quote requests and conversion rates
- **Image Management**: Track uploaded images and storage usage
- **Enquiry Tracking**: Monitor customer inquiries and responses
- **Analytics Charts**: Business metrics visualization

### User Dashboard
- **Order History**: Track past and current orders
- **Profile Management**: Update personal information
- **Wishlist**: Save favorite products
- **Notifications**: Order updates and alerts

## 🔒 Security Features

### Firestore Security Rules
- **Role-based Access**: Different permissions for admin/staff/customer
- **Data Validation**: Ensure data integrity
- **Authentication Required**: All database operations require auth
- **Owner-based Access**: Users can only access their own data

### Authentication Security
- **Password Requirements**: Strong password policies
- **Session Management**: Secure token handling
- **Rate Limiting**: Prevent brute force attacks
- **Email Verification**: Optional email verification

## 🚀 Deployment Checklist

### Before Going Live:
1. ✅ **Environment Variables**: Set production Firebase config
2. ✅ **Security Rules**: Apply production Firestore rules
3. ✅ **Storage Rules**: Configure file upload security
4. ✅ **Authentication**: Set up email templates
5. ✅ **Database Indexes**: Create necessary Firestore indexes
6. ✅ **Monitoring**: Set up Firebase monitoring
7. ✅ **Backup**: Configure automated backups

### Production Environment Variables:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=production_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=yourdomain.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=production_project
# ... other production values
```

## 🛠️ Development Workflow

### Adding New Features:
1. **Create Types**: Add to `src/lib/types/database.ts`
2. **Build Service**: Create service class in `src/lib/services/`
3. **Add Methods**: Implement CRUD operations
4. **Update Context**: Add to auth context if needed
5. **Create Components**: Build UI components
6. **Test**: Test with Firebase emulator

### Database Operations:
```typescript
// Example: Create a new product
const productId = await ProductService.createProduct({
  name: "New Hair Product",
  sku: "NHP-001",
  // ... other product data
})

// Example: Update order status
await OrderService.updateOrderStatus(orderId, 'shipped', 'Shipped via FedEx')

// Example: Upload product images with database tracking
const imageUrls = await StorageService.uploadProductImages(files, productId, userId)

// Example: Create enquiry submission
const enquiryId = await EnquiryService.createEnquiry({
  customerName: 'John Doe',
  email: 'john@example.com',
  inquiryType: 'bulk_order',
  subject: 'Bulk Order Request',
  message: 'I need 50 bundles...',
  priority: 'high',
  source: 'website'
})

// Example: Search images by tags
const images = await ImageService.searchImagesByTags(['brazilian', 'straight'])

// Example: Get enquiry statistics
const stats = await EnquiryService.getEnquiryStats()
```

## 📱 API Endpoints (Future)

For mobile apps or external integrations, you can create Firebase Functions:

```javascript
// Example Cloud Function for order processing
exports.processOrder = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snap, context) => {
    const order = snap.data()
    // Process order logic here
  })
```

## 🔍 Monitoring & Analytics

### Firebase Monitoring:
- **Performance**: Track app performance
- **Crash Reporting**: Monitor app crashes
- **Custom Events**: Track user interactions
- **Funnel Analysis**: Conversion tracking

### Business Analytics:
- **Revenue Tracking**: Monitor sales performance
- **Customer Analytics**: User behavior analysis
- **Product Performance**: Best-selling products
- **Geographic Data**: Sales by location

## 📞 Support & Troubleshooting

### Common Issues:
1. **Authentication Errors**: Check Firebase Auth settings
2. **Permission Denied**: Verify Firestore security rules
3. **Storage Uploads**: Check Storage security rules
4. **Real-time Updates**: Ensure proper listener cleanup

### Getting Help:
- **Firebase Documentation**: https://firebase.google.com/docs
- **Next.js + Firebase**: https://nextjs.org/docs/basic-features/environment-variables
- **Firestore Security**: https://firebase.google.com/docs/firestore/security/overview

## 🎯 Next Steps

1. **Set up your Firebase project** with the provided configuration
2. **Apply the security rules** to protect your data
3. **Create initial data** (categories, sample products)
4. **Test the authentication** flows
5. **Build the admin panel** interface
6. **Add real-time features** for live updates
7. **Implement notifications** for order updates

Your Firebase backend is now ready for production! 🚀