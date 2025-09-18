import { EnhancedLoading } from "@/components/ui/enhanced-loading"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <EnhancedLoading type="spinner" size="lg" className="min-h-screen" />
    </div>
  )
}
