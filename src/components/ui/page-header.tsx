import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
  action?: ReactNode
  showBackButton?: boolean
  backHref?: string
}

export function PageHeader({ title, description, actions, action, showBackButton = false, backHref }: PageHeaderProps) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (backHref) {
      navigate(backHref)
    } else {
      navigate(-1)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div className="flex items-center gap-4">
        {showBackButton && (
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <div>
          <h1 className="text-2xl font-bold text-primary-500">{title}</h1>
          {description && <p className="text-muted-foreground mt-1">{description}</p>}
        </div>
      </div>
      {(actions || action) && <div className="flex items-center gap-2">{actions || action}</div>}
    </div>
  )
}
