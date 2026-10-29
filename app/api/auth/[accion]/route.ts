import { buscarUsuario, crearUsuario } from "@/lib/db-server";
import {
  abrirSesion,
  cerrarSesion,
  hashPassword,
  nuevoSalt,
  usuarioActual,
  verificarPassword,
} from "@/lib/sesion";

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** La cookie va "secure" solo si la petición llegó por HTTPS. */
function esSegura(req: Request): boolean {
  const proto = req.headers.get("x-forwarded-proto");
  if (proto) return proto.split(",")[0].trim() === "https";
  try {
    return new URL(req.url).protocol === "https:";
  } catch {
    return false;
  }
}

export async function GET(_req: Request, ctx: { params: Promise<{ accion: string }> }) {
  const { accion } = await ctx.params;
  if (accion !== "sesion") return Response.json({ error: "No encontrado" }, { status: 404 });
  const usuario = await usuarioActual();
  return Response.json({ email: usuario?.email ?? null });
}

export async function POST(req: Request, ctx: { params: Promise<{ accion: string }> }) {
  const { accion } = await ctx.params;

  if (accion === "logout") {
    await cerrarSesion();
    return Response.json({ ok: true });
  }

  if (accion !== "registro" && accion !== "login") {
    return Response.json({ error: "No encontrado" }, { status: 404 });
  }

  const cuerpo = (await req.json().catch(() => ({}))) as { email?: string; password?: string };
  const email = (cuerpo.email ?? "").trim().toLowerCase();
  const password = cuerpo.password ?? "";

  if (!CORREO.test(email)) {
    return Response.json({ error: "Escribe un correo válido." }, { status: 400 });
  }
  if (password.length < 6) {
    return Response.json({ error: "La contraseña necesita al menos 6 caracteres." }, { status: 400 });
  }

  if (accion === "registro") {
    if (await buscarUsuario(email)) {
      return Response.json({ error: "Ese correo ya tiene cuenta. Inicia sesión." }, { status: 409 });
    }
    const salt = nuevoSalt();
    const id = await crearUsuario(email, await hashPassword(password, salt), salt);
    await abrirSesion(id, esSegura(req));
    return Response.json({ email });
  }

  const usuario = await buscarUsuario(email);
  const valido = usuario ? await verificarPassword(password, usuario.hash, usuario.salt) : false;
  if (!usuario || !valido) {
    return Response.json({ error: "Correo o contraseña incorrectos." }, { status: 401 });
  }
  await abrirSesion(usuario.id, esSegura(req));
  return Response.json({ email: usuario.email });
}
