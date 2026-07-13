import { jwtDecode } from "jwt-decode";
import { ITokenInfo, ITokenResponse } from "../types";
import { BaseEndpoints } from "../config/BaseEndpoints";

let pendingFetch: Promise<string> | null = null;
let pendingQueue: Array<{ resolve: (token: string) => void; reject: (err: Error) => void }> = [];
let initPromise: Promise<string> | null = null;

async function fetchTokenFromServer(): Promise<string> {
  const res = await fetch(`${BaseEndpoints.base}/connect/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: import.meta.env.VITE_API_CLIENTID,
      client_secret: import.meta.env.VITE_API_SECRET,
      grant_type: "client_credentials",
    }),
  });
  if (!res.ok) throw new Error(`Token fetch failed: ${res.status}`);
  const data: ITokenResponse = await res.json();
  return data.access_token;
}

function isTokenExpired(token: string): boolean {
  try {
    const info = jwtDecode<ITokenInfo>(token);
    const now = Math.floor(Date.now() / 1000);
    return !info.exp || info.exp < now + 60;
  } catch {
    return true;
  }
}

function getLocalToken(): string | null {
  try { return localStorage.getItem("token"); }
  catch { return null; }
}

function setLocalToken(token: string): void {
  try { localStorage.setItem("token", token); }
  catch { /* noop */ }
}

/**
 * Ensures a valid access token is available.
 * - Returns cached token if not expired
 * - If expired/missing, fetches a new one (client-credentials grant)
 * - Concurrent callers are queued and share the same fetch
 * - On failure, clears pending state so next call can retry
 */
export async function getValidToken(): Promise<string> {
  const existing = getLocalToken();
  if (existing && !isTokenExpired(existing)) return existing;

  if (pendingFetch) {
    return new Promise<string>((resolve, reject) => {
      pendingQueue.push({ resolve, reject });
    });
  }

  pendingFetch = (async () => {
    const token = await fetchTokenFromServer();
    setLocalToken(token);
    return token;
  })();

  try {
    const token = await pendingFetch;
    const queue = pendingQueue;
    pendingQueue = [];
    for (const { resolve } of queue) resolve(token);
    return token;
  } catch (err) {
    const queue = pendingQueue;
    pendingQueue = [];
    for (const { reject } of queue) reject(err as Error);
    throw err;
  } finally {
    pendingFetch = null;
  }
}

/**
 * Called once on app startup to proactively fetch a token.
 * Subsequent calls to getValidToken() use the cached result or storage.
 */
export function initToken(): Promise<string> {
  if (!initPromise) {
    initPromise = getValidToken().catch(err => {
      console.error("initToken failed:", err);
      initPromise = null;
      throw err;
    });
  }
  return initPromise;
}

/**
 * Clears the stored token (logout / session expiry).
 */
export function clearToken(): void {
  try { localStorage.removeItem("token"); }
  catch { /* noop */ }
}
