import { getToken } from "../authStorage";
import { getClientId } from "../clientId";
import { DEV_HOST_URl, HOST_URL } from "../constants";

export type ApiOptions<TBody = unknown> = {
  method?: "GET" | "POST";
  body?: TBody;
  headers?: Record<string, string>;
};

export const authApiClient = async <T>(endpoint: string, options: ApiOptions = {}): Promise<T> => {
  const token = await getToken();

  const res = await fetch(`${HOST_URL}${endpoint}`, {
    method: options.method ?? "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-OP-ClientId": getClientId(),
      "X-Client-Platform": "OUTLOOK_ADDIN",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    throw new Error(`API failed: ${res.status}`);
  }

  return res.json();
};
