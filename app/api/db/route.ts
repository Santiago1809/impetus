import {
  agregarMovimiento,
  borrarMovimiento,
  borrarProducto,
  borrarTodo,
  getCierres,
  getMovimientos,
  getNegocio,
  getProductos,
  guardarCierre,
  guardarNegocio,
  guardarProducto,
} from "@/lib/db-server";
import { usuarioActual } from "@/lib/sesion";

export async function POST(req: Request) {
  const usuario = await usuarioActual();
  if (!usuario) return Response.json({ error: "Necesitas entrar a tu cuenta." }, { status: 401 });

  const { op, datos } = (await req.json().catch(() => ({}))) as { op?: string; datos?: any };

  switch (op) {
    case "getNegocio":
      return Response.json(await getNegocio(usuario.id));
    case "guardarNegocio":
      await guardarNegocio(usuario.id, datos);
      return Response.json({ ok: true });
    case "getMovimientos":
      return Response.json(await getMovimientos(usuario.id));
    case "agregarMovimiento":
      return Response.json(await agregarMovimiento(usuario.id, datos));
    case "borrarMovimiento":
      await borrarMovimiento(usuario.id, Number(datos?.id));
      return Response.json({ ok: true });
    case "getProductos":
      return Response.json(await getProductos(usuario.id));
    case "guardarProducto":
      await guardarProducto(usuario.id, datos);
      return Response.json({ ok: true });
    case "borrarProducto":
      await borrarProducto(usuario.id, Number(datos?.id));
      return Response.json({ ok: true });
    case "getCierres":
      return Response.json(await getCierres(usuario.id));
    case "guardarCierre":
      await guardarCierre(usuario.id, datos);
      return Response.json({ ok: true });
    case "borrarTodo":
      await borrarTodo(usuario.id);
      return Response.json({ ok: true });
    default:
      return Response.json({ error: "Operación desconocida" }, { status: 400 });
  }
}
