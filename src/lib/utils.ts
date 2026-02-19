import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { BASE_URL } from "@/services/api"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = "NGN"): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
  }).format(amount)
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  }).format(dateObj)
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(":")
  const hour = Number.parseInt(hours, 10)
  const ampm = hour >= 12 ? "PM" : "AM"
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

export function getGradeColor(grade: string): string {
  switch (grade.toUpperCase()) {
    case "A":
      return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900"
    case "B":
      return "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900"
    case "C":
      return "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900"
    case "D":
      return "text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900"
    case "F":
      return "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900"
    default:
      return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900"
  }
}

export function resolveMediaUrl(path?: string | null): string {
  if (!path) return "/placeholder.svg"
  if (/^https?:\/\//i.test(path)) return path
  const apiOrigin = BASE_URL.replace(/\/api\/?$/i, "")
  if (path.startsWith("/")) return `${apiOrigin}${path}`
  return `${apiOrigin}/${path}`
}
