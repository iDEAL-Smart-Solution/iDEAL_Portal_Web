import { toast } from "@/hooks/use-toast";

export const showSuccess = (message: string, title = "Success") => {
  toast({
    title,
    description: message,
    variant: "success",
  });
};

export const showError = (message: string, title = "Error") => {
  toast({
    title,
    description: message,
    variant: "destructive",
  });
};

export const showInfo = (message: string, title = "Info") => {
  toast({
    title,
    description: message,
  });
};

export const showWarning = (message: string, title = "Warning") => {
  toast({
    title,
    description: message,
    variant: "warning",
  });
};

export const getErrorMessage = (error: any, fallback = "Request failed") => {
  return (
    error?.response?.data?.details ||
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
};
