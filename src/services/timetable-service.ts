import type { ApiResponse, TimetableEntry } from "@/types"
import { mockTimetable } from "@/lib/mock-data"

class TimetableService {
  private delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  async getTimetable(classId: string): Promise<ApiResponse<TimetableEntry[]>> {
    await this.delay(800)

    const timetable = mockTimetable.filter((t) => t.classId === classId)

    return {
      success: true,
      data: timetable,
      message: "Timetable fetched successfully",
    }
  }

  async createTimetableEntry(entry: Omit<TimetableEntry, "id">): Promise<ApiResponse<TimetableEntry>> {
    await this.delay(800)

    const newEntry: TimetableEntry = {
      ...entry,
      id: "timetable_" + Date.now(),
    }

    mockTimetable.push(newEntry)

    return {
      success: true,
      data: newEntry,
      message: "Timetable entry created successfully",
    }
  }

  async updateTimetableEntry(id: string, entry: Partial<TimetableEntry>): Promise<ApiResponse<TimetableEntry>> {
    await this.delay(800)

    const index = mockTimetable.findIndex((t) => t.id === id)
    if (index !== -1) {
      mockTimetable[index] = { ...mockTimetable[index], ...entry }
      return {
        success: true,
        data: mockTimetable[index],
        message: "Timetable entry updated successfully",
      }
    }

    return {
      success: false,
      error: "Timetable entry not found",
    }
  }

  async deleteTimetableEntry(id: string): Promise<ApiResponse<void>> {
    await this.delay(500)

    const index = mockTimetable.findIndex((t) => t.id === id)
    if (index !== -1) {
      mockTimetable.splice(index, 1)
      return {
        success: true,
        message: "Timetable entry deleted successfully",
      }
    }

    return {
      success: false,
      error: "Timetable entry not found",
    }
  }
}

export const timetableService = new TimetableService()
