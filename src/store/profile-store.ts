import { create } from "zustand"
import axiosInstance from "@/services/api"

type UserRole = "student" | "staff"

interface ProfileState {
  isLoading: boolean
  error: string | null
}

interface CompleteProfileParams {
  userRole: UserRole
  formData: {
    phoneNumber: string
    address: string
    gender: string
    dateOfBirth?: string
    sessionAdmitted?: string
    birthCertificate?: File | null
    previousResult?: File | null
    profilePicture?: File | null
  }
}

interface ProfileStore extends ProfileState {
  completeProfile: (params: CompleteProfileParams) => Promise<{ success: boolean; message?: string }>
  clearError: () => void
}

export const useProfileStore = create<ProfileStore>((set) => ({
  isLoading: false,
  error: null,

  completeProfile: async ({ userRole, formData }) => {
    set({ isLoading: true, error: null })

    try {
      const submitData = new FormData()

      if (userRole === "student") {
        submitData.append("PhoneNumber", formData.phoneNumber)
        submitData.append("Address", formData.address)
        submitData.append("Gender", formData.gender)
        submitData.append("DateOfBirth", formData.dateOfBirth || "")
        submitData.append("SessionAdmitted", formData.sessionAdmitted || "")

        if (formData.birthCertificate) {
          submitData.append("BirthCertificate", formData.birthCertificate)
        }

        if (formData.previousResult) {
          submitData.append("PreviousResult", formData.previousResult)
        }

        if (formData.profilePicture) {
          submitData.append("ProfilePicture", formData.profilePicture)
        }

        const response = await axiosInstance.put("/Student/complete-profile", submitData, {
          headers: { "Content-Type": "multipart/form-data" },
        })

        const payload = response.data
        set({ isLoading: false, error: null })
        return { success: Boolean(payload?.success), message: payload?.message }
      }

      submitData.append("PhoneNumber", formData.phoneNumber)
      submitData.append("Address", formData.address)
      submitData.append("Gender", formData.gender)

      if (formData.profilePicture) {
        submitData.append("ProfilePicture", formData.profilePicture)
      }

      const response = await axiosInstance.put("/Staff/complete-profile", submitData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      const payload = response.data
      set({ isLoading: false, error: null })
      return { success: Boolean(payload?.success), message: payload?.message }
    } catch (error: any) {
      const message = error.response?.data?.message || "An error occurred while updating profile"
      set({ isLoading: false, error: message })
      throw new Error(message)
    }
  },

  clearError: () => set({ error: null }),
}))
