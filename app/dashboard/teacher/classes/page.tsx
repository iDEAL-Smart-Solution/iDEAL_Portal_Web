"use client"

import { useEffect } from "react"
import { useAuthStore, useResultsStore } from "@/store"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { EmptyState } from "@/components/ui/empty-state"
import { Users, BookOpen, FileText, User } from "lucide-react"
import { mockClasses, mockSubjects, mockUsers } from "@/lib/mock-data"

export default function TeacherClasses() {
  const { user } = useAuthStore()
  const { results, fetchResults, isLoading } = useResultsStore()

  // Get teacher's classes and subjects
  const teacherClasses = mockClasses.filter((c) => c.teacherId === user?.id)
  const teacherSubjects = mockSubjects.filter((s) => s.teacherId === user?.id)

  useEffect(() => {
    if (user?.id) {
      // Fetch results for all students in teacher's classes
      const classes = mockClasses.filter((c) => c.teacherId === user.id)
      classes.forEach((classItem) => {
        const studentsInClass = mockUsers.filter((u) => u.role === "student" && (u as any).classId === classItem.id)
        studentsInClass.forEach((student) => {
          fetchResults(student.id)
        })
      })
    }
  }, [user?.id, fetchResults])

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    )
  }

  if (teacherClasses.length === 0) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <PageHeader title="My Classes" description="Manage your assigned classes and students" />
          <EmptyState
            icon={Users}
            title="No Classes Assigned"
            description="You don't have any classes assigned yet. Contact your school administrator to get class assignments."
          />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="My Classes"
          description={`Manage ${teacherClasses.length} ${teacherClasses.length === 1 ? "class" : "classes"} and ${teacherClasses.reduce((sum, c) => sum + c.studentCount, 0)} students`}
        />

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teacherClasses.length}</div>
              <p className="text-xs text-muted-foreground">Assigned classes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teacherClasses.reduce((sum, c) => sum + c.studentCount, 0)}</div>
              <p className="text-xs text-muted-foreground">Across all classes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subjects</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teacherSubjects.length}</div>
              <p className="text-xs text-muted-foreground">Teaching subjects</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Results Recorded</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{results.length}</div>
              <p className="text-xs text-muted-foreground">Academic records</p>
            </CardContent>
          </Card>
        </div>

        {/* Classes Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teacherClasses.map((classItem) => {
            // Get students in this class
            const studentsInClass = mockUsers.filter((u) => u.role === "student" && (u as any).classId === classItem.id)

            // Get results for students in this class
            const classResults = results.filter((r) => studentsInClass.some((s) => s.id === r.studentId))

            // Calculate class average
            const classAverage =
              classResults.length > 0 ? classResults.reduce((sum, r) => sum + r.score, 0) / classResults.length : 0

            // Get subjects taught to this class
            const classSubjects = teacherSubjects.filter((s) => teacherClasses.some((c) => c.id === classItem.id))

            return (
              <Card key={classItem.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{classItem.name}</CardTitle>
                      <CardDescription>Level {classItem.level}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{classItem.studentCount} students</div>
                      <div className="text-xs text-muted-foreground">Avg: {classAverage.toFixed(1)}%</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Subjects taught to this class */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Subjects</h4>
                      <div className="flex flex-wrap gap-2">
                        {classSubjects.map((subject) => (
                          <span
                            key={subject.id}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                          >
                            {subject.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Recent students */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Recent Students</h4>
                      <div className="space-y-2">
                        {studentsInClass.slice(0, 3).map((student) => {
                          const studentResults = results.filter((r) => r.studentId === student.id)
                          const studentAverage =
                            studentResults.length > 0
                              ? studentResults.reduce((sum, r) => sum + r.score, 0) / studentResults.length
                              : 0

                          return (
                            <div key={student.id} className="flex items-center justify-between text-sm">
                              <span>{student.name}</span>
                              <span className="text-muted-foreground">
                                {studentAverage > 0 ? `${studentAverage.toFixed(1)}%` : "No results"}
                              </span>
                            </div>
                          )
                        })}
                        {studentsInClass.length > 3 && (
                          <div className="text-xs text-muted-foreground">
                            +{studentsInClass.length - 3} more students
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </DashboardLayout>
  )
}
