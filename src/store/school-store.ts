import { create } from "zustand"
import type { School, Class, Subject, Student } from "@/types"
import axiosInstance from "@/services/api"

interface SchoolState {
  schools: School[]
  classes: Class[]
  subjects: Subject[]
  students: Student[]
  isLoading: boolean
  error: string | null
}

interface SchoolStore extends SchoolState {
  fetchSchools: () => Promise<void>
  fetchClasses: (schoolId?: string) => Promise<void>
  fetchSubjects: (schoolId?: string) => Promise<void>
  fetchStudents: () => Promise<void>
  createSchool: () => Promise<void>
  updateSchool: () => Promise<void>
  deleteSchool: () => Promise<void>
  clearError: () => void
}

export const useSchoolStore = create<SchoolStore>((set) => ({
  schools: [],
  classes: [],
  subjects: [],
  students: [],
  isLoading: false,
  error: null,

  fetchSchools: async () => {
    set({ isLoading: true, error: null })
    try {
      // TODO: Integrate with backend School API
      // const response = await axiosInstance.get("/School/get-all-schools")
      // set({ schools: response.data.data, isLoading: false })
      throw new Error("School API integration pending")
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Failed to fetch schools", isLoading: false })
    }
  },

  fetchClasses: async (schoolId?: string) => {
    set({ isLoading: true, error: null })
    try {
      const url = schoolId ? `/Class/get-all-classes?schoolId=${schoolId}` : '/Class/get-all-classes'
      const response = await axiosInstance.get(url)
      const classesData = response.data.data || response.data
      set({ classes: Array.isArray(classesData) ? classesData : [], isLoading: false })
    } catch (error: any) {
      console.error('Fetch classes error:', error)
      set({ error: error.response?.data?.message || "Failed to fetch classes", isLoading: false })
    }
  },

  fetchSubjects: async (schoolId?: string) => {
    set({ isLoading: true, error: null })
    try {
      const url = schoolId ? `/Subject/get-all-subjects?schoolId=${schoolId}` : '/Subject/get-all-subjects'
      const response = await axiosInstance.get(url)
      const subjectsData = response.data.data || response.data
      set({ subjects: Array.isArray(subjectsData) ? subjectsData : [], isLoading: false })
    } catch (error: any) {
      console.error('Fetch subjects error:', error)
      set({ error: error.response?.data?.message || "Failed to fetch subjects", isLoading: false })
    }
  },



  fetchStudents: async () => {
    set({ isLoading: true, error: null })
    try {
      // TODO: Integrate with backend Student API
      // const response = await axiosInstance.get(`/Student/get-all-students?schoolId=${schoolId}`)
      // set({ students: response.data.data, isLoading: false })
      throw new Error("Student API integration pending")
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Failed to fetch students", isLoading: false })
    }
  },

  createSchool: async () => {
    set({ isLoading: true, error: null })
    try {
      // TODO: Integrate with backend School API
      // const response = await axiosInstance.post("/School/create-school", school)
      // const { schools } = get()
      // set({ schools: [...schools, response.data.data], isLoading: false })
      throw new Error("School API integration pending")
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Failed to create school", isLoading: false })
    }
  },

  updateSchool: async () => {
    set({ isLoading: true, error: null })
    try {
      // TODO: Integrate with backend School API
      // const response = await axiosInstance.put(`/School/update-school/${id}`, school)
      // const { schools } = get()
      // const updatedSchools = schools.map((s) => (s.id === id ? response.data.data : s))
      // set({ schools: updatedSchools, isLoading: false })
      throw new Error("School API integration pending")
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Failed to update school", isLoading: false })
    }
  },

  deleteSchool: async () => {
    set({ isLoading: true, error: null })
    try {
      // TODO: Integrate with backend School API
      // await axiosInstance.delete(`/School/delete-school/${id}`)
      // const { schools } = get()
      // const filteredSchools = schools.filter((s) => s.id !== id)
      // set({ schools: filteredSchools, isLoading: false })
      throw new Error("School API integration pending")
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Failed to delete school", isLoading: false })
    }
  },

  clearError: () => set({ error: null }),
}))
