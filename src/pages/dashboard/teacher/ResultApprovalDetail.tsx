import { useEffect, useState } from "react"
import { useParams, useSearchParams, useNavigate } from "react-router-dom"
import { useAuthStore, useResultApprovalStore } from "@/store"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/ui/status-badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { EnhancedLoading } from "@/components/ui/enhanced-loading"
import { EmptyState } from "@/components/ui/empty-state"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  CheckCircle2,
  XCircle,
  Clock,
  BookOpen,
  User,
  Calendar,
  AlertCircle,
  FileText,
  ArrowLeft,
  Info,
} from "lucide-react"
import { formatDate } from "@/lib/utils"
import type { SubmissionResultItem } from "@/types"
import { showError, showSuccess } from "@/lib/notifications"

export default function ResultApprovalDetail() {
  const { subjectId, term } = useParams<{ subjectId: string; term: string }>()
  const [searchParams] = useSearchParams()
  const session = searchParams.get("session") || ""
  const navigate = useNavigate()

  const { user } = useAuthStore()
  const {
    currentSubmission,
    fetchSubmissionDetail,
    approveSubmission,
    rejectResult,
    clearCurrentSubmission,
    isLoading,
    isSubmitting,
    error,
  } = useResultApprovalStore()

  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [selectedResult, setSelectedResult] = useState<SubmissionResultItem | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")

  const termNumber = term ? Number(term) : 1

  useEffect(() => {
    if (subjectId && session) {
      fetchSubmissionDetail(subjectId, termNumber, session)
    }
    return () => {
      clearCurrentSubmission()
    }
  }, [subjectId, termNumber, session, fetchSubmissionDetail, clearCurrentSubmission])

  if (!user) {
    return (
      <DashboardLayout>
        <EnhancedLoading type="skeleton" rows={6} />
      </DashboardLayout>
    )
  }

  const handleOpenRejectDialog = (result: SubmissionResultItem) => {
    setSelectedResult(result)
    setRejectionReason("")
    setRejectDialogOpen(true)
  }

  const handleConfirmApproval = async () => {
    if (!subjectId || !session) return

    try {
      await approveSubmission({
        subjectId,
        term: termNumber,
        session,
        classId: currentSubmission?.classId,
      })
      setApproveDialogOpen(false)
      showSuccess("Submission results approved successfully")
    } catch (err: any) {
      const msg = err.response?.data?.details || err.response?.data?.message || err.message || "Failed to approve submission"
      showError(msg)
    }
  }

  const handleConfirmRejection = async () => {
    if (!selectedResult || !rejectionReason.trim()) {
      showError("Please enter a reason for rejecting this result")
      return
    }

    try {
      await rejectResult(selectedResult.id, rejectionReason.trim())
      setRejectDialogOpen(false)
      setSelectedResult(null)
      setRejectionReason("")
      showSuccess("Result rejected successfully")
    } catch (err: any) {
      const msg = err.response?.data?.details || err.response?.data?.message || err.message || "Failed to reject result"
      showError(msg)
    }
  }

  const getGradeBadgeColor = (grade: string) => {
    switch (grade) {
      case "A":
        return "bg-green-100 text-green-800"
      case "B":
        return "bg-blue-100 text-blue-800"
      case "C":
        return "bg-yellow-100 text-yellow-800"
      case "D":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-red-100 text-red-800"
    }
  }

  const getTermName = (t: number) => {
    switch (t) {
      case 1:
        return "1st Term"
      case 2:
        return "2nd Term"
      case 3:
        return "3rd Term"
      default:
        return `Term ${t}`
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Review Result Submission"
          description="Examine student scores for this subject and take approval or rejection action"
          showBackButton={true}
          backHref="/dashboard/teacher/results/approvals"
          actions={
            currentSubmission && currentSubmission.pendingCount && currentSubmission.pendingCount > 0 ? (
              <Button
                onClick={() => setApproveDialogOpen(true)}
                disabled={isSubmitting || isLoading}
                className="bg-green-600 hover:bg-green-700 text-white gap-2 shadow-soft"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Approve Submission
                  </>
                )}
              </Button>
            ) : null
          }
        />

        {/* Error notification banner */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Unable to process submission</p>
              <p className="mt-0.5 text-xs text-red-700">{error}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => subjectId && session && fetchSubmissionDetail(subjectId, termNumber, session)}
            >
              Retry
            </Button>
          </div>
        )}

        {isLoading ? (
          <EnhancedLoading type="skeleton" rows={6} />
        ) : !currentSubmission ? (
          <EmptyState
            icon={FileText}
            title="Submission Not Found"
            description="The requested subject result submission could not be loaded or does not exist."
            action={{
              label: "Back to Approvals",
              onClick: () => navigate("/dashboard/teacher/results/approvals"),
            }}
          />
        ) : (
          <>
            {/* Metadata Summary Card */}
            <Card className="border border-neutral-200 shadow-sm">
              <CardContent className="p-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                      Subject
                    </p>
                    <p className="text-lg font-bold text-text-primary">
                      {currentSubmission.subjectName || "Subject Details"}
                    </p>
                    {currentSubmission.subjectCode && (
                      <Badge variant="outline" className="font-mono text-xs">
                        {currentSubmission.subjectCode}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                      Class & Academic Period
                    </p>
                    <p className="text-base font-semibold text-text-primary">
                      {currentSubmission.className || "Assigned Class"}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {getTermName(currentSubmission.term)} • {currentSubmission.session}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                      Submitted By
                    </p>
                    <p className="text-base font-semibold text-text-primary flex items-center gap-1.5">
                      <User className="h-4 w-4 text-text-tertiary" />
                      {currentSubmission.submittedByTeacherName || "Subject Teacher"}
                    </p>
                    {currentSubmission.lastSubmittedAt && (
                      <p className="text-xs text-text-tertiary">
                        {formatDate(currentSubmission.lastSubmittedAt)}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                      Submission Breakdown
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      <span className="inline-flex items-center rounded-md bg-neutral-100 px-2 py-1 text-xs font-medium text-text-secondary">
                        {currentSubmission.totalResults} Total
                      </span>
                      {(currentSubmission.pendingCount ?? 0) > 0 && (
                        <span className="inline-flex items-center rounded-md bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                          {currentSubmission.pendingCount} Pending
                        </span>
                      )}
                      {(currentSubmission.approvedCount ?? 0) > 0 && (
                        <span className="inline-flex items-center rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                          {currentSubmission.approvedCount} Approved
                        </span>
                      )}
                      {(currentSubmission.rejectedCount ?? 0) > 0 && (
                        <span className="inline-flex items-center rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                          {currentSubmission.rejectedCount} Rejected
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notice card if all results are approved */}
            {currentSubmission.pendingCount === 0 && (currentSubmission.approvedCount ?? 0) > 0 && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold">All Results in this Submission are Finalized & Approved</p>
                  <p className="text-xs text-green-700 mt-0.5">
                    Approved student records are immutable and cannot be edited or rejected.
                  </p>
                </div>
              </div>
            )}

            {/* Results Table Card */}
            <Card className="border border-neutral-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-primary-600" />
                  Student Score Assessment
                </CardTitle>
                <CardDescription>
                  Review individual continuous assessment (CA) and examination scores before approving
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 sm:p-6">
                {currentSubmission.results.length === 0 ? (
                  <div className="p-6">
                    <EmptyState
                      icon={FileText}
                      title="No Student Results"
                      description="No student score records were found for this submission batch."
                    />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm">
                      <thead>
                        <tr className="border-b bg-neutral-50/80 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                          <th className="p-3">Student ID</th>
                          <th className="p-3">Student Name</th>
                          <th className="p-3 text-center">1st CA (10)</th>
                          <th className="p-3 text-center">2nd CA (10)</th>
                          <th className="p-3 text-center">3rd CA (10)</th>
                          <th className="p-3 text-center">Exam (70)</th>
                          <th className="p-3 text-center">Total (100)</th>
                          <th className="p-3 text-center">Grade</th>
                          <th className="p-3 text-center">Status</th>
                          <th className="p-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200 bg-white">
                        {currentSubmission.results.map((result) => {
                          const isPending = result.status === "pending"
                          const isApproved = result.status === "approved"
                          const isRejected = result.status === "rejected"

                          return (
                            <tr key={result.id || result.studentUin} className="hover:bg-neutral-50/60 transition-colors">
                              <td className="p-3 font-mono text-xs font-medium text-text-primary">
                                {result.studentUin}
                              </td>
                              <td className="p-3 font-medium text-text-primary">
                                {result.studentName}
                                {result.rejectionReason && (
                                  <div className="mt-1 flex items-start gap-1 text-xs text-red-600">
                                    <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                                    <span>Reason: {result.rejectionReason}</span>
                                  </div>
                                )}
                              </td>
                              <td className="p-3 text-center font-mono text-xs text-text-secondary">
                                {result.firstCAScore}/10
                              </td>
                              <td className="p-3 text-center font-mono text-xs text-text-secondary">
                                {result.secondCAScore}/10
                              </td>
                              <td className="p-3 text-center font-mono text-xs text-text-secondary">
                                {result.thirdCAScore}/10
                              </td>
                              <td className="p-3 text-center font-mono text-xs text-text-secondary">
                                {result.examScore}/70
                              </td>
                              <td className="p-3 text-center">
                                <Badge
                                  variant={result.totalScore >= 50 ? "default" : "destructive"}
                                  className="font-mono text-xs"
                                >
                                  {result.totalScore}/100
                                </Badge>
                              </td>
                              <td className="p-3 text-center">
                                <span
                                  className={`px-2 py-0.5 rounded text-xs font-bold ${getGradeBadgeColor(
                                    result.grade
                                  )}`}
                                >
                                  {result.grade}
                                </span>
                              </td>
                              <td className="p-3 text-center">
                                <StatusBadge status={result.status} />
                              </td>
                              <td className="p-3 text-center">
                                {isPending ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleOpenRejectDialog(result)}
                                    disabled={isSubmitting}
                                    className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 h-8 text-xs"
                                  >
                                    <XCircle className="h-3.5 w-3.5 mr-1" />
                                    Reject
                                  </Button>
                                ) : isApproved ? (
                                  <span className="text-xs text-green-700 font-medium">Finalized</span>
                                ) : isRejected ? (
                                  <span className="text-xs text-red-600 font-medium">Rejected</span>
                                ) : (
                                  "—"
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* ── Approval Confirmation Alert Dialog ── */}
        <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
          <AlertDialogContent className="bg-white max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="h-5 w-5" />
                Approve Result Submission
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-text-secondary space-y-2 mt-2">
                <p>
                  Are you sure you want to approve results for{" "}
                  <strong className="text-text-primary">
                    {currentSubmission?.subjectName} ({currentSubmission?.subjectCode})
                  </strong>{" "}
                  for <strong className="text-text-primary">{currentSubmission?.className}</strong> (
                  {currentSubmission && getTermName(currentSubmission.term)}, {currentSubmission?.session})?
                </p>
                <p className="text-xs text-text-tertiary">
                  Total of {currentSubmission?.totalResults} student result record(s) will be finalized.
                  Once approved, results become immutable and can be viewed on student report cards.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-4">
              <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmApproval}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Approving...
                  </>
                ) : (
                  "Confirm Approval"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* ── Individual Result Rejection Dialog ── */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent className="bg-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <XCircle className="h-5 w-5" />
                Reject Student Result
              </DialogTitle>
              <DialogDescription className="text-sm text-text-secondary mt-1">
                Provide a clear reason for rejecting the result of{" "}
                <strong className="text-text-primary">{selectedResult?.studentName}</strong> (
                {selectedResult?.studentUin}). The subject teacher will see this feedback to make corrections and resubmit.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="rounded-lg bg-neutral-50 p-3 text-xs space-y-1">
                <p className="text-text-tertiary">Result Summary:</p>
                <p className="font-semibold text-text-primary">
                  1st CA: {selectedResult?.firstCAScore}/10 • 2nd CA: {selectedResult?.secondCAScore}/10 • 3rd CA: {selectedResult?.thirdCAScore}/10 • Exam: {selectedResult?.examScore}/70 • Total: {selectedResult?.totalScore}/100 (Grade: {selectedResult?.grade})
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rejection-reason" className="text-sm font-medium">
                  Rejection Reason <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="rejection-reason"
                  placeholder="e.g. Continuous assessment score exceeds maximum or continuous assessment mark discrepancy..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  required
                  className="w-full text-sm"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setRejectDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleConfirmRejection}
                disabled={!rejectionReason.trim() || isSubmitting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Rejecting...
                  </>
                ) : (
                  "Reject Result"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
