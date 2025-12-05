import { useState } from "react";
import { useAdmissionStore } from "@/store/admission-store";
import { AdmissionStatus } from "@/types/index";

export default function ApplicationStatus() {
  const [searchType, setSearchType] = useState<"id" | "uin">("id");
  const [searchValue, setSearchValue] = useState("");
  const { selectedAspirant, getAspirantById, getAspirantByUin, loading, error } = useAdmissionStore();

  const checkStatus = async () => {
    try {
      if (searchType === "id") {
        await getAspirantById(searchValue);
      } else {
        await getAspirantByUin(searchValue);
      }
    } catch (err) {
      console.error("Failed to fetch aspirant:", err);
    }
  };

  const getStatusText = (status: AdmissionStatus) => {
    switch (status) {
      case AdmissionStatus.Pending:
        return "Pending";
      case AdmissionStatus.Approved:
        return "Approved";
      case AdmissionStatus.Rejected:
        return "Rejected";
      case AdmissionStatus.Migrated:
        return "Migrated";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold">Check Application Status</h2>

      <div className="my-3">
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value as "id" | "uin")}
          className="border p-2 rounded w-full mb-2"
        >
          <option value="id">Search by ID</option>
          <option value="uin">Search by UIN</option>
        </select>

        <input
          placeholder={`Enter ${searchType === "id" ? "Application ID" : "UIN"}`}
          className="border p-2 rounded w-full"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </div>

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        onClick={checkStatus}
        disabled={loading || !searchValue}
      >
        {loading ? "Checking..." : "Check"}
      </button>

      {error && (
        <div className="mt-4 p-4 border rounded bg-red-100 text-red-700">
          <p>{error}</p>
        </div>
      )}

      {selectedAspirant && !error && (
        <div className="mt-4 p-4 border rounded bg-white shadow">
          <h3 className="font-semibold text-lg mb-2">Aspirant Details</h3>
          <p><strong>UIN:</strong> {selectedAspirant.uin}</p>
          <p><strong>Name:</strong> {selectedAspirant.fullName}</p>
          <p><strong>Email:</strong> {selectedAspirant.email}</p>
          <p><strong>Phone:</strong> {selectedAspirant.phoneNumber}</p>
          {selectedAspirant.className && <p><strong>Class:</strong> {selectedAspirant.className}</p>}
          <p className="mt-2">
            <strong>Status: </strong>
            <span className={`font-bold ${
              selectedAspirant.admissionStatus === AdmissionStatus.Approved ? 'text-green-600' :
              selectedAspirant.admissionStatus === AdmissionStatus.Rejected ? 'text-red-600' :
              selectedAspirant.admissionStatus === AdmissionStatus.Migrated ? 'text-blue-600' :
              'text-yellow-600'
            }`}>
              {getStatusText(selectedAspirant.admissionStatus)}
            </span>
          </p>
          <p><strong>Applied:</strong> {new Date(selectedAspirant.createdAt).toLocaleDateString()}</p>
        </div>
      )}
    </div>
  );
}
