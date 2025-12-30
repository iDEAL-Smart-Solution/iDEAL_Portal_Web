import { create } from "zustand"
import type { Resource } from "@/types"
import axiosInstance from "@/services/api"

interface ResourcesState {
  resources: Resource[]
  resourceTypes: Array<{id: string, name: string, description: string}>
  isLoading: boolean
  error: string | null
}

interface ResourcesStore extends ResourcesState {
  fetchResources: (classId?: string, subjectId?: string) => Promise<void>
  fetchResourcesByUserId: (userId: string) => Promise<void>
  fetchResourceTypes: () => Promise<void>
  uploadResource: (data: {name: string, description: string, resourceTypeId: string, subjectId?: string, files: File[]}) => Promise<void>
  deleteResource: (id: string) => Promise<void>
  clearError: () => void
}

export const useResourcesStore = create<ResourcesStore>((set, get) => ({
  resources: [],
  resourceTypes: [],
  isLoading: false,
  error: null,

  fetchResources: async (classId?: string, subjectId?: string) => {
    set({ isLoading: true, error: null })
    try {
      let response;
      
      // If classId is provided (student view), use class-based endpoint
      if (classId) {
        console.log('Fetching resources for classId:', classId)
        response = await axiosInstance.get(`/Resource/get-resources-by-class?classId=${classId}`)
      } else {
        // Otherwise fetch all resources (admin view)
        response = await axiosInstance.get('/Resource/get-all-resources')
      }
      
      // Backend returns: { statusCode, message, data: [...] }
      const resourcesData = response.data.data || response.data || []
      
      // Map backend response to frontend Resource type
      const mappedResources: Resource[] = resourcesData.map((item: any) => ({
        id: item.id,
        title: item.name,
        description: item.description,
        type: item.media && item.media.length > 0 ? item.media[0].mediaType : "other",
        url: item.media && item.media.length > 0 ? item.media[0].mediaUrl : "",
        subjectId: "",
        teacherId: "",
        classIds: [],
        subjectName: "",
        link: item.media && item.media.length > 0 ? item.media[0].mediaUrl : "",
        fileUrl: item.media && item.media.length > 0 ? item.media[0].mediaUrl : "",
      }))
      
      set({ resources: mappedResources, isLoading: false })
    } catch (error: any) {
      let errorMessage = "Failed to fetch resources"
      
      if (error.code === "ERR_NETWORK") {
        errorMessage = "Network error: Unable to connect to server. Please check if the backend is running."
      } else if (error.response) {
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`
      } else if (error.request) {
        errorMessage = "No response from server. Please check your connection."
      } else if (error.message) {
        errorMessage = error.message
      }
      
      set({ error: errorMessage, isLoading: false })
      console.error("Error fetching resources:", error)
    }
  },

  fetchResourcesByUserId: async (userId: string) => {
    set({ isLoading: true, error: null })
    try {
      console.log('Fetching resources for userId:', userId)
      const response = await axiosInstance.get(`/Resource/get-resources-by-staff?staffId=${userId}`)
      
      const resourcesData = response.data.data || response.data || []
      
      const mappedResources: Resource[] = resourcesData.map((item: any) => ({
        id: item.id,
        title: item.name,
        description: item.description,
        type: item.media && item.media.length > 0 ? item.media[0].mediaType : "other",
        url: item.media && item.media.length > 0 ? item.media[0].mediaUrl : "",
        subjectId: "",
        teacherId: "",
        classIds: [],
        subjectName: "",
        link: item.media && item.media.length > 0 ? item.media[0].mediaUrl : "",
        fileUrl: item.media && item.media.length > 0 ? item.media[0].mediaUrl : "",
      }))
      
      set({ resources: mappedResources, isLoading: false })
    } catch (error: any) {
      let errorMessage = "Failed to fetch resources"
      
      if (error.code === "ERR_NETWORK") {
        errorMessage = "Network error: Unable to connect to server. Please check if the backend is running."
      } else if (error.response) {
        // Server responded with error
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`
      } else if (error.request) {
        // Request made but no response
        errorMessage = "No response from server. Please check your connection."
      } else if (error.message) {
        errorMessage = error.message
      }
      
      set({ error: errorMessage, isLoading: false })
      console.error("Error fetching resources by userId:", error)
    }
  },

  fetchResourceTypes: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await axiosInstance.get('/ResourceType/get-all')
      set({ resourceTypes: response.data || [], isLoading: false })
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Failed to fetch resource types", isLoading: false })
    }
  },

  uploadResource: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const formData = new FormData()
      formData.append('Name', data.name)
      formData.append('Description', data.description || '')
      formData.append('ResourceTypeId', data.resourceTypeId)
      
      // Add SubjectId if provided
      if (data.subjectId) {
        formData.append('SubjectId', data.subjectId)
      }
      
      // Append files - ASP.NET Core will bind IFormFile collection
      data.files.forEach((file) => {
        formData.append('Media', file)
      })

      const response = await axiosInstance.post("/Resource/create-resource", formData)
      
      // Refresh the resources list
      await get().fetchResources()
      set({ isLoading: false })
    } catch (error: any) {
      set({ error: error.response?.data?.message || error.response?.data?.title || "Failed to upload resource", isLoading: false })
      throw error
    }
  },

  deleteResource: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await axiosInstance.delete(`/Resource/delete-resource?id=${id}`)
      const { resources } = get()
      const filteredResources = resources.filter((r) => r.id !== id)
      set({ resources: filteredResources, isLoading: false })
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Failed to delete resource", isLoading: false })
      throw error
    }
  },

  clearError: () => set({ error: null }),
}))
