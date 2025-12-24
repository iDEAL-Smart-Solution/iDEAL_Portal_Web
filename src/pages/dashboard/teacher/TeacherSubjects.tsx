import { useEffect, useState } from "react"
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
  DialogTrigger
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import { Book, Edit, Trash2, Plus, CheckCircle2, XCircle } from "lucide-react"
import { mockSubjects } from "@/lib/mock-data"
import { useAuthStore } from "@/store"

export default function TeacherSubjects() {
  const { user } = useAuthStore()

  const [subjects, setSubjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)

  const [form, setForm] = useState({
    name: "",
    code: "",
    description: "",
    isActive: true
  })

  useEffect(() => {
    if (user?.id) {
      // Filter only subjects assigned to this teacher
      const teacherSubjects = mockSubjects.filter(s => s.teacherId === user.id)
      setSubjects(teacherSubjects)
      setLoading(false)
    }
  }, [user])

  const resetForm = () =>
    setForm({
      name: "",
      code: "",
      description: "",
      isActive: true
    })

  // Handle Create / Update
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.name.trim() || !form.code.trim()) return

    if (editing) {
      // Update existing
      setSubjects(prev =>
        prev.map(sub =>
          sub.id === editing.id ? { ...sub, ...form } : sub
        )
      )
      setEditing(null)
    } else {
      // Create new
      setSubjects(prev => [
        ...prev,
        {
          id: String(Date.now()),
          teacherId: user?.id,
          ...form
        }
      ])
      setCreateDialogOpen(false)
    }

    resetForm()
  }

  // Handle Delete
  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this subject?")) {
      setSubjects(prev => prev.filter(s => s.id !== id))
    }
  }

  const columns = [
    {
      key: "name",
      label: "Subject Name",
      render: (value: string) => <span className="font-medium">{value}</span>
    },
    {
      key: "code",
      label: "Code"
    },
    {
      key: "isActive",
      label: "Status",
      render: (value: boolean) =>
        value ? (
          <Badge className="bg-green-100 text-green-700">Active</Badge>
        ) : (
          <Badge variant="secondary">Inactive</Badge>
        )
    },
    {
      key: "id",
      label: "Actions",
      render: (value: string, subject: any) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => { setEditing(subject); setForm(subject); }}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleDelete(value)}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      )
    }
  ]

  const activeSubjects = subjects.filter(s => s.isActive).length
  const inactiveSubjects = subjects.filter(s => !s.isActive).length

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
          title="Subjects"
          description="Manage the subjects you teach"
          actions={
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subject
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Subject</DialogTitle>
                  <DialogDescription>Define a new subject for your teaching module</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Subject Name</Label>
                    <Input
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Mathematics"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Subject Code</Label>
                    <Input
                      value={form.code}
                      onChange={e => setForm({ ...form, code: e.target.value })}
                      placeholder="e.g. MTH101"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })}
                      rows={3}
                      placeholder="Short description"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <select
                      className="border rounded-md p-2"
                      value={form.isActive ? "1" : "0"}
                      onChange={e => setForm({ ...form, isActive: e.target.value === "1" })}
                    >
                      <option value="1">Active</option>
                      <option value="0">Inactive</option>
                    </select>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" type="button" onClick={() => setCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      <Plus className="h-4 w-4 mr-2" />
                      Create
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          }
        />

        {/* Edit Subject Dialog */}
        <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Subject</DialogTitle>
              <DialogDescription>Modify subject details</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Subject Name</Label>
                <Input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Subject Code</Label>
                <Input
                  value={form.code}
                  onChange={e => setForm({ ...form, code: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <select
                  className="border rounded-md p-2"
                  value={form.isActive ? "1" : "0"}
                  onChange={e => setForm({ ...form, isActive: e.target.value === "1" })}
                >
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
                <Button type="submit">Update</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : subjects.length === 0 ? (
          <EmptyState
            icon={Book}
            title="No Subjects Yet"
            description="Start by adding your subjects."
            action={{ label: "Add Subject", onClick: () => setCreateDialogOpen(true) }}
          />
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
                  <Book className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{subjects.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Active</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeSubjects}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Inactive</CardTitle>
                  <XCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{inactiveSubjects}</div>
                </CardContent>
              </Card>
            </div>

            {/* Data Table */}
            <DataTable
              title="My Subjects"
              description="All subjects you manage"
              data={subjects}
              columns={columns}
              searchable
              searchPlaceholder="Search subjects..."
            />
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
