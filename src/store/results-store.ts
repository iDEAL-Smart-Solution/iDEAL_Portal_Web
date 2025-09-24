import { create } from "zustand"
import type { Result } from "@/types"
import { resultsService } from "@/services/results-service"

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
      const response = await resultsService.getStudentResults(studentId)
      if (response.success && response.data) {
        set({ results: response.data, isLoading: false })
      } else {
        set({ error: response.error || "Failed to fetch results", isLoading: false })
      }
    } catch (error) {
      set({ error: "Network error occurred", isLoading: false })
    }
  },

  clearError: () => set({ error: null }),
}))
