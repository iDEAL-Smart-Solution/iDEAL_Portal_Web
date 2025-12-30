import { create } from "zustand"
import type { Teacher, Subject } from "@/types"
import axiosInstance from "@/services/api"

interface DashboardStats {
  totalSubjects: number
  totalAssignments: number
  upcomingAssignments: number
  totalResources: number
}

interface SubjectSummary {
  id: string
  name: string
  code: string
  description: string
  className: string
  classId: string
  assignmentsCount: number
  resourcesCount: number
}

interface AssignmentSummary {
  id: string
  title: string
  instructions: string
  dueDate: string
  subjectId: string
  subjectName: string
}

interface ResourceSummary {
  id: string
  name: string
  description: string
  resourceTypeName: string
  mediaType: string
  mediaUrl: string
}

interface DashboardData {
  stats: DashboardStats
  subjects: SubjectSummary[]
  recentAssignments: AssignmentSummary[]
  recentResources: ResourceSummary[]
}

interface StaffState {
  teachers: Teacher[]
  teacherSubjects: Subject[]
  dashboardData: DashboardData | null
  isLoading: boolean
  error: string | null
}

interface StaffStore extends StaffState {
  fetchTeachers: (schoolId?: string) => Promise<void>
  fetchTeacherById: (teacherId: string) => Promise<Teacher | null>
  fetchTeacherSubjects: (teacherId: string) => Promise<void>
  fetchDashboard: (userId: string) => Promise<void>
  createTeacher: (teacher: Omit<Teacher, "id" | "createdAt">) => Promise<void>
  updateTeacher: (id: string, teacher: Partial<Teacher>) => Promise<void>
  deleteTeacher: (id: string) => Promise<void>
  clearError: () => void
}

export const useStaffStore = create<StaffStore>((set, get) => ({
  teachers: [],
  teacherSubjects: [],
  dashboardData: null,
  isLoading: false,
  error: null,

  fetchTeachers: async (schoolId?: string) => {
    set({ isLoading: true, error: null })
    try {
      const url = schoolId ? `/Staff/get-all-teachers?schoolId=${schoolId}` : '/Staff/get-all-teachers'
      const response = await axiosInstance.get(url)
      const teachersData = response.data.data || response.data
      set({ teachers: Array.isArray(teachersData) ? teachersData : [], isLoading: false })
    } catch (error: any) {
      console.error('Fetch teachers error:', error)
      set({ error: error.response?.data?.message || "Failed to fetch teachers", isLoading: false })
    }
  },

  fetchTeacherById: async (teacherId: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axiosInstance.get(`/Staff/${teacherId}`)
      const teacherData = response.data.data || response.data
      set({ isLoading: false })
      return teacherData
    } catch (error: any) {
      console.error('Fetch teacher error:', error)
      set({ error: error.response?.data?.message || "Failed to fetch teacher", isLoading: false })
      return null
    }
  },

  fetchTeacherSubjects: async (teacherId: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axiosInstance.get(`/Subject/by-teacher/${teacherId}`)
      const subjectsData = response.data.data || response.data
      set({ teacherSubjects: Array.isArray(subjectsData) ? subjectsData : [], isLoading: false })
    } catch (error: any) {
      console.error('Fetch teacher subjects error:', error)
      set({ error: error.response?.data?.message || "Failed to fetch teacher subjects", isLoading: false })
    }
  },

  fetchDashboard: async (userId: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axiosInstance.get(`/Staff/dashboard?userId=${userId}`)
      const dashboardData = response.data.data || response.data
      set({ dashboardData, isLoading: false })
    } catch (error: any) {
      console.error('Fetch dashboard error:', error)
      set({ error: error.response?.data?.message || "Failed to fetch dashboard data", isLoading: false })
    }
  },

  createTeacher: async (teacher) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axiosInstance.post("/Staff/create-teacher", teacher)
      const newTeacher = response.data.data || response.data
      const { teachers } = get()
      set({ teachers: [...teachers, newTeacher], isLoading: false })
    } catch (error: any) {
      console.error('Create teacher error:', error)
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || "Failed to create teacher"
      set({ error: errorMessage, isLoading: false })
      throw new Error(errorMessage)
    }
  },

  updateTeacher: async (id, teacher) => {
    set({ isLoading: true, error: null })
    try {
      const updateData = { id, ...teacher }
      const response = await axiosInstance.put("/Staff/update-teacher", updateData)
      const updatedTeacher = response.data.data || response.data
      const { teachers } = get()
      const updatedTeachers = teachers.map((t) => (t.id === id ? updatedTeacher : t))
      set({ teachers: updatedTeachers, isLoading: false })
    } catch (error: any) {
      console.error('Update teacher error:', error)
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || "Failed to update teacher"
      set({ error: errorMessage, isLoading: false })
      throw new Error(errorMessage)
    }
  },

  deleteTeacher: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await axiosInstance.delete(`/Staff/${id}`)
      const { teachers } = get()
      const filteredTeachers = teachers.filter((t) => t.id !== id)
      set({ teachers: filteredTeachers, isLoading: false })
    } catch (error: any) {
      console.error('Delete teacher error:', error)
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || "Failed to delete teacher"
      set({ error: errorMessage, isLoading: false })
      throw new Error(errorMessage)
    }
  },

  clearError: () => set({ error: null }),
}))
