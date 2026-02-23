import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthStore, useStudentDashboardStore, useResultsStore } from "@/store"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StatsCard } from "@/components/ui/stats-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { BookOpen, CreditCard, FileText, Calendar, TrendingUp, Clock, AlertCircle } from "lucide-react"
import { formatCurrency, formatDate, getGradeColor } from "@/lib/utils"

export default function StudentDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { dashboard, fetchDashboard, isLoading, error } = useStudentDashboardStore()
  useEffect(() => {
    const studentId = (user as any)?.studentId || user?.id
    if (studentId) {
      fetchDashboard(studentId)
    }
  }, [(user as any)?.studentId, user?.id, fetchDashboard])

  // Always subscribe to results store so hooks order stays stable across renders
  const results = useResultsStore((s) => s.results)

  if (!user || isLoading || !dashboard) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-accent-500 font-medium mb-2">Error loading dashboard</p>
            <p className="text-text-tertiary">{error}</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const { stats, recentResults, upcomingAssignments, pendingPayments } = dashboard

  // Compute previous average from any older results already loaded in the results store.
  // This avoids extra network calls — if no older results are present, we won't show a trend.
  let computedPreviousAverage: number | undefined = undefined
  if (Array.isArray(results) && results.length > 0 && Array.isArray(recentResults) && recentResults.length > 0) {
    const latest = recentResults[0]
    const older = results.filter((r) => r.academicYear !== latest.session || r.term !== latest.term)
    if (older.length > 0) {
      const sum = older.reduce((acc, r) => acc + (r.score || 0), 0)
      computedPreviousAverage = sum / older.length
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Welcome back, {user.firstName}!</h1>
          <p className="text-text-tertiary mt-2">Here's what's happening with your studies today.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <StatsCard
            title="Average Grade"
            value={stats.averageGrade > 0 ? `${stats.averageGrade.toFixed(1)}%` : "N/A"}
            description="Current academic performance"
            icon={TrendingUp}
            trend={
              typeof computedPreviousAverage === "number"
                ? {
                    value: Math.abs(Number((stats.averageGrade - computedPreviousAverage).toFixed(1))),
                    isPositive: stats.averageGrade >= computedPreviousAverage,
                  }
                : undefined
            }
          />
          <StatsCard
            title="Pending Payments"
            value={stats.pendingPaymentsCount}
            description={`${formatCurrency(stats.totalPendingAmount)} total`}
            icon={CreditCard}
          />
          <StatsCard
            title="Active Assignments"
            value={stats.upcomingAssignmentsCount}
            description="Due soon"
            icon={BookOpen}
          />
          <StatsCard 
            title="Subjects" 
            value={stats.totalSubjects} 
            description="Currently enrolled" 
            icon={FileText} 
          />
        </div>

        <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
          {/* Recent Results */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Results</CardTitle>
                <CardDescription>Your latest academic performance</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/student/results")}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {recentResults.length === 0 ? (
                <div className="text-center py-8 text-text-tertiary">No results available yet</div>
              ) : (
                <div className="space-y-4">
                  {recentResults.slice(0, 3).map((result) => (
                    <div key={result.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium text-text-primary">{result.subjectName}</p>
                        <p className="text-sm text-text-tertiary">
                          {result.term} - {result.session}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className={getGradeColor(result.grade)}>{result.grade}</Badge>
                        <p className="text-sm text-text-tertiary mt-1">{result.totalScore.toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Assignments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Upcoming Assignments</CardTitle>
                <CardDescription>Assignments due soon</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/student/assignments")}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {upcomingAssignments.length === 0 ? (
                <div className="text-center py-8 text-text-tertiary">No upcoming assignments</div>
              ) : (
                <div className="space-y-4">
                  {upcomingAssignments.slice(0, 3).map((assignment) => (
                    <div key={assignment.id} className="flex items-start gap-3 p-3 rounded-lg border">
                      <div className="flex-1">
                        <p className="font-medium text-text-primary">{assignment.title}</p>
                        <p className="text-sm text-text-tertiary line-clamp-2">{assignment.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="h-4 w-4 text-text-tertiary" />
                          <span className="text-sm text-text-tertiary">Due {formatDate(assignment.dueDate)}</span>
                        </div>
                      </div>
                      {assignment.isOverdue || new Date(assignment.dueDate).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000 ? (
                        <AlertCircle className="h-5 w-5 text-warning-500" />
                      ) : null}
                    </div>
                  ))}
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
              <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/student/payments")}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {pendingPayments.length === 0 ? (
                <div className="text-center py-8 text-text-tertiary">No pending payments</div>
              ) : (
                <div className="space-y-4">
                  {pendingPayments.slice(0, 3).map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium text-text-primary">{payment.paymentType}</p>
                        <p className="text-sm text-text-tertiary">Due {formatDate(payment.dueDate)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-text-primary">{formatCurrency(payment.amount)}</p>
                        <Badge 
                          variant="secondary" 
                          className={payment.isOverdue ? "bg-accent-100 text-accent-700" : "bg-warning-100 text-warning-800"}
                        >
                          {payment.isOverdue ? "Overdue" : "Pending"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                  onClick={() => navigate("/dashboard/student/timetable")}
                >
                  <Calendar className="h-4 w-4" />
                  View Timetable
                </Button>
                <Button
                  variant="outline"
                  className="justify-start gap-2 h-12 bg-transparent"
                  onClick={() => navigate("/dashboard/student/results")}
                >
                  <FileText className="h-4 w-4" />
                  Check Results
                </Button>
                <Button
                  variant="outline"
                  className="justify-start gap-2 h-12 bg-transparent"
                  onClick={() => navigate("/dashboard/student/payments")}
                >
                  <CreditCard className="h-4 w-4" />
                  Make Payment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
