

import { useEffect } from "react"
import { useAuthStore, useAssignmentsStore } from "@/store"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { EmptyState } from "@/components/ui/empty-state"
import { BookOpen, Calendar, Clock, Download, AlertCircle } from "lucide-react"
import { formatDate } from "@/lib/utils"

export default function StudentAssignments() {
  const { user } = useAuthStore()
  const { assignments, fetchAssignments, isLoading, error } = useAssignmentsStore()

  useEffect(() => {
    if (user && (user as any).classId) {
      fetchAssignments((user as any).classId)
    }
  }, [user, fetchAssignments])

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    )
  }

  // Categorize assignments
  const now = new Date()
  const upcomingAssignments = assignments.filter((a) => new Date(a.dueDate) >= now)
  const overdueAssignments = assignments.filter((a) => new Date(a.dueDate) < now)

  const getStatusBadge = (dueDate: string) => {
    const due = new Date(dueDate)
    const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilDue < 0) {
      return <Badge variant="destructive">Overdue</Badge>
    } else if (daysUntilDue <= 3) {
      return <Badge className="bg-orange-100 text-orange-800">Due Soon</Badge>
    } else if (daysUntilDue <= 7) {
      return <Badge className="bg-yellow-100 text-yellow-800">This Week</Badge>
    } else {
      return <Badge variant="secondary">Upcoming</Badge>
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader title="Assignments" description="View and manage your class assignments" />

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-red-600">Error loading assignments: {error}</div>
            </CardContent>
          </Card>
        ) : assignments.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No Assignments"
            description="You don't have any assignments yet. Check back later for new assignments from your teachers."
          />
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{assignments.length}</div>
                  <p className="text-xs text-muted-foreground">All assignments</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{upcomingAssignments.length}</div>
                  <p className="text-xs text-muted-foreground">Due later</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{overdueAssignments.length}</div>
                  <p className="text-xs text-muted-foreground">Need attention</p>
                </CardContent>
              </Card>
            </div>

            {/* Overdue Assignments Alert */}
            {overdueAssignments.length > 0 && (
              <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <CardTitle className="text-red-800 dark:text-red-200">Overdue Assignments</CardTitle>
                  </div>
                  <CardDescription className="text-red-700 dark:text-red-300">
                    You have {overdueAssignments.length} overdue assignment(s). Please contact your teacher if you need
                    assistance.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}

            {/* Assignments List */}
            <div className="space-y-4">
              {assignments
                .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                .map((assignment) => (
                  <Card key={assignment.id}>
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-lg">{assignment.title}</CardTitle>
                            {getStatusBadge(assignment.dueDate)}
                          </div>
                          <CardDescription className="text-base">{assignment.instructions}</CardDescription>
                        </div>
                        <div className="flex flex-col sm:items-end gap-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            Due {formatDate(assignment.dueDate)}
                          </div>
                          <div className="text-sm text-muted-foreground">{assignment.subjectCode}</div>
                        </div>
                      </div>
                    </CardHeader>
                    {assignment.assignmentFile && (
                      <CardContent>
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Attachment:</h4>
                          <div className="flex flex-wrap gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="gap-2 bg-transparent"
                              onClick={() => window.open(assignment.assignmentFile || '', '_blank')}
                            >
                              <Download className="h-4 w-4" />
                              Download Assignment File
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

