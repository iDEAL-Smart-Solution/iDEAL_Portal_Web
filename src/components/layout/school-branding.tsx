import { resolveMediaUrl, cn } from "@/lib/utils"

export type SchoolBrandingSource = {
  schoolName?: string | null
  schoolLogo?: string | null
  schoolLogoFilePath?: string | null
}

type BrandingPayload = {
  name?: string | null
  logo?: string | null
}

const BRANDING_STORAGE_KEYS = ["schoolInfo", "currentBranding"]

// Use the app-wide resolver so URLs are normalized consistently

function readStoredBranding(): BrandingPayload {
  if (typeof window === "undefined") {
    return {}
  }

  for (const key of BRANDING_STORAGE_KEYS) {
    const rawValue = window.sessionStorage.getItem(key)
    if (!rawValue) continue

    try {
      const parsed = JSON.parse(rawValue)
      const name = parsed?.name || parsed?.schoolName || parsed?.SchoolName || parsed?.school?.name || parsed?.school?.SchoolName
      const logo = parsed?.logo || parsed?.schoolLogo || parsed?.schoolLogoFilePath || parsed?.SchoolLogoFilePath || parsed?.school?.logo || parsed?.school?.LogoFilePath

      if (name || logo) {
        return { name, logo }
      }
    } catch {
      continue
    }
  }

  return {
    name: window.sessionStorage.getItem("SchoolName"),
    logo: window.sessionStorage.getItem("SchoolLogo"),
  }
}

export function resolveSchoolBranding(source?: SchoolBrandingSource | null) {
  const storedBranding = readStoredBranding()

  const schoolName =
    source?.schoolName?.trim() ||
    storedBranding.name?.trim() ||
    "School Portal"

  const logoCandidateRaw =
    source?.schoolLogo ||
    source?.schoolLogoFilePath ||
    storedBranding.logo ||
    null

  const logoCandidate = logoCandidateRaw ? String(logoCandidateRaw).trim() : null

  return {
    schoolName,
    schoolLogoUrl: logoCandidate ? resolveMediaUrl(logoCandidate) : null,
  }
}

interface SchoolBrandHeaderProps {
  schoolName: string
  schoolLogoUrl: string | null
  subtitle: string
  compact?: boolean
  className?: string
}

export function SchoolBrandHeader({
  schoolName,
  schoolLogoUrl,
  subtitle,
  compact = false,
  className,
}: SchoolBrandHeaderProps) {
  const initials = schoolName.trim().charAt(0).toUpperCase() || "S"

  return (
    <div
      className={cn(
        "rounded-2xl border border-neutral-200/80 bg-gradient-to-br from-white via-white to-primary-50/70 shadow-sm",
        compact ? "p-3" : "p-4",
        className,
      )}
    >
      <div className={cn("flex items-center gap-3", compact && "gap-2") }>
        <div
          className={cn(
            "flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-sm",
            compact ? "h-10 w-10 rounded-xl" : "h-12 w-12",
          )}
        >
          {schoolLogoUrl ? (
            <img
              src={schoolLogoUrl}
              alt={schoolName}
              className="h-full w-full object-contain p-1"
            />
          ) : (
            <span className="text-sm font-semibold text-primary-700">{initials}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h1 className={cn("truncate font-semibold text-text-primary", compact ? "text-sm" : "text-base")}>
            {schoolName}
          </h1>
          <p className="truncate text-xs text-text-tertiary mt-1">{subtitle}</p>
        </div>
      </div>
    </div>
  )
}

export function getBrandingSubtitle(role?: string): string {
  if (!role) return "Portal access"

  const normalizedRole = role.replace("_", " ")
  return `${normalizedRole.charAt(0).toUpperCase()}${normalizedRole.slice(1)} Portal`
}
