import { useEffect, useState } from "react"
import { useAuthStore, usePaymentsStore } from "@/store"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { EmptyState } from "@/components/ui/empty-state"
import { StatusBadge } from "@/components/ui/status-badge"
import { CreditCard, DollarSign, Clock, CheckCircle, XCircle } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export default function StudentPayments() {
  const { user } = useAuthStore()
  const { payments, outstandingPayments, fetchPaymentDashboard, initiatePayment, verifyPayment, isLoading, error, clearError } = usePaymentsStore()
  const [processingPayment, setProcessingPayment] = useState<string | null>(null)
  const [verifyingPayment, setVerifyingPayment] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (user?.id) {
      fetchPaymentDashboard(user.id)
    }
  }, [user, fetchPaymentDashboard])

  useEffect(() => {
    // Check for payment reference in URL
    const urlParams = new URLSearchParams(window.location.search)
    const reference = urlParams.get('reference')
    
    if (reference && user?.id && !verifyingPayment) {
      setVerifyingPayment(true)
      verifyPayment(reference).then((result) => {
        if (result.success) {
          toast({
            variant: "success",
            title: "Payment Successful",
            description: result.message,
          })
          // Refresh payment dashboard
          fetchPaymentDashboard(user.id)
        } else {
          toast({
            variant: "destructive",
            title: "Payment Verification Failed",
            description: result.message,
          })
        }
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname)
        setVerifyingPayment(false)
      })
    }
  }, [user, verifyPayment, toast, fetchPaymentDashboard, verifyingPayment])

  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Payment Error",
        description: error,
      })
      clearError()
    }
  }, [error, toast, clearError])

  const handleInitiatePayment = async (paymentTypeId: string) => {
    if (!user?.id) return
    
    setProcessingPayment(paymentTypeId)
    try {
      await initiatePayment(user.id, paymentTypeId)
    } catch (error) {
      // Error is already set in the store
    } finally {
      setProcessingPayment(null)
    }
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    )
  }

  // Calculate statistics
  const pendingPayments = payments.filter((p) => p.status === "pending")
  const completedPayments = payments.filter((p) => p.status === "completed")
  const failedPayments = payments.filter((p) => p.status === "failed")
  const totalPaid = completedPayments.reduce((sum, p) => sum + p.amount, 0)
  
  // Check if a payment type has already been paid
  const isPaymentMade = (paymentTypeId: string) => {
    return payments.some(
      (p) => p.paymentTypeId === paymentTypeId && (p.status === "completed" || p.status === "pending")
    )
  }

  // Calculate actual outstanding (unpaid) payments
  const actualOutstandingPayments = outstandingPayments.filter(p => !isPaymentMade(p.paymentTypeId))
  const totalOutstanding = actualOutstandingPayments.reduce((sum, p) => sum + p.amount, 0)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader title="Payments" description="Manage your school fees and payments" />

        {verifyingPayment && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
            <LoadingSpinner size="sm" />
            <p className="text-blue-700">Verifying your payment...</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(totalPaid)}</div>
                  <p className="text-xs text-muted-foreground">{completedPayments.length} payments</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingPayments.length}</div>
                  <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Failed</CardTitle>
                  <XCircle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{failedPayments.length}</div>
                  <p className="text-xs text-muted-foreground">Need attention</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
                  <DollarSign className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{actualOutstandingPayments.length}</div>
                  <p className="text-xs text-muted-foreground">{formatCurrency(totalOutstanding)} total</p>
                </CardContent>
              </Card>
            </div>

            {/* Outstanding Payments Section */}
            <Card>
              <CardHeader>
                <CardTitle>Outstanding Payments</CardTitle>
                <p className="text-sm text-muted-foreground">All payment types for your class</p>
              </CardHeader>
              <CardContent>
                {outstandingPayments.length === 0 ? (
                  <EmptyState
                    icon={CheckCircle}
                    title="All Caught Up!"
                    description="You have no outstanding payments at this time."
                  />
                ) : (
                  <div className="space-y-4">
                    {outstandingPayments.map((payment) => {
                      const alreadyPaid = isPaymentMade(payment.paymentTypeId)
                      
                      return (
                      <div
                        key={payment.paymentTypeId}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-sm sm:text-base truncate">{payment.paymentTypeName}</h4>
                            {payment.className && (
                              <Badge variant="secondary" className="text-xs">
                                {payment.className}
                              </Badge>
                            )}
                            {alreadyPaid && (
                              <Badge className="text-xs bg-green-100 text-green-800 hover:bg-green-100">
                                Paid
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">{payment.description}</p>
                        </div>
                        <div className="mt-3 sm:mt-0 flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-lg sm:text-2xl font-bold">{formatCurrency(payment.amount)}</p>
                          </div>
                          <Button
                            onClick={() => handleInitiatePayment(payment.paymentTypeId)}
                            disabled={processingPayment === payment.paymentTypeId || alreadyPaid}
                            className="whitespace-nowrap"
                          >
                            {processingPayment === payment.paymentTypeId ? (
                              <>
                                <LoadingSpinner size="sm" className="mr-2" />
                                <span className="text-sm">Processing...</span>
                              </>
                            ) : alreadyPaid ? (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                <span className="text-sm">Paid</span>
                              </>
                            ) : (
                              <>
                                <CreditCard className="w-4 h-4 mr-2" />
                                <span className="text-sm">Pay Now</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )})}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment History Section */}
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <p className="text-sm text-muted-foreground">Your previous payment transactions</p>
              </CardHeader>
              <CardContent>
                {payments.length === 0 ? (
                  <EmptyState
                    icon={CreditCard}
                    title="No Payment History"
                    description="You haven't made any payments yet."
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Description
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Reference
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {payments.map((payment) => (
                          <tr key={payment.id} className="hover:bg-muted/30">
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="font-medium">{payment.description}</div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="font-semibold">{formatCurrency(payment.amount)}</div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                              {formatDate(payment.paidDate || payment.createdAt)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <StatusBadge status={payment.status as any} />
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-xs text-muted-foreground">
                              {payment.transactionReference || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
