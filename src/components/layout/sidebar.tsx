import { useLocation, useNavigate } from "react-router-dom"
import { useAuthStore } from "@/store"
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  BookOpen,
  Calendar,
  Users,
  Upload,
  BarChart,
  LogOut,
  ClipboardList,
  ClipboardCheck,
} from "lucide-react"
import { getBrandingSubtitle, resolveSchoolBranding, SchoolBrandHeader } from "./school-branding"

const navigationItems = {
  student: [
    { id: "dashboard", name: "Dashboard", href: "/dashboard/student", icon: LayoutDashboard, description: "View your dashboard overview" },
    { id: "performance", name: "Performance", href: "/dashboard/student/performance", icon: BarChart, description: "View analytics and performance" },
    { id: "results", name: "My Results", href: "/dashboard/student/results", icon: FileText, description: "Check your academic results" },
    { id: "report-card", name: "Report Card", href: "/dashboard/student/report-card", icon: ClipboardCheck, description: "View & print your report card" },
    { id: "payments", name: "Payments", href: "/dashboard/student/payments", icon: CreditCard, description: "View payment history" },
    { id: "assignments", name: "Assignments", href: "/dashboard/student/assignments", icon: BookOpen, description: "View and submit assignments" },
    { id: "timetable", name: "Timetable", href: "/dashboard/student/timetable", icon: Calendar, description: "Check your class schedule" },
    { id: "resources", name: "Resources", href: "/dashboard/student/resources", icon: Upload, description: "Access learning materials" },
  ],
  parent: [
    { id: "dashboard", name: "Dashboard", href: "/dashboard/parent", icon: LayoutDashboard, description: "View dashboard overview" },
    { id: "performance", name: "Performance", href: "/dashboard/parent/performance", icon: BarChart, description: "View analytics and performance" },
    { id: "wards", name: "My Wards", href: "/dashboard/parent/wards", icon: Users, description: "View your children's information" },
    { id: "results", name: "Results", href: "/dashboard/parent/results", icon: FileText, description: "View academic results" },
    { id: "payments", name: "Payments", href: "/dashboard/parent/payments", icon: CreditCard, description: "Manage payments" },
  ],
  staff: [
    { id: "dashboard", name: "Dashboard", href: "/dashboard/teacher", icon: LayoutDashboard, description: "View dashboard overview" },
    { id: "performance", name: "Performance", href: "/dashboard/teacher/performance", icon: BarChart, description: "View analytics and performance" },
    { id: "subjects", name: "My Subjects", href: "/dashboard/teacher/subjects", icon: FileText, description: "View assigned subjects" },
    { id: "assignments", name: "Assignments", href: "/dashboard/teacher/assignments", icon: BookOpen, description: "Manage assignments" },
    { id: "results", name: "Upload Results", href: "/dashboard/teacher/results", icon: ClipboardList, description: "Upload student results" },
    { id: "resources", name: "Resources", href: "/dashboard/teacher/resources", icon: Upload, description: "Manage teaching materials" },
  ],
  teacher: [
    { id: "dashboard", name: "Dashboard", href: "/dashboard/teacher", icon: LayoutDashboard, description: "View dashboard overview" },
    { id: "performance", name: "Performance", href: "/dashboard/teacher/performance", icon: BarChart, description: "View analytics and performance" },
    { id: "subjects", name: "My Subjects", href: "/dashboard/teacher/subjects", icon: FileText, description: "View assigned subjects" },
    { id: "assignments", name: "Assignments", href: "/dashboard/teacher/assignments", icon: BookOpen, description: "Manage assignments" },
    { id: "results", name: "Upload Results", href: "/dashboard/teacher/results", icon: ClipboardList, description: "Upload student results" },
    { id: "resources", name: "Resources", href: "/dashboard/teacher/resources", icon: Upload, description: "Manage teaching materials" },
  ],
  aspirant: [
    { id: "dashboard", name: "Dashboard", href: "/dashboard/aspirant", icon: LayoutDashboard, description: "View your application status" },
  ],
}

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  if (!user) return null

  const navigation = navigationItems[user.role as keyof typeof navigationItems] || []
  // If backend flagged profile as incomplete or user is migrated, surface a completion link
  if ((user.requiresProfileCompletion || user.isMigrated) && user.isProfileComplete === false) {
    // Avoid duplicate entry
    if (!navigation.some((n) => n.id === "complete-profile")) {
      navigation.unshift({ id: "complete-profile", name: "Complete Profile", href: "/profile/complete", icon: ClipboardCheck, description: "Finish required profile fields" })
    }
  }
  const currentPath = location.pathname
  const branding = resolveSchoolBranding(user)

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-background-primary">
      <div className="flex-shrink-0 border-b border-neutral-200 p-4">
        <SchoolBrandHeader
          schoolName={branding.schoolName}
          schoolLogoUrl={branding.schoolLogoUrl}
          subtitle={getBrandingSubtitle(user.role)}
        />
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-5">
        {navigation.map((item) => {
          const isActive = currentPath === item.href
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.href)}
              className={`w-full flex items-center space-x-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                isActive
                  ? 'border-primary-200 bg-primary-50 text-primary-700 shadow-soft'
                  : 'border-transparent text-text-secondary hover:border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              <div className={`flex-shrink-0 ${
                isActive ? 'text-primary-500' : 'text-neutral-500'
              }`}>
                <item.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  {item.name}
                </p>
                <p className="text-xs hidden lg:block text-text-tertiary">
                  {item.description}
                </p>
              </div>
            </button>
          )
        })}
      </nav>

      <div className="flex-shrink-0 border-t border-neutral-200 p-4">
        <div className="text-center mb-4">
          <p className="text-xs text-text-tertiary">
            Powered by iDEAL Smart Solution Limited
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-accent-500 hover:bg-accent-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}
