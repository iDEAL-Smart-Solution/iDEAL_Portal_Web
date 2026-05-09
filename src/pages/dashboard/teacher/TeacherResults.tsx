import type React from "react"
import { useEffect, useState } from "react"
import { useAuthStore, useStaffStore, useResultsStore } from "@/store"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { EmptyState } from "@/components/ui/empty-state"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Upload, Users, BookOpen, Eye, Trash2, AlertCircle, CheckCircle, Edit } from "lucide-react"
import type { CreateResultDto, StudentForResult, DetailedResult } from "@/store/results-store"
import { showError, showSuccess, showWarning } from "@/lib/notifications"

export default function TeacherResults() {
  const { user } = useAuthStore()
  const { teacherSubjects, fetchTeacherSubjects } = useStaffStore()
  const {
    studentsForResult,
    subjectResults,
    currentSession,
    fetchStudentsBySubject,
    fetchResultsBySubject,
    fetchCurrentSession,
    createResult,
    updateResult,
    uploadResultsExcel,
    downloadResultsExcelTemplate,
    deleteResult,
    clearStudentsForResult,
    clearSubjectResults,
    isLoading,
    error,
  } = useResultsStore()

  const [pageMode, setPageMode] = useState<'upload' | 'view'>('upload')
  const [selectedSubject, setSelectedSubject] = useState<string>("")
  const [selectedSubjectCode, setSelectedSubjectCode] = useState<string>("")
  const [selectedTerm, setSelectedTerm] = useState<number>(1)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [bulkUploadMode, setBulkUploadMode] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [excelFile, setExcelFile] = useState<File | null>(null)
  const [importSummary, setImportSummary] = useState<any | null>(null)
  const [overwriteExisting, setOverwriteExisting] = useState(false)
  const [editingResultId, setEditingResultId] = useState<string | null>(null)
  const [isTemplateDownloading, setIsTemplateDownloading] = useState(false)

  const [resultForm, setResultForm] = useState({
    studentId: "",
    studentUin: "",
    firstCA: 0,
    secondCA: 0,
    thirdCA: 0,
    exam: 0,
  })

  const [bulkResults, setBulkResults] = useState<Record<string, { firstCA: number; secondCA: number; thirdCA: number; exam: number }>>({})

  useEffect(() => {
    if (user?.id) {
      fetchTeacherSubjects(user.id)
      fetchCurrentSession()
    }
  }, [user, fetchTeacherSubjects, fetchCurrentSession])

  useEffect(() => {
    if (!selectedSubject) {
      clearStudentsForResult()
      clearSubjectResults()
      setSelectedSubjectCode("")
      return
    }

    const subject = teacherSubjects.find((item) => item.id === selectedSubject)
    if (!subject) return

    setSelectedSubjectCode(subject.code)
    if (pageMode === 'upload') {
      fetchStudentsBySubject(selectedSubject)
    } else {
      fetchResultsBySubject(subject.code)
    }
  }, [selectedSubject, pageMode, teacherSubjects, fetchStudentsBySubject, fetchResultsBySubject, clearStudentsForResult, clearSubjectResults])

  useEffect(() => {
    if (studentsForResult.length > 0 && bulkUploadMode) {
      setBulkResults((prev) => {
        const next = { ...prev }
        studentsForResult.forEach((student) => {
          if (!next[student.id]) {
            next[student.id] = { firstCA: 0, secondCA: 0, thirdCA: 0, exam: 0 }
          }
        })
        return next
      })
    }
  }, [studentsForResult, bulkUploadMode])

  useEffect(() => {
    if (error) showError(error)
  }, [error])

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    )
  }

  const getGradeBadgeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-100 text-green-800'
      case 'B': return 'bg-blue-100 text-blue-800'
      case 'C': return 'bg-yellow-100 text-yellow-800'
      case 'D': return 'bg-orange-100 text-orange-800'
      default: return 'bg-red-100 text-red-800'
    }
  }

  const calculateTotal = (scores: { firstCA: number; secondCA: number; thirdCA: number; exam: number }) => {
    return scores.firstCA + scores.secondCA + scores.thirdCA + scores.exam
  }

  const updateBulkScore = (studentId: string, field: 'firstCA' | 'secondCA' | 'thirdCA' | 'exam', value: number) => {
    setBulkResults((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { firstCA: 0, secondCA: 0, thirdCA: 0, exam: 0 }),
        [field]: value,
      },
    }))
  }

  const handleDownloadTemplate = async () => {
    try {
      setIsTemplateDownloading(true)
      const blob = await downloadResultsExcelTemplate()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'results-upload-template.xlsx'
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      showSuccess('Template downloaded successfully')
    } catch (err: any) {
      showError(err.message || 'Failed to download template')
    } finally {
      setIsTemplateDownloading(false)
    }
  }

  const handleIndividualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSubject || !resultForm.studentId || !currentSession) {
      showError('Please fill in all required fields')
      return
    }

    try {
      if (editingResultId) {
        const updateData = {
          id: editingResultId,
          first_CA_Score: resultForm.firstCA,
          second_CA_Score: resultForm.secondCA,
          third_CA_Score: resultForm.thirdCA,
          exam_Score: resultForm.exam,
        }
        await updateResult(updateData)
        showSuccess('Result updated successfully!')
        setUploadDialogOpen(false)
        setEditingResultId(null)
        setResultForm({ studentId: '', studentUin: '', firstCA: 0, secondCA: 0, thirdCA: 0, exam: 0 })
        if (selectedSubjectCode) fetchResultsBySubject(selectedSubjectCode)
      } else {
        const data: CreateResultDto = {
          studentId: resultForm.studentId,
          studentUin: resultForm.studentUin,
          subjectCode: selectedSubjectCode,
          first_CA_Score: resultForm.firstCA,
          second_CA_Score: resultForm.secondCA,
          third_CA_Score: resultForm.thirdCA,
          exam_Score: resultForm.exam,
          term: selectedTerm,
          session: currentSession.name,
        }

        await createResult(data)
        showSuccess('Result uploaded successfully!')
        setUploadDialogOpen(false)
        setResultForm({ studentId: '', studentUin: '', firstCA: 0, secondCA: 0, thirdCA: 0, exam: 0 })
        if (selectedSubjectCode) fetchStudentsBySubject(selectedSubject)
      }
    } catch (err: any) {
      showError(err.message || 'Failed to upload result')
    }
  }

  const handleBulkSubmit = async () => {
    if (!selectedSubject || !currentSession) {
      showError('Please select a subject and ensure session is loaded')
      return
    }

    let successCount = 0
    let failCount = 0

    for (const student of studentsForResult) {
      const scores = bulkResults[student.id]
      if (scores && (scores.firstCA > 0 || scores.secondCA > 0 || scores.thirdCA > 0 || scores.exam > 0)) {
        try {
          const data: CreateResultDto = {
            studentId: student.id,
            studentUin: student.uin,
            subjectCode: selectedSubjectCode,
            first_CA_Score: scores.firstCA,
            second_CA_Score: scores.secondCA,
            third_CA_Score: scores.thirdCA,
            exam_Score: scores.exam,
            term: selectedTerm,
            session: currentSession.name,
          }
          await createResult(data)
          successCount++
        } catch {
          failCount++
        }
      }
    }

    if (successCount > 0) {
      showSuccess(`Successfully uploaded ${successCount} results${failCount > 0 ? `, ${failCount} failed` : ''}`)
      setBulkResults({})
      fetchStudentsBySubject(selectedSubject)
    } else if (failCount > 0) {
      showWarning(`Failed to upload ${failCount} results`)
    }
  }

  const handleSelectStudent = (student: StudentForResult) => {
    setResultForm({
      studentId: student.id,
      studentUin: student.uin,
      firstCA: 0,
      secondCA: 0,
      thirdCA: 0,
      exam: 0,
    })
    setUploadDialogOpen(true)
  }

  const handleDeleteResult = async (id: string) => {
    try {
      await deleteResult(id)
      showSuccess('Result deleted successfully!')
      setDeleteConfirmId(null)
      if (selectedSubjectCode) fetchResultsBySubject(selectedSubjectCode)
    } catch (err: any) {
      showError(err.message || 'Failed to delete result')
    }
  }

  const handleEditResult = (result: DetailedResult) => {
    setEditingResultId(result.id)
    setResultForm({
      studentId: result.studentId || '',
      studentUin: result.studentUin || '',
      firstCA: result.firstCAScore ?? 0,
      secondCA: result.secondCAScore ?? 0,
      thirdCA: result.thirdCAScore ?? 0,
      exam: result.examScore ?? 0,
    })
    setUploadDialogOpen(true)
  }

  const columns = [
    {
      key: 'uin' as keyof StudentForResult,
      label: 'Student ID',
      render: (value: string) => <span className="font-mono text-sm">{value}</span>,
    },
    {
      key: 'fullName' as keyof StudentForResult,
      label: 'Student Name',
      render: (value: string) => <span className="font-medium">{value}</span>,
    },
    {
      key: 'className' as keyof StudentForResult,
      label: 'Class',
    },
    {
      key: 'id' as keyof StudentForResult,
      label: 'Actions',
      render: (_: string, student: StudentForResult) => (
        <Button size="sm" onClick={() => handleSelectStudent(student)}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Result
        </Button>
      ),
    },
  ]

  const resultColumns = [
    {
      key: 'studentUin' as keyof DetailedResult,
      label: 'Student ID',
      render: (value: string) => <span className="font-mono text-sm">{value}</span>,
    },
    {
      key: 'subjectCode' as keyof DetailedResult,
      label: 'Subject',
      render: (value: string) => <Badge variant="outline">{value}</Badge>,
    },
    {
      key: 'term' as keyof DetailedResult,
      label: 'Term',
    },
    {
      key: 'academicYear' as keyof DetailedResult,
      label: 'Session',
    },
    {
      key: 'firstCAScore' as keyof DetailedResult,
      label: '1st CA',
      render: (value: number) => <span className="text-center">{value}/10</span>,
    },
    {
      key: 'secondCAScore' as keyof DetailedResult,
      label: '2nd CA',
      render: (value: number) => <span className="text-center">{value}/10</span>,
    },
    {
      key: 'thirdCAScore' as keyof DetailedResult,
      label: '3rd CA',
      render: (value: number) => <span className="text-center">{value}/10</span>,
    },
    {
      key: 'examScore' as keyof DetailedResult,
      label: 'Exam',
      render: (value: number) => <span className="text-center">{value}/70</span>,
    },
    {
      key: 'totalScore' as keyof DetailedResult,
      label: 'Total',
      render: (value: number) => <Badge variant={value >= 50 ? 'default' : 'destructive'}>{value}/100</Badge>,
    },
    {
      key: 'grade' as keyof DetailedResult,
      label: 'Grade',
      render: (value: string) => <span className={`px-2 py-1 rounded text-xs font-medium ${getGradeBadgeColor(value)}`}>{value}</span>,
    },
    {
      key: 'id' as keyof DetailedResult,
      label: 'Actions',
      render: (id: string) => (
        <div className="flex gap-2 justify-center">
          {deleteConfirmId === id ? (
            <>
              <Button size="sm" variant="destructive" onClick={() => handleDeleteResult(id)}>
                Confirm
              </Button>
              <Button size="sm" variant="outline" onClick={() => setDeleteConfirmId(null)}>
                Cancel
              </Button>
            </>
          ) : (
            <Button size="sm" variant="ghost" onClick={() => setDeleteConfirmId(id)}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Results Management"
          description="Upload and view student results for your assigned subjects"
        />

        <div className="flex gap-2 flex-wrap">
          <Button variant={pageMode === 'upload' ? 'default' : 'outline'} onClick={() => setPageMode('upload')}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Results
          </Button>
          <Button variant={pageMode === 'view' ? 'default' : 'outline'} onClick={() => setPageMode('view')}>
            <Eye className="h-4 w-4 mr-2" />
            View Results
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Select Subject
            </CardTitle>
            <CardDescription>
              {pageMode === 'upload'
                ? 'Choose the subject you want to upload results for'
                : 'Choose the subject to view uploaded results'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {teacherSubjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.code} - {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {pageMode === 'upload' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="term">Term</Label>
                    <Select value={selectedTerm.toString()} onValueChange={(value) => setSelectedTerm(parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select term" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="1">First Term</SelectItem>
                        <SelectItem value="2">Second Term</SelectItem>
                        <SelectItem value="3">Third Term</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Session</Label>
                    <div className="h-10 px-3 py-2 border rounded-md bg-muted text-sm flex items-center">
                      {currentSession?.name || 'Loading...'}
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {pageMode === 'view' ? (
          isLoading ? (
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner size="lg" />
            </div>
          ) : !selectedSubject ? (
            <EmptyState
              icon={BookOpen}
              title="Select a Subject"
              description="Choose a subject from the dropdown above to view uploaded results."
            />
          ) : subjectResults.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No Results Found"
              description="No results have been uploaded for this subject yet."
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Uploaded Results
                </CardTitle>
                <CardDescription>
                  {subjectResults.length} result(s) found for {selectedSubjectCode}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        {resultColumns.map((column) => (
                          <th key={String(column.key)} className={`p-3 font-medium ${String(column.key) === 'id' ? 'text-center' : 'text-left'}`}>
                            {column.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {subjectResults.map((result) => (
                        <tr key={result.id} className="border-b hover:bg-muted/30">
                          <td className="p-3 font-mono text-sm">{result.studentUin}</td>
                          <td className="p-3"><Badge variant="outline">{result.subjectCode}</Badge></td>
                          <td className="p-3">{result.term}</td>
                          <td className="p-3">{result.academicYear}</td>
                          <td className="p-3 text-center">{result.firstCAScore}/10</td>
                          <td className="p-3 text-center">{result.secondCAScore}/10</td>
                          <td className="p-3 text-center">{result.thirdCAScore}/10</td>
                          <td className="p-3 text-center">{result.examScore}/70</td>
                          <td className="p-3 text-center">
                            <Badge variant={result.totalScore >= 50 ? 'default' : 'destructive'}>{result.totalScore}/100</Badge>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getGradeBadgeColor(result.grade)}`}>
                              {result.grade}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            {deleteConfirmId === result.id ? (
                              <div className="flex gap-1 justify-center">
                                <Button size="sm" variant="destructive" onClick={() => handleDeleteResult(result.id)}>
                                  Yes
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => setDeleteConfirmId(null)}>
                                  No
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Button size="sm" variant="ghost" onClick={() => handleEditResult(result)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => setDeleteConfirmId(result.id)}>
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )
        ) : (
          <>
            <div className="flex gap-2 flex-wrap">
              <Button variant={!bulkUploadMode ? 'default' : 'outline'} onClick={() => setBulkUploadMode(false)}>
                <Upload className="h-4 w-4 mr-2" />
                Individual Upload
              </Button>
              <Button variant={bulkUploadMode ? 'default' : 'outline'} onClick={() => setBulkUploadMode(true)}>
                <Users className="h-4 w-4 mr-2" />
                Bulk Upload (Excel)
              </Button>
            </div>

            {!bulkUploadMode ? (
              isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <LoadingSpinner size="lg" />
                </div>
              ) : !selectedSubject ? (
                <EmptyState
                  icon={BookOpen}
                  title="Select a Subject"
                  description="Choose a subject from the dropdown above to view students and upload their results."
                />
              ) : studentsForResult.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No Students Found"
                  description="No students are currently enrolled in this subject."
                />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Student List
                    </CardTitle>
                    <CardDescription>
                      {studentsForResult.length} student(s) enrolled in this subject
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            {columns.map((column) => (
                              <th key={String(column.key)} className={`p-3 font-medium ${String(column.key) === 'id' ? 'text-center' : 'text-left'}`}>
                                {column.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {studentsForResult.map((student) => (
                            <tr key={student.id} className="border-b hover:bg-muted/30">
                              <td className="p-3 font-mono text-sm">{student.uin}</td>
                              <td className="p-3">{student.fullName}</td>
                              <td className="p-3">{student.className}</td>
                              <td className="p-3 text-center">
                                <Button size="sm" onClick={() => handleSelectStudent(student)}>
                                  <Upload className="h-4 w-4 mr-2" />
                                  Upload Result
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )
            ) : (
              <>
                <Card className="border-2 border-dashed border-blue-200 bg-blue-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Upload className="h-5 w-5 text-blue-600" />
                      Import Results from Excel
                    </CardTitle>
                    <CardDescription>
                      Upload a .xlsx file with student results. Excel must contain: StudentUIN, FirstCA, SecondCA, ThirdCA, Exam columns.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col gap-3 rounded-lg border border-blue-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">Need the correct format?</p>
                        <p className="text-sm text-slate-500">Download the template before filling in student results.</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleDownloadTemplate}
                        disabled={isTemplateDownloading}
                        className="border-blue-200 text-blue-700 hover:bg-blue-50"
                      >
                        {isTemplateDownloading ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            Downloading...
                          </>
                        ) : (
                          <>
                            <FileText className="mr-2 h-4 w-4" />
                            Download Template
                          </>
                        )}
                      </Button>
                    </div>

                    <div
                      className="relative cursor-pointer rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 p-8 text-center transition-all hover:border-blue-500 hover:bg-blue-100"
                      onDragOver={(event) => {
                        event.preventDefault()
                        event.currentTarget.classList.add('border-blue-500', 'bg-blue-100')
                      }}
                      onDragLeave={(event) => {
                        event.currentTarget.classList.remove('border-blue-500', 'bg-blue-100')
                      }}
                      onDrop={(event) => {
                        event.preventDefault()
                        event.currentTarget.classList.remove('border-blue-500', 'bg-blue-100')
                        const file = event.dataTransfer.files?.[0]
                        if (file?.name.endsWith('.xlsx')) {
                          setExcelFile(file)
                        } else {
                          showError('Please drop a .xlsx file')
                        }
                      }}
                      onClick={() => document.getElementById('excel-file-input')?.click()}
                    >
                      <input
                        id="excel-file-input"
                        type="file"
                        accept=".xlsx"
                        onChange={(event) => setExcelFile(event.target.files?.[0] ?? null)}
                        className="hidden"
                      />
                      <div className="space-y-2">
                        <FileText className="h-12 w-12 mx-auto text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            {excelFile ? (
                              <span className="text-green-600 font-semibold">✓ {excelFile.name}</span>
                            ) : (
                              <>
                                <span className="text-blue-600">Click to browse</span> or drag and drop your Excel file
                              </>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Supported format: .xlsx</p>
                        </div>
                      </div>
                    </div>

                    {excelFile && (
                      <div className="rounded-lg border border-green-200 bg-white p-3">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-700">File Selected:</p>
                            <p className="text-sm font-semibold text-green-600">{excelFile.name}</p>
                            <p className="text-xs text-gray-500">{(excelFile.size / 1024).toFixed(2)} KB</p>
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => setExcelFile(null)} className="text-red-500 hover:bg-red-50 hover:text-red-700">
                            Clear
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 mb-2">
                      <label className="inline-flex items-center space-x-2">
                        <input type="checkbox" className="form-checkbox h-4 w-4" checked={overwriteExisting} onChange={(e) => setOverwriteExisting(e.target.checked)} />
                        <span className="text-sm">Overwrite existing results</span>
                      </label>
                    </div>

                    <Button
                      onClick={async () => {
                        if (!excelFile) return showError('Please select an Excel file')
                        if (!selectedSubject) return showError('Please select a subject')
                        try {
                          const formData = new FormData()
                          formData.append('file', excelFile)
                          formData.append('subjectId', selectedSubject)
                          formData.append('term', selectedTerm.toString())
                          formData.append('session', currentSession?.name || '')
                          formData.append('overwriteExisting', overwriteExisting ? 'true' : 'false')
                          const result = await uploadResultsExcel(formData)
                          const normalizeImportResult = (r: any) => {
                            const payload = r?.data ?? r
                            return {
                              TotalRows: payload.TotalRows ?? payload.totalRows ?? 0,
                              SuccessCount: payload.SuccessCount ?? payload.successCount ?? payload.success ?? 0,
                              FailCount: payload.FailCount ?? payload.failCount ?? payload.fail ?? 0,
                              Errors: payload.Errors ?? payload.errors ?? [],
                            }
                          }
                          const normalized = normalizeImportResult(result)
                          setImportSummary(normalized)
                          if (normalized.SuccessCount && normalized.SuccessCount > 0) showSuccess(`Imported ${normalized.SuccessCount} rows`)
                          if (normalized.FailCount && normalized.FailCount > 0) showWarning(`${normalized.FailCount} rows failed`)
                        } catch (err: any) {
                          showError(err.message || 'Import failed')
                        }
                      }}
                      disabled={!excelFile || isLoading}
                      className="w-full bg-blue-600 text-white hover:bg-blue-700"
                    >
                      {isLoading ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Importing...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Import Results
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                    {importSummary && (
                  <Card className="border-l-4 border-l-amber-500 bg-amber-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <FileText className="h-5 w-5 text-amber-600" />
                        Import Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-lg border border-gray-200 bg-white p-3">
                          <p className="text-xs font-medium text-gray-600">Total Rows</p>
                          <p className="text-2xl font-bold text-gray-800">{importSummary.TotalRows}</p>
                        </div>
                        <div className="rounded-lg border border-green-200 bg-white p-3">
                          <p className="text-xs font-medium text-green-600">Success</p>
                          <p className="text-2xl font-bold text-green-600">{importSummary.SuccessCount}</p>
                        </div>
                        <div className="rounded-lg border border-red-200 bg-white p-3">
                          <p className="text-xs font-medium text-red-600">Failed</p>
                          <p className="text-2xl font-bold text-red-600">{importSummary.FailCount}</p>
                        </div>
                      </div>

                      {importSummary.Errors && importSummary.Errors.length > 0 && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-red-800">
                            <AlertCircle className="h-4 w-4" />
                            Errors ({importSummary.Errors.length})
                          </p>
                          <div className="max-h-48 space-y-1 overflow-y-auto">
                            {importSummary.Errors.map((e: any, index: number) => (
                              <div key={index} className="rounded border-l-2 border-red-300 bg-white p-2 text-xs text-red-700">
                                <span className="font-semibold">Row {(e.rowNumber ?? e.RowNumber ?? e.Row)}:</span> {e.error ?? e.Error ?? e.Message ?? 'Unknown error'}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {importSummary.SuccessCount > 0 && importSummary.FailCount === 0 && (
                        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <p className="text-sm font-medium text-green-700">All rows imported successfully!</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </>
        )}

        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogContent className="sm:max-w-md bg-white">
            <DialogHeader>
              <DialogTitle>{editingResultId ? 'Edit Result' : 'Upload Result'}</DialogTitle>
              <DialogDescription>{editingResultId ? 'Update the scores for this student' : 'Enter the scores for this student'}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleIndividualSubmit} className="space-y-4">
              <div className="rounded-lg bg-muted p-3">
                <p className="text-sm text-muted-foreground">Student</p>
                <p className="font-medium">{studentsForResult.find((student) => student.id === resultForm.studentId)?.fullName}</p>
                <p className="text-sm font-mono">{resultForm.studentUin}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstCA">1st CA Score (Max 10)</Label>
                  <Input id="firstCA" type="number" min="0" max="10" value={resultForm.firstCA} onChange={(event) => setResultForm({ ...resultForm, firstCA: Math.min(10, Number(event.target.value)) })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondCA">2nd CA Score (Max 10)</Label>
                  <Input id="secondCA" type="number" min="0" max="10" value={resultForm.secondCA} onChange={(event) => setResultForm({ ...resultForm, secondCA: Math.min(10, Number(event.target.value)) })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="thirdCA">3rd CA Score (Max 10)</Label>
                  <Input id="thirdCA" type="number" min="0" max="10" value={resultForm.thirdCA} onChange={(event) => setResultForm({ ...resultForm, thirdCA: Math.min(10, Number(event.target.value)) })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exam">Exam Score (Max 70)</Label>
                  <Input id="exam" type="number" min="0" max="70" value={resultForm.exam} onChange={(event) => setResultForm({ ...resultForm, exam: Math.min(70, Number(event.target.value)) })} required />
                </div>
              </div>

              <div className="rounded-lg bg-primary-50 p-3">
                <p className="text-sm text-muted-foreground">Total Score</p>
                <p className="text-2xl font-bold text-primary-600">{calculateTotal(resultForm)}</p>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setUploadDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      {editingResultId ? 'Updating...' : 'Uploading...'}
                    </>
                  ) : (
                    <>
                      {editingResultId ? <Edit className="h-4 w-4 mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                      {editingResultId ? 'Update Result' : 'Upload Result'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
