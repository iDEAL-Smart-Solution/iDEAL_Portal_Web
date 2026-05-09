import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import type { ComparisonData, StudentComparisonPoint } from "@/store/performance-store"

interface StudentComparisonProps {
  data: ComparisonData | null
  showMetrics?: boolean
}
const getGradeBadgeVariant = (grade: string): "default" | "secondary" | "destructive" | "outline" => {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    A: "default",
    B: "secondary",
    C: "outline",
    D: "outline",
    E: "secondary",
    F: "destructive",
  }
  return variants[grade] || "outline"
}

export function StudentComparison({ data, showMetrics = true }: StudentComparisonProps) {
  if (!data || !data.students || data.students.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-sm text-muted-foreground">No comparison data available</p>
        </CardContent>
      </Card>
    )
  }

  const topPerformer = data.students.reduce((prev, current) =>
    prev.score > current.score ? prev : current
  )

  const lowestPerformer = data.students.reduce((prev, current) =>
    prev.score < current.score ? prev : current
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Performance Comparison</CardTitle>
        <CardDescription>
          Comparing {data.students.length} student{data.students.length !== 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead className="text-right">Grade</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.students.map((student) => (
                <TableRow key={student.studentId}>
                  <TableCell className="font-medium">{student.studentName}</TableCell>
                  <TableCell className="text-right">
                    <span className="font-semibold">{student.score.toFixed(2)}</span>
                    <span className="ml-2 text-xs text-muted-foreground">/100</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={getGradeBadgeVariant(student.grade)}>{student.grade}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {student.score === topPerformer?.score ? (
                      <Badge variant="default" className="bg-green-600">
                        Top
                      </Badge>
                    ) : student.score === lowestPerformer?.score ? (
                      <Badge variant="destructive">Lowest</Badge>
                    ) : (
                      <Badge variant="outline">—</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {showMetrics && (
          <div className="mt-6 grid grid-cols-3 gap-4 border-t pt-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Class Average</p>
              <p className="text-2xl font-bold">{data.classAverage.toFixed(2)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Highest Score</p>
              <p className="text-2xl font-bold">
                {topPerformer?.score.toFixed(2)}
                <span className="text-base text-muted-foreground"> ({topPerformer?.studentName})</span>
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Lowest Score</p>
              <p className="text-2xl font-bold">
                {lowestPerformer?.score.toFixed(2)}
                <span className="text-base text-muted-foreground"> ({lowestPerformer?.studentName})</span>
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
