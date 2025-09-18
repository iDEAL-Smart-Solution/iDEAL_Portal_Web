"use client"

import { useEffect } from "react"
import { useAuthStore, useResultsStore, usePaymentsStore } from "@/store"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { EmptyState } from "@/components/ui/empty-state"
import { Users, FileText, CreditCard, TrendingUp, AlertCircle, Eye } from "lucide-react"
import { formatCurrency, getInitials } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { mockUsers } from "@/lib/mock-data"

export default function ParentWards() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { results, fetchResults, isLoading: resultsLoading } = useResultsStore()
  const { payments, fetchPayments, isLoading: paymentsLoading } = usePaymentsStore()

  // Get ward information
  const wardIds = (user as any)?.wardIds || []
  const wards = mockUsers.filter((u) => wardIds.includes(u.id))

  useEffect(() => {
    const userWardIds = (user as any)?.wardIds || []
    if (userWardIds.length > 0) {
      userWardIds.forEach((wardId: string) => {
        fetchResults(wardId)
        fetchPayments(wardId)
      })
    }
  }, [user, fetchResults, fetchPayments])

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    )
  }

  if (wards.length === 0) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <PageHeader title="My Wards" description="Manage your children's accounts" />
          <EmptyState
            icon={Users}
            title="No Wards Found"
            description="You don't have any children linked to your account yet. Contact the school administrator to link student accounts."
          />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="My Wards"
          description={`Manage ${wards.length} ${wards.length === 1 ? "child's" : "children's"} accounts`}
        />

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Children</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{wards.length}</div>
              <p className="text-xs text-muted-foreground">Under your care</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Results</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{results.length}</div>
              <p className="text-xs text-muted-foreground">Academic records</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{payments.filter((p) => p.status === "pending").length}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(payments.filter((p) => p.status === "pending").reduce((sum, p) => sum + p.amount, 0))}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {results.length > 0
                  ? `${(results.reduce((sum, r) => sum + r.score, 0) / results.length).toFixed(1)}%`
                  : "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">Overall performance</p>
            </CardContent>
          </Card>
        </div>

        {/* Wards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {wards.map((ward) => {
            const wardResults = results.filter((r) => r.studentId === ward.id)
            const wardPayments = payments.filter((p) => p.studentId === ward.id)
            const pendingPayments = wardPayments.filter((p) => p.status === "pending")
            const wardAverage =
              wardResults.length > 0 ? wardResults.reduce((sum, r) => sum + r.score, 0) / wardResults.length : 0
            const hasLowGrades = wardResults.some((r) => r.score < 60)
            const hasOverduePayments = pendingPayments.some((p) => new Date(p.dueDate) < new Date())

            return (
              <Card key={ward.id} className="relative">
                {(hasLowGrades || hasOverduePayments) && (
                  <div className="absolute top-2 right-2">
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                  </div>
                )}

                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={ward.avatar || "/placeholder.svg"} alt={`${ward.firstName} ${ward.lastName}`} />
                      <AvatarFallback className="text-lg">{getInitials(ward.firstName, ward.lastName)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-xl">
                        {ward.firstName} {ward.lastName}
                      </CardTitle>
                      <CardDescription>
                        Student ID: {(ward as any).studentId} • Class: {(ward as any).classId}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Academic Performance */}
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Academic Performance
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Average Grade:</span>
                        <p className="font-semibold">
                          {wardAverage > 0 ? `${wardAverage.toFixed(1)}%` : "No results yet"}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Subjects:</span>
                        <p className="font-semibold">{wardResults.length}</p>
                      </div>
                    </div>
                    {hasLowGrades && (
                      <Badge variant="destructive" className="text-xs">
                        Some grades need attention
                      </Badge>
                    )}
                  </div>

                  {/* Payment Status */}
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Payment Status
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Pending:</span>
                        <p className="font-semibold">{pendingPayments.length}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Amount:</span>
                        <p className="font-semibold">
                          {formatCurrency(pendingPayments.reduce((sum, p) => sum + p.amount, 0))}
                        </p>
                      </div>
                    </div>
                    {hasOverduePayments && (
                      <Badge variant="destructive" className="text-xs">
                        Overdue payments
                      </Badge>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 bg-transparent"
                      onClick={() => {
                        // Navigate to results with ward filter
                        router.push(`/dashboard/parent/results?ward=${ward.id}`)
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Results
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 bg-transparent"
                      onClick={() => {
                        // Navigate to payments with ward filter
                        router.push(`/dashboard/parent/payments?ward=${ward.id}`)
                      }}
                    >
                      <CreditCard className="h-4 w-4 mr-1" />
                      Payments
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Alerts Section */}
        {(results.some((r) => r.score < 60) ||
          payments.some((p) => p.status === "pending" && new Date(p.dueDate) < new Date())) && (
          <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
                <AlertCircle className="h-5 w-5" />
                Attention Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {results.some((r) => r.score < 60) && (
                  <p className="text-orange-700 dark:text-orange-300">
                    • Some of your children have grades below 60%. Consider scheduling parent-teacher meetings.
                  </p>
                )}
                {payments.some((p) => p.status === "pending" && new Date(p.dueDate) < new Date()) && (
                  <p className="text-orange-700 dark:text-orange-300">
                    • There are overdue payments that need immediate attention.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
