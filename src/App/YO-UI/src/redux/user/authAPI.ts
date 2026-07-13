import { createApi } from "../createUncachedApi";
import { ITokenResponse } from "../../types";
import { baseQueryWithoutAuth } from "../../config/apiConfig";
import { API } from "../../config/apiUrls";

interface LoginRequest {
    username: string;
    password?: string;
    grant_type: string;
    client_id: string;
    client_secret: string;
    scope?: string;
}

export const authAPI = createApi({
    reducerPath: "authAPI",
    baseQuery: baseQueryWithoutAuth,
    endpoints: (builder) => ({
        token: builder.mutation<ITokenResponse, { CLIENT_ID: string, REDIRECT_URI: string, code: string, codeVerifier: string }>({
            query: ({ CLIENT_ID, REDIRECT_URI, code, codeVerifier }) => ({
                url: API.AUTH.TOKEN,
                method: "POST",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    grant_type: 'authorization_code',
                    client_id: CLIENT_ID,
                    redirect_uri: REDIRECT_URI,
                    code: code,
                    code_verifier: codeVerifier,
                }),
            }),
        }),
        login: builder.mutation<ITokenResponse, LoginRequest>({
            query: (credentials) => ({
                url: API.AUTH.TOKEN,
                method: "POST",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    grant_type: credentials.grant_type,
                    client_id: credentials.client_id,
                    client_secret: credentials.client_secret,
                    username: credentials.username,
                    password: credentials.password || '',
                    scope: credentials.scope || ''
                }),
            }),
        }),
    }),
});

export const {
    useTokenMutation,
    useLoginMutation,
} = authAPI;
