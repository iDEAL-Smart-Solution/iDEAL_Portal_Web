

import { useEffect } from "react"
import { useAuthStore, useSchoolStore } from "@/store"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PageHeader } from "@/components/ui/page-header"
import { StatsCard } from "@/components/ui/stats-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Users, GraduationCap, BookOpen, Calendar, DollarSign, Settings } from "lucide-react"
import { mockUsers, mockClasses, mockPayments } from "@/lib/mock-data"

export default function SchoolAdminDashboard() {
  const { user } = useAuthStore()
  const { schools, fetchSchools } = useSchoolStore()

  useEffect(() => {
    fetchSchools()
  }, [fetchSchools])

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    )
  }

  // Get school data for this admin
  const school = schools.find((s) => s.adminId === user.id)
  const students = mockUsers.filter((u) => u.role === "student" && (u as any).schoolId === school?.id)
  const teachers = mockUsers.filter((u) => u.role === "teacher" && (u as any).schoolId === school?.id)
  // const parents = mockUsers.filter((u) => u.role === "parent" && (u as any).schoolId === school?.id)
  const classes = mockClasses.filter((c) => (c as any).schoolId === school?.id)
  // const subjects = mockSubjects.filter((s) => (s as any).schoolId === school?.id)
  const payments = mockPayments.filter((p) => students.some((s) => s.id === p.studentId))

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0)
  const pendingPayments = payments.filter((p) => p.status === "pending").length

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title={`${school?.name || "School"} Dashboard`}
          description="Manage your school's operations and monitor performance"
        />

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Students"
            value={students.length.toString()}
            description="Active students"
            icon={GraduationCap}
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="Teachers"
            value={teachers.length.toString()}
            description="Teaching staff"
            icon={Users}
            trend={{ value: 2, isPositive: true }}
          />
          <StatsCard title="Classes" value={classes.length.toString()} description="Active classes" icon={BookOpen} />
          <StatsCard
            title="Revenue"
            value={`$${totalRevenue.toLocaleString()}`}
            description="This month"
            icon={DollarSign}
            trend={{ value: 8, isPositive: true }}
          />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button className="h-auto flex-col gap-2 p-4 bg-transparent" variant="outline">
                <Users className="h-6 w-6" />
                <span>Create User</span>
              </Button>
              <Button className="h-auto flex-col gap-2 p-4 bg-transparent" variant="outline">
                <Calendar className="h-6 w-6" />
                <span>Manage Timetable</span>
              </Button>
              <Button className="h-auto flex-col gap-2 p-4 bg-transparent" variant="outline">
                <DollarSign className="h-6 w-6" />
                <span>Payment Types</span>
              </Button>
              <Button className="h-auto flex-col gap-2 p-4 bg-transparent" variant="outline">
                <Settings className="h-6 w-6" />
                <span>School Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity & Alerts */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest actions in your school</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">New student registered</p>
                    <p className="text-xs text-muted-foreground">John Doe - Grade 10A</p>
                  </div>
                  <span className="text-xs text-muted-foreground">2h ago</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Payment received</p>
                    <p className="text-xs text-muted-foreground">School fees - $500</p>
                  </div>
                  <span className="text-xs text-muted-foreground">4h ago</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Teacher uploaded resource</p>
                    <p className="text-xs text-muted-foreground">Math - Chapter 5 Notes</p>
                  </div>
                  <span className="text-xs text-muted-foreground">6h ago</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alerts & Notifications</CardTitle>
              <CardDescription>Items requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Pending Payments</p>
                    <p className="text-xs text-muted-foreground">{pendingPayments} payments awaiting processing</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Timetable Update</p>
                    <p className="text-xs text-muted-foreground">3 classes need timetable assignments</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">System Update</p>
                    <p className="text-xs text-muted-foreground">New features available in v2.1</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

