import type { ApiResponse, Assignment } from "@/types"
import { mockAssignments } from "@/lib/mock-data"

class AssignmentsService {
  private delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  async getAssignments(classId?: string, teacherId?: string): Promise<ApiResponse<Assignment[]>> {
    await this.delay(800)

    let assignments = mockAssignments

    if (classId) {
      assignments = assignments.filter((a) => a.classId === classId)
    }

    if (teacherId) {
      assignments = assignments.filter((a) => a.teacherId === teacherId)
    }

    return {
      success: true,
      data: assignments,
      message: "Assignments fetched successfully",
    }
  }

  async createAssignment(assignment: Omit<Assignment, "id" | "createdAt">): Promise<ApiResponse<Assignment>> {
    await this.delay(1000)

    const newAssignment: Assignment = {
      ...assignment,
      id: "assignment_" + Date.now(),
      createdAt: new Date().toISOString(),
    }

    mockAssignments.push(newAssignment)

    return {
      success: true,
      data: newAssignment,
      message: "Assignment created successfully",
    }
  }

  async updateAssignment(id: string, assignment: Partial<Assignment>): Promise<ApiResponse<Assignment>> {
    await this.delay(800)

    const index = mockAssignments.findIndex((a) => a.id === id)
    if (index !== -1) {
      mockAssignments[index] = { ...mockAssignments[index], ...assignment }
      return {
        success: true,
        data: mockAssignments[index],
        message: "Assignment updated successfully",
      }
    }

    return {
      success: false,
      error: "Assignment not found",
    }
  }

  async deleteAssignment(id: string): Promise<ApiResponse<void>> {
    await this.delay(500)

    const index = mockAssignments.findIndex((a) => a.id === id)
    if (index !== -1) {
      mockAssignments.splice(index, 1)
      return {
        success: true,
        message: "Assignment deleted successfully",
      }
    }

    return {
      success: false,
      error: "Assignment not found",
    }
  }
}

export const assignmentsService = new AssignmentsService()
