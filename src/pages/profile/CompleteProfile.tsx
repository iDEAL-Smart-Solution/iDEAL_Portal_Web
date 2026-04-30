import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore, useProfileStore } from '@/store'
import { showError } from '@/lib/notifications'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

type FormKey =
  | 'phoneNumber'
  | 'address'
  | 'gender'
  | 'dateOfBirth'
  | 'sessionAdmitted'
  | 'birthCertificate'
  | 'previousResult'
  | 'profilePicture'

type FieldConfig = {
  label: string
  type: 'text' | 'tel' | 'date' | 'file' | 'select'
  placeholder?: string
  optional?: boolean
}

const fieldConfig: Record<FormKey, FieldConfig> = {
  phoneNumber: { label: 'Phone Number', type: 'tel' },
  address: { label: 'Address', type: 'text' },
  gender: { label: 'Gender', type: 'select', placeholder: 'Select gender' },
  dateOfBirth: { label: 'Date of Birth', type: 'date' },
  sessionAdmitted: { label: 'Session Admitted', type: 'text', placeholder: 'e.g., 2024/2025' },
  birthCertificate: { label: 'Birth Certificate', type: 'file' },
  previousResult: { label: 'Previous Result', type: 'file' },
  profilePicture: { label: 'Profile Picture', type: 'file', optional: true },
}

const genderOptions = ['Male', 'Female', 'Other']

const normalizeMissingField = (field: string): FormKey | null => {
  const normalized = field.trim().toLowerCase()

  switch (normalized) {
    case 'phonenumber':
      return 'phoneNumber'
    case 'address':
      return 'address'
    case 'gender':
      return 'gender'
    case 'dateofbirth':
      return 'dateOfBirth'
    case 'sessionadmitted':
      return 'sessionAdmitted'
    case 'birthcertificateurl':
      return 'birthCertificate'
    case 'previousresulturl':
      return 'previousResult'
    case 'profilepicture':
      return 'profilePicture'
    default:
      return null
  }
}

export default function CompleteProfile() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { completeProfile } = useProfileStore()
  const [formData, setFormData] = useState<Record<FormKey, string | File | null>>({
    phoneNumber: '',
    address: '',
    gender: '',
    dateOfBirth: '',
    sessionAdmitted: '',
    birthCertificate: null,
    previousResult: null,
    profilePicture: null,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [missingFields, setMissingFields] = useState<FormKey[]>([])
  const [imagePreviews, setImagePreviews] = useState<Partial<Record<FormKey, string>>>({})

  const userRole = user?.role?.toLowerCase() || ''

  useEffect(() => {
    if (!user) {
      navigate('/auth/login')
      return
    }

    const mappedMissing = (user.missingProfileFields || [])
      .map(normalizeMissingField)
      .filter((field: FormKey | null): field is FormKey => Boolean(field))

    const sessionMissing = (() => {
      try {
        const authData = sessionStorage.getItem('auth-response')
        if (!authData) return [] as FormKey[]

        const parsed = JSON.parse(authData)
        return (parsed.missingProfileFields || [])
          .map(normalizeMissingField)
          .filter((field: FormKey | null): field is FormKey => Boolean(field))
      } catch {
        return [] as FormKey[]
      }
    })()

    const nextMissing = mappedMissing.length > 0 ? mappedMissing : sessionMissing
    setMissingFields(Array.from(new Set(nextMissing)))

    setFormData((current) => ({
      ...current,
      phoneNumber: ((user as any).phoneNumber || '') as string,
      gender: ((user as any).gender || '') as string,
    }))
  }, [user, navigate])

  const visibleFields = missingFields

  if (!user) return null

  const handleInputChange = (field: FormKey, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (field: FormKey, file: File | null) => {
    setImagePreviews((prev) => {
      const currentPreview = prev[field]
      if (currentPreview) {
        URL.revokeObjectURL(currentPreview)
      }

      if (file && file.type.startsWith('image/')) {
        return { ...prev, [field]: URL.createObjectURL(file) }
      }

      const next = { ...prev }
      delete next[field]
      return next
    })

    setFormData((prev) => ({ ...prev, [field]: file }))
  }

  useEffect(() => {
    return () => {
      Object.values(imagePreviews).forEach((preview) => {
        if (preview) {
          URL.revokeObjectURL(preview)
        }
      })
    }
  }, [imagePreviews])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const basePayload = {
        phoneNumber: String(formData.phoneNumber || ''),
        address: String(formData.address || ''),
        gender: String(formData.gender || ''),
        profilePicture: formData.profilePicture instanceof File ? formData.profilePicture : null,
      }

      if (userRole === 'student') {
        const requiredStudentFields: FormKey[] = [
          'phoneNumber',
          'address',
          'gender',
          'dateOfBirth',
          'sessionAdmitted',
          'birthCertificate',
          'previousResult',
        ]

        for (const field of requiredStudentFields) {
          const value = formData[field]
          if (value === null || value === undefined || value === '') {
            showError(`${fieldConfig[field].label} is required`)
            setIsSubmitting(false)
            return
          }
        }

        const response = await completeProfile({
          userRole: 'student',
          formData: {
            ...basePayload,
            dateOfBirth: String(formData.dateOfBirth || ''),
            sessionAdmitted: String(formData.sessionAdmitted || ''),
            birthCertificate: formData.birthCertificate as File,
            previousResult: formData.previousResult as File,
          },
        })

        if (response.success) {
          useAuthStore.setState({ user: { ...user, isProfileComplete: true, missingProfileFields: [] } })
          navigate('/dashboard/student')
          return
        }

        showError(response.message || 'Failed to update profile')
      } else if (userRole === 'staff') {
        const requiredStaffFields: FormKey[] = ['phoneNumber', 'address', 'gender']

        for (const field of requiredStaffFields) {
          const value = formData[field]
          if (value === null || value === undefined || value === '') {
            showError(`${fieldConfig[field].label} is required`)
            setIsSubmitting(false)
            return
          }
        }

        const response = await completeProfile({
          userRole: 'staff',
          formData: basePayload,
        })

        if (response.success) {
          useAuthStore.setState({ user: { ...user, isProfileComplete: true, missingProfileFields: [] } })
          navigate('/dashboard/staff')
          return
        }

        showError(response.message || 'Failed to update profile')
      } else {
        showError('Profile completion is only available for student and staff accounts')
        setIsSubmitting(false)
        return
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'An error occurred while updating profile'
      showError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader className="border-b border-neutral-200">
            <CardTitle className="text-2xl text-primary-500">Complete Your Profile</CardTitle>
            <CardDescription className="text-text-tertiary">
              Please provide the required information to complete your account setup.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {visibleFields.map((field) => {
                const config = fieldConfig[field]
                if (!config) return null

                if (config.type === 'select') {
                  return (
                    <div key={field} className="flex flex-col space-y-2">
                      <label className="text-sm font-medium text-text-primary">{config.label}</label>
                      <select
                        value={String(formData[field] || '')}
                        onChange={(e) => handleInputChange(field, e.target.value)}
                        className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black bg-white"
                      >
                        <option value="">{config.placeholder}</option>
                        {genderOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  )
                }

                if (config.type === 'file') {
                  return (
                    <div key={field} className="flex flex-col space-y-2">
                      <label className="text-sm font-medium text-text-primary">
                        {config.label}
                        {config.optional ? (
                          <span className="text-neutral-500 font-normal ml-1">(Optional)</span>
                        ) : null}
                      </label>
                      <input
                        type="file"
                        onChange={(e) => handleFileChange(field, e.target.files?.[0] || null)}
                        className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                      />
                      {imagePreviews[field] ? (
                        <img
                          src={imagePreviews[field]}
                          alt={`${config.label} preview`}
                          className="w-16 h-16 rounded-full object-cover border border-neutral-300"
                        />
                      ) : null}
                    </div>
                  )
                }

                return (
                  <div key={field} className="flex flex-col space-y-2">
                    <label className="text-sm font-medium text-text-primary">{config.label}</label>
                    <input
                      type={config.type}
                      value={String(formData[field] || '')}
                      onChange={(e) => handleInputChange(field, e.target.value)}
                      placeholder={config.placeholder || ''}
                      className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black placeholder-neutral-500"
                    />
                  </div>
                )
              })}

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting || visibleFields.length === 0}
                  className="flex-1 h-11 rounded-lg bg-primary-500 text-white font-semibold shadow-sm hover:bg-primary-600 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner /> Saving...
                    </>
                  ) : (
                    'Complete Profile'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
