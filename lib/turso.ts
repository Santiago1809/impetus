import { createClient } from "@libsql/client/web";

const url = typeof process !== "undefined" && process.env?.NEXT_PUBLIC_TURSO_URL
  ? process.env.NEXT_PUBLIC_TURSO_URL
  : (typeof window !== "undefined" && (window as any).ENV?.TURSO_URL) || "";

const authToken = typeof process !== "undefined" && process.env?.NEXT_PUBLIC_TURSO_TOKEN
  ? process.env.NEXT_PUBLIC_TURSO_TOKEN
  : (typeof window !== "undefined" && (window as any).ENV?.TURSO_TOKEN) || "";

export const tursoClient = createClient({ url, authToken });

export type TursoRow = Record<string, unknown>;
