export interface IApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  error?: string | Record<string, any>;
  statusCode?: number;
}
