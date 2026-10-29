import { createClient } from "@libsql/client";

// Solo se importa desde el servidor (rutas API). El navegador nunca ve el token.
// Acepta libsql://... remoto y file:... para trabajar en local sin red.
const url = process.env.TURSO_URL || process.env.NEXT_PUBLIC_TURSO_URL || "";
const authToken = process.env.TURSO_TOKEN || process.env.NEXT_PUBLIC_TURSO_TOKEN || "";

export const tursoClient = createClient({ url, authToken });

export type TursoRow = Record<string, unknown>;
