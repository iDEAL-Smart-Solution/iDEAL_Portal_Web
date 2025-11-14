import { useEffect } from "react"
import { useAuthStore } from "@/store"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StatsCard } from "@/components/ui/stats-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileText, Clock, CheckCircle, XCircle, AlertCircle, Info } from "lucide-react"
import { formatDate } from "@/lib/utils"
import type { Aspirant } from "@/types"

export default function AspirantDashboard() {
  const { user } = useAuthStore()

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    )
  }

  const aspirant = user as Aspirant
  const admissionStatus = aspirant.admissionStatus || "pending"
  const applicationDate = aspirant.applicationDate || aspirant.createdAt

  const getStatusBadge = () => {
    switch (admissionStatus) {
      case "accepted":
        return (
          <Badge className="bg-green-500 hover:bg-green-600 text-white">
            <CheckCircle className="h-3 w-3 mr-1" />
            Accepted
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
      case "waitlisted":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
            <Clock className="h-3 w-3 mr-1" />
            Waitlisted
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Pending Review
          </Badge>
        )
    }
  }

  const getStatusMessage = () => {
    switch (admissionStatus) {
      case "accepted":
        return {
          title: "Congratulations!",
          message: "Your application has been accepted. You will receive further instructions via email.",
          variant: "default" as const,
        }
      case "rejected":
        return {
          title: "Application Status",
          message: "Unfortunately, your application was not successful at this time. Please contact the admissions office for more information.",
          variant: "destructive" as const,
        }
      case "waitlisted":
        return {
          title: "Application Waitlisted",
          message: "Your application is on the waitlist. We will contact you if a spot becomes available.",
          variant: "default" as const,
        }
      default:
        return {
          title: "Application Under Review",
          message: "Your application is currently being reviewed. We will notify you once a decision has been made.",
          variant: "default" as const,
        }
    }
  }

  const statusInfo = getStatusMessage()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome, {user.firstName}!</h1>
          <p className="text-muted-foreground mt-2">Track your admission application status here.</p>
        </div>

        {/* Status Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Application Status</CardTitle>
                <CardDescription>Current status of your admission application</CardDescription>
              </div>
              {getStatusBadge()}
            </div>
          </CardHeader>
          <CardContent>
            <Alert variant={statusInfo.variant}>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>{statusInfo.title}</strong>
                <p className="mt-1">{statusInfo.message}</p>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            title="Application Status"
            value={admissionStatus.charAt(0).toUpperCase() + admissionStatus.slice(1)}
            description="Current admission status"
            icon={FileText}
          />
          <StatsCard
            title="Application Date"
            value={formatDate(applicationDate)}
            description="When you submitted your application"
            icon={Clock}
          />
          {aspirant.applicationId && (
            <StatsCard
              title="Application ID"
              value={aspirant.applicationId}
              description="Your unique application reference"
              icon={FileText}
            />
          )}
        </div>

        {/* Application Details */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Application Information</CardTitle>
              <CardDescription>Details about your application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Full Name:</span>
                <span className="text-sm font-semibold">
                  {user.firstName} {user.lastName}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Email:</span>
                <span className="text-sm">{user.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Application Date:</span>
                <span className="text-sm">{formatDate(applicationDate)}</span>
              </div>
              {aspirant.applicationId && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Application ID:</span>
                  <span className="text-sm font-mono">{aspirant.applicationId}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
              <CardDescription>What happens next in the admission process</CardDescription>
            </CardHeader>
            <CardContent>
              {admissionStatus === "pending" && (
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-semibold text-primary">1</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Application Review</p>
                      <p className="text-xs text-muted-foreground">Your application is being reviewed by the admissions committee.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-xs font-semibold text-muted-foreground">2</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Decision Notification</p>
                      <p className="text-xs text-muted-foreground">You will receive an email notification once a decision is made.</p>
                    </div>
                  </div>
                </div>
              )}
              {admissionStatus === "accepted" && (
                <div className="space-y-3">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Congratulations!</strong> Your application has been accepted. Please check your email for enrollment instructions and next steps.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
              {admissionStatus === "waitlisted" && (
                <div className="space-y-3">
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      Your application is on the waitlist. We will contact you if a spot becomes available. Please ensure your contact information is up to date.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
              {admissionStatus === "rejected" && (
                <div className="space-y-3">
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      If you have questions about this decision, please contact the admissions office for more information.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

