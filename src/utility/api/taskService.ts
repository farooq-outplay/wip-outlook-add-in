import { mobileApiClient } from "./mobileApiClient";
import { ApiResult } from "../types/apiResultTypes";

export interface CreateTaskPayload {
    actiontype: number;        // task type: 1=Email, 2=Call, 3=LinkedIn, 4=Twitter, 5=Note, 6=Chat, 7=WhatsApp
    actionparameters: string;  // empty string by default
    userid: number;            // current logged in user id
    priority: string;          // "1"=High, "2"=Medium, "3"=Low
    tasknotes: string;         // task description
    taskscheduleddate: string; // ISO datetime string e.g. "2026-03-05T05:19:00"
    opportunityid: number | null;
}

export const createTask = async (
    prospectId: number,
    payload: CreateTaskPayload
): Promise<ApiResult<any>> => {
    try {
        console.log("createTask request:", { prospectId, payload });

        const response = await mobileApiClient<any>(
            `/api/v1/cexttask/create?prospectid=${prospectId}`,
            {
                method: "POST",
                body: payload,
            }
        );

        console.log("createTask response:", response);

        if (!response.success && response.status === 500) {
            return {
                success: false,
                status: 500,
                error: "Failed to create task. Please check if the prospect exists.",
            };
        }

        return response;
    } catch (error) {
        console.warn("createTask: Error creating task", error);
        return { success: false, status: 500, error: "Error creating task" };
    }
};
