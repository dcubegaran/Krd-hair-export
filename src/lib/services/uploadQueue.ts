import { ImageService } from './imageService'
import type { ImageUpload } from '../types/database'

interface QueuedImageRecord {
  imageData: Omit<ImageUpload, 'id' | 'uploadedAt'>
  timestamp: number
}

class UploadQueueManager {
  private queue: QueuedImageRecord[] = []
  private debounceTimer: NodeJS.Timeout | null = null
  private readonly DEBOUNCE_DELAY = 5000 // 5 seconds
  private readonly BATCH_SIZE = 10 // Process max 10 records at once

  // Add image record to queue instead of immediate creation
  queueImageRecord(imageData: Omit<ImageUpload, 'id' | 'uploadedAt'>): void {
    this.queue.push({
      imageData,
      timestamp: Date.now()
    })

    // Reset debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }

    // Set new debounce timer
    this.debounceTimer = setTimeout(() => {
      this.processQueue()
    }, this.DEBOUNCE_DELAY)
  }

  // Process queued image records in batches
  private async processQueue(): Promise<void> {
    if (this.queue.length === 0) return

    console.log(`Processing ${this.queue.length} queued image records...`)

    // Take a batch from the queue
    const batch = this.queue.splice(0, this.BATCH_SIZE)

    try {
      // Process batch with some delay between operations to avoid overwhelming Firestore
      for (let i = 0; i < batch.length; i++) {
        const { imageData } = batch[i]
        
        try {
          await ImageService.createImageRecord(imageData)
          console.log(`Created image record for: ${imageData.fileName}`)
        } catch (error) {
          console.error(`Failed to create image record for ${imageData.fileName}:`, error)
          // Re-queue failed items (optional)
          this.queue.push(batch[i])
        }

        // Add small delay between operations to be gentle on Firestore
        if (i < batch.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200))
        }
      }

      // If there are more items in queue, schedule next batch
      if (this.queue.length > 0) {
        setTimeout(() => this.processQueue(), 1000)
      }

    } catch (error) {
      console.error('Error processing upload queue:', error)
      // Re-queue the entire batch on error
      this.queue.unshift(...batch)
    }
  }

  // Force immediate processing (for critical operations)
  async forceProcess(): Promise<void> {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = null
    }
    await this.processQueue()
  }

  // Get queue status
  getQueueStatus(): { queueLength: number; oldestItem: number | null } {
    const oldestItem = this.queue.length > 0 ? 
      Math.min(...this.queue.map(item => item.timestamp)) : null

    return {
      queueLength: this.queue.length,
      oldestItem
    }
  }

  // Clear queue (emergency use)
  clearQueue(): void {
    this.queue = []
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = null
    }
  }
}

// Export singleton instance
export const uploadQueue = new UploadQueueManager()