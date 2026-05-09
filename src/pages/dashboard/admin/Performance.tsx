import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { usePerformanceStore } from "@/store/performance-store"
import { PerformanceFilters, type PerformanceFilterValues } from "@/components/performance/PerformanceFilters"
import { PerformanceHistogram } from "@/components/performance/PerformanceHistogram"
import { StudentComparison } from "@/components/performance/StudentComparison"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"

interface Subject {
  id: string
  name: string
}

interface SchoolClass {
  id: string
  name: string
}

export function AdminPerformancePage() {
  const { user } = useAuth()
  const {
    analysis,
    isLoading,
    error,
    sessions,
    currentSession,
    fetchClassPerformance,
    fetchSchoolSubjectPerformance,
    fetchAvailableSessions,
  } = usePerformanceStore()

  const [subjects] = useState<Subject[]>([])
  const [classes] = useState<SchoolClass[]>([])
  const [filters, setFilters] = useState<PerformanceFilterValues>({
    term: 1,
    session: currentSession ?? undefined,
  })
  const [viewMode, setViewMode] = useState<"class" | "subject">("class")
  const [showComparison, setShowComparison] = useState(false)

  useEffect(() => {
    if (user?.schoolId) {
      fetchAvailableSessions(user.schoolId)
    }
  }, [user?.schoolId, fetchAvailableSessions])

  useEffect(() => {
    if (!user?.schoolId || !filters.session) {
      return
    }

    if (viewMode === "class" && filters.class) {
      fetchClassPerformance(user.schoolId, filters.class, filters.term ?? 1, filters.session)
      return
    }

    if (viewMode === "subject" && filters.subject) {
      fetchSchoolSubjectPerformance(user.schoolId, filters.subject, filters.term ?? 1, filters.session)
    }
  }, [
    user?.schoolId,
    viewMode,
    filters.class,
    filters.subject,
    filters.term,
    filters.session,
    fetchClassPerformance,
    fetchSchoolSubjectPerformance,
  ])

  const handleFilterChange = (newFilters: PerformanceFilterValues) => {
    const merged = { ...filters, ...newFilters }
    setFilters(merged)

    if (!user?.schoolId || !merged.session) return

    if (viewMode === "class" && merged.class) {
      fetchClassPerformance(user.schoolId, merged.class, merged.term ?? 1, merged.session)
      return
    }

    if (viewMode === "subject" && merged.subject) {
      fetchSchoolSubjectPerformance(user.schoolId, merged.subject, merged.term ?? 1, merged.session)
    }
  }

  const role = (user?.role || "").toString().toLowerCase()
  const allowedRoles = ["staff", "admin", "administrator", "school_admin"]
  if (!user || !allowedRoles.includes(role)) {
    return (
      <Alert variant="destructive">
        <AlertDescription>You don't have permission to access this page</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">School Performance Analysis</h1>
        <p className="text-muted-foreground">Analyze performance by class or subject across your school</p>
      </div>

      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "class" | "subject") }>
        <TabsList>
          <TabsTrigger value="class">By Class</TabsTrigger>
          <TabsTrigger value="subject">By Subject</TabsTrigger>
        </TabsList>

        <TabsContent value="class" className="space-y-6">
          <PerformanceFilters
            onFilter={handleFilterChange}
            sessions={sessions}
            currentSession={currentSession ?? undefined}
            classes={classes}
            isLoading={isLoading}
          />

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading && (
            <div className="space-y-4">
              <Skeleton className="h-32" />
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
            </div>
          )}

          {!isLoading && analysis && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Class Average</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analysis.metrics.averageScore.toFixed(2)}
                      <span className="text-xs text-muted-foreground">/100</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Highest Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analysis.metrics.highestScore.toFixed(2)}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Lowest Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analysis.metrics.lowestScore.toFixed(2)}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analysis.metrics.passCount}/{analysis.metrics.totalResults}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {analysis.scoreDistribution && (
                  <PerformanceHistogram data={analysis.scoreDistribution} type="bar" />
                )}
                {analysis.gradeProgression && (
                  <PerformanceHistogram data={analysis.gradeProgression} type="line" />
                )}
              </div>

              {analysis.subjectComparison && (
                <PerformanceHistogram data={analysis.subjectComparison} type="bar" />
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Student Comparison</h2>
                  <Button onClick={() => setShowComparison((value) => !value)} variant="outline">
                    {showComparison ? "Hide" : "Show"} Comparison
                  </Button>
                </div>
                {showComparison && <StudentComparison data={analysis.comparisonData} showMetrics />}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="subject" className="space-y-6">
          <PerformanceFilters
            onFilter={handleFilterChange}
            sessions={sessions}
            currentSession={currentSession ?? undefined}
            subjects={subjects}
            isLoading={isLoading}
          />

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading && (
            <div className="space-y-4">
              <Skeleton className="h-32" />
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
            </div>
          )}

          {!isLoading && analysis && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Subject Average</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analysis.metrics.averageScore.toFixed(2)}
                      <span className="text-xs text-muted-foreground">/100</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Highest Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analysis.metrics.highestScore.toFixed(2)}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Lowest Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analysis.metrics.lowestScore.toFixed(2)}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analysis.metrics.passCount}/{analysis.metrics.totalResults}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {analysis.scoreDistribution && (
                  <PerformanceHistogram data={analysis.scoreDistribution} type="bar" />
                )}
                {analysis.gradeProgression && (
                  <PerformanceHistogram data={analysis.gradeProgression} type="line" />
                )}
              </div>

              {analysis.subjectComparison && (
                <PerformanceHistogram data={analysis.subjectComparison} type="bar" />
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Student Comparison</h2>
                  <Button onClick={() => setShowComparison((value) => !value)} variant="outline">
                    {showComparison ? "Hide" : "Show"} Comparison
                  </Button>
                </div>
                {showComparison && <StudentComparison data={analysis.comparisonData} showMetrics />}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      {!isLoading && !analysis && !error && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Select filters to view performance data</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
