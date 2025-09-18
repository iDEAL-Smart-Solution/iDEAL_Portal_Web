"use client"

import { CardDescription } from "@/components/ui/card"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreditCard, DollarSign, Clock, CheckCircle, AlertCircle, XCircle, Users } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { mockUsers } from "@/lib/mock-data"
import type { Payment } from "@/types"

export default function ParentPayments() {
  const searchParams = useSearchParams()
  const wardParam = searchParams.get("ward")

  const { user } = useAuthStore()
  const { payments, fetchPayments, makePayment, isLoading, error } = usePaymentsStore()
  const [selectedWard, setSelectedWard] = useState<string>(wardParam || "all")
  const [processingPayment, setProcessingPayment] = useState<string | null>(null)

  // Get ward information
  const wardIds = (user as any)?.wardIds || []
  const wards = mockUsers.filter((u) => wardIds.includes(u.id))

  useEffect(() => {
    if (wardIds.length > 0) {
      wardIds.forEach((wardId: string) => {
        fetchPayments(wardId)
      })
    }
  }, [wardIds, fetchPayments])

  useEffect(() => {
    if (wardParam && wardParam !== selectedWard) {
      setSelectedWard(wardParam)
    }
  }, [wardParam, selectedWard])

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

  // Filter payments based on selected ward
  const filteredPayments = selectedWard === "all" ? payments : payments.filter((p) => p.studentId === selectedWard)

  // Calculate statistics
  const pendingPayments = filteredPayments.filter((p) => p.status === "pending")
  const completedPayments = filteredPayments.filter((p) => p.status === "completed")
  const failedPayments = filteredPayments.filter((p) => p.status === "failed")
  const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0)
  const totalPaid = completedPayments.reduce((sum, p) => sum + p.amount, 0)

  const columns = [
    {
      key: "studentId" as keyof Payment,
      label: "Student",
      render: (value: string) => {
        const student = wards.find((w) => w.id === value)
        return (
          <div className="font-medium">{student ? `${student.firstName} ${student.lastName}` : "Unknown Student"}</div>
        )
      },
    },
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
        <PageHeader
          title="Payments"
          description="Manage school fees and payments for your children"
          actions={
            <Select value={selectedWard} onValueChange={setSelectedWard}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Children</SelectItem>
                {wards.map((ward) => (
                  <SelectItem key={ward.id} value={ward.id}>
                    {ward.firstName} {ward.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          }
        />

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Error loading payments: {error}</AlertDescription>
          </Alert>
        ) : filteredPayments.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No Payments Found"
            description={
              selectedWard === "all"
                ? "No payment records found for any of your children."
                : "No payment records found for the selected child."
            }
          />
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-5">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Children</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{selectedWard === "all" ? wards.length : 1}</div>
                  <p className="text-xs text-muted-foreground">
                    {selectedWard === "all" ? "All children" : "Selected"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingPayments.length}</div>
                  <p className="text-xs text-muted-foreground">{formatCurrency(totalPending)}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completedPayments.length}</div>
                  <p className="text-xs text-muted-foreground">{formatCurrency(totalPaid)}</p>
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
                  <CardTitle className="text-sm font-medium">Total</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{filteredPayments.length}</div>
                  <p className="text-xs text-muted-foreground">All payments</p>
                </CardContent>
              </Card>
            </div>

            {/* Urgent Payments Alert */}
            {pendingPayments.some((p) => new Date(p.dueDate) < new Date()) && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You have overdue payments for{" "}
                  {selectedWard === "all" ? "some of your children" : "the selected child"}. Please settle them as soon
                  as possible to avoid late fees.
                </AlertDescription>
              </Alert>
            )}

            {/* Quick Pay Section for Pending Payments */}
            {pendingPayments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Quick Pay - Pending Payments</CardTitle>
                  <CardDescription>Pay multiple outstanding fees at once</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pendingPayments.slice(0, 5).map((payment) => {
                      const student = wards.find((w) => w.id === payment.studentId)
                      const isOverdue = new Date(payment.dueDate) < new Date()

                      return (
                        <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{payment.description}</p>
                              {isOverdue && (
                                <Badge variant="destructive" className="text-xs">
                                  Overdue
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {student?.firstName} {student?.lastName} • Due {formatDate(payment.dueDate)}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="font-semibold">{formatCurrency(payment.amount)}</p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handlePayment(payment.id)}
                              disabled={processingPayment === payment.id}
                            >
                              {processingPayment === payment.id ? (
                                <>
                                  <LoadingSpinner size="sm" className="mr-2" />
                                  Processing...
                                </>
                              ) : (
                                "Pay Now"
                              )}
                            </Button>
                          </div>
                        </div>
                      )
                    })}

                    {pendingPayments.length > 5 && (
                      <p className="text-sm text-muted-foreground text-center">
                        And {pendingPayments.length - 5} more pending payments...
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payments Table */}
            <DataTable
              title="Payment History"
              description={`Complete payment records ${selectedWard === "all" ? "for all children" : "for selected child"}`}
              data={filteredPayments}
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
