import type {
  User,
  Student,
  Parent,
  Teacher,
  SchoolAdmin,
  SuperAdmin,
  School,
  Class,
  Subject,
  Result,
  Assignment,
  Resource,
  Payment,
  PaymentType,
  TimetableEntry,
} from "@/types"

// Mock Schools
export const mockSchools: School[] = [
  {
    id: "school_1",
    name: "Greenwood High School",
    address: "123 Education Street, Learning City",
    phone: "+1-555-0123",
    email: "admin@greenwood.edu",
    subscriptionStatus: "active",
    subscriptionPlan: "premium",
    createdAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "school_2",
    name: "Riverside Academy",
    address: "456 Knowledge Avenue, Study Town",
    phone: "+1-555-0456",
    email: "info@riverside.edu",
    subscriptionStatus: "active",
    subscriptionPlan: "standard",
    createdAt: "2024-02-01T00:00:00Z",
  },
]

// Mock Users
export const mockUsers: User[] = [
  // Students
  {
    id: "student_1",
    email: "john.doe@student.greenwood.edu",
    firstName: "John",
    lastName: "Doe",
    role: "student",
    schoolId: "school_1",
    avatar: "/student-avatar.png",
    createdAt: "2024-01-20T00:00:00Z",
    updatedAt: "2024-01-20T00:00:00Z",
  } as Student & { studentId: string; classId: string; parentIds: string[] },
  {
    id: "student_2",
    email: "jane.smith@student.greenwood.edu",
    firstName: "Jane",
    lastName: "Smith",
    role: "student",
    schoolId: "school_1",
    avatar: "/student-avatar.png",
    createdAt: "2024-01-21T00:00:00Z",
    updatedAt: "2024-01-21T00:00:00Z",
  } as Student & { studentId: string; classId: string; parentIds: string[] },

  // Parents
  {
    id: "parent_1",
    email: "robert.doe@parent.greenwood.edu",
    firstName: "Robert",
    lastName: "Doe",
    role: "parent",
    schoolId: "school_1",
    avatar: "/parent-avatar.png",
    createdAt: "2024-01-20T00:00:00Z",
    updatedAt: "2024-01-20T00:00:00Z",
  } as Parent & { wardIds: string[] },

  // Teachers
  {
    id: "teacher_1",
    email: "sarah.wilson@teacher.greenwood.edu",
    firstName: "Sarah",
    lastName: "Wilson",
    role: "teacher",
    schoolId: "school_1",
    avatar: "/teacher-avatar.png",
    createdAt: "2024-01-18T00:00:00Z",
    updatedAt: "2024-01-18T00:00:00Z",
  } as Teacher & { subjectIds: string[]; classIds: string[] },
  {
    id: "teacher_2",
    email: "michael.brown@teacher.greenwood.edu",
    firstName: "Michael",
    lastName: "Brown",
    role: "teacher",
    schoolId: "school_1",
    avatar: "/teacher-avatar.png",
    createdAt: "2024-01-19T00:00:00Z",
    updatedAt: "2024-01-19T00:00:00Z",
  } as Teacher & { subjectIds: string[]; classIds: string[] },

  // School Admin
  {
    id: "admin_1",
    email: "admin@greenwood.edu",
    firstName: "Emily",
    lastName: "Johnson",
    role: "school_admin",
    schoolId: "school_1",
    avatar: "/admin-avatar.png",
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  } as SchoolAdmin,

  // Super Admin
  {
    id: "super_admin_1",
    email: "superadmin@ideal.edu",
    firstName: "David",
    lastName: "Anderson",
    role: "super_admin",
    avatar: "/super-admin-avatar.png",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  } as SuperAdmin,
]

// Mock Classes
export const mockClasses: Class[] = [
  {
    id: "class_1",
    name: "Grade 10A",
    level: "10",
    schoolId: "school_1",
    teacherId: "teacher_1",
    studentCount: 25,
  },
  {
    id: "class_2",
    name: "Grade 10B",
    level: "10",
    schoolId: "school_1",
    teacherId: "teacher_2",
    studentCount: 23,
  },
  {
    id: "class_3",
    name: "Grade 11A",
    level: "11",
    schoolId: "school_1",
    teacherId: "teacher_1",
    studentCount: 28,
  },
]

// Mock Subjects
export const mockSubjects: Subject[] = [
  {
    id: "subject_1",
    name: "Mathematics",
    code: "MATH101",
    schoolId: "school_1",
    teacherId: "teacher_1",
  },
  {
    id: "subject_2",
    name: "English Literature",
    code: "ENG101",
    schoolId: "school_1",
    teacherId: "teacher_2",
  },
  {
    id: "subject_3",
    name: "Physics",
    code: "PHY101",
    schoolId: "school_1",
    teacherId: "teacher_1",
  },
  {
    id: "subject_4",
    name: "Chemistry",
    code: "CHEM101",
    schoolId: "school_1",
    teacherId: "teacher_2",
  },
]

// Mock Results
export const mockResults: Result[] = [
  {
    id: "result_1",
    studentId: "student_1",
    subjectId: "subject_1",
    term: "First Term",
    academicYear: "2024/2025",
    score: 85,
    grade: "A",
    remarks: "Excellent performance",
    createdAt: "2024-03-15T00:00:00Z",
  },
  {
    id: "result_2",
    studentId: "student_1",
    subjectId: "subject_2",
    term: "First Term",
    academicYear: "2024/2025",
    score: 78,
    grade: "B+",
    remarks: "Good work",
    createdAt: "2024-03-15T00:00:00Z",
  },
  {
    id: "result_3",
    studentId: "student_1",
    subjectId: "subject_3",
    term: "First Term",
    academicYear: "2024/2025",
    score: 92,
    grade: "A+",
    remarks: "Outstanding",
    createdAt: "2024-03-15T00:00:00Z",
  },
]

// Mock Assignments
export const mockAssignments: Assignment[] = [
  {
    id: "assignment_1",
    title: "Quadratic Equations Practice",
    description: "Solve the given quadratic equations using different methods",
    subjectId: "subject_1",
    classId: "class_1",
    teacherId: "teacher_1",
    dueDate: "2024-04-15T23:59:59Z",
    attachments: ["quadratic_problems.pdf"],
    createdAt: "2024-04-01T00:00:00Z",
  },
  {
    id: "assignment_2",
    title: "Shakespeare Essay",
    description: "Write a 1000-word essay on the themes in Hamlet",
    subjectId: "subject_2",
    classId: "class_1",
    teacherId: "teacher_2",
    dueDate: "2024-04-20T23:59:59Z",
    createdAt: "2024-04-05T00:00:00Z",
  },
  {
    id: "assignment_3",
    title: "Physics Lab Report",
    description: "Submit your lab report on pendulum motion experiment",
    subjectId: "subject_3",
    classId: "class_1",
    teacherId: "teacher_1",
    dueDate: "2024-04-18T23:59:59Z",
    attachments: ["lab_template.docx"],
    createdAt: "2024-04-03T00:00:00Z",
  },
]

// Mock Resources
export const mockResources: Resource[] = [
  {
    id: "resource_1",
    title: "Calculus Fundamentals",
    description: "Introduction to differential and integral calculus",
    type: "pdf",
    url: "/resources/calculus_fundamentals.pdf",
    subjectId: "subject_1",
    teacherId: "teacher_1",
    classIds: ["class_1", "class_3"],
    createdAt: "2024-03-01T00:00:00Z",
  },
  {
    id: "resource_2",
    title: "English Grammar Guide",
    description: "Comprehensive guide to English grammar rules",
    type: "pdf",
    url: "/resources/grammar_guide.pdf",
    subjectId: "subject_2",
    teacherId: "teacher_2",
    classIds: ["class_1", "class_2"],
    createdAt: "2024-03-05T00:00:00Z",
  },
  {
    id: "resource_3",
    title: "Physics Experiment Videos",
    description: "Collection of physics experiment demonstrations",
    type: "video",
    url: "/resources/physics_experiments.mp4",
    subjectId: "subject_3",
    teacherId: "teacher_1",
    classIds: ["class_1", "class_3"],
    createdAt: "2024-03-10T00:00:00Z",
  },
]

// Mock Payment Types
export const mockPaymentTypes: PaymentType[] = [
  {
    id: "payment_type_1",
    name: "School Fees",
    description: "Annual school tuition fees",
    amount: 5000,
    schoolId: "school_1",
    isRecurring: true,
    frequency: "annually",
  },
  {
    id: "payment_type_2",
    name: "Lunch Fees",
    description: "Monthly cafeteria fees",
    amount: 150,
    schoolId: "school_1",
    isRecurring: true,
    frequency: "monthly",
  },
  {
    id: "payment_type_3",
    name: "Field Trip",
    description: "Science museum field trip",
    amount: 75,
    schoolId: "school_1",
    isRecurring: false,
  },
  {
    id: "payment_type_4",
    name: "Sports Equipment",
    description: "Annual sports equipment fee",
    amount: 200,
    schoolId: "school_1",
    isRecurring: true,
    frequency: "annually",
  },
]

// Mock Payments
export const mockPayments: Payment[] = [
  {
    id: "payment_1",
    studentId: "student_1",
    paymentTypeId: "payment_type_1",
    amount: 5000,
    status: "completed",
    dueDate: "2024-03-01T00:00:00Z",
    paidDate: "2024-02-28T00:00:00Z",
    description: "School Fees - Academic Year 2024/2025",
    createdAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "payment_2",
    studentId: "student_1",
    paymentTypeId: "payment_type_2",
    amount: 150,
    status: "pending",
    dueDate: "2024-04-01T00:00:00Z",
    description: "Lunch Fees - April 2024",
    createdAt: "2024-03-15T00:00:00Z",
  },
  {
    id: "payment_3",
    studentId: "student_1",
    paymentTypeId: "payment_type_3",
    amount: 75,
    status: "pending",
    dueDate: "2024-04-10T00:00:00Z",
    description: "Science Museum Field Trip",
    createdAt: "2024-03-20T00:00:00Z",
  },
  {
    id: "payment_4",
    studentId: "student_1",
    paymentTypeId: "payment_type_4",
    amount: 200,
    status: "failed",
    dueDate: "2024-03-15T00:00:00Z",
    description: "Sports Equipment Fee - 2024",
    createdAt: "2024-02-01T00:00:00Z",
  },
]

// Mock Timetable
export const mockTimetable: TimetableEntry[] = [
  {
    id: "timetable_1",
    classId: "class_1",
    subjectId: "subject_1",
    teacherId: "teacher_1",
    dayOfWeek: 1, // Monday
    startTime: "08:00",
    endTime: "09:00",
    room: "Room 101",
  },
  {
    id: "timetable_2",
    classId: "class_1",
    subjectId: "subject_2",
    teacherId: "teacher_2",
    dayOfWeek: 1, // Monday
    startTime: "09:00",
    endTime: "10:00",
    room: "Room 102",
  },
  {
    id: "timetable_3",
    classId: "class_1",
    subjectId: "subject_3",
    teacherId: "teacher_1",
    dayOfWeek: 1, // Monday
    startTime: "10:30",
    endTime: "11:30",
    room: "Lab 1",
  },
  {
    id: "timetable_4",
    classId: "class_1",
    subjectId: "subject_1",
    teacherId: "teacher_1",
    dayOfWeek: 2, // Tuesday
    startTime: "08:00",
    endTime: "09:00",
    room: "Room 101",
  },
  {
    id: "timetable_5",
    classId: "class_1",
    subjectId: "subject_4",
    teacherId: "teacher_2",
    dayOfWeek: 2, // Tuesday
    startTime: "09:00",
    endTime: "10:00",
    room: "Lab 2",
  },
]

// Add missing properties to mock users
;(mockUsers[0] as any).studentId = "STU001"
;(mockUsers[0] as any).classId = "class_1"
;(mockUsers[0] as any).parentIds = ["parent_1"]
;(mockUsers[1] as any).studentId = "STU002"
;(mockUsers[1] as any).classId = "class_1"
;(mockUsers[1] as any).parentIds = ["parent_1"]
;(mockUsers[2] as any).wardIds = ["student_1", "student_2"]
;(mockUsers[3] as any).subjectIds = ["subject_1", "subject_3"]
;(mockUsers[3] as any).classIds = ["class_1", "class_3"]
;(mockUsers[4] as any).subjectIds = ["subject_2", "subject_4"]
;(mockUsers[4] as any).classIds = ["class_1", "class_2"]
