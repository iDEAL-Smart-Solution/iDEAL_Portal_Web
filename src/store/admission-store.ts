import { create } from "zustand";
import axiosInstance from "@/services/api";
import { 
  CreateAspirantRequest, 
  GetAspirantResponse, 
  AspirantFilter,
  UpdateAdmissionStatusRequest,
  ClassOption
} from "@/types/index";

interface AdmissionState {
  loading: boolean;
  error: string | null;
  aspirants: GetAspirantResponse[];
  selectedAspirant: GetAspirantResponse | null;
  availableClasses: ClassOption[];
  classesLoading: boolean;
  
  // Actions
  createAspirant: (data: CreateAspirantRequest) => Promise<{ success: boolean; message: string }>;
  getAllAspirants: () => Promise<void>;
  getAspirantById: (id: string) => Promise<void>;
  getAspirantByUin: (uin: string) => Promise<void>;
  getFilteredAspirants: (filter: AspirantFilter) => Promise<void>;
  updateAdmissionStatus: (request: UpdateAdmissionStatusRequest) => Promise<{ success: boolean; message: string }>;
  migrateApprovedAspirants: () => Promise<{ success: boolean; message: string }>;
  getAvailableClasses: () => Promise<void>;
  clearError: () => void;
}

export const useAdmissionStore = create<AdmissionState>((set) => ({
  loading: false,
  error: null,
  aspirants: [],
  selectedAspirant: null,
  availableClasses: [],
  classesLoading: false,

  createAspirant: async (data) => {
    set({ loading: true, error: null });
    try {
      const formData = new FormData();
      formData.append("firstName", data.firstName);
      formData.append("lastName", data.lastName);
      if (data.middleName) formData.append("middleName", data.middleName);
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("phoneNumber", data.phoneNumber);
      if (data.gender) formData.append("gender", data.gender);
      if (data.address) formData.append("address", data.address);
      formData.append("classId", data.classId);
      formData.append("dateOfBirth", data.dateOfBirth.toISOString());
      formData.append("profilePicture", data.profilePicture);
      formData.append("parentAspirantName", data.parentAspirantName);
      formData.append("parentAspirantPhoneNumber", data.parentAspirantPhoneNumber);

      const response = await axiosInstance.post("/Aspirant/create-aspirant", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      set({ loading: false });
      return { success: response.data.success, message: response.data.message };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to create aspirant";
      set({ loading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  getAllAspirants: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get<{ data: GetAspirantResponse[] }>("/Aspirant/get-all-aspirants");
      set({ aspirants: response.data.data, loading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to fetch aspirants";
      set({ loading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  getAspirantById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get<{ data: GetAspirantResponse }>(
        `/Aspirant/get-aspirant-with-id?id=${id}`
      );
      set({ selectedAspirant: response.data.data, loading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to fetch aspirant";
      set({ loading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  getAspirantByUin: async (uin) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get<{ data: GetAspirantResponse }>(
        `/Aspirant/get-aspirant-with-uin?uin=${uin}`
      );
      set({ selectedAspirant: response.data.data, loading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to fetch aspirant";
      set({ loading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  getFilteredAspirants: async (filter) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (filter.gender) params.append("gender", filter.gender);
      if (filter.classId) params.append("classId", filter.classId);
      if (filter.search) params.append("search", filter.search);
      if (filter.fromDate) params.append("fromDate", filter.fromDate);
      if (filter.toDate) params.append("toDate", filter.toDate);
      if (filter.admissionStatus !== undefined) params.append("admissionStatus", filter.admissionStatus.toString());

      const response = await axiosInstance.get<{ data: GetAspirantResponse[] }>(
        `/Aspirant/get-aspirants-with-filter?${params.toString()}`
      );
      set({ aspirants: response.data.data, loading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to filter aspirants";
      set({ loading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  updateAdmissionStatus: async (request) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.patch("/Aspirant/update-admission-status", {
        aspirantId: request.aspirantId,
        newStatus: request.newStatus
      });
      
      set({ loading: false });
      return { success: response.data.success, message: response.data.message };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to update admission status";
      set({ loading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  migrateApprovedAspirants: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.post("/Aspirant/migrate-approved-aspirants");
      set({ loading: false });
      return { success: response.data.success, message: response.data.message };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to migrate aspirants";
      set({ loading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  getAvailableClasses: async () => {
    set({ classesLoading: true, error: null });
    try {
      const response = await axiosInstance.get<{ data: ClassOption[] }>("/Class/get-classes-by-subdomain");
      set({ availableClasses: response.data.data, classesLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to fetch classes";
      set({ classesLoading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  clearError: () => set({ error: null })
}));
