"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "firebase/auth"
import { auth } from "./firebase"
import { onAuthStateChanged } from "firebase/auth"
import { AuthService } from "./services/authService"

interface AuthContextType {
  user: User | null
  userRole: string | null
  loading: boolean
  userProfile: any | null
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userRole: null,
  loading: true,
  userProfile: null,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for test admin user first
    const testAdminUser = localStorage.getItem('testAdminUser')
    const testAdminRole = localStorage.getItem('testAdminRole')

    if (testAdminUser && testAdminRole) {
      const user = JSON.parse(testAdminUser)
      setUser(user)
      setUserRole(testAdminRole)
      setUserProfile(null)
      setLoading(false)
      return
    }

    // Listen for custom auth state changes
    const handleAuthStateChanged = (event: any) => {
      const { user, role } = event.detail
      if (user && role) {
        setUser(user)
        setUserRole(role)
        setUserProfile(null)
        setLoading(false)
      }
    }

    window.addEventListener('authStateChanged', handleAuthStateChanged)

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      if (user) {
        try {
          // Fetch user role and profile from Firestore
          const role = await AuthService.getUserRole(user.uid)
          const profile = await AuthService.getUserProfile(user.uid)

          setUserRole(role)
          setUserProfile(profile)
        } catch (error) {
          console.error('Error fetching user data:', error)
          // Fallback to email-based role detection
          const email = user.email
          if (email?.includes("admin")) {
            setUserRole("admin")
          } else if (email?.includes("staff")) {
            setUserRole("staff")
          } else {
            setUserRole("customer")
          }
          setUserProfile(null)
        }
      } else {
        setUserRole(null)
        setUserProfile(null)
      }

      setLoading(false)
    })

    return () => {
      window.removeEventListener('authStateChanged', handleAuthStateChanged)
      if (unsubscribe) unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, userRole, loading, userProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
