"use client"

import { LoadingSpinner } from "./loading-spinner"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface EnhancedLoadingProps {
  type?: "spinner" | "skeleton" | "card"
  size?: "sm" | "md" | "lg"
  rows?: number
  className?: string
}

export function EnhancedLoading({ type = "spinner", size = "md", rows = 3, className = "" }: EnhancedLoadingProps) {
  if (type === "spinner") {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <LoadingSpinner size={size} />
      </div>
    )
  }

  if (type === "skeleton") {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    )
  }

  if (type === "card") {
    return (
      <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-3 ${className}`}>
        {Array.from({ length: rows }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return null
}
