

import { useEffect, useRef } from "react"
import { useAuthStore, useResultsStore } from "@/store"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PageHeader } from "@/components/ui/page-header"
import { DataTable } from "@/components/ui/data-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { EmptyState } from "@/components/ui/empty-state"
import { FileText, TrendingUp, Award, Printer } from "lucide-react"
import { getGradeColor, formatDate } from "@/lib/utils"
import type { Result } from "@/types"

export default function StudentResults() {
  const { user } = useAuthStore()
  const { results, fetchResults, isLoading, error } = useResultsStore()
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user?.id) {
      fetchResults(user.id)
    }
  }, [user, fetchResults])

  const handlePrint = () => {
    const printContent = printRef.current
    if (!printContent) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const schoolName = sessionStorage.getItem('SchoolName') || 'School'
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Academic Results - ${user?.firstName} ${user?.lastName}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: Arial, sans-serif; 
            padding: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #333;
          }
          .header h1 { font-size: 24px; margin-bottom: 5px; }
          .header h2 { font-size: 18px; color: #666; margin-bottom: 10px; }
          .student-info {
            margin-bottom: 20px;
            padding: 15px;
            background: #f5f5f5;
            border-radius: 5px;
          }
          .student-info p { margin: 5px 0; }
          .stats {
            display: flex;
            justify-content: space-around;
            margin-bottom: 20px;
            padding: 15px;
            background: #e8f4fd;
            border-radius: 5px;
          }
          .stat-item { text-align: center; }
          .stat-item .value { font-size: 24px; font-weight: bold; color: #2563eb; }
          .stat-item .label { font-size: 12px; color: #666; }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px;
          }
          th, td { 
            border: 1px solid #ddd; 
            padding: 12px 8px; 
            text-align: left; 
          }
          th { 
            background-color: #2563eb; 
            color: white;
            font-weight: bold;
          }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .grade-A { color: #15803d; font-weight: bold; }
          .grade-B { color: #2563eb; font-weight: bold; }
          .grade-C { color: #ca8a04; font-weight: bold; }
          .grade-D { color: #ea580c; font-weight: bold; }
          .grade-E, .grade-F { color: #dc2626; font-weight: bold; }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${schoolName}</h1>
          <h2>Academic Results Report</h2>
        </div>
        
        <div class="student-info">
          <p><strong>Student Name:</strong> ${user?.firstName} ${user?.lastName}</p>
          <p><strong>Generated On:</strong> ${new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
        </div>

        <div class="stats">
          <div class="stat-item">
            <div class="value">${averageScore.toFixed(1)}%</div>
            <div class="label">Average Score</div>
          </div>
          <div class="stat-item">
            <div class="value">${highestScore}%</div>
            <div class="label">Highest Score</div>
          </div>
          <div class="stat-item">
            <div class="value">${results.length}</div>
            <div class="label">Total Subjects</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Subject</th>
              <th>Term</th>
              <th>Session</th>
              <th>Score</th>
              <th>Grade</th>
            </tr>
          </thead>
          <tbody>
            ${results.map(result => `
              <tr>
                <td>${result.subjectName || result.subjectCode || 'Unknown'}</td>
                <td>${result.term}</td>
                <td>${result.academicYear}</td>
                <td>${result.score}%</td>
                <td class="grade-${result.grade}">${result.grade}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>This is an official academic results document generated from the iDEAL Portal</p>
          <p>© ${new Date().getFullYear()} ${schoolName}. All rights reserved.</p>
        </div>
      </body>
      </html>
    `)
    
    printWindow.document.close()
    printWindow.focus()
    
    // Wait for content to load before printing
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }

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
      key: "subjectName" as keyof Result,
      label: "Subject",
      render: (value: string, row: Result) => (
        <div className="font-medium">
          {value || row.subjectCode || "Unknown Subject"}
        </div>
      ),
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
      <div className="space-y-6" ref={printRef}>
        <PageHeader 
          title="Academic Results" 
          description="View your academic performance and grades"
          actions={
            results.length > 0 && (
              <Button onClick={handlePrint} variant="outline">
                <Printer className="h-4 w-4 mr-2" />
                Print Results
              </Button>
            )
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

