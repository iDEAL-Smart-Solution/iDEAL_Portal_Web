import api from "./api"; // axios instance

export interface AdmissionPayload {
  fullName: string;
  email: string;
  phone: string;
  classApplied: string;
  dob: string;
}

const admissionService = {
  apply: (payload: AdmissionPayload) =>
    api.post("/admission/apply", payload).then((res) => res.data),

  uploadDocs: (id: string, formData: FormData) =>
    api.post(`/admission/upload-docs/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((res) => res.data),

  status: (id: string) =>
    api.get(`/admission/status/${id}`).then((res) => res.data),

  approve: (id: string) =>
    api.put(`/admin/admission/approve/${id}`).then((res) => res.data),
};

export default admissionService;
