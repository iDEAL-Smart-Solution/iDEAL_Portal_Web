// User roles and authentication types
export type UserRole = "student" | "parent" | "teacher" | "aspirant"

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  name?: string
  role: UserRole
  schoolId?: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

// Student specific types
export interface Student extends User {
  role: "student"
  studentId: string
  classId: string
  parentIds: string[]
}

export interface Parent extends User {
  role: "parent"
  wardIds: string[] // Student IDs they are responsible for
}

export interface Teacher extends User {
  role: "teacher"
  subjectIds: string[]
  classIds: string[]
}

export interface Aspirant extends User {
  role: "aspirant"
  admissionStatus: "pending" | "accepted" | "rejected" | "waitlisted"
  applicationDate: string
  applicationId?: string
  schoolId?: string
}

// Academic types
export interface School {
  id: string
  name: string
  address: string
  phone: string
  email: string
  location?: string
  subscriptionStatus: "active" | "inactive" | "suspended"
  subscriptionPlan: string
  subscription?: {
    amount: number
  }
  status?: "active" | "pending" | "inactive"
  studentCount?: number
  adminId?: string
  createdAt: string
}

export interface Class {
  id: string
  name: string
  level: string
  schoolId: string
  teacherId: string
  studentCount: number
}

export interface Subject {
  id: string
  name: string
  code: string
  schoolId: string
  teacherId: string
}

export interface Result {
  id: string
  studentId: string
  subjectId: string
  term: string
  academicYear: string
  score: number
  grade: string
  remarks?: string
  createdAt: string
}

export interface Assignment {
  id: string
  title: string
  description: string
  subjectId: string
  classId: string
  teacherId: string
  dueDate: string
  attachments?: string[]
  createdAt: string
}

export interface Resource {
  id: string
  title: string
  description: string
  type: "pdf" | "doc" | "video" | "image" | "other"
  url: string
  subjectId: string
  teacherId: string
  classIds: string[]
  createdAt: string
}

export interface Payment {
  id: string
  studentId: string
  paymentTypeId: string
  amount: number
  status: "pending" | "completed" | "failed"
  dueDate: string
  paidDate?: string
  description: string
  createdAt: string
}

export interface PaymentType {
  id: string
  name: string
  description: string
  amount: number
  schoolId: string
  isRecurring: boolean
  frequency?: "monthly" | "quarterly" | "annually"
}

export interface TimetableEntry {
  id: string
  classId: string
  subjectId: string
  teacherId: string
  dayOfWeek: number // 0-6 (Sunday-Saturday)
  day?: string
  timeSlot?: string
  startTime: string
  endTime: string
  room?: string
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  role: UserRole
  schoolId?: string
}
