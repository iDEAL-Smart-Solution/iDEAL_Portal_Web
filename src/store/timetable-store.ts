import { create } from "zustand"
import type { TimetableEntry } from "@/types"
import axiosInstance from "@/services/api"

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
      // TODO: Integrate with backend TimeTable API
      // const response = await axiosInstance.get(`/TimeTable/get-class-timetable?classId=${classId}`)
      // set({ timetable: response.data.data, isLoading: false })
      throw new Error("TimeTable API integration pending")
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Failed to fetch timetable", isLoading: false })
    }
  },

  createTimetableEntry: async (entry) => {
    set({ isLoading: true, error: null })
    try {
      // TODO: Integrate with backend TimeTable API
      // const response = await axiosInstance.post("/TimeTable/create-timetable", entry)
      // const { timetable } = get()
      // set({ timetable: [...timetable, response.data.data], isLoading: false })
      throw new Error("TimeTable API integration pending")
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Failed to create timetable entry", isLoading: false })
    }
  },

  updateTimetableEntry: async (id, entry) => {
    set({ isLoading: true, error: null })
    try {
      // TODO: Integrate with backend TimeTable API
      // const response = await axiosInstance.put(`/TimeTable/update-timetable/${id}`, entry)
      // const { timetable } = get()
      // const updatedTimetable = timetable.map((t) => (t.id === id ? response.data.data : t))
      // set({ timetable: updatedTimetable, isLoading: false })
      throw new Error("TimeTable API integration pending")
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Failed to update timetable entry", isLoading: false })
    }
  },

  deleteTimetableEntry: async (id) => {
    set({ isLoading: true, error: null })
    try {
      // TODO: Integrate with backend TimeTable API
      // await axiosInstance.delete(`/TimeTable/delete-timetable/${id}`)
      // const { timetable } = get()
      // const filteredTimetable = timetable.filter((t) => t.id !== id)
      // set({ timetable: filteredTimetable, isLoading: false })
      throw new Error("TimeTable API integration pending")
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Failed to delete timetable entry", isLoading: false })
    }
  },

  clearError: () => set({ error: null }),
}))
