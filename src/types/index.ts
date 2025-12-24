// User roles and authentication types
export type UserRole = "student" | "parent" | "staff" | "aspirant"

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

export interface Staff extends User {
  role: "staff"
  subjectIds: string[]
  classIds: string[]
}

// Alias for backward compatibility
export interface Teacher extends Staff {
  role: "staff"
}

export interface Aspirant extends User {
  role: "aspirant"
  admissionStatus: "pending" | "accepted" | "rejected" | "waitlisted"
  applicationDate: string
  applicationId?: string
  schoolId?: string
}

// Aspirant/Admission types - Backend DTOs
export enum AdmissionStatus {
  Pending = 1,
  Approved = 2,
  Rejected = 3,
  Migrated = 4
}

export interface ClassOption {
  id: string;
  name: string;
  studentCount: number;
  subjectCount: number;
}

export interface CreateAspirantRequest {
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  password: string;
  phoneNumber: string;
  gender?: string;
  address?: string;
  classId: string;
  dateOfBirth: Date;
  profilePicture: File;
  parentAspirantName: string;
  parentAspirantPhoneNumber: string;
}

export interface GetAspirantResponse {
  id: string;
  uin: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  gender?: string;
  className?: string;
  dateOfBirth: string;
  profilePictureUrl?: string;
  createdAt: string;
  admissionStatus: AdmissionStatus;
}

export interface AspirantFilter {
  gender?: string;
  classId?: string;
  search?: string; // name, email, UIN
  fromDate?: string;
  toDate?: string;
  admissionStatus?: AdmissionStatus;
}

export interface UpdateAdmissionStatusRequest {
  aspirantId: string;
  newStatus: AdmissionStatus;
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
  subjectName?: string
  subjectCode?: string
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
  type: "pdf" | "doc" | "video" | "image" | "other" | "note" | "link"
  url: string
  subjectId: string
  teacherId: string
  classIds: string[]
  createdAt: string
  subjectName: string
  link: string
  fileUrl: string
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
  uin: string
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
export interface AdmissionFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  address: string;
  previousSchool: string;
}

export interface AdmissionApplication {
  applicationId: string;
  status: "pending" | "review" | "approved" | "rejected";
  studentId?: string;
}

// Student Dashboard Types
export interface StudentDashboardResponse {
  studentInfo: StudentInfo
  stats: DashboardStats
  recentResults: RecentResult[]
  upcomingAssignments: UpcomingAssignment[]
  pendingPayments: PendingPayment[]
}

export interface StudentInfo {
  id: string
  fullName: string
  uin: string
  email: string
  className: string
  profilePicture: string | null
}

export interface DashboardStats {
  averageGrade: number
  totalSubjects: number
  pendingPaymentsCount: number
  totalPendingAmount: number
  upcomingAssignmentsCount: number
}

export interface RecentResult {
  id: string
  subjectName: string
  subjectCode: string
  totalScore: number
  grade: string
  term: string
  session: string
}

export interface UpcomingAssignment {
  id: string
  title: string
  description: string
  dueDate: string
  subjectName: string
  isOverdue: boolean
}

export interface PendingPayment {
  id: string
  description: string
  amount: number
  dueDate: string
  paymentType: string
  isOverdue: boolean
}

