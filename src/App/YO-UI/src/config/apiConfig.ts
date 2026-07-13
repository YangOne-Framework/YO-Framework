import {
    BaseQueryFn,
    FetchArgs,
    fetchBaseQuery,
    FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { BaseEndpoints } from "./BaseEndpoints";
import { unwrapApiResponse } from "../security/apiPayloadSecurity";
import { getValidToken, clearToken } from "../services/tokenManager";

/**
 * Plain base query — no auth headers, no token fetching.
 * Used only for endpoints that obtain tokens (login, token exchange).
 */
export const baseQueryWithoutAuth: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {
    const baseQuery = fetchBaseQuery({
        baseUrl: BaseEndpoints.base,
    });
    const fetchArgs: FetchArgs =
        typeof args === "string" ? { url: args } : { ...args };
    const result = await baseQuery(fetchArgs, api, extraOptions);

    if (result.data) {
        result.data = await unwrapApiResponse(result.data);
    }

    return result;
};

export const baseQueryWithAuth: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {
    const baseQuery = fetchBaseQuery({
        baseUrl: BaseEndpoints.base,
    });

    // ---- 1) Get valid token (from cache or fetch fresh) ----
    let tokenToUse: string | null = null;
    try {
        tokenToUse = await getValidToken();
    } catch (error) {
        console.error("Error getting valid token:", error);
        return {
            error: {
                status: 401,
                data: { message: "Unable to obtain access token" },
            } as FetchBaseQueryError,
        };
    }

    if (!tokenToUse) {
        return {
            error: {
                status: 401,
                data: { message: "No access token available" },
            } as FetchBaseQueryError,
        };
    }

    // ---- 2) Build request args & add Authorization header ----
    const fetchArgs: FetchArgs =
        typeof args === "string" ? { url: args } : { ...args };

    const existingHeaders: Record<string, string> =
        fetchArgs.headers instanceof Headers
            ? Object.fromEntries(fetchArgs.headers.entries())
            : (fetchArgs.headers as Record<string, string>) || {};

    fetchArgs.headers = {
        ...existingHeaders,
        Authorization: `Bearer ${tokenToUse}`,
    };

    // ---- 3) Call underlying baseQuery ----
    const result = await baseQuery(fetchArgs, api, extraOptions);

    // ---- 3.5) Handle 401 — clear token and retry once ----
    if (result.error && 'status' in result.error && result.error.status === 401) {
        clearToken();
        try {
            tokenToUse = await getValidToken();
        } catch {
            return result;
        }
        fetchArgs.headers = {
            ...existingHeaders,
            Authorization: `Bearer ${tokenToUse}`,
        };
        const retryResult = await baseQuery(fetchArgs, api, extraOptions);
        if (retryResult.data) {
            retryResult.data = await unwrapApiResponse(retryResult.data);
        }
        return retryResult;
    }

    // ---- 4) Unwrap protected API payload (obfuscation/encryption) ----
    if (result.data) {
        result.data = await unwrapApiResponse(result.data);
    }

    // ---- 5) Handle { Code, Message, Data } envelope ----
    if (result.data && typeof result.data === "object" && "Code" in result.data) {
        const code = (result.data as any).Code;
        if (typeof code === "number" && (code < 200 || code >= 300)) {
            return {
                error: {
                    status: code,
                    data: result.data,
                },
            };
        }
    }

    return result;
};
