import { useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PageHeader } from "@/components/ui/page-header"
import { DataTable } from "@/components/ui/data-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { EmptyState } from "@/components/ui/empty-state"
import { Book } from "lucide-react"
import { useAuthStore, useStaffStore } from "@/store"

export default function TeacherSubjects() {
  const { user } = useAuthStore()
  const { teacherSubjects, fetchTeacherSubjects, isLoading, error } = useStaffStore()

  useEffect(() => {
    if (user?.id) {
      fetchTeacherSubjects(user.id)
    }
  }, [user, fetchTeacherSubjects])

  const columns = [
    {
      key: "name" as keyof typeof teacherSubjects[0],
      label: "Subject Name",
      render: (value: string) => <span className="font-medium">{value}</span>
    },
    {
      key: "code" as keyof typeof teacherSubjects[0],
      label: "Code"
    },
    {
      key: "description" as keyof typeof teacherSubjects[0],
      label: "Description",
      render: (value: string) => <span className="text-sm text-muted-foreground">{value || "N/A"}</span>
    }
  ]

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="My Subjects"
          description="Subjects assigned to you by the school admin"
        />

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading subjects</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : teacherSubjects.length === 0 ? (
          <EmptyState
            icon={Book}
            title="No Subjects Assigned"
            description="You have not been assigned to any subjects yet. Contact your school admin to be assigned to subjects."
          />
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-1">
              <Card>
                <CardHeader className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
                  <Book className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{teacherSubjects.length}</div>
                </CardContent>
              </Card>
            </div>

            {/* Data Table */}
            <DataTable
              title="My Subjects"
              description="Subjects assigned to you by the school admin"
              data={teacherSubjects}
              columns={columns}
              searchable
              searchPlaceholder="Search subjects..."
            />
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
