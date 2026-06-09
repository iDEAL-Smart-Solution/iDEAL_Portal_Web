import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmissionStore } from "@/store/admission-store";
import { useAuthStore } from "@/store";
import { CreateAspirantRequest } from "@/types/index";
import { showError, showSuccess } from "@/lib/notifications";
import { resolveMediaUrl } from "@/lib/utils";

type AdmissionFormData = {
  firstName: string;
  lastName: string;
  middleName: string;
  email: string;
  password: string;
  phoneNumber: string;
  gender: string;
  address: string;
  classId: string;
  dateOfBirth: string;
  parentAspirantName: string;
  parentAspirantPhoneNumber: string;
};

export default function AdmissionForm() {
  const navigate = useNavigate();
  const { createAspirant, loading, getAvailableClasses, availableClasses, classesLoading } =
    useAdmissionStore();

  const { publicBranding, isBrandingLoading, fetchPublicBranding } = useAuthStore();
  const currentDomain = window.location.hostname;

  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [form, setForm] = useState<AdmissionFormData>({
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",
    password: "",
    phoneNumber: "",
    gender: "",
    address: "",
    classId: "",
    dateOfBirth: "",
    parentAspirantName: "",
    parentAspirantPhoneNumber: "",
  });

  // Fetch branding if not already loaded
  useEffect(() => {
    if (!publicBranding && !isBrandingLoading) {
      fetchPublicBranding(currentDomain);
    } else if (isBrandingLoading) {
      // Trigger fetch — it's a no-op if already in-flight since it sets isBrandingLoading
      fetchPublicBranding(currentDomain);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Use schoolName from branding (already fetched — no extra DB hit) to get classes.
    // Fall back to subdomain-based lookup only if branding hasn't loaded yet.
    const schoolName = publicBranding?.schoolName
    getAvailableClasses(schoolName ?? undefined).catch((error) => {
      console.error("Failed to load classes:", error);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicBranding?.schoolName]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePicture(e.target.files[0]);
    }
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!profilePicture) {
      showError("Please upload a profile picture");
      return;
    }

    try {
      const requestData: CreateAspirantRequest = {
        ...form,
        dateOfBirth: new Date(form.dateOfBirth),
        profilePicture,
      };

      const res = await createAspirant(requestData);

      if (res.success) {
        showSuccess(res.message || "Application submitted successfully");
        setForm({
          firstName: "",
          lastName: "",
          middleName: "",
          email: "",
          password: "",
          phoneNumber: "",
          gender: "",
          address: "",
          classId: "",
          dateOfBirth: "",
          parentAspirantName: "",
          parentAspirantPhoneNumber: "",
        });
        setProfilePicture(null);
      } else {
        showError(res.message || "Failed to submit application");
      }
    } catch (error: any) {
      showError(error.message || "Failed to submit application");
    }
  };

  const schoolName = publicBranding?.schoolName || "iDEAL School Portal";

  // Shared input class — mirrors login page style
  const inputClass =
    "block w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-text-primary shadow-sm outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100";
  const labelClass = "mb-2 block text-sm font-medium text-text-secondary";

  if (isBrandingLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background-secondary">
        <svg
          className="h-8 w-8 animate-spin text-primary-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-background-secondary text-text-primary">
      <div className="grid h-full gap-4 lg:grid-cols-[0.98fr_1.02fr] p-4 lg:p-6">

        {/* Left panel — school background + branding (same as login) */}
        <section
          className="relative hidden flex-col justify-end overflow-y-auto rounded-2xl text-slate-800 lg:flex"
          style={{
            backgroundImage: publicBranding?.schoolLogoFilePath
              ? `url(${resolveMediaUrl(publicBranding.schoolLogoFilePath)})`
              : undefined,
            backgroundColor: publicBranding?.schoolLogoFilePath ? "transparent" : "#d1d5db",
            backgroundSize: "cover",
            backgroundPosition: "center",
            boxShadow: publicBranding?.schoolLogoFilePath
              ? "8px 0 24px rgba(2,6,23,0.06)"
              : undefined,
          }}
        >
          <div className="relative z-10 max-w-xl space-y-6 p-8 xl:p-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 backdrop-blur-sm">
              {currentDomain}
            </div>
            <div className="space-y-3">
              <p
                className="rounded-lg bg-black/40 px-4 py-3 text-4xl font-semibold tracking-tight text-white xl:text-5xl shadow-lg"
                style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.7)" }}
              >
                {publicBranding?.schoolName || "Start your journey with us"}
              </p>
              <p className="max-w-lg text-base leading-7 text-slate-700">
                Fill in your details below to apply for admission.
              </p>
            </div>
          </div>
        </section>

        {/* Right panel — admission form */}
        <section className="flex items-start justify-center overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="w-full max-w-lg space-y-5">
            <div className="surface overflow-hidden p-6 shadow-medium sm:p-8">

              {/* School logo */}
              {publicBranding?.schoolLogoFilePath && (
                <div className="flex justify-center mb-2">
                  <img
                    src={resolveMediaUrl(publicBranding.schoolLogoFilePath)}
                    alt={schoolName}
                    className="h-14 w-auto object-contain"
                  />
                </div>
              )}

              <div className="space-y-1 text-left mb-6">
                <h2 className="text-3xl font-semibold tracking-tight text-text-primary">
                  Student Admission
                </h2>
                <p className="text-3xl font-semibold tracking-tight text-primary-600">
                  Apply now
                </p>
              </div>

              <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>First Name</label>
                    <input
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      placeholder="First Name"
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Last Name</label>
                    <input
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      placeholder="Last Name"
                      className={inputClass}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Middle Name (Optional)</label>
                  <input
                    name="middleName"
                    value={form.middleName}
                    onChange={handleChange}
                    placeholder="Middle Name"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Email address"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Password</label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Phone Number</label>
                  <input
                    name="phoneNumber"
                    value={form.phoneNumber}
                    onChange={handleChange}
                    placeholder="Phone Number"
                    className={inputClass}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Gender (Optional)</label>
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Date of Birth</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={form.dateOfBirth}
                      onChange={handleChange}
                      className={inputClass}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Address (Optional)</label>
                  <input
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Address"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Class</label>
                  <select
                    name="classId"
                    value={form.classId}
                    onChange={handleChange}
                    className={inputClass}
                    required
                    disabled={classesLoading}
                  >
                    <option value="">
                      {classesLoading ? "Loading classes..." : "Select a class"}
                    </option>
                    {availableClasses.map((classOption) => (
                      <option key={classOption.id} value={classOption.id}>
                        {classOption.name}
                      </option>
                    ))}
                  </select>
                  {availableClasses.length === 0 && !classesLoading && (
                    <p className="text-xs text-red-500 mt-1">No classes available</p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>Profile Picture</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Parent / Guardian Name</label>
                  <input
                    name="parentAspirantName"
                    value={form.parentAspirantName}
                    onChange={handleChange}
                    placeholder="Parent or Guardian full name"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Parent / Guardian Phone</label>
                  <input
                    name="parentAspirantPhoneNumber"
                    value={form.parentAspirantPhoneNumber}
                    onChange={handleChange}
                    placeholder="Parent or Guardian phone number"
                    className={inputClass}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-primary-500 px-4 py-3 text-sm font-medium text-white shadow-primary transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <span className="flex items-center gap-3">
                      <svg
                        className="h-5 w-5 animate-spin text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    "Submit Application"
                  )}
                </button>

                <div className="pt-1 text-center">
                  <p className="text-sm text-text-secondary">Already have an account?</p>
                  <button
                    type="button"
                    onClick={() => navigate("/auth/login")}
                    className="mt-2 inline-flex w-full items-center justify-center rounded-xl border border-primary-200 bg-white px-4 py-3 text-sm font-medium text-primary-700 transition hover:bg-primary-50"
                  >
                    Sign in instead
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
