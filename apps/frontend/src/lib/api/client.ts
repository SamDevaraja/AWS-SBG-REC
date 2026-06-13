import axios from "axios";

export const apiClient = axios.create({
  baseURL: "/api",
  timeout: 15000,
});

apiClient.interceptors.response.use((response) => {
  if (response.data && response.data.success && 'data' in response.data) {
    response.data = response.data.data;
  }
  return response;
});

