import { create } from "zustand"
import type { TimetableEntry } from "@/types"
import { timetableService } from "@/services/timetable-service"

interface TimetableState {
  timetable: TimetableEntry[]
  isLoading: boolean
  error: string | null
}

interface TimetableStore extends TimetableState {
  fetchTimetable: (classId: string) => Promise<void>
  createTimetableEntry: (entry: Omit<TimetableEntry, "id">) => Promise<void>
  updateTimetableEntry: (id: string, entry: Partial<TimetableEntry>) => Promise<void>
  deleteTimetableEntry: (id: string) => Promise<void>
  clearError: () => void
}

export const useTimetableStore = create<TimetableStore>((set, get) => ({
  timetable: [],
  isLoading: false,
  error: null,

  fetchTimetable: async (classId: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await timetableService.getTimetable(classId)
      if (response.success && response.data) {
        set({ timetable: response.data, isLoading: false })
      } else {
        set({ error: response.error || "Failed to fetch timetable", isLoading: false })
      }
    } catch (error) {
      set({ error: "Network error occurred", isLoading: false })
    }
  },

  createTimetableEntry: async (entry) => {
    set({ isLoading: true, error: null })
    try {
      const response = await timetableService.createTimetableEntry(entry)
      if (response.success && response.data) {
        const { timetable } = get()
        set({ timetable: [...timetable, response.data], isLoading: false })
      } else {
        set({ error: response.error || "Failed to create timetable entry", isLoading: false })
      }
    } catch (error) {
      set({ error: "Network error occurred", isLoading: false })
    }
  },

  updateTimetableEntry: async (id, entry) => {
    set({ isLoading: true, error: null })
    try {
      const response = await timetableService.updateTimetableEntry(id, entry)
      if (response.success && response.data) {
        const { timetable } = get()
        const updatedTimetable = timetable.map((t) => (t.id === id ? response.data! : t))
        set({ timetable: updatedTimetable, isLoading: false })
      } else {
        set({ error: response.error || "Failed to update timetable entry", isLoading: false })
      }
    } catch (error) {
      set({ error: "Network error occurred", isLoading: false })
    }
  },

  deleteTimetableEntry: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await timetableService.deleteTimetableEntry(id)
      if (response.success) {
        const { timetable } = get()
        const filteredTimetable = timetable.filter((t) => t.id !== id)
        set({ timetable: filteredTimetable, isLoading: false })
      } else {
        set({ error: response.error || "Failed to delete timetable entry", isLoading: false })
      }
    } catch (error) {
      set({ error: "Network error occurred", isLoading: false })
    }
  },

  clearError: () => set({ error: null }),
}))
