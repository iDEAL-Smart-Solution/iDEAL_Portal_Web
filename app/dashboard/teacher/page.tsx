"use client"

import { useEffect } from "react"
import { useAuthStore, useAssignmentsStore, useResourcesStore } from "@/store"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StatsCard } from "@/components/ui/stats-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { BookOpen, Upload, Users, FileText, Plus, Clock } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { mockClasses, mockSubjects } from "@/lib/mock-data"

export default function TeacherDashboard() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { assignments, fetchAssignments, isLoading: assignmentsLoading } = useAssignmentsStore()
  const { resources, fetchResources, isLoading: resourcesLoading } = useResourcesStore()

  // Get teacher's classes and subjects
  const teacherClasses = mockClasses.filter((c) => c.teacherId === user?.id)
  const teacherSubjects = mockSubjects.filter((s) => s.teacherId === user?.id)

  useEffect(() => {
    if (user?.id) {
      // Fetch assignments created by this teacher
      fetchAssignments(undefined, user.id)
      // Fetch resources uploaded by this teacher
      fetchResources()
    }
  }, [user, fetchAssignments, fetchResources])

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    )
  }

  // Filter resources by teacher
  const teacherResources = resources.filter((r) => r.teacherId === user.id)

  // Calculate stats
  const recentAssignments = assignments.filter((a) => {
    const createdDate = new Date(a.createdAt)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return createdDate >= weekAgo
  })

  const upcomingAssignments = assignments.filter((a) => new Date(a.dueDate) >= new Date())

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back, {user.firstName}!</h1>
          <p className="text-muted-foreground mt-2">Manage your classes, assignments, and resources.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="My Classes"
            value={teacherClasses.length}
            description={`${teacherClasses.reduce((sum, c) => sum + c.studentCount, 0)} total students`}
            icon={Users}
          />
          <StatsCard title="Subjects" value={teacherSubjects.length} description="Teaching subjects" icon={BookOpen} />
          <StatsCard
            title="Assignments"
            value={assignments.length}
            description={`${upcomingAssignments.length} upcoming`}
            icon={FileText}
          />
          <StatsCard title="Resources" value={teacherResources.length} description="Uploaded materials" icon={Upload} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* My Classes */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>My Classes</CardTitle>
                <CardDescription>Classes you're currently teaching</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/teacher/classes")}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {teacherClasses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No classes assigned yet</div>
              ) : (
                <div className="space-y-4">
                  {teacherClasses.map((classItem) => (
                    <div key={classItem.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">{classItem.name}</p>
                        <p className="text-sm text-muted-foreground">Level {classItem.level}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{classItem.studentCount}</p>
                        <p className="text-sm text-muted-foreground">Students</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Assignments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Assignments</CardTitle>
                <CardDescription>Assignments created this week</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/teacher/assignments")}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {assignmentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : recentAssignments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No recent assignments</div>
              ) : (
                <div className="space-y-4">
                  {recentAssignments.slice(0, 3).map((assignment) => (
                    <div key={assignment.id} className="flex items-start gap-3 p-3 rounded-lg border">
                      <div className="flex-1">
                        <p className="font-medium">{assignment.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{assignment.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Due {formatDate(assignment.dueDate)}</span>
                        </div>
                      </div>
                      <Badge variant="secondary">Subject {assignment.subjectId}</Badge>
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
              <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/teacher/resources")}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {resourcesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : teacherResources.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No resources uploaded yet</div>
              ) : (
                <div className="space-y-4">
                  {teacherResources
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 3)
                    .map((resource) => (
                      <div key={resource.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <p className="font-medium">{resource.title}</p>
                          <p className="text-sm text-muted-foreground">{resource.description}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="capitalize">
                            {resource.type}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">{formatDate(resource.createdAt)}</p>
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
                  onClick={() => router.push("/dashboard/teacher/assignments?action=create")}
                >
                  <Plus className="h-4 w-4" />
                  Create Assignment
                </Button>
                <Button
                  variant="outline"
                  className="justify-start gap-2 h-12 bg-transparent"
                  onClick={() => router.push("/dashboard/teacher/resources?action=upload")}
                >
                  <Upload className="h-4 w-4" />
                  Upload Resource
                </Button>
                <Button
                  variant="outline"
                  className="justify-start gap-2 h-12 bg-transparent"
                  onClick={() => router.push("/dashboard/teacher/classes")}
                >
                  <Users className="h-4 w-4" />
                  View Classes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subjects Overview */}
        <Card>
          <CardHeader>
            <CardTitle>My Subjects</CardTitle>
            <CardDescription>Subjects you're currently teaching</CardDescription>
          </CardHeader>
          <CardContent>
            {teacherSubjects.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No subjects assigned yet</div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {teacherSubjects.map((subject) => (
                  <Card key={subject.id} className="border-l-4 border-l-primary">
                    <CardContent className="p-4">
                      <h3 className="font-semibold">{subject.name}</h3>
                      <p className="text-sm text-muted-foreground">Code: {subject.code}</p>
                      <div className="mt-3 flex gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {assignments.filter((a) => a.subjectId === subject.id).length} Assignments
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {teacherResources.filter((r) => r.subjectId === subject.id).length} Resources
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
