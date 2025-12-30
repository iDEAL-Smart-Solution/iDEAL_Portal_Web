

import { useEffect } from "react"
import { useAuthStore, useStaffStore } from "@/store"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StatsCard } from "@/components/ui/stats-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { BookOpen, Upload, FileText, Plus, Clock } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { useNavigate } from "react-router-dom"

export default function TeacherDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { dashboardData, fetchDashboard, isLoading, error } = useStaffStore()

  useEffect(() => {
    if (user?.id) {
      fetchDashboard(user.id)
    }
  }, [user?.id, fetchDashboard])

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    )
  }

  if (isLoading || !dashboardData) {
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
            <p className="text-destructive font-medium mb-2">Error loading dashboard</p>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => user?.id && fetchDashboard(user.id)}>Try Again</Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const { stats, subjects, recentAssignments, recentResources } = dashboardData

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.firstName}!</h1>
          <p className="text-muted-foreground mt-2">Manage your subjects, assignments, and resources.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatsCard 
            title="Assigned Subjects" 
            value={stats.totalSubjects} 
            description="Subjects assigned by admin" 
            icon={BookOpen} 
          />
          <StatsCard
            title="Assignments"
            value={stats.totalAssignments}
            description={`${stats.upcomingAssignments} upcoming`}
            icon={FileText}
          />
          <StatsCard 
            title="Resources" 
            value={stats.totalResources} 
            description="Uploaded materials" 
            icon={Upload} 
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Assignments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Assignments</CardTitle>
                <CardDescription>Assignments created this week</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/teacher/assignments")}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {recentAssignments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No recent assignments</div>
              ) : (
                <div className="space-y-4">
                  {recentAssignments.map((assignment) => (
                    <div key={assignment.id} className="flex items-start gap-3 p-3 rounded-lg border">
                      <div className="flex-1">
                        <p className="font-medium">{assignment.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{assignment.instructions}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Due {formatDate(assignment.dueDate)}</span>
                        </div>
                      </div>
                      <Badge variant="secondary">{assignment.subjectName}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Resources */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Resources</CardTitle>
                <CardDescription>Recently uploaded materials</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/teacher/resources")}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {recentResources.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No resources uploaded yet</div>
              ) : (
                <div className="space-y-4">
                  {recentResources.map((resource) => (
                    <div key={resource.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">{resource.name}</p>
                        <p className="text-sm text-muted-foreground">{resource.description}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="capitalize">
                          {resource.mediaType}
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
                  className="justify-start gap-2 h-12"
                  onClick={() => navigate("/dashboard/teacher/assignments?action=create")}
                >
                  <Plus className="h-4 w-4" />
                  Create Assignment
                </Button>
                <Button
                  variant="outline"
                  className="justify-start gap-2 h-12 bg-transparent"
                  onClick={() => navigate("/dashboard/teacher/resources?action=upload")}
                >
                  <Upload className="h-4 w-4" />
                  Upload Resource
                </Button>
                <Button
                  variant="outline"
                  className="justify-start gap-2 h-12 bg-transparent"
                  onClick={() => navigate("/dashboard/teacher/subjects")}
                >
                  <BookOpen className="h-4 w-4" />
                  View My Subjects
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subjects Overview */}
        <Card>
          <CardHeader>
            <CardTitle>My Subjects</CardTitle>
            <CardDescription>Subjects assigned to you by school admin</CardDescription>
          </CardHeader>
          <CardContent>
            {subjects.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="mb-2">No subjects assigned yet</p>
                <p className="text-xs">Contact your school admin to be assigned to subjects</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {subjects.map((subject) => (
                  <Card key={subject.id} className="border-l-4 border-l-primary">
                    <CardContent className="p-4">
                      <h3 className="font-semibold">{subject.name}</h3>
                      <p className="text-sm text-muted-foreground">Code: {subject.code}</p>
                      <p className="text-sm text-muted-foreground">{subject.className}</p>
                      <div className="mt-3 flex gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {subject.assignmentsCount} Assignments
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {subject.resourcesCount} Resources
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

