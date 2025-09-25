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
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../firebase'
import type { ImageUpload } from '../types/database'

const COLLECTION_NAME = 'images'

export class ImageService {
  // Upload image metadata to database
  static async createImageRecord(imageData: Omit<ImageUpload, 'id' | 'uploadedAt'>): Promise<string> {
    try {
      const now = serverTimestamp()

      // Filter out undefined values to prevent Firestore errors
      const filteredImageData = Object.fromEntries(
        Object.entries(imageData).filter(([_, value]) => value !== undefined)
      )

      const newImage = {
        ...filteredImageData,
        uploadedAt: now
      }
      const docRef = await addDoc(collection(db, COLLECTION_NAME), newImage)
      return docRef.id
    } catch (error) {
      console.error('Error creating image record:', error)
      throw error
    }
  }

  // Get image by ID
  static async getImageById(imageId: string): Promise<ImageUpload | null> {
    try {
      const imageDoc = await getDoc(doc(db, COLLECTION_NAME, imageId))
      if (imageDoc.exists()) {
        return { id: imageDoc.id, ...imageDoc.data() } as ImageUpload
      }
      return null
    } catch (error) {
      console.error('Error fetching image:', error)
      throw error
    }
  }

  // Get images by reference ID (product, user, order, etc.)
  static async getImagesByReference(referenceId: string, category: string): Promise<ImageUpload[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('referenceId', '==', referenceId),
        where('category', '==', category),
        where('isActive', '==', true),
        orderBy('uploadedAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ImageUpload))
    } catch (error) {
      console.error('Error fetching images by reference:', error)
      throw error
    }
  }

  // Get images by category
  static async getImagesByCategory(category: string): Promise<ImageUpload[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('category', '==', category),
        where('isActive', '==', true),
        orderBy('uploadedAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ImageUpload))
    } catch (error) {
      console.error('Error fetching images by category:', error)
      throw error
    }
  }

  // Get images uploaded by user
  static async getImagesByUser(uploadedBy: string): Promise<ImageUpload[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('uploadedBy', '==', uploadedBy),
        where('isActive', '==', true),
        orderBy('uploadedAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ImageUpload))
    } catch (error) {
      console.error('Error fetching images by user:', error)
      throw error
    }
  }

  // Search images by tags
  static async searchImagesByTags(tags: string[]): Promise<ImageUpload[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('isActive', '==', true),
        orderBy('uploadedAt', 'desc')
      )
      const querySnapshot = await getDocs(q)

      const images = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ImageUpload))

      // Filter images that have any of the specified tags
      return images.filter(image =>
        image.tags?.some(tag => tags.includes(tag))
      )
    } catch (error) {
      console.error('Error searching images by tags:', error)
      throw error
    }
  }

  // Update image metadata
  static async updateImage(imageId: string, updates: Partial<ImageUpload>): Promise<void> {
    try {
      const imageRef = doc(db, COLLECTION_NAME, imageId)

      // Filter out undefined values from updates
      const filteredUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, value]) => value !== undefined)
      )

      await updateDoc(imageRef, {
        ...filteredUpdates,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error updating image:', error)
      throw error
    }
  }

  // Delete image (soft delete)
  static async deleteImage(imageId: string): Promise<void> {
    try {
      const imageRef = doc(db, COLLECTION_NAME, imageId)
      await updateDoc(imageRef, {
        isActive: false,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error deleting image:', error)
      throw error
    }
  }

  // Get recent images
  static async getRecentImages(limitCount: number = 20): Promise<ImageUpload[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('isActive', '==', true),
        orderBy('uploadedAt', 'desc'),
        limit(limitCount)
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ImageUpload))
    } catch (error) {
      console.error('Error fetching recent images:', error)
      throw error
    }
  }

  // Get images with pagination
  static async getImagesPaginated(page: number = 1, pageSize: number = 20, filters?: {
    category?: string
    uploadedBy?: string
    tags?: string[]
  }): Promise<{
    images: ImageUpload[]
    total: number
    totalPages: number
  }> {
    try {
      let q = query(collection(db, COLLECTION_NAME), where('isActive', '==', true))

      if (filters?.category) {
        q = query(q, where('category', '==', filters.category))
      }

      if (filters?.uploadedBy) {
        q = query(q, where('uploadedBy', '==', filters.uploadedBy))
      }

      q = query(q, orderBy('uploadedAt', 'desc'))

      const querySnapshot = await getDocs(q)
      const total = querySnapshot.size
      const totalPages = Math.ceil(total / pageSize)

      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + pageSize
      const paginatedDocs = querySnapshot.docs.slice(startIndex, endIndex)

      const images = paginatedDocs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ImageUpload))

      return {
        images,
        total,
        totalPages
      }
    } catch (error) {
      console.error('Error fetching paginated images:', error)
      throw error
    }
  }

  // Get image statistics
  static async getImageStats(): Promise<{
    totalImages: number
    imagesByCategory: { [category: string]: number }
    totalSize: number
    recentUploads: number
  }> {
    try {
      const q = query(collection(db, COLLECTION_NAME), where('isActive', '==', true))
      const querySnapshot = await getDocs(q)

      const images = querySnapshot.docs.map(doc => doc.data() as ImageUpload)
      const totalImages = images.length
      const totalSize = images.reduce((sum, img) => sum + img.size, 0)

      // Count by category
      const imagesByCategory: { [category: string]: number } = {}
      images.forEach(image => {
        imagesByCategory[image.category] = (imagesByCategory[image.category] || 0) + 1
      })

      // Count recent uploads (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const recentUploads = images.filter(image =>
        image.uploadedAt >= thirtyDaysAgo
      ).length

      return {
        totalImages,
        imagesByCategory,
        totalSize,
        recentUploads
      }
    } catch (error) {
      console.error('Error fetching image statistics:', error)
      throw error
    }
  }

  // Bulk delete images
  static async bulkDeleteImages(imageIds: string[]): Promise<void> {
    try {
      const updatePromises = imageIds.map(imageId =>
        updateDoc(doc(db, COLLECTION_NAME, imageId), {
          isActive: false,
          updatedAt: serverTimestamp()
        })
      )
      await Promise.all(updatePromises)
    } catch (error) {
      console.error('Error bulk deleting images:', error)
      throw error
    }
  }
}