import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { ToastProvider } from '@/components/ui/toast-provider'
import { useAuthStore } from '@/store'

// Import pages
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import AdmissionForm from '@/pages/admission/AdmissionForm'
import ApplicationStatus from '@/pages/admission/ApplicationStatus'
import AdminAdmissionApproval from '@/pages/admission/AdminAdmissionApproval'

// Dashboard pages
import StudentDashboard from '@/pages/dashboard/student/StudentDashboard'
import StudentAssignments from '@/pages/dashboard/student/StudentAssignments'
import StudentPayments from '@/pages/dashboard/student/StudentPayments'
import StudentResults from '@/pages/dashboard/student/StudentResults'
import StudentReportCard from '@/pages/dashboard/student/StudentReportCard'
import StudentTimetable from '@/pages/dashboard/student/StudentTimetable'
import StudentResources from '@/pages/dashboard/student/StudentResources'

import ParentDashboard from '@/pages/dashboard/parent/ParentDashboard'
import ParentPayments from '@/pages/dashboard/parent/ParentPayments'
import ParentResults from '@/pages/dashboard/parent/ParentResults'
import ParentWards from '@/pages/dashboard/parent/ParentWards'

import TeacherDashboard from '@/pages/dashboard/teacher/TeacherDashboard'
import TeacherAssignments from '@/pages/dashboard/teacher/TeacherAssignments'
import TeacherClasses from '@/pages/dashboard/teacher/TeacherClasses'
import TeacherResources from '@/pages/dashboard/teacher/TeacherResources'
import TeacherSubjects from './pages/dashboard/teacher/TeacherSubjects'
import TeacherResults from '@/pages/dashboard/teacher/TeacherResults'

import AspirantDashboard from '@/pages/dashboard/aspirant/AspirantDashboard'

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles
}) => {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <ErrorBoundary>
      <div className="h-full">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />

          {/* Student routes */}
          <Route path="/dashboard/student" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/student/resources" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentResources />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/student/assignments" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentAssignments />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/student/payments" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentPayments />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/student/results" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentResults />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/student/report-card" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentReportCard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/student/timetable" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentTimetable />
            </ProtectedRoute>
          } />
          {/* admission route */}
          <Route path="/admission/apply" element={<AdmissionForm />} />
          <Route path="/admission/status" element={<ApplicationStatus />} />

          {/* Admin */}
          <Route path="/admin/admission" element={<AdminAdmissionApproval />} />


          {/* Parent routes */}
          <Route path="/dashboard/parent" element={
            <ProtectedRoute allowedRoles={['parent']}>
              <ParentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/parent/payments" element={
            <ProtectedRoute allowedRoles={['parent']}>
              <ParentPayments />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/parent/results" element={
            <ProtectedRoute allowedRoles={['parent']}>
              <ParentResults />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/parent/wards" element={
            <ProtectedRoute allowedRoles={['parent']}>
              <ParentWards />
            </ProtectedRoute>
          } />

          {/* Teacher routes */}
          <Route path="/dashboard/teacher" element={
            <ProtectedRoute allowedRoles={['staff']}>
              <TeacherDashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/teacher/subjects" element={
            <ProtectedRoute allowedRoles={['staff']}>
              <TeacherSubjects />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/teacher/assignments" element={
            <ProtectedRoute allowedRoles={['staff']}>
              <TeacherAssignments />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/teacher/classes" element={
            <ProtectedRoute allowedRoles={['staff']}>
              <TeacherClasses />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/teacher/resources" element={
            <ProtectedRoute allowedRoles={['staff']}>
              <TeacherResources />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/teacher/results" element={
            <ProtectedRoute allowedRoles={['staff']}>
              <TeacherResults />
            </ProtectedRoute>
          } />

          {/* Aspirant routes */}
          <Route path="/dashboard/aspirant" element={
            <ProtectedRoute allowedRoles={['aspirant']}>
              <AspirantDashboard />
            </ProtectedRoute>
          } />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ToastProvider />
      </div>
    </ErrorBoundary>
  )
}

export default App
