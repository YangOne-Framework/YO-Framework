import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import OAuth2Service from "../../services/OAuth2Service";
import AuthHelper from "../../utils/AuthHelper";
import { useTranslation } from "react-i18next";

export default function SignInForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Check if already logged in
  useEffect(() => {
    if (AuthHelper.isLoggedIn()) {
      const roles = AuthHelper.getUserRoles();
      if (roles.includes("SuperAdmin") || roles.includes("Admin")) {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    }
  }, [navigate]);

  function base64UrlEncode(bytes: Uint8Array) {
    return btoa(String.fromCharCode(...bytes))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }

  async function sha256(input: string) {
    const data = new TextEncoder().encode(input);
    const hash = await crypto.subtle.digest("SHA-256", data);
    return new Uint8Array(hash);
  }

  function randomString(length = 64) {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return base64UrlEncode(bytes);
  }

  async function startLogin() {
    const state = randomString(32);
    const codeVerifier = randomString(64);
    const codeChallenge = base64UrlEncode(await sha256(codeVerifier));

    // 🔑 STORE VALUES FOR CALLBACK
    sessionStorage.setItem(`pkce:${state}`, codeVerifier);
    sessionStorage.setItem("pkce_state", state);

    const params = new URLSearchParams({
      response_type: "code",
      client_id: "asdfasdf",
      redirect_uri: "http://localhost:5173/auth/callback",
      scope: "openid profile email offline_access",
      state,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });

    window.location.href = `https://localhost:44314/connect/authorize?${params.toString()}`;
  }
  const handleSignIn = async () => {
    try {
      await startLogin();
      // await OAuth2Service.initiateLogin();
      // User will be redirected to IdentityServer
    } catch (error) {
      console.error("Failed to initiate login:", error);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              {t('Auth.SignIn.Title')}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('Auth.SignInOIDC.OrganizationAccount')}
            </p>
          </div>

          <div className="space-y-6">
            <button
              onClick={handleSignIn}
              className="w-full px-6 py-3 text-base font-medium text-white transition rounded-lg bg-brand-500 hover:bg-brand-600 shadow-lg shadow-brand-500/20"
            >
              {t('Auth.SignInOIDC.SignInWithAzure')}
            </button>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>{t('Auth.SignInOIDC.Redirecting')}</strong> {t('Auth.SignInOIDC.RedirectDescription')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
