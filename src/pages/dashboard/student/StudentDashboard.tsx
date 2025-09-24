import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthStore, useResultsStore, usePaymentsStore, useAssignmentsStore } from "@/store"
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
  const { results, fetchResults, isLoading: resultsLoading } = useResultsStore()
  const { payments, fetchPayments, isLoading: paymentsLoading } = usePaymentsStore()
  const { assignments, fetchAssignments, isLoading: assignmentsLoading } = useAssignmentsStore()

  useEffect(() => {
    if (user?.id) {
      fetchResults(user.id)
      fetchPayments(user.id)
      if ((user as any).classId) {
        fetchAssignments((user as any).classId)
      }
    }
  }, [user?.id, fetchResults, fetchPayments, fetchAssignments])

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    )
  }

  // Calculate stats
  const pendingPayments = payments.filter((p) => p.status === "pending")
  // const completedAssignments = assignments.filter((a) => new Date(a.dueDate) < new Date())
  const upcomingAssignments = assignments.filter((a) => new Date(a.dueDate) >= new Date())
  const averageGrade = results.length > 0 ? results.reduce((sum, r) => sum + r.score, 0) / results.length : 0

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back, {user.firstName}!</h1>
          <p className="text-muted-foreground mt-2">Here's what's happening with your studies today.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Average Grade"
            value={averageGrade > 0 ? `${averageGrade.toFixed(1)}%` : "N/A"}
            description="Current academic performance"
            icon={TrendingUp}
            trend={averageGrade > 75 ? { value: 5.2, isPositive: true } : undefined}
          />
          <StatsCard
            title="Pending Payments"
            value={pendingPayments.length}
            description={`${formatCurrency(pendingPayments.reduce((sum, p) => sum + p.amount, 0))} total`}
            icon={CreditCard}
          />
          <StatsCard
            title="Active Assignments"
            value={upcomingAssignments.length}
            description="Due this week"
            icon={BookOpen}
          />
          <StatsCard title="Subjects" value={results.length} description="Currently enrolled" icon={FileText} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
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
              {resultsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : results.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No results available yet</div>
              ) : (
                <div className="space-y-4">
                  {results.slice(0, 3).map((result) => (
                    <div key={result.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">Subject {result.subjectId}</p>
                        <p className="text-sm text-muted-foreground">
                          {result.term} - {result.academicYear}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className={getGradeColor(result.grade)}>{result.grade}</Badge>
                        <p className="text-sm text-muted-foreground mt-1">{result.score}%</p>
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
              {assignmentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : upcomingAssignments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No upcoming assignments</div>
              ) : (
                <div className="space-y-4">
                  {upcomingAssignments.slice(0, 3).map((assignment) => (
                    <div key={assignment.id} className="flex items-start gap-3 p-3 rounded-lg border">
                      <div className="flex-1">
                        <p className="font-medium">{assignment.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{assignment.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Due {formatDate(assignment.dueDate)}</span>
                        </div>
                      </div>
                      {new Date(assignment.dueDate).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000 && (
                        <AlertCircle className="h-5 w-5 text-orange-500" />
                      )}
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
              {paymentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : pendingPayments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No pending payments</div>
              ) : (
                <div className="space-y-4">
                  {pendingPayments.slice(0, 3).map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">{payment.description}</p>
                        <p className="text-sm text-muted-foreground">Due {formatDate(payment.dueDate)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(payment.amount)}</p>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          Pending
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
