import { create } from "zustand"
import type { School, Class, Subject, Teacher, Student } from "@/types"
import axiosInstance from "@/services/api"

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
      // TODO: Integrate with backend School API
      // const response = await axiosInstance.get("/School/get-all-schools")
      // set({ schools: response.data.data, isLoading: false })
      throw new Error("School API integration pending")
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Failed to fetch schools", isLoading: false })
    }
  },

  fetchClasses: async (schoolId: string) => {
    set({ isLoading: true, error: null })
    try {
      // TODO: Integrate with backend Class API
      // const response = await axiosInstance.get(`/Class/get-all-classes?schoolId=${schoolId}`)
      // set({ classes: response.data.data, isLoading: false })
      throw new Error("Class API integration pending")
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Failed to fetch classes", isLoading: false })
    }
  },

  fetchSubjects: async (schoolId: string) => {
    set({ isLoading: true, error: null })
    try {
      // TODO: Integrate with backend Subject API
      // const response = await axiosInstance.get(`/Subject/get-all-subjects?schoolId=${schoolId}`)
      // set({ subjects: response.data.data, isLoading: false })
      throw new Error("Subject API integration pending")
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Failed to fetch subjects", isLoading: false })
    }
  },

  fetchTeachers: async (schoolId: string) => {
    set({ isLoading: true, error: null })
    try {
      // TODO: Integrate with backend Staff/Teacher API
      // const response = await axiosInstance.get(`/Staff/get-all-teachers?schoolId=${schoolId}`)
      // set({ teachers: response.data.data, isLoading: false })
      throw new Error("Teacher API integration pending")
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Failed to fetch teachers", isLoading: false })
    }
  },

  fetchStudents: async (schoolId: string) => {
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

  createSchool: async (school) => {
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

  updateSchool: async (id, school) => {
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

  deleteSchool: async (id) => {
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
