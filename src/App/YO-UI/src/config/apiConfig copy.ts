import {
    BaseQueryFn,
    FetchArgs,
    fetchBaseQuery,
    FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { jwtDecode } from "jwt-decode";
import { ITokenInfo, ITokenResponse } from "../types";
import { BaseEndpoints } from "./BaseEndpoints";

/**
 * Get a client-credentials token from IdentityServer
 */
const getAppToken = async (): Promise<ITokenResponse> => {
    const res = await fetch(`${BaseEndpoints.base}/connect/token`, {
        method: "POST",
        mode: "cors",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            client_id: import.meta.env.VITE_API_CLIENTID,
            client_secret: import.meta.env.VITE_API_SECRET,
            grant_type: "client_credentials",
        }),
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch token: ${res.status} ${res.statusText}`);
    }

    const data: ITokenResponse = await res.json();
    console.log("Fetched new token:", data);
    return data;
};

const setAccessToken = (token: string) => {
    try {
        localStorage.setItem("token", token);
    } catch (e) {
        console.warn("Unable to persist token to localStorage:", e);
    }
};

const getAccessToken = (): string | null => {
    try {
        const accessToken = localStorage.getItem("token");
        return accessToken || null;
    } catch {
        return null;
    }
};

const removeAccessToken = () => {
    try {
        localStorage.removeItem("token");
    } catch (e) {
        console.warn("Unable to remove token from localStorage:", e);
    }
};

export const baseQueryWithAuth: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {
    const baseQuery = fetchBaseQuery({
        baseUrl: BaseEndpoints.base,
    });

    // ---- 1) Get current token (if any) ----
    let tokenToUse: string | null = getAccessToken();

    if (tokenToUse) {
        try {
            const currentTokenInfo = jwtDecode(tokenToUse) as ITokenInfo;
            const currentTime = Math.floor(Date.now() / 1000); // in seconds

            // If token expired or about to expire in the next 60s → refresh
            if (
                currentTokenInfo.exp &&
                currentTokenInfo.exp < currentTime + 60
            ) {
                console.log("Token expired / expiring soon, refreshing...");
                removeAccessToken(); // Clear expired token
                tokenToUse = null;
            }
        } catch (error) {
            console.error("Error decoding existing token:", error);
            removeAccessToken(); // Clear invalid token
            tokenToUse = null;
        }
    }

    // ---- 2) Fetch new token if needed ----
    if (!tokenToUse) {
        try {
            const data = await getAppToken();
            if (data?.access_token) {
                const tokenInfo = jwtDecode(data.access_token) as ITokenInfo;
                console.log("New token decoded:", tokenInfo);
                setAccessToken(data.access_token);
                tokenToUse = data.access_token;
            } else {
                throw new Error("No access_token in token response");
            }
        } catch (error) {
            console.error("Error getting new token:", error);
            // You can choose to redirect, logout, etc. here.
            return {
                error: {
                    status: 401,
                    data: { message: "Unable to obtain access token" },
                } as FetchBaseQueryError,
            };
        }
    }

    // ---- 3) Build request args & add Authorization header ----
    const fetchArgs: FetchArgs =
        typeof args === "string" ? { url: args } : { ...args };

    // Normalize headers to plain object
    const existingHeaders: Record<string, string> =
        fetchArgs.headers instanceof Headers
            ? Object.fromEntries(fetchArgs.headers.entries())
            : (fetchArgs.headers as Record<string, string>) || {};

    fetchArgs.headers = {
        ...existingHeaders,
        // Don't set Access-Control-Allow-Origin here; this is a *response* header
        Authorization: `Bearer ${tokenToUse}`,
    };

    // ---- 4) Call underlying baseQuery ----
    const result = await baseQuery(fetchArgs, api, extraOptions);

    // ---- 5) Handle your API's { Code, Message, Data } envelope if present ----
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
