"use client"

import { usePathname, useRouter } from "next/navigation"
import { useAuthStore } from "@/store"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  GraduationCap,
  LayoutDashboard,
  FileText,
  CreditCard,
  BookOpen,
  Calendar,
  Users,
  Settings,
  Upload,
  UserCheck,
  Building,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigationItems = {
  student: [
    { name: "Dashboard", href: "/dashboard/student", icon: LayoutDashboard },
    { name: "Results", href: "/dashboard/student/results", icon: FileText },
    { name: "Payments", href: "/dashboard/student/payments", icon: CreditCard },
    { name: "Assignments", href: "/dashboard/student/assignments", icon: BookOpen },
    { name: "Timetable", href: "/dashboard/student/timetable", icon: Calendar },
  ],
  parent: [
    { name: "Dashboard", href: "/dashboard/parent", icon: LayoutDashboard },
    { name: "My Wards", href: "/dashboard/parent/wards", icon: Users },
    { name: "Results", href: "/dashboard/parent/results", icon: FileText },
    { name: "Payments", href: "/dashboard/parent/payments", icon: CreditCard },
  ],
  teacher: [
    { name: "Dashboard", href: "/dashboard/teacher", icon: LayoutDashboard },
    { name: "Resources", href: "/dashboard/teacher/resources", icon: Upload },
    { name: "Assignments", href: "/dashboard/teacher/assignments", icon: BookOpen },
    { name: "My Classes", href: "/dashboard/teacher/classes", icon: Users },
  ],
  school_admin: [
    { name: "Dashboard", href: "/dashboard/school-admin", icon: LayoutDashboard },
    { name: "User Management", href: "/dashboard/school-admin/users", icon: Users },
    { name: "Timetables", href: "/dashboard/school-admin/timetable", icon: Calendar },
    { name: "Payment Types", href: "/dashboard/school-admin/payments", icon: CreditCard },
    { name: "Settings", href: "/dashboard/school-admin/settings", icon: Settings },
  ],
  super_admin: [
    { name: "Dashboard", href: "/dashboard/super-admin", icon: LayoutDashboard },
    { name: "Schools", href: "/dashboard/super-admin/schools", icon: Building },
    { name: "Subscriptions", href: "/dashboard/super-admin/subscriptions", icon: CreditCard },
    { name: "Analytics", href: "/dashboard/super-admin/analytics", icon: UserCheck },
  ],
}

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()

  if (!user) return null

  const navigation = navigationItems[user.role] || []

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-gray-900 px-6 pb-4 shadow-lg transition-all duration-200">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-primary">iDEAL</span>
        </div>
      </div>

      {/* User Profile */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 transition-colors duration-200">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.avatar || "/placeholder.svg"} alt={`${user.firstName} ${user.lastName}`} />
          <AvatarFallback>
            {user.firstName[0]}
            {user.lastName[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role.replace("_", " ")}</p>
        </div>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-3 h-11 transition-all duration-200",
                        isActive && "bg-primary/10 text-primary hover:bg-primary/20",
                      )}
                      onClick={() => router.push(item.href)}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Button>
                  </li>
                )
              })}
            </ul>
          </li>

          {/* Settings and Logout */}
          <li className="mt-auto">
            <ul role="list" className="-mx-2 space-y-1">
              <li>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 h-11 transition-all duration-200"
                  onClick={() => router.push("/settings")}
                >
                  <Settings className="h-5 w-5" />
                  Settings
                </Button>
              </li>
              <li>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 h-11 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 transition-all duration-200"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5" />
                  Sign Out
                </Button>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  )
}
