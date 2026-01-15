

import { useEffect, useState } from "react"
import { useAuthStore, useResultsStore, usePaymentsStore, useAssignmentsStore } from "@/store"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StatsCard } from "@/components/ui/stats-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, CreditCard, FileText, TrendingUp, AlertCircle, Clock } from "lucide-react"
import { formatCurrency, formatDate, getGradeColor, getInitials } from "@/lib/utils"
import { useNavigate } from "react-router-dom"

export default function ParentDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { results, fetchResults, isLoading: resultsLoading } = useResultsStore()
  const { payments, fetchPayments, isLoading: paymentsLoading } = usePaymentsStore()
  const { fetchAssignments } = useAssignmentsStore()
  const [selectedWard, setSelectedWard] = useState<string>("all")

  // Get ward information from user data
  const wardIds = (user as any)?.wardIds || []
  const wards: any[] = [] // Wards will come from API

  useEffect(() => {
    const userWardIds = (user as any)?.wardIds || []
    if (userWardIds.length > 0) {
      // Fetch data for all wards
      userWardIds.forEach((wardId: string) => {
        fetchResults(wardId)
      })
      fetchPayments()
      fetchAssignments()
    }
  }, [user, fetchResults, fetchPayments, fetchAssignments])

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    )
  }

  // Filter data based on selected ward
  const filteredResults = selectedWard === "all" ? results : results.filter((r) => r.studentId === selectedWard)
  const filteredPayments = selectedWard === "all" ? payments : payments.filter((p) => p.studentId === selectedWard)

  // Calculate stats
  const pendingPayments = filteredPayments.filter((p) => p.status === "pending")
  const totalPendingAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0)
  const averageGrade =
    filteredResults.length > 0 ? filteredResults.reduce((sum, r) => sum + r.score, 0) / filteredResults.length : 0

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back, {user.firstName}!</h1>
            <p className="text-muted-foreground mt-2">
              Monitor your {wards.length > 1 ? "children's" : "child's"} academic progress.
            </p>
          </div>

          {/* Ward Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">View data for:</span>
            <Select value={selectedWard} onValueChange={setSelectedWard}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Children</SelectItem>
                {wardIds.map((wardId: string) => (
                  <SelectItem key={wardId} value={wardId}>
                    Child {wardId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Wards Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              My Children
            </CardTitle>
            <CardDescription>Overview of all your wards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {wards.map((ward: any) => {
                const wardResults = results.filter((r) => r.studentId === ward.id)
                const wardPayments = payments.filter((p) => p.studentId === ward.id && p.status === "pending")
                const wardAverage =
                  wardResults.length > 0 ? wardResults.reduce((sum, r) => sum + r.score, 0) / wardResults.length : 0

                return (
                  <Card
                    key={ward.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedWard(ward.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage
                            src={ward.avatar || "/placeholder.svg"}
                            alt={`${ward.firstName} ${ward.lastName}`}
                          />
                          <AvatarFallback>{getInitials(ward.firstName, ward.lastName)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold">
                            {ward.firstName} {ward.lastName}
                          </h3>
                          <p className="text-sm text-muted-foreground">Student ID: {(ward as any).studentId}</p>
                        </div>
                      </div>
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Average Grade:</span>
                          <span className="font-medium">{wardAverage > 0 ? `${wardAverage.toFixed(1)}%` : "N/A"}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Pending Payments:</span>
                          <span
                            className={`font-medium ${wardPayments.length > 0 ? "text-orange-600" : "text-green-600"}`}
                          >
                            {wardPayments.length}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Children" value={wards.length} description="Total wards under your care" icon={Users} />
          <StatsCard
            title="Average Performance"
            value={averageGrade > 0 ? `${averageGrade.toFixed(1)}%` : "N/A"}
            description={selectedWard === "all" ? "Across all children" : "Selected child"}
            icon={TrendingUp}
            trend={averageGrade > 75 ? { value: 3.2, isPositive: true } : undefined}
          />
          <StatsCard
            title="Pending Payments"
            value={pendingPayments.length}
            description={formatCurrency(totalPendingAmount)}
            icon={CreditCard}
          />
          <StatsCard
            title="Total Subjects"
            value={filteredResults.length}
            description="Enrolled subjects"
            icon={FileText}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Results */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Results</CardTitle>
                <CardDescription>
                  Latest academic performance {selectedWard === "all" ? "for all children" : "for selected child"}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/parent/results")}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {resultsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : filteredResults.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No results available yet</div>
              ) : (
                <div className="space-y-4">
                  {filteredResults.slice(0, 3).map((result) => {
                    const student = wards.find((w: any) => w.id === result.studentId)
                    return (
                      <div key={result.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <p className="font-medium">Subject {result.subjectId}</p>
                          <p className="text-sm text-muted-foreground">
                            {student?.firstName} {student?.lastName} - {result.term}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className={getGradeColor(result.grade)}>{result.grade}</Badge>
                          <p className="text-sm text-muted-foreground mt-1">{result.score}%</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Payments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Pending Payments</CardTitle>
                <CardDescription>Outstanding fees and charges</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/parent/payments")}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {paymentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : pendingPayments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No pending payments</div>
              ) : (
                <div className="space-y-4">
                  {pendingPayments.slice(0, 3).map((payment) => {
                    const student = wards.find((w: any) => w.id === payment.studentId)
                    return (
                      <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <p className="font-medium">{payment.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {student?.firstName} {student?.lastName} - Due {formatDate(payment.dueDate)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(payment.amount)}</p>
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            Pending
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Urgent Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>Important updates and alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingPayments.filter((p) => new Date(p.dueDate) < new Date()).length > 0 && (
                  <div className="p-3 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-red-800 dark:text-red-200">Overdue Payments</span>
                    </div>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      You have overdue payments that need immediate attention.
                    </p>
                  </div>
                )}

                {filteredResults.some((r) => r.score < 60) && (
                  <div className="p-3 rounded-lg border border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-800 dark:text-orange-200">Academic Alert</span>
                    </div>
                    <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                      Some subjects need attention. Consider discussing with teachers.
                    </p>
                  </div>
                )}

                {pendingPayments.length === 0 && !filteredResults.some((r) => r.score < 60) && (
                  <div className="text-center py-4 text-muted-foreground">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No urgent notifications at this time.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                <Button
                  variant="outline"
                  className="justify-start gap-2 h-12 bg-transparent"
                  onClick={() => navigate("/dashboard/parent/wards")}
                >
                  <Users className="h-4 w-4" />
                  Manage Wards
                </Button>
                <Button
                  variant="outline"
                  className="justify-start gap-2 h-12 bg-transparent"
                  onClick={() => navigate("/dashboard/parent/results")}
                >
                  <FileText className="h-4 w-4" />
                  View All Results
                </Button>
                <Button
                  variant="outline"
                  className="justify-start gap-2 h-12 bg-transparent"
                  onClick={() => navigate("/dashboard/parent/payments")}
                >
                  <CreditCard className="h-4 w-4" />
                  Make Payments
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

