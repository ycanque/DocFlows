import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5040";

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor - Add JWT token to requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle common error scenarios
    if (error.response) {
      const status = error.response.status;

      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          if (typeof window !== "undefined") {
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            // Only redirect if not already on login page
            if (window.location.pathname !== "/login") {
              window.location.href = "/login";
            }
          }
          break;

        case 403:
          // Forbidden - user doesn't have permission
          console.error("Access forbidden:", error.response.data);
          break;

        case 404:
          // Not found
          console.error("Resource not found:", error.config?.url);
          break;

        case 500:
          // Server error
          console.error("Server error:", error.response.data);
          break;

        default:
          console.error("API error:", error.response.data);
      }
    } else if (error.request) {
      // Request made but no response received
      console.error("No response from server:", error.message);
    } else {
      // Something else happened
      console.error("Error setting up request:", error.message);
    }

    return Promise.reject(error);
  }
);

// Helper function to get error message from axios error
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{
      message?: string;
      error?: string;
    }>;

    // Try to extract error message from response
    if (axiosError.response?.data) {
      const data = axiosError.response.data;
      return data.message || data.error || "An error occurred";
    }

    // Network or timeout error
    if (axiosError.code === "ECONNABORTED") {
      return "Request timeout. Please try again.";
    }

    if (axiosError.message) {
      return axiosError.message;
    }
  }

  // Generic error
  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred";
};

// Token management helpers
export const setAuthToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
  }
};

export const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

export const removeAuthToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
};

export default api;
