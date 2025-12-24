import { create } from "zustand"
import type { Resource } from "@/types"
import axiosInstance from "@/services/api"

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
      const response = await axiosInstance.get('/Resource/get-all-resources')
      
      // Map backend response to frontend Resource type
      const mappedResources: Resource[] = response.data.data.map((item: any) => ({
        id: item.id,
        title: item.name,
        description: item.description,
        type: "other" as const,
        url: item.media && item.media.length > 0 ? item.media[0].mediaUrl : "",
        subjectId: "",
        teacherId: "",
        classIds: [],
        createdAt: new Date().toISOString(),
        subjectName: "",
        link: item.media && item.media.length > 0 ? item.media[0].mediaUrl : "",
        fileUrl: item.media && item.media.length > 0 ? item.media[0].mediaUrl : "",
      }))
      
      set({ resources: mappedResources, isLoading: false })
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Failed to fetch resources", isLoading: false })
    }
  },

  uploadResource: async (resource) => {
    set({ isLoading: true, error: null })
    try {
      // TODO: Integrate with backend Resource API
      // const response = await axiosInstance.post("/Resource/upload-resource", resource)
      // const { resources } = get()
      // set({ resources: [...resources, response.data.data], isLoading: false })
      throw new Error("Resource API integration pending")
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Failed to upload resource", isLoading: false })
    }
  },

  deleteResource: async (id) => {
    set({ isLoading: true, error: null })
    try {
      // TODO: Integrate with backend Resource API
      // await axiosInstance.delete(`/Resource/delete-resource/${id}`)
      // const { resources } = get()
      // const filteredResources = resources.filter((r) => r.id !== id)
      // set({ resources: filteredResources, isLoading: false })
      throw new Error("Resource API integration pending")
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Failed to delete resource", isLoading: false })
    }
  },

  clearError: () => set({ error: null }),
}))
