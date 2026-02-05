import { getAccountKey } from "../authSession";
import { getToken } from "../authStorage";
import { getClientId } from "../clientId";
import { MOBILE_API_HOST_URL } from "../constants";
import { ApiOptions, ApiResult } from "../types/apiResultTypes";

export const mobileApiClient = async <T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<any> => {
  try {
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
      const errorText = await res.text();
      return {
        success: false,
        status: res.status,
        error: errorText || res.statusText,
      };
    }

    const data = (await res.json()) as T;
    return { success: true, data };
  } catch (err: any) {
    return {
      success: false,
      status: 0,
      error: err?.message ?? "Network error",
    };
  }
};
