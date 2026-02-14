import { create } from "zustand"
import type { Result } from "@/types"
import axiosInstance from "@/services/api"

// Extended Result type for detailed view
export interface DetailedResult extends Result {
  studentName?: string
  studentUin?: string
  firstCAScore: number
  secondCAScore: number
  thirdCAScore: number
  examScore: number
  totalScore: number
}

// ───── Report Card Types ─────
export interface SubjectResultDto {
  subjectName: string
  subjectCode: string
  firstCA: number
  secondCA: number
  thirdCA: number
  exam: number
  totalScore: number
  grade: string
  remark: string
}

export interface SingleTermReportCardDto {
  studentName: string
  studentUin: string
  gender: string
  className: string
  term: string
  session: string
  subjects: SubjectResultDto[]
  aggregate: number
  percentage: number
  position: number
  totalStudents: number
  principalRemark: string
  schoolName: string
  schoolLogo: string | null
  nextTermBeginsOn: string | null
}

export interface CumulativeSubjectResultDto {
  subjectName: string
  subjectCode: string
  firstTermTotal: number
  secondTermTotal: number
  thirdTermTotal: number
  averageScore: number
  grade: string
  remark: string
}

export interface CumulativeReportCardDto {
  studentName: string
  studentUin: string
  gender: string
  className: string
  session: string
  subjects: CumulativeSubjectResultDto[]
  cumulativeAggregate: number
  cumulativePercentage: number
  cumulativePosition: number
  totalStudents: number
  principalRemark: string
  schoolName: string
  schoolLogo: string | null
  nextTermBeginsOn: string | null
}

// Create Result DTO matching backend
export interface CreateResultDto {
  studentId: string
  studentUin: string
  subjectCode: string
  first_CA_Score: number
  second_CA_Score: number
  third_CA_Score: number
  exam_Score: number
  term: number // 1 = first, 2 = second, 3 = third
  session: string
}

// Update Result DTO matching backend
export interface UpdateResultDto {
  id: string
  first_CA_Score: number
  second_CA_Score: number
  third_CA_Score: number
  exam_Score: number
}

// Student for result entry
export interface StudentForResult {
  id: string
  uin: string
  fullName: string
  className?: string
}

// Academic Session
export interface AcademicSession {
  id: string
  name: string
  startDate: string
  endDate: string
  isCurrent: boolean
  currentTerm?: number
}

// ── Report Card DTOs ──
export interface SubjectResultDto {
  subjectName: string
  subjectCode: string
  firstCA: number
  secondCA: number
  thirdCA: number
  exam: number
  totalScore: number
  grade: string
  remark: string
}

export interface SingleTermReportCardDto {
  studentName: string
  studentUin: string
  gender: string
  className: string
  term: string
  session: string
  subjects: SubjectResultDto[]
  aggregate: number
  percentage: number
  position: number
  totalStudents: number
  principalRemark: string
  schoolName: string
  schoolLogo: string | null
  nextTermBeginsOn: string | null
}

export interface CumulativeSubjectResultDto {
  subjectName: string
  subjectCode: string
  firstTermTotal: number
  secondTermTotal: number
  thirdTermTotal: number
  averageScore: number
  grade: string
  remark: string
}

export interface CumulativeReportCardDto {
  studentName: string
  studentUin: string
  gender: string
  className: string
  session: string
  subjects: CumulativeSubjectResultDto[]
  cumulativeAggregate: number
  cumulativePercentage: number
  cumulativePosition: number
  totalStudents: number
  principalRemark: string
  schoolName: string
  schoolLogo: string | null
  nextTermBeginsOn: string | null
}

interface ResultsState {
  results: Result[]
  allResults: DetailedResult[]
  studentResults: DetailedResult[]
  subjectResults: DetailedResult[]
  studentsForResult: StudentForResult[]
  academicSessions: AcademicSession[]
  currentSession: AcademicSession | null
  reportCard: SingleTermReportCardDto | null
  cumulativeReportCard: CumulativeReportCardDto | null
  isLoading: boolean
  error: string | null
}

interface ResultsStore extends ResultsState {
  // Student-facing
  fetchResults: (studentId: string) => Promise<void>
  
  // Staff/Admin facing
  fetchAllResults: () => Promise<void>
  fetchResultsByStudent: (studentId: string) => Promise<void>
  fetchResultsBySubject: (subjectCode: string) => Promise<void>
  fetchStudentsBySubject: (subjectId: string) => Promise<void>
  fetchStudentsByClass: (className: string) => Promise<void>
  fetchAcademicSessions: () => Promise<void>
  fetchCurrentSession: () => Promise<void>
  
  // CRUD operations
  createResult: (data: CreateResultDto) => Promise<void>
  updateResult: (data: UpdateResultDto) => Promise<void>
  deleteResult: (id: string) => Promise<void>
  
  // Report Card
  fetchSingleTermReportCard: (studentId: string, term: number, session: string) => Promise<void>
  fetchCumulativeReportCard: (studentId: string, session: string) => Promise<void>
  clearReportCard: () => void
  
  clearError: () => void
  clearStudentsForResult: () => void
  clearSubjectResults: () => void
}

export const useResultsStore = create<ResultsStore>((set, get) => ({
  results: [],
  allResults: [],
  studentResults: [],
  subjectResults: [],
  studentsForResult: [],
  academicSessions: [],
  currentSession: null,
  reportCard: null,
  cumulativeReportCard: null,
  isLoading: false,
  error: null,

  // Fetch results for a student (student view)
  fetchResults: async (studentId: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axiosInstance.get(`/Student/results?studentId=${studentId}`)
      
      // Map backend response to frontend Result type
      const mappedResults: Result[] = (response.data.data || []).map((item: any) => ({
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

  // Fetch all results (admin view)
  fetchAllResults: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await axiosInstance.get('/Results')
      const data = response.data.data || response.data || []
      
      const mappedResults: DetailedResult[] = (Array.isArray(data) ? data : []).map((item: any) => ({
        id: item.id,
        studentId: item.studentId,
        studentUin: item.studentUin,
        subjectId: item.subjectCode,
        subjectCode: item.subjectCode,
        subjectName: item.subjectName || item.subjectCode,
        term: getTermName(item.term),
        academicYear: item.session,
        firstCAScore: item.first_CA_Score,
        secondCAScore: item.second_CA_Score,
        thirdCAScore: item.third_CA_Score,
        examScore: item.exam_Score,
        totalScore: item.total_Score,
        score: item.total_Score,
        grade: calculateGrade(item.total_Score),
        createdAt: new Date().toISOString(),
      }))
      
      set({ allResults: mappedResults, isLoading: false })
    } catch (error: any) {
      console.error('Fetch all results error:', error)
      set({ error: error.response?.data?.message || "Failed to fetch results", isLoading: false })
    }
  },

  // Fetch results by student ID (staff/admin view)
  fetchResultsByStudent: async (studentId: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axiosInstance.get(`/Results/student/${studentId}/${studentId}`)
      const data = response.data.data || response.data || []
      
      const mappedResults: DetailedResult[] = (Array.isArray(data) ? data : []).map((item: any) => ({
        id: item.id,
        studentId: item.studentId,
        studentUin: item.studentUin,
        subjectId: item.subjectCode,
        subjectCode: item.subjectCode,
        subjectName: item.subjectName || item.subjectCode,
        term: getTermName(item.term),
        academicYear: item.session,
        firstCAScore: item.first_CA_Score,
        secondCAScore: item.second_CA_Score,
        thirdCAScore: item.third_CA_Score,
        examScore: item.exam_Score,
        totalScore: item.total_Score,
        score: item.total_Score,
        grade: calculateGrade(item.total_Score),
        createdAt: new Date().toISOString(),
      }))
      
      set({ studentResults: mappedResults, isLoading: false })
    } catch (error: any) {
      console.error('Fetch student results error:', error)
      set({ error: error.response?.data?.message || "Failed to fetch student results", isLoading: false })
    }
  },

  // Fetch students by subject (for staff to upload results)
  fetchStudentsBySubject: async (subjectId: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axiosInstance.get(`/Student/get-students-with-subject?subjectId=${subjectId}`)
      const data = response.data.data || response.data || []
      
      const students: StudentForResult[] = (Array.isArray(data) ? data : []).map((item: any) => ({
        id: item.id,
        uin: item.uin,
        fullName: item.fullName || `${item.firstName} ${item.lastName}`,
        className: item.className,
      }))
      
      set({ studentsForResult: students, isLoading: false })
    } catch (error: any) {
      console.error('Fetch students by subject error:', error)
      set({ error: error.response?.data?.message || "Failed to fetch students", isLoading: false })
    }
  },

  // Fetch students by class name
  fetchStudentsByClass: async (className: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axiosInstance.get(`/Student/get-students-with-class?className=${className}`)
      const data = response.data.data || response.data || []
      
      const students: StudentForResult[] = (Array.isArray(data) ? data : []).map((item: any) => ({
        id: item.id,
        uin: item.uin,
        fullName: item.fullName || `${item.firstName} ${item.lastName}`,
        className: item.className,
      }))
      
      set({ studentsForResult: students, isLoading: false })
    } catch (error: any) {
      console.error('Fetch students by class error:', error)
      set({ error: error.response?.data?.message || "Failed to fetch students", isLoading: false })
    }
  },

  // Fetch academic sessions (doesn't block UI with loading state)
  fetchAcademicSessions: async () => {
    try {
      const response = await axiosInstance.get('/AcademicSession/get-all-sessions')
      const data = response.data.data || response.data || []
      
      const sessions: AcademicSession[] = (Array.isArray(data) ? data : []).map((item: any) => ({
        id: item.id,
        name: item.current_Session || item.Current_Session || item.name,
        startDate: item.startDate || '',
        endDate: item.endDate || '',
        isCurrent: item.isCurrent,
        currentTerm: item.current_Term || item.Current_Term || item.currentTerm,
      }))
      
      set({ academicSessions: sessions })
    } catch (error: any) {
      console.error('Fetch academic sessions error:', error)
      // Don't set error state for session fetch failure
    }
  },

  // Fetch current session (doesn't block UI with loading state)
  fetchCurrentSession: async () => {
    try {
      const response = await axiosInstance.get('/AcademicSession/get-current-session')
      const data = response.data.data || response.data
      
      if (data) {
        const session: AcademicSession = {
          id: data.id,
          name: data.current_Session || data.Current_Session || data.name,
          startDate: data.startDate || '',
          endDate: data.endDate || '',
          isCurrent: true,
          currentTerm: data.current_Term || data.Current_Term || data.currentTerm,
        }
        set({ currentSession: session })
      } else {
        set({ currentSession: null })
      }
    } catch (error: any) {
      console.error('Fetch current session error:', error)
      // Don't set error state for session fetch failure to avoid blocking UI
    }
  },

  // Create a new result
  createResult: async (data: CreateResultDto) => {
    set({ isLoading: true, error: null })
    try {
      await axiosInstance.post('/Results', data)
      set({ isLoading: false })
    } catch (error: any) {
      console.error('Create result error:', error)
      const errorMessage = error.response?.data?.message || "Failed to create result"
      set({ error: errorMessage, isLoading: false })
      throw new Error(errorMessage)
    }
  },

  // Update an existing result
  updateResult: async (data: UpdateResultDto) => {
    set({ isLoading: true, error: null })
    try {
      await axiosInstance.put('/Results', data)
      set({ isLoading: false })
    } catch (error: any) {
      console.error('Update result error:', error)
      const errorMessage = error.response?.data?.message || "Failed to update result"
      set({ error: errorMessage, isLoading: false })
      throw new Error(errorMessage)
    }
  },

  // Delete a result
  deleteResult: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await axiosInstance.delete(`/Results/${id}`)
      const { allResults } = get()
      set({ 
        allResults: allResults.filter(r => r.id !== id),
        isLoading: false 
      })
    } catch (error: any) {
      console.error('Delete result error:', error)
      const errorMessage = error.response?.data?.message || "Failed to delete result"
      set({ error: errorMessage, isLoading: false })
      throw new Error(errorMessage)
    }
  },

  clearError: () => set({ error: null }),
  clearStudentsForResult: () => set({ studentsForResult: [] }),
  clearSubjectResults: () => set({ subjectResults: [] }),
  clearReportCard: () => set({ reportCard: null, cumulativeReportCard: null }),

  // Fetch single-term report card
  fetchSingleTermReportCard: async (studentId: string, term: number, session: string) => {
    set({ isLoading: true, error: null, reportCard: null })
    try {
      const response = await axiosInstance.get(
        `/ReportCard/single-term?studentId=${studentId}&term=${term}&session=${encodeURIComponent(session)}`
      )
      const data = response.data?.data || response.data
      set({ reportCard: data, isLoading: false })
    } catch (error: any) {
      console.error('Fetch report card error:', error)
      set({ error: error.response?.data?.message || "Failed to fetch report card", isLoading: false })
    }
  },

  // Fetch cumulative report card
  fetchCumulativeReportCard: async (studentId: string, session: string) => {
    set({ isLoading: true, error: null, cumulativeReportCard: null })
    try {
      const response = await axiosInstance.get(
        `/ReportCard/cumulative?studentId=${studentId}&session=${encodeURIComponent(session)}`
      )
      const data = response.data?.data || response.data
      set({ cumulativeReportCard: data, isLoading: false })
    } catch (error: any) {
      console.error('Fetch cumulative report card error:', error)
      set({ error: error.response?.data?.message || "Failed to fetch cumulative report card", isLoading: false })
    }
  },

  // Fetch results by subject code (for staff to view uploaded results)
  fetchResultsBySubject: async (subjectCode: string) => {
    set({ isLoading: true, error: null })
    try {
      // Fetch all results and filter by subject code
      const response = await axiosInstance.get('/Results')
      const data = response.data.data || response.data || []
      
      const filteredResults: DetailedResult[] = (Array.isArray(data) ? data : [])
        .filter((item: any) => item.subjectCode?.toLowerCase() === subjectCode.toLowerCase())
        .map((item: any) => ({
          id: item.id,
          studentId: item.studentId,
          studentUin: item.studentUin,
          subjectId: item.subjectCode,
          subjectCode: item.subjectCode,
          subjectName: item.subjectName || item.subjectCode,
          term: getTermName(item.term),
          academicYear: item.session,
          firstCAScore: item.first_CA_Score,
          secondCAScore: item.second_CA_Score,
          thirdCAScore: item.third_CA_Score,
          examScore: item.exam_Score,
          totalScore: item.total_Score,
          score: item.total_Score,
          grade: calculateGrade(item.total_Score),
          createdAt: new Date().toISOString(),
        }))
      
      set({ subjectResults: filteredResults, isLoading: false })
    } catch (error: any) {
      console.error('Fetch results by subject error:', error)
      set({ error: error.response?.data?.message || "Failed to fetch results", isLoading: false })
    }
  },
}))

// Helper function to get term name from number
function getTermName(term: number): string {
  switch (term) {
    case 1: return "First Term"
    case 2: return "Second Term"
    case 3: return "Third Term"
    default: return `Term ${term}`
  }
}

// Helper function to calculate grade from total score
function calculateGrade(score: number): string {
  if (score >= 70) return "A"
  if (score >= 60) return "B"
  if (score >= 50) return "C"
  if (score >= 45) return "D"
  if (score >= 40) return "E"
  return "F"
}
