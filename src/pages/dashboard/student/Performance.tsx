import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { usePerformanceStore } from "@/store/performance-store"
import { PerformanceFilters, type PerformanceFilterValues } from "@/components/performance/PerformanceFilters"
import { PerformanceHistogram } from "@/components/performance/PerformanceHistogram"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

export function StudentPerformancePage() {
  const { user } = useAuth()
  const {
    analysis,
    isLoading,
    error,
    sessions,
    currentSession,
    fetchStudentPerformance,
    fetchAvailableSessions,
  } = usePerformanceStore()

  const [filters, setFilters] = useState<PerformanceFilterValues>({
    term: 1,
    session: currentSession ?? undefined,
  })

  // Load sessions and initial data
  useEffect(() => {
    if (user?.schoolId) {
      fetchAvailableSessions(user.schoolId)
    }
  }, [user?.schoolId, fetchAvailableSessions])

  // Load performance data when filters change
  useEffect(() => {
    if (user?.id && filters.session) {
      fetchStudentPerformance(user.id, filters.term || 1, filters.session)
    }
  }, [user?.id, filters.term, filters.session, fetchStudentPerformance])

  const handleFilterChange = (newFilters: PerformanceFilterValues) => {
    const merged = { ...filters, ...newFilters }
    setFilters(merged)

    if (user?.id && merged.session) {
      fetchStudentPerformance(user.id, merged.term || 1, merged.session)
    }
  }

  const getGradeColor = (grade: string) => {
    const colors: Record<string, string> = {
      A: "bg-green-100 text-green-800",
      B: "bg-blue-100 text-blue-800",
      C: "bg-yellow-100 text-yellow-800",
      D: "bg-orange-100 text-orange-800",
      E: "bg-red-100 text-red-800",
      F: "bg-red-200 text-red-900",
    }
    return colors[grade] || "bg-gray-100 text-gray-800"
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Performance</h1>
        <p className="text-muted-foreground">Track your academic performance across terms and sessions</p>
      </div>

      {/* Filters */}
      <PerformanceFilters
        onFilter={handleFilterChange}
        sessions={sessions}
        currentSession={currentSession ?? undefined}
        isLoading={isLoading}
      />

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      )}

      {/* Performance Data */}
      {!isLoading && analysis && (
        <>
          {/* Key Metrics */}
          {analysis.metrics && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Overall Score */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analysis.metrics.averageScore.toFixed(2)}
                    <span className="text-xs text-muted-foreground">/100</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Average score</p>
                </CardContent>
              </Card>

              {/* Overall Grade */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Overall Grade</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className={`text-lg py-2 px-3 ${getGradeColor(analysis.metrics.mostCommonGrade)}`}>
                    {analysis.metrics.mostCommonGrade}
                  </Badge>
                  <p className="text-xs text-muted-foreground">Current grade level</p>
                </CardContent>
              </Card>

              {/* Pass Rate */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analysis.metrics.passCount}/{analysis.metrics.totalResults}
                  </div>
                  <p className="text-xs text-muted-foreground">Subjects passed</p>
                </CardContent>
              </Card>

              {/* Highest Score */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Highest Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analysis.metrics.highestScore.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">Best performance</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Histograms Section */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Score Distribution */}
            {analysis.scoreDistribution && (
              <PerformanceHistogram data={analysis.scoreDistribution} type="bar" />
            )}

            {/* Grade Progression */}
            {analysis.gradeProgression && (
              <PerformanceHistogram data={analysis.gradeProgression} type="line" />
            )}
          </div>

          {/* Subject Comparison */}
          {analysis.subjectComparison && (
            <PerformanceHistogram data={analysis.subjectComparison} type="bar" />
          )}

          {/* Percentile Rankings */}
          {analysis.percentileRankings && (
            <Card>
              <CardHeader>
                <CardTitle>Percentile Rankings</CardTitle>
                <CardDescription>Your ranking across different contexts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="space-y-2 rounded-lg border p-4">
                    <p className="text-sm font-medium">School Ranking</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold">{analysis.percentileRankings.schoolPercentile}</span>
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Rank {analysis.percentileRankings.schoolRank} of {analysis.percentileRankings.schoolTotal}
                    </p>
                  </div>

                  <div className="space-y-2 rounded-lg border p-4">
                    <p className="text-sm font-medium">Class Ranking</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold">{analysis.percentileRankings.classPercentile}</span>
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Rank {analysis.percentileRankings.classRank} of {analysis.percentileRankings.classTotal}
                    </p>
                  </div>

                  <div className="space-y-2 rounded-lg border p-4">
                    <p className="text-sm font-medium">Subject Ranking</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold">{analysis.percentileRankings.subjectPercentile}</span>
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Rank {analysis.percentileRankings.subjectRank} of {analysis.percentileRankings.subjectTotal}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Empty State */}
      {!isLoading && !analysis && !error && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No performance data available for the selected filters</p>
          </CardContent>
        </Card>
      )}
      </div>
    </DashboardLayout>
  )
}
