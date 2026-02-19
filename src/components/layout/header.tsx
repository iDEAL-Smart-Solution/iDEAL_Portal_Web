import { useAuthStore, useStudentDashboardStore } from "@/store"
import { resolveMediaUrl } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, Bell, Settings, LogOut } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface HeaderProps {
  onMobileMenuToggle?: () => void
}

export function Header({ onMobileMenuToggle }: HeaderProps) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const { dashboard } = useStudentDashboardStore()

  if (!user) return null

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Mobile menu button */}
      <Button variant="ghost" size="sm" className="lg:hidden" onClick={onMobileMenuToggle}>
        <Menu className="h-6 w-6" />
        <span className="sr-only">Open sidebar</span>
      </Button>

      {/* Separator */}
      <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 lg:hidden" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        {/* Page title area */}
        <div className="flex flex-1 items-center">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Welcome back, {user.firstName}!</h1>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            <span className="sr-only">View notifications</span>
            {/* Notification badge: use pending payments count when available */}
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
              {dashboard ? String(dashboard.pendingPayments.length || 0) : "3"}
            </span>
          </Button>

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200 dark:lg:bg-gray-800" />

          {/* Profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={resolveMediaUrl(user.avatar)} alt={`${user.firstName} ${user.lastName}`} />
                  <AvatarFallback>
                    {user.firstName[0]}
                    {user.lastName[0]}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  {dashboard?.studentInfo?.className && (
                    <p className="text-xs leading-none text-text-tertiary">Class: {dashboard.studentInfo.className}</p>
                  )}
                  {(dashboard?.recentResults?.[0]?.term || dashboard?.recentResults?.[0]?.session) && (
                    <p className="text-xs leading-none text-text-tertiary">
                      {dashboard.recentResults[0].term ? `Term: ${dashboard.recentResults[0].term}` : ""}
                      {dashboard.recentResults[0].session ? ` • Session: ${dashboard.recentResults[0].session}` : ""}
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
