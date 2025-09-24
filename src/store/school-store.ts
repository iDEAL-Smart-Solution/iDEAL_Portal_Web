import { create } from "zustand"
import type { School, Class, Subject, Teacher, Student } from "@/types"
import { schoolService } from "@/services/school-service"

interface SchoolState {
  schools: School[]
  classes: Class[]
  subjects: Subject[]
  teachers: Teacher[]
  students: Student[]
  isLoading: boolean
  error: string | null
}

interface SchoolStore extends SchoolState {
  fetchSchools: () => Promise<void>
  fetchClasses: (schoolId: string) => Promise<void>
  fetchSubjects: (schoolId: string) => Promise<void>
  fetchTeachers: (schoolId: string) => Promise<void>
  fetchStudents: (schoolId: string) => Promise<void>
  createSchool: (school: Omit<School, "id" | "createdAt">) => Promise<void>
  updateSchool: (id: string, school: Partial<School>) => Promise<void>
  deleteSchool: (id: string) => Promise<void>
  clearError: () => void
}

export const useSchoolStore = create<SchoolStore>((set, get) => ({
  schools: [],
  classes: [],
  subjects: [],
  teachers: [],
  students: [],
  isLoading: false,
  error: null,

  fetchSchools: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await schoolService.getSchools()
      if (response.success && response.data) {
        set({ schools: response.data, isLoading: false })
      } else {
        set({ error: response.error || "Failed to fetch schools", isLoading: false })
      }
    } catch (error) {
      set({ error: "Network error occurred", isLoading: false })
    }
  },

  fetchClasses: async (schoolId: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await schoolService.getClasses(schoolId)
      if (response.success && response.data) {
        set({ classes: response.data, isLoading: false })
      } else {
        set({ error: response.error || "Failed to fetch classes", isLoading: false })
      }
    } catch (error) {
      set({ error: "Network error occurred", isLoading: false })
    }
  },

  fetchSubjects: async (schoolId: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await schoolService.getSubjects(schoolId)
      if (response.success && response.data) {
        set({ subjects: response.data, isLoading: false })
      } else {
        set({ error: response.error || "Failed to fetch subjects", isLoading: false })
      }
    } catch (error) {
      set({ error: "Network error occurred", isLoading: false })
    }
  },

  fetchTeachers: async (schoolId: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await schoolService.getTeachers(schoolId)
      if (response.success && response.data) {
        set({ teachers: response.data, isLoading: false })
      } else {
        set({ error: response.error || "Failed to fetch teachers", isLoading: false })
      }
    } catch (error) {
      set({ error: "Network error occurred", isLoading: false })
    }
  },

  fetchStudents: async (schoolId: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await schoolService.getStudents(schoolId)
      if (response.success && response.data) {
        set({ students: response.data, isLoading: false })
      } else {
        set({ error: response.error || "Failed to fetch students", isLoading: false })
      }
    } catch (error) {
      set({ error: "Network error occurred", isLoading: false })
    }
  },

  createSchool: async (school) => {
    set({ isLoading: true, error: null })
    try {
      const response = await schoolService.createSchool(school)
      if (response.success && response.data) {
        const { schools } = get()
        set({ schools: [...schools, response.data], isLoading: false })
      } else {
        set({ error: response.error || "Failed to create school", isLoading: false })
      }
    } catch (error) {
      set({ error: "Network error occurred", isLoading: false })
    }
  },

  updateSchool: async (id, school) => {
    set({ isLoading: true, error: null })
    try {
      const response = await schoolService.updateSchool(id, school)
      if (response.success && response.data) {
        const { schools } = get()
        const updatedSchools = schools.map((s) => (s.id === id ? response.data! : s))
        set({ schools: updatedSchools, isLoading: false })
      } else {
        set({ error: response.error || "Failed to update school", isLoading: false })
      }
    } catch (error) {
      set({ error: "Network error occurred", isLoading: false })
    }
  },

  deleteSchool: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await schoolService.deleteSchool(id)
      if (response.success) {
        const { schools } = get()
        const filteredSchools = schools.filter((s) => s.id !== id)
        set({ schools: filteredSchools, isLoading: false })
      } else {
        set({ error: response.error || "Failed to delete school", isLoading: false })
      }
    } catch (error) {
      set({ error: "Network error occurred", isLoading: false })
    }
  },

  clearError: () => set({ error: null }),
}))
