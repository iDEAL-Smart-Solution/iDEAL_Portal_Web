"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap } from "lucide-react"

export default function DemoPage() {
  const router = useRouter()
  const { login, isLoading, isAuthenticated, user } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect to appropriate dashboard based on user role
      switch (user.role) {
        case "student":
          router.push("/dashboard/student")
          break
        case "parent":
          router.push("/dashboard/parent")
          break
        case "teacher":
          router.push("/dashboard/teacher")
          break
        case "school_admin":
          router.push("/dashboard/school-admin")
          break
        case "super_admin":
          router.push("/dashboard/super-admin")
          break
        default:
          router.push("/")
      }
    }
  }, [isAuthenticated, user, router])

  const handleDemoLogin = async (email: string) => {
    try {
      await login({ email, password: "password123" })
    } catch (error) {
      console.error("Demo login failed:", error)
    }
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Redirecting to your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <GraduationCap className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">iDEAL School Portal</h1>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Demo Access</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Choose a role to explore the portal</p>
        </div>

        {/* Demo Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Portal</CardTitle>
              <CardDescription>View assignments, timetable, results, and payments</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => handleDemoLogin("john.doe@student.greenwood.edu")}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Logging in..." : "Enter as Student"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Parent Portal</CardTitle>
              <CardDescription>Monitor your child's progress, payments, and school updates</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => handleDemoLogin("robert.doe@parent.greenwood.edu")}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Logging in..." : "Enter as Parent"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Teacher Portal</CardTitle>
              <CardDescription>Manage classes, assignments, and student resources</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => handleDemoLogin("sarah.wilson@teacher.greenwood.edu")}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Logging in..." : "Enter as Teacher"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>School Admin</CardTitle>
              <CardDescription>Manage school operations, users, and timetables</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => handleDemoLogin("admin@greenwood.edu")}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Logging in..." : "Enter as Admin"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Having trouble? Try the{" "}
            <a href="/auth/login" className="text-primary hover:underline">
              regular login page
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
