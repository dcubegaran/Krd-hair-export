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
      const q = query(
        collection(db, COLLECTION_NAME),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product))
    } catch (error) {
      console.error('Error fetching products:', error)
      throw error
    }
  }

  // Get featured products
  static async getFeaturedProducts(): Promise<Product[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('isActive', '==', true),
        where('isFeatured', '==', true),
        orderBy('createdAt', 'desc'),
        limit(8)
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product))
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
      const q = query(
        collection(db, COLLECTION_NAME),
        where('category', '==', category),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product))
    } catch (error) {
      console.error('Error fetching products by category:', error)
      throw error
    }
  }

  // Search products
  static async searchProducts(searchTerm: string): Promise<Product[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
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

      return filteredProducts
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
      const q = query(
        collection(db, COLLECTION_NAME),
        where('stockQuantity', '<=', threshold),
        where('isActive', '==', true),
        orderBy('stockQuantity', 'asc')
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product))
    } catch (error) {
      console.error('Error fetching low stock products:', error)
      throw error
    }
  }

  // Get all categories
  static async getAllCategories(): Promise<Category[]> {
    try {
      const q = query(
        collection(db, CATEGORIES_COLLECTION),
        where('isActive', '==', true),
        orderBy('sortOrder', 'asc')
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Category))
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
      const offset = (page - 1) * pageSize
      const q = query(
        collection(db, COLLECTION_NAME),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      )
      const querySnapshot = await getDocs(q)

      // Get total count
      const totalQuery = query(
        collection(db, COLLECTION_NAME),
        where('isActive', '==', true)
      )
      const totalSnapshot = await getDocs(totalQuery)
      const total = totalSnapshot.size
      const totalPages = Math.ceil(total / pageSize)

      const products = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product))

      return {
        products,
        total,
        totalPages
      }
    } catch (error) {
      console.error('Error fetching paginated products:', error)
      throw error
    }
  }
}