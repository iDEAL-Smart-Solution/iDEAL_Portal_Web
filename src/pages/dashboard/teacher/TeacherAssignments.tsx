

import type React from "react"

import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { useAuthStore, useAssignmentsStore, useSchoolStore, useStaffStore } from "@/store"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PageHeader } from "@/components/ui/page-header"
import { DataTable } from "@/components/ui/data-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Plus, Calendar, Clock, Edit, Trash2, FileText } from "lucide-react"
import { formatDate } from "@/lib/utils"
import type { Assignment } from "@/types"

export default function TeacherAssignments() {
  const [searchParams] = useSearchParams()
  const showCreate = searchParams.get("action") === "create"

  const { user } = useAuthStore()
  const { assignments, fetchAssignments, createAssignment, updateAssignment, deleteAssignment, isLoading, error } =
    useAssignmentsStore()
  const { fetchClasses } = useSchoolStore()
  const { teacherSubjects, fetchTeacherSubjects } = useStaffStore()
  const [createDialogOpen, setCreateDialogOpen] = useState(showCreate)
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [assignmentForm, setAssignmentForm] = useState({
    title: "",
    instructions: "",
    subjectId: "",
    dueDate: "",
    file: null as File | null,
  })
  useEffect(() => {
    if (user?.id) {
      fetchTeacherSubjects(user.id)
      fetchClasses()
    }
  }, [user, fetchTeacherSubjects, fetchClasses])

  useEffect(() => {
    if (user?.id) {
      fetchAssignments(undefined, user.id)
    }
  }, [user, fetchAssignments])

  useEffect(() => {
    if (showCreate) {
      setCreateDialogOpen(true)
    }
  }, [showCreate])

  useEffect(() => {
    if (editingAssignment) {
      setAssignmentForm({
        title: editingAssignment.title,
        instructions: editingAssignment.instructions,
        subjectId: editingAssignment.subjectId,
        dueDate: editingAssignment.dueDate.split("T")[0],
        file: null,
      })
    } else {
      setAssignmentForm({
        title: "",
        instructions: "",
        subjectId: "",
        dueDate: "",
        file: null,
      })
    }
  }, [editingAssignment])

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!assignmentForm.title || !assignmentForm.subjectId || !assignmentForm.dueDate) return

    setFormError(null)
    try {
      const assignmentData: any = {
        title: assignmentForm.title,
        instructions: assignmentForm.instructions,
        subjectId: assignmentForm.subjectId,
        dueDate: new Date(assignmentForm.dueDate).toISOString(),
        schoolId: user.schoolId,
        assignmentFile: assignmentForm.file ? assignmentForm.file.name : null,
      }

      if (editingAssignment) {
        await updateAssignment(editingAssignment.id, assignmentData)
        setEditingAssignment(null)
      } else {
        await createAssignment(assignmentData)
        setCreateDialogOpen(false)
      }

      setAssignmentForm({
        title: "",
        instructions: "",
        subjectId: "",
        dueDate: "",
        file: null,
      })
      setFormError(null)
    } catch (error: any) {
      const errorMessage = error.message || "Failed to create assignment"
      setFormError(errorMessage)
      console.error("Assignment operation failed:", error)
    }
  }

  const handleEdit = (assignment: Assignment) => {
    setEditingAssignment(assignment)
  }

  const handleDelete = async (assignmentId: string) => {
    if (confirm("Are you sure you want to delete this assignment?")) {
      await deleteAssignment(assignmentId)
    }
  }

  // Categorize assignments
  const now = new Date()
  const upcomingAssignments = assignments.filter((a) => new Date(a.dueDate) >= now)
  const pastAssignments = assignments.filter((a) => new Date(a.dueDate) < now)

  const getStatusBadge = (dueDate: string) => {
    const due = new Date(dueDate)
    const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilDue < 0) {
      return <Badge variant="secondary">Past Due</Badge>
    } else if (daysUntilDue <= 3) {
      return <Badge className="bg-orange-100 text-orange-800">Due Soon</Badge>
    } else if (daysUntilDue <= 7) {
      return <Badge className="bg-yellow-100 text-yellow-800">This Week</Badge>
    } else {
      return <Badge variant="outline">Upcoming</Badge>
    }
  }

  const columns = [
    {
      key: "title" as keyof Assignment,
      label: "Title",
      render: (value: string) => <div className="font-medium">{value}</div>,
    },
    {
      key: "subjectId" as keyof Assignment,
      label: "Subject",
      render: (value: string) => {
        const subject = teacherSubjects.find((s) => s.id === value)
        return subject ? subject.name : `Subject ${value}`
      },
    },
    {
      key: "dueDate" as keyof Assignment,
      label: "Due Date",
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <span>{formatDate(value)}</span>
          {getStatusBadge(value)}
        </div>
      ),
    },
    {
      key: "createdAt" as keyof Assignment,
      label: "Created",
      render: (value: string) => formatDate(value),
    },
    {
      key: "id" as keyof Assignment,
      label: "Actions",
      render: (value: string, assignment: Assignment) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => handleEdit(assignment)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleDelete(value)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Assignments"
          description="Create and manage assignments for your classes"
          actions={
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Assignment
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-white">
                <DialogHeader>
                  <DialogTitle>Create New Assignment</DialogTitle>
                  <DialogDescription>Add a new assignment for your students</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={assignmentForm.title}
                      onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                      placeholder="Assignment title"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Instructions</Label>
                    <Textarea
                      id="description"
                      value={assignmentForm.instructions}
                      onChange={(e) => setAssignmentForm({ ...assignmentForm, instructions: e.target.value })}
                      placeholder="Assignment instructions and details"
                      rows={4}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Select
                      value={assignmentForm.subjectId}
                      onValueChange={(value) => setAssignmentForm({ ...assignmentForm, subjectId: value })}
                    >
                      <SelectTrigger className="z-auto">
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent className="z-[200] bg-white max-h-[200px] overflow-y-auto" position="popper" sideOffset={5}>
                        {teacherSubjects.length > 0 ? (
                          teacherSubjects.map((subject) => (
                            <SelectItem key={subject.id} value={subject.id}>
                              {subject.code}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-sm text-muted-foreground">No subjects assigned</div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={assignmentForm.dueDate}
                      onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="file">Assignment File (Optional)</Label>
                    <Input
                      id="file"
                      type="file"
                      onChange={(e) => setAssignmentForm({ ...assignmentForm, file: e.target.files?.[0] || null })}
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                    />
                    {assignmentForm.file && (
                      <p className="text-xs text-muted-foreground">Selected: {assignmentForm.file.name}</p>
                    )}
                  </div>

                  {formError && (
                    <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                      {formError}
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Create
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          }
        />

        {/* Edit Assignment Dialog */}
        <Dialog open={!!editingAssignment} onOpenChange={() => setEditingAssignment(null)}>
          <DialogContent className="sm:max-w-md bg-white">
            <DialogHeader>
              <DialogTitle>Edit Assignment</DialogTitle>
              <DialogDescription>Update assignment details</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={assignmentForm.title}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                  placeholder="Assignment title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Instructions</Label>
                <Textarea
                  id="edit-description"
                  value={assignmentForm.instructions}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, instructions: e.target.value })}
                  placeholder="Assignment instructions and details"
                  rows={4}
                  required
                />
              </div>

              {formError && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                  {formError}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="edit-subject">Subject</Label>
                <Select
                  value={assignmentForm.subjectId}
                  onValueChange={(value) => setAssignmentForm({ ...assignmentForm, subjectId: value })}
                >
                  <SelectTrigger className="z-auto">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent className="z-[200] bg-white max-h-[200px] overflow-y-auto" position="popper" sideOffset={5}>
                    {teacherSubjects.length > 0 ? (
                      teacherSubjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.code}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-sm text-muted-foreground">No subjects assigned</div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-dueDate">Due Date</Label>
                <Input
                  id="edit-dueDate"
                  type="date"
                  value={assignmentForm.dueDate}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-file">Assignment File (Optional)</Label>
                <Input
                  id="edit-file"
                  type="file"
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, file: e.target.files?.[0] || null })}
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                />
                {assignmentForm.file && (
                  <p className="text-xs text-muted-foreground">Selected: {assignmentForm.file.name}</p>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditingAssignment(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Updating...
                    </>
                  ) : (
                    "Update"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {isLoading && assignments.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-red-600">Error loading assignments: {error}</div>
            </CardContent>
          </Card>
        ) : assignments.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No Assignments Yet"
            description="Start by creating your first assignment for students."
            action={{
              label: "Create Assignment",
              onClick: () => setCreateDialogOpen(true),
            }}
          />
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{assignments.length}</div>
                  <p className="text-xs text-muted-foreground">All assignments</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{upcomingAssignments.length}</div>
                  <p className="text-xs text-muted-foreground">Not yet due</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Past Due</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pastAssignments.length}</div>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">This Month</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {
                      assignments.filter((a) => {
                        const createdDate = new Date(a.createdAt)
                        const now = new Date()
                        return (
                          createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear()
                        )
                      }).length
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">Created this month</p>
                </CardContent>
              </Card>
            </div>

            {/* Assignments Table */}
            <DataTable
              title="My Assignments"
              description="All assignments you've created for your classes"
              data={assignments}
              columns={columns}
              searchable
              searchPlaceholder="Search assignments..."
            />
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

