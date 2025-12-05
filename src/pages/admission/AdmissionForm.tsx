import React, { useState, useEffect } from "react";
import { useAdmissionStore } from "@/store/admission-store";
import { CreateAspirantRequest } from "@/types/index";

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
  const { createAspirant, loading, getAvailableClasses, availableClasses, classesLoading } = useAdmissionStore();
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);

  // Fetch available classes on component mount
  useEffect(() => {
    getAvailableClasses().catch((error) => {
      console.error("Failed to load classes:", error);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      setResult({ success: false, message: "Please upload a profile picture" });
      return;
    }

    try {
      const requestData: CreateAspirantRequest = {
        ...form,
        dateOfBirth: new Date(form.dateOfBirth),
        profilePicture: profilePicture
      };
      
      const res = await createAspirant(requestData);
      setResult(res);
      
      if (res.success) {
        // Reset form on success
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
      }
    } catch (error: any) {
      setResult({ success: false, message: error.message });
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Student Admission Form</h2>

      <form onSubmit={submit} className="space-y-4">
        <input
          name="firstName"
          value={form.firstName}
          onChange={handleChange}
          placeholder="First Name"
          className="border p-2 rounded w-full"
          required
        />
        <input
          name="lastName"
          value={form.lastName}
          onChange={handleChange}
          placeholder="Last Name"
          className="border p-2 rounded w-full"
          required
        />
        <input
          name="middleName"
          value={form.middleName}
          onChange={handleChange}
          placeholder="Middle Name (Optional)"
          className="border p-2 rounded w-full"
        />
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          className="border p-2 rounded w-full"
          required
        />
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
          className="border p-2 rounded w-full"
          required
        />
        <input
          name="phoneNumber"
          value={form.phoneNumber}
          onChange={handleChange}
          placeholder="Phone Number"
          className="border p-2 rounded w-full"
          required
        />
        <select
          name="gender"
          value={form.gender}
          onChange={handleChange}
          className="border p-2 rounded w-full"
        >
          <option value="">Select Gender (Optional)</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
        <input
          name="address"
          value={form.address}
          onChange={handleChange}
          placeholder="Address (Optional)"
          className="border p-2 rounded w-full"
        />
        <div>
          <label className="block mb-2 font-medium">Select Class</label>
          <select
            name="classId"
            value={form.classId}
            onChange={handleChange}
            className="border p-2 rounded w-full"
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
            <p className="text-sm text-red-600 mt-1">No classes available</p>
          )}
        </div>
        <input
          type="date"
          name="dateOfBirth"
          value={form.dateOfBirth}
          onChange={handleChange}
          placeholder="Date of Birth"
          className="border p-2 rounded w-full"
          required
        />
        <div>
          <label className="block mb-2 font-medium">Profile Picture</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="border p-2 rounded w-full"
            required
          />
        </div>
        <input
          name="parentAspirantName"
          value={form.parentAspirantName}
          onChange={handleChange}
          placeholder="Parent/Guardian Name"
          className="border p-2 rounded w-full"
          required
        />
        <input
          name="parentAspirantPhoneNumber"
          value={form.parentAspirantPhoneNumber}
          onChange={handleChange}
          placeholder="Parent/Guardian Phone"
          className="border p-2 rounded w-full"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50 w-full"
        >
          {loading ? "Submitting..." : "Submit Application"}
        </button>
      </form>

      {result && (
        <div className={`mt-4 p-3 rounded ${result.success ? 'bg-green-100' : 'bg-red-100'}`}>
          <p>{result.message}</p>
        </div>
      )}
    </div>
  );
}
