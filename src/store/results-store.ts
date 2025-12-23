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
      const response = await axiosInstance.get(`/Student/results?studentId=${studentId}`)
      
      // Map backend response to frontend Result type
      const mappedResults: Result[] = response.data.data.map((item: any) => ({
        id: item.id,
        studentId: studentId,
        subjectId: item.subjectCode,
        subjectName: item.subjectName,
        subjectCode: item.subjectCode,
        term: item.term,
        academicYear: item.session,
        score: item.totalScore,
        grade: item.grade,
        remarks: "",
        createdAt: new Date().toISOString(),
      }))
      
      set({ results: mappedResults, isLoading: false })
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Failed to fetch results", isLoading: false })
    }
  },

  clearError: () => set({ error: null }),
}))
