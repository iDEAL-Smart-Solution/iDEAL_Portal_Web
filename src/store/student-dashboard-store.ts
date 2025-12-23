import { create } from "zustand"
import type { StudentDashboardResponse } from "@/types"
import axiosInstance from "@/services/api"

interface StudentDashboardState {
  dashboard: StudentDashboardResponse | null
  isLoading: boolean
  error: string | null
}

interface StudentDashboardStore extends StudentDashboardState {
  fetchDashboard: (studentId: string) => Promise<void>
  clearError: () => void
}

export const useStudentDashboardStore = create<StudentDashboardStore>((set) => ({
  dashboard: null,
  isLoading: false,
  error: null,

  fetchDashboard: async (studentId: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axiosInstance.get(`/Student/dashboard?studentId=${studentId}`)
      
      if (response.data.statusCode === 200 && response.data.data) {
        set({ dashboard: response.data.data, isLoading: false })
      } else {
        set({ error: response.data.message || "Failed to fetch dashboard", isLoading: false })
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || "Failed to fetch dashboard data", 
        isLoading: false 
      })
    }
  },

  clearError: () => set({ error: null }),
}))
