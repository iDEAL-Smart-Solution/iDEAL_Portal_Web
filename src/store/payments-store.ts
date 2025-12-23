import { create } from "zustand"
import type { Payment, PaymentType } from "@/types"
import axiosInstance from "@/services/api"

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
      const response = await axiosInstance.get(`/Payment/student-payments?studentId=${studentId}`)
      
      // Map backend response to frontend Payment type
      const mappedPayments: Payment[] = response.data.data.map((item: any) => ({
        id: item.id,
        studentId: studentId,
        paymentTypeId: "",
        amount: item.amount,
        status: item.status.toLowerCase(),
        dueDate: item.datePaid,
        paidDate: item.status.toLowerCase() === "completed" ? item.datePaid : undefined,
        description: `${item.paymentType} - ${item.term} ${item.session}`,
        createdAt: item.datePaid,
      }))
      
      set({ payments: mappedPayments, isLoading: false })
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Failed to fetch payments", isLoading: false })
    }
  },

  fetchPaymentTypes: async (schoolId: string) => {
    set({ isLoading: true, error: null })
    try {
      // TODO: Integrate with backend PaymentType API
      // const response = await axiosInstance.get(`/PaymentType/get-all-payment-types?schoolId=${schoolId}`)
      // set({ paymentTypes: response.data.data, isLoading: false })
      throw new Error("PaymentType API integration pending")
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Failed to fetch payment types", isLoading: false })
    }
  },

  makePayment: async (paymentId: string) => {
    set({ isLoading: true, error: null })
    try {
      // TODO: Integrate with backend Payment API
      // const response = await axiosInstance.post(`/Payment/make-payment/${paymentId}`)
      // const { payments } = get()
      // const updatedPayments = payments.map((p) =>
      //   p.id === paymentId ? { ...p, status: "completed" as const, paidDate: new Date().toISOString() } : p,
      // )
      // set({ payments: updatedPayments, isLoading: false })
      throw new Error("Payment API integration pending")
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Payment failed", isLoading: false })
    }
  },

  clearError: () => set({ error: null }),
}))
