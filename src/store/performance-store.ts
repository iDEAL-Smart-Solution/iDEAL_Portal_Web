import { create } from "zustand"
import axiosInstance from "@/services/api"

export interface PerformanceMetrics {
  averageScore: number
  highestScore: number
  lowestScore: number
  scoreVariance: number
  mostCommonGrade: string
  totalResults: number
  passCount: number
  failCount: number
}

export interface HistogramBucket {
  label: string
  count: number
  percentage: number
}

export interface HistogramData {
  title: string
  xAxisLabel: string
  yAxisLabel: string
  data: HistogramBucket[]
  average: number
  median: number
  standardDeviation: number
}

export interface StudentPerformance {
  studentId: string
  studentUin: string
  studentName: string
  className: string
  subjectCode: string
  subjectName: string
  term: number
  session: string
  firstCAScore: number
  secondCAScore: number
  thirdCAScore: number
  examScore: number
  totalScore: number
  grade: string
  remark: string
  createdAt: string
}

export interface StudentComparisonPoint {
  studentId: string
  studentUin: string
  studentName: string
  score: number
  grade: string
  term: number
  session: string
}

export interface ComparisonData {
  subjectCode: string
  subjectName: string
  term: number
  session: string
  students: StudentComparisonPoint[]
  classAverage: number
  classMedian: number
  bestPerformer: string
  lowestPerformer: string
}

export interface PercentileRankings {
  schoolPercentile: number
  schoolRank: number
  schoolTotal: number
  classPercentile: number
  classRank: number
  classTotal: number
  subjectPercentile: number
  subjectRank: number
  subjectTotal: number
}

export interface PerformanceAnalysisResult {
  metrics: PerformanceMetrics
  detailedResults: StudentPerformance[]
  scoreDistribution: HistogramData
  gradeProgression: HistogramData
  subjectComparison: HistogramData
  comparisonData: ComparisonData | null
  percentileRankings: PercentileRankings
  generatedAt: string
}

interface PerformanceState {
  analysis: PerformanceAnalysisResult | null
  isLoading: boolean
  error: string | null
  sessions: string[]
  currentSession: string | null
}

interface PerformanceStore extends PerformanceState {
  // Fetch functions by role
  fetchStudentPerformance: (studentId: string, term?: number, session?: string) => Promise<void>
  fetchSubjectPerformance: (staffId: string, subjectId: string, term?: number, session?: string) => Promise<void>
  fetchClassPerformance: (schoolId: string, classId: string, term?: number, session?: string) => Promise<void>
  fetchSchoolSubjectPerformance: (schoolId: string, subjectId: string, term?: number, session?: string) => Promise<void>
  fetchWardPerformance: (parentId: string, wardId: string, term?: number, session?: string) => Promise<void>
  fetchComparisonData: (schoolId: string, studentIds: string[], subjectId: string, term?: number, session?: string) => Promise<void>

  // Session functions
  fetchAvailableSessions: (schoolId: string) => Promise<void>
  fetchCurrentSession: (schoolId: string) => Promise<void>
  setCurrentSession: (session: string) => void

  clearError: () => void
  reset: () => void
}

export const usePerformanceStore = create<PerformanceStore>((set) => ({
  analysis: null,
  isLoading: false,
  error: null,
  sessions: [],
  currentSession: null,

  fetchStudentPerformance: async (studentId: string, term?: number, session?: string) => {
    set({ isLoading: true, error: null })
    try {
      const params = new URLSearchParams()
      if (term) params.append("term", term.toString())
      if (session) params.append("session", session)

      const response = await axiosInstance.get(`/Performance/student/${studentId}?${params}`)
      set({ analysis: response.data.data, isLoading: false })
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Failed to fetch performance data", isLoading: false })
    }
  },

  fetchSubjectPerformance: async (staffId: string, subjectId: string, term?: number, session?: string) => {
    set({ isLoading: true, error: null })
    try {
      const params = new URLSearchParams()
      if (term) params.append("term", term.toString())
      if (session) params.append("session", session)

      const response = await axiosInstance.get(`/Performance/subject/${staffId}/${subjectId}?${params}`)
      set({ analysis: response.data.data, isLoading: false })
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Failed to fetch performance data", isLoading: false })
    }
  },

  fetchClassPerformance: async (schoolId: string, classId: string, term?: number, session?: string) => {
    set({ isLoading: true, error: null })
    try {
      const params = new URLSearchParams()
      if (term) params.append("term", term.toString())
      if (session) params.append("session", session)

      const response = await axiosInstance.get(`/Performance/class/${schoolId}/${classId}?${params}`)
      set({ analysis: response.data.data, isLoading: false })
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Failed to fetch performance data", isLoading: false })
    }
  },

  fetchSchoolSubjectPerformance: async (schoolId: string, subjectId: string, term?: number, session?: string) => {
    set({ isLoading: true, error: null })
    try {
      const params = new URLSearchParams()
      if (term) params.append("term", term.toString())
      if (session) params.append("session", session)

      const response = await axiosInstance.get(`/Performance/school-subject/${schoolId}/${subjectId}?${params}`)
      set({ analysis: response.data.data, isLoading: false })
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Failed to fetch performance data", isLoading: false })
    }
  },

  fetchWardPerformance: async (parentId: string, wardId: string, term?: number, session?: string) => {
    set({ isLoading: true, error: null })
    try {
      const params = new URLSearchParams()
      if (term) params.append("term", term.toString())
      if (session) params.append("session", session)

      const response = await axiosInstance.get(`/Performance/ward/${parentId}/${wardId}?${params}`)
      set({ analysis: response.data.data, isLoading: false })
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Failed to fetch performance data", isLoading: false })
    }
  },

  fetchComparisonData: async (schoolId: string, studentIds: string[], subjectId: string, term?: number, session?: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axiosInstance.post(`/Performance/compare`, {
        schoolId,
        studentIds,
        subjectId,
        term,
        session,
      })
      set((state) => ({
        analysis: state.analysis
          ? {
              ...state.analysis,
              comparisonData: response.data.data,
            }
          : null,
        isLoading: false,
      }))
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Failed to fetch comparison data", isLoading: false })
    }
  },

  fetchAvailableSessions: async (schoolId: string) => {
    try {
      const response = await axiosInstance.get(`/Performance/sessions/${schoolId}`)
      set({ sessions: response.data.data })
    } catch (error: any) {
      console.error("Failed to fetch sessions:", error)
    }
  },

  fetchCurrentSession: async (schoolId: string) => {
    try {
      const response = await axiosInstance.get(`/Performance/current-session/${schoolId}`)
      set({ currentSession: response.data.data })
    } catch (error: any) {
      console.error("Failed to fetch current session:", error)
    }
  },

  setCurrentSession: (session: string) => {
    set({ currentSession: session })
  },

  clearError: () => set({ error: null }),

  reset: () => set({
    analysis: null,
    isLoading: false,
    error: null,
    sessions: [],
    currentSession: null,
  }),
}))
