import { ApiResult } from "../types/apiResultTypes";
import { mobileApiClient } from "./mobileApiClient";

export interface Sequence {
    id: number;
    name: string;
}

export const getSequences = (): Promise<ApiResult<Sequence[]>> => {
    return mobileApiClient<ApiResult<Sequence[]>>("/api/v1/cxsequence/search", {
        method: "GET",
    });
};
