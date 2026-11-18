import { useEffect } from "react"
import { useAuthStore, useParentDashboardStore } from "@/store"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { EmptyState } from "@/components/ui/empty-state"
import { BookOpen, BookMarked, Megaphone, AlertCircle } from "lucide-react"
import { formatDate } from "@/lib/utils"

export default function ParentLearning() {
  const { user } = useAuthStore()
  const { learning, children, isLoading, error, fetchDashboard, fetchLearning } = useParentDashboardStore()

  useEffect(() => {
    if (user) {
      void fetchDashboard()
      void fetchLearning()
    }
  }, [user?.id, fetchDashboard, fetchLearning])

  if (isLoading || !learning) {
    return <DashboardLayout><div className="flex h-64 items-center justify-center"><LoadingSpinner size="lg" /></div></DashboardLayout>
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader title="Learning & School Updates" description={`Assignments, learning materials, and announcements for ${children.length} linked child${children.length === 1 ? "" : "ren"}.`} />
        {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" />Assignments</CardTitle><CardDescription>Work assigned to subjects taken by your linked children</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            {learning.assignments.length === 0 ? <EmptyState icon={BookOpen} title="No assignments" description="There are no assignments for your linked children yet." /> : learning.assignments.map((assignment) => <article key={assignment.id} className="rounded-lg border p-4"><div className="flex flex-wrap items-start justify-between gap-2"><h3 className="font-semibold">{assignment.title}</h3><span className="text-sm text-muted-foreground">Due {formatDate(assignment.dueDate)}</span></div><p className="text-sm text-muted-foreground">{assignment.subjectName}</p><p className="mt-2 text-sm">{assignment.instructions}</p>{assignment.assignmentFile && <a className="mt-3 inline-block text-sm text-primary underline" href={assignment.assignmentFile} target="_blank" rel="noreferrer">Open assignment file</a>}</article>)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><BookMarked className="h-5 w-5" />Learning Materials</CardTitle><CardDescription>School and subject resources available to your linked children</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            {learning.learningMaterials.length === 0 ? <EmptyState icon={BookMarked} title="No learning materials" description="No materials are available for your linked children yet." /> : learning.learningMaterials.map((resource) => <article key={resource.id} className="rounded-lg border p-4"><h3 className="font-semibold">{resource.name}</h3><p className="text-sm text-muted-foreground">{resource.subjectName || "School resource"}</p><p className="mt-2 text-sm">{resource.description}</p><ul className="mt-3 space-y-1">{resource.files.map((file) => <li key={file.id}><a className="text-sm text-primary underline" href={file.mediaUrl} target="_blank" rel="noreferrer">Open {file.mediaType || "learning material"}</a></li>)}</ul></article>)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5" />Announcements</CardTitle><CardDescription>School-wide and linked-class updates</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            {learning.announcements.length === 0 ? <EmptyState icon={Megaphone} title="No announcements" description="There are no school or class announcements yet." /> : learning.announcements.map((announcement) => <article key={announcement.id} className="rounded-lg border p-4"><div className="flex flex-wrap items-start justify-between gap-2"><h3 className="font-semibold">{announcement.title}</h3><span className="text-sm text-muted-foreground">{formatDate(announcement.datePosted)}</span></div><p className="mt-2 whitespace-pre-wrap text-sm">{announcement.message}</p></article>)}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
