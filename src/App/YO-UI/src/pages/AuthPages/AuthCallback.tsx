// import { useEffect, useState, useRef } from "react";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import OAuth2Service from "../../services/OAuth2Service";
// import AuthHelper from "../../utils/AuthHelper";
// import { useTokenMutation } from "../../redux/user/userAPI";

// export default function AuthCallback() {
//     const [searchParams] = useSearchParams();
//     const navigate = useNavigate();
//     const [error, setError] = useState<string | null>(null);
//     const [isProcessing, setIsProcessing] = useState(true);
//     const hasProcessed = useRef(false); // Prevent double execution in React StrictMode
//     const [tokenMutation] = useTokenMutation();
//     useEffect(() => {
//         // Prevent double execution (React StrictMode calls useEffect twice in dev)
//         if (hasProcessed.current) {
//             return;
//         }

//         // Mark as processed IMMEDIATELY (synchronously) before any async work
//         hasProcessed.current = true;

//         const handleCallback = async () => {
//             try {
//                 // Get code and state from URL
//                 const code = searchParams.get('code');
//                 const state = searchParams.get('state');
//                 const errorParam = searchParams.get('error');
//                 const errorDescription = searchParams.get('error_description');

//                 // Check for errors from IdentityServer
//                 if (errorParam) {
//                     setError(errorDescription || errorParam);
//                     setIsProcessing(false);
//                     return;
//                 }

//                 // Validate we have a code
//                 if (!code || !state) {
//                     setError('Missing authorization code or state');
//                     setIsProcessing(false);
//                     return;
//                 }

//                 // Exchange code for tokens
//                  const tokens = await OAuth2Service.handleCallback(code, state);
//                 // Decode and store user info
//                 const userInfo = AuthHelper.SetNewLogin(tokens.access_token);

//                 // Navigate to appropriate dashboard based on role
//                 if (Array.isArray(userInfo.role)) {
//                     if ((userInfo.role as string[]).includes("SuperAdmin") ||
//                         (userInfo.role as string[]).includes("Admin")) {
//                         navigate("/admin/dashboard");
//                     } else {
//                         navigate("/");
//                     }
//                 } else if (userInfo.role === "SuperAdmin" || userInfo.role === "Admin") {
//                     navigate("/admin/dashboard");
//                 } else {
//                     navigate("/");
//                 }
//             } catch (err: any) {
//                 console.error('Authentication callback error:', err);
//                 setError(err.message || 'Authentication failed');
//                 setIsProcessing(false);
//             }
//         };

//         handleCallback();
//     }, [searchParams, navigate]);

//     // Show loading state
//     if (isProcessing) {
//         return (
//             <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
//                 <div className="text-center">
//                     <div className="inline-block w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
//                     <h2 className="mt-4 text-xl font-semibold text-gray-800 dark:text-white">
//                         Completing sign in...
//                     </h2>
//                     <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
//                         Please wait while we verify your credentials
//                     </p>
//                 </div>
//             </div>
//         );
//     }

//     // Show error state
//     if (error) {
//         return (
//             <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
//                 <div className="max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
//                     <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full dark:bg-red-900/20">
//                         <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                         </svg>
//                     </div>
//                     <h2 className="mb-2 text-xl font-bold text-center text-gray-800 dark:text-white">
//                         Authentication Failed
//                     </h2>
//                     <p className="mb-6 text-sm text-center text-gray-600 dark:text-gray-400">
//                         {error}
//                     </p>
//                     <button
//                         onClick={() => navigate('/signin')}
//                         className="w-full px-4 py-2 text-white transition rounded-lg bg-brand-500 hover:bg-brand-600"
//                     >
//                         Back to Sign In
//                     </button>
//                 </div>
//             </div>
//         );
//     }

//     return null;
// }


import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuthHelper from "../../utils/AuthHelper";
import { useTranslation } from "react-i18next";

const TOKEN_ENDPOINT = "https://localhost:44314/connect/token";
const CLIENT_ID = "asdfasdf";
const REDIRECT_URI = "http://localhost:5173/auth/callback";

/**
 * Try to retrieve the PKCE verifier using multiple common conventions.
 * You MUST have stored a verifier before redirecting to /connect/authorize.
 */
function getPkceVerifier(state: string): { verifier: string; storageKeyUsed: string } | null {
    // Preferred: keyed by state
    const byState = sessionStorage.getItem(`pkce:${state}`);
    if (byState) return { verifier: byState, storageKeyUsed: `sessionStorage["pkce:${state}"]` };

    // Alternative: some apps store verifier without state key
    const plain = sessionStorage.getItem("pkce_verifier");
    if (plain) return { verifier: plain, storageKeyUsed: `sessionStorage["pkce_verifier"]` };

    // If you used localStorage instead of sessionStorage
    const byStateLocal = localStorage.getItem(`pkce:${state}`);
    if (byStateLocal) return { verifier: byStateLocal, storageKeyUsed: `localStorage["pkce:${state}"]` };

    const plainLocal = localStorage.getItem("pkce_verifier");
    if (plainLocal) return { verifier: plainLocal, storageKeyUsed: `localStorage["pkce_verifier"]` };

    return null;
}

function cleanupPkce(state: string) {
    sessionStorage.removeItem(`pkce:${state}`);
    sessionStorage.removeItem("pkce_verifier");
    sessionStorage.removeItem("pkce_state");

    localStorage.removeItem(`pkce:${state}`);
    localStorage.removeItem("pkce_verifier");
    localStorage.removeItem("pkce_state");
}

export default function AuthCallback() {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const hasRun = useRef(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;

        (async () => {
            try {
                const code = searchParams.get("code");
                const state = searchParams.get("state");
                const oidcError = searchParams.get("error");
                const oidcErrorDesc = searchParams.get("error_description");

                if (oidcError) {
                    throw new Error(oidcErrorDesc || oidcError);
                }

                if (!code || !state) {
                    throw new Error(t('Auth.Callback.NoCode'));
                }

                // Optional sanity check: if you stored state separately, ensure it matches
                const storedState = sessionStorage.getItem("pkce_state") || localStorage.getItem("pkce_state");
                if (storedState && storedState !== state) {
                    cleanupPkce(state);
                    throw new Error("State mismatch. Login session is not valid. Please sign in again.");
                }

                const pkce = getPkceVerifier(state);
                if (!pkce) {
                    // Helpful debug info for you
                    const ssKeys = Object.keys(sessionStorage).filter(k => k.startsWith("pkce"));
                    const lsKeys = Object.keys(localStorage).filter(k => k.startsWith("pkce"));

                    throw new Error(
                        [
                            "PKCE verifier not found.",
                            "This means your login/start flow did not store the code_verifier before redirect.",
                            `Expected one of: sessionStorage["pkce:${state}"], sessionStorage["pkce_verifier"], localStorage["pkce:${state}"], localStorage["pkce_verifier"].`,
                            `Found sessionStorage PKCE keys: ${ssKeys.length ? ssKeys.join(", ") : "(none)"}`,
                            `Found localStorage PKCE keys: ${lsKeys.length ? lsKeys.join(", ") : "(none)"}`
                        ].join(" ")
                    );
                }

                // Clean up to prevent reuse
                cleanupPkce(state);

                const body = new URLSearchParams({
                    grant_type: "authorization_code",
                    client_id: CLIENT_ID,
                    redirect_uri: REDIRECT_URI,
                    code,
                    code_verifier: pkce.verifier,
                });

                const response = await fetch(TOKEN_ENDPOINT, {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body,
                });

                const result = await response.json().catch(() => ({}));

                if (!response.ok) {
                    throw new Error(result.error_description || result.error || `Token request failed (${response.status}).`);
                }

                // Persist tokens
                localStorage.setItem("access_token", result.access_token);
                if (result.refresh_token) localStorage.setItem("refresh_token", result.refresh_token);

                // Decode user info
                const userInfo = AuthHelper.SetNewLogin(result.access_token);

                const roles = Array.isArray(userInfo.role) ? userInfo.role : [userInfo.role];
                if (roles.includes("SuperAdmin") || roles.includes("Admin")) {
                    navigate("/admin/dashboard", { replace: true });
                } else {
                    navigate("/", { replace: true });
                }
            } catch (err: any) {
                console.error("Auth callback error:", err);
                setError(err?.message || t('Auth.Callback.UnexpectedError'));
            }
        })();
    }, [searchParams.toString(), navigate]);

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="max-w-lg rounded bg-white p-6 shadow">
                    <h2 className="mb-2 text-xl font-bold text-red-600">{t('Auth.Callback.Title')}</h2>
                    <p className="mb-4 text-sm text-gray-700" style={{ whiteSpace: "pre-wrap" }}>
                        {error}
                    </p>
                    <button
                    className="rounded bg-blue-600 px-4 py-2 text-white"
                    onClick={() => navigate("/signin", { replace: true })}
                >
                        {t('Auth.Callback.ReturnToLogin')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                <p className="mt-4 text-gray-700">{t('Auth.Callback.SigningIn')}</p>
            </div>
        </div>
    );
}
