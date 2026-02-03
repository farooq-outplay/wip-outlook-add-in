import { ProspectResponse } from "../models/prospect/prospect-response.model";
import { mobileApiClient } from "./mobileApiClient";

export const getProspectByEmail = (
  email: string | number,
  accessToken: string
): Promise<ProspectResponse> => {
  return mobileApiClient<ProspectResponse>(
    `/api/v1/cextprospect/getprospectdetails?id=${encodeURIComponent(email.toString())}`,
    {
      method: "GET",
      headers: {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    }
  );
};

export const saveProspect = (accessToken: string, payload: any): Promise<ProspectResponse> => {
  return mobileApiClient<ProspectResponse>(`/api/v1/cextprospect/saveprospect`, {
    method: "POST",
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      "Content-Type": "application/json",
    },
    body: payload,
  });
};
