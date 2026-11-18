import { useEffect } from "react"
import { useAuthStore, useParentDashboardStore } from "@/store"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { EmptyState } from "@/components/ui/empty-state"
import { Calendar, AlertCircle } from "lucide-react"
import { formatDate } from "@/lib/utils"

export default function ParentAttendance() {
  const { user } = useAuthStore()
  const { attendance, isLoading, error, fetchDashboard, fetchAttendance } = useParentDashboardStore()

  useEffect(() => {
    if (user) {
      void fetchDashboard()
      void fetchAttendance()
    }
  }, [user?.id, fetchDashboard, fetchAttendance])

  const present = attendance.filter((record) => record.status.toLowerCase() === "present").length
  const absent = attendance.filter((record) => record.status.toLowerCase() === "absent").length

  return <DashboardLayout><div className="space-y-6">
    <PageHeader title="Attendance" description="Attendance records for your linked children over the last 90 days" />
    {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
    {isLoading ? <div className="flex h-48 items-center justify-center"><LoadingSpinner size="lg" /></div> : <>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardHeader><CardTitle className="text-sm">Records</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{attendance.length}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Present</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{present}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Absent</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{absent}</CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" />Attendance history</CardTitle><CardDescription>Only records for children linked to your parent account are shown.</CardDescription></CardHeader><CardContent className="space-y-3">
        {attendance.length === 0 ? <EmptyState icon={Calendar} title="No attendance records" description="Your children's attendance records will appear here when the school records them." /> : attendance.map((record) => <div key={record.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4"><div><p className="font-medium">{record.studentName}</p><p className="text-sm text-muted-foreground">{formatDate(record.attendanceDate)}{record.remarks ? ` · ${record.remarks}` : ""}</p></div><Badge variant={record.status.toLowerCase() === "present" ? "default" : record.status.toLowerCase() === "absent" ? "destructive" : "secondary"}>{record.status}</Badge></div>)}
      </CardContent></Card>
    </>}
  </div></DashboardLayout>
}
