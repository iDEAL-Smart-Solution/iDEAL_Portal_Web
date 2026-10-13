import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { BookOpenCheck, CheckCircle2, XCircle, Eye, RefreshCcw } from 'lucide-react'
import { useAuthStore, useStaffStore } from '@/store'
import axiosInstance from '@/services/api'
import { showError, showSuccess } from '@/lib/notifications'

interface PendingSubmission {
  subjectId: string
  subjectName: string
  subjectCode: string
  className?: string
  term: number
  session?: string
  totalStudents?: number
  status?: string
  pendingCount?: number
  rejectedCount?: number
  approvedCount?: number
}

interface SubmissionDetailRow {
  id: string
  resultId?: string
  studentId: string
  studentUin: string
  studentName: string
  className?: string
  first_CA_Score: number
  second_CA_Score: number
  third_CA_Score: number
  exam_Score: number
  total_Score: number
  grade: string
  remark?: string
  status?: string
  rejectionReason?: string | null
  reviewedAt?: string | null
  reviewedByName?: string | null
}

const normalizeSubmissionRows = (rows: any[]): SubmissionDetailRow[] => rows.map((row) => {
  const firstCA = Number(row.firstCA ?? row.first_CA_Score ?? 0)
  const secondCA = Number(row.secondCA ?? row.second_CA_Score ?? 0)
  const thirdCA = Number(row.thirdCA ?? row.third_CA_Score ?? 0)
  const exam = Number(row.exam ?? row.exam_Score ?? 0)
  const total = Number(row.totalScore ?? row.total_Score ?? (firstCA + secondCA + thirdCA + exam))

  return {
    id: row.resultId ?? row.id ?? row.studentId ?? '',
    resultId: row.resultId ?? row.id ?? undefined,
    studentId: row.studentId ?? '',
    studentUin: row.studentUin ?? '',
    studentName: row.studentName ?? '',
    className: row.className ?? '',
    first_CA_Score: firstCA,
    second_CA_Score: secondCA,
    third_CA_Score: thirdCA,
    exam_Score: exam,
    total_Score: total,
    grade: row.grade ?? 'N/A',
    status: row.status ?? 'PendingApproval',
    rejectionReason: row.rejectionReason ?? null,
    reviewedAt: row.reviewedAt ?? null,
    reviewedByName: row.reviewedByName ?? null,
  }
})

const getStatusLabel = (status?: string) => {
  const normalized = (status ?? '').toLowerCase()

  if (normalized.includes('rejected')) return 'Rejected'
  if (normalized.includes('approved')) return 'Approved'
  return 'Pending'
}

const getStatusClassName = (status?: string) => {
  const normalized = (status ?? '').toLowerCase()

  if (normalized.includes('rejected')) return 'border-red-200 bg-red-50 text-red-700'
  if (normalized.includes('approved')) return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  return 'border-amber-200 bg-amber-50 text-amber-700'
}

const isRejectedStatus = (status?: string) => (status ?? '').toLowerCase().includes('rejected')

export default function TeacherResultApproval() {
  const { user } = useAuthStore()
  const { teacherSubjects, fetchTeacherSubjects } = useStaffStore()
  const [canAccessApproval, setCanAccessApproval] = useState<boolean | null>(null)
  const [pendingSubmissions, setPendingSubmissions] = useState<PendingSubmission[]>([])
  const [selectedSubmission, setSelectedSubmission] = useState<PendingSubmission | null>(null)
  const [submissionRows, setSubmissionRows] = useState<SubmissionDetailRow[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [rejectTarget, setRejectTarget] = useState<SubmissionDetailRow | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [isRejecting, setIsRejecting] = useState(false)

  useEffect(() => {
    if (!user) return

    if (user.role !== 'staff') {
      setCanAccessApproval(false)
      return
    }

    let active = true
    axiosInstance.get('/result-approval/can-approve-results')
      .then(({ data }) => {
        if (!active) return
        setCanAccessApproval(Boolean(data?.canApprove ?? false))
      })
      .catch(() => {
        if (active) setCanAccessApproval(false)
      })

    return () => {
      active = false
    }
  }, [user?.id, user?.role])

  useEffect(() => {
    if (user?.id) {
      fetchTeacherSubjects(user.id)
    }
  }, [user, fetchTeacherSubjects])

  const loadPendingSubmissions = async () => {
    try {
      setIsRefreshing(true)
      const { data } = await axiosInstance.get('/result-approval/pending-submissions')
      const submissions = Array.isArray(data) ? data : []
      setPendingSubmissions(submissions)

      if (submissions.length === 0) {
        setSelectedSubmission(null)
        setSubmissionRows([])
        return
      }

      const shouldKeepSelection = selectedSubmission && submissions.some(
        (item: PendingSubmission) =>
          item.subjectId === selectedSubmission.subjectId &&
          item.term === selectedSubmission.term &&
          item.session === selectedSubmission.session,
      )

      const nextSelection = shouldKeepSelection ? selectedSubmission : submissions[0]
      setSelectedSubmission(nextSelection)
      await loadSubmissionDetail(nextSelection)
    } catch (error: any) {
      showError(error?.response?.data?.message || 'Unable to load pending result submissions.')
    } finally {
      setIsRefreshing(false)
    }
  }

  const loadSubmissionDetail = async (submission: PendingSubmission) => {
    setSelectedSubmission(submission)
    try {
      setIsLoading(true)
      const { data } = await axiosInstance.get(`/result-approval/submissions/${submission.subjectId}/${submission.term}`, {
        params: { session: submission.session },
      })
      const rawRows = Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data?.results)
          ? data.results
          : Array.isArray(data)
            ? data
            : []

      setSubmissionRows(normalizeSubmissionRows(rawRows))
    } catch (error: any) {
      showError(error?.response?.data?.message || 'Unable to load this submission batch.')
      setSubmissionRows([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user && canAccessApproval === true) {
      loadPendingSubmissions()
    }
  }, [user, canAccessApproval])

  const approveSubmission = async (submission: PendingSubmission) => {
    try {
      await axiosInstance.post('/result-approval/approve', {
        subjectId: submission.subjectId,
        term: submission.term,
        session: submission.session,
      })
      showSuccess('Submission approved successfully.')
      await loadPendingSubmissions()
    } catch (error: any) {
      showError(error?.response?.data?.message || 'Unable to approve this result batch.')
    }
  }

  const rejectResult = async (row: SubmissionDetailRow) => {
    setRejectTarget(row)
    setRejectionReason('')
    setIsRejectModalOpen(true)
  }

  const submitRejection = async () => {
    if (!rejectTarget) return
    const reason = rejectionReason.trim()
    if (!reason) {
      showError('Please provide a rejection reason before submitting.')
      return
    }

    try {
      setIsRejecting(true)
      const resultId = rejectTarget.resultId ?? rejectTarget.id
      await axiosInstance.post(`/result-approval/${resultId}/reject`, {
        reason,
      })
      showSuccess('Result rejected successfully.')
      setIsRejectModalOpen(false)
      setRejectTarget(null)
      setRejectionReason('')
      await loadPendingSubmissions()
    } catch (error: any) {
      showError(error?.response?.data?.message || 'Unable to reject this student result.')
    } finally {
      setIsRejecting(false)
    }
  }

  const totalStudents = selectedSubmission?.totalStudents ?? submissionRows.length

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    )
  }

  if (canAccessApproval === false) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <EmptyState
            title="No approval access"
            description="Only a class teacher assigned to a class can review result submissions."
            icon={BookOpenCheck}
          />
        </div>
      </DashboardLayout>
    )
  }

  if (canAccessApproval === null) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="w-full space-y-6 px-1 py-1 md:px-2">
        <PageHeader
          title="Result approval"
          description="Review pending subject submissions and approve or reject student results before they are published."
          actions={
            <Button variant="outline" onClick={loadPendingSubmissions} disabled={isRefreshing}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          }
        />

        <div className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)] xl:grid-cols-[460px_minmax(0,1fr)]">
          <Card className="w-full">
            <CardHeader className="px-4 pb-3 pt-4">
              <CardTitle>Pending submissions</CardTitle>
              <CardDescription>
                {pendingSubmissions.length} submission{pendingSubmissions.length === 1 ? '' : 's'} awaiting approval
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 px-4 pb-4">
              {pendingSubmissions.length === 0 ? (
                <EmptyState
                  title="No pending results"
                  description="There are no result batches waiting for approval at the moment."
                  icon={BookOpenCheck}
                />
              ) : (
                pendingSubmissions.map((submission) => {
                  const isSelected = selectedSubmission?.subjectId === submission.subjectId && selectedSubmission?.term === submission.term && selectedSubmission?.session === submission.session
                  const hasRejected = (submission.rejectedCount ?? 0) > 0
                  const hasPending = (submission.pendingCount ?? 0) > 0
                  const statusLabel = hasRejected && hasPending ? 'Mixed' : hasRejected ? 'Rejected' : 'Pending'

                  return (
                    <button
                      key={`${submission.subjectId}-${submission.term}-${submission.session}`}
                      type="button"
                      onClick={() => loadSubmissionDetail(submission)}
                      className={`w-full rounded-xl border p-4 text-left transition ${
                        isSelected ? 'border-primary-200 bg-primary-50' : 'border-neutral-200 bg-white hover:bg-neutral-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-sm text-text-primary">{submission.subjectName}</p>
                          <p className="text-xs text-text-tertiary mt-1">{submission.subjectCode}</p>
                        </div>
                        <Badge
                          variant={hasRejected && !hasPending ? 'destructive' : 'secondary'}
                          className={hasRejected && hasPending ? 'bg-orange-100 text-orange-700 border-orange-200' : ''}
                        >
                          {statusLabel}
                        </Badge>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-text-secondary">
                        <span>{submission.className || 'Class review'}</span>
                        <span>{submission.totalStudents ?? totalStudents ?? 0} students</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-text-secondary">
                        <span>Pending: {submission.pendingCount ?? 0}</span>
                        {hasRejected && <span>Rejected: {submission.rejectedCount ?? 0}</span>}
                      </div>
                    </button>
                  )
                })
              )}
            </CardContent>
          </Card>

          <Card className="w-full">
            <CardHeader className="flex flex-col gap-3 px-4 pb-3 pt-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>
                  {selectedSubmission ? `${selectedSubmission.subjectName} results` : 'Submission details'}
                </CardTitle>
                <CardDescription>
                  {selectedSubmission ? `Session ${selectedSubmission.session || 'N/A'} • Term ${selectedSubmission.term}` : 'Select a submission to review'}
                </CardDescription>
              </div>
              {selectedSubmission && (
                <Button onClick={() => approveSubmission(selectedSubmission)}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Approve batch
                </Button>
              )}
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {isLoading ? (
                <div className="flex min-h-[220px] items-center justify-center">
                  <LoadingSpinner size="md" />
                </div>
              ) : submissionRows.length === 0 ? (
                <div className="min-h-[220px] flex items-center justify-center">
                  <EmptyState
                    title="No student rows yet"
                    description="This subject submission is empty or no longer pending approval."
                    icon={Eye}
                  />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-neutral-200 text-sm">
                    <thead>
                      <tr className="text-left text-text-secondary">
                        <th className="py-3 pr-4">Student</th>
                        <th className="py-3 pr-4">UIN</th>
                        <th className="py-3 pr-4">CA1</th>
                        <th className="py-3 pr-4">CA2</th>
                        <th className="py-3 pr-4">CA3</th>
                        <th className="py-3 pr-4">Exam</th>
                        <th className="py-3 pr-4">Total</th>
                        <th className="py-3 pr-4">Grade</th>
                        <th className="py-3 pr-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {submissionRows.map((row) => (
                        <tr key={row.id} className="align-top">
                          <td className="py-3 pr-4">
                            <div className="font-medium">{row.studentName}</div>
                            <div className="text-xs text-text-tertiary">{row.className || 'No class'}</div>
                          </td>
                          <td className="py-3 pr-4 font-mono text-xs">{row.studentUin}</td>
                          <td className="py-3 pr-4">{row.first_CA_Score}</td>
                          <td className="py-3 pr-4">{row.second_CA_Score}</td>
                          <td className="py-3 pr-4">{row.third_CA_Score}</td>
                          <td className="py-3 pr-4">{row.exam_Score}</td>
                          <td className="py-3 pr-4 font-medium">{row.total_Score}</td>
                          <td className="py-3 pr-4">
                            <Badge variant={row.grade === 'A' ? 'default' : 'secondary'}>{row.grade || 'N/A'}</Badge>
                          </td>
                          <td className="py-3 pr-4">
                            <Badge className={getStatusClassName(row.status)} variant="outline">{getStatusLabel(row.status)}</Badge>
                          </td>
                          <td className="py-3 pr-4">
                            {isRejectedStatus(row.status) ? (
                              <span className="text-xs font-medium text-red-700">Already rejected</span>
                            ) : (
                              <Button variant="outline" size="sm" onClick={() => rejectResult(row)}>
                                <XCircle className="mr-2 h-4 w-4" />
                                Reject
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {isRejectModalOpen && rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="border-b border-slate-200 px-5 py-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Reject result</h3>
                  <p className="text-sm text-slate-500">{rejectTarget.studentName}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsRejectModalOpen(false)
                    setRejectTarget(null)
                    setRejectionReason('')
                  }}
                  className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Close rejection form"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-5">
              <label className="mb-2 block text-sm font-medium text-slate-700">Rejection reason</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={5}
                placeholder="Explain why this result is being rejected..."
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 px-5 py-4">
              <button
                type="button"
                onClick={() => {
                  setIsRejectModalOpen(false)
                  setRejectTarget(null)
                  setRejectionReason('')
                }}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitRejection}
                disabled={isRejecting || !rejectionReason.trim()}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isRejecting ? 'Rejecting...' : 'Reject result'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
