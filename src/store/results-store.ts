import { create } from "zustand"
import type { Result } from "@/types"
import axiosInstance from "@/services/api"

interface ResultsState {
  results: Result[]
  isLoading: boolean
  error: string | null
}

interface ResultsStore extends ResultsState {
  fetchResults: (studentId: string) => Promise<void>
  clearError: () => void
}

export const useResultsStore = create<ResultsStore>((set) => ({
  results: [],
  isLoading: false,
  error: null,

  fetchResults: async (studentId: string) => {
    set({ isLoading: true, error: null })
    try {
      // TODO: Integrate with backend Result API
      // const response = await axiosInstance.get(`/Result/get-student-results?studentId=${studentId}`)
      // set({ results: response.data.data, isLoading: false })
      throw new Error("Result API integration pending")
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Failed to fetch results", isLoading: false })
    }
  },

  clearError: () => set({ error: null }),
}))
