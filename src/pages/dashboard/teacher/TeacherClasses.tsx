import { useEffect, useMemo, useState } from "react"
import { useAuthStore, useResultsStore } from "@/store"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { EmptyState } from "@/components/ui/empty-state"
import { Button } from "@/components/ui/button"
import { Users, MessageSquareText, Save, PenLine, Upload } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { resolveMediaUrl } from "@/lib/utils"
import axiosInstance from "@/services/api"
import { showError, showSuccess } from "@/lib/notifications"

type ClassStudent = { id: string; name: string; uin: string; profilePictureUrl?: string | null }
type TeacherClass = { id: string; name: string; students: ClassStudent[]; signatureUrl?: string | null }
type SaveState = "saved" | "saving" | undefined

function parseTerm(value: unknown): number | undefined {
  const numeric = Number(value)
  if (Number.isInteger(numeric) && numeric >= 1 && numeric <= 3) return numeric
  if (typeof value === "string") {
    const normalized = value.toLowerCase()
    if (normalized.includes("first")) return 1
    if (normalized.includes("second")) return 2
    if (normalized.includes("third")) return 3
  }
  return undefined
}

export default function TeacherClasses() {
  const { user } = useAuthStore()
  const { academicSessions, currentSession, fetchAcademicSessions, fetchCurrentSession } = useResultsStore()
  const [classes, setClasses] = useState<TeacherClass[]>([])
  const [selectedClassId, setSelectedClassId] = useState("")
  const [selectedSession, setSelectedSession] = useState("")
  const [selectedTerm, setSelectedTerm] = useState(1)
  const [comments, setComments] = useState<Record<string, string>>({})
  const [saveStates, setSaveStates] = useState<Record<string, SaveState>>({})
  const [isLoadingClasses, setIsLoadingClasses] = useState(true)
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false)
  const [signatureFile, setSignatureFile] = useState<File | null>(null)
  const [isUploadingSignature, setIsUploadingSignature] = useState(false)

  useEffect(() => {
    fetchAcademicSessions()
    fetchCurrentSession()
    let active = true
    setIsLoadingClasses(true)
    axiosInstance.get("/ClassTeacherComments/my-classes")
      .then(({ data }) => {
        if (!active) return
        const assignedClasses: TeacherClass[] = (Array.isArray(data) ? data : []).map((item: any) => ({
          id: item.id ?? item.Id,
          name: item.name ?? item.Name,
          signatureUrl: item.signatureUrl ?? item.SignatureUrl ?? null,
          students: (item.students ?? item.Students ?? []).map((student: any) => ({
            id: student.id ?? student.Id,
            name: student.name ?? student.Name,
            uin: student.uin ?? student.Uin ?? student.UIN ?? "",
            profilePictureUrl: student.profilePictureUrl ?? student.ProfilePictureUrl ?? null,
          })),
        }))
        setClasses(assignedClasses)
        setSelectedClassId((current) => current || assignedClasses[0]?.id || "")
      })
      .catch((error) => {
        if (active) showError(error?.response?.data?.message || "Could not load your assigned classes.")
      })
      .finally(() => { if (active) setIsLoadingClasses(false) })
    return () => { active = false }
  }, [fetchAcademicSessions, fetchCurrentSession])

  useEffect(() => {
    if (!selectedSession && currentSession?.name) setSelectedSession(currentSession.name)
    const term = parseTerm(currentSession?.currentTerm)
    if (term) setSelectedTerm(term)
  }, [currentSession, selectedSession])

  useEffect(() => {
    if (!selectedClassId || !selectedSession) {
      setComments({})
      return
    }
    let active = true
    setIsLoadingComments(true)
    axiosInstance.get("/ClassTeacherComments", {
      params: { classId: selectedClassId, term: selectedTerm, session: selectedSession },
    })
      .then(({ data }) => {
        if (!active) return
        const values: Record<string, string> = {}
        ;(Array.isArray(data) ? data : []).forEach((item: any) => {
          values[item.studentId ?? item.StudentId] = item.comment ?? item.Comment ?? ""
        })
        setComments(values)
        setSaveStates({})
      })
      .catch((error) => {
        if (active) showError(error?.response?.data?.message || "Could not load class teacher comments.")
      })
      .finally(() => { if (active) setIsLoadingComments(false) })
    return () => { active = false }
  }, [selectedClassId, selectedSession, selectedTerm])

  const selectedClass = useMemo(
    () => classes.find((classItem) => classItem.id === selectedClassId),
    [classes, selectedClassId],
  )

  const uploadSignature = async () => {
    if (!signatureFile) {
      showError("Choose a PNG or JPEG signature image first.")
      return
    }
    if (!["image/png", "image/jpeg"].includes(signatureFile.type)) {
      showError("Signature must be a PNG or JPEG image.")
      return
    }
    if (signatureFile.size > 100 * 1024) {
      showError("Signature image must be 100KB or smaller.")
      return
    }

    const formData = new FormData()
    formData.append("file", signatureFile)
    setIsUploadingSignature(true)
    try {
      const { data } = await axiosInstance.post("/ClassTeacherComments/signature", formData)
      const signatureUrl = data.signatureUrl ?? data.SignatureUrl
      setClasses((previous) => previous.map((classItem) => ({ ...classItem, signatureUrl })))
      setSignatureFile(null)
      setSignatureDialogOpen(false)
      showSuccess(data.message || "Class teacher signature saved.")
    } catch (error: any) {
      showError(error?.response?.data?.message || "Could not save your signature.")
    } finally {
      setIsUploadingSignature(false)
    }
  }

  const saveComment = async (student: ClassStudent) => {
    if (!selectedClassId || !selectedSession) return
    setSaveStates((previous) => ({ ...previous, [student.id]: "saving" }))
    try {
      const response = await axiosInstance.put("/ClassTeacherComments", {
        classId: selectedClassId,
        studentId: student.id,
        term: selectedTerm,
        session: selectedSession,
        comment: comments[student.id] || "",
      })
      setSaveStates((previous) => ({ ...previous, [student.id]: "saved" }))
      showSuccess(response.data?.message || `Comment saved for ${student.name}.`)
    } catch (error: any) {
      setSaveStates((previous) => ({ ...previous, [student.id]: undefined }))
      showError(error?.response?.data?.message || `Could not save the comment for ${student.name}.`)
    }
  }

  if (!user) {
    return <DashboardLayout><div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div></DashboardLayout>
  }

  if (isLoadingClasses) {
    return <DashboardLayout><div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div></DashboardLayout>
  }

  if (classes.length === 0) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <PageHeader title="My Classes" description="Manage your assigned classes and write report card comments." />
          <EmptyState icon={Users} title="No Classes Assigned" description="You do not currently have a class assigned to you. Contact your school administrator if you believe this is a mistake." />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="My Classes"
          description="Review your class roster and add an individual comment for each student's report card."
          actions={(
            <Button variant="outline" onClick={() => setSignatureDialogOpen(true)}>
              <PenLine className="mr-2 h-4 w-4" />{selectedClass?.signatureUrl ? "Update Signature" : "Add Signature"}
            </Button>
          )}
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MessageSquareText className="h-5 w-5" />Class teacher comments</CardTitle>
            <CardDescription>Comments are saved separately for each student, class, term, and session. They appear on that term's term and mid-term report cards.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <label className="space-y-2 text-sm font-medium">
              <span>Class</span>
              <select value={selectedClassId} onChange={(event) => setSelectedClassId(event.target.value)} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 font-normal">
                {classes.map((classItem) => <option key={classItem.id} value={classItem.id}>{classItem.name}</option>)}
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium">
              <span>Academic session</span>
              <select value={selectedSession} onChange={(event) => setSelectedSession(event.target.value)} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 font-normal">
                <option value="">Select a session</option>
                {academicSessions.map((session) => <option key={session.id} value={session.name}>{session.name}</option>)}
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium">
              <span>Term</span>
              <select value={selectedTerm} onChange={(event) => setSelectedTerm(Number(event.target.value))} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 font-normal">
                <option value={1}>First Term</option>
                <option value={2}>Second Term</option>
                <option value={3}>Third Term</option>
              </select>
            </label>
          </CardContent>
        </Card>

        {selectedClass && (
          <Card>
            <CardHeader>
              <CardTitle>{selectedClass.name}</CardTitle>
              <CardDescription>{selectedClass.students.length} {selectedClass.students.length === 1 ? "student" : "students"}</CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedSession ? (
                <p className="text-sm text-amber-700">Select an academic session to load comments.</p>
              ) : isLoadingComments ? (
                <div className="flex items-center justify-center py-12"><LoadingSpinner size="lg" /></div>
              ) : selectedClass.students.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">There are no students in this class.</p>
              ) : (
                <div className="space-y-4">
                  {selectedClass.students.map((student) => (
                    <div key={student.id} className="grid gap-3 rounded-lg border border-gray-200 p-4 md:grid-cols-[minmax(180px,1fr)_minmax(280px,2fr)_auto] md:items-center">
                      <div>
                        <p className="font-medium text-gray-900">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.uin}</p>
                      </div>
                      <label className="space-y-1 text-sm">
                        <span className="sr-only">Class teacher comment for {student.name}</span>
                        <textarea
                          value={comments[student.id] || ""}
                          onChange={(event) => {
                            const value = event.target.value
                            setComments((previous) => ({ ...previous, [student.id]: value }))
                            setSaveStates((previous) => ({ ...previous, [student.id]: undefined }))
                          }}
                          maxLength={1500}
                          rows={3}
                          placeholder="Write a personal comment for this student's report card..."
                          className="w-full resize-y rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                        />
                        <span className="block text-right text-xs text-muted-foreground">{(comments[student.id] || "").length}/1500</span>
                      </label>
                      <div className="flex items-center justify-end gap-3">
                        {saveStates[student.id] === "saved" && <span className="text-xs text-green-700">Saved</span>}
                        <Button onClick={() => saveComment(student)} disabled={saveStates[student.id] === "saving" || !selectedSession}>
                          <Save className="mr-2 h-4 w-4" />{saveStates[student.id] === "saving" ? "Saving..." : "Save comment"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Dialog open={signatureDialogOpen} onOpenChange={setSignatureDialogOpen}>
          <DialogContent className="bg-white sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Class teacher report card signature</DialogTitle>
              <DialogDescription>
                Upload your signature image. It will appear in the class teacher signature area on report cards for your assigned classes.
              </DialogDescription>
            </DialogHeader>
            {selectedClass?.signatureUrl && (
              <div className="rounded-lg border bg-gray-50 p-4">
                <p className="mb-2 text-xs font-medium text-muted-foreground">Current signature</p>
                <img src={resolveMediaUrl(selectedClass.signatureUrl)} alt="Current class teacher signature" className="h-16 max-w-full object-contain" />
              </div>
            )}
            <label className="space-y-2 text-sm font-medium">
              <span>Choose a PNG or JPEG image (100KB maximum)</span>
              <input
                type="file"
                accept="image/png,image/jpeg,.png,.jpg,.jpeg"
                onChange={(event) => setSignatureFile(event.target.files?.[0] || null)}
                className="block w-full rounded-md border border-gray-300 bg-white p-2 text-sm font-normal"
              />
              {signatureFile && <span className="block text-xs text-muted-foreground">{signatureFile.name} · {(signatureFile.size / 1024).toFixed(1)}KB</span>}
            </label>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSignatureDialogOpen(false)} disabled={isUploadingSignature}>Cancel</Button>
              <Button onClick={uploadSignature} disabled={!signatureFile || isUploadingSignature}>
                <Upload className="mr-2 h-4 w-4" />{isUploadingSignature ? "Uploading..." : "Save signature"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </DashboardLayout>
  )
}
