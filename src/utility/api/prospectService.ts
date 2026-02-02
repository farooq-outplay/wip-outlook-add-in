import { mobileApiClient } from "./mobileApiClient";

export type ProspectResponse = any;

export const getProspectByEmail = (
  email: string,
  accessToken?: string
): Promise<ProspectResponse> => {
  return mobileApiClient<ProspectResponse>(
    `/api/v1/cextprospect/getprospectdetails?id=${encodeURIComponent(email)}`,
    {
      method: "GET",
      headers: {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    }
  );
};
