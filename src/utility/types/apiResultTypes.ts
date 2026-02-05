export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; status: number; error: string };

export type ApiOptions = {
  method?: "GET" | "POST";
  body?: any;
  headers?: Record<string, string>;
};

export const authHeader = (accessToken?: string): Record<string, string> =>
  accessToken ? { Authorization: `Bearer ${accessToken}` } : {};

export enum ApiStatusCodes {
  Success = 200,

  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  ValidationError = 422,
  ServerError = 500,
}
