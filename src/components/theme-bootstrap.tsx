import { useEffect } from 'react'
import { useAuthStore } from '@/store'
import axiosInstance from '@/services/api'
import { applyThemeColor, DEFAULT_PRIMARY_COLOR, extractThemeColor } from '@/lib/theme'

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

        if (isActive && themeColor) {
          applyThemeColor(themeColor)
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
