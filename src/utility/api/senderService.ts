import { ApiResult } from "../types/apiResultTypes";
import { mobileApiClient } from "./mobileApiClient";

export interface Sender {
  id: number;
  email: string;
  isDefault: boolean;
}

export interface RawSender {
  useraliasid: number;
  senderemailid: string;
  isdefault: boolean;
  usermailboxid: number;
  userid: number;
}

export const getSenders = async (userId: string | number): Promise<ApiResult<Sender[]>> => {
  try {
    const response = await mobileApiClient<RawSender[]>(
      `/api/v1/cextmailbox/getuseraliasbyuserid?userId=${userId}`,
      { method: "GET" }
    );

    if (response.success && Array.isArray(response.data)) {
      const senders: Sender[] = response.data.map((raw: RawSender) => ({
        id: raw.useraliasid,
        email: raw.senderemailid,
        isDefault: raw.isdefault,
      }));
      return { success: true, data: senders };
    }

    if (!response.success) {
      return response as ApiResult<Sender[]>;
    }

    console.warn("getSenders: Data is missing or malformed", response);
    return { success: true, data: [] };
  } catch (error) {
    console.warn("getSenders: Error fetching senders", error);
    return { success: false, status: 500, error: "Error fetching senders" };
  }
};
