import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { AuthState, LoginCredentials, RegisterData } from "@/types"
import axiosInstance from "@/services/api"
import { showError } from "@/lib/notifications"

const PORTAL_ALLOWED_ROLES = new Set(["student", "parent", "staff", "aspirant"])

const normalizeRole = (role?: string) => role?.trim().toLowerCase() ?? ""

const isAllowedPortalRole = (role?: string) => PORTAL_ALLOWED_ROLES.has(normalizeRole(role))

const ACCESS_DENIED_MESSAGE =
  "Access denied. Your account role does not have access to this portal."

interface AuthStore extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  clearError: () => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null })
        try {
          const response = await axiosInstance.post("/Auth/login", {
            uin: credentials.uin, 
            password: credentials.password
          })
          
          if (response.data.success && response.data.data) {
            const { user, token } = response.data.data
            const normalizedRole = normalizeRole(user.role)

            if (!isAllowedPortalRole(normalizedRole)) {
              sessionStorage.removeItem("token")
              sessionStorage.removeItem("SchoolId")
              sessionStorage.removeItem("auth-storage")

              set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: ACCESS_DENIED_MESSAGE,
              })

              showError(ACCESS_DENIED_MESSAGE)

              return
            }
            
            sessionStorage.setItem("token", token)
            sessionStorage.setItem("SchoolId", user.schoolId)
            
            set({
              user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                name: `${user.firstName} ${user.lastName}`,
                role: normalizedRole,
                schoolId: user.schoolId,
                avatar: user.profilePicture,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                ...(user.classId && { classId: user.classId }) // Include classId for students
              },
              isAuthenticated: true,
              isLoading: false,
              error: null,
            })
          } else {
            set({
              error: response.data.message || "Login failed",
              isLoading: false,
            })

            showError(response.data.message || "Login failed")
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || "Login failed"
          set({
            error: errorMessage,
            isLoading: false,
          })

          showError(errorMessage)
        }
      },

      register: async () => {
        set({ isLoading: true, error: null })
        try {
          throw new Error("Registration endpoint not yet integrated. Please use the Aspirant Application form.")
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || "Registration failed"
          set({
            error: errorMessage,
            isLoading: false,
          })

          showError(errorMessage)
        }
      },

      logout: () => {
        sessionStorage.removeItem("token")
        sessionStorage.removeItem("SchoolId")
        sessionStorage.removeItem("auth-storage")
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        })
      },

      clearError: () => set({ error: null }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => sessionStorage),
      onRehydrateStorage: () => (state) => {
        if (!state?.user) {
          return
        }

        if (!isAllowedPortalRole(state.user.role)) {
          sessionStorage.removeItem("token")
          sessionStorage.removeItem("SchoolId")
          sessionStorage.removeItem("auth-storage")
          state.logout()
        }
      },
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
