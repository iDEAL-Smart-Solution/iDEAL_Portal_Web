

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Plus, Edit } from "lucide-react"
import { mockClasses, mockSubjects, mockTimetable } from "@/lib/mock-data"

export default function TimetableManagement() {
  const [selectedClass, setSelectedClass] = useState<string>("all")

  const timeSlots = [
    "08:00 - 08:45",
    "08:45 - 09:30",
    "09:30 - 10:15",
    "10:15 - 11:00",
    "11:00 - 11:45",
    "11:45 - 12:30",
    "12:30 - 13:15",
    "13:15 - 14:00",
    "14:00 - 14:45",
    "14:45 - 15:30",
  ]

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

  const filteredTimetable =
    selectedClass === "all" ? mockTimetable : mockTimetable.filter((t) => t.classId === selectedClass)

  const getSubjectForSlot = (day: string, timeSlot: string, classId?: string) => {
    return filteredTimetable.find(
      (t) => t.day === day && t.timeSlot === timeSlot && (selectedClass === "all" ? true : t.classId === classId),
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Timetable Management"
          description="Create and manage class schedules for all classes"
          action={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Schedule
            </Button>
          }
        />

        {/* Class Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Class Selection</CardTitle>
            <CardDescription>Select a class to view or edit its timetable</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-center">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {mockClasses.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name} - Level {cls.level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Export Schedule
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Timetable Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Schedule</CardTitle>
            <CardDescription>
              {selectedClass === "all"
                ? "Overview of all class schedules"
                : `Schedule for ${mockClasses.find((c) => c.id === selectedClass)?.name}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Header */}
                <div className="grid grid-cols-6 gap-2 mb-4">
                  <div className="font-medium text-sm text-muted-foreground">Time</div>
                  {days.map((day) => (
                    <div key={day} className="font-medium text-sm text-center">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Time slots */}
                <div className="space-y-2">
                  {timeSlots.map((timeSlot) => (
                    <div key={timeSlot} className="grid grid-cols-6 gap-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-3 w-3 mr-2" />
                        {timeSlot}
                      </div>
                      {days.map((day) => {
                        const subject = getSubjectForSlot(
                          day,
                          timeSlot,
                          selectedClass === "all" ? undefined : selectedClass,
                        )
                        const subjectInfo = subject ? mockSubjects.find((s) => s.id === subject.subjectId) : null
                        const classInfo = subject ? mockClasses.find((c) => c.id === subject.classId) : null

                        return (
                          <div
                            key={`${day}-${timeSlot}`}
                            className="min-h-[60px] border rounded-lg p-2 hover:bg-muted/50 cursor-pointer group"
                          >
                            {subject && subjectInfo ? (
                              <div className="space-y-1">
                                <div className="font-medium text-sm">{subjectInfo.name}</div>
                                {selectedClass === "all" && classInfo && (
                                  <Badge variant="outline" className="text-xs">
                                    {classInfo.name}
                                  </Badge>
                                )}
                                <div className="text-xs text-muted-foreground">Room {subject.room || "TBA"}</div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockClasses.length}</div>
              <p className="text-xs text-muted-foreground">Active classes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled Periods</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockTimetable.length}</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subjects</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockSubjects.length}</div>
              <p className="text-xs text-muted-foreground">Available subjects</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

