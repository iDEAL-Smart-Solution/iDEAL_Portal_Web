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
  fetchResources: (classId?: string) => Promise<void>
  fetchResourcesByUserId: (userId: string) => Promise<void>
  fetchResourceTypes: () => Promise<void>
  uploadResource: (data: {name: string, description: string, resourceTypeId: string, subjectId?: string, files: File[]}) => Promise<void>
  deleteResource: (id: string) => Promise<void>
  downloadResource: (url: string, filename: string) => Promise<void>
  clearError: () => void
}

export const useResourcesStore = create<ResourcesStore>((set, get) => ({
  resources: [],
  resourceTypes: [],
  isLoading: false,
  error: null,

  fetchResources: async (classId?: string) => {
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

      await axiosInstance.post("/Resource/create-resource", formData)
      
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

  downloadResource: async (url: string, filename: string) => {
    try {
      // Check if URL is an external URL (starts with http) or a relative path
      const isExternalUrl = url.startsWith('http://') || url.startsWith('https://')
      
      // For relative paths (local wwwroot files), prepend the backend base URL
      const fullUrl = isExternalUrl ? url : `http://localhost:5093${url}`
      
      let blob: Blob
      
      if (isExternalUrl) {
        // For external URLs (e.g., Azure blob storage), use fetch with cors
        const response = await fetch(fullUrl, {
          method: 'GET',
          mode: 'cors',
        })
        
        if (!response.ok) {
          throw new Error('Download failed')
        }
        
        blob = await response.blob()
      } else {
        // For local wwwroot files, fetch directly without auth (static files)
        const response = await fetch(fullUrl, {
          method: 'GET',
        })
        
        if (!response.ok) {
          throw new Error('Download failed')
        }
        
        blob = await response.blob()
      }
      
      // Extract the actual filename from the URL if possible
      const urlParts = url.split('/')
      const urlFilename = urlParts[urlParts.length - 1].split('?')[0] // Remove query params
      
      // Remove the 4-character prefix added during upload (e.g., "e9e6" from "e9e6filename.docx")
      // Check if filename starts with 4 alphanumeric characters
      let cleanFilename = urlFilename
      if (urlFilename.length > 4 && /^[a-zA-Z0-9]{4}/.test(urlFilename)) {
        cleanFilename = urlFilename.substring(4) // Remove first 4 characters
      }
      
      // Use the cleaned filename if it has an extension, otherwise use the provided filename
      const finalFilename = cleanFilename.includes('.') ? decodeURIComponent(cleanFilename) : filename
      
      // Create a blob URL
      const blobUrl = window.URL.createObjectURL(blob)
      
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = finalFilename
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      
      // Cleanup after a short delay
      setTimeout(() => {
        document.body.removeChild(link)
        window.URL.revokeObjectURL(blobUrl)
      }, 100)
    } catch (error) {
      console.error('Download error:', error)
      // Fallback: open in new tab if download fails
      const fullUrl = url.startsWith('http') ? url : `http://localhost:5093${url}`
      window.open(fullUrl, '_blank')
    }
  },

  clearError: () => set({ error: null }),
}))
