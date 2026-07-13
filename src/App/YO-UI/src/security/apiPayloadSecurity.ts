// Server sends PascalCase from Newtonsoft DefaultContractResolver.
// Handle both PascalCase (server) and camelCase (convention) defensively.
const prefix = ")]}'\n";

const DEBUG = import.meta.env.VITE_API_PAYLOAD_DEBUG === "true";

function debugLog(label: string, data: unknown) {
  if (DEBUG) {
    console.log(`[API Payload Debug] ${label}`, data);
  }
}

function getProp(obj: any, pascal: string, camel: string): any {
  return obj[pascal] ?? obj[camel];
}

/**
 * Unwrap a potentially protected API response back to the original data.
 * If the response is not protected, it is returned as-is.
 */
export async function unwrapApiResponse<T>(data: any): Promise<T> {
  if (!data) return data as T;

  const isProtected = getProp(data, "ProtectedPayload", "protectedPayload");
  if (isProtected !== true) return data as T;

  const mode: string = getProp(data, "Mode", "mode") ?? "None";
  const payload: string = getProp(data, "Payload", "payload") ?? "";

  debugLog("Raw protected response", { mode, payloadLength: payload.length, payloadPreview: payload.slice(0, 120) });

  if (mode === "Obfuscation") {
    const json = deobfuscate(payload);
    debugLog("Deobfuscated JSON", json);
    const parsed = JSON.parse(json) as T;
    debugLog("Parsed result", parsed);
    return parsed;
  }

  if (mode === "Encryption") {
    const json = await decryptAesCbc(payload);
    debugLog("Decrypted JSON", json);
    const parsed = JSON.parse(json) as T;
    debugLog("Parsed result", parsed);
    return parsed;
  }

  return data as T;
}

/**
 * Deobfuscate a base64-encoded string with optional JSON-hijacking prefix.
 */
export function deobfuscate(value: string): string {
  let raw = value;

  if (raw.startsWith(prefix)) {
    raw = raw.substring(prefix.length);
  }

  const binary = atob(raw);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new TextDecoder().decode(bytes);
}

/**
 * Decrypt an AES-CBC encrypted base64 payload using Web Crypto API.
 * Keys are read from VITE_API_ENCRYPTION_KEY and VITE_API_ENCRYPTION_IV env vars.
 */
async function decryptAesCbc(encryptedBase64: string): Promise<string> {
  const keyText = import.meta.env.VITE_API_ENCRYPTION_KEY || "";
  const ivText = import.meta.env.VITE_API_ENCRYPTION_IV || "";

  debugLog("Decryption key/IV (raw from env)", {
    keyLength: keyText.length,
    keyPreview: keyText.slice(0, 16) + "...",
    ivText,
  });

  const keyBytes = toFixedUtf8Bytes(keyText, 32);
  const ivBytes = toFixedUtf8Bytes(ivText, 16);

  try {
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      new Uint8Array(keyBytes),
      { name: "AES-CBC" },
      false,
      ["decrypt"],
    );

    const encryptedBytes = base64ToUint8Array(encryptedBase64);

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-CBC", iv: new Uint8Array(ivBytes) },
      cryptoKey,
      new Uint8Array(encryptedBytes),
    );

    return new TextDecoder().decode(decryptedBuffer);
  } catch (err) {
    console.error("[API Payload] AES-CBC decryption failed", err);
    throw err;
  }
}

function toFixedUtf8Bytes(value: string, length: number): Uint8Array {
  const padded = value.padEnd(length, "0").substring(0, length);
  return new TextEncoder().encode(padded);
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}
