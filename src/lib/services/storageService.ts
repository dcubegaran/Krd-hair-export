import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
  getMetadata
} from 'firebase/storage'
import { storage } from '../firebase'
import { ImageService } from './imageService'

export class StorageService {
  // Upload single file
  static async uploadFile(file: File, path: string): Promise<string> {
    try {
      const storageRef = ref(storage, path)
      const snapshot = await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(snapshot.ref)
      return downloadURL
    } catch (error) {
      console.error('Error uploading file:', error)
      throw error
    }
  }

  // Upload multiple files
  static async uploadMultipleFiles(files: File[], basePath: string): Promise<string[]> {
    try {
      const uploadPromises = files.map((file, index) => {
        const fileName = `${Date.now()}-${index}-${file.name}`
        const path = `${basePath}/${fileName}`
        return this.uploadFile(file, path)
      })

      return await Promise.all(uploadPromises)
    } catch (error) {
      console.error('Error uploading multiple files:', error)
      throw error
    }
  }

  // Upload product images with database record
  static async uploadProductImages(files: File[], productId: string, uploadedBy: string): Promise<string[]> {
    try {
      const basePath = `products/${productId}/images`
      const urls = await this.uploadMultipleFiles(files, basePath)

      // Create database records for each uploaded image
      for (let i = 0; i < files.length; i++) {
        await ImageService.createImageRecord({
          fileName: files[i].name,
          originalName: files[i].name,
          url: urls[i],
          size: files[i].size,
          mimeType: files[i].type,
          uploadedBy,
          category: 'product',
          referenceId: productId,
          isActive: true
        })
      }

      return urls
    } catch (error) {
      console.error('Error uploading product images:', error)
      throw error
    }
  }

  // Upload enquiry attachments with database record
  static async uploadEnquiryAttachments(files: File[], enquiryId: string, uploadedBy: string): Promise<string[]> {
    try {
      const basePath = `enquiries/${enquiryId}/attachments`
      const urls = await this.uploadMultipleFiles(files, basePath)

      // Create database records for each uploaded file
      for (let i = 0; i < files.length; i++) {
        await ImageService.createImageRecord({
          fileName: files[i].name,
          originalName: files[i].name,
          url: urls[i],
          size: files[i].size,
          mimeType: files[i].type,
          uploadedBy,
          category: 'general',
          referenceId: enquiryId,
          isActive: true
        })
      }

      return urls
    } catch (error) {
      console.error('Error uploading enquiry attachments:', error)
      throw error
    }
  }

  // Delete file
  static async deleteFile(url: string): Promise<void> {
    try {
      const storageRef = ref(storage, url)
      await deleteObject(storageRef)
    } catch (error) {
      console.error('Error deleting file:', error)
      throw error
    }
  }

  // Delete multiple files
  static async deleteMultipleFiles(urls: string[]): Promise<void> {
    try {
      const deletePromises = urls.map(url => this.deleteFile(url))
      await Promise.all(deletePromises)
    } catch (error) {
      console.error('Error deleting multiple files:', error)
      throw error
    }
  }

  // Get file metadata
  static async getFileMetadata(url: string): Promise<any> {
    try {
      const storageRef = ref(storage, url)
      return await getMetadata(storageRef)
    } catch (error) {
      console.error('Error getting file metadata:', error)
      throw error
    }
  }

  // List files in a directory
  static async listFiles(path: string): Promise<any[]> {
    try {
      const storageRef = ref(storage, path)
      const result = await listAll(storageRef)

      const files = await Promise.all(
        result.items.map(async (itemRef) => {
          const url = await getDownloadURL(itemRef)
          const metadata = await getMetadata(itemRef)
          return {
            name: itemRef.name,
            url,
            metadata
          }
        })
      )

      return files
    } catch (error) {
      console.error('Error listing files:', error)
      throw error
    }
  }

  // Upload user avatar
  static async uploadUserAvatar(file: File, userId: string): Promise<string> {
    try {
      const fileName = `avatar-${Date.now()}-${file.name}`
      const path = `users/${userId}/${fileName}`
      return await this.uploadFile(file, path)
    } catch (error) {
      console.error('Error uploading user avatar:', error)
      throw error
    }
  }

  // Upload order documents
  static async uploadOrderDocument(file: File, orderId: string, documentType: string): Promise<string> {
    try {
      const fileName = `${documentType}-${Date.now()}-${file.name}`
      const path = `orders/${orderId}/documents/${fileName}`
      return await this.uploadFile(file, path)
    } catch (error) {
      console.error('Error uploading order document:', error)
      throw error
    }
  }

  // Validate file type
  static validateFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type)
  }

  // Validate file size (in MB)
  static validateFileSize(file: File, maxSizeMB: number): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    return file.size <= maxSizeBytes
  }

  // Compress image before upload (basic implementation)
  static async compressImage(file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              })
              resolve(compressedFile)
            } else {
              reject(new Error('Failed to compress image'))
            }
          },
          file.type,
          quality
        )
      }

      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(file)
    })
  }

  // Get optimized image URL (for different sizes)
  static getOptimizedImageUrl(originalUrl: string, size: 'small' | 'medium' | 'large' = 'medium'): string {
    // This would work if you have image optimization setup
    // For now, just return the original URL
    return originalUrl
  }

  // Generate thumbnail URL
  static generateThumbnailUrl(originalUrl: string): string {
    // This would work with Firebase Storage resize options
    // For now, just return the original URL
    return originalUrl
  }
}