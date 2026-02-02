// import { AuthSession } from "../types/auth";
import { AuthSession } from "./types/auth";

const AUTH_SESSION_KEY = "OUTPLAY_AUTH_SESSION";

export const saveAuthSession = (session: AuthSession) => {
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
};

export const getAuthSession = (): AuthSession | null => {
  const raw = localStorage.getItem(AUTH_SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
};

export const clearAuthSession = () => {
  localStorage.removeItem(AUTH_SESSION_KEY);
};

// Convenience helpers 👇
export const getAccessToken = () => getAuthSession()?.accessToken;
export const getAccountKey = () => getAuthSession()?.accountKey;
export const getRefreshToken = () => getAuthSession()?.refreshToken;
