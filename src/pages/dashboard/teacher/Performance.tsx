import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { usePerformanceStore } from "@/store/performance-store"
import { useStaffStore } from "@/store"
import { PerformanceFilters, type PerformanceFilterValues } from "@/components/performance/PerformanceFilters"
import { PerformanceHistogram } from "@/components/performance/PerformanceHistogram"
import { StudentComparison } from "@/components/performance/StudentComparison"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

export function TeacherPerformancePage() {
  const { user } = useAuth()
  const { analysis, isLoading, error, sessions, currentSession, fetchSubjectPerformance, fetchAvailableSessions } =
    usePerformanceStore()
  const { fetchComparisonData } = usePerformanceStore()
  const { teacherSubjects, fetchTeacherSubjects } = useStaffStore()
  const [filters, setFilters] = useState<PerformanceFilterValues>({
    term: 1,
    session: currentSession ?? undefined,
    subject: "",
  })
  const [showComparison, setShowComparison] = useState(false)

  // Load sessions and staff subjects
  useEffect(() => {
    if (user?.schoolId) {
      fetchAvailableSessions(user.schoolId)
    }
    if (user?.id) {
      fetchTeacherSubjects(user.id)
    }
  }, [user?.schoolId, user?.id, fetchAvailableSessions, fetchTeacherSubjects])

  // Load subject performance data when filters change
  useEffect(() => {
    if (user?.id && filters.subject && filters.session) {
      fetchSubjectPerformance(user.id, filters.subject, filters.term || 1, filters.session)
    }
  }, [user?.id, filters.subject, filters.term, filters.session, fetchSubjectPerformance])

  const handleFilterChange = (newFilters: PerformanceFilterValues) => {
    const merged = { ...filters, ...newFilters }
    setFilters(merged)

    // Immediately fetch so Apply Filters always triggers a request
    if (user?.id && merged.subject && merged.session) {
      fetchSubjectPerformance(user.id, merged.subject, merged.term || 1, merged.session)
    }
  }

  const handleToggleComparison = () => {
    setShowComparison((v) => !v)
  }

  // When user shows comparison, lazily fetch comparison data if not already present
  useEffect(() => {
    if (!showComparison) return

    // pick up to 5 students from detailedResults for comparison (highest scoring)
    const studentIds = (analysis?.detailedResults || [])
      .slice()
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 5)
      .map((s) => s.studentId)

    if (studentIds.length > 0 && filters.subject && user?.schoolId) {
      fetchComparisonData(user.schoolId, studentIds, filters.subject, filters.term, filters.session)
    }
  }, [showComparison, analysis?.detailedResults, filters.subject, filters.term, filters.session, fetchComparisonData, user?.schoolId])

  // Check permission
  if (!user) {
    return (
      <Alert variant="destructive">
        <AlertDescription>You must be logged in to access this page</AlertDescription>
      </Alert>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subject Performance</h1>
        <p className="text-muted-foreground">Analyze your students' performance by subject</p>
      </div>

      {/* Filters */}
      <PerformanceFilters
        onFilter={handleFilterChange}
        sessions={sessions}
        currentSession={currentSession ?? undefined}
        subjects={teacherSubjects.map((subject) => ({ id: subject.id, name: subject.name }))}
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
          {/* Subject Metrics */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Class Average */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Class Average</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                    {analysis.metrics.averageScore.toFixed(2)}
                  <span className="text-xs text-muted-foreground">/100</span>
                </div>
                <p className="text-xs text-muted-foreground">Average score</p>
              </CardContent>
            </Card>

            {/* Highest Score */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Highest Score</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{analysis.metrics.highestScore.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Best performing student</p>
              </CardContent>
            </Card>

            {/* Lowest Score */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Lowest Score</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{analysis.metrics.lowestScore.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Needs attention</p>
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
                <p className="text-xs text-muted-foreground">Students passed</p>
              </CardContent>
            </Card>
          </div>

          {/* Histograms */}
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

          {/* Comparison Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Student Comparison</h2>
              <Button onClick={handleToggleComparison} variant="outline">
                {showComparison ? "Hide" : "Show"} Comparison
              </Button>
            </div>

            {showComparison && analysis.comparisonData && (
              <StudentComparison data={analysis.comparisonData} showMetrics={true} />
            )}
          </div>

          {/* Class Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Class Statistics</CardTitle>
              <CardDescription>Overall class performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Median Score</p>
                  <p className="text-2xl font-bold">{analysis.scoreDistribution?.median?.toFixed(2) ?? "—"}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Std Deviation</p>
                  <p className="text-2xl font-bold">{analysis.scoreDistribution?.standardDeviation?.toFixed(2) ?? "—"}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Variance</p>
                  <p className="text-2xl font-bold">{analysis.metrics.scoreVariance?.toFixed(2) || "—"}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total Students</p>
                  <p className="text-2xl font-bold">{analysis.metrics.totalResults}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Empty State */}
      {!isLoading && !analysis && !error && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Select a subject and filters to view performance data
            </p>
          </CardContent>
        </Card>
      )}
      </div>
    </DashboardLayout>
  )
}
