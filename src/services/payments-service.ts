import type { ApiResponse, Payment, PaymentType } from "@/types"
import { mockPayments, mockPaymentTypes } from "@/lib/mock-data"

class PaymentsService {
  private delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  async getStudentPayments(studentId: string): Promise<ApiResponse<Payment[]>> {
    await this.delay(800)

    const payments = mockPayments.filter((p) => p.studentId === studentId)

    return {
      success: true,
      data: payments,
      message: "Payments fetched successfully",
    }
  }

  async getPaymentTypes(schoolId: string): Promise<ApiResponse<PaymentType[]>> {
    await this.delay(500)

    const paymentTypes = mockPaymentTypes.filter((pt) => pt.schoolId === schoolId)

    return {
      success: true,
      data: paymentTypes,
      message: "Payment types fetched successfully",
    }
  }

  async makePayment(paymentId: string): Promise<ApiResponse<void>> {
    await this.delay(2000) // Simulate payment processing

    // Mock payment processing
    const payment = mockPayments.find((p) => p.id === paymentId)
    if (payment) {
      payment.status = "completed"
      payment.paidDate = new Date().toISOString()

      return {
        success: true,
        message: "Payment completed successfully",
      }
    }

    return {
      success: false,
      error: "Payment not found",
    }
  }
}

export const paymentsService = new PaymentsService()
