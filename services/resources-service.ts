import type { ApiResponse, Resource } from "@/types"
import { mockResources } from "@/lib/mock-data"

class ResourcesService {
  private delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  async getResources(classId?: string, subjectId?: string): Promise<ApiResponse<Resource[]>> {
    await this.delay(800)

    let resources = mockResources

    if (classId) {
      resources = resources.filter((r) => r.classIds.includes(classId))
    }

    if (subjectId) {
      resources = resources.filter((r) => r.subjectId === subjectId)
    }

    return {
      success: true,
      data: resources,
      message: "Resources fetched successfully",
    }
  }

  async uploadResource(resource: Omit<Resource, "id" | "createdAt">): Promise<ApiResponse<Resource>> {
    await this.delay(2000) // Simulate file upload

    const newResource: Resource = {
      ...resource,
      id: "resource_" + Date.now(),
      createdAt: new Date().toISOString(),
    }

    mockResources.push(newResource)

    return {
      success: true,
      data: newResource,
      message: "Resource uploaded successfully",
    }
  }

  async deleteResource(id: string): Promise<ApiResponse<void>> {
    await this.delay(500)

    const index = mockResources.findIndex((r) => r.id === id)
    if (index !== -1) {
      mockResources.splice(index, 1)
      return {
        success: true,
        message: "Resource deleted successfully",
      }
    }

    return {
      success: false,
      error: "Resource not found",
    }
  }
}

export const resourcesService = new ResourcesService()
