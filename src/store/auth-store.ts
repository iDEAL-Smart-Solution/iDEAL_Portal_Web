import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { AuthState, LoginCredentials, RegisterData } from "@/types"
import axiosInstance from "@/services/api"

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
            
            sessionStorage.setItem("token", token)
            sessionStorage.setItem("SchoolId", user.schoolId)
            
            set({
              user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                name: `${user.firstName} ${user.lastName}`,
                role: user.role.toLowerCase(),
                schoolId: user.schoolId,
                avatar: user.profilePicture,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
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
          }
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Login failed",
            isLoading: false,
          })
        }
      },

      register: async () => {
        set({ isLoading: true, error: null })
        try {
          throw new Error("Registration endpoint not yet integrated. Please use the Aspirant Application form.")
        } catch (error: any) {
          set({
            error: error.response?.data?.message || error.message || "Registration failed",
            isLoading: false,
          })
        }
      },

      logout: () => {
        sessionStorage.removeItem("token")
        sessionStorage.removeItem("SchoolId")
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
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
