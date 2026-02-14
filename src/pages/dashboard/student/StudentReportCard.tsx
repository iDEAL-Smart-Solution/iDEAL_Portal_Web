import { useEffect, useState } from "react"
import { useAuthStore, useResultsStore } from "@/store"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { EmptyState } from "@/components/ui/empty-state"
import { FileText, Printer, ChevronDown } from "lucide-react"
import type {
  SingleTermReportCardDto,
  CumulativeReportCardDto,
} from "@/store/results-store"

/* ── Nigerian Grading System ── */
const GRADING_TABLE = [
  { grade: "A1", range: "75 – 100", remark: "Excellent" },
  { grade: "B2", range: "70 – 74", remark: "Very Good" },
  { grade: "B3", range: "65 – 69", remark: "Very Good" },
  { grade: "C4", range: "60 – 64", remark: "Good" },
  { grade: "C5", range: "55 – 59", remark: "Good" },
  { grade: "C6", range: "50 – 54", remark: "Good" },
  { grade: "D7", range: "45 – 49", remark: "Fair" },
  { grade: "E8", range: "40 – 44", remark: "Poor" },
  { grade: "F9", range: "01 – 39", remark: "Very Poor" },
]

const EFFECTIVENESS_ITEMS = [
  "Punctuality",
  "Neatness",
  "Honesty",
  "Cooperation with others",
  "Leadership",
  "Helping others",
  "Health",
  "Attitude to school Activities",
  "Attentiveness",
  "Speaking/Handwriting",
]

function termLabel(num: number): string {
  return num === 1 ? "1ST TERM" : num === 2 ? "2ND TERM" : "3RD TERM"
}

function formatPosition(pos: number): string {
  const s = ["th", "st", "nd", "rd"]
  const v = pos % 100
  return pos + (s[(v - 20) % 10] || s[v] || s[0])
}

/* ════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════ */

export default function StudentReportCard() {
  const { user } = useAuthStore()
  const {
    reportCard,
    cumulativeReportCard,
    currentSession,
    academicSessions,
    isLoading,
    error,
    fetchSingleTermReportCard,
    fetchCumulativeReportCard,
    fetchCurrentSession,
    fetchAcademicSessions,
    clearReportCard,
  } = useResultsStore()

  const [selectedTerm, setSelectedTerm] = useState<number>(1)
  const [selectedSession, setSelectedSession] = useState<string>("")
  const [viewMode, setViewMode] = useState<"single" | "cumulative">("single")

  useEffect(() => {
    fetchCurrentSession()
    fetchAcademicSessions()
    return () => clearReportCard()
  }, [])

  useEffect(() => {
    if (currentSession) {
      setSelectedSession(currentSession.name)
      setSelectedTerm(currentSession.currentTerm || 1)
    }
  }, [currentSession])

  const handleFetch = () => {
    if (!user?.id || !selectedSession) return
    clearReportCard()
    if (viewMode === "single") {
      fetchSingleTermReportCard(user.id, selectedTerm, selectedSession)
    } else {
      fetchCumulativeReportCard(user.id, selectedSession)
    }
  }

  const handlePrint = () => {
    const card = viewMode === "single" ? reportCard : cumulativeReportCard
    if (!card) return
    const pw = window.open("", "_blank")
    if (!pw) return
    const html =
      viewMode === "single"
        ? buildSingleTermPrintHtml(reportCard!, selectedTerm)
        : buildCumulativePrintHtml(cumulativeReportCard!)
    pw.document.write(html)
    pw.document.close()
    pw.focus()
    setTimeout(() => pw.print(), 350)
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    )
  }

  const activeCard = viewMode === "single" ? reportCard : cumulativeReportCard

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Report Card"
          description="View and print your academic report card"
          actions={
            activeCard && (
              <Button onClick={handlePrint} variant="outline">
                <Printer className="h-4 w-4 mr-2" />
                Print Report Card
              </Button>
            )
          }
        />

        {/* ── Controls ── */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                <div className="relative">
                  <select
                    value={viewMode}
                    onChange={(e) => {
                      setViewMode(e.target.value as "single" | "cumulative")
                      clearReportCard()
                    }}
                    className="w-full appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="single">Single Term</option>
                    <option value="cumulative">Cumulative (Annual)</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Session</label>
                <div className="relative">
                  <select
                    value={selectedSession}
                    onChange={(e) => setSelectedSession(e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select session</option>
                    {academicSessions.map((s) => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {viewMode === "single" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
                  <div className="relative">
                    <select
                      value={selectedTerm}
                      onChange={(e) => setSelectedTerm(Number(e.target.value))}
                      className="w-full appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={1}>First Term</option>
                      <option value={2}>Second Term</option>
                      <option value={3}>Third Term</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              )}

              <div>
                <Button onClick={handleFetch} disabled={isLoading || !selectedSession} className="w-full">
                  {isLoading ? "Loading..." : "View Report Card"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-red-600 text-sm">{error}</div>
            </CardContent>
          </Card>
        )}

        {isLoading && (
          <div className="flex items-center justify-center h-48">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {!isLoading && !error && viewMode === "single" && reportCard && (
          <SingleTermReportCardView data={reportCard} termNum={selectedTerm} />
        )}

        {!isLoading && !error && viewMode === "cumulative" && cumulativeReportCard && (
          <CumulativeReportCardView data={cumulativeReportCard} />
        )}

        {!isLoading && !error && !activeCard && (
          <EmptyState
            icon={FileText}
            title="No Report Card"
            description="Select a session and term, then click 'View Report Card' to generate your report."
          />
        )}
      </div>
    </DashboardLayout>
  )
}

/* ════════════════════════════════════════
   SINGLE TERM — ON-SCREEN VIEW
   ════════════════════════════════════════ */

function SingleTermReportCardView({
  data,
  termNum,
}: {
  data: SingleTermReportCardDto
  termNum: number
}) {
  const caTotal = (s: { firstCA: number; secondCA: number; thirdCA: number }) =>
    s.firstCA + s.secondCA + s.thirdCA

  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      <CardContent className="p-0">
        {/* ── School Header ── */}
        <div className="bg-blue-900 text-white py-6 px-6 text-center">
          {data.schoolLogo && (
            <img
              src={data.schoolLogo}
              alt="logo"
              className="h-16 w-16 mx-auto mb-2 rounded-full bg-white p-1 object-contain"
            />
          )}
          <h1 className="text-2xl font-extrabold uppercase tracking-wide">
            {data.schoolName}
          </h1>
          <p className="text-blue-200 text-xs mt-1 uppercase tracking-[0.2em]">
            Report Sheet
          </p>
        </div>

        {/* ── Student Info Row 1 ── */}
        <div className="border border-gray-300 text-xs">
          <div className="flex divide-x divide-gray-300">
            <InfoCell label="STUDENT'S NAME" value={data.studentName} className="flex-[2]" />
            <InfoCell label="SESSION" value={data.session} className="flex-1" />
            <InfoCell label="TERM" value={termLabel(termNum)} className="flex-1" />
            <InfoCell label="CLASS" value={data.className} className="flex-1" />
            <InfoCell label="PERFORMANCE" value={`${data.percentage.toFixed(1)}%`} className="flex-1" />
          </div>
          {/* Row 2 */}
          <div className="flex divide-x divide-gray-300 border-t border-gray-300">
            <InfoCell label="NO. IN CLASS" value={String(data.totalStudents)} className="flex-1" />
            <InfoCell label="POSITION" value={formatPosition(data.position)} className="flex-1" />
            <InfoCell label="GENDER" value={data.gender} className="flex-1" />
            <InfoCell label="STUDENT ID" value={data.studentUin} className="flex-[2]" />
          </div>
        </div>

        {/* ── Attendance + Weight/Height ── */}
        <div className="grid grid-cols-2 text-xs border-x border-b border-gray-300">
          {/* Attendance */}
          <div className="border-r border-gray-300">
            <SectionBanner>Attendance</SectionBanner>
            <InfoRow label="No. of Times School Opened" value="" />
            <InfoRow label="No. of Times Present" value="" />
            <InfoRow label="No. of Times Punctual" value="" />
          </div>
          {/* Weight / Height */}
          <div>
            <SectionBanner>Weight / Height</SectionBanner>
            <InfoRow
              label="Expected Date of Resumption"
              value={
                data.nextTermBeginsOn
                  ? new Date(data.nextTermBeginsOn).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : ""
              }
            />
            <InfoRow label="Height at the end of term" value="" />
            <InfoRow label="Weight at the beginning of term" value="" />
            <InfoRow label="Weight at the end of term" value="" />
          </div>
        </div>

        {/* ── Assessment Table ── */}
        <div className="border-x border-gray-300">
          <SectionBanner>Assessment</SectionBanner>
        </div>

        <div className="overflow-x-auto border border-gray-300">
          <table className="w-full text-xs border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-blue-900 text-white text-[10px]">
                <th className="border border-blue-800 px-2 py-2 text-left font-semibold">
                  SUBJECTS
                </th>
                <th className="border border-blue-800 px-1 py-2 text-center font-semibold w-14">
                  Marks<br />Obtainable
                </th>
                <th className="border border-blue-800 px-1 py-2 text-center font-semibold w-14">
                  Continues<br />Assessment
                </th>
                <th className="border border-blue-800 px-1 py-2 text-center font-semibold w-14">
                  Exam<br />Score
                </th>
                <th className="border border-blue-800 px-1 py-2 text-center font-semibold w-16">
                  1st Term<br />Score (%)
                </th>
                <th className="border border-blue-800 px-1 py-2 text-center font-semibold w-16">
                  2nd Term<br />Score (%)
                </th>
                <th className="border border-blue-800 px-1 py-2 text-center font-semibold w-16">
                  3rd Term<br />Score (%)
                </th>
                <th className="border border-blue-800 px-1 py-2 text-center font-semibold w-12">
                  Grade
                </th>
                <th className="border border-blue-800 px-1 py-2 text-center font-semibold w-20">
                  Remarks
                </th>
              </tr>
            </thead>
            <tbody>
              {data.subjects.map((subj, idx) => (
                <tr
                  key={idx}
                  className={idx % 2 === 0 ? "bg-white" : "bg-blue-50/40"}
                >
                  <td className="border border-gray-300 px-2 py-1.5 font-medium uppercase">
                    {subj.subjectName}
                  </td>
                  <td className="border border-gray-300 px-1 py-1.5 text-center">
                    100
                  </td>
                  <td className="border border-gray-300 px-1 py-1.5 text-center">
                    {caTotal(subj)}
                  </td>
                  <td className="border border-gray-300 px-1 py-1.5 text-center">
                    {subj.exam}
                  </td>
                  {/* 1st, 2nd, 3rd term columns — only current term shows total */}
                  <td className="border border-gray-300 px-1 py-1.5 text-center font-semibold">
                    {termNum === 1 ? subj.totalScore : ""}
                  </td>
                  <td className="border border-gray-300 px-1 py-1.5 text-center font-semibold">
                    {termNum === 2 ? subj.totalScore : ""}
                  </td>
                  <td className="border border-gray-300 px-1 py-1.5 text-center font-semibold">
                    {termNum === 3 ? subj.totalScore : ""}
                  </td>
                  <td className="border border-gray-300 px-1 py-1.5 text-center font-bold">
                    {subj.grade}
                  </td>
                  <td className="border border-gray-300 px-1 py-1.5 text-center text-[10px]">
                    {subj.remark}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Grading Method + Effectiveness ── */}
        <div className="grid grid-cols-2 text-xs border-x border-b border-gray-300">
          {/* Grading */}
          <div className="border-r border-gray-300 p-3">
            <h4 className="font-bold uppercase text-[10px] mb-2 text-blue-900">
              Grading Method
            </h4>
            <table className="w-full text-[10px]">
              <tbody>
                {GRADING_TABLE.map((g) => (
                  <tr
                    key={g.grade}
                    className="border-b border-gray-200 last:border-0"
                  >
                    <td className="py-0.5 font-semibold w-24">
                      {g.grade} = {g.range}
                    </td>
                    <td className="py-0.5 pl-2">{g.remark}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Effectiveness */}
          <div className="p-3">
            <h4 className="font-bold uppercase text-[10px] mb-2 text-blue-900">
              Effectiveness
            </h4>
            <table className="w-full text-[10px]">
              <thead>
                <tr>
                  <th className="text-left py-0.5"></th>
                  {[5, 4, 3, 2, 1].map((n) => (
                    <th
                      key={n}
                      className="text-center py-0.5 w-6 font-semibold"
                    >
                      {n}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {EFFECTIVENESS_ITEMS.map((item) => (
                  <tr
                    key={item}
                    className="border-b border-gray-200 last:border-0"
                  >
                    <td className="py-0.5">{item}</td>
                    {[5, 4, 3, 2, 1].map((n) => (
                      <td key={n} className="text-center py-0.5">
                        <div className="w-3.5 h-3.5 border border-gray-300 rounded-sm mx-auto" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Class Teacher's Comment ── */}
        <div className="border-x border-b border-gray-300 px-4 py-3 text-xs">
          <div className="flex items-end gap-3">
            <span className="font-bold whitespace-nowrap">
              Class Teacher's Comment:
            </span>
            <span className="flex-1 border-b border-gray-400 min-h-[1.2em]" />
            <span className="font-bold whitespace-nowrap ml-4">Signature:</span>
            <span className="w-28 border-b border-gray-400" />
          </div>
        </div>

        {/* ── Principal's Comment ── */}
        <div className="border-x border-b border-gray-300 px-4 py-3 text-xs">
          <div className="flex items-start gap-2">
            <span className="font-bold whitespace-nowrap">
              Principal's Comment:
            </span>
            <span className="flex-1 italic text-gray-700">
              {data.principalRemark}
            </span>
          </div>
          <div className="border-b border-gray-400 mt-2" />
        </div>

        {/* ── Principal Sign-off ── */}
        <div className="border-x border-b border-gray-300 px-4 py-4 text-xs text-right">
          <div className="inline-block text-center">
            <div className="w-40 border-b border-gray-400 mb-1" />
            <p className="font-bold italic">Principal</p>
            <p className="font-bold uppercase text-[10px]">{data.schoolName}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/* ════════════════════════════════════════
   CUMULATIVE — ON-SCREEN VIEW
   ════════════════════════════════════════ */

function CumulativeReportCardView({
  data,
}: {
  data: CumulativeReportCardDto
}) {
  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      <CardContent className="p-0">
        {/* ── School Header ── */}
        <div className="bg-blue-900 text-white py-6 px-6 text-center">
          {data.schoolLogo && (
            <img
              src={data.schoolLogo}
              alt="logo"
              className="h-16 w-16 mx-auto mb-2 rounded-full bg-white p-1 object-contain"
            />
          )}
          <h1 className="text-2xl font-extrabold uppercase tracking-wide">
            {data.schoolName}
          </h1>
          <p className="text-blue-200 text-xs mt-1 uppercase tracking-[0.2em]">
            Cumulative Report Sheet — {data.session}
          </p>
        </div>

        {/* ── Student Info ── */}
        <div className="border border-gray-300 text-xs">
          <div className="flex divide-x divide-gray-300">
            <InfoCell label="STUDENT'S NAME" value={data.studentName} className="flex-[2]" />
            <InfoCell label="SESSION" value={data.session} className="flex-1" />
            <InfoCell label="CLASS" value={data.className} className="flex-1" />
            <InfoCell label="PERFORMANCE" value={`${data.cumulativePercentage.toFixed(1)}%`} className="flex-1" />
            <InfoCell label="POSITION" value={formatPosition(data.cumulativePosition)} className="flex-1" />
          </div>
          <div className="flex divide-x divide-gray-300 border-t border-gray-300">
            <InfoCell label="STUDENT ID" value={data.studentUin} className="flex-[2]" />
            <InfoCell label="GENDER" value={data.gender} className="flex-1" />
            <InfoCell label="NO. IN CLASS" value={String(data.totalStudents)} className="flex-1" />
            <div className="flex-[2]" />
          </div>
        </div>

        {/* ── Attendance + Weight/Height ── */}
        <div className="grid grid-cols-2 text-xs border-x border-b border-gray-300">
          <div className="border-r border-gray-300">
            <SectionBanner>Attendance</SectionBanner>
            <InfoRow label="No. of Times School Opened" value="" />
            <InfoRow label="No. of Times Present" value="" />
            <InfoRow label="No. of Times Punctual" value="" />
          </div>
          <div>
            <SectionBanner>Weight / Height</SectionBanner>
            <InfoRow
              label="Expected Date of Resumption"
              value={
                data.nextTermBeginsOn
                  ? new Date(data.nextTermBeginsOn).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : ""
              }
            />
            <InfoRow label="Height at the end of term" value="" />
            <InfoRow label="Weight at the beginning of term" value="" />
            <InfoRow label="Weight at the end of term" value="" />
          </div>
        </div>

        {/* ── Assessment ── */}
        <div className="border-x border-gray-300">
          <SectionBanner>Assessment — Cumulative</SectionBanner>
        </div>

        <div className="overflow-x-auto border border-gray-300">
          <table className="w-full text-xs border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-blue-900 text-white text-[10px]">
                <th className="border border-blue-800 px-2 py-2 text-left font-semibold">
                  SUBJECTS
                </th>
                <th className="border border-blue-800 px-1 py-2 text-center font-semibold w-16">
                  1st Term<br />Total
                </th>
                <th className="border border-blue-800 px-1 py-2 text-center font-semibold w-16">
                  2nd Term<br />Total
                </th>
                <th className="border border-blue-800 px-1 py-2 text-center font-semibold w-16">
                  3rd Term<br />Total
                </th>
                <th className="border border-blue-800 px-1 py-2 text-center font-semibold w-14">
                  Average
                </th>
                <th className="border border-blue-800 px-1 py-2 text-center font-semibold w-12">
                  Grade
                </th>
                <th className="border border-blue-800 px-1 py-2 text-center font-semibold w-20">
                  Remarks
                </th>
              </tr>
            </thead>
            <tbody>
              {data.subjects.map((subj, idx) => (
                <tr
                  key={idx}
                  className={idx % 2 === 0 ? "bg-white" : "bg-blue-50/40"}
                >
                  <td className="border border-gray-300 px-2 py-1.5 font-medium uppercase">
                    {subj.subjectName}
                  </td>
                  <td className="border border-gray-300 px-1 py-1.5 text-center">
                    {subj.firstTermTotal || "—"}
                  </td>
                  <td className="border border-gray-300 px-1 py-1.5 text-center">
                    {subj.secondTermTotal || "—"}
                  </td>
                  <td className="border border-gray-300 px-1 py-1.5 text-center">
                    {subj.thirdTermTotal || "—"}
                  </td>
                  <td className="border border-gray-300 px-1 py-1.5 text-center font-semibold">
                    {subj.averageScore.toFixed(1)}
                  </td>
                  <td className="border border-gray-300 px-1 py-1.5 text-center font-bold">
                    {subj.grade}
                  </td>
                  <td className="border border-gray-300 px-1 py-1.5 text-center text-[10px]">
                    {subj.remark}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Grading + Effectiveness ── */}
        <div className="grid grid-cols-2 text-xs border-x border-b border-gray-300">
          <div className="border-r border-gray-300 p-3">
            <h4 className="font-bold uppercase text-[10px] mb-2 text-blue-900">
              Grading Method
            </h4>
            <table className="w-full text-[10px]">
              <tbody>
                {GRADING_TABLE.map((g) => (
                  <tr key={g.grade} className="border-b border-gray-200 last:border-0">
                    <td className="py-0.5 font-semibold w-24">
                      {g.grade} = {g.range}
                    </td>
                    <td className="py-0.5 pl-2">{g.remark}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3">
            <h4 className="font-bold uppercase text-[10px] mb-2 text-blue-900">
              Effectiveness
            </h4>
            <table className="w-full text-[10px]">
              <thead>
                <tr>
                  <th className="text-left py-0.5"></th>
                  {[5, 4, 3, 2, 1].map((n) => (
                    <th key={n} className="text-center py-0.5 w-6 font-semibold">
                      {n}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {EFFECTIVENESS_ITEMS.map((item) => (
                  <tr key={item} className="border-b border-gray-200 last:border-0">
                    <td className="py-0.5">{item}</td>
                    {[5, 4, 3, 2, 1].map((n) => (
                      <td key={n} className="text-center py-0.5">
                        <div className="w-3.5 h-3.5 border border-gray-300 rounded-sm mx-auto" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Teacher + Principal Comment ── */}
        <div className="border-x border-b border-gray-300 px-4 py-3 text-xs">
          <div className="flex items-end gap-3">
            <span className="font-bold whitespace-nowrap">Class Teacher's Comment:</span>
            <span className="flex-1 border-b border-gray-400 min-h-[1.2em]" />
            <span className="font-bold whitespace-nowrap ml-4">Signature:</span>
            <span className="w-28 border-b border-gray-400" />
          </div>
        </div>
        <div className="border-x border-b border-gray-300 px-4 py-3 text-xs">
          <div className="flex items-start gap-2">
            <span className="font-bold whitespace-nowrap">Principal's Comment:</span>
            <span className="flex-1 italic text-gray-700">{data.principalRemark}</span>
          </div>
          <div className="border-b border-gray-400 mt-2" />
        </div>
        <div className="border-x border-b border-gray-300 px-4 py-4 text-xs text-right">
          <div className="inline-block text-center">
            <div className="w-40 border-b border-gray-400 mb-1" />
            <p className="font-bold italic">Principal</p>
            <p className="font-bold uppercase text-[10px]">{data.schoolName}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/* ════════════════════════════════════════
   SHARED SMALL COMPONENTS
   ════════════════════════════════════════ */

function SectionBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-blue-900 text-white font-bold px-2 py-1 uppercase text-[10px] tracking-wide">
      {children}
    </div>
  )
}

function InfoCell({
  label,
  value,
  className = "",
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <div className={`px-2 py-1.5 ${className}`}>
      <span className="font-bold">{label}:</span>{" "}
      <span>{value}</span>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-2 divide-x divide-gray-300 border-b border-gray-300 last:border-b-0">
      <div className="px-2 py-1.5 font-medium">{label}</div>
      <div className="px-2 py-1.5 text-center">{value}</div>
    </div>
  )
}

/* ════════════════════════════════════════
   PRINT HTML STYLES (shared)
   ════════════════════════════════════════ */

const PRINT_STYLES = `
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Arial,sans-serif;padding:12px;color:#333;font-size:11px}
.header{text-align:center;background:#1e3a5f;color:#fff;padding:18px 12px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.header h1{font-size:22px;text-transform:uppercase;letter-spacing:1.5px;font-weight:800}
.header .sub{font-size:10px;color:#a3c4e0;margin-top:4px;text-transform:uppercase;letter-spacing:3px}
table{width:100%;border-collapse:collapse}
td,th{border:1px solid #bbb;padding:4px 6px}
.c{text-align:center}
.b{font-weight:700}
.subj{font-weight:500;text-transform:uppercase}
.info td{font-size:11px;padding:3px 6px}
.lbl{font-weight:700}
.sh{background:#1e3a5f;color:#fff;font-weight:700;font-size:10px;text-transform:uppercase;padding:4px 6px;letter-spacing:0.5px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.at th{background:#1e3a5f;color:#fff;font-size:10px;padding:5px 4px;font-weight:600;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.at td{font-size:11px}
.at tr:nth-child(even){background:#f0f5fa;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.bg{display:grid;grid-template-columns:1fr 1fr;border:1px solid #bbb;border-top:0}
.bg>div{padding:8px}
.bg>div:first-child{border-right:1px solid #bbb}
.bg h4{font-size:10px;text-transform:uppercase;font-weight:700;margin-bottom:5px;color:#1e3a5f}
.bg table{border:none}
.bg td,.bg th{border:none;border-bottom:1px solid #eee;padding:2px 4px;font-size:10px}
.bx{width:12px;height:12px;border:1px solid #999;display:inline-block;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.cm{border:1px solid #bbb;border-top:0;padding:8px;font-size:11px}
.so{border:1px solid #bbb;border-top:0;padding:12px 8px;text-align:right;font-size:11px}
.so .in{display:inline-block;text-align:center}
.so .ln{width:150px;border-bottom:1px solid #666;margin-bottom:2px}
@media print{body{padding:0}@page{margin:10mm}}
`

/* ════════════════════════════════════════
   PRINT HTML — SINGLE TERM
   ════════════════════════════════════════ */

function buildSingleTermPrintHtml(
  data: SingleTermReportCardDto,
  termNum: number,
): string {
  const caTotal = (s: { firstCA: number; secondCA: number; thirdCA: number }) =>
    s.firstCA + s.secondCA + s.thirdCA

  const subjectRows = data.subjects
    .map(
      (s) => `<tr>
        <td class="subj">${s.subjectName.toUpperCase()}</td>
        <td class="c">100</td>
        <td class="c">${caTotal(s)}</td>
        <td class="c">${s.exam}</td>
        <td class="c b">${termNum === 1 ? s.totalScore : ""}</td>
        <td class="c b">${termNum === 2 ? s.totalScore : ""}</td>
        <td class="c b">${termNum === 3 ? s.totalScore : ""}</td>
        <td class="c b">${s.grade}</td>
        <td class="c">${s.remark}</td>
      </tr>`,
    )
    .join("")

  const gradingRows = GRADING_TABLE.map(
    (g) =>
      `<tr><td style="font-weight:600">${g.grade} = ${g.range}</td><td>${g.remark}</td></tr>`,
  ).join("")

  const effectivenessRows = EFFECTIVENESS_ITEMS.map(
    (item) =>
      `<tr><td>${item}</td>${[5, 4, 3, 2, 1].map(() => `<td class="c"><div class="bx"></div></td>`).join("")}</tr>`,
  ).join("")

  const resumeDate = data.nextTermBeginsOn
    ? new Date(data.nextTermBeginsOn).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : ""

  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Report Card — ${data.studentName}</title>
<style>${PRINT_STYLES}</style></head><body>

<div class="header">
  <h1>${data.schoolName}</h1>
  <div class="sub">Report Sheet</div>
</div>

<table class="info">
  <tr>
    <td><span class="lbl">STUDENT'S NAME:</span> ${data.studentName}</td>
    <td><span class="lbl">SESSION:</span> ${data.session}</td>
    <td><span class="lbl">TERM:</span> ${termLabel(termNum)}</td>
    <td><span class="lbl">CLASS:</span> ${data.className}</td>
    <td><span class="lbl">PERFORMANCE:</span> ${data.percentage.toFixed(1)}%</td>
  </tr>
  <tr>
    <td><span class="lbl">NO. IN CLASS:</span> ${data.totalStudents}</td>
    <td><span class="lbl">POSITION:</span> ${formatPosition(data.position)}</td>
    <td><span class="lbl">GENDER:</span> ${data.gender}</td>
    <td colspan="2"><span class="lbl">STUDENT ID:</span> ${data.studentUin}</td>
  </tr>
</table>

<table>
  <tr><td class="sh" style="width:50%">Attendance</td><td class="sh">Weight / Height</td></tr>
</table>
<table>
  <tr>
    <td style="width:25%">No. of Times School Opened</td><td style="width:25%"></td>
    <td style="width:25%">Expected Date of Resumption</td><td style="width:25%">${resumeDate}</td>
  </tr>
  <tr>
    <td>No. of Times Present</td><td></td>
    <td>Height at the end of term</td><td></td>
  </tr>
  <tr>
    <td>No. of Times Punctual</td><td></td>
    <td>Weight at the beginning of term</td><td></td>
  </tr>
  <tr>
    <td></td><td></td>
    <td>Weight at the end of term</td><td></td>
  </tr>
</table>

<table><tr><td class="sh" colspan="9">Assessment</td></tr></table>
<table class="at">
  <thead>
    <tr>
      <th style="text-align:left">SUBJECTS</th>
      <th>Marks<br>Obtainable</th>
      <th>Continues<br>Assessment</th>
      <th>Exam<br>Score</th>
      <th>1st Term<br>Score (%)</th>
      <th>2nd Term<br>Score (%)</th>
      <th>3rd Term<br>Score (%)</th>
      <th>Grade</th>
      <th>Remarks</th>
    </tr>
  </thead>
  <tbody>${subjectRows}</tbody>
</table>

<div class="bg">
  <div>
    <h4>Grading Method</h4>
    <table>${gradingRows}</table>
  </div>
  <div>
    <h4>Effectiveness</h4>
    <table>
      <tr><th></th><th class="c">5</th><th class="c">4</th><th class="c">3</th><th class="c">2</th><th class="c">1</th></tr>
      ${effectivenessRows}
    </table>
  </div>
</div>

<div class="cm">
  <span class="lbl">Class Teacher's Comment:</span> ______________________________________________ &nbsp;&nbsp;
  <span class="lbl">Signature:</span> ___________
</div>
<div class="cm">
  <span class="lbl">Principal's Comment:</span> <em>${data.principalRemark}</em>
</div>
<div class="cm" style="border-bottom:1px solid #bbb"></div>
<div class="so">
  <div class="in">
    <div class="ln"></div>
    <div><strong><em>Principal</em></strong></div>
    <div><strong>${data.schoolName.toUpperCase()}</strong></div>
  </div>
</div>

</body></html>`
}

/* ════════════════════════════════════════
   PRINT HTML — CUMULATIVE
   ════════════════════════════════════════ */

function buildCumulativePrintHtml(data: CumulativeReportCardDto): string {
  const subjectRows = data.subjects
    .map(
      (s) => `<tr>
        <td class="subj">${s.subjectName.toUpperCase()}</td>
        <td class="c">${s.firstTermTotal || "—"}</td>
        <td class="c">${s.secondTermTotal || "—"}</td>
        <td class="c">${s.thirdTermTotal || "—"}</td>
        <td class="c b">${s.averageScore.toFixed(1)}</td>
        <td class="c b">${s.grade}</td>
        <td class="c">${s.remark}</td>
      </tr>`,
    )
    .join("")

  const gradingRows = GRADING_TABLE.map(
    (g) =>
      `<tr><td style="font-weight:600">${g.grade} = ${g.range}</td><td>${g.remark}</td></tr>`,
  ).join("")

  const effectivenessRows = EFFECTIVENESS_ITEMS.map(
    (item) =>
      `<tr><td>${item}</td>${[5, 4, 3, 2, 1].map(() => `<td class="c"><div class="bx"></div></td>`).join("")}</tr>`,
  ).join("")

  const resumeDate = data.nextTermBeginsOn
    ? new Date(data.nextTermBeginsOn).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : ""

  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Cumulative Report — ${data.studentName}</title>
<style>${PRINT_STYLES}</style></head><body>

<div class="header">
  <h1>${data.schoolName}</h1>
  <div class="sub">Cumulative Report Sheet — ${data.session}</div>
</div>

<table class="info">
  <tr>
    <td><span class="lbl">STUDENT'S NAME:</span> ${data.studentName}</td>
    <td><span class="lbl">SESSION:</span> ${data.session}</td>
    <td><span class="lbl">CLASS:</span> ${data.className}</td>
    <td><span class="lbl">PERFORMANCE:</span> ${data.cumulativePercentage.toFixed(1)}%</td>
  </tr>
  <tr>
    <td><span class="lbl">STUDENT ID:</span> ${data.studentUin}</td>
    <td><span class="lbl">NO. IN CLASS:</span> ${data.totalStudents}</td>
    <td><span class="lbl">POSITION:</span> ${formatPosition(data.cumulativePosition)}</td>
    <td><span class="lbl">GENDER:</span> ${data.gender}</td>
  </tr>
</table>

<table>
  <tr><td class="sh" style="width:50%">Attendance</td><td class="sh">Weight / Height</td></tr>
</table>
<table>
  <tr>
    <td style="width:25%">No. of Times School Opened</td><td style="width:25%"></td>
    <td style="width:25%">Expected Date of Resumption</td><td style="width:25%">${resumeDate}</td>
  </tr>
  <tr>
    <td>No. of Times Present</td><td></td>
    <td>Height at the end of term</td><td></td>
  </tr>
  <tr>
    <td>No. of Times Punctual</td><td></td>
    <td>Weight at the beginning of term</td><td></td>
  </tr>
  <tr>
    <td></td><td></td>
    <td>Weight at the end of term</td><td></td>
  </tr>
</table>

<table><tr><td class="sh" colspan="7">Assessment — Cumulative</td></tr></table>
<table class="at">
  <thead>
    <tr>
      <th style="text-align:left">SUBJECTS</th>
      <th>1st Term<br>Total</th>
      <th>2nd Term<br>Total</th>
      <th>3rd Term<br>Total</th>
      <th>Average</th>
      <th>Grade</th>
      <th>Remarks</th>
    </tr>
  </thead>
  <tbody>${subjectRows}</tbody>
</table>

<div class="bg">
  <div>
    <h4>Grading Method</h4>
    <table>${gradingRows}</table>
  </div>
  <div>
    <h4>Effectiveness</h4>
    <table>
      <tr><th></th><th class="c">5</th><th class="c">4</th><th class="c">3</th><th class="c">2</th><th class="c">1</th></tr>
      ${effectivenessRows}
    </table>
  </div>
</div>

<div class="cm">
  <span class="lbl">Class Teacher's Comment:</span> ______________________________________________ &nbsp;&nbsp;
  <span class="lbl">Signature:</span> ___________
</div>
<div class="cm">
  <span class="lbl">Principal's Comment:</span> <em>${data.principalRemark}</em>
</div>
<div class="cm" style="border-bottom:1px solid #bbb"></div>
<div class="so">
  <div class="in">
    <div class="ln"></div>
    <div><strong><em>Principal</em></strong></div>
    <div><strong>${data.schoolName.toUpperCase()}</strong></div>
  </div>
</div>

</body></html>`
}
