import { create } from "zustand"
import type { Payment, PaymentType } from "@/types"
import { paymentsService } from "@/services/payments-service"

interface PaymentsState {
  payments: Payment[]
  paymentTypes: PaymentType[]
  isLoading: boolean
  error: string | null
}

interface PaymentsStore extends PaymentsState {
  fetchPayments: (studentId: string) => Promise<void>
  fetchPaymentTypes: (schoolId: string) => Promise<void>
  makePayment: (paymentId: string) => Promise<void>
  clearError: () => void
}

export const usePaymentsStore = create<PaymentsStore>((set, get) => ({
  payments: [],
  paymentTypes: [],
  isLoading: false,
  error: null,

  fetchPayments: async (studentId: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await paymentsService.getStudentPayments(studentId)
      if (response.success && response.data) {
        set({ payments: response.data, isLoading: false })
      } else {
        set({ error: response.error || "Failed to fetch payments", isLoading: false })
      }
    } catch (error) {
      set({ error: "Network error occurred", isLoading: false })
    }
  },

  fetchPaymentTypes: async (schoolId: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await paymentsService.getPaymentTypes(schoolId)
      if (response.success && response.data) {
        set({ paymentTypes: response.data, isLoading: false })
      } else {
        set({ error: response.error || "Failed to fetch payment types", isLoading: false })
      }
    } catch (error) {
      set({ error: "Network error occurred", isLoading: false })
    }
  },

  makePayment: async (paymentId: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await paymentsService.makePayment(paymentId)
      if (response.success) {
        // Refresh payments after successful payment
        const { payments } = get()
        const updatedPayments = payments.map((p) =>
          p.id === paymentId ? { ...p, status: "completed" as const, paidDate: new Date().toISOString() } : p,
        )
        set({ payments: updatedPayments, isLoading: false })
      } else {
        set({ error: response.error || "Payment failed", isLoading: false })
      }
    } catch (error) {
      set({ error: "Network error occurred", isLoading: false })
    }
  },

  clearError: () => set({ error: null }),
}))
