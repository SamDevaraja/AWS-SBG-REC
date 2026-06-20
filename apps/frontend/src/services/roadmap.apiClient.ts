import axios, { AxiosError } from 'axios';

export interface ApiError {
  message: string;
  status: number;
  errors?: any;
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000';
const apiPrefix = apiBaseUrl.endsWith('/api') ? '' : '/api';

const apiClient = axios.create({
  baseURL: `${apiBaseUrl}${apiPrefix}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT access token
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Normalize Axios responses to unwrap the global TransformInterceptor envelope
apiClient.interceptors.response.use(
  (response) => {
    if (
      response.data &&
      typeof response.data === 'object' &&
      'success' in response.data &&
      'data' in response.data
    ) {
      return {
        ...response,
        data: response.data.data,
      };
    }
    return response;
  },
  (error: AxiosError<any>) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('aws_sgb_rec_user');
        window.location.href = '/login';
      }
    }
    const apiError: ApiError = {
      message: error.response?.data?.message || 'An unexpected error occurred',
      status: error.response?.status || 500,
      errors: error.response?.data?.errors || null,
    };
    return Promise.reject(apiError);
  }
);

export default apiClient;
