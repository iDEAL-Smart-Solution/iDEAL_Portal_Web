"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useAuthStore, useResultsStore } from "@/store"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PageHeader } from "@/components/ui/page-header"
import { DataTable } from "@/components/ui/data-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { EmptyState } from "@/components/ui/empty-state"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, TrendingUp, Award, Users } from "lucide-react"
import { getGradeColor, formatDate } from "@/lib/utils"
import { mockUsers } from "@/lib/mock-data"
import type { Result } from "@/types"

export default function ParentResults() {
  const searchParams = useSearchParams()
  const wardParam = searchParams.get("ward")

  const { user } = useAuthStore()
  const { results, fetchResults, isLoading, error } = useResultsStore()
  const [selectedWard, setSelectedWard] = useState<string>(wardParam || "all")

  // Get ward information
  const wardIds = (user as any)?.wardIds || []
  const wards = mockUsers.filter((u) => wardIds.includes(u.id))

  useEffect(() => {
    const userWardIds = (user as any)?.wardIds || []
    if (userWardIds.length > 0) {
      userWardIds.forEach((wardId: string) => {
        fetchResults(wardId)
      })
    }
  }, [user, fetchResults])

  useEffect(() => {
    if (wardParam && wardParam !== selectedWard) {
      setSelectedWard(wardParam)
    }
  }, [wardParam, selectedWard])

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    )
  }

  // Filter results based on selected ward
  const filteredResults = selectedWard === "all" ? results : results.filter((r) => r.studentId === selectedWard)

  // Calculate statistics
  const averageScore =
    filteredResults.length > 0 ? filteredResults.reduce((sum, r) => sum + r.score, 0) / filteredResults.length : 0

  const gradeDistribution = filteredResults.reduce(
    (acc, result) => {
      acc[result.grade] = (acc[result.grade] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const highestScore = filteredResults.length > 0 ? Math.max(...filteredResults.map((r) => r.score)) : 0

  const columns = [
    {
      key: "studentId" as keyof Result,
      label: "Student",
      render: (value: string) => {
        const student = wards.find((w) => w.id === value)
        return (
          <div className="font-medium">{student ? `${student.firstName} ${student.lastName}` : "Unknown Student"}</div>
        )
      },
    },
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
        <PageHeader
          title="Academic Results"
          description="View your children's academic performance and grades"
          actions={
            <Select value={selectedWard} onValueChange={setSelectedWard}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Children</SelectItem>
                {wards.map((ward) => (
                  <SelectItem key={ward.id} value={ward.id}>
                    {ward.firstName} {ward.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          }
        />

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
        ) : filteredResults.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No Results Available"
            description={
              selectedWard === "all"
                ? "No academic results are available for any of your children yet."
                : "No academic results are available for the selected child yet."
            }
          />
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{averageScore.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">
                    {selectedWard === "all" ? "All children" : "Selected child"}
                  </p>
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
                  <CardTitle className="text-sm font-medium">Total Results</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{filteredResults.length}</div>
                  <p className="text-xs text-muted-foreground">Results recorded</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Children</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{selectedWard === "all" ? wards.length : 1}</div>
                  <p className="text-xs text-muted-foreground">
                    {selectedWard === "all" ? "All children" : "Selected"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Grade Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Grade Distribution</CardTitle>
                <CardDescription>
                  Overview of grades {selectedWard === "all" ? "across all children" : "for selected child"}
                </CardDescription>
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

            {/* Performance Alerts */}
            {filteredResults.some((r) => r.score < 60) && (
              <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
                <CardHeader>
                  <CardTitle className="text-orange-800 dark:text-orange-200">Academic Alert</CardTitle>
                  <CardDescription className="text-orange-700 dark:text-orange-300">
                    Some results show scores below 60%. Consider scheduling meetings with teachers.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {filteredResults
                      .filter((r) => r.score < 60)
                      .map((result) => {
                        const student = wards.find((w) => w.id === result.studentId)
                        return (
                          <div key={result.id} className="flex items-center justify-between text-sm">
                            <span>
                              {student?.firstName} {student?.lastName} - Subject {result.subjectId}
                            </span>
                            <Badge className={getGradeColor(result.grade)}>
                              {result.grade} ({result.score}%)
                            </Badge>
                          </div>
                        )
                      })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Results Table */}
            <DataTable
              title="All Results"
              description={`Complete list of academic results ${selectedWard === "all" ? "for all children" : "for selected child"}`}
              data={filteredResults}
              columns={columns}
              searchable
              searchPlaceholder="Search by student, subject, term, or grade..."
            />
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
