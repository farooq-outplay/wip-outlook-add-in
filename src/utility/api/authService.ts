import { apiClient } from "./apiClient";

export type TokenResponse = {
  accessToken: string;
};

export const exchangeAuthToken = (tempToken: string) => {
  return apiClient<TokenResponse>(`/api/jwt/token?token=${tempToken}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${tempToken}`,
    },
  });
};
