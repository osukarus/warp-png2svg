"use client";
import * as React from "react"
import { createContext, useContext, useMemo, useState } from "react"
import type { ComponentProps } from "react"

let count = 0

export type ToastProps = ComponentProps<"div"> & {
  id?: string
  title?: string
  description?: string
  action?: React.ReactNode
  duration?: number
  variant?: "default" | "destructive"
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within ToastProvider")
  return ctx
}

const ToastContext = createContext<{
  toasts: ToastProps[]
  toast: (props: Omit<ToastProps, "id">) => void
  dismiss: (id: string) => void
} | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const api = useMemo(() => ({
    toasts,
    toast: ({ duration = 3000, ...props }: Omit<ToastProps, "id">) => {
      const id = `${Date.now()}-${count++}`
      const t: ToastProps = { id, ...props }
      setToasts((prev) => [t, ...prev])
      // Auto-dismiss
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== id))
      }, duration)
    },
    dismiss: (id: string) => setToasts((prev) => prev.filter((x) => x.id !== id)),
  }), [toasts])

  return (
    <ToastContext.Provider value={api}>{children}</ToastContext.Provider>
  )
}

