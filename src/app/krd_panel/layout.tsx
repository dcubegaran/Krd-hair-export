"use client"

import type React from "react"

import { AuthProvider } from "@/lib/auth_context"
import { AdminAuthGuard } from "@/components/admin_auth_guard"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <AdminAuthGuard>{children}</AdminAuthGuard>
    </AuthProvider>
  )
}
