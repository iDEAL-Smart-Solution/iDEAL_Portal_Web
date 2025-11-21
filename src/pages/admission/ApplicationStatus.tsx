import { useState } from "react";
import { useAdmissionStore } from "@/store/admission-store";

export default function ApplicationStatus() {
  const [id, setId] = useState("");
  const { application, checkStatus } = useAdmissionStore();

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold">Check Application Status</h2>

      <input
        placeholder="Enter Application ID"
        className="border p-2 rounded w-full my-3"
        value={id}
        onChange={(e) => setId(e.target.value)}
      />

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={() => checkStatus(id)}
      >
        Check
      </button>

      {application && (
        <div className="mt-4 p-4 border rounded">
          <p>Status: <strong>{application.status}</strong></p>
          {application.studentId && (
            <p>Student ID: <strong>{application.studentId}</strong></p>
          )}
        </div>
      )}
    </div>
  );
}
