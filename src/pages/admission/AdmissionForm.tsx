import React, { useState } from "react";
import { useAdmissionStore } from "@/store/admission-store";

type AdmissionFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  address: string;
  previousSchool: string;
};

export default function AdmissionForm() {
  const { apply, loading, application } = useAdmissionStore();
  
  const [form, setForm] = useState<AdmissionFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dob: "",
    address: "",
    previousSchool: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await apply(form);
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Student Admission Form</h2>

      <form onSubmit={submit} className="space-y-4">
        {(Object.keys(form) as (keyof AdmissionFormData)[]).map((key) => (
          <input
            key={key}
            name={key}
            value={form[key]}
            onChange={handleChange}
            placeholder={key}
            className="border p-2 rounded w-full"
            required
          />
        ))}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Submitting..." : "Submit Application"}
        </button>
      </form>

      {application && (
        <div className="mt-4 p-3 bg-green-100 rounded">
          <p>Your Application ID:</p>
          <h3 className="text-xl font-bold">{application.applicationId}</h3>
        </div>
      )}
    </div>
  );
}
