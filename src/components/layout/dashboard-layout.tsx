import type { ReactNode, ReactElement } from "react"
import { useState } from "react"
import { useAuthStore, useStudentDashboardStore } from "@/store"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Settings, LogOut } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { resolveMediaUrl } from "@/lib/utils"
import { useLocation } from "react-router-dom"
import { Sidebar } from "./sidebar"
import { MobileNav } from "./mobile-nav"
import { Button } from "@/components/ui/button"
import { Menu, Bell } from "lucide-react"
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  BookOpen,
  Calendar,
  Users,
  Upload,
} from "lucide-react"

interface DashboardLayoutProps {
  children: ReactNode
}

const pageInfo: Record<string, { title: string; desc: string; icon: ReactElement }> = {
  student: {
    title: "Student Dashboard",
    desc: "View your academic information and activities",
    icon: <LayoutDashboard className="h-6 w-6 text-primary-500" />,
  },
  results: {
    title: "My Results",
    desc: "View and track your academic performance",
    icon: <FileText className="h-6 w-6 text-primary-500" />,
  },
  payments: {
    title: "Payments",
    desc: "Manage your payment history and pending fees",
    icon: <CreditCard className="h-6 w-6 text-primary-500" />,
  },
  assignments: {
    title: "Assignments",
    desc: "View and submit your assignments",
    icon: <BookOpen className="h-6 w-6 text-primary-500" />,
  },
  timetable: {
    title: "Class Timetable",
    desc: "View your class schedule and events",
    icon: <Calendar className="h-6 w-6 text-primary-500" />,
  },
  resources: {
    title: "Learning Resources",
    desc: "Access teaching and learning materials",
    icon: <Upload className="h-6 w-6 text-primary-500" />,
  },
  parent: {
    title: "Parent Dashboard",
    desc: "Monitor your children's academic progress",
    icon: <LayoutDashboard className="h-6 w-6 text-primary-500" />,
  },
  wards: {
    title: "My Wards",
    desc: "View and manage your children's information",
    icon: <Users className="h-6 w-6 text-primary-500" />,
  },
  teacher: {
    title: "Teacher Dashboard",
    desc: "Manage your classes and teaching activities",
    icon: <LayoutDashboard className="h-6 w-6 text-primary-500" />,
  },
  classes: {
    title: "My Classes",
    desc: "View and manage your assigned classes",
    icon: <Users className="h-6 w-6 text-primary-500" />,
  },
  subjects: {
    title: "Subjects",
    desc: "Manage your teaching subjects",
    icon: <FileText className="h-6 w-6 text-primary-500" />,
  },
  aspirant: {
    title: "Aspirant Dashboard",
    desc: "Track your admission application status",
    icon: <LayoutDashboard className="h-6 w-6 text-primary-500" />,
  },
}

function DesktopProfile() {
  const { user, logout } = useAuthStore()
  const { dashboard } = useStudentDashboardStore()
  const navigate = useNavigate()

  if (!user) return null

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <details className="relative">
      <summary className="list-none">
        <div className="h-8 w-8 rounded-full overflow-hidden bg-neutral-100 flex items-center justify-center">
          <img src={resolveMediaUrl(user.avatar)} alt={`${user.firstName} ${user.lastName}`} className="h-8 w-8 object-cover" />
        </div>
      </summary>
      <div className="absolute right-0 mt-2 w-56 rounded-md border bg-white shadow-lg text-sm">
        <div className="p-3">
          <div className="font-medium">{user.firstName} {user.lastName}</div>
          <div className="text-xs text-text-tertiary">{user.email}</div>
          {dashboard?.studentInfo?.className && (
            <div className="text-xs text-text-tertiary mt-2">Class: {dashboard.studentInfo.className}</div>
          )}
          {dashboard?.recentResults?.[0] && (
            <div className="text-xs text-text-tertiary mt-1">
              Term: {dashboard.recentResults[0].term} • Session: {dashboard.recentResults[0].session}
            </div>
          )}
        </div>
        <div className="border-t">
          <button className="w-full text-left px-3 py-2 hover:bg-neutral-50" onClick={() => navigate('/settings')}>Settings</button>
          <button className="w-full text-left px-3 py-2 text-red-600 hover:bg-neutral-50" onClick={handleLogout}>Sign out</button>
        </div>
      </div>
    </details>
  )
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuthStore()
  const { dashboard } = useStudentDashboardStore()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  if (!user) {
    return null
  }

  // Extract page key from pathname
  const pathSegments = location.pathname.split('/').filter(Boolean)
  const pageKey = pathSegments[pathSegments.length - 1] || user.role
  const active = pageInfo[pageKey] || pageInfo[user.role]

  return (
    <div className="flex h-screen bg-background-secondary overflow-hidden">
      {/* Desktop Sidebar - Hidden on mobile and tablet */}
      <div className="hidden lg:block w-72 flex-shrink-0 border-r border-neutral-200 bg-background-primary shadow-soft h-full">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-background-primary border-b border-neutral-200 px-4 py-3 shadow-soft flex-shrink-0">
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(true)}
              className="h-10 w-10 p-0"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
            <h1 className="text-base font-semibold text-text-primary flex-1 truncate">
              {active?.title || "Dashboard"}
            </h1>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0 relative">
                <Bell className="h-5 w-5" />
                <span className="sr-only">View notifications</span>
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent-500 text-xs text-white flex items-center justify-center">
                  {dashboard ? String(dashboard.pendingPayments.length || 0) : "3"}
                </span>
              </Button>

              <div className="h-10 w-10">
                <details className="relative">
                  <summary className="list-none">
                    <div className="h-10 w-10 rounded-full overflow-hidden bg-neutral-100 flex items-center justify-center">
                      <img src={resolveMediaUrl(user.avatar)} alt={`${user.firstName} ${user.lastName}`} className="h-10 w-10 object-cover" />
                    </div>
                  </summary>
                  <div className="absolute right-0 mt-2 w-56 rounded-md border bg-white shadow-lg text-sm">
                    <div className="p-3">
                      <div className="font-medium">{user.firstName} {user.lastName}</div>
                      <div className="text-xs text-text-tertiary">{user.email}</div>
                      {dashboard?.studentInfo?.className && (
                        <div className="text-xs text-text-tertiary mt-2">Class: {dashboard.studentInfo.className}</div>
                      )}
                      {dashboard?.recentResults?.[0] && (
                        <div className="text-xs text-text-tertiary mt-1">
                          Term: {dashboard.recentResults[0].term} • Session: {dashboard.recentResults[0].session}
                        </div>
                      )}
                    </div>
                    <div className="border-t">
                      <button className="w-full text-left px-3 py-2 hover:bg-neutral-50" onClick={() => window.location.assign('/settings')}>Settings</button>
                      <button className="w-full text-left px-3 py-2 text-red-600 hover:bg-neutral-50" onClick={() => { sessionStorage.removeItem('token'); sessionStorage.removeItem('SchoolId'); window.location.assign('/'); }}>Sign out</button>
                    </div>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </header>
        
        {/* Desktop Header */}
        <header className="hidden lg:block bg-background-primary border-b border-neutral-200 px-6 py-4 shadow-soft flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {active?.icon}
              <div>
                <h1 className="text-2xl font-semibold text-text-primary">
                  {active?.title}
                </h1>
                <p className="text-sm text-text-secondary mt-1">{active?.desc}</p>
              </div>
            </div>

            {/* Date Display */}
            <div className="flex items-center gap-4">
              <div className="text-sm text-text-tertiary">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>

              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="sr-only">View notifications</span>
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent-500 text-xs text-white flex items-center justify-center">
                    {dashboard ? String(dashboard.pendingPayments.length || 0) : "3"}
                  </span>
                </Button>

                <div>
                  <DesktopProfile />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-background-secondary">
          {children}
        </main>
      </div>

      {/* Mobile Navigation Drawer */}
      <MobileNav open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} />
    </div>
  )
}
