import { create } from "zustand"
import type { Payment, PaymentType } from "@/types"
import axiosInstance from "@/services/api"

interface OutstandingPayment {
  paymentTypeId: string
  paymentTypeName: string
  description: string
  amount: number
  className: string | null
}

interface PaymentsState {
  payments: Payment[]
  outstandingPayments: OutstandingPayment[]
  isLoading: boolean
  error: string | null
}

interface PaymentsStore extends PaymentsState {
  fetchPaymentDashboard: (studentId: string) => Promise<void>
  initiatePayment: (studentId: string, paymentTypeId: string) => Promise<void>
  verifyPayment: (reference: string) => Promise<{ success: boolean; message: string }>
  clearError: () => void
}

export const usePaymentsStore = create<PaymentsStore>((set, get) => ({
  payments: [],
  outstandingPayments: [],
  isLoading: false,
  error: null,

  fetchPaymentDashboard: async (studentId: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axiosInstance.get(`/Payment/student-payment-dashboard?studentId=${studentId}`)
      
      const { outstandingPayments, paymentHistory } = response.data.data
      
      // Map payment history to frontend Payment type
      const mappedPayments: Payment[] = paymentHistory.map((item: any) => ({
        id: item.id,
        studentId: studentId,
        paymentTypeId: item.paymentTypeId,
        amount: item.amount,
        status: item.status.toLowerCase(),
        dueDate: item.datePaid,
        paidDate: item.status.toLowerCase() === "completed" ? item.datePaid : undefined,
        description: `${item.paymentType} - ${item.term} ${item.session}`,
        createdAt: item.datePaid,
        transactionReference: item.transactionReference,
      }))

      // Map outstanding payments
      const mappedOutstanding: OutstandingPayment[] = outstandingPayments.map((item: any) => ({
        paymentTypeId: item.paymentTypeId,
        paymentTypeName: item.paymentTypeName,
        description: item.description,
        amount: item.amount,
        className: item.className,
      }))
      
      set({ payments: mappedPayments, outstandingPayments: mappedOutstanding, isLoading: false })
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Failed to fetch payment data", isLoading: false })
    }
  },

  initiatePayment: async (studentId: string, paymentTypeId: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axiosInstance.post(`/Payment/initiate`, {
        studentId,
        paymentTypeId
      })
      
      // Redirect to payment gateway
      if (response.data.authorizationUrl) {
        window.location.href = response.data.authorizationUrl
      }
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Failed to initiate payment", isLoading: false })
      throw error
    }
  },

  verifyPayment: async (reference: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axiosInstance.post(`/Payment/verify?reference=${reference}`)
      set({ isLoading: false })
      return { success: true, message: response.data.message || "Payment verified successfully" }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Failed to verify payment"
      set({ error: errorMsg, isLoading: false })
      return { success: false, message: errorMsg }
    }
  },

  clearError: () => set({ error: null }),
}))
