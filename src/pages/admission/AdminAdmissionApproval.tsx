import { useState } from "react";
import { useAdmissionStore } from "@/store/admission-store";
import { AdmissionStatus } from "@/types/index";
import { showError, showSuccess } from "@/lib/notifications";

export default function AdminAdmissionApproval() {
  const [id, setId] = useState("");
  const { updateAdmissionStatus, loading } = useAdmissionStore();

  const approve = async () => {
    try {
      const res = await updateAdmissionStatus({
        aspirantId: id,
        newStatus: AdmissionStatus.Approved
      });
      if (res.success) {
        showSuccess(res.message || "Application approved successfully");
      } else {
        showError(res.message || "Failed to approve application");
      }
    } catch (error: any) {
      showError(error.message || "Failed to approve application");
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
    </div>
  );
}
