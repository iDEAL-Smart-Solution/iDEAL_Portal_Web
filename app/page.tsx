"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Users, BookOpen, Settings } from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()

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
          router.push("/auth/login")
      }
    }
  }, [isAuthenticated, user, router])

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">iDEAL School Portal</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/auth/login")}>
              Login
            </Button>
            <Button onClick={() => router.push("/auth/register")}>Register</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Modern School Management
            <span className="block text-primary">Made Simple</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Streamline your educational institution with our comprehensive portal designed for students, parents,
            teachers, and administrators.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => router.push("/auth/register")}>
              Get Started Today
            </Button>
            <Button size="lg" variant="outline" onClick={() => router.push("/auth/login")}>
              Sign In
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>For Students</CardTitle>
              <CardDescription>View results, assignments, timetables, and manage fee payments</CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>For Parents</CardTitle>
              <CardDescription>Monitor your wards' progress and handle fee payments seamlessly</CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>For Teachers</CardTitle>
              <CardDescription>Upload resources, create assignments, and manage class materials</CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Settings className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>For Admins</CardTitle>
              <CardDescription>Complete school management with user accounts and timetables</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Demo Credentials */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Demo Credentials</CardTitle>
            <CardDescription>Try the portal with these demo accounts (password: password123 for all)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Student</h4>
                <p className="text-muted-foreground">john.doe@student.greenwood.edu</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Parent</h4>
                <p className="text-muted-foreground">robert.doe@parent.greenwood.edu</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Teacher</h4>
                <p className="text-muted-foreground">sarah.wilson@teacher.greenwood.edu</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">School Admin</h4>
                <p className="text-muted-foreground">admin@greenwood.edu</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Super Admin</h4>
                <p className="text-muted-foreground">superadmin@ideal.edu</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-16 border-t">
        <div className="text-center text-muted-foreground">
          <p>&copy; 2024 iDEAL School Portal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
