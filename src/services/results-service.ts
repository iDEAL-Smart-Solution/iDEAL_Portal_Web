import type { ApiResponse, Result } from "@/types"
import { mockResults } from "@/lib/mock-data"

class ResultsService {
  private delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  async getStudentResults(studentId: string): Promise<ApiResponse<Result[]>> {
    await this.delay(800)

    const results = mockResults.filter((r) => r.studentId === studentId)

    return {
      success: true,
      data: results,
      message: "Results fetched successfully",
    }
  }

  async getClassResults(classId: string): Promise<ApiResponse<Result[]>> {
    await this.delay(800)

    // This would typically join with student data to filter by class
    const results = mockResults.filter((r) => r.studentId.includes(classId))

    return {
      success: true,
      data: results,
      message: "Class results fetched successfully",
    }
  }
}

export const resultsService = new ResultsService()
