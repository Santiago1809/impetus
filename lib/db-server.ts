import { tursoClient } from "./turso";
import type { Cierre, Movimiento, Negocio, Producto } from "./db";

/* ------------------------------------------------------------------ */
/* Schema + migración (una sola vez por proceso)                       */
/* ------------------------------------------------------------------ */

async function columnas(tabla: string): Promise<string[]> {
  try {
    const r = await tursoClient.execute(`PRAGMA table_info(${tabla})`);
    return r.rows.map((row: any) => String(row.name));
  } catch {
    return [];
  }
}

async function asegurarColumna(tabla: string, columna: string, tipo: string): Promise<void> {
  const cols = await columnas(tabla);
  if (cols.length && !cols.includes(columna)) {
    await tursoClient.execute(`ALTER TABLE ${tabla} ADD COLUMN ${columna} ${tipo}`).catch(() => undefined);
  }
}

async function migrar(): Promise<void> {
  const c = (sql: string) => tursoClient.execute({ sql }).then(() => undefined).catch(() => undefined);

  await c(`CREATE TABLE IF NOT EXISTS usuarios (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE, hash TEXT NOT NULL, salt TEXT NOT NULL, creado TEXT NOT NULL)`);
  await c(`CREATE TABLE IF NOT EXISTS sesiones (token TEXT PRIMARY KEY, usuario_id INTEGER NOT NULL, expira TEXT NOT NULL)`);
  await c(`CREATE TABLE IF NOT EXISTS negocios (usuario_id INTEGER PRIMARY KEY, tipoNegocio TEXT NOT NULL, antiguedadMeses INTEGER NOT NULL DEFAULT 0, meta TEXT NOT NULL DEFAULT 'mantener', formalidad TEXT NOT NULL DEFAULT 'ninguna', ciudad TEXT NOT NULL DEFAULT '', pais TEXT NOT NULL DEFAULT 'CO', avisoAceptado TEXT NOT NULL DEFAULT '', creado TEXT NOT NULL DEFAULT '')`);
  await c(`CREATE TABLE IF NOT EXISTS movimientos (id INTEGER PRIMARY KEY AUTOINCREMENT, usuario_id INTEGER, fecha TEXT NOT NULL, creado TEXT, tipo TEXT NOT NULL CHECK (tipo IN ('venta','gasto')), monto REAL NOT NULL DEFAULT 0, producto TEXT, nota TEXT)`);
  await c(`CREATE TABLE IF NOT EXISTS productos (id INTEGER PRIMARY KEY AUTOINCREMENT, usuario_id INTEGER, nombre TEXT NOT NULL, categoria TEXT, costoProducto REAL NOT NULL DEFAULT 0, costoTransporte REAL NOT NULL DEFAULT 0, costoEmpaque REAL NOT NULL DEFAULT 0, minutos INTEGER NOT NULL DEFAULT 0, valorHora REAL NOT NULL DEFAULT 0, precioVenta REAL NOT NULL DEFAULT 0, ultimaVenta TEXT)`);

  // movimientos/productos viejos: agregar la columna sin perder filas.
  await asegurarColumna("movimientos", "usuario_id", "INTEGER");
  await asegurarColumna("productos", "usuario_id", "INTEGER");

  // cierres viejos tenían PK(fecha): se apartan para poder tener una fila por cuenta y día.
  const colsCierres = await columnas("cierres");
  if (colsCierres.length && !colsCierres.includes("usuario_id")) {
    await c(`ALTER TABLE cierres RENAME TO cierres_legacy`);
  }
  await c(`CREATE TABLE IF NOT EXISTS cierres (usuario_id INTEGER NOT NULL, fecha TEXT NOT NULL, totalVentas REAL NOT NULL DEFAULT 0, totalGastos REAL NOT NULL DEFAULT 0, quedoReal REAL NOT NULL DEFAULT 0, compartido INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (usuario_id, fecha))`);

  // negocio viejo era una sola fila global (id = 1).
  const colsNegocio = await columnas("negocio");
  if (colsNegocio.length && !colsNegocio.includes("usuario_id")) {
    await c(`ALTER TABLE negocio RENAME TO negocio_legacy`);
  }
}

let listo: Promise<void> | null = null;
function schema(): Promise<void> {
  if (!listo) listo = migrar();
  return listo;
}

async function run(query: string, args: (string | number | null)[] = []): Promise<any[]> {
  await schema();
  const res = await tursoClient.execute({ sql: query, args });
  return res.rows as any[];
}

/* ------------------------------------------------------------------ */
/* Cuentas y sesiones                                                  */
/* ------------------------------------------------------------------ */

export interface Usuario {
  id: number;
  email: string;
}

export async function contarUsuarios(): Promise<number> {
  const rows = await run("SELECT COUNT(*) AS n FROM usuarios");
  return Number(rows[0]?.n ?? 0);
}

export async function buscarUsuario(email: string): Promise<{ id: number; email: string; hash: string; salt: string } | null> {
  const rows = await run("SELECT id, email, hash, salt FROM usuarios WHERE email = ?", [email]);
  if (!rows.length) return null;
  const r = rows[0];
  return { id: Number(r.id), email: String(r.email), hash: String(r.hash), salt: String(r.salt) };
}

export async function crearUsuario(email: string, hash: string, salt: string): Promise<number> {
  await run("INSERT INTO usuarios (email, hash, salt, creado) VALUES (?, ?, ?, ?)", [email, hash, salt, new Date().toISOString()]);
  const rows = await run("SELECT id FROM usuarios WHERE email = ?", [email]);
  return Number(rows[0]?.id ?? 0);
}

/** El primer registro hereda los datos sueltos de la versión de un solo negocio. */
export async function adoptarDatosHuerfanos(usuarioId: number): Promise<void> {
  if ((await contarUsuarios()) !== 1) return;
  await run("UPDATE movimientos SET usuario_id = ? WHERE usuario_id IS NULL", [usuarioId]).catch(() => undefined);
  await run("UPDATE productos SET usuario_id = ? WHERE usuario_id IS NULL", [usuarioId]).catch(() => undefined);
  await run(
    "INSERT OR IGNORE INTO cierres (usuario_id, fecha, totalVentas, totalGastos, quedoReal, compartido) SELECT ?, fecha, totalVentas, totalGastos, quedoReal, compartido FROM cierres_legacy",
    [usuarioId],
  ).catch(() => undefined);
  await run(
    "INSERT OR IGNORE INTO negocios (usuario_id, tipoNegocio, antiguedadMeses, meta, formalidad, ciudad, pais, avisoAceptado, creado) SELECT ?, tipoNegocio, antiguedadMeses, meta, formalidad, ciudad, pais, avisoAceptado, creado FROM negocio_legacy",
    [usuarioId],
  ).catch(() => undefined);
}

export async function crearSesion(usuarioId: number, token: string, expira: string): Promise<void> {
  await run("INSERT INTO sesiones (token, usuario_id, expira) VALUES (?, ?, ?)", [token, usuarioId, expira]);
}

export async function usuarioDeSesion(token: string): Promise<Usuario | null> {
  const rows = await run(
    `SELECT u.id, u.email FROM sesiones s JOIN usuarios u ON u.id = s.usuario_id WHERE s.token = ? AND s.expira > ?`,
    [token, new Date().toISOString()],
  );
  if (!rows.length) return null;
  return { id: Number(rows[0].id), email: String(rows[0].email) };
}

export async function borrarSesion(token: string): Promise<void> {
  await run("DELETE FROM sesiones WHERE token = ?", [token]);
}

/* ------------------------------------------------------------------ */
/* Datos del negocio (siempre filtrados por usuario)                   */
/* ------------------------------------------------------------------ */

export async function getNegocio(usuarioId: number): Promise<Negocio | null> {
  const rows = await run("SELECT * FROM negocios WHERE usuario_id = ?", [usuarioId]);
  if (!rows.length) return null;
  const r = rows[0] as Record<string, unknown>;
  return {
    id: Number(r.usuario_id),
    tipoNegocio: String(r.tipoNegocio ?? ""),
    antiguedadMeses: Number(r.antiguedadMeses ?? 0),
    meta: String(r.meta ?? "mantener") as Negocio["meta"],
    formalidad: String(r.formalidad ?? "ninguna") as Negocio["formalidad"],
    ciudad: String(r.ciudad ?? ""),
    pais: String(r.pais ?? "CO") as Negocio["pais"],
    avisoAceptado: String(r.avisoAceptado ?? ""),
    creado: String(r.creado ?? ""),
  };
}

export async function guardarNegocio(usuarioId: number, n: Negocio): Promise<void> {
  await run(
    `INSERT OR REPLACE INTO negocios (usuario_id, tipoNegocio, antiguedadMeses, meta, formalidad, ciudad, pais, avisoAceptado, creado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [usuarioId, n.tipoNegocio, n.antiguedadMeses, n.meta, n.formalidad, n.ciudad, n.pais, n.avisoAceptado, n.creado],
  );
}

export async function getMovimientos(usuarioId: number): Promise<Movimiento[]> {
  const rows = await run(
    "SELECT id, fecha, creado, tipo, monto, producto, nota FROM movimientos WHERE usuario_id = ? ORDER BY fecha DESC, id DESC",
    [usuarioId],
  );
  return rows.map((r: any) => ({
    id: r.id ? Number(r.id) : undefined,
    fecha: String(r.fecha),
    creado: r.creado ? String(r.creado) : undefined,
    tipo: String(r.tipo) as Movimiento["tipo"],
    monto: Number(r.monto ?? 0),
    producto: r.producto ? String(r.producto) : undefined,
    nota: r.nota ? String(r.nota) : undefined,
  }));
}

export async function agregarMovimiento(usuarioId: number, mov: Movimiento): Promise<number> {
  await run(
    `INSERT INTO movimientos (usuario_id, fecha, creado, tipo, monto, producto, nota) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [usuarioId, mov.fecha, mov.creado ?? null, mov.tipo, mov.monto, mov.producto ?? null, mov.nota ?? null],
  );
  const idRow = await run("SELECT last_insert_rowid() AS id");
  return idRow[0]?.id ? Number(idRow[0].id) : 0;
}

export async function borrarMovimiento(usuarioId: number, id: number): Promise<void> {
  await run("DELETE FROM movimientos WHERE id = ? AND usuario_id = ?", [id, usuarioId]);
}

export async function getProductos(usuarioId: number): Promise<Producto[]> {
  const rows = await run(
    "SELECT id, nombre, categoria, costoProducto, costoTransporte, costoEmpaque, minutos, valorHora, precioVenta, ultimaVenta FROM productos WHERE usuario_id = ? ORDER BY nombre",
    [usuarioId],
  );
  return rows.map((r: any) => ({
    id: r.id ? Number(r.id) : undefined,
    nombre: String(r.nombre),
    categoria: r.categoria ? (String(r.categoria) as Producto["categoria"]) : undefined,
    costoProducto: Number(r.costoProducto ?? 0),
    costoTransporte: Number(r.costoTransporte ?? 0),
    costoEmpaque: Number(r.costoEmpaque ?? 0),
    minutos: Number(r.minutos ?? 0),
    valorHora: Number(r.valorHora ?? 0),
    precioVenta: Number(r.precioVenta ?? 0),
    ultimaVenta: r.ultimaVenta ? String(r.ultimaVenta) : undefined,
  }));
}

export async function guardarProducto(usuarioId: number, p: Producto): Promise<void> {
  if (p.id) {
    await run(
      `UPDATE productos SET nombre=?, categoria=?, costoProducto=?, costoTransporte=?, costoEmpaque=?, minutos=?, valorHora=?, precioVenta=?, ultimaVenta=? WHERE id=? AND usuario_id=?`,
      [p.nombre, p.categoria ?? null, p.costoProducto, p.costoTransporte, p.costoEmpaque, p.minutos, p.valorHora, p.precioVenta, p.ultimaVenta ?? null, p.id, usuarioId],
    );
  } else {
    await run(
      `INSERT INTO productos (usuario_id, nombre, categoria, costoProducto, costoTransporte, costoEmpaque, minutos, valorHora, precioVenta, ultimaVenta) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [usuarioId, p.nombre, p.categoria ?? null, p.costoProducto, p.costoTransporte, p.costoEmpaque, p.minutos, p.valorHora, p.precioVenta, p.ultimaVenta ?? null],
    );
  }
}

export async function borrarProducto(usuarioId: number, id: number): Promise<void> {
  await run("DELETE FROM productos WHERE id = ? AND usuario_id = ?", [id, usuarioId]);
}

export async function getCierres(usuarioId: number): Promise<Cierre[]> {
  const rows = await run(
    "SELECT fecha, totalVentas, totalGastos, quedoReal, compartido FROM cierres WHERE usuario_id = ? ORDER BY fecha DESC",
    [usuarioId],
  );
  return rows.map((r: any) => ({
    fecha: String(r.fecha),
    totalVentas: Number(r.totalVentas ?? 0),
    totalGastos: Number(r.totalGastos ?? 0),
    quedoReal: Number(r.quedoReal ?? 0),
    compartido: Boolean(r.compartido),
  }));
}

export async function guardarCierre(usuarioId: number, cierre: Cierre): Promise<void> {
  await run(
    `INSERT OR REPLACE INTO cierres (usuario_id, fecha, totalVentas, totalGastos, quedoReal, compartido) VALUES (?, ?, ?, ?, ?, ?)`,
    [usuarioId, cierre.fecha, cierre.totalVentas, cierre.totalGastos, cierre.quedoReal, cierre.compartido ? 1 : 0],
  );
}

export async function borrarTodo(usuarioId: number): Promise<void> {
  await run("DELETE FROM negocios WHERE usuario_id = ?", [usuarioId]);
  await run("DELETE FROM movimientos WHERE usuario_id = ?", [usuarioId]);
  await run("DELETE FROM productos WHERE usuario_id = ?", [usuarioId]);
  await run("DELETE FROM cierres WHERE usuario_id = ?", [usuarioId]);
}
