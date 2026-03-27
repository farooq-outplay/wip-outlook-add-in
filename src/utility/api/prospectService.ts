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

export const createBulkSms = async (payload: {
  sendanyway: number;
  body: string;
  dialernumberid: number;
  textprospects: { prospectid: number }[];
}) => {
  return mobileApiClient("/api/v1/cextprospect/createbulksms", {
    method: "POST",
    body: payload,
  });
};

export const getProspectStages = (): Promise<any> => {
  return mobileApiClient("/api/v1/cextprospect/stages", {
    method: "GET",
  });
};

export const pauseProspect = (payload: { prospectId: number }): Promise<any> => {
  return mobileApiClient("/api/v1/cextprospect/pause/", {
    method: "POST",
    body: payload,
  });
};

export const markAsFinishedProspect = (payload: { prospectId: number }): Promise<any> => {
  return mobileApiClient("/api/v1/cextprospect/markfinished/", {
    method: "POST",
    body: payload,
  });
};

export const optOutProspect = (payload: { prospectid: number }): Promise<any> => {
  return mobileApiClient("/api/v1/cextprospect/optout", {
    method: "POST",
    body: payload,
  });
};

export const optInProspect = (payload: { prospectid: number }): Promise<any> => {
  return mobileApiClient("/api/v1/cextprospect/optin/", {
    method: "POST",
    body: payload,
  });
};

export const deleteProspect = (payload: { prospectId: number }): Promise<any> => {
  return mobileApiClient("/api/v1/cextprospect/delete", {
    method: "POST",
    body: payload,
  });
};

export const getTimezones = (): Promise<any> => {
  return mobileApiClient("/api/v1/cextuser/timezones", {
    method: "GET",
  });
};
