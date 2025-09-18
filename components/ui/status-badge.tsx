import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: "active" | "inactive" | "pending" | "completed" | "failed" | "suspended"
  className?: string
}

const statusConfig = {
  active: { label: "Active", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
  inactive: { label: "Inactive", className: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300" },
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" },
  completed: { label: "Completed", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
  failed: { label: "Failed", className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" },
  suspended: { label: "Suspended", className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <Badge className={cn(config.className, className)} variant="secondary">
      {config.label}
    </Badge>
  )
}
