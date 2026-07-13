/**
 * OAuth2Service - Handles Authorization Code Flow with PKCE
 * for OpenIddict/IdentityServer authentication
 */

class OAuth2Service {
    private static readonly AUTH_ENDPOINT = `${import.meta.env.VITE_IDENTITY_SERVER}/connect/authorize`;
    private static readonly TOKEN_ENDPOINT = `${import.meta.env.VITE_IDENTITY_SERVER}/connect/token`;
    private static readonly LOGOUT_ENDPOINT = `${import.meta.env.VITE_IDENTITY_SERVER}/connect/logout`;
    private static readonly CLIENT_ID = import.meta.env.VITE_API_CLIENTID;
    private static readonly REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI || `${window.location.origin}/auth/callback`;
    private static readonly POST_LOGOUT_REDIRECT_URI = import.meta.env.VITE_POST_LOGOUT_REDIRECT_URI || window.location.origin;
    private static readonly SCOPE = import.meta.env.VITE_OAUTH_SCOPE || 'openid profile email offline_access';

    /**
     * Generate a random code verifier for PKCE
     */
    private static generateCodeVerifier(): string {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return this.base64URLEncode(array);
    }

    /**
     * Generate code challenge from verifier using SHA-256
     */
    private static async generateCodeChallenge(verifier: string): Promise<string> {
        const encoder = new TextEncoder();
        const data = encoder.encode(verifier);
        const hash = await crypto.subtle.digest('SHA-256', data);
        return this.base64URLEncode(new Uint8Array(hash));
    }

    /**
     * Base64 URL encode
     */
    private static base64URLEncode(buffer: Uint8Array): string {
        const base64 = btoa(String.fromCharCode(...buffer));
        return base64
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    }

    /**
     * Generate random state for CSRF protection
     */
    private static generateState(): string {
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        return this.base64URLEncode(array);
    }

    /**
     * Initiate the OAuth2 login flow
     * Redirects user to IdentityServer login page
     */
    static async initiateLogin(): Promise<void> {
        try {
            // Generate PKCE parameters
            const codeVerifier = this.generateCodeVerifier();
            const codeChallenge = await this.generateCodeChallenge(codeVerifier);
            const state = this.generateState();

            // Store PKCE parameters in sessionStorage
            sessionStorage.setItem('oauth2_code_verifier', codeVerifier);
            sessionStorage.setItem('oauth2_state', state);

            // Build authorization URL
            const params = new URLSearchParams({
                response_type: 'code',
                client_id: this.CLIENT_ID,
                redirect_uri: this.REDIRECT_URI,
                scope: this.SCOPE,
                state: state,
                code_challenge: codeChallenge,
                code_challenge_method: 'S256',
            });

            const authUrl = `${this.AUTH_ENDPOINT}?${params.toString()}`;

            // Redirect to IdentityServer
            window.location.href = authUrl;
        } catch (error) {
            console.error('Failed to initiate login:', error);
            throw new Error('Failed to start authentication process');
        }
    }

    /**
     * Handle the OAuth2 callback
     * Exchange authorization code for tokens
     */
    static async handleCallback(code: string, state: string): Promise<{ access_token: string; refresh_token?: string }> {
        try {
            // Verify state to prevent CSRF attacks
            const storedState = sessionStorage.getItem('oauth2_state');
            if (!storedState || storedState !== state) {
                throw new Error('Invalid state parameter - possible CSRF attack');
            }

            // Get code verifier
            const codeVerifier = sessionStorage.getItem('oauth2_code_verifier');
            if (!codeVerifier) {
                throw new Error('Missing code verifier');
            }

            // Exchange code for tokens
            const response = await fetch(this.TOKEN_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    grant_type: 'authorization_code',
                    client_id: this.CLIENT_ID,
                    redirect_uri: this.REDIRECT_URI,
                    code: code,
                    code_verifier: codeVerifier,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error_description || 'Token exchange failed');
            }

            const tokens = await response.json();

            // Store tokens
            localStorage.setItem('token', tokens.access_token);
            if (tokens.refresh_token) {
                localStorage.setItem('refresh_token', tokens.refresh_token);
            }

            // Clean up session storage
            sessionStorage.removeItem('oauth2_code_verifier');
            sessionStorage.removeItem('oauth2_state');

            return tokens;
        } catch (error) {
            console.error('Callback handling failed:', error);
            throw error;
        }
    }

    /**
     * Refresh the access token using refresh token
     */
    static async refreshAccessToken(): Promise<string> {
        try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) {
                throw new Error('No refresh token available');
            }

            const response = await fetch(this.TOKEN_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    grant_type: 'refresh_token',
                    client_id: this.CLIENT_ID,
                    refresh_token: refreshToken,
                }),
            });

            if (!response.ok) {
                // Refresh token is invalid or expired
                this.logout();
                throw new Error('Refresh token expired');
            }

            const tokens = await response.json();

            // Update stored tokens
            localStorage.setItem('token', tokens.access_token);
            if (tokens.refresh_token) {
                localStorage.setItem('refresh_token', tokens.refresh_token);
            }

            return tokens.access_token;
        } catch (error) {
            console.error('Token refresh failed:', error);
            throw error;
        }
    }

    /**
     * Logout user and clear tokens
     * Optionally redirects to IdentityServer logout
     */
    static logout(redirectToIdentityServer: boolean = true): void {
        const token = localStorage.getItem('token');

        // Clear all auth data
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        sessionStorage.removeItem('oauth2_code_verifier');
        sessionStorage.removeItem('oauth2_state');

        if (redirectToIdentityServer && token) {
            // Redirect to IdentityServer logout endpoint
            const params = new URLSearchParams({
                post_logout_redirect_uri: this.POST_LOGOUT_REDIRECT_URI,
                id_token_hint: token, // Optional: helps IdentityServer identify the session
            });
            window.location.href = `${this.LOGOUT_ENDPOINT}?${params.toString()}`;
        } else {
            // Just redirect to home/login
            window.location.href = '/signin';
        }
    }

    /**
     * Check if user is authenticated
     */
    static isAuthenticated(): boolean {
        const token = localStorage.getItem('token');
        return !!token;
    }
}

export default OAuth2Service;
