"use client"

import { useEffect } from "react"
import { useAuthStore, useSchoolStore } from "@/store"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PageHeader } from "@/components/ui/page-header"
import { StatsCard } from "@/components/ui/stats-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Building2, Users, DollarSign, TrendingUp, Shield, Settings } from "lucide-react"
import { mockUsers } from "@/lib/mock-data"

export default function SuperAdminDashboard() {
  const { user } = useAuthStore()
  const { schools, fetchSchools, isLoading } = useSchoolStore()

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

  const totalUsers = mockUsers.length
  const activeSchools = schools.filter((s) => s.status === "active").length
  const totalRevenue = schools.reduce((sum, s) => sum + (s.subscription?.amount || 0), 0)
  const pendingSchools = schools.filter((s) => s.status === "pending").length

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Super Admin Dashboard"
          description="Manage all schools, subscriptions, and system operations"
        />

        {/* System Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Schools"
            value={schools.length.toString()}
            description={`${activeSchools} active`}
            icon={Building2}
            trend={{ value: 15, isPositive: true }}
          />
          <StatsCard
            title="Total Users"
            value={totalUsers.toString()}
            description="Across all schools"
            icon={Users}
            trend={{ value: 8, isPositive: true }}
          />
          <StatsCard
            title="Monthly Revenue"
            value={`$${totalRevenue.toLocaleString()}`}
            description="Subscription revenue"
            icon={DollarSign}
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="System Health"
            value="99.9%"
            description="Uptime this month"
            icon={TrendingUp}
            trend={{ value: 0.1, isPositive: true }}
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
                <Building2 className="h-6 w-6" />
                <span>Create School</span>
              </Button>
              <Button className="h-auto flex-col gap-2 p-4 bg-transparent" variant="outline">
                <Shield className="h-6 w-6" />
                <span>Manage Admins</span>
              </Button>
              <Button className="h-auto flex-col gap-2 p-4 bg-transparent" variant="outline">
                <DollarSign className="h-6 w-6" />
                <span>Subscriptions</span>
              </Button>
              <Button className="h-auto flex-col gap-2 p-4 bg-transparent" variant="outline">
                <Settings className="h-6 w-6" />
                <span>System Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Schools Overview & System Status */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Schools</CardTitle>
              <CardDescription>Latest school registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {schools.slice(0, 5).map((school) => (
                  <div key={school.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{school.name}</p>
                        <p className="text-sm text-muted-foreground">{school.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          school.status === "active"
                            ? "bg-green-100 text-green-800"
                            : school.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {school.status}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">${school.subscription?.amount || 0}/mo</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Platform health and metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm">API Services</span>
                  </div>
                  <span className="text-sm text-muted-foreground">Operational</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm">Database</span>
                  </div>
                  <span className="text-sm text-muted-foreground">Healthy</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                    <span className="text-sm">File Storage</span>
                  </div>
                  <span className="text-sm text-muted-foreground">Maintenance</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm">Payment Gateway</span>
                  </div>
                  <span className="text-sm text-muted-foreground">Active</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        {pendingSchools > 0 && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-yellow-800">Pending Actions</CardTitle>
              <CardDescription className="text-yellow-700">Items requiring your attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-yellow-800">
                    {pendingSchools} school{pendingSchools > 1 ? "s" : ""} awaiting approval
                  </p>
                  <p className="text-sm text-yellow-700">Review and approve new school registrations</p>
                </div>
                <Button
                  variant="outline"
                  className="border-yellow-300 text-yellow-800 hover:bg-yellow-100 bg-transparent"
                >
                  Review Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
