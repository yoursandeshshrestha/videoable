import axios, { type AxiosError, type AxiosInstance } from 'axios';
import { API_CONFIG } from '../config/api.config';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const message = this.handleError(error);
        return Promise.reject({ message, error });
      }
    );
  }

  private handleError(error: AxiosError): string {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as { detail?: string };
      
      switch (status) {
        case 400:
          return data?.detail || 'Bad request';
        case 404:
          return data?.detail || 'Resource not found';
        case 500:
          return data?.detail || 'Server error';
        default:
          return data?.detail || 'An error occurred';
      }
    } else if (error.request) {
      return 'No response from server. Please check your connection.';
    } else {
      return error.message || 'An unexpected error occurred';
    }
  }

  public async get<T>(url: string): Promise<T> {
    const response = await this.client.get<T>(url);
    return response.data;
  }

  public async post<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  public async put<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.put<T>(url, data);
    return response.data;
  }

  public async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<T>(url);
    return response.data;
  }

  public async upload<T>(url: string, formData: FormData): Promise<T> {
    const response = await this.client.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

export const apiClient = new ApiClient();

