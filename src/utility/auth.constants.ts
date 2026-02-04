import { DEV_HOST_URl, HOST_URL } from "./constants";
import { getClientId } from "./clientId";

export const getLoginUrl = (): string => {
  return `${HOST_URL}/login?outlookaddin=app&device=${getClientId()}`;
};
