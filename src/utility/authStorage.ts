import { TOKEN_KEY } from "./constants";

export const saveToken = async (token: string) => {
  sessionStorage.setItem(TOKEN_KEY, token);
};

export const getToken = async () => {
  return sessionStorage.getItem(TOKEN_KEY);
};

export const clearToken = async () => {
  sessionStorage.removeItem(TOKEN_KEY);
};
