import { useState } from "react";
import { useAdmissionStore } from "@/store/admission-store";
import { AdmissionStatus } from "@/types/index";

export default function AdminAdmissionApproval() {
  const [id, setId] = useState("");
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const { updateAdmissionStatus, loading } = useAdmissionStore();

  const approve = async () => {
    try {
      const res = await updateAdmissionStatus({
        aspirantId: id,
        newStatus: AdmissionStatus.Approved
      });
      setResult(res);
    } catch (error: any) {
      setResult({ success: false, message: error.message });
    }
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

      <button 
        onClick={approve} 
        className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Processing..." : "Approve Application"}
      </button>

      {result && (
        <div className={`mt-4 p-4 border rounded ${result.success ? 'bg-green-100' : 'bg-red-100'}`}>
          <p>{result.message}</p>
        </div>
      )}
    </div>
  );
}
