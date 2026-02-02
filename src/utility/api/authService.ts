import { AuthSession } from "../types/auth";
import { authApiClient } from "./authApiClient";

export const exchangeAuthToken = (tempToken: string) => {
  return authApiClient<AuthSession>(`/api/jwt/token?token=${tempToken}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${tempToken}`,
    },
  });
};
