import { useEffect, useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthStore, useResultApprovalStore, useResultsStore } from "@/store"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PageHeader } from "@/components/ui/page-header"
import { DataTable } from "@/components/ui/data-table"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/ui/status-badge"
import { EmptyState } from "@/components/ui/empty-state"
import { EnhancedLoading } from "@/components/ui/enhanced-loading"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ClipboardCheck,
  FileText,
  Eye,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
} from "lucide-react"
import { formatDate } from "@/lib/utils"
import type { PendingSubmission } from "@/types"

export default function ResultApprovals() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { pendingSubmissions, fetchPendingSubmissions, isLoading, error } = useResultApprovalStore()
  const { academicSessions, currentSession, fetchAcademicSessions, fetchCurrentSession } = useResultsStore()

  const [activeTab, setActiveTab] = useState<"pending" | "history" | "all">("pending")
  const [selectedSession, setSelectedSession] = useState<string>("all")
  const [selectedTerm, setSelectedTerm] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")

  useEffect(() => {
    fetchPendingSubmissions()
    fetchAcademicSessions()
    fetchCurrentSession()
  }, [fetchPendingSubmissions, fetchAcademicSessions, fetchCurrentSession])

  const getSubmissionStatus = (item: PendingSubmission): "pending" | "approved" | "rejected" => {
    if (item.pendingCount > 0) return "pending"
    if (item.rejectedCount > 0 && item.approvedCount === 0) return "rejected"
    if (item.approvedCount > 0 && item.pendingCount === 0) return "approved"
    return "pending"
  }

  // Derived counts
  const pendingCount = useMemo(
    () => pendingSubmissions.filter((s) => s.pendingCount > 0).length,
    [pendingSubmissions]
  )

  const historyCount = useMemo(
    () => pendingSubmissions.filter((s) => s.pendingCount === 0).length,
    [pendingSubmissions]
  )

  // Filtered submissions based on active tab and filters
  const filteredSubmissions = useMemo(() => {
    return pendingSubmissions.filter((submission) => {
      // Tab filter
      const isPending = submission.pendingCount > 0
      if (activeTab === "pending" && !isPending) return false
      if (activeTab === "history" && isPending) return false

      // Session filter
      if (selectedSession !== "all" && submission.session !== selectedSession) {
        return false
      }

      // Term filter
      if (selectedTerm !== "all" && String(submission.term) !== selectedTerm) {
        return false
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchesSubject =
          submission.subjectName.toLowerCase().includes(query) ||
          submission.subjectCode.toLowerCase().includes(query)
        const matchesClass = submission.className.toLowerCase().includes(query)
        const matchesTeacher = submission.submittedByTeacherName.toLowerCase().includes(query)
        if (!matchesSubject && !matchesClass && !matchesTeacher) {
          return false
        }
      }

      return true
    })
  }, [pendingSubmissions, activeTab, selectedSession, selectedTerm, searchQuery])

  if (!user) {
    return (
      <DashboardLayout>
        <EnhancedLoading type="skeleton" rows={4} />
      </DashboardLayout>
    )
  }

  const columns = [
    {
      key: "subjectName" as keyof PendingSubmission,
      label: "Subject",
      render: (_: string, item: PendingSubmission) => (
        <div className="space-y-0.5">
          <p className="font-medium text-text-primary">{item.subjectName}</p>
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="font-mono text-xs">
              {item.subjectCode || "N/A"}
            </Badge>
          </div>
        </div>
      ),
    },
    {
      key: "className" as keyof PendingSubmission,
      label: "Class",
      render: (value: string) => <span className="font-semibold text-text-primary">{value}</span>,
    },
    {
      key: "submittedByTeacherName" as keyof PendingSubmission,
      label: "Subject Teacher",
      render: (value: string) => <span className="text-sm text-text-secondary">{value || "Subject Teacher"}</span>,
    },
    {
      key: "term" as keyof PendingSubmission,
      label: "Term & Session",
      render: (_: number, item: PendingSubmission) => (
        <div className="text-xs text-text-secondary">
          <p className="font-medium text-text-primary">
            {item.term === 1 ? "1st Term" : item.term === 2 ? "2nd Term" : item.term === 3 ? "3rd Term" : `Term ${item.term}`}
          </p>
          <p className="text-text-tertiary">{item.session}</p>
        </div>
      ),
    },
    {
      key: "totalResults" as keyof PendingSubmission,
      label: "Results",
      render: (_: number, item: PendingSubmission) => (
        <div className="space-y-1">
          <p className="text-sm font-medium text-text-primary">
            {item.totalResults} student{item.totalResults === 1 ? "" : "s"}
          </p>
          <div className="flex flex-wrap gap-1">
            {item.pendingCount > 0 && (
              <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-[11px] font-medium text-yellow-800">
                {item.pendingCount} pending
              </span>
            )}
            {item.approvedCount > 0 && (
              <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-medium text-green-800">
                {item.approvedCount} approved
              </span>
            )}
            {item.rejectedCount > 0 && (
              <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-800">
                {item.rejectedCount} rejected
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "status" as keyof PendingSubmission,
      label: "Status",
      render: (_: any, item: PendingSubmission) => (
        <StatusBadge status={getSubmissionStatus(item)} />
      ),
    },
    {
      key: "lastSubmittedAt" as keyof PendingSubmission,
      label: "Submitted Date",
      render: (value: string) => (
        <span className="text-xs text-text-tertiary">{formatDate(value)}</span>
      ),
    },
    {
      key: "subjectId" as keyof PendingSubmission,
      label: "Action",
      render: (_: string, item: PendingSubmission) => {
        const isPending = item.pendingCount > 0
        return (
          <Button
            size="sm"
            variant={isPending ? "default" : "outline"}
            onClick={() =>
              navigate(
                `/dashboard/teacher/results/approvals/${item.subjectId}/${item.term}?session=${encodeURIComponent(item.session)}`
              )
            }
            className="whitespace-nowrap"
          >
            <Eye className="h-4 w-4 mr-1.5" />
            {isPending ? "Review" : "View"}
          </Button>
        )
      },
    },
  ]


  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Result Approvals"
          description="Review, approve, or reject student result submissions from subject teachers for your assigned classes"
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchPendingSubmissions()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          }
        />

        {/* Top Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card
            className={`cursor-pointer transition-all ${
              activeTab === "pending" ? "border-primary-500 ring-2 ring-primary-100" : "hover:border-neutral-300"
            }`}
            onClick={() => setActiveTab("pending")}
          >
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                    Pending Review
                  </p>
                  <p className="text-2xl font-bold text-yellow-600 mt-1">{pendingCount}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600">
                  <Clock className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all ${
              activeTab === "history" ? "border-primary-500 ring-2 ring-primary-100" : "hover:border-neutral-300"
            }`}
            onClick={() => setActiveTab("history")}
          >
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                    Approval History
                  </p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{historyCount}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all ${
              activeTab === "all" ? "border-primary-500 ring-2 ring-primary-100" : "hover:border-neutral-300"
            }`}
            onClick={() => setActiveTab("all")}
          >
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                    Total Submissions
                  </p>
                  <p className="text-2xl font-bold text-primary-600 mt-1">{pendingSubmissions.length}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
                  <ClipboardCheck className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Tab Navigation */}
        <Card>
          <CardContent className="pt-5 pb-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <Tabs
                value={activeTab}
                onValueChange={(val) => setActiveTab(val as "pending" | "history" | "all")}
              >
                <TabsList className="bg-neutral-100">
                  <TabsTrigger value="pending" className="gap-2">
                    <Clock className="h-4 w-4" />
                    Pending ({pendingCount})
                  </TabsTrigger>
                  <TabsTrigger value="history" className="gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    History ({historyCount})
                  </TabsTrigger>
                  <TabsTrigger value="all" className="gap-2">
                    All ({pendingSubmissions.length})
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex flex-wrap items-center gap-3">
                {/* Session Filter */}
                <div className="w-44">
                  <Select value={selectedSession} onValueChange={setSelectedSession}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="All Sessions" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="all">All Sessions</SelectItem>
                      {academicSessions.map((session) => (
                        <SelectItem key={session.id} value={session.name}>
                          {session.name} {session.isCurrent ? "(Current)" : ""}
                        </SelectItem>
                      ))}
                      {currentSession && !academicSessions.some((s) => s.name === currentSession.name) && (
                        <SelectItem value={currentSession.name}>{currentSession.name}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Term Filter */}
                <div className="w-36">
                  <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="All Terms" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="all">All Terms</SelectItem>
                      <SelectItem value="1">First Term</SelectItem>
                      <SelectItem value="2">Second Term</SelectItem>
                      <SelectItem value="3">Third Term</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(selectedSession !== "all" || selectedTerm !== "all" || searchQuery) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedSession("all")
                      setSelectedTerm("all")
                      setSearchQuery("")
                    }}
                    className="text-xs text-text-tertiary hover:text-text-primary"
                  >
                    Reset filters
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Notification */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Failed to load result submissions</p>
              <p className="mt-0.5 text-xs text-red-700">{error}</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => fetchPendingSubmissions()}>
              Try Again
            </Button>
          </div>
        )}

        {/* Content Table / Empty State */}
        {isLoading ? (
          <EnhancedLoading type="skeleton" rows={5} />
        ) : filteredSubmissions.length === 0 ? (
          activeTab === "pending" ? (
            <EmptyState
              icon={CheckCircle2}
              title="No Pending Submissions"
              description="There are no result submissions waiting for your approval right now."
            />
          ) : activeTab === "history" ? (
            <EmptyState
              icon={FileText}
              title="No Approval History"
              description="Past approved and rejected submissions will appear here once processed."
            />
          ) : (
            <EmptyState
              icon={ClipboardCheck}
              title="No Submissions Found"
              description="No result submissions match your current filters. If you are a Class Teacher, submissions for your class subjects will appear here."
            />
          )
        ) : (
          <DataTable
            data={filteredSubmissions}
            columns={columns}
            searchable
            searchPlaceholder="Search by subject, class, or teacher..."
            onSearch={setSearchQuery}
          />
        )}
      </div>
    </DashboardLayout>
  )
}
