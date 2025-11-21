import { create } from "zustand";
import { AdmissionApplication, AdmissionFormData } from "@/types/index";
import admissionService from "@/services/admission-service";

interface AdmissionState {
  loading: boolean;
  application?: AdmissionApplication;
  apply: (data: AdmissionFormData) => Promise<void>;
  checkStatus: (id: string) => Promise<void>;
}

export const useAdmissionStore = create<AdmissionState>((set) => ({
  loading: false,

  apply: async (data) => {
    set({ loading: true });
    const res = await admissionService.apply(data);
    set({ application: res, loading: false });
  },

  checkStatus: async (id) => {
    set({ loading: true });
    const res = await admissionService.status(id);
    set({ application: res, loading: false });
  }
}));
