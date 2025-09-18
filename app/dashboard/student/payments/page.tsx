"use client"

import { useEffect, useState } from "react"
import { useAuthStore, usePaymentsStore } from "@/store"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PageHeader } from "@/components/ui/page-header"
import { DataTable } from "@/components/ui/data-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { EmptyState } from "@/components/ui/empty-state"
import { StatusBadge } from "@/components/ui/status-badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CreditCard, DollarSign, Clock, CheckCircle, AlertCircle, XCircle } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { Payment } from "@/types"

export default function StudentPayments() {
  const { user } = useAuthStore()
  const { payments, fetchPayments, makePayment, isLoading, error } = usePaymentsStore()
  const [processingPayment, setProcessingPayment] = useState<string | null>(null)

  useEffect(() => {
    if (user?.id) {
      fetchPayments(user.id)
    }
  }, [user, fetchPayments])

  const handlePayment = async (paymentId: string) => {
    setProcessingPayment(paymentId)
    try {
      await makePayment(paymentId)
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
  const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0)
  const totalPaid = completedPayments.reduce((sum, p) => sum + p.amount, 0)

  const columns = [
    {
      key: "description" as keyof Payment,
      label: "Description",
      render: (value: string) => <div className="font-medium">{value}</div>,
    },
    {
      key: "amount" as keyof Payment,
      label: "Amount",
      render: (value: number) => <div className="font-semibold">{formatCurrency(value)}</div>,
    },
    {
      key: "dueDate" as keyof Payment,
      label: "Due Date",
      render: (value: string) => formatDate(value),
    },
    {
      key: "status" as keyof Payment,
      label: "Status",
      render: (value: string) => <StatusBadge status={value as any} />,
    },
    {
      key: "paidDate" as keyof Payment,
      label: "Paid Date",
      render: (value: string) => (value ? formatDate(value) : "-"),
    },
    {
      key: "id" as keyof Payment,
      label: "Actions",
      render: (value: string, payment: Payment) =>
        payment.status === "pending" ? (
          <Button size="sm" onClick={() => handlePayment(value)} disabled={processingPayment === value}>
            {processingPayment === value ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Processing...
              </>
            ) : (
              "Pay Now"
            )}
          </Button>
        ) : payment.status === "failed" ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handlePayment(value)}
            disabled={processingPayment === value}
          >
            {processingPayment === value ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Retrying...
              </>
            ) : (
              "Retry Payment"
            )}
          </Button>
        ) : (
          <Badge variant="secondary">Completed</Badge>
        ),
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader title="Payments" description="Manage your school fees and payments" />

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Error loading payments: {error}</AlertDescription>
          </Alert>
        ) : payments.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No Payments Found"
            description="You don't have any payment records yet."
          />
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingPayments.length}</div>
                  <p className="text-xs text-muted-foreground">{formatCurrency(totalPending)} total</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completedPayments.length}</div>
                  <p className="text-xs text-muted-foreground">{formatCurrency(totalPaid)} paid</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Failed</CardTitle>
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{failedPayments.length}</div>
                  <p className="text-xs text-muted-foreground">Need attention</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{payments.length}</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
              </Card>
            </div>

            {/* Urgent Payments Alert */}
            {pendingPayments.some((p) => new Date(p.dueDate) < new Date()) && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You have overdue payments. Please settle them as soon as possible to avoid late fees.
                </AlertDescription>
              </Alert>
            )}

            {/* Payments Table */}
            <DataTable
              title="Payment History"
              description="Complete list of your payment records"
              data={payments}
              columns={columns}
              searchable
              searchPlaceholder="Search payments..."
            />
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
