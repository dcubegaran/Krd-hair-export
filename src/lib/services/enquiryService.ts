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
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../firebase'
import type { EnquirySubmission, EnquiryResponse } from '../types/database'

const COLLECTION_NAME = 'enquiries'

export class EnquiryService {
  // Create new enquiry submission
  static async createEnquiry(enquiryData: Omit<EnquirySubmission, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = serverTimestamp()

      // Filter out undefined values to prevent Firestore errors
      const filteredEnquiryData = Object.fromEntries(
        Object.entries(enquiryData).filter(([_, value]) => value !== undefined)
      )

      const newEnquiry = {
        ...filteredEnquiryData,
        createdAt: now,
        updatedAt: now
      }
      const docRef = await addDoc(collection(db, COLLECTION_NAME), newEnquiry)
      return docRef.id
    } catch (error) {
      console.error('Error creating enquiry:', error)
      throw error
    }
  }

  // Get enquiry by ID
  static async getEnquiryById(enquiryId: string): Promise<EnquirySubmission | null> {
    try {
      const enquiryDoc = await getDoc(doc(db, COLLECTION_NAME, enquiryId))
      if (enquiryDoc.exists()) {
        return { id: enquiryDoc.id, ...enquiryDoc.data() } as EnquirySubmission
      }
      return null
    } catch (error) {
      console.error('Error fetching enquiry:', error)
      throw error
    }
  }

  // Get enquiries by status
  static async getEnquiriesByStatus(status: string): Promise<EnquirySubmission[]> {
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
      } as EnquirySubmission))
    } catch (error) {
      console.error('Error fetching enquiries by status:', error)
      throw error
    }
  }

  // Get enquiries by priority
  static async getEnquiriesByPriority(priority: string): Promise<EnquirySubmission[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('priority', '==', priority),
        orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as EnquirySubmission))
    } catch (error) {
      console.error('Error fetching enquiries by priority:', error)
      throw error
    }
  }

  // Get enquiries by type
  static async getEnquiriesByType(type: string): Promise<EnquirySubmission[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('inquiryType', '==', type),
        orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as EnquirySubmission))
    } catch (error) {
      console.error('Error fetching enquiries by type:', error)
      throw error
    }
  }

  // Get enquiries by assigned user
  static async getEnquiriesByAssignee(assignedTo: string): Promise<EnquirySubmission[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('assignedTo', '==', assignedTo),
        orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as EnquirySubmission))
    } catch (error) {
      console.error('Error fetching enquiries by assignee:', error)
      throw error
    }
  }

  // Get enquiries by customer email
  static async getEnquiriesByEmail(email: string): Promise<EnquirySubmission[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('email', '==', email),
        orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as EnquirySubmission))
    } catch (error) {
      console.error('Error fetching enquiries by email:', error)
      throw error
    }
  }

  // Search enquiries
  static async searchEnquiries(searchTerm: string): Promise<EnquirySubmission[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(q)

      const enquiries = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as EnquirySubmission))

      // Filter enquiries that match the search term
      return enquiries.filter(enquiry =>
        enquiry.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enquiry.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enquiry.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enquiry.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    } catch (error) {
      console.error('Error searching enquiries:', error)
      throw error
    }
  }

  // Update enquiry status
  static async updateEnquiryStatus(
    enquiryId: string,
    status: EnquirySubmission['status'],
    assignedTo?: string
  ): Promise<void> {
    try {
      const enquiryRef = doc(db, COLLECTION_NAME, enquiryId)
      const updateData: any = {
        status,
        updatedAt: serverTimestamp()
      }

      if (assignedTo !== undefined) {
        updateData.assignedTo = assignedTo
      }

      await updateDoc(enquiryRef, updateData)
    } catch (error) {
      console.error('Error updating enquiry status:', error)
      throw error
    }
  }

  // Add response to enquiry
  static async addEnquiryResponse(
    enquiryId: string,
    response: Omit<EnquiryResponse, 'id' | 'createdAt'>
  ): Promise<string> {
    try {
      const enquiryRef = doc(db, COLLECTION_NAME, enquiryId)
      const enquiryDoc = await getDoc(enquiryRef)

      if (!enquiryDoc.exists()) {
        throw new Error('Enquiry not found')
      }

      const enquiry = enquiryDoc.data() as EnquirySubmission
      const newResponse: EnquiryResponse = {
        id: `response_${Date.now()}`,
        ...response,
        createdAt: new Date()
      }

      const updatedResponses = [...(enquiry.responses || []), newResponse]

      // Build update data, filtering out undefined values
      const updateData: any = {
        responses: updatedResponses,
        status: 'responded',
        updatedAt: serverTimestamp()
      }

      // Only include attachments if they exist
      if (response.attachments !== undefined) {
        updateData.attachments = response.attachments
      }

      await updateDoc(enquiryRef, updateData)

      return newResponse.id
    } catch (error) {
      console.error('Error adding enquiry response:', error)
      throw error
    }
  }

  // Update enquiry priority
  static async updateEnquiryPriority(enquiryId: string, priority: EnquirySubmission['priority']): Promise<void> {
    try {
      const enquiryRef = doc(db, COLLECTION_NAME, enquiryId)
      await updateDoc(enquiryRef, {
        priority,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error updating enquiry priority:', error)
      throw error
    }
  }

  // Set follow-up date
  static async setFollowUpDate(enquiryId: string, followUpDate: Date): Promise<void> {
    try {
      const enquiryRef = doc(db, COLLECTION_NAME, enquiryId)
      await updateDoc(enquiryRef, {
        followUpDate,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error setting follow-up date:', error)
      throw error
    }
  }

  // Get recent enquiries
  static async getRecentEnquiries(limitCount: number = 10): Promise<EnquirySubmission[]> {
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
      } as EnquirySubmission))
    } catch (error) {
      console.error('Error fetching recent enquiries:', error)
      throw error
    }
  }

  // Get enquiries with pagination
  static async getEnquiriesPaginated(page: number = 1, pageSize: number = 20, filters?: {
    status?: string
    priority?: string
    type?: string
    assignedTo?: string
  }): Promise<{
    enquiries: EnquirySubmission[]
    total: number
    totalPages: number
  }> {
    try {
      let q = query(collection(db, COLLECTION_NAME))

      if (filters?.status) {
        q = query(q, where('status', '==', filters.status))
      }

      if (filters?.priority) {
        q = query(q, where('priority', '==', filters.priority))
      }

      if (filters?.type) {
        q = query(q, where('inquiryType', '==', filters.type))
      }

      if (filters?.assignedTo) {
        q = query(q, where('assignedTo', '==', filters.assignedTo))
      }

      q = query(q, orderBy('createdAt', 'desc'))

      const querySnapshot = await getDocs(q)
      const total = querySnapshot.size
      const totalPages = Math.ceil(total / pageSize)

      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + pageSize
      const paginatedDocs = querySnapshot.docs.slice(startIndex, endIndex)

      const enquiries = paginatedDocs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as EnquirySubmission))

      return {
        enquiries,
        total,
        totalPages
      }
    } catch (error) {
      console.error('Error fetching paginated enquiries:', error)
      throw error
    }
  }

  // Get enquiry statistics
  static async getEnquiryStats(): Promise<{
    totalEnquiries: number
    newEnquiries: number
    inProgressEnquiries: number
    respondedEnquiries: number
    closedEnquiries: number
    enquiriesByType: { [type: string]: number }
    enquiriesByPriority: { [priority: string]: number }
    averageResponseTime: number
  }> {
    try {
      const q = query(collection(db, COLLECTION_NAME))
      const querySnapshot = await getDocs(q)

      const enquiries = querySnapshot.docs.map(doc => doc.data() as EnquirySubmission)
      const totalEnquiries = enquiries.length

      // Count by status
      const newEnquiries = enquiries.filter(e => e.status === 'new').length
      const inProgressEnquiries = enquiries.filter(e => e.status === 'in_progress').length
      const respondedEnquiries = enquiries.filter(e => e.status === 'responded').length
      const closedEnquiries = enquiries.filter(e => e.status === 'closed').length

      // Count by type
      const enquiriesByType: { [type: string]: number } = {}
      enquiries.forEach(enquiry => {
        enquiriesByType[enquiry.inquiryType] = (enquiriesByType[enquiry.inquiryType] || 0) + 1
      })

      // Count by priority
      const enquiriesByPriority: { [priority: string]: number } = {}
      enquiries.forEach(enquiry => {
        enquiriesByPriority[enquiry.priority] = (enquiriesByPriority[enquiry.priority] || 0) + 1
      })

      // Calculate average response time (simplified)
      const respondedEnquiriesWithTime = enquiries.filter(e =>
        e.status === 'responded' && e.responses && e.responses.length > 0
      )

      const averageResponseTime = respondedEnquiriesWithTime.length > 0
        ? respondedEnquiriesWithTime.reduce((sum, enquiry) => {
            const firstResponse = enquiry.responses![0]
            const responseTime = new Date(firstResponse.createdAt).getTime() - enquiry.createdAt.getTime()
            return sum + responseTime
          }, 0) / respondedEnquiriesWithTime.length / (1000 * 60 * 60) // Convert to hours
        : 0

      return {
        totalEnquiries,
        newEnquiries,
        inProgressEnquiries,
        respondedEnquiries,
        closedEnquiries,
        enquiriesByType,
        enquiriesByPriority,
        averageResponseTime
      }
    } catch (error) {
      console.error('Error fetching enquiry statistics:', error)
      throw error
    }
  }

  // Bulk update enquiry status
  static async bulkUpdateStatus(enquiryIds: string[], status: EnquirySubmission['status']): Promise<void> {
    try {
      const updatePromises = enquiryIds.map(enquiryId =>
        updateDoc(doc(db, COLLECTION_NAME, enquiryId), {
          status,
          updatedAt: serverTimestamp()
        })
      )
      await Promise.all(updatePromises)
    } catch (error) {
      console.error('Error bulk updating enquiries:', error)
      throw error
    }
  }
}