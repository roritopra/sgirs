export function decodeBase64Url(input: string): string {
  try {
    // Reemplazar caracteres URL-safe y manejar padding
    let base64 = input.replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4;
    if (pad) {
      base64 += "=".repeat(4 - pad);
    }
    if (typeof atob === "function") {
      return decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
    }
    // Entorno no-browser (fallback)
    return Buffer.from(base64, "base64").toString("utf-8");
  } catch {
    return "";
  }
}

export function decodeJwtPayload(token: string): any | null {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  // JWT estándar: header.payload.signature
  // Algunos tokens pueden venir como payload.signature (2 partes) o solo payload
  const payloadPart = parts.length >= 3 ? parts[1] : parts.length === 2 ? parts[0] : parts[0];
  try {
    const json = decodeBase64Url(payloadPart);
    return json ? JSON.parse(json) : null;
  } catch {
    return null;
  }
}

export function getSubFromToken(token: string): string | null {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.sub === "undefined" || payload.sub === null) return null;
  return String(payload.sub);
}
