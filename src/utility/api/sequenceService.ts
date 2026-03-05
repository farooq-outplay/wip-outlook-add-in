import { ApiResult } from "../types/apiResultTypes";
import { mobileApiClient } from "./mobileApiClient";

export interface Sequence {
  id: number;
  name: string;
}

export const getSequences = (): Promise<ApiResult<Sequence[]>> => {
  return mobileApiClient<ApiResult<Sequence[]>>("/api/v1/cextsequence/search", {
    method: "GET",
  }).then((result) => {
    if (result.success && Array.isArray(result.data)) {
      //  Extract sequencelist from first element
      const rawList = result.data[0]?.sequencelist ?? [];

      //  Map sequenceid/sequencename → id/name
      const sequences: Sequence[] = rawList.map((seq: any) => ({
        id: seq.sequenceid,
        name: seq.sequencename,
      }));

      return { ...result, data: sequences };
    }
    return { ...result, data: [] };
  });
};
