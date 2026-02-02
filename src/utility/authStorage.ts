// // authStorage.ts

import { TOKEN_KEY } from "./constants";

// const TOKEN_KEY = "OUTPLAY_ACCESS_TOKEN";

function hasOfficeRuntimeStorage(): boolean {
  return (
    typeof Office !== "undefined" &&
    typeof OfficeRuntime !== "undefined" &&
    typeof OfficeRuntime.storage !== "undefined"
  );
}

/**
 * SAVE TOKEN
 */
export async function saveToken(token: string): Promise<void> {
  // Always store in localStorage (cross-platform)
  localStorage.setItem(TOKEN_KEY, token);

  // Optionally enhance for modern Outlook
  if (hasOfficeRuntimeStorage()) {
    try {
      await OfficeRuntime.storage.setItem(TOKEN_KEY, token);
    } catch {
      // ignore – localStorage already saved
    }
  }
}

/**
 * GET TOKEN
 */
export async function getToken(): Promise<string | null> {
  // Prefer localStorage (works everywhere)
  const localToken = localStorage.getItem(TOKEN_KEY);
  if (localToken) return localToken;

  // Fallback to Office storage if available
  if (hasOfficeRuntimeStorage()) {
    try {
      return await OfficeRuntime.storage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * CLEAR TOKEN
 */
export async function clearToken(): Promise<void> {
  localStorage.removeItem(TOKEN_KEY);

  if (hasOfficeRuntimeStorage()) {
    try {
      await OfficeRuntime.storage.removeItem(TOKEN_KEY);
    } catch {
      // ignore
    }
  }
}
