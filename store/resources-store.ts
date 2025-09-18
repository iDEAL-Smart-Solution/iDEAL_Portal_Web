import { create } from "zustand"
import type { Resource } from "@/types"
import { resourcesService } from "@/services/resources-service"

interface ResourcesState {
  resources: Resource[]
  isLoading: boolean
  error: string | null
}

interface ResourcesStore extends ResourcesState {
  fetchResources: (classId?: string, subjectId?: string) => Promise<void>
  uploadResource: (resource: Omit<Resource, "id" | "createdAt">) => Promise<void>
  deleteResource: (id: string) => Promise<void>
  clearError: () => void
}

export const useResourcesStore = create<ResourcesStore>((set, get) => ({
  resources: [],
  isLoading: false,
  error: null,

  fetchResources: async (classId?: string, subjectId?: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await resourcesService.getResources(classId, subjectId)
      if (response.success && response.data) {
        set({ resources: response.data, isLoading: false })
      } else {
        set({ error: response.error || "Failed to fetch resources", isLoading: false })
      }
    } catch (error) {
      set({ error: "Network error occurred", isLoading: false })
    }
  },

  uploadResource: async (resource) => {
    set({ isLoading: true, error: null })
    try {
      const response = await resourcesService.uploadResource(resource)
      if (response.success && response.data) {
        const { resources } = get()
        set({ resources: [...resources, response.data], isLoading: false })
      } else {
        set({ error: response.error || "Failed to upload resource", isLoading: false })
      }
    } catch (error) {
      set({ error: "Network error occurred", isLoading: false })
    }
  },

  deleteResource: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await resourcesService.deleteResource(id)
      if (response.success) {
        const { resources } = get()
        const filteredResources = resources.filter((r) => r.id !== id)
        set({ resources: filteredResources, isLoading: false })
      } else {
        set({ error: response.error || "Failed to delete resource", isLoading: false })
      }
    } catch (error) {
      set({ error: "Network error occurred", isLoading: false })
    }
  },

  clearError: () => set({ error: null }),
}))
