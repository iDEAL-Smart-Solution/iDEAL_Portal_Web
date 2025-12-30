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
    console.log('fetchTimetable called with classId:', classId)
    set({ isLoading: true, error: null })
    try {
      console.log('Making API call to /Timetable/get-by-class?classId=' + classId)
      const response = await axiosInstance.get(`/Timetable/get-by-class?classId=${classId}`)
      console.log('API response:', response.data)
      
      // Backend returns GetResponse<GetTimetableByClassResponse> with Data property
      // Data contains: { ClassId, Days: [{ Day, Slots: [{...}] }] }
      const timetableData = response.data.data || response.data
      console.log('Timetable data:', timetableData)
      
      // Transform backend response to frontend format
      const transformedTimetable: TimetableEntry[] = []
      
      if (timetableData.days) {
        timetableData.days.forEach((dailySchedule: any) => {
          dailySchedule.slots.forEach((slot: any) => {
            transformedTimetable.push({
              id: slot.id || `${slot.day}-${slot.startTime}-${slot.subjectId}`,
              classId: timetableData.classId,
              subjectId: slot.subjectId || '',
              teacherId: slot.staffId || '',
              dayOfWeek: slot.day,
              startTime: slot.startTime,
              endTime: slot.endTime,
              room: slot.room || '',
              day: '', // Optional field
              timeSlot: `${slot.startTime}-${slot.endTime}`, // Optional field
            })
          })
        })
      }
      
      console.log('Transformed timetable:', transformedTimetable)
      set({ timetable: transformedTimetable, isLoading: false })
    } catch (error: any) {
      console.error('Error fetching timetable:', error)
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
