import { create } from "zustand"
import type { Assignment } from "@/types"
import axiosInstance from "@/services/api"

interface AssignmentsState {
  assignments: Assignment[]
  isLoading: boolean
  error: string | null
}

interface AssignmentsStore extends AssignmentsState {
  fetchAssignments: (classId?: string, teacherId?: string) => Promise<void>
  createAssignment: (assignment: Omit<Assignment, "id" | "createdAt">) => Promise<void>
  updateAssignment: (id: string, assignment: Partial<Assignment>) => Promise<void>
  deleteAssignment: (id: string) => Promise<void>
  clearError: () => void
}

export const useAssignmentsStore = create<AssignmentsStore>((set, get) => ({
  assignments: [],
  isLoading: false,
  error: null,

  fetchAssignments: async (classId?: string, teacherId?: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axiosInstance.get('/SubjectAssignment')
      
      // The backend returns the data directly, not wrapped
      const data = Array.isArray(response.data) ? response.data : []
      
      // Map backend response to frontend Assignment type
      const mappedAssignments: Assignment[] = data.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.instructions,
        subjectId: item.subjectId,
        classId: "",
        teacherId: "",
        dueDate: item.dueDate,
        attachments: item.assignmentFile ? [item.assignmentFile] : [],
        createdAt: new Date().toISOString(),
      }))
      
      set({ assignments: mappedAssignments, isLoading: false })
    } catch (error: any) {
      console.error('Assignments fetch error:', error)
      set({ error: error.response?.data?.message || error.message || "Failed to fetch assignments", isLoading: false })
    }
  },

  createAssignment: async (assignment) => {
    set({ isLoading: true, error: null })
    try {
      // TODO: Integrate with backend Assignments API
      // const response = await axiosInstance.post("/SubjectAssignment/create-assignment", assignment)
      // const { assignments } = get()
      // set({ assignments: [...assignments, response.data.data], isLoading: false })
      throw new Error("Assignments API integration pending")
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Failed to create assignment", isLoading: false })
    }
  },

  updateAssignment: async (id, assignment) => {
    set({ isLoading: true, error: null })
    try {
      // TODO: Integrate with backend Assignments API
      // const response = await axiosInstance.put(`/SubjectAssignment/update-assignment/${id}`, assignment)
      // const { assignments } = get()
      // const updatedAssignments = assignments.map((a) => (a.id === id ? response.data.data : a))
      // set({ assignments: updatedAssignments, isLoading: false })
      throw new Error("Assignments API integration pending")
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Failed to update assignment", isLoading: false })
    }
  },

  deleteAssignment: async (id) => {
    set({ isLoading: true, error: null })
    try {
      // TODO: Integrate with backend Assignments API
      // await axiosInstance.delete(`/SubjectAssignment/delete-assignment/${id}`)
      // const { assignments } = get()
      // const filteredAssignments = assignments.filter((a) => a.id !== id)
      // set({ assignments: filteredAssignments, isLoading: false })
      throw new Error("Assignments API integration pending")
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Failed to delete assignment", isLoading: false })
    }
  },

  clearError: () => set({ error: null }),
}))
