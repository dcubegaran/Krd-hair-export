"use client"

import type React from "react"

import { useState } from "react"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Lock } from "lucide-react"
import { useRouter } from "next/navigation"

export function AdminLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Check for test credentials
    if (email === "admin@krdexports.com" && password === "admin123") {
      // For testing purposes, create a mock user object
      const mockUser = {
        uid: "test-admin-uid",
        email: "admin@krdexports.com",
        displayName: "Test Admin"
      }

      // Store mock user in localStorage for testing
      localStorage.setItem('testAdminUser', JSON.stringify(mockUser))
      localStorage.setItem('testAdminRole', 'admin')

      // Trigger auth state change by dispatching a custom event
      window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { user: mockUser, role: 'admin' } }))

      // Redirect to admin panel after successful test login
      setTimeout(() => {
        router.push('/krd_panel')
      }, 100)

      setLoading(false)
      return
    }

    try {
      await signInWithEmailAndPassword(auth, email, password)
      // Redirect to admin panel after successful Firebase login
      router.push('/krd_panel')
    } catch (error: any) {
      setError("Invalid credentials. Access denied.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">KRD Admin Panel</CardTitle>
          <CardDescription>Secure access for authorized personnel only</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@krdexports.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter secure password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Authenticating..." : "Access Panel"}
            </Button>
          </form>
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              Demo Admin Access:
              <br />
              <code className="text-xs">admin@krdexports.com</code>
              <br />
              <code className="text-xs">admin123</code>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
