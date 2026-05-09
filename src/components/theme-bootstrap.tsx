import { useEffect } from 'react'
import { useAuthStore } from '@/store'
import axiosInstance from '@/services/api'
import { applyThemeColor, DEFAULT_PRIMARY_COLOR, extractThemeColor } from '@/lib/theme'

const SCHOOL_INFO_STORAGE_KEY = 'schoolInfo'
const SCHOOL_NAME_STORAGE_KEY = 'SchoolName'
const SCHOOL_LOGO_STORAGE_KEY = 'SchoolLogo'

const normalizeCurrentSessionBranding = (payload: any) => {
  const data = payload?.data?.data ?? payload?.data ?? payload

  return {
    schoolName:
      data?.schoolName ??
      data?.SchoolName ??
      data?.name ??
      data?.school?.name ??
      data?.school?.SchoolName ??
      null,
    schoolLogo:
      data?.schoolLogoFilePath ??
      data?.SchoolLogoFilePath ??
      data?.schoolLogo ??
      data?.logo ??
      data?.school?.logo ??
      data?.school?.LogoFilePath ??
      null,
  }
}

const persistSchoolBranding = (schoolName?: string | null, schoolLogo?: string | null) => {
  if (typeof window === 'undefined') return

  if (schoolName) {
    sessionStorage.setItem(SCHOOL_NAME_STORAGE_KEY, schoolName)
  } else {
    sessionStorage.removeItem(SCHOOL_NAME_STORAGE_KEY)
  }

  if (schoolLogo) {
    sessionStorage.setItem(SCHOOL_LOGO_STORAGE_KEY, schoolLogo)
  } else {
    sessionStorage.removeItem(SCHOOL_LOGO_STORAGE_KEY)
  }

  sessionStorage.setItem(
    SCHOOL_INFO_STORAGE_KEY,
    JSON.stringify({
      name: schoolName || null,
      logo: schoolLogo || null,
    }),
  )
}

export function ThemeBootstrap() {
  const { isAuthenticated, user } = useAuthStore()

  useEffect(() => {
    applyThemeColor(DEFAULT_PRIMARY_COLOR)
  }, [])

  useEffect(() => {
    let isActive = true

    const updateTheme = async () => {
      try {
        const schoolId = user?.schoolId || sessionStorage.getItem('SchoolId')

        if (!schoolId) {
          return
        }

        const response = await axiosInstance.get('/AcademicSession/get-current-session')
        const themeColor = extractThemeColor(response.data)
        const branding = normalizeCurrentSessionBranding(response.data)

        if (isActive && themeColor) {
          applyThemeColor(themeColor)
        }

        if (isActive && (branding.schoolName || branding.schoolLogo)) {
          persistSchoolBranding(branding.schoolName, branding.schoolLogo)
          useAuthStore.setState((state) => ({
            user: state.user
              ? {
                  ...state.user,
                  ...(branding.schoolName ? { schoolName: branding.schoolName } : {}),
                  ...(branding.schoolLogo ? { schoolLogo: branding.schoolLogo } : {}),
                }
              : state.user,
          }))
        }
      } catch {
        if (isActive) {
          applyThemeColor(DEFAULT_PRIMARY_COLOR)
        }
      }
    }

    updateTheme()

    return () => {
      isActive = false
    }
  }, [isAuthenticated, user?.schoolId])

  return null
}
