import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { useAuthStore, useParentDashboardStore } from "@/store"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreditCard, AlertCircle } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import axiosInstance from "@/services/api"
import { showError } from "@/lib/notifications"

export default function ParentPayments() {
  const [searchParams] = useSearchParams()
  const wardParam = searchParams.get("ward")
  const { user } = useAuthStore()
  const { children, isLoading, error, fetchDashboard, startPayment } = useParentDashboardStore()
  const [selectedWard, setSelectedWard] = useState(wardParam || "all")
  const [processingPayment, setProcessingPayment] = useState<string | null>(null)

  useEffect(() => {
    if (user) void fetchDashboard()
  }, [user?.id, fetchDashboard])
  useEffect(() => {
    if (wardParam) setSelectedWard(wardParam)
  }, [wardParam])

  const filteredChildren = selectedWard === "all" ? children : children.filter((child) => child.id === selectedWard)
  const outstanding = useMemo(() => filteredChildren.flatMap((child) => child.outstandingPayments), [filteredChildren])
  const history = useMemo(() => filteredChildren.flatMap((child) => child.payments.map((payment) => ({ ...payment, studentName: `${child.firstName} ${child.lastName}` }))), [filteredChildren])
  const pendingCount = outstanding.length + history.filter((payment) => payment.status === "pending").length
  const pendingTotal = outstanding.reduce((sum, payment) => sum + payment.amount, 0)
  const paid = history.filter((payment) => payment.status === "completed")
  const paidTotal = paid.reduce((sum, payment) => sum + payment.amount, 0)

  const handlePayment = async (studentId: string, paymentTypeId: string, key: string) => {
    setProcessingPayment(key)
    try {
      await startPayment(studentId, paymentTypeId)
    } finally {
      setProcessingPayment(null)
    }
  }

  const downloadReceipt = async (paymentId: string) => {
    try {
      const response = await axiosInstance.get(`/Parent/payment-receipt/${paymentId}`)
      const receipt = response.data.data
      const escape = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character] || character))
      const html = `<!doctype html><html><head><meta charset="utf-8"><title>Payment receipt</title><style>body{font:16px Arial,sans-serif;max-width:720px;margin:48px auto;color:#172033}h1{color:#123b67}.row{padding:12px 0;border-bottom:1px solid #ddd}.label{color:#667085}.amount{font-size:24px;font-weight:bold}</style></head><body><h1>Payment Receipt</h1><p>Official record of a completed school payment</p><div class="row"><span class="label">Student</span><br>${escape(receipt.studentName)} (${escape(receipt.studentUin)})</div><div class="row"><span class="label">Payment</span><br>${escape(receipt.paymentType)}</div><div class="row"><span class="label">Term / Session</span><br>${escape(receipt.term)} term · ${escape(receipt.session)}</div><div class="row"><span class="label">Paid at</span><br>${escape(formatDate(receipt.paidAt))}</div><div class="row"><span class="label">Transaction reference</span><br>${escape(receipt.transactionReference)}</div><p class="amount">${escape(formatCurrency(receipt.amount))}</p></body></html>`
      const url = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" }))
      const anchor = document.createElement("a")
      anchor.href = url
      anchor.download = `payment-receipt-${paymentId}.html`
      anchor.click()
      URL.revokeObjectURL(url)
    } catch (error: any) {
      showError(error.response?.data?.message || "Could not download this receipt")
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Payments"
          description="Review outstanding fees and payment history for your children"
          actions={
            <Select value={selectedWard} onValueChange={setSelectedWard}>
              <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Children</SelectItem>
                {children.map((child) => <SelectItem key={child.id} value={child.id}>{child.firstName} {child.lastName}</SelectItem>)}
              </SelectContent>
            </Select>
          }
        />

        {isLoading ? <div className="flex h-64 items-center justify-center"><LoadingSpinner size="lg" /></div> : null}
        {error ? <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert> : null}
        {!isLoading && !error && (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <Card><CardHeader><CardTitle className="text-sm">Outstanding Fees</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{outstanding.length}</div><p className="text-sm text-muted-foreground">{formatCurrency(pendingTotal)}</p></CardContent></Card>
              <Card><CardHeader><CardTitle className="text-sm">Pending Transactions</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{history.filter((payment) => payment.status === "pending").length}</div><p className="text-sm text-muted-foreground">Awaiting payment confirmation</p></CardContent></Card>
              <Card><CardHeader><CardTitle className="text-sm">Completed Payments</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{paid.length}</div><p className="text-sm text-muted-foreground">{formatCurrency(paidTotal)} paid</p></CardContent></Card>
            </div>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" />Outstanding Fees</CardTitle><CardDescription>Fees currently due for this academic term</CardDescription></CardHeader>
              <CardContent className="space-y-3">
                {outstanding.length === 0 ? <p className="py-4 text-center text-sm text-muted-foreground">No outstanding fees for the selected child or children.</p> : outstanding.map((fee) => {
                  const key = `${fee.studentId}-${fee.paymentTypeId}`
                  return <div key={key} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
                    <div><p className="font-medium">{fee.paymentTypeName}</p><p className="text-sm text-muted-foreground">{fee.studentName} · {fee.term} term · {fee.session}</p>{fee.description && <p className="text-sm text-muted-foreground">{fee.description}</p>}</div>
                    <div className="flex items-center gap-3"><strong>{formatCurrency(fee.amount)}</strong><Button onClick={() => void handlePayment(fee.studentId, fee.paymentTypeId, key)} disabled={processingPayment === key}>{processingPayment === key ? <LoadingSpinner size="sm" /> : "Pay Now"}</Button></div>
                  </div>
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Payment History</CardTitle><CardDescription>Payment transactions for the selected child or children</CardDescription></CardHeader>
              <CardContent className="space-y-3">
                {history.length === 0 ? <p className="py-4 text-center text-sm text-muted-foreground">No payment transactions yet.</p> : history.map((payment) => <div key={payment.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
                  <div><p className="font-medium">{payment.description}</p><p className="text-sm text-muted-foreground">{payment.studentName} · {payment.term} term · {payment.session}</p><p className="text-xs text-muted-foreground">{payment.transactionReference || "No reference"} · {payment.datePaid ? formatDate(payment.datePaid) : "Date unavailable"}</p></div>
                  <div className="flex items-center gap-3"><strong>{formatCurrency(payment.amount)}</strong><Badge variant={payment.status === "completed" ? "default" : payment.status === "failed" ? "destructive" : "secondary"}>{payment.status}</Badge>{payment.status === "completed" && <Button variant="outline" size="sm" onClick={() => void downloadReceipt(payment.id)}>Download Receipt</Button>}</div>
                </div>)}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
