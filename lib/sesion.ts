import { cookies } from "next/headers";
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { borrarSesion, crearSesion, usuarioDeSesion, type Usuario } from "./db-server";

export const COOKIE = "impetus_sesion";
const DIAS = 30;

function scryptAsync(password: string, salt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 64, (err, key) => (err ? reject(err) : resolve(key.toString("hex"))));
  });
}

export function nuevoSalt(): string {
  return randomBytes(16).toString("hex");
}

export function hashPassword(password: string, salt: string): Promise<string> {
  return scryptAsync(password, salt);
}

export async function verificarPassword(password: string, hash: string, salt: string): Promise<boolean> {
  const intento = Buffer.from(await scryptAsync(password, salt), "hex");
  const guardado = Buffer.from(hash, "hex");
  if (intento.length !== guardado.length) return false;
  return timingSafeEqual(intento, guardado);
}

export async function abrirSesion(usuarioId: number, secure: boolean): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expira = new Date(Date.now() + DIAS * 24 * 60 * 60 * 1000);
  await crearSesion(usuarioId, token, expira.toISOString());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    // Si la app se sirve por HTTP simple, una cookie "secure" se descarta y la sesión nunca queda abierta.
    secure,
    path: "/",
    maxAge: DIAS * 24 * 60 * 60,
  });
}

export async function usuarioActual(): Promise<Usuario | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  return usuarioDeSesion(token);
}

export async function cerrarSesion(): Promise<void> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (token) await borrarSesion(token);
  store.delete(COOKIE);
}
