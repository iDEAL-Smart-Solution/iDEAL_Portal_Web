import type React from "react"
import { useEffect, useState } from "react"
import { useAuthStore, useStaffStore, useResultsStore } from "@/store"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PageHeader } from "@/components/ui/page-header"
import { DataTable } from "@/components/ui/data-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { EmptyState } from "@/components/ui/empty-state"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Plus, Upload, Users, BookOpen, CheckCircle, Eye, Edit, Trash2 } from "lucide-react"
import type { CreateResultDto, StudentForResult, DetailedResult } from "@/store/results-store"

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
    deleteResult,
    clearStudentsForResult,
    clearSubjectResults,
    isLoading,
    error,
  } = useResultsStore()

  // Page mode: 'upload' or 'view'
  const [pageMode, setPageMode] = useState<'upload' | 'view'>('upload')
  const [selectedSubject, setSelectedSubject] = useState<string>("")
  const [selectedSubjectCode, setSelectedSubjectCode] = useState<string>("")
  const [selectedTerm, setSelectedTerm] = useState<number>(1)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [bulkUploadMode, setBulkUploadMode] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  
  // Form state for individual result entry
  const [resultForm, setResultForm] = useState({
    studentId: "",
    studentUin: "",
    firstCA: 0,
    secondCA: 0,
    thirdCA: 0,
    exam: 0,
  })

  // Bulk upload state - stores results for all students
  const [bulkResults, setBulkResults] = useState<Record<string, {
    firstCA: number
    secondCA: number
    thirdCA: number
    exam: number
  }>>({})

  useEffect(() => {
    if (user?.id) {
      fetchTeacherSubjects(user.id)
      fetchCurrentSession()
    }
  }, [user, fetchTeacherSubjects, fetchCurrentSession])

  useEffect(() => {
    if (selectedSubject) {
      const subject = teacherSubjects.find(s => s.id === selectedSubject)
      if (subject) {
        setSelectedSubjectCode(subject.code)
        if (pageMode === 'upload') {
          fetchStudentsBySubject(selectedSubject)
        } else {
          fetchResultsBySubject(subject.code)
        }
      }
    } else {
      clearStudentsForResult()
      clearSubjectResults()
    }
  }, [selectedSubject, pageMode, teacherSubjects, fetchStudentsBySubject, fetchResultsBySubject, clearStudentsForResult, clearSubjectResults])

  // Initialize bulk results when students load
  useEffect(() => {
    if (studentsForResult.length > 0 && bulkUploadMode) {
      const initialBulkResults: Record<string, { firstCA: number; secondCA: number; thirdCA: number; exam: number }> = {}
      studentsForResult.forEach(student => {
        if (!bulkResults[student.id]) {
          initialBulkResults[student.id] = { firstCA: 0, secondCA: 0, thirdCA: 0, exam: 0 }
        }
      })
      setBulkResults(prev => ({ ...prev, ...initialBulkResults }))
    }
  }, [studentsForResult, bulkUploadMode])

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    )
  }

  const handleIndividualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSubject || !resultForm.studentId || !currentSession) {
      setFormError("Please fill in all required fields")
      return
    }

    setFormError(null)
    try {
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
      setSuccessMessage("Result uploaded successfully!")
      setUploadDialogOpen(false)
      setResultForm({
        studentId: "",
        studentUin: "",
        firstCA: 0,
        secondCA: 0,
        thirdCA: 0,
        exam: 0,
      })
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
      setFormError(err.message || "Failed to upload result")
    }
  }

  const handleBulkSubmit = async () => {
    if (!selectedSubject || !currentSession) {
      setFormError("Please select a subject and ensure session is loaded")
      return
    }

    setFormError(null)
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
      setSuccessMessage(`Successfully uploaded ${successCount} results${failCount > 0 ? `, ${failCount} failed` : ''}`)
      setBulkResults({})
      setTimeout(() => setSuccessMessage(null), 5000)
    } else if (failCount > 0) {
      setFormError(`Failed to upload ${failCount} results`)
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
      setSuccessMessage("Result deleted successfully!")
      setDeleteConfirmId(null)
      // Refresh results
      if (selectedSubjectCode) {
        fetchResultsBySubject(selectedSubjectCode)
      }
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
      setFormError(err.message || "Failed to delete result")
    }
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

  const updateBulkScore = (studentId: string, field: 'firstCA' | 'secondCA' | 'thirdCA' | 'exam', value: number) => {
    setBulkResults(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      }
    }))
  }

  const calculateTotal = (scores: { firstCA: number; secondCA: number; thirdCA: number; exam: number }) => {
    return scores.firstCA + scores.secondCA + scores.thirdCA + scores.exam
  }

  const columns = [
    {
      key: "uin" as keyof StudentForResult,
      label: "Student ID",
      render: (value: string) => <span className="font-mono text-sm">{value}</span>,
    },
    {
      key: "fullName" as keyof StudentForResult,
      label: "Student Name",
      render: (value: string) => <div className="font-medium">{value}</div>,
    },
    {
      key: "className" as keyof StudentForResult,
      label: "Class",
    },
    {
      key: "id" as keyof StudentForResult,
      label: "Actions",
      render: (_: string, student: StudentForResult) => (
        <Button size="sm" onClick={() => handleSelectStudent(student)}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Result
        </Button>
      ),
    },
  ]

  // Columns for viewing results
  const resultColumns = [
    {
      key: "studentUin" as keyof DetailedResult,
      label: "Student ID",
      render: (value: string) => <span className="font-mono text-sm">{value}</span>,
    },
    {
      key: "subjectCode" as keyof DetailedResult,
      label: "Subject",
      render: (value: string) => <Badge variant="outline">{value}</Badge>,
    },
    {
      key: "term" as keyof DetailedResult,
      label: "Term",
    },
    {
      key: "academicYear" as keyof DetailedResult,
      label: "Session",
    },
    {
      key: "firstCAScore" as keyof DetailedResult,
      label: "1st CA",
      render: (value: number) => <span className="text-center">{value}/10</span>,
    },
    {
      key: "secondCAScore" as keyof DetailedResult,
      label: "2nd CA",
      render: (value: number) => <span className="text-center">{value}/10</span>,
    },
    {
      key: "thirdCAScore" as keyof DetailedResult,
      label: "3rd CA",
      render: (value: number) => <span className="text-center">{value}/10</span>,
    },
    {
      key: "examScore" as keyof DetailedResult,
      label: "Exam",
      render: (value: number) => <span className="text-center">{value}/70</span>,
    },
    {
      key: "totalScore" as keyof DetailedResult,
      label: "Total",
      render: (value: number) => <Badge variant={value >= 50 ? "default" : "destructive"}>{value}/100</Badge>,
    },
    {
      key: "grade" as keyof DetailedResult,
      label: "Grade",
      render: (value: string) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${getGradeBadgeColor(value)}`}>
          {value}
        </span>
      ),
    },
    {
      key: "id" as keyof DetailedResult,
      label: "Actions",
      render: (id: string) => (
        <div className="flex gap-2">
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

        {/* Page Mode Toggle */}
        <div className="flex gap-2">
          <Button
            variant={pageMode === 'upload' ? "default" : "outline"}
            onClick={() => setPageMode('upload')}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Results
          </Button>
          <Button
            variant={pageMode === 'view' ? "default" : "outline"}
            onClick={() => setPageMode('view')}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Results
          </Button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                <span>{successMessage}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-4">
              <div className="text-red-700">{error}</div>
            </CardContent>
          </Card>
        )}

        {/* Subject Selection Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Select Subject
            </CardTitle>
            <CardDescription>
              {pageMode === 'upload' 
                ? "Choose the subject you want to upload results for"
                : "Choose the subject to view uploaded results"
              }
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
                    <Select value={selectedTerm.toString()} onValueChange={(v) => setSelectedTerm(parseInt(v))}>
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
                    <div className="h-10 px-3 py-2 border rounded-md bg-muted text-sm">
                      {currentSession?.name || "Loading..."}
                    </div>
                  </div>
                </>
              )}
            </div>

            {pageMode === 'upload' && (
              <div className="mt-4 flex gap-2">
                <Button
                  variant={!bulkUploadMode ? "default" : "outline"}
                  onClick={() => setBulkUploadMode(false)}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Individual Upload
                </Button>
                <Button
                  variant={bulkUploadMode ? "default" : "outline"}
                  onClick={() => setBulkUploadMode(true)}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Bulk Upload
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* View Results Mode */}
        {pageMode === 'view' && (
          <>
            {isLoading ? (
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
                          <th className="text-left p-3 font-medium">Student ID</th>
                          <th className="text-left p-3 font-medium">Subject</th>
                          <th className="text-left p-3 font-medium">Term</th>
                          <th className="text-left p-3 font-medium">Session</th>
                          <th className="text-center p-3 font-medium">1st CA</th>
                          <th className="text-center p-3 font-medium">2nd CA</th>
                          <th className="text-center p-3 font-medium">3rd CA</th>
                          <th className="text-center p-3 font-medium">Exam</th>
                          <th className="text-center p-3 font-medium">Total</th>
                          <th className="text-center p-3 font-medium">Grade</th>
                          <th className="text-center p-3 font-medium">Actions</th>
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
                              <Badge variant={result.totalScore >= 50 ? "default" : "destructive"}>
                                {result.totalScore}/100
                              </Badge>
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
                                <Button size="sm" variant="ghost" onClick={() => setDeleteConfirmId(result.id)}>
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Upload Mode - Students List / Bulk Upload */}
        {pageMode === 'upload' && (
          <>
            {isLoading ? (
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
            ) : bulkUploadMode ? (
              /* Bulk Upload Mode */
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Bulk Result Entry
                  </CardTitle>
                  <CardDescription>
                    Enter scores for all students at once. Leave scores as 0 to skip a student.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left p-3 font-medium">Student ID</th>
                          <th className="text-left p-3 font-medium">Name</th>
                          <th className="text-center p-3 font-medium">1st CA (Max 10)</th>
                          <th className="text-center p-3 font-medium">2nd CA (Max 10)</th>
                          <th className="text-center p-3 font-medium">3rd CA (Max 10)</th>
                          <th className="text-center p-3 font-medium">Exam (Max 70)</th>
                          <th className="text-center p-3 font-medium">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentsForResult.map((student) => {
                          const scores = bulkResults[student.id] || { firstCA: 0, secondCA: 0, thirdCA: 0, exam: 0 }
                          return (
                            <tr key={student.id} className="border-b hover:bg-muted/30">
                              <td className="p-3 font-mono text-sm">{student.uin}</td>
                              <td className="p-3 font-medium">{student.fullName}</td>
                              <td className="p-3">
                                <Input
                                  type="number"
                                  min="0"
                                  max="10"
                                  value={scores.firstCA}
                                  onChange={(e) => updateBulkScore(student.id, 'firstCA', Math.min(10, Number(e.target.value)))}
                                  className="w-20 text-center mx-auto"
                                />
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              min="0"
                              max="10"
                              value={scores.secondCA}
                              onChange={(e) => updateBulkScore(student.id, 'secondCA', Math.min(10, Number(e.target.value)))}
                              className="w-20 text-center mx-auto"
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              min="0"
                              max="10"
                              value={scores.thirdCA}
                              onChange={(e) => updateBulkScore(student.id, 'thirdCA', Math.min(10, Number(e.target.value)))}
                              className="w-20 text-center mx-auto"
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              min="0"
                              max="70"
                              value={scores.exam}
                              onChange={(e) => updateBulkScore(student.id, 'exam', Math.min(70, Number(e.target.value)))}
                              className="w-20 text-center mx-auto"
                            />
                          </td>
                          <td className="p-3 text-center font-semibold">
                            <Badge variant={calculateTotal(scores) >= 50 ? "default" : "secondary"}>
                              {calculateTotal(scores)}
                            </Badge>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {formError && (
                <div className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                  {formError}
                </div>
              )}

              <div className="mt-6 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setBulkResults({})}>
                  Clear All
                </Button>
                <Button onClick={handleBulkSubmit} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload All Results
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
            ) : (
              /* Individual Upload Mode */
              <DataTable
                title="Students"
                description={`Students enrolled in ${selectedSubjectCode}`}
                data={studentsForResult}
                columns={columns}
                searchable
                searchPlaceholder="Search by name or ID..."
              />
            )}
          </>
        )}

        {/* Individual Upload Dialog */}
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogContent className="sm:max-w-md bg-white">
            <DialogHeader>
              <DialogTitle>Upload Result</DialogTitle>
              <DialogDescription>
                Enter the scores for this student
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleIndividualSubmit} className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Student</p>
                <p className="font-medium">
                  {studentsForResult.find(s => s.id === resultForm.studentId)?.fullName}
                </p>
                <p className="text-sm font-mono">{resultForm.studentUin}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstCA">1st CA Score (Max 10)</Label>
                  <Input
                    id="firstCA"
                    type="number"
                    min="0"
                    max="10"
                    value={resultForm.firstCA}
                    onChange={(e) => setResultForm({ ...resultForm, firstCA: Math.min(10, Number(e.target.value)) })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondCA">2nd CA Score (Max 10)</Label>
                  <Input
                    id="secondCA"
                    type="number"
                    min="0"
                    max="10"
                    value={resultForm.secondCA}
                    onChange={(e) => setResultForm({ ...resultForm, secondCA: Math.min(10, Number(e.target.value)) })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thirdCA">3rd CA Score (Max 10)</Label>
                  <Input
                    id="thirdCA"
                    type="number"
                    min="0"
                    max="10"
                    value={resultForm.thirdCA}
                    onChange={(e) => setResultForm({ ...resultForm, thirdCA: Math.min(10, Number(e.target.value)) })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exam">Exam Score (Max 70)</Label>
                  <Input
                    id="exam"
                    type="number"
                    min="0"
                    max="70"
                    value={resultForm.exam}
                    onChange={(e) => setResultForm({ ...resultForm, exam: Math.min(70, Number(e.target.value)) })}
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-primary-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Score</p>
                <p className="text-2xl font-bold text-primary-600">
                  {resultForm.firstCA + resultForm.secondCA + resultForm.thirdCA + resultForm.exam}
                </p>
              </div>

              {formError && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                  {formError}
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setUploadDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Result
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
