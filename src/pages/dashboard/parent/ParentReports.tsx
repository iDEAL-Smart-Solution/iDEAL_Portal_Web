import { useEffect, useState } from "react"
import { useAuthStore, useParentDashboardStore } from "@/store"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileDown, AlertCircle } from "lucide-react"
import axiosInstance from "@/services/api"
import { showError } from "@/lib/notifications"

type ReportCard = {
  studentName: string; studentUin: string; className: string; term: string; session: string
  schoolName: string; subjects: { subjectName: string; firstCA: number; secondCA: number; thirdCA: number; exam: number; totalScore: number; grade: string; remark: string }[]
  aggregate: number; percentage: number; position: number; totalStudents: number; principalRemark: string
}

export default function ParentReports() {
  const { user } = useAuthStore()
  const { children, isLoading, fetchDashboard } = useParentDashboardStore()
  const [studentId, setStudentId] = useState("")
  const [term, setTerm] = useState("1")
  const [session, setSession] = useState("")
  const [report, setReport] = useState<ReportCard | null>(null)
  const [loadingReport, setLoadingReport] = useState(false)

  useEffect(() => { if (user) void fetchDashboard() }, [user?.id, fetchDashboard])

  const loadReport = async () => {
    if (!studentId || !session.trim()) return
    setLoadingReport(true)
    try {
      const response = await axiosInstance.get("/Parent/report-card/single-term", { params: { studentId, term: Number(term), session: session.trim() } })
      setReport(response.data.data)
    } catch (error: any) {
      setReport(null)
      showError(error.response?.data?.message || "Could not load this report card")
    } finally {
      setLoadingReport(false)
    }
  }

  const downloadReport = () => {
    if (!report) return
    const esc = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character] || character))
    const rows = report.subjects.map((subject) => `<tr><td>${esc(subject.subjectName)}</td><td>${esc(subject.firstCA)}</td><td>${esc(subject.secondCA)}</td><td>${esc(subject.thirdCA)}</td><td>${esc(subject.exam)}</td><td>${esc(subject.totalScore)}</td><td>${esc(subject.grade)}</td><td>${esc(subject.remark)}</td></tr>`).join("")
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Report card - ${esc(report.studentName)}</title><style>body{font:14px Arial,sans-serif;margin:36px;color:#172033}h1,h2{text-align:center}table{width:100%;border-collapse:collapse;margin-top:24px}th,td{border:1px solid #cbd5e1;padding:8px;text-align:left}th{background:#eff6ff}.summary{display:flex;justify-content:space-between;margin:24px 0}</style></head><body><h1>${esc(report.schoolName)}</h1><h2>Academic Report Card</h2><p><b>Student:</b> ${esc(report.studentName)} · ${esc(report.studentUin)} &nbsp; <b>Class:</b> ${esc(report.className)}</p><p><b>Term:</b> ${esc(report.term)} &nbsp; <b>Session:</b> ${esc(report.session)}</p><table><thead><tr><th>Subject</th><th>CA 1</th><th>CA 2</th><th>CA 3</th><th>Exam</th><th>Total</th><th>Grade</th><th>Remark</th></tr></thead><tbody>${rows}</tbody></table><div class="summary"><span>Aggregate: ${esc(report.aggregate)}</span><span>Average: ${esc(report.percentage)}%</span><span>Position: ${esc(report.position)} of ${esc(report.totalStudents)}</span></div><p><b>Principal's remark:</b> ${esc(report.principalRemark)}</p></body></html>`
    const url = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" }))
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `report-card-${report.studentUin}-${report.session}-term-${term}.html`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return <DashboardLayout><div className="space-y-6">
    <PageHeader title="Reports" description="View and download report cards for your linked children" />
    <Card><CardHeader><CardTitle>Choose a report card</CardTitle><CardDescription>Only children linked to your verified parent account are available.</CardDescription></CardHeader><CardContent className="grid gap-4 md:grid-cols-4">
      <Select value={studentId} onValueChange={setStudentId}><SelectTrigger><SelectValue placeholder="Select child" /></SelectTrigger><SelectContent>{children.map((child) => <SelectItem key={child.id} value={child.id}>{child.firstName} {child.lastName}</SelectItem>)}</SelectContent></Select>
      <Select value={term} onValueChange={setTerm}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="1">First term</SelectItem><SelectItem value="2">Second term</SelectItem><SelectItem value="3">Third term</SelectItem></SelectContent></Select>
      <input className="h-10 rounded-md border bg-background px-3 text-sm" placeholder="Academic session (e.g. 2025/2026)" value={session} onChange={(event) => setSession(event.target.value)} />
      <Button onClick={() => void loadReport()} disabled={!studentId || !session.trim() || loadingReport || isLoading}>{loadingReport ? <LoadingSpinner size="sm" /> : "Load report"}</Button>
    </CardContent></Card>
    {loadingReport && <div className="flex h-32 items-center justify-center"><LoadingSpinner /></div>}
    {!loadingReport && report && <Card><CardHeader><CardTitle>{report.studentName} · {report.term} Term</CardTitle><CardDescription>{report.className} · {report.session} · {report.schoolName}</CardDescription></CardHeader><CardContent className="space-y-4"><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="p-2">Subject</th><th className="p-2">Total</th><th className="p-2">Grade</th><th className="p-2">Remark</th></tr></thead><tbody>{report.subjects.map((subject, index) => <tr key={`${subject.subjectName}-${index}`} className="border-b"><td className="p-2">{subject.subjectName}</td><td className="p-2">{subject.totalScore}</td><td className="p-2">{subject.grade}</td><td className="p-2">{subject.remark}</td></tr>)}</tbody></table></div><div className="flex flex-wrap justify-between gap-2 text-sm"><span>Average: {report.percentage}%</span><span>Position: {report.position} of {report.totalStudents}</span><span>Principal: {report.principalRemark}</span></div><Button onClick={downloadReport}><FileDown className="mr-2 h-4 w-4" />Download report</Button></CardContent></Card>}
    {!loadingReport && !report && children.length === 0 && <Alert><AlertCircle className="h-4 w-4" /><AlertDescription>No linked children are available on this account yet.</AlertDescription></Alert>}
  </div></DashboardLayout>
}
