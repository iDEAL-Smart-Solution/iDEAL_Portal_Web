import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { ToastProvider } from '@/components/ui/toast-provider'
import { useAuthStore } from '@/store'

// Import pages
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'

// Dashboard pages
import StudentDashboard from '@/pages/dashboard/student/StudentDashboard'
import StudentAssignments from '@/pages/dashboard/student/StudentAssignments'
import StudentPayments from '@/pages/dashboard/student/StudentPayments'
import StudentResults from '@/pages/dashboard/student/StudentResults'
import StudentTimetable from '@/pages/dashboard/student/StudentTimetable'

import ParentDashboard from '@/pages/dashboard/parent/ParentDashboard'
import ParentPayments from '@/pages/dashboard/parent/ParentPayments'
import ParentResults from '@/pages/dashboard/parent/ParentResults'
import ParentWards from '@/pages/dashboard/parent/ParentWards'

import TeacherDashboard from '@/pages/dashboard/teacher/TeacherDashboard'
import TeacherAssignments from '@/pages/dashboard/teacher/TeacherAssignments'
import TeacherClasses from '@/pages/dashboard/teacher/TeacherClasses'
import TeacherResources from '@/pages/dashboard/teacher/TeacherResources'

import SchoolAdminDashboard from '@/pages/dashboard/school-admin/SchoolAdminDashboard'
import SchoolAdminTimetable from '@/pages/dashboard/school-admin/SchoolAdminTimetable'
import SchoolAdminUsers from '@/pages/dashboard/school-admin/SchoolAdminUsers'

import SuperAdminDashboard from '@/pages/dashboard/super-admin/SuperAdminDashboard'
import SuperAdminSchools from '@/pages/dashboard/super-admin/SuperAdminSchools'

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
          <Route path="/" element={<HomePage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />

          {/* Student routes */}
          <Route path="/dashboard/student" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
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
          <Route path="/dashboard/student/timetable" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentTimetable />
            </ProtectedRoute>
          } />

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
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherDashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/teacher/assignments" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherAssignments />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/teacher/classes" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherClasses />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/teacher/resources" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherResources />
            </ProtectedRoute>
          } />

          {/* School Admin routes */}
          <Route path="/dashboard/school-admin" element={
            <ProtectedRoute allowedRoles={['school_admin']}>
              <SchoolAdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/school-admin/timetable" element={
            <ProtectedRoute allowedRoles={['school_admin']}>
              <SchoolAdminTimetable />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/school-admin/users" element={
            <ProtectedRoute allowedRoles={['school_admin']}>
              <SchoolAdminUsers />
            </ProtectedRoute>
          } />

          {/* Super Admin routes */}
          <Route path="/dashboard/super-admin" element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/super-admin/schools" element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <SuperAdminSchools />
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
