import { ProspectResponse } from "../models/prospect/prospect-response.model";
import { ApiResult } from "../types/apiResultTypes";
import { mobileApiClient } from "./mobileApiClient";

export const getProspectByEmail = (email: string | number): Promise<ProspectResponse> => {
  return mobileApiClient<ProspectResponse>(
    `/api/v1/cextprospect/getprospectdetails?id=${encodeURIComponent(email)}`,
    {
      method: "GET",
    }
  );
};

export const updateProspect = (payload: any): Promise<any> => {
  return mobileApiClient<ApiResult<ProspectResponse>>(`/api/v1/cextprospect/updateprospect`, {
    method: "PUT",
    body: payload,
  });
};

export const saveProspect = (payload: any): Promise<any> => {
  return mobileApiClient<ApiResult<ProspectResponse>>(`/api/v1/cextprospect/saveprospect`, {
    method: "POST",
    body: payload,
  });
};
