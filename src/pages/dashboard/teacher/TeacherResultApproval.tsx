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
}

interface SubmissionDetailRow {
  id: string
  studentId: string
  studentUin: string
  studentName: string
  className: string
  first_CA_Score: number
  second_CA_Score: number
  third_CA_Score: number
  exam_Score: number
  total_Score: number
  grade: string
  remark?: string
  status: string
}

export default function TeacherResultApproval() {
  const { user } = useAuthStore()
  const { teacherSubjects, fetchTeacherSubjects } = useStaffStore()
  const [pendingSubmissions, setPendingSubmissions] = useState<PendingSubmission[]>([])
  const [selectedSubmission, setSelectedSubmission] = useState<PendingSubmission | null>(null)
  const [submissionRows, setSubmissionRows] = useState<SubmissionDetailRow[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

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

      if (submissions.length > 0 && !selectedSubmission) {
        setSelectedSubmission(submissions[0])
        await loadSubmissionDetail(submissions[0])
      } else if (submissions.length === 0) {
        setSelectedSubmission(null)
        setSubmissionRows([])
      }
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
      const rows = Array.isArray(data?.items) ? data.items : Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : []
      setSubmissionRows(rows)
    } catch (error: any) {
      showError(error?.response?.data?.message || 'Unable to load this submission batch.')
      setSubmissionRows([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      loadPendingSubmissions()
    }
  }, [user])

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
    const reason = window.prompt('Please provide a rejection reason for this result:')
    if (!reason || !reason.trim()) {
      return
    }

    try {
      await axiosInstance.post(`/result-approval/${row.id}/reject`, {
        reason: reason.trim(),
      })
      showSuccess('Result rejected successfully.')
      if (selectedSubmission) {
        await loadSubmissionDetail(selectedSubmission)
      }
    } catch (error: any) {
      showError(error?.response?.data?.message || 'Unable to reject this student result.')
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
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

        <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <Card>
            <CardHeader>
              <CardTitle>Pending submissions</CardTitle>
              <CardDescription>
                {pendingSubmissions.length} submission{pendingSubmissions.length === 1 ? '' : 's'} awaiting approval
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingSubmissions.length === 0 ? (
                <EmptyState
                  title="No pending results"
                  description="There are no result batches waiting for approval at the moment."
                  icon={BookOpenCheck}
                />
              ) : (
                pendingSubmissions.map((submission) => {
                  const isSelected = selectedSubmission?.subjectId === submission.subjectId && selectedSubmission?.term === submission.term && selectedSubmission?.session === submission.session

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
                        <Badge variant="secondary">Term {submission.term}</Badge>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-text-secondary">
                        <span>{submission.className || 'Class review'}</span>
                        <span>{submission.totalStudents ?? totalStudents ?? 0} students</span>
                      </div>
                    </button>
                  )
                })
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
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
            <CardContent>
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
                            <Button variant="outline" size="sm" onClick={() => rejectResult(row)}>
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject
                            </Button>
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
    </DashboardLayout>
  )
}
