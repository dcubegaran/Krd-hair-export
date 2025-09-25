import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  doc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../firebase'
import type { DashboardStats, Order, Product, Inquiry } from '../types/database'

export class AdminService {
  // Get comprehensive dashboard statistics
  static async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Get total counts
      const [usersSnapshot, productsSnapshot, ordersSnapshot, inquiriesSnapshot, imagesSnapshot, quotesSnapshot] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(query(collection(db, 'products'), where('isActive', '==', true))),
        getDocs(collection(db, 'orders')),
        getDocs(collection(db, 'inquiries')),
        getDocs(query(collection(db, 'images'), where('isActive', '==', true))),
        getDocs(collection(db, 'quotes'))
      ])

      const totalUsers = usersSnapshot.size
      const totalProducts = productsSnapshot.size
      const totalOrders = ordersSnapshot.size
      const totalInquiries = inquiriesSnapshot.size
      const totalImages = imagesSnapshot.size
      const totalQuotes = quotesSnapshot.size

      // Calculate total revenue
      let totalRevenue = 0
      ordersSnapshot.docs.forEach(doc => {
        const order = doc.data() as Order
        if (order.paymentStatus === 'paid') {
          totalRevenue += order.totalAmount
        }
      })

      // Get recent orders
      const recentOrdersQuery = query(
        collection(db, 'orders'),
        orderBy('createdAt', 'desc'),
        limit(5)
      )
      const recentOrdersSnapshot = await getDocs(recentOrdersQuery)
      const recentOrders = recentOrdersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Order))

      // Get low stock products
      const lowStockQuery = query(
        collection(db, 'products'),
        where('stockQuantity', '<=', 10),
        where('isActive', '==', true)
      )
      const lowStockSnapshot = await getDocs(lowStockQuery)
      const lowStockProducts = lowStockSnapshot.size

      // Get pending inquiries
      const pendingInquiriesQuery = query(
        collection(db, 'inquiries'),
        where('status', '==', 'new')
      )
      const pendingInquiriesSnapshot = await getDocs(pendingInquiriesQuery)
      const pendingInquiries = pendingInquiriesSnapshot.size

      // Get recent enquiries
      const recentEnquiriesQuery = query(
        collection(db, 'inquiries'),
        orderBy('createdAt', 'desc'),
        limit(5)
      )
      const recentEnquiriesSnapshot = await getDocs(recentEnquiriesQuery)
      const recentEnquiries = recentEnquiriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as any))

      return {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
        recentOrders,
        lowStockProducts,
        pendingInquiries,
        totalImages,
        recentEnquiries,
        totalQuotes
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      throw error
    }
  }

  // Get all orders with advanced filtering
  static async getAllOrders(filters?: {
    status?: string
    paymentStatus?: string
    dateFrom?: Date
    dateTo?: Date
    customerId?: string
  }, page: number = 1, pageSize: number = 20): Promise<{
    orders: Order[]
    total: number
    totalPages: number
  }> {
    try {
      let q = query(collection(db, 'orders'))

      // Apply filters
      if (filters?.status) {
        q = query(q, where('status', '==', filters.status))
      }

      if (filters?.paymentStatus) {
        q = query(q, where('paymentStatus', '==', filters.paymentStatus))
      }

      if (filters?.customerId) {
        q = query(q, where('customerId', '==', filters.customerId))
      }

      if (filters?.dateFrom) {
        q = query(q, where('createdAt', '>=', filters.dateFrom))
      }

      if (filters?.dateTo) {
        q = query(q, where('createdAt', '<=', filters.dateTo))
      }

      q = query(q, orderBy('createdAt', 'desc'))

      const querySnapshot = await getDocs(q)
      const total = querySnapshot.size
      const totalPages = Math.ceil(total / pageSize)

      // Get paginated results
      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + pageSize
      const paginatedDocs = querySnapshot.docs.slice(startIndex, endIndex)

      const orders = paginatedDocs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Order))

      return {
        orders,
        total,
        totalPages
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      throw error
    }
  }

  // Get all inquiries
  static async getAllInquiries(filters?: {
    status?: string
    priority?: string
    type?: string
  }): Promise<Inquiry[]> {
    try {
      let q = query(collection(db, 'inquiries'))

      if (filters?.status) {
        q = query(q, where('status', '==', filters.status))
      }

      if (filters?.priority) {
        q = query(q, where('priority', '==', filters.priority))
      }

      if (filters?.type) {
        q = query(q, where('type', '==', filters.type))
      }

      q = query(q, orderBy('createdAt', 'desc'))

      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Inquiry))
    } catch (error) {
      console.error('Error fetching inquiries:', error)
      throw error
    }
  }

  // Update inquiry status
  static async updateInquiryStatus(inquiryId: string, status: Inquiry['status'], assignedTo?: string): Promise<void> {
    try {
      const inquiryRef = doc(db, 'inquiries', inquiryId)
      const updateData: any = {
        status,
        updatedAt: serverTimestamp()
      }

      if (assignedTo) {
        updateData.assignedTo = assignedTo
      }

      await updateDoc(inquiryRef, updateData)
    } catch (error) {
      console.error('Error updating inquiry status:', error)
      throw error
    }
  }

  // Get user management data
  static async getUserManagementData(): Promise<{
    totalUsers: number
    activeUsers: number
    adminUsers: number
    staffUsers: number
    customerUsers: number
  }> {
    try {
      const [allUsers, activeUsers, adminUsers, staffUsers, customerUsers] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(query(collection(db, 'users'), where('isActive', '==', true))),
        getDocs(query(collection(db, 'users'), where('role', '==', 'admin'))),
        getDocs(query(collection(db, 'users'), where('role', '==', 'staff'))),
        getDocs(query(collection(db, 'users'), where('role', '==', 'customer')))
      ])

      return {
        totalUsers: allUsers.size,
        activeUsers: activeUsers.size,
        adminUsers: adminUsers.size,
        staffUsers: staffUsers.size,
        customerUsers: customerUsers.size
      }
    } catch (error) {
      console.error('Error fetching user management data:', error)
      throw error
    }
  }

  // Get product analytics
  static async getProductAnalytics(): Promise<{
    totalProducts: number
    activeProducts: number
    featuredProducts: number
    outOfStockProducts: number
    lowStockProducts: number
    productsByCategory: { [category: string]: number }
  }> {
    try {
      const [allProducts, activeProducts, featuredProducts, outOfStockProducts, lowStockProducts] = await Promise.all([
        getDocs(collection(db, 'products')),
        getDocs(query(collection(db, 'products'), where('isActive', '==', true))),
        getDocs(query(collection(db, 'products'), where('isFeatured', '==', true))),
        getDocs(query(collection(db, 'products'), where('stockQuantity', '==', 0))),
        getDocs(query(collection(db, 'products'), where('stockQuantity', '<=', 5)))
      ])

      // Get products by category
      const categoryQuery = query(collection(db, 'products'), where('isActive', '==', true))
      const categorySnapshot = await getDocs(categoryQuery)
      const productsByCategory: { [category: string]: number } = {}

      categorySnapshot.docs.forEach(doc => {
        const product = doc.data() as Product
        productsByCategory[product.category] = (productsByCategory[product.category] || 0) + 1
      })

      return {
        totalProducts: allProducts.size,
        activeProducts: activeProducts.size,
        featuredProducts: featuredProducts.size,
        outOfStockProducts: outOfStockProducts.size,
        lowStockProducts: lowStockProducts.size,
        productsByCategory
      }
    } catch (error) {
      console.error('Error fetching product analytics:', error)
      throw error
    }
  }

  // Bulk operations
  static async bulkUpdateOrderStatus(orderIds: string[], status: Order['status']): Promise<void> {
    try {
      const updatePromises = orderIds.map(orderId =>
        updateDoc(doc(db, 'orders', orderId), {
          status,
          updatedAt: serverTimestamp()
        })
      )

      await Promise.all(updatePromises)
    } catch (error) {
      console.error('Error bulk updating orders:', error)
      throw error
    }
  }

  // Export data for reporting
  static async exportOrdersReport(filters?: {
    dateFrom?: Date
    dateTo?: Date
    status?: string
  }): Promise<Order[]> {
    try {
      let q = query(collection(db, 'orders'))

      if (filters?.status) {
        q = query(q, where('status', '==', filters.status))
      }

      if (filters?.dateFrom) {
        q = query(q, where('createdAt', '>=', filters.dateFrom))
      }

      if (filters?.dateTo) {
        q = query(q, where('createdAt', '<=', filters.dateTo))
      }

      q = query(q, orderBy('createdAt', 'desc'))

      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Order))
    } catch (error) {
      console.error('Error exporting orders report:', error)
      throw error
    }
  }
}