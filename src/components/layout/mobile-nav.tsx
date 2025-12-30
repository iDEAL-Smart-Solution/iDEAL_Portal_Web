import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useAuthStore } from "@/store"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Header } from "./header"
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
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigationItems = {
  student: [
    { name: "Dashboard", href: "/dashboard/student", icon: LayoutDashboard },
    { name: "My Results", href: "/dashboard/student/results", icon: FileText },
    { name: "Payments", href: "/dashboard/student/payments", icon: CreditCard },
    { name: "Assignments", href: "/dashboard/student/assignments", icon: BookOpen },
    { name: "Timetable", href: "/dashboard/student/timetable", icon: Calendar },
    { name: "Resources", href: "/dashboard/student/resources", icon: Upload },
  ],
  parent: [
    { name: "Dashboard", href: "/dashboard/parent", icon: LayoutDashboard },
    { name: "My Wards", href: "/dashboard/parent/wards", icon: Users },
    { name: "Results", href: "/dashboard/parent/results", icon: FileText },
    { name: "Payments", href: "/dashboard/parent/payments", icon: CreditCard },
  ],
  staff: [
    { name: "Dashboard", href: "/dashboard/teacher", icon: LayoutDashboard },
    { name: "My Subjects", href: "/dashboard/teacher/subjects", icon: FileText },
    { name: "Assignments", href: "/dashboard/teacher/assignments", icon: BookOpen },
    { name: "Resources", href: "/dashboard/teacher/resources", icon: Upload },
  ],
  teacher: [
    { name: "Dashboard", href: "/dashboard/teacher", icon: LayoutDashboard },
    { name: "My Subjects", href: "/dashboard/teacher/subjects", icon: FileText },
    { name: "Assignments", href: "/dashboard/teacher/assignments", icon: BookOpen },
    { name: "Resources", href: "/dashboard/teacher/resources", icon: Upload },
  ],
  aspirant: [
    { name: "Dashboard", href: "/dashboard/aspirant", icon: LayoutDashboard },
  ],
}

interface MobileNavProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileNav({ open, onOpenChange }: MobileNavProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  if (!user) return null

  const navigation = navigationItems[user.role as keyof typeof navigationItems] || []

  const handleLogout = () => {
    logout()
    navigate("/")
    onOpenChange(false)
  }

  const handleNavigation = (href: string) => {
    navigate(href)
    onOpenChange(false)
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-72 p-0 bg-background-primary">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-background-primary px-6 pb-4 h-full">
            {/* Logo */}
            <div className="flex h-16 shrink-0 items-center justify-center border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-8 w-8 text-primary-500" />
                <span className="text-xl font-bold text-primary-600">iDEAL</span>
              </div>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-primary-50 border border-primary-100">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={`${user.firstName} ${user.lastName}`} />
                <AvatarFallback className="bg-primary-500 text-white">
                  {user.firstName[0]}
                  {user.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-text-tertiary capitalize">{user.role.replace("_", " ")}</p>
              </div>
            </div>

            <Separator className="bg-neutral-200" />

            {/* Navigation */}
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {navigation.map((item) => {
                      const isActive = location.pathname === item.href
                      return (
                        <li key={item.name}>
                          <Button
                            variant="ghost"
                            className={cn(
                              "w-full justify-start gap-3 h-11 transition-all duration-200 text-text-secondary",
                              isActive && "bg-primary-50 text-primary-700 border-l-4 border-primary-500 rounded-l-none hover:bg-primary-100",
                              !isActive && "hover:bg-neutral-100"
                            )}
                            onClick={() => handleNavigation(item.href)}
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
                        className="w-full justify-start gap-3 h-11 transition-all duration-200 text-text-secondary hover:bg-neutral-100"
                        onClick={() => handleNavigation("/settings")}
                      >
                        <Settings className="h-5 w-5" />
                        Settings
                      </Button>
                    </li>
                    <li>
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 h-11 text-accent-600 hover:text-accent-700 hover:bg-accent-50 transition-all duration-200"
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
        </SheetContent>
      </Sheet>
    </>
  )
}
