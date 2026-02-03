import { getAccountKey } from "../authSession";
import { getToken } from "../authStorage";
import { getClientId } from "../clientId";
import { MOBILE_API_HOST_URL } from "../constants";

type ApiOptions = {
  method?: "GET" | "POST";
  body?: any;
  headers?: Record<string, string>;
};

export const mobileApiClient = async <T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> => {
  const token = await getToken();

  const res = await fetch(`${MOBILE_API_HOST_URL}${endpoint}`, {
    method: options.method ?? "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-OP-ClientId": getClientId() ?? "",
      "X-OP-Account": getAccountKey() ?? "",
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
