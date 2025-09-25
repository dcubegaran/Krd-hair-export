import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase'
import type { User as UserType } from '../types/database'

export class AuthService {
  // Sign in with email and password
  static async signIn(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return userCredential.user
    } catch (error: any) {
      console.error('Error signing in:', error)
      throw new Error(this.getAuthErrorMessage(error.code))
    }
  }

  // Sign up with email and password
  static async signUp(email: string, password: string, userData: Partial<UserType>): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Create user profile in Firestore
      const userProfile: Omit<UserType, 'id'> = {
        email: user.email!,
        displayName: userData.displayName || '',
        role: userData.role || 'customer',
        phone: userData.phone || '',
        isActive: true,
        createdAt: serverTimestamp() as any,
        updatedAt: serverTimestamp() as any
      }

      await setDoc(doc(db, 'users', user.uid), userProfile)

      // Update the auth profile
      if (userData.displayName) {
        await updateProfile(user, {
          displayName: userData.displayName
        })
      }

      return user
    } catch (error: any) {
      console.error('Error signing up:', error)
      throw new Error(this.getAuthErrorMessage(error.code))
    }
  }

  // Sign out
  static async signOutUser(): Promise<void> {
    try {
      await signOut(auth)
    } catch (error: any) {
      console.error('Error signing out:', error)
      throw new Error(this.getAuthErrorMessage(error.code))
    }
  }

  // Send password reset email
  static async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error: any) {
      console.error('Error sending password reset email:', error)
      throw new Error(this.getAuthErrorMessage(error.code))
    }
  }

  // Get user role from Firestore
  static async getUserRole(userId: string): Promise<string | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId))
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserType
        return userData.role || null
      }
      return null
    } catch (error) {
      console.error('Error fetching user role:', error)
      throw error
    }
  }

  // Get user profile from Firestore
  static async getUserProfile(userId: string): Promise<UserType | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId))
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() } as UserType
      }
      return null
    } catch (error) {
      console.error('Error fetching user profile:', error)
      throw error
    }
  }

  // Update user profile
  static async updateUserProfile(userId: string, updates: Partial<UserType>): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId)
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error updating user profile:', error)
      throw error
    }
  }

  // Change password (requires current password)
  static async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = auth.currentUser
      if (!user || !user.email) {
        throw new Error('No authenticated user')
      }

      const credential = EmailAuthProvider.credential(user.email, currentPassword)
      await reauthenticateWithCredential(user, credential)
      await updatePassword(user, newPassword)
    } catch (error: any) {
      console.error('Error changing password:', error)
      throw new Error(this.getAuthErrorMessage(error.code))
    }
  }

  // Get current user with role
  static async getCurrentUserWithRole(): Promise<{ user: User; role: string } | null> {
    try {
      const user = auth.currentUser
      if (!user) return null

      const role = await this.getUserRole(user.uid)
      return { user, role: role || 'customer' }
    } catch (error) {
      console.error('Error getting current user with role:', error)
      return null
    }
  }

  // Check if user has required role
  static async hasRole(requiredRole: string): Promise<boolean> {
    try {
      const user = auth.currentUser
      if (!user) return false

      const userRole = await this.getUserRole(user.uid)
      const roleHierarchy = { customer: 1, staff: 2, admin: 3 }
      const userRoleLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0
      const requiredRoleLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0

      return userRoleLevel >= requiredRoleLevel
    } catch (error) {
      console.error('Error checking user role:', error)
      return false
    }
  }

  // Get user-friendly error messages
  private static getAuthErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email address'
      case 'auth/wrong-password':
        return 'Incorrect password'
      case 'auth/email-already-in-use':
        return 'An account with this email already exists'
      case 'auth/weak-password':
        return 'Password should be at least 6 characters'
      case 'auth/invalid-email':
        return 'Invalid email address'
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later'
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection'
      default:
        return 'An error occurred. Please try again'
    }
  }
}