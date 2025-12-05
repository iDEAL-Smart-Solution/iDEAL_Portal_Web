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
      // TODO: Integrate with backend Resource API
      // const params = new URLSearchParams()
      // if (classId) params.append("classId", classId)
      // if (subjectId) params.append("subjectId", subjectId)
      // const response = await axiosInstance.get(`/Resource/get-all-resources?${params}`)
      // set({ resources: response.data.data, isLoading: false })
      throw new Error("Resource API integration pending")
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
