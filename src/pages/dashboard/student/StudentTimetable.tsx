

import { useEffect } from "react"
import { useAuthStore, useTimetableStore } from "@/store"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { EmptyState } from "@/components/ui/empty-state"
import { Calendar, Clock, MapPin } from "lucide-react"
import { formatTime } from "@/lib/utils"

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

// const TIME_SLOTS = ["08:00", "09:00", "10:00", "10:30", "11:30", "12:30", "13:30", "14:30", "15:30"]

export default function StudentTimetable() {
  const { user } = useAuthStore()
  const { timetable, fetchTimetable, isLoading, error } = useTimetableStore()

  useEffect(() => {
    
    if (user && (user as any).classId) {
      fetchTimetable((user as any).classId)
    } 
  }, [user, fetchTimetable])

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    )
  }

  // Check if user has classId (for students who haven't logged out after backend update)
  if (!(user as any).classId) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <PageHeader title="Class Timetable" description="Your weekly class schedule" />
          <Card>
            <CardContent className="pt-6">
              <EmptyState
                icon={Calendar}
                title="Session Update Required"
                description="Please log out and log back in to view your timetable."
              />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  // Group timetable by day
  const timetableByDay = timetable.reduce(
    (acc, entry) => {
      const day = entry.dayOfWeek
      if (!acc[day]) acc[day] = []
      acc[day].push(entry)
      return acc
    },
    {} as Record<number, typeof timetable>,
  )

  // Sort entries by start time for each day
  Object.keys(timetableByDay).forEach((day) => {
    timetableByDay[Number(day)].sort((a, b) => a.startTime.localeCompare(b.startTime))
  })

  const getCurrentDayClasses = () => {
    const today = new Date().getDay()
    return timetableByDay[today] || []
  }

  const getNextClass = () => {
    const now = new Date()
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
    const today = now.getDay()

    const todayClasses = timetableByDay[today] || []
    return todayClasses.find((entry) => entry.startTime > currentTime)
  }

  const todayClasses = getCurrentDayClasses()
  const nextClass = getNextClass()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader title="Class Timetable" description="Your weekly class schedule" />

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-red-600">Error loading timetable: {error}</div>
            </CardContent>
          </Card>
        ) : timetable.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No Timetable Available"
            description="Your class timetable hasn't been set up yet. Please contact your school administrator."
          />
        ) : (
          <>
            {/* Today's Overview */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Today's Classes
                  </CardTitle>
                  <CardDescription>
                    {DAYS_OF_WEEK[new Date().getDay()]} - {todayClasses.length} classes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {todayClasses.length === 0 ? (
                    <p className="text-muted-foreground">No classes today</p>
                  ) : (
                    <div className="space-y-3">
                      {todayClasses.map((entry) => (
                        <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg border">
                          <div>
                            <p className="font-medium">{entry.subjectName || `Subject ${entry.subjectId}`}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
                              </span>
                              {entry.room && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {entry.room}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Next Class
                  </CardTitle>
                  <CardDescription>Upcoming class information</CardDescription>
                </CardHeader>
                <CardContent>
                  {nextClass ? (
                    <div className="p-4 rounded-lg border bg-primary/5">
                      <h3 className="font-semibold text-lg">{nextClass.subjectName || `Subject ${nextClass.subjectId}`}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(nextClass.startTime)} - {formatTime(nextClass.endTime)}
                        </span>
                        {nextClass.room && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {nextClass.room}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No more classes today</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Weekly Timetable */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Schedule</CardTitle>
                <CardDescription>Complete timetable for all days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {DAYS_OF_WEEK.slice(1, 6).map((dayName, index) => {
                    const dayIndex = index + 1 // Monday = 1, Tuesday = 2, etc.
                    const dayClasses = timetableByDay[dayIndex] || []

                    return (
                      <div key={dayName}>
                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                          {dayName}
                          {dayIndex === new Date().getDay() && <Badge variant="secondary">Today</Badge>}
                        </h3>
                        {dayClasses.length === 0 ? (
                          <p className="text-muted-foreground ml-4">No classes scheduled</p>
                        ) : (
                          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                            {dayClasses.map((entry) => (
                              <Card key={entry.id} className="border-l-4 border-l-primary">
                                <CardContent className="p-4">
                                  <h4 className="font-medium">{entry.subjectName || `Subject ${entry.subjectId}`}</h4>
                                  <div className="space-y-1 mt-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
                                    </div>
                                    {entry.room && (
                                      <div className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {entry.room}
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

