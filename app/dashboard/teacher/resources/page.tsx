"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useAuthStore, useResourcesStore } from "@/store"
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
import { Upload, FileText, Video, Image, File, Plus, Download, Trash2 } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { mockSubjects, mockClasses } from "@/lib/mock-data"
import type { Resource } from "@/types"

const resourceTypeIcons = {
  pdf: FileText,
  doc: FileText,
  video: Video,
  image: Image,
  other: File,
}

export default function TeacherResources() {
  const searchParams = useSearchParams()
  const showUpload = searchParams.get("action") === "upload"

  const { user } = useAuthStore()
  const { resources, fetchResources, uploadResource, deleteResource, isLoading, error } = useResourcesStore()
  const [uploadDialogOpen, setUploadDialogOpen] = useState(showUpload)
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    type: "pdf" as Resource["type"],
    subjectId: "",
    classIds: [] as string[],
    url: "",
  })

  // Get teacher's subjects and classes
  const teacherSubjects = mockSubjects.filter((s) => s.teacherId === user?.id)
  const teacherClasses = mockClasses.filter((c) => c.teacherId === user?.id)

  useEffect(() => {
    fetchResources()
  }, [fetchResources])

  useEffect(() => {
    if (showUpload) {
      setUploadDialogOpen(true)
    }
  }, [showUpload])

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    )
  }

  // Filter resources by teacher
  const teacherResources = resources.filter((r) => r.teacherId === user.id)

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadForm.title || !uploadForm.subjectId || uploadForm.classIds.length === 0) return

    try {
      await uploadResource({
        ...uploadForm,
        teacherId: user.id,
        url: uploadForm.url || `/resources/${uploadForm.title.toLowerCase().replace(/\s+/g, "_")}.${uploadForm.type}`,
      })
      setUploadDialogOpen(false)
      setUploadForm({
        title: "",
        description: "",
        type: "pdf",
        subjectId: "",
        classIds: [],
        url: "",
      })
    } catch (error) {
      console.error("Upload failed:", error)
    }
  }

  const handleDelete = async (resourceId: string) => {
    if (confirm("Are you sure you want to delete this resource?")) {
      await deleteResource(resourceId)
    }
  }

  const columns = [
    {
      key: "title" as keyof Resource,
      label: "Title",
      render: (value: string, resource: Resource) => {
        const Icon = resourceTypeIcons[resource.type]
        return (
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <div className="font-medium">{value}</div>
          </div>
        )
      },
    },
    {
      key: "description" as keyof Resource,
      label: "Description",
      render: (value: string) => <span className="text-muted-foreground">{value}</span>,
    },
    {
      key: "type" as keyof Resource,
      label: "Type",
      render: (value: string) => (
        <Badge variant="outline" className="capitalize">
          {value}
        </Badge>
      ),
    },
    {
      key: "subjectId" as keyof Resource,
      label: "Subject",
      render: (value: string) => {
        const subject = teacherSubjects.find((s) => s.id === value)
        return subject ? subject.name : `Subject ${value}`
      },
    },
    {
      key: "classIds" as keyof Resource,
      label: "Classes",
      render: (value: string[]) => (
        <div className="flex flex-wrap gap-1">
          {value.map((classId) => {
            const classItem = teacherClasses.find((c) => c.id === classId)
            return (
              <Badge key={classId} variant="secondary" className="text-xs">
                {classItem ? classItem.name : `Class ${classId}`}
              </Badge>
            )
          })}
        </div>
      ),
    },
    {
      key: "createdAt" as keyof Resource,
      label: "Uploaded",
      render: (value: string) => formatDate(value),
    },
    {
      key: "id" as keyof Resource,
      label: "Actions",
      render: (value: string, resource: Resource) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => window.open(resource.url, "_blank")}>
            <Download className="h-4 w-4" />
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
          title="Resources"
          description="Upload and manage class materials"
          actions={
            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Resource
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Upload New Resource</DialogTitle>
                  <DialogDescription>Add a new learning material for your students</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpload} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={uploadForm.title}
                      onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                      placeholder="Resource title"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={uploadForm.description}
                      onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                      placeholder="Brief description of the resource"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Type</Label>
                      <Select
                        value={uploadForm.type}
                        onValueChange={(value: Resource["type"]) => setUploadForm({ ...uploadForm, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="doc">Document</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                          <SelectItem value="image">Image</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Select
                        value={uploadForm.subjectId}
                        onValueChange={(value) => setUploadForm({ ...uploadForm, subjectId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {teacherSubjects.map((subject) => (
                            <SelectItem key={subject.id} value={subject.id}>
                              {subject.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Classes</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {teacherClasses.map((classItem) => (
                        <label key={classItem.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={uploadForm.classIds.includes(classItem.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setUploadForm({
                                  ...uploadForm,
                                  classIds: [...uploadForm.classIds, classItem.id],
                                })
                              } else {
                                setUploadForm({
                                  ...uploadForm,
                                  classIds: uploadForm.classIds.filter((id) => id !== classItem.id),
                                })
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm">{classItem.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="url">File URL (Optional)</Label>
                    <Input
                      id="url"
                      value={uploadForm.url}
                      onChange={(e) => setUploadForm({ ...uploadForm, url: e.target.value })}
                      placeholder="https://example.com/file.pdf"
                    />
                    <p className="text-xs text-muted-foreground">Leave empty to auto-generate based on title</p>
                  </div>

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
                          Upload
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          }
        />

        {isLoading && teacherResources.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-red-600">Error loading resources: {error}</div>
            </CardContent>
          </Card>
        ) : teacherResources.length === 0 ? (
          <EmptyState
            icon={Upload}
            title="No Resources Yet"
            description="Start by uploading your first learning material for students."
            action={{
              label: "Upload Resource",
              onClick: () => setUploadDialogOpen(true),
            }}
          />
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
                  <Upload className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{teacherResources.length}</div>
                  <p className="text-xs text-muted-foreground">Uploaded materials</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">PDFs</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{teacherResources.filter((r) => r.type === "pdf").length}</div>
                  <p className="text-xs text-muted-foreground">PDF documents</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Videos</CardTitle>
                  <Video className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{teacherResources.filter((r) => r.type === "video").length}</div>
                  <p className="text-xs text-muted-foreground">Video materials</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">This Month</CardTitle>
                  <Upload className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {
                      teacherResources.filter((r) => {
                        const uploadDate = new Date(r.createdAt)
                        const now = new Date()
                        return (
                          uploadDate.getMonth() === now.getMonth() && uploadDate.getFullYear() === now.getFullYear()
                        )
                      }).length
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">Recent uploads</p>
                </CardContent>
              </Card>
            </div>

            {/* Resources Table */}
            <DataTable
              title="My Resources"
              description="All learning materials you've uploaded"
              data={teacherResources}
              columns={columns}
              searchable
              searchPlaceholder="Search resources..."
            />
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
