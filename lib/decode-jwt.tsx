function decodeJwt<T = Record<string, any>>(token: string): T {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Token JWT inválido");
  }

  // 1. Reemplazar caracteres base64url a base64
  let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");

  // 2. Agregar padding si falta
  const pad = (4 - (base64.length % 4)) % 4;
  base64 += "=".repeat(pad);

  // 3. Decodificar y manejar caracteres UTF-8 correctamente
  const binaryStr = atob(base64);
  const bytes = Uint8Array.from(binaryStr, (c) => c.charCodeAt(0));
  const decodedJson = new TextDecoder("utf-8").decode(bytes);

  return JSON.parse(decodedJson) as T;
}

export default decodeJwt;
