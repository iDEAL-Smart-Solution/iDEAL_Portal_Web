import React, { useEffect, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { useAuthStore } from "@/store"
import { showError } from "@/lib/notifications"
import { resolveMediaUrl } from "@/lib/utils"
import type { UserRole } from "@/types"

export default function RegisterPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { register, isLoading, error, clearError, publicBranding, isBrandingLoading, fetchPublicBranding } = useAuthStore()
  const roleParam = searchParams.get("role")
  const isParentRegistration = roleParam === "parent"
  const currentDomain = window.location.hostname

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    address: "",
    gender: "",
    role: (roleParam as UserRole) || ("" as UserRole | ""),
    schoolId: "school_1",
  })
  const [registrationResult, setRegistrationResult] = useState<{ parentUin: string; message: string } | null>(null)

  useEffect(() => {
    if (!publicBranding && !isBrandingLoading) fetchPublicBranding(currentDomain)
  }, [])

  useEffect(() => {
    if (roleParam && ["student", "parent", "teacher", "aspirant"].includes(roleParam)) {
      setFormData((previous) => ({ ...previous, role: roleParam as UserRole }))
    }
  }, [roleParam])

  useEffect(() => {
    if (error) showError(error)
  }, [error])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    clearError()
    if (formData.password !== formData.confirmPassword) {
      showError("Passwords do not match")
      return
    }
    if (!formData.role) {
      showError("Please select a role")
      return
    }

    try {
      const result = await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
        schoolId: formData.schoolId,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        gender: formData.gender,
      })
      if (result) setRegistrationResult(result)
    } catch {
      // Registration errors are shown by the auth store.
    }
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((previous) => ({ ...previous, [event.target.name]: event.target.value }))
  }

  const schoolName = publicBranding?.schoolName || "iDEAL School Portal"
  const inputClass = "block w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-text-primary shadow-sm outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
  const labelClass = "mb-2 block text-sm font-medium text-text-secondary"

  if (isBrandingLoading) {
    return <div className="flex h-screen items-center justify-center bg-background-secondary">
      <svg className="h-8 w-8 animate-spin text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-label="Loading school theme">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l-2.647-2.647z" />
      </svg>
    </div>
  }

  return (
    <div className="h-screen overflow-hidden bg-background-secondary text-text-primary">
      <div className="grid h-full gap-4 p-4 lg:grid-cols-[0.98fr_1.02fr] lg:p-6">
        <section
          className="relative hidden flex-col justify-end overflow-y-auto rounded-2xl text-slate-800 lg:flex"
          style={{
            backgroundImage: publicBranding?.schoolLogoFilePath ? `url(${resolveMediaUrl(publicBranding.schoolLogoFilePath)})` : undefined,
            backgroundColor: publicBranding?.schoolLogoFilePath ? "transparent" : "#d1d5db",
            backgroundSize: "cover",
            backgroundPosition: "center",
            boxShadow: publicBranding?.schoolLogoFilePath ? "8px 0 24px rgba(2,6,23,0.06)" : undefined,
          }}
        >
          <div className="relative z-10 max-w-xl space-y-6 p-8 xl:p-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 backdrop-blur-sm">{currentDomain}</div>
            <div className="space-y-3">
              <p className="rounded-lg bg-black/40 px-4 py-3 text-4xl font-semibold tracking-tight text-white shadow-lg xl:text-5xl" style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.7)" }}>{schoolName}</p>
              <p className="max-w-lg text-base leading-7 text-slate-700">Create your parent account to access information for children verified by your school.</p>
            </div>
          </div>
        </section>

        <section className="flex items-start justify-center overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="w-full max-w-lg">
            <div className="surface overflow-hidden p-6 shadow-medium sm:p-8">
              {publicBranding?.schoolLogoFilePath && <div className="mb-2 flex justify-center"><img src={resolveMediaUrl(publicBranding.schoolLogoFilePath)} alt={schoolName} className="h-14 w-auto object-contain" /></div>}
              <div className="mb-6 space-y-1">
                <h1 className="text-3xl font-semibold tracking-tight text-text-primary">{isParentRegistration ? "Parent Account" : "Create Account"}</h1>
                <p className="text-3xl font-semibold tracking-tight text-primary-600">Register now</p>
                {isParentRegistration && <p className="pt-2 text-sm leading-6 text-text-secondary">Your school will verify and link your child before their information is shown.</p>}
              </div>

              {registrationResult ? (
                <div className="space-y-5 rounded-xl border border-primary-200 bg-primary-50 p-5">
                  <div>
                    <h2 className="text-xl font-semibold text-text-primary">Parent account created</h2>
                    <p className="mt-2 text-sm leading-6 text-text-secondary">{registrationResult.message}</p>
                  </div>
                  <div className="rounded-lg border border-primary-200 bg-white p-4">
                    <p className="text-sm text-text-secondary">Your parent login ID</p>
                    <p className="mt-1 break-all text-lg font-semibold text-primary-700">{registrationResult.parentUin}</p>
                    <p className="mt-2 text-xs text-text-secondary">Keep this ID. You will use it with your password to sign in.</p>
                  </div>
                  <button type="button" onClick={() => navigate("/auth/login", { state: { registrationComplete: true } })} className="inline-flex w-full items-center justify-center rounded-xl bg-primary-500 px-4 py-3 text-sm font-medium text-white shadow-primary transition hover:bg-primary-600">Continue to Sign In</button>
                </div>
              ) : <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelClass} htmlFor="firstName">First Name</label><input id="firstName" name="firstName" autoComplete="given-name" placeholder="First Name" value={formData.firstName} onChange={handleChange} className={inputClass} required /></div>
                  <div><label className={labelClass} htmlFor="lastName">Last Name</label><input id="lastName" name="lastName" autoComplete="family-name" placeholder="Last Name" value={formData.lastName} onChange={handleChange} className={inputClass} required /></div>
                </div>
                <div><label className={labelClass} htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="email" placeholder="Email address" value={formData.email} onChange={handleChange} className={inputClass} required /></div>

                {isParentRegistration && <>
                  <div><label className={labelClass} htmlFor="phoneNumber">Phone Number</label><input id="phoneNumber" name="phoneNumber" type="tel" autoComplete="tel" placeholder="Phone Number" value={formData.phoneNumber} onChange={handleChange} className={inputClass} required /></div>
                  <div><label className={labelClass} htmlFor="address">Address</label><input id="address" name="address" autoComplete="street-address" placeholder="Home address" value={formData.address} onChange={handleChange} className={inputClass} required /></div>
                  <div><label className={labelClass} htmlFor="gender">Gender (Optional)</label><select id="gender" name="gender" value={formData.gender} onChange={handleChange} className={inputClass}><option value="">Select gender</option><option value="Female">Female</option><option value="Male">Male</option><option value="Prefer not to say">Prefer not to say</option></select></div>
                </>}

                {!isParentRegistration && <div>
                  <label className={labelClass} htmlFor="role">Role</label>
                  <select id="role" name="role" value={formData.role} onChange={(event) => setFormData((previous) => ({ ...previous, role: event.target.value as UserRole }))} className={inputClass} required>
                    <option value="">Select your role</option><option value="student">Student</option><option value="parent">Parent</option><option value="teacher">Teacher</option><option value="aspirant">Aspirant</option>
                  </select>
                </div>}

                <div><label className={labelClass} htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete="new-password" placeholder="Create a password" value={formData.password} onChange={handleChange} className={inputClass} required /></div>
                <div><label className={labelClass} htmlFor="confirmPassword">Confirm Password</label><input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" placeholder="Confirm your password" value={formData.confirmPassword} onChange={handleChange} className={inputClass} required /></div>

                <button type="submit" disabled={isLoading} className="inline-flex w-full items-center justify-center rounded-xl bg-primary-500 px-4 py-3 text-sm font-medium text-white shadow-primary transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60">
                  {isLoading ? "Creating Account..." : isParentRegistration ? "Register Parent Account" : "Create Account"}
                </button>
                <div className="pt-1 text-center"><p className="text-sm text-text-secondary">Already have an account?</p><Link to="/auth/login" className="mt-2 inline-flex w-full items-center justify-center rounded-xl border border-primary-200 bg-white px-4 py-3 text-sm font-medium text-primary-700 transition hover:bg-primary-50">Sign in instead</Link></div>
              </form>}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
