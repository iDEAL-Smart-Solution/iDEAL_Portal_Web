import admissionService from "@/services/admission-service";
import { useState } from "react";

export default function AdminAdmissionApproval() {
  const [id, setId] = useState("");
  const [result, setResult] = useState<{ studentId: string } | null>(null);

  const approve = async () => {
    const res = await admissionService.approve(id);
    setResult(res);
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold">Admission Approval</h2>

      <input
        placeholder="Application ID"
        className="border p-2 rounded w-full my-3"
        value={id}
        onChange={(e) => setId(e.target.value)}
      />

      <button onClick={approve} className="bg-green-600 text-white px-4 py-2 rounded">
        Approve Application
      </button>

      {result && (
        <div className="mt-4 p-4 border rounded bg-green-100">
          <p>Approved Successfully!</p>
          <p>Student ID: <strong>{result.studentId}</strong></p>
        </div>
      )}
    </div>
  );
}
