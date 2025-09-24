

import { useEffect } from "react"
import { useAuthStore, useResultsStore } from "@/store"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PageHeader } from "@/components/ui/page-header"
import { DataTable } from "@/components/ui/data-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { EmptyState } from "@/components/ui/empty-state"
import { FileText, TrendingUp, Award } from "lucide-react"
import { getGradeColor, formatDate } from "@/lib/utils"
import type { Result } from "@/types"

export default function StudentResults() {
  const { user } = useAuthStore()
  const { results, fetchResults, isLoading, error } = useResultsStore()

  useEffect(() => {
    if (user?.id) {
      fetchResults(user.id)
    }
  }, [user, fetchResults])

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    )
  }

  // Calculate statistics
  const averageScore = results.length > 0 ? results.reduce((sum, r) => sum + r.score, 0) / results.length : 0

  const gradeDistribution = results.reduce(
    (acc, result) => {
      acc[result.grade] = (acc[result.grade] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const highestScore = results.length > 0 ? Math.max(...results.map((r) => r.score)) : 0

  const columns = [
    {
      key: "subjectId" as keyof Result,
      label: "Subject",
      render: (value: string) => <div className="font-medium">Subject {value}</div>,
    },
    {
      key: "term" as keyof Result,
      label: "Term",
    },
    {
      key: "academicYear" as keyof Result,
      label: "Academic Year",
    },
    {
      key: "score" as keyof Result,
      label: "Score",
      render: (value: number) => <div className="font-semibold">{value}%</div>,
    },
    {
      key: "grade" as keyof Result,
      label: "Grade",
      render: (value: string) => <Badge className={getGradeColor(value)}>{value}</Badge>,
    },
    {
      key: "remarks" as keyof Result,
      label: "Remarks",
      render: (value: string) => <span className="text-muted-foreground">{value || "No remarks"}</span>,
    },
    {
      key: "createdAt" as keyof Result,
      label: "Date",
      render: (value: string) => formatDate(value),
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader title="Academic Results" description="View your academic performance and grades" />

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-red-600">Error loading results: {error}</div>
            </CardContent>
          </Card>
        ) : results.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No Results Available"
            description="Your academic results will appear here once they are published by your teachers."
          />
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{averageScore.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">Across {results.length} subjects</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Highest Score</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{highestScore}%</div>
                  <p className="text-xs text-muted-foreground">Best performance</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{results.length}</div>
                  <p className="text-xs text-muted-foreground">Results recorded</p>
                </CardContent>
              </Card>
            </div>

            {/* Grade Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Grade Distribution</CardTitle>
                <CardDescription>Overview of your grades across all subjects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(gradeDistribution).map(([grade, count]) => (
                    <Badge key={grade} className={getGradeColor(grade)}>
                      {grade}: {count}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Results Table */}
            <DataTable
              title="All Results"
              description="Complete list of your academic results"
              data={results}
              columns={columns}
              searchable
              searchPlaceholder="Search by subject, term, or grade..."
            />
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

