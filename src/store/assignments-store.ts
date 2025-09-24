import { create } from "zustand"
import type { Assignment } from "@/types"
import { assignmentsService } from "@/services/assignments-service"

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
      const response = await assignmentsService.getAssignments(classId, teacherId)
      if (response.success && response.data) {
        set({ assignments: response.data, isLoading: false })
      } else {
        set({ error: response.error || "Failed to fetch assignments", isLoading: false })
      }
    } catch (error) {
      set({ error: "Network error occurred", isLoading: false })
    }
  },

  createAssignment: async (assignment) => {
    set({ isLoading: true, error: null })
    try {
      const response = await assignmentsService.createAssignment(assignment)
      if (response.success && response.data) {
        const { assignments } = get()
        set({ assignments: [...assignments, response.data], isLoading: false })
      } else {
        set({ error: response.error || "Failed to create assignment", isLoading: false })
      }
    } catch (error) {
      set({ error: "Network error occurred", isLoading: false })
    }
  },

  updateAssignment: async (id, assignment) => {
    set({ isLoading: true, error: null })
    try {
      const response = await assignmentsService.updateAssignment(id, assignment)
      if (response.success && response.data) {
        const { assignments } = get()
        const updatedAssignments = assignments.map((a) => (a.id === id ? response.data! : a))
        set({ assignments: updatedAssignments, isLoading: false })
      } else {
        set({ error: response.error || "Failed to update assignment", isLoading: false })
      }
    } catch (error) {
      set({ error: "Network error occurred", isLoading: false })
    }
  },

  deleteAssignment: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await assignmentsService.deleteAssignment(id)
      if (response.success) {
        const { assignments } = get()
        const filteredAssignments = assignments.filter((a) => a.id !== id)
        set({ assignments: filteredAssignments, isLoading: false })
      } else {
        set({ error: response.error || "Failed to delete assignment", isLoading: false })
      }
    } catch (error) {
      set({ error: "Network error occurred", isLoading: false })
    }
  },

  clearError: () => set({ error: null }),
}))
