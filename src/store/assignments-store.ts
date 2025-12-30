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
      
      // The backend returns {success: true, data: [...]}
      const data = response.data.data || response.data
      const assignmentsArray = Array.isArray(data) ? data : []
      
      // Map backend response to frontend Assignment type
      const mappedAssignments: Assignment[] = assignmentsArray.map((item: any) => ({
        id: item.id,
        title: item.title,
        instructions: item.instructions,
        subjectId: item.subjectId,
        schoolId: item.schoolId,
        dueDate: item.dueDate,
        assignmentFile: item.assignmentFile,
        createdAt: item.dateCreated || new Date().toISOString(),
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
      const response = await axiosInstance.post("/SubjectAssignment", assignment)
      const newAssignment = response.data.data || response.data
      
      const { assignments } = get()
      
      // Map backend response to frontend Assignment type
      const mappedAssignment: Assignment = {
        id: newAssignment.id,
        title: newAssignment.title,
        instructions: newAssignment.instructions,
        subjectId: newAssignment.subjectId,
        schoolId: newAssignment.schoolId,
        dueDate: newAssignment.dueDate,
        assignmentFile: newAssignment.assignmentFile,
        createdAt: newAssignment.dateCreated || new Date().toISOString(),
      }
      
      set({ assignments: [...assignments, mappedAssignment], isLoading: false })
    } catch (error: any) {
      console.error('Create assignment error:', error)
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || "Failed to create assignment"
      set({ error: errorMessage, isLoading: false })
      throw new Error(errorMessage)
    }
  },

  updateAssignment: async (id, assignment) => {
    set({ isLoading: true, error: null })
    try {
      const updateData = {
        id,
        ...assignment
      }
      const response = await axiosInstance.put("/SubjectAssignment", updateData)
      const updatedAssignment = response.data.data || response.data
      
      const { assignments } = get()
      
      // Map backend response to frontend Assignment type
      const mappedAssignment: Assignment = {
        id: updatedAssignment.id,
        title: updatedAssignment.title,
        instructions: updatedAssignment.instructions,
        subjectId: updatedAssignment.subjectId,
        schoolId: updatedAssignment.schoolId,
        dueDate: updatedAssignment.dueDate,
        assignmentFile: updatedAssignment.assignmentFile,
        createdAt: updatedAssignment.dateCreated || new Date().toISOString(),
      }
      
      const updatedAssignments = assignments.map((a) => (a.id === id ? mappedAssignment : a))
      set({ assignments: updatedAssignments, isLoading: false })
    } catch (error: any) {
      console.error('Update assignment error:', error)
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || "Failed to update assignment"
      set({ error: errorMessage, isLoading: false })
      throw new Error(errorMessage)
    }
  },

  deleteAssignment: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await axiosInstance.delete(`/SubjectAssignment/${id}`)
      const { assignments } = get()
      const filteredAssignments = assignments.filter((a) => a.id !== id)
      set({ assignments: filteredAssignments, isLoading: false })
    } catch (error: any) {
      console.error('Delete assignment error:', error)
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || "Failed to delete assignment"
      set({ error: errorMessage, isLoading: false })
      throw new Error(errorMessage)
    }
  },

  clearError: () => set({ error: null }),
}))
