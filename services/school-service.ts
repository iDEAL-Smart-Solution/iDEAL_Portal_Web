import type { ApiResponse, School, Class, Subject, Teacher, Student } from "@/types"
import { mockSchools, mockClasses, mockSubjects, mockUsers } from "@/lib/mock-data"

class SchoolService {
  private delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  async getSchools(): Promise<ApiResponse<School[]>> {
    await this.delay(800)

    return {
      success: true,
      data: mockSchools,
      message: "Schools fetched successfully",
    }
  }

  async getClasses(schoolId: string): Promise<ApiResponse<Class[]>> {
    await this.delay(800)

    const classes = mockClasses.filter((c) => c.schoolId === schoolId)

    return {
      success: true,
      data: classes,
      message: "Classes fetched successfully",
    }
  }

  async getSubjects(schoolId: string): Promise<ApiResponse<Subject[]>> {
    await this.delay(800)

    const subjects = mockSubjects.filter((s) => s.schoolId === schoolId)

    return {
      success: true,
      data: subjects,
      message: "Subjects fetched successfully",
    }
  }

  async getTeachers(schoolId: string): Promise<ApiResponse<Teacher[]>> {
    await this.delay(800)

    const teachers = mockUsers.filter((u) => u.role === "teacher" && u.schoolId === schoolId) as Teacher[]

    return {
      success: true,
      data: teachers,
      message: "Teachers fetched successfully",
    }
  }

  async getStudents(schoolId: string): Promise<ApiResponse<Student[]>> {
    await this.delay(800)

    const students = mockUsers.filter((u) => u.role === "student" && u.schoolId === schoolId) as Student[]

    return {
      success: true,
      data: students,
      message: "Students fetched successfully",
    }
  }

  async createSchool(school: Omit<School, "id" | "createdAt">): Promise<ApiResponse<School>> {
    await this.delay(1000)

    const newSchool: School = {
      ...school,
      id: "school_" + Date.now(),
      createdAt: new Date().toISOString(),
    }

    mockSchools.push(newSchool)

    return {
      success: true,
      data: newSchool,
      message: "School created successfully",
    }
  }

  async updateSchool(id: string, school: Partial<School>): Promise<ApiResponse<School>> {
    await this.delay(800)

    const index = mockSchools.findIndex((s) => s.id === id)
    if (index !== -1) {
      mockSchools[index] = { ...mockSchools[index], ...school }
      return {
        success: true,
        data: mockSchools[index],
        message: "School updated successfully",
      }
    }

    return {
      success: false,
      error: "School not found",
    }
  }

  async deleteSchool(id: string): Promise<ApiResponse<void>> {
    await this.delay(500)

    const index = mockSchools.findIndex((s) => s.id === id)
    if (index !== -1) {
      mockSchools.splice(index, 1)
      return {
        success: true,
        message: "School deleted successfully",
      }
    }

    return {
      success: false,
      error: "School not found",
    }
  }
}

export const schoolService = new SchoolService()
