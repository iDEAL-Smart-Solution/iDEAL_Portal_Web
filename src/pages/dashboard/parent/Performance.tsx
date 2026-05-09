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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Ward {
  id: string
  name: string
}

export function ParentPerformancePage() {
  const { user } = useAuth()
  const { analysis, isLoading, error, sessions, currentSession, fetchWardPerformance, fetchAvailableSessions } =
    usePerformanceStore()
  const [wards, setWards] = useState<Ward[]>([])
  const [selectedWardId, setSelectedWardId] = useState<string>("")
  const [filters, setFilters] = useState<PerformanceFilterValues>({
    term: 1,
    session: currentSession ?? undefined,
  })

  // Load sessions and wards
  useEffect(() => {
    if (user?.schoolId) {
      fetchAvailableSessions(user.schoolId)
      // TODO: Fetch parent's children (wards) from API
      // For now, this would be populated from the store or additional API call
    }
  }, [user?.schoolId, fetchAvailableSessions])

  // Load ward performance data when filters or selected ward changes
  useEffect(() => {
    if (user?.id && selectedWardId && filters.session) {
      fetchWardPerformance(user.id, selectedWardId, filters.term || 1, filters.session)
    }
  }, [user?.id, selectedWardId, filters.term, filters.session, fetchWardPerformance])

  const handleFilterChange = (newFilters: PerformanceFilterValues) => {
    const merged = { ...filters, ...newFilters }
    setFilters(merged)

    if (!user?.id || !merged.session) return

    // parent view uses ward-specific fetch
    if (selectedWardId) {
      fetchWardPerformance(user.id, selectedWardId, merged.term ?? 1, merged.session)
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
        <h1 className="text-3xl font-bold tracking-tight">My Wards' Performance</h1>
        <p className="text-muted-foreground">Monitor your children's academic progress</p>
      </div>

      {/* Ward Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Ward</CardTitle>
          <CardDescription>Choose a child to view their performance</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedWardId} onValueChange={setSelectedWardId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a child" />
            </SelectTrigger>
            <SelectContent>
              {wards.map((ward) => (
                <SelectItem key={ward.id} value={ward.id}>
                  {ward.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Filters */}
      {selectedWardId && (
            <PerformanceFilters
              onFilter={handleFilterChange}
              sessions={sessions}
              currentSession={currentSession ?? undefined}
              isLoading={isLoading}
            />
      )}

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
      {!isLoading && analysis && selectedWardId && (
        <>
          {/* Key Metrics */}
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
                <p className="text-xs text-muted-foreground">Average across subjects</p>
              </CardContent>
            </Card>

            {/* Grade */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Overall Grade</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={`text-lg py-2 px-3 ${getGradeColor(analysis.metrics.mostCommonGrade)}`}>
                  {analysis.metrics.mostCommonGrade}
                </Badge>
                <p className="text-xs text-muted-foreground">Current grade</p>
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

            {/* School Percentile */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">School Positioning</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analysis.percentileRankings.schoolPercentile}%</div>
                <p className="text-xs text-muted-foreground">Percentile in school</p>
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

          {/* Subject Comparison */}
          {analysis.subjectComparison && (
            <PerformanceHistogram data={analysis.subjectComparison} type="bar" />
          )}

          {/* Performance Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Summary</CardTitle>
              <CardDescription>Key insights about your child's performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Ranking Information */}
                <div className="rounded-lg bg-blue-50 p-4">
                  <h3 className="font-semibold text-blue-900">Ranking Details</h3>
                  <div className="mt-2 grid grid-cols-3 gap-4 text-sm text-blue-800">
                    <div>
                      <p className="text-xs opacity-75">School Rank</p>
                      <p className="font-bold">
                        {analysis.percentileRankings.schoolRank} of {analysis.percentileRankings.schoolTotal}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs opacity-75">Class Rank</p>
                      <p className="font-bold">
                        {analysis.percentileRankings.classRank} of {analysis.percentileRankings.classTotal}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs opacity-75">School Percentile</p>
                      <p className="font-bold">{analysis.percentileRankings.schoolPercentile}%</p>
                    </div>
                  </div>
                </div>

                {/* Performance Status */}
                <div className="rounded-lg bg-green-50 p-4">
                  <h3 className="font-semibold text-green-900">Performance Status</h3>
                  <div className="mt-2 space-y-2 text-sm text-green-800">
                    <p>
                      ✓ Average Score: <span className="font-semibold">{analysis.metrics.averageScore.toFixed(2)}/100</span>
                    </p>
                    <p>
                      ✓ Pass Rate:{" "}
                      <span className="font-semibold">
                          {analysis.metrics.passCount}/{analysis.metrics.totalResults} subjects
                      </span>
                    </p>
                    <p>
                      ✓ Overall Grade: <span className="font-semibold">{analysis.metrics.mostCommonGrade}</span>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Empty State */}
      {!selectedWardId && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Please select a child to view their performance</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !analysis && selectedWardId && !error && (
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
