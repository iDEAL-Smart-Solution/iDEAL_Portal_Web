import { create } from "zustand"
import type {
  PendingSubmission,
  SubmissionDetail,
  SubmissionResultItem,
  ApproveSubmissionRequest,
} from "@/types"
import axiosInstance from "@/services/api"

interface ResultApprovalState {
  pendingSubmissions: PendingSubmission[]
  currentSubmission: SubmissionDetail | null
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
}

interface ResultApprovalStore extends ResultApprovalState {
  fetchPendingSubmissions: () => Promise<void>
  fetchSubmissionDetail: (subjectId: string, term: number, session: string) => Promise<void>
  approveSubmission: (request: ApproveSubmissionRequest) => Promise<{ success: boolean; message?: string }>
  rejectResult: (resultId: string, reason: string) => Promise<{ success: boolean; message?: string }>
  clearCurrentSubmission: () => void
  clearError: () => void
}

export const useResultApprovalStore = create<ResultApprovalStore>((set, get) => ({
  pendingSubmissions: [],
  currentSubmission: null,
  isLoading: false,
  isSubmitting: false,
  error: null,

  fetchPendingSubmissions: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await axiosInstance.get("/result-approval/pending-submissions")
      const rawData = response.data?.data ?? response.data ?? []
      const submissionsArray = Array.isArray(rawData) ? rawData : []

      const mappedSubmissions: PendingSubmission[] = submissionsArray.map((item: any) => ({
        subjectId: item.subjectId || item.id || "",
        subjectName: item.subjectName || item.name || "Unknown Subject",
        subjectCode: item.subjectCode || item.code || "",
        classId: item.classId || "",
        className: item.className || "Unknown Class",
        term: typeof item.term === "number" ? item.term : Number(item.term) || 1,
        session: item.session || "",
        totalResults: item.totalResults ?? item.totalCount ?? 0,
        pendingCount: item.pendingCount ?? item.pendingResultsCount ?? 0,
        approvedCount: item.approvedCount ?? item.approvedResultsCount ?? 0,
        rejectedCount: item.rejectedCount ?? item.rejectedResultsCount ?? 0,
        submittedByStaffId: item.submittedByStaffId || item.staffId || item.teacherId || "",
        submittedByTeacherName: item.submittedByTeacherName || item.teacherName || "Subject Teacher",
        lastSubmittedAt: item.lastSubmittedAt || item.submittedAt || item.updatedAt || new Date().toISOString(),
      }))

      set({ pendingSubmissions: mappedSubmissions, isLoading: false })
    } catch (error: any) {
      console.error("Fetch pending submissions error:", error)
      const errorMessage =
        error.response?.data?.details ||
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch pending submissions"
      set({ error: errorMessage, isLoading: false })
    }
  },

  fetchSubmissionDetail: async (subjectId: string, term: number, session: string) => {
    set({ isLoading: true, error: null, currentSubmission: null })
    try {
      const url = `/result-approval/submissions/${subjectId}/${term}?session=${encodeURIComponent(session)}`
      const response = await axiosInstance.get(url)
      const payload = response.data?.data ?? response.data

      let resultsList: any[] = []
      let meta: Partial<SubmissionDetail> = {}

      if (Array.isArray(payload)) {
        resultsList = payload
      } else if (payload && typeof payload === "object") {
        resultsList = payload.results || payload.data || payload.items || []
        meta = {
          subjectId: payload.subjectId || subjectId,
          subjectName: payload.subjectName,
          subjectCode: payload.subjectCode,
          classId: payload.classId,
          className: payload.className,
          term: payload.term ?? term,
          session: payload.session || session,
          submittedByStaffId: payload.submittedByStaffId,
          submittedByTeacherName: payload.submittedByTeacherName,
          lastSubmittedAt: payload.lastSubmittedAt,
          totalResults: payload.totalResults ?? resultsList.length,
          pendingCount: payload.pendingCount,
          approvedCount: payload.approvedCount,
          rejectedCount: payload.rejectedCount,
        }
      }

      const mappedResults: SubmissionResultItem[] = resultsList.map((item: any) => {
        const firstCA = item.first_CA_Score ?? item.firstCAScore ?? item.firstCA ?? 0
        const secondCA = item.second_CA_Score ?? item.secondCAScore ?? item.secondCA ?? 0
        const thirdCA = item.third_CA_Score ?? item.thirdCAScore ?? item.thirdCA ?? 0
        const exam = item.exam_Score ?? item.examScore ?? item.exam ?? 0
        const total = item.total_Score ?? item.totalScore ?? item.total ?? (firstCA + secondCA + thirdCA + exam)

        let status = "pending"
        if (typeof item.status === "string") {
          status = item.status.toLowerCase()
        } else if (item.isApproved === true || item.approved === true) {
          status = "approved"
        } else if (item.isRejected === true || item.rejected === true) {
          status = "rejected"
        }

        return {
          id: item.id || item.resultId || "",
          studentId: item.studentId || "",
          studentUin: item.studentUin || item.uin || "N/A",
          studentName: item.studentName || item.fullName || (item.firstName ? `${item.firstName} ${item.lastName || ""}`.trim() : "Unknown Student"),
          subjectCode: item.subjectCode || meta.subjectCode,
          subjectName: item.subjectName || meta.subjectName,
          firstCAScore: firstCA,
          secondCAScore: secondCA,
          thirdCAScore: thirdCA,
          examScore: exam,
          totalScore: total,
          grade: item.grade || calculateGrade(total),
          status,
          rejectionReason: item.rejectionReason || item.reason || item.remarks || null,
          remarks: item.remarks || "",
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt,
        }
      })

      const detail: SubmissionDetail = {
        subjectId: meta.subjectId || subjectId,
        subjectName: meta.subjectName,
        subjectCode: meta.subjectCode,
        classId: meta.classId,
        className: meta.className,
        term: meta.term ?? term,
        session: meta.session || session,
        submittedByStaffId: meta.submittedByStaffId,
        submittedByTeacherName: meta.submittedByTeacherName,
        lastSubmittedAt: meta.lastSubmittedAt,
        totalResults: meta.totalResults ?? mappedResults.length,
        pendingCount: meta.pendingCount ?? mappedResults.filter((r) => r.status === "pending").length,
        approvedCount: meta.approvedCount ?? mappedResults.filter((r) => r.status === "approved").length,
        rejectedCount: meta.rejectedCount ?? mappedResults.filter((r) => r.status === "rejected").length,
        results: mappedResults,
      }

      set({ currentSubmission: detail, isLoading: false })
    } catch (error: any) {
      console.error("Fetch submission detail error:", error)
      const errorMessage =
        error.response?.data?.details ||
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch submission details"
      set({ error: errorMessage, isLoading: false })
    }
  },

  approveSubmission: async (request: ApproveSubmissionRequest) => {
    set({ isSubmitting: true, error: null })
    try {
      const response = await axiosInstance.post("/result-approval/approve", request)
      // Refetch submission list to keep state fresh
      await get().fetchPendingSubmissions()
      // If current submission is open, reload it
      const current = get().currentSubmission
      if (current && current.subjectId === request.subjectId && current.term === request.term) {
        await get().fetchSubmissionDetail(request.subjectId, request.term, request.session)
      }
      set({ isSubmitting: false })
      return {
        success: true,
        message: response.data?.message || "Submission approved successfully",
      }
    } catch (error: any) {
      console.error("Approve submission error:", error)
      const errorMessage =
        error.response?.data?.details ||
        error.response?.data?.message ||
        error.message ||
        "Failed to approve submission"
      set({ error: errorMessage, isSubmitting: false })
      throw error
    }
  },

  rejectResult: async (resultId: string, reason: string) => {
    set({ isSubmitting: true, error: null })
    try {
      const response = await axiosInstance.post(`/result-approval/${resultId}/reject`, { reason })
      // If current submission is open, reload it
      const current = get().currentSubmission
      if (current) {
        await get().fetchSubmissionDetail(current.subjectId, current.term, current.session)
      }
      // Refetch pending submissions list
      await get().fetchPendingSubmissions()
      set({ isSubmitting: false })
      return {
        success: true,
        message: response.data?.message || "Result rejected successfully",
      }
    } catch (error: any) {
      console.error("Reject result error:", error)
      const errorMessage =
        error.response?.data?.details ||
        error.response?.data?.message ||
        error.message ||
        "Failed to reject result"
      set({ error: errorMessage, isSubmitting: false })
      throw error
    }
  },

  clearCurrentSubmission: () => set({ currentSubmission: null }),
  clearError: () => set({ error: null }),
}))

function calculateGrade(score: number): string {
  if (score >= 70) return "A"
  if (score >= 60) return "B"
  if (score >= 50) return "C"
  if (score >= 45) return "D"
  if (score >= 40) return "E"
  return "F"
}
