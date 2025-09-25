import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment
} from 'firebase/firestore'
import { db } from '../firebase'
import type { Order, OrderItem } from '../types/database'

const COLLECTION_NAME = 'orders'

export class OrderService {
  // Generate order number
  static generateOrderNumber(): string {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `KRD-${timestamp}-${random}`
  }

  // Create new order
  static async createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const orderNumber = this.generateOrderNumber()
      const now = serverTimestamp()

      const newOrder = {
        ...orderData,
        orderNumber,
        createdAt: now,
        updatedAt: now
      }

      const docRef = await addDoc(collection(db, COLLECTION_NAME), newOrder)
      return docRef.id
    } catch (error) {
      console.error('Error creating order:', error)
      throw error
    }
  }

  // Get order by ID
  static async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const orderDoc = await getDoc(doc(db, COLLECTION_NAME, orderId))
      if (orderDoc.exists()) {
        return { id: orderDoc.id, ...orderDoc.data() } as Order
      }
      return null
    } catch (error) {
      console.error('Error fetching order:', error)
      throw error
    }
  }

  // Get orders by customer ID
  static async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('customerId', '==', customerId),
        orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Order))
    } catch (error) {
      console.error('Error fetching customer orders:', error)
      throw error
    }
  }

  // Get all orders with pagination
  static async getAllOrders(page: number = 1, pageSize: number = 20, filters?: {
    status?: string
    paymentStatus?: string
    dateFrom?: Date
    dateTo?: Date
  }): Promise<{
    orders: Order[]
    total: number
    totalPages: number
  }> {
    try {
      let q = query(collection(db, COLLECTION_NAME))

      // Apply filters
      if (filters?.status) {
        q = query(q, where('status', '==', filters.status))
      }

      if (filters?.paymentStatus) {
        q = query(q, where('paymentStatus', '==', filters.paymentStatus))
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

  // Update order status
  static async updateOrderStatus(orderId: string, status: Order['status'], notes?: string): Promise<void> {
    try {
      const orderRef = doc(db, COLLECTION_NAME, orderId)
      const updateData: any = {
        status,
        updatedAt: serverTimestamp()
      }

      if (notes) {
        updateData.notes = notes
      }

      await updateDoc(orderRef, updateData)
    } catch (error) {
      console.error('Error updating order status:', error)
      throw error
    }
  }

  // Update payment status
  static async updatePaymentStatus(orderId: string, paymentStatus: Order['paymentStatus']): Promise<void> {
    try {
      const orderRef = doc(db, COLLECTION_NAME, orderId)
      await updateDoc(orderRef, {
        paymentStatus,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error updating payment status:', error)
      throw error
    }
  }

  // Add tracking number
  static async addTrackingNumber(orderId: string, trackingNumber: string): Promise<void> {
    try {
      const orderRef = doc(db, COLLECTION_NAME, orderId)
      await updateDoc(orderRef, {
        trackingNumber,
        status: 'shipped',
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error adding tracking number:', error)
      throw error
    }
  }

  // Get orders by status
  static async getOrdersByStatus(status: Order['status']): Promise<Order[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Order))
    } catch (error) {
      console.error('Error fetching orders by status:', error)
      throw error
    }
  }

  // Get recent orders
  static async getRecentOrders(limitCount: number = 10): Promise<Order[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Order))
    } catch (error) {
      console.error('Error fetching recent orders:', error)
      throw error
    }
  }

  // Calculate order total
  static calculateOrderTotal(items: OrderItem[]): number {
    return items.reduce((total, item) => total + item.totalPrice, 0)
  }

  // Get order statistics
  static async getOrderStats(): Promise<{
    totalOrders: number
    pendingOrders: number
    processingOrders: number
    shippedOrders: number
    deliveredOrders: number
    totalRevenue: number
  }> {
    try {
      const allOrdersQuery = query(collection(db, COLLECTION_NAME))
      const allOrdersSnapshot = await getDocs(allOrdersQuery)

      let totalRevenue = 0
      let pendingOrders = 0
      let processingOrders = 0
      let shippedOrders = 0
      let deliveredOrders = 0

      allOrdersSnapshot.docs.forEach(doc => {
        const order = doc.data() as Order
        totalRevenue += order.totalAmount

        switch (order.status) {
          case 'pending':
            pendingOrders++
            break
          case 'processing':
            processingOrders++
            break
          case 'shipped':
            shippedOrders++
            break
          case 'delivered':
            deliveredOrders++
            break
        }
      })

      return {
        totalOrders: allOrdersSnapshot.size,
        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        totalRevenue
      }
    } catch (error) {
      console.error('Error fetching order statistics:', error)
      throw error
    }
  }
}