"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth_context"
import { AdminLogin } from "@/components/admin_login"

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const { user, userRole, loading } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user || userRole !== "admin") {
    return <AdminLogin />
  }

  return <>{children}</>
}
