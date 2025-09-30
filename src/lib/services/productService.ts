import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
  type Query
} from 'firebase/firestore'
import { db } from '../firebase'
import type { Product, Category } from '../types/database'

const COLLECTION_NAME = 'products'
const CATEGORIES_COLLECTION = 'categories'

export class ProductService {
  // Get all active products
  static async getAllProducts(): Promise<Product[]> {
    try {
      // Simplified query without orderBy to avoid index requirement
      const q = query(
        collection(db, COLLECTION_NAME),
        where('isActive', '==', true)
      )
      const querySnapshot = await getDocs(q)
      const products = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product))
      
      // Sort in memory by createdAt (newest first)
      return products.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(0)
        const bTime = b.createdAt?.toDate?.() || new Date(0)
        return bTime.getTime() - aTime.getTime()
      })
    } catch (error) {
      console.error('Error fetching products:', error)
      throw error
    }
  }

  // Get featured products
  static async getFeaturedProducts(): Promise<Product[]> {
    try {
      // Simplified query without orderBy to avoid index requirement
      const q = query(
        collection(db, COLLECTION_NAME),
        where('isActive', '==', true),
        where('isFeatured', '==', true)
      )
      const querySnapshot = await getDocs(q)
      const products = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product))
      
      // Sort in memory by createdAt (newest first) and limit to 8
      return products
        .sort((a, b) => {
          const aTime = a.createdAt?.toDate?.() || new Date(0)
          const bTime = b.createdAt?.toDate?.() || new Date(0)
          return bTime.getTime() - aTime.getTime()
        })
        .slice(0, 8)
    } catch (error) {
      console.error('Error fetching featured products:', error)
      throw error
    }
  }

  // Get product by ID
  static async getProductById(productId: string): Promise<Product | null> {
    try {
      const productDoc = await getDoc(doc(db, COLLECTION_NAME, productId))
      if (productDoc.exists()) {
        return { id: productDoc.id, ...productDoc.data() } as Product
      }
      return null
    } catch (error) {
      console.error('Error fetching product:', error)
      throw error
    }
  }

  // Get products by category
  static async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      // Simplified query without orderBy to avoid index requirement
      const q = query(
        collection(db, COLLECTION_NAME),
        where('category', '==', category),
        where('isActive', '==', true)
      )
      const querySnapshot = await getDocs(q)
      const products = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product))
      
      // Sort in memory by createdAt (newest first)
      return products.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(0)
        const bTime = b.createdAt?.toDate?.() || new Date(0)
        return bTime.getTime() - aTime.getTime()
      })
    } catch (error) {
      console.error('Error fetching products by category:', error)
      throw error
    }
  }

  // Search products
  static async searchProducts(searchTerm: string): Promise<Product[]> {
    try {
      // Simplified query without orderBy to avoid index requirement
      const q = query(
        collection(db, COLLECTION_NAME),
        where('isActive', '==', true)
      )
      const querySnapshot = await getDocs(q)

      const products = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product))

      // Filter products that match the search term
      const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase())
      )

      // Sort filtered results by createdAt (newest first)
      return filteredProducts.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(0)
        const bTime = b.createdAt?.toDate?.() || new Date(0)
        return bTime.getTime() - aTime.getTime()
      })
    } catch (error) {
      console.error('Error searching products:', error)
      throw error
    }
  }

  // Create new product
  static async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = serverTimestamp()
      const newProduct = {
        ...productData,
        createdAt: now,
        updatedAt: now
      }
      const docRef = await addDoc(collection(db, COLLECTION_NAME), newProduct)
      return docRef.id
    } catch (error) {
      console.error('Error creating product:', error)
      throw error
    }
  }

  // Update product
  static async updateProduct(productId: string, updates: Partial<Product>): Promise<void> {
    try {
      const productRef = doc(db, COLLECTION_NAME, productId)
      await updateDoc(productRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error updating product:', error)
      throw error
    }
  }

  // Delete product (soft delete)
  static async deleteProduct(productId: string): Promise<void> {
    try {
      const productRef = doc(db, COLLECTION_NAME, productId)
      await updateDoc(productRef, {
        isActive: false,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error deleting product:', error)
      throw error
    }
  }

  // Update stock quantity
  static async updateStock(productId: string, quantity: number): Promise<void> {
    try {
      const productRef = doc(db, COLLECTION_NAME, productId)
      await updateDoc(productRef, {
        stockQuantity: increment(quantity),
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error updating stock:', error)
      throw error
    }
  }

  // Get low stock products
  static async getLowStockProducts(threshold: number = 10): Promise<Product[]> {
    try {
      // Simplified query without orderBy to avoid index requirement
      const q = query(
        collection(db, COLLECTION_NAME),
        where('stockQuantity', '<=', threshold),
        where('isActive', '==', true)
      )
      const querySnapshot = await getDocs(q)
      const products = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product))
      
      // Sort in memory by stockQuantity (lowest first)
      return products.sort((a, b) => (a.stockQuantity || 0) - (b.stockQuantity || 0))
    } catch (error) {
      console.error('Error fetching low stock products:', error)
      throw error
    }
  }

  // Get all categories
  static async getAllCategories(): Promise<Category[]> {
    try {
      // Simplified query without orderBy to avoid index requirement
      const q = query(
        collection(db, CATEGORIES_COLLECTION),
        where('isActive', '==', true)
      )
      const querySnapshot = await getDocs(q)
      const categories = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Category))
      
      // Sort in memory by sortOrder (ascending)
      return categories.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    } catch (error) {
      console.error('Error fetching categories:', error)
      throw error
    }
  }

  // Get products with pagination
  static async getProductsPaginated(page: number = 1, pageSize: number = 20): Promise<{
    products: Product[]
    total: number
    totalPages: number
  }> {
    try {
      // Get all active products first
      const q = query(
        collection(db, COLLECTION_NAME),
        where('isActive', '==', true)
      )
      const querySnapshot = await getDocs(q)
      
      const allProducts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product))

      // Sort in memory by createdAt (newest first)
      const sortedProducts = allProducts.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(0)
        const bTime = b.createdAt?.toDate?.() || new Date(0)
        return bTime.getTime() - aTime.getTime()
      })

      // Apply pagination in memory
      const offset = (page - 1) * pageSize
      const paginatedProducts = sortedProducts.slice(offset, offset + pageSize)
      
      const total = allProducts.length
      const totalPages = Math.ceil(total / pageSize)

      return {
        products: paginatedProducts,
        total,
        totalPages
      }
    } catch (error) {
      console.error('Error fetching paginated products:', error)
      throw error
    }
  }
}