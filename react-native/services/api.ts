import axios, { AxiosInstance, AxiosError } from 'axios';
import { storage } from '@/utils/storage';
import Constants from 'expo-constants';

// Shape of every backend response (see server/src/utils/apiResponse.js)
export interface ApiResponse<T> {
  statusCode?: number;
  success: boolean;
  data: T;
  message?: string;
}

// Local file picked on the device (e.g. from expo-image-picker)
export interface LocalImage {
  uri: string;
  name?: string;
  type?: string;
}

// Build a multipart body for endpoints using multer's upload.single(field)
export function toFormData(
  data: Record<string, any>,
  image?: LocalImage | null,
  field = 'image'
): FormData {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });
  if (image) {
    formData.append(field, {
      uri: image.uri,
      name: image.name ?? image.uri.split('/').pop() ?? 'photo.jpg',
      type: image.type ?? 'image/jpeg',
    } as any);
  }
  return formData;
}

// Get API URL from environment or use default localhost
const API_BASE_URL =
  Constants.expoConfig?.extra?.apiUrl ||
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  "http://172.30.130.175:5000/api";

console.log('🌐 API Base URL:', API_BASE_URL);

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies
});

// Request interceptor - Add auth token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await storage.getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - logout user
      await storage.removeAuthToken();
      await storage.removeUserData();
      // You can add navigation to login screen here if needed
    }
    return Promise.reject(error);
  }
);

export default api;
