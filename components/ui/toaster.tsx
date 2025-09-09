import * as React from "react"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-4 sm:right-4 sm:w-[420px] gap-2">
      {toasts.map(function ({ id, title, description, action, variant = "default" }) {
        const variantClass = variant === "destructive"
          ? "border-destructive/50 text-destructive"
          : "border border-border"
        return (
          <div key={id} className={cn("group pointer-events-auto relative flex items-start justify-between space-x-3 overflow-hidden rounded-md bg-background p-4 pr-2 shadow-lg transition-all border", variantClass)}>
            <div className="grid gap-1">
              {title && <div className="text-sm font-semibold">{title}</div>}
              {description && <div className="text-sm text-muted-foreground">{description}</div>}
            </div>
            {action}
            <button aria-label="Close" className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground" onClick={() => id && dismiss(String(id))}>✕</button>
          </div>
        )
      })}
    </div>
  )
}

