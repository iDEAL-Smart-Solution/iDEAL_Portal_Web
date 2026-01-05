import { useEffect } from "react"
import { useAuthStore, useResourcesStore } from "@/store"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { BookOpen, File, Link2, PlayCircle, FileText, Download } from "lucide-react"

export default function StudentResources() {
  const { user } = useAuthStore()
  const { resources, fetchResources, downloadResource, isLoading, error } = useResourcesStore()

  useEffect(() => {
    if (user && (user as any).classId) {
      fetchResources((user as any).classId)
    }
  }, [user, fetchResources])

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    )
  }

  // Categorization
  const videos = resources.filter((r) => r.type === "video")
  const notes = resources.filter((r) => r.type === "note")
  const pdfs = resources.filter((r) => r.type === "pdf")
  const links = resources.filter((r) => r.type === "link")

  const iconForType = (type: string) => {
    switch (type) {
      case "video":
        return <PlayCircle className="h-4 w-4 text-blue-600" />
      case "pdf":
        return <File className="h-4 w-4 text-red-600" />
      case "note":
        return <FileText className="h-4 w-4 text-green-600" />
      case "link":
        return <Link2 className="h-4 w-4 text-purple-600" />
      default:
        return <BookOpen className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Study Resources"
          description="Access study materials shared by your teachers."
        />

        {/* Loading */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="pt-6 text-center text-red-600">
              Error loading resources: {error}
            </CardContent>
          </Card>
        ) : resources.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No Resources Available"
            description="Your teachers have not uploaded any study resources yet."
          />
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-5">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">All Resources</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{resources.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Videos</CardTitle>
                  <PlayCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{videos.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">PDFs</CardTitle>
                  <File className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pdfs.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Notes</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{notes.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Links</CardTitle>
                  <Link2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{links.length}</div>
                </CardContent>
              </Card>
            </div>

            {/* Resource List */}
            <div className="space-y-4">
              {resources.map((resource) => (
                <Card key={resource.id}>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {iconForType(resource.type)}
                        <CardTitle className="text-lg">{resource.title}</CardTitle>
                        <Badge variant="secondary" className="capitalize">
                          {resource.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Subject: {resource.subjectName || resource.subjectId}
                      </p>
                    </div>
                    <CardDescription>{resource.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="mt-2">
                    <div className="flex gap-3 flex-wrap">
                      {resource.fileUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => downloadResource(resource.fileUrl, resource.title)}
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      )}

                      {resource.link && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => window.open(resource.link, "_blank")}
                        >
                          <Link2 className="h-4 w-4" />
                          Open Link
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
