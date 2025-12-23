import { useLocation, useNavigate } from "react-router-dom"
import { useAuthStore } from "@/store"
import {
  GraduationCap,
  LayoutDashboard,
  FileText,
  CreditCard,
  BookOpen,
  Calendar,
  Users,
  Upload,
  LogOut,
} from "lucide-react"

const navigationItems = {
  student: [
    { id: "dashboard", name: "Dashboard", href: "/dashboard/student", icon: LayoutDashboard, description: "View your dashboard overview" },
    { id: "results", name: "My Results", href: "/dashboard/student/results", icon: FileText, description: "Check your academic results" },
    { id: "payments", name: "Payments", href: "/dashboard/student/payments", icon: CreditCard, description: "View payment history" },
    { id: "assignments", name: "Assignments", href: "/dashboard/student/assignments", icon: BookOpen, description: "View and submit assignments" },
    { id: "timetable", name: "Timetable", href: "/dashboard/student/timetable", icon: Calendar, description: "Check your class schedule" },
    { id: "resources", name: "Resources", href: "/dashboard/student/resources", icon: Upload, description: "Access learning materials" },
  ],
  parent: [
    { id: "dashboard", name: "Dashboard", href: "/dashboard/parent", icon: LayoutDashboard, description: "View dashboard overview" },
    { id: "wards", name: "My Wards", href: "/dashboard/parent/wards", icon: Users, description: "View your children's information" },
    { id: "results", name: "Results", href: "/dashboard/parent/results", icon: FileText, description: "View academic results" },
    { id: "payments", name: "Payments", href: "/dashboard/parent/payments", icon: CreditCard, description: "Manage payments" },
  ],
  teacher: [
    { id: "dashboard", name: "Dashboard", href: "/dashboard/teacher", icon: LayoutDashboard, description: "View dashboard overview" },
    { id: "resources", name: "Resources", href: "/dashboard/teacher/resources", icon: Upload, description: "Manage teaching materials" },
    { id: "assignments", name: "Assignments", href: "/dashboard/teacher/assignments", icon: BookOpen, description: "Manage assignments" },
    { id: "classes", name: "My Classes", href: "/dashboard/teacher/classes", icon: Users, description: "View your classes" },
    { id: "subjects", name: "Subjects", href: "/dashboard/teacher/subjects", icon: FileText, description: "Manage subjects" },
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
  const currentPath = location.pathname

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <div className="flex flex-col h-full bg-background-primary">
      {/* Header */}
      <div className="flex items-center justify-center p-6 border-b border-neutral-200 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center">
            <GraduationCap className="h-6 w-6 text-primary-500" />
          </div>
          <div className="text-center">
            <h1 className="text-lg font-bold text-text-primary">iDEAL Portal</h1>
            <p className="text-xs text-text-tertiary capitalize">{user.role} Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = currentPath === item.href
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.href)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700 border border-primary-200 shadow-soft'
                  : 'text-text-secondary hover:bg-neutral-50'
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

      {/* Footer */}
      <div className="p-4 border-t border-neutral-200 flex-shrink-0">
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
