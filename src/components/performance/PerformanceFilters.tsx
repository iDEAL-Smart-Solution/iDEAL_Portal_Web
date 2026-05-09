import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { useEffect } from "react"

export interface PerformanceFilterValues {
  term?: number
  session?: string
  subject?: string
  class?: string
  student?: string
}

interface PerformanceFiltersProps {
  onFilter: (filters: PerformanceFilterValues) => void
  sessions?: string[]
  currentSession?: string
  terms?: number[]
  subjects?: Array<{ id: string; name: string }>
  classes?: Array<{ id: string; name: string }>
  students?: Array<{ id: string; name: string }>
  isLoading?: boolean
}

export function PerformanceFilters({
  onFilter,
  sessions = [],
  currentSession,
  terms = [1, 2, 3],
  subjects = [],
  classes = [],
  students = [],
  isLoading = false,
}: PerformanceFiltersProps) {
  const [filters, setFilters] = useState<PerformanceFilterValues>({
    term: 1,
    session: currentSession,
  })

  // Keep internal session in sync when parent provides currentSession later
  useEffect(() => {
    setFilters((prev) => ({ ...prev, session: currentSession }))
  }, [currentSession])

  const handleTermChange = (value: string) => {
    const newFilters = { ...filters, term: parseInt(value) }
    setFilters(newFilters)
  }

  const handleSessionChange = (value: string) => {
    const newFilters = { ...filters, session: value }
    setFilters(newFilters)
  }

  const handleSubjectChange = (value: string) => {
    const newFilters = { ...filters, subject: value === "all" ? undefined : value }
    setFilters(newFilters)
  }

  const handleClassChange = (value: string) => {
    const newFilters = { ...filters, class: value === "all" ? undefined : value }
    setFilters(newFilters)
  }

  const handleStudentChange = (value: string) => {
    const newFilters = { ...filters, student: value === "all" ? undefined : value }
    setFilters(newFilters)
  }

  const handleApplyFilters = () => {
    onFilter(filters)
  }

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {/* Term Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Term</label>
            <Select value={String(filters.term)} onValueChange={handleTermChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select term" />
              </SelectTrigger>
              <SelectContent>
                {terms.map((term) => (
                  <SelectItem key={term} value={String(term)}>
                    Term {term}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Session Filter */}
          {sessions.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Session</label>
              <Select value={filters.session || ""} onValueChange={handleSessionChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select session" />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((session) => (
                    <SelectItem key={session} value={session}>
                      {session}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Subject Filter */}
          {subjects.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Select value={filters.subject || "all"} onValueChange={handleSubjectChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Class Filter */}
          {classes.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Class</label>
              <Select value={filters.class || "all"} onValueChange={handleClassChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Student Filter */}
          {students.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Student</label>
              <Select value={filters.student || "all"} onValueChange={handleStudentChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setFilters({ term: 1, session: currentSession })}>
            Reset
          </Button>
          <Button onClick={handleApplyFilters} disabled={isLoading}>
            {isLoading ? "Loading..." : "Apply Filters"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
