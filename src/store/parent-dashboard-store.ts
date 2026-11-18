import { create } from "zustand"
import axiosInstance from "@/services/api"

export interface ParentWard {
  id: string
  userId: string
  firstName: string
  lastName: string
  studentUin?: string
  avatar?: string | null
  gender?: string
  className: string
  results: ParentWardResult[]
  payments: ParentWardPayment[]
  outstandingPayments: ParentOutstandingPayment[]
}

export const getParentResults = (children: ParentWard[]) => children.flatMap((child) =>
  child.results.map((result) => ({
    id: result.id,
    studentId: child.id,
    subjectId: result.subjectCode,
    subjectName: result.subjectCode,
    subjectCode: result.subjectCode,
    term: String(result.term),
    academicYear: result.session,
    score: result.score,
    grade: result.grade,
    remarks: result.remarks,
    createdAt: result.dateCreated || "",
  })))

export const getParentPayments = (children: ParentWard[]) => children.flatMap((child) => [
  ...child.payments.map((payment) => ({
    id: payment.id,
    studentId: child.id,
    paymentTypeId: payment.paymentTypeId,
    amount: payment.amount,
    status: payment.status,
    dueDate: "",
    paidDate: payment.status === "completed" ? payment.datePaid : undefined,
    description: payment.description,
    createdAt: payment.datePaid,
    transactionReference: payment.transactionReference,
  })),
  ...child.outstandingPayments.map((payment) => ({
    id: payment.id,
    studentId: child.id,
    paymentTypeId: payment.paymentTypeId,
    amount: payment.amount,
    status: "pending" as const,
    dueDate: "",
    description: `${payment.paymentTypeName} - ${payment.term} ${payment.session}`,
    createdAt: "",
  })),
])

export interface ParentWardResult {
  id: string
  subjectCode: string
  term: number
  session: string
  score: number
  grade: string
  remarks: string
  dateCreated?: string
  studentId: string
  studentName: string
}

export interface ParentWardPayment {
  id: string
  studentId: string
  studentName: string
  paymentTypeId: string
  description: string
  amount: number
  term: string
  session: string
  status: "pending" | "completed" | "failed"
  transactionReference: string
  datePaid: string
}

export interface ParentOutstandingPayment {
  id: string
  studentId: string
  studentName: string
  paymentTypeId: string
  paymentTypeName: string
  description: string
  amount: number
  session: string
  term: string
}

export interface ParentLearningData {
  assignments: { id: string; title: string; instructions: string; dueDate: string; subjectName: string; assignmentFile?: string | null }[]
  learningMaterials: { id: string; name: string; description: string; subjectName?: string | null; files: { id: string; mediaUrl: string; mediaType: string }[] }[]
  announcements: { id: string; title: string; message: string; datePosted: string; classId?: string | null }[]
}
export interface ParentAttendanceRecord {
  id: string
  studentId: string
  studentName: string
  attendanceDate: string
  status: string
  remarks?: string | null
}

interface ParentDashboardState {
  parentId: string | null
  children: ParentWard[]
  learning: ParentLearningData | null
  attendance: ParentAttendanceRecord[]
  isLoading: boolean
  error: string | null
  fetchDashboard: () => Promise<void>
  fetchLearning: () => Promise<void>
  fetchAttendance: () => Promise<void>
  startPayment: (studentId: string, paymentTypeId: string) => Promise<void>
}

export const useParentDashboardStore = create<ParentDashboardState>((set) => ({
  parentId: null,
  children: [],
  learning: null,
  attendance: [],
  isLoading: false,
  error: null,

  fetchDashboard: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await axiosInstance.get("/Parent/dashboard")
      const data = response.data.data
      const children: ParentWard[] = (data.children || []).map((child: any) => ({
        ...child,
        results: (child.results || []).map((result: any) => ({
          ...result,
          studentId: child.id,
          studentName: `${child.firstName} ${child.lastName}`,
          academicYear: result.session,
          subjectId: result.subjectCode,
          createdAt: result.dateCreated || new Date().toISOString(),
        })),
        payments: (child.payments || []).map((payment: any) => ({
          ...payment,
          studentId: child.id,
          studentName: `${child.firstName} ${child.lastName}`,
          description: `${payment.paymentType} - ${payment.term} ${payment.session}`,
          dueDate: payment.datePaid,
          paidDate: payment.status === "Completed" ? payment.datePaid : undefined,
          status: String(payment.status).toLowerCase(),
        })),
        outstandingPayments: (child.outstandingPayments || []).map((payment: any) => ({
          ...payment,
          id: `${child.id}-${payment.paymentTypeId}`,
          studentId: child.userId,
          studentName: `${child.firstName} ${child.lastName}`,
        })),
      }))
      set({ parentId: data.parentId, children, isLoading: false })
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Failed to load parent dashboard", isLoading: false })
    }
  },

  fetchLearning: async () => {
    try {
      const response = await axiosInstance.get("/Parent/learning")
      set({ learning: response.data.data })
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Failed to load learning information" })
    }
  },

  fetchAttendance: async () => {
    set({ error: null })
    try {
      const response = await axiosInstance.get("/Parent/attendance")
      set({ attendance: response.data.data || [] })
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Failed to load attendance" })
    }
  },

  startPayment: async (studentId, paymentTypeId) => {
    set({ error: null })
    try {
      const response = await axiosInstance.post("/Payment/initiate", { studentId, paymentTypeId })
      const authorizationUrl = response.data.AuthorizationUrl || response.data.authorizationUrl
      if (!authorizationUrl) throw new Error("Payment authorization URL was not returned")
      window.location.assign(authorizationUrl)
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Failed to start payment"
      set({ error: message })
      throw error
    }
  },
}))
