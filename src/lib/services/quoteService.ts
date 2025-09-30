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
import type { QuoteRequest, QuoteProduct } from '../types/database'

const COLLECTION_NAME = 'quotes'

export class QuoteService {
  // Create new quote request
  static async createQuote(quoteData: Omit<QuoteRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = serverTimestamp()

      // Filter out undefined values to prevent Firestore errors
      const filteredQuoteData = Object.fromEntries(
        Object.entries(quoteData).filter(([_, value]) => value !== undefined)
      )

      const newQuote = {
        ...filteredQuoteData,
        createdAt: now,
        updatedAt: now
      }
      const docRef = await addDoc(collection(db, COLLECTION_NAME), newQuote)
      return docRef.id
    } catch (error: any) {
      console.error('Error creating quote:', error)
      
      // Handle quota exceeded error specifically
      if (error?.code === 'resource-exhausted') {
        // Save quote data locally as fallback
        const localQuoteId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const localQuote = {
          id: localQuoteId,
          ...quoteData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isLocalOnly: true
        }
        
        // Store in localStorage for later sync
        const existingLocalQuotes = JSON.parse(localStorage.getItem('pendingQuotes') || '[]')
        existingLocalQuotes.push(localQuote)
        localStorage.setItem('pendingQuotes', JSON.stringify(existingLocalQuotes))
        
        console.log('Quote saved locally due to quota limit:', localQuoteId)
        throw new Error(`Firebase quota exceeded. Your quote has been saved locally (ID: ${localQuoteId}) and will be synced when quota resets. Please contact support if this persists.`)
      }
      
      throw error
    }
  }

  // Get quote by ID
  static async getQuoteById(quoteId: string): Promise<QuoteRequest | null> {
    try {
      const quoteDoc = await getDoc(doc(db, COLLECTION_NAME, quoteId))
      if (quoteDoc.exists()) {
        return { id: quoteDoc.id, ...quoteDoc.data() } as QuoteRequest
      }
      return null
    } catch (error) {
      console.error('Error fetching quote:', error)
      throw error
    }
  }

  // Get quotes by status
  static async getQuotesByStatus(status: string): Promise<QuoteRequest[]> {
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
      } as QuoteRequest))
    } catch (error) {
      console.error('Error fetching quotes by status:', error)
      throw error
    }
  }

  // Get quotes by priority
  static async getQuotesByPriority(priority: string): Promise<QuoteRequest[]> {
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
      } as QuoteRequest))
    } catch (error) {
      console.error('Error fetching quotes by priority:', error)
      throw error
    }
  }

  // Get quotes by business type
  static async getQuotesByBusinessType(businessType: string): Promise<QuoteRequest[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('businessType', '==', businessType),
        orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as QuoteRequest))
    } catch (error) {
      console.error('Error fetching quotes by business type:', error)
      throw error
    }
  }

  // Get quotes by assigned user
  static async getQuotesByAssignee(assignedTo: string): Promise<QuoteRequest[]> {
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
      } as QuoteRequest))
    } catch (error) {
      console.error('Error fetching quotes by assignee:', error)
      throw error
    }
  }

  // Get quotes by customer email
  static async getQuotesByEmail(email: string): Promise<QuoteRequest[]> {
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
      } as QuoteRequest))
    } catch (error) {
      console.error('Error fetching quotes by email:', error)
      throw error
    }
  }

  // Update quote status
  static async updateQuoteStatus(
    quoteId: string,
    status: QuoteRequest['status'],
    updates?: Partial<QuoteRequest>
  ): Promise<void> {
    try {
      const quoteRef = doc(db, COLLECTION_NAME, quoteId)
      const updateData: any = {
        status,
        updatedAt: serverTimestamp()
      }

      if (updates) {
        // Filter out undefined values from updates
        const filteredUpdates = Object.fromEntries(
          Object.entries(updates).filter(([_, value]) => value !== undefined)
        )
        Object.assign(updateData, filteredUpdates)
      }

      await updateDoc(quoteRef, updateData)
    } catch (error) {
      console.error('Error updating quote status:', error)
      throw error
    }
  }

  // Add quote response
  static async addQuoteResponse(
    quoteId: string,
    quotedPrice: number,
    quotedCurrency: string,
    validUntil: Date,
    termsAndConditions?: string,
    notes?: string
  ): Promise<void> {
    try {
      const quoteRef = doc(db, COLLECTION_NAME, quoteId)

      // Build update data, filtering out undefined values
      const updateData: any = {
        quotedPrice,
        quotedCurrency,
        validUntil,
        status: 'quoted',
        updatedAt: serverTimestamp()
      }

      if (termsAndConditions !== undefined) {
        updateData.termsAndConditions = termsAndConditions
      }

      if (notes !== undefined) {
        updateData.notes = notes
      }

      await updateDoc(quoteRef, updateData)
    } catch (error) {
      console.error('Error adding quote response:', error)
      throw error
    }
  }

  // Update quote assignment
  static async updateQuoteAssignment(quoteId: string, assignedTo: string, salesRep?: string): Promise<void> {
    try {
      const quoteRef = doc(db, COLLECTION_NAME, quoteId)

      // Build update data, filtering out undefined values
      const updateData: any = {
        assignedTo,
        updatedAt: serverTimestamp()
      }

      if (salesRep !== undefined) {
        updateData.salesRep = salesRep
      }

      await updateDoc(quoteRef, updateData)
    } catch (error) {
      console.error('Error updating quote assignment:', error)
      throw error
    }
  }

  // Update lead score
  static async updateLeadScore(quoteId: string, leadScore: number): Promise<void> {
    try {
      const quoteRef = doc(db, COLLECTION_NAME, quoteId)
      await updateDoc(quoteRef, {
        leadScore,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error updating lead score:', error)
      throw error
    }
  }

  // Get all quotes
  static async getAllQuotes(): Promise<QuoteRequest[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as QuoteRequest))
    } catch (error) {
      console.error('Error fetching all quotes:', error)
      throw error
    }
  }

  // Get recent quotes
  static async getRecentQuotes(limitCount: number = 10): Promise<QuoteRequest[]> {
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
      } as QuoteRequest))
    } catch (error) {
      console.error('Error fetching recent quotes:', error)
      throw error
    }
  }

  // Get quotes with pagination
  static async getQuotesPaginated(page: number = 1, pageSize: number = 20, filters?: {
    status?: string
    priority?: string
    businessType?: string
    assignedTo?: string
    dateFrom?: Date
    dateTo?: Date
  }): Promise<{
    quotes: QuoteRequest[]
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

      if (filters?.businessType) {
        q = query(q, where('businessType', '==', filters.businessType))
      }

      if (filters?.assignedTo) {
        q = query(q, where('assignedTo', '==', filters.assignedTo))
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

      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + pageSize
      const paginatedDocs = querySnapshot.docs.slice(startIndex, endIndex)

      const quotes = paginatedDocs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as QuoteRequest))

      return {
        quotes,
        total,
        totalPages
      }
    } catch (error) {
      console.error('Error fetching paginated quotes:', error)
      throw error
    }
  }

  // Get quote statistics
  static async getQuoteStats(): Promise<{
    totalQuotes: number
    submittedQuotes: number
    quotedQuotes: number
    approvedQuotes: number
    rejectedQuotes: number
    conversionRate: number
    averageQuoteValue: number
    quotesByStatus: { [status: string]: number }
    quotesByBusinessType: { [type: string]: number }
    quotesByPriority: { [priority: string]: number }
    monthlyQuotes: { [month: string]: number }
  }> {
    try {
      const q = query(collection(db, COLLECTION_NAME))
      const querySnapshot = await getDocs(q)

      const quotes = querySnapshot.docs.map(doc => doc.data() as QuoteRequest)
      const totalQuotes = quotes.length

      // Count by status
      const submittedQuotes = quotes.filter(q => q.status === 'submitted').length
      const quotedQuotes = quotes.filter(q => q.status === 'quoted').length
      const approvedQuotes = quotes.filter(q => q.status === 'approved').length
      const rejectedQuotes = quotes.filter(q => q.status === 'rejected').length

      // Calculate conversion rate (quoted / submitted)
      const conversionRate = submittedQuotes > 0 ? (quotedQuotes / submittedQuotes) * 100 : 0

      // Calculate average quote value
      const totalValue = quotes.reduce((sum, quote) => sum + (quote.totalValue || 0), 0)
      const averageQuoteValue = totalQuotes > 0 ? totalValue / totalQuotes : 0

      // Count by status
      const quotesByStatus: { [status: string]: number } = {}
      quotes.forEach(quote => {
        quotesByStatus[quote.status] = (quotesByStatus[quote.status] || 0) + 1
      })

      // Count by business type
      const quotesByBusinessType: { [type: string]: number } = {}
      quotes.forEach(quote => {
        quotesByBusinessType[quote.businessType] = (quotesByBusinessType[quote.businessType] || 0) + 1
      })

      // Count by priority
      const quotesByPriority: { [priority: string]: number } = {}
      quotes.forEach(quote => {
        quotesByPriority[quote.priority] = (quotesByPriority[quote.priority] || 0) + 1
      })

      // Monthly quotes (simplified - group by month)
      const monthlyQuotes: { [month: string]: number } = {}
      quotes.forEach(quote => {
        const month = quote.createdAt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        monthlyQuotes[month] = (monthlyQuotes[month] || 0) + 1
      })

      return {
        totalQuotes,
        submittedQuotes,
        quotedQuotes,
        approvedQuotes,
        rejectedQuotes,
        conversionRate,
        averageQuoteValue,
        quotesByStatus,
        quotesByBusinessType,
        quotesByPriority,
        monthlyQuotes
      }
    } catch (error) {
      console.error('Error fetching quote statistics:', error)
      throw error
    }
  }

  // Calculate quote totals
  static calculateQuoteTotals(products: QuoteProduct[]): { totalQuantity: number; totalValue: number } {
    const totalQuantity = products.reduce((sum, product) => sum + product.quantity, 0)
    const totalValue = products.reduce((sum, product) => sum + product.totalPrice, 0)

    return { totalQuantity, totalValue }
  }

  // Validate quote data
  static validateQuoteData(quoteData: Partial<QuoteRequest>): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!quoteData.customerName?.trim()) {
      errors.push('Customer name is required')
    }

    if (!quoteData.email?.trim()) {
      errors.push('Email is required')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(quoteData.email)) {
      errors.push('Valid email is required')
    }

    if (!quoteData.phone?.trim()) {
      errors.push('Phone number is required')
    }

    if (!quoteData.companyName?.trim()) {
      errors.push('Company name is required')
    }

    if (!quoteData.products || quoteData.products.length === 0) {
      errors.push('At least one product must be selected')
    }

    if (!quoteData.minimumOrderQuantity || quoteData.minimumOrderQuantity <= 0) {
      errors.push('Minimum order quantity must be greater than 0')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Sync pending local quotes to Firestore when quota is available
  static async syncPendingQuotes(): Promise<{ synced: number; failed: number }> {
    try {
      const pendingQuotes = JSON.parse(localStorage.getItem('pendingQuotes') || '[]')
      if (pendingQuotes.length === 0) {
        return { synced: 0, failed: 0 }
      }

      let synced = 0
      let failed = 0
      const remainingQuotes = []

      for (const localQuote of pendingQuotes) {
        try {
          // Remove local-only fields
          const { id, isLocalOnly, ...quoteData } = localQuote
          
          // Try to create in Firestore
          const newQuoteId = await this.createQuote(quoteData)
          console.log(`Synced local quote ${id} to Firestore as ${newQuoteId}`)
          synced++
        } catch (error: any) {
          console.error(`Failed to sync quote ${localQuote.id}:`, error)
          if (error?.code === 'resource-exhausted') {
            // Still quota issues, keep in local storage
            remainingQuotes.push(localQuote)
          }
          failed++
        }
      }

      // Update localStorage with remaining quotes
      localStorage.setItem('pendingQuotes', JSON.stringify(remainingQuotes))
      
      return { synced, failed }
    } catch (error) {
      console.error('Error syncing pending quotes:', error)
      return { synced: 0, failed: 0 }
    }
  }

  // Get pending local quotes count
  static getPendingQuotesCount(): number {
    try {
      const pendingQuotes = JSON.parse(localStorage.getItem('pendingQuotes') || '[]')
      return pendingQuotes.length
    } catch {
      return 0
    }
  }
}