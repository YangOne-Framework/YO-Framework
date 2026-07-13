import { jwtDecode } from "jwt-decode";
import { ITokenInfo } from "../types";
import OAuth2Service from "../services/OAuth2Service";

class AuthHelper {
    static SetNewLogin = (token: any) => {
        localStorage.setItem("token", token);
        const tokenInfo: ITokenInfo = jwtDecode(token);
        return tokenInfo;
    }
    static Logout = () => {
        localStorage.removeItem("token");
        window.location.href = "/signin";
        //OAuth2Service.logout(true); // Redirect to IdentityServer logout
    }
    static isLoggedIn(): boolean {
        const token: any = localStorage.getItem("token");
        try {
            if (token == undefined)
                return false
            const tokenInfo: any = jwtDecode(token);
            if (tokenInfo == undefined)
                return false
            if (tokenInfo?.IdUid == undefined)
                return false
            return parseInt(tokenInfo?.IdUid || "0") >= 0;
        } catch (error) {
            console.error("Error decoding token:", error);
            return false;
        }
    }

    static getUserRoles(): string[] {
        const token = localStorage.getItem("token");
        if (!token) {
            return [];
        }

        try {
            const tokenInfo = jwtDecode(token) as ITokenInfo;
            return tokenInfo.role || [];
        } catch (error) {
            console.error("Error decoding token:", error);
            return [];
        }
    }

    static getUserProfile(): any {
        const token = localStorage.getItem("token");
        if (!token) {
            return null;
        }

        try {
            const tokenInfo = jwtDecode(token) as ITokenInfo;
            return tokenInfo || null;
        } catch (error) {
            console.error("Error decoding token:", error);
            return null;
        }
    }

    static getUserId(): string | null {
        const token = localStorage.getItem("token");
        if (!token) {
            return null;
        }

        try {
            const tokenInfo = jwtDecode(token) as ITokenInfo;
            return tokenInfo.IdUid || null;
        } catch (error) {
            console.error("Error decoding token:", error);
            return null;
        }
    }
    static getTokenInfo(): ITokenInfo | null {
        const token = localStorage.getItem("token");
        if (!token) {
            return null;
        }

        try {
            const tokenInfo = jwtDecode(token) as ITokenInfo;
            return tokenInfo || null;
        } catch (error) {
            console.error("Error decoding token:", error);
            return null;
        }
    }
}

export default AuthHelper;