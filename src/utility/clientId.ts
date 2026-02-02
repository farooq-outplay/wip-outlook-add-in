import { CLIENT_ID_KEY } from "./constants";

export const getClientId = (): string => {
  let id = localStorage.getItem(CLIENT_ID_KEY);

  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(CLIENT_ID_KEY, id);
  }

  return id;
};
