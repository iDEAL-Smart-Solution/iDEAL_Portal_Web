import type React from "react"
import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { useAuthStore, useResourcesStore, useStaffStore } from "@/store"
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
import { Upload, FileText, Video, Image, File, Plus, Download, Trash2, Link, StickyNote } from "lucide-react"
import type { Resource } from "@/types"

const resourceTypeIcons = {
  pdf: FileText,
  doc: FileText,
  video: Video,
  image: Image,
  other: File,
  note: StickyNote,
  link: Link,
}

export default function TeacherResources() {
  const [searchParams] = useSearchParams()
  const showUpload = searchParams.get("action") === "upload"

  const { user } = useAuthStore()
  const { resources, resourceTypes, fetchResourcesByUserId, fetchResourceTypes, uploadResource, deleteResource, isLoading, error } = useResourcesStore()
  const { teacherSubjects, fetchTeacherSubjects } = useStaffStore()
  const [uploadDialogOpen, setUploadDialogOpen] = useState(showUpload)
  const [uploadForm, setUploadForm] = useState({
    name: "",
    description: "",
    resourceTypeId: "",
    subjectId: "",
    files: [] as File[],
  })

  // Get teacher's classes (keeping mock for now)
  const teacherClasses: any[] = [] // Classes will come from API

  useEffect(() => {
    if (user?.id) {
      fetchResourcesByUserId(user.id)
      fetchResourceTypes()
      fetchTeacherSubjects(user.id)
    }
  }, [user?.id, fetchResourcesByUserId, fetchResourceTypes, fetchTeacherSubjects])

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

  
  const teacherResources = resources

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!uploadForm.name) {
      alert("Please enter a resource name")
      return
    }
    
    if (!uploadForm.resourceTypeId) {
      alert("Please select a resource type")
      return
    }

    if (!uploadForm.subjectId) {
      alert("Please select a subject")
      return
    }
    
    if (uploadForm.files.length === 0) {
      alert("Please select at least one file")
      return
    }

    try {
      await uploadResource({
        name: uploadForm.name,
        description: uploadForm.description,
        resourceTypeId: uploadForm.resourceTypeId,
        subjectId: uploadForm.subjectId,
        files: uploadForm.files,
      })
      setUploadDialogOpen(false)
      setUploadForm({
        name: "",
        description: "",
        resourceTypeId: "",
        subjectId: "",
        files: [],
      })
      // Refetch user's resources after successful upload
      if (user?.id) {
        fetchResourcesByUserId(user.id)
      }
    } catch (error: any) {
      console.error("Upload failed:", error)
      alert(error?.response?.data?.message || error?.message || "Failed to upload resource")
    }
  }

  const handleDelete = async (resourceId: string) => {
    if (confirm("Are you sure you want to delete this resource?")) {
      await deleteResource(resourceId)
      // Refetch user's resources after deletion
      if (user?.id) {
        fetchResourcesByUserId(user.id)
      }
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
            const classItem = teacherClasses.find((c: any) => c.id === classId)
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
              <DialogContent className="sm:max-w-md bg-white">
                <DialogHeader>
                  <DialogTitle>Upload New Resource</DialogTitle>
                  <DialogDescription>Add a new learning material for your students</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpload} className="space-y-4">
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-800">
                      {error}
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Resource Name</Label>
                    <Input
                      id="name"
                      value={uploadForm.name}
                      onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                      placeholder="Resource name"
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

                  <div className="space-y-2">
                    <Label htmlFor="resourceType">Resource Type</Label>
                    <Select
                      value={uploadForm.resourceTypeId}
                      onValueChange={(value) => setUploadForm({ ...uploadForm, resourceTypeId: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select resource type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {resourceTypes.length === 0 ? (
                          <div className="p-2 text-sm text-gray-500">
                            No resource types available. Please contact admin.
                          </div>
                        ) : (
                          resourceTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Select
                      value={uploadForm.subjectId}
                      onValueChange={(value) => setUploadForm({ ...uploadForm, subjectId: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {teacherSubjects.length === 0 ? (
                          <div className="p-2 text-sm text-gray-500">
                            No subjects assigned. Please contact admin.
                          </div>
                        ) : (
                          teacherSubjects.map((subject) => (
                            <SelectItem key={subject.id} value={subject.id}>
                              {subject.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="files">Files</Label>
                    <Input
                      id="files"
                      type="file"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || [])
                        setUploadForm({ ...uploadForm, files })
                      }}
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.mp4,.avi"
                      required
                    />
                    {uploadForm.files.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        {uploadForm.files.length} file(s) selected
                      </div>
                    )}
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
            <div className="grid gap-4 md:grid-cols-3">
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

