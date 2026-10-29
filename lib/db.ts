import { tursoClient } from "./turso";
import type { PaisId } from "./paises";

export type TipoMovimiento = "venta" | "gasto";
export type CategoriaProducto = "alimentos" | "bebidas" | "ropa" | "belleza" | "otros";

export type Meta = "mantener" | "crecer" | "formalizar" | "credito";
export type Formalidad = "ninguna" | "proceso" | "registrada";

export interface Negocio {
  id: 1;
  tipoNegocio: string;
  antiguedadMeses: number;
  meta: Meta;
  formalidad: Formalidad;
  ciudad: string;
  pais: PaisId;
  avisoAceptado: string;
  creado: string;
}

export interface Movimiento {
  id?: number;
  fecha: string;
  creado?: string;
  tipo: TipoMovimiento;
  monto: number;
  producto?: string;
  nota?: string;
}

export interface Producto {
  id?: number;
  nombre: string;
  categoria?: CategoriaProducto;
  costoProducto: number;
  costoTransporte: number;
  costoEmpaque: number;
  minutos: number;
  valorHora: number;
  precioVenta: number;
  ultimaVenta?: string;
}

export interface Cierre {
  fecha: string;
  totalVentas: number;
  totalGastos: number;
  quedoReal: number;
  compartido: boolean;
}

export interface SyncConfig {
  tursoUrl?: string;
  tursoToken?: string;
  autoSync: boolean;
  lastSync?: string;
}

/* ------------------------------------------------------------------ */
/* Turso backend (libsql / @libsql/client web)                         */
/* ------------------------------------------------------------------ */

async function run(query: string, args?: (string | number | null)[]): Promise<any[]> {
  const res = await tursoClient.execute({ sql: query, args: args ?? [] });
  return res.rows as any[];
}

function initSchemaTable(query: string): Promise<void> {
  return tursoClient.execute({ sql: query }).catch((e: any) => {
    console.warn("Impetus: error en initSchema table", e);
    return undefined;
  }).then(() => undefined);
}

// Ejecutar cada creación por separado al cargar el módulo.
initSchemaTable(`CREATE TABLE IF NOT EXISTS negocio (id INTEGER PRIMARY KEY CHECK (id = 1), tipoNegocio TEXT NOT NULL, antiguedadMeses INTEGER NOT NULL DEFAULT 0, meta TEXT NOT NULL DEFAULT 'mantener', formalidad TEXT NOT NULL DEFAULT 'ninguna', ciudad TEXT NOT NULL DEFAULT '', pais TEXT NOT NULL DEFAULT 'CO', avisoAceptado TEXT NOT NULL DEFAULT '', creado TEXT NOT NULL DEFAULT '')`);
initSchemaTable(`CREATE TABLE IF NOT EXISTS movimientos (id INTEGER PRIMARY KEY AUTOINCREMENT, fecha TEXT NOT NULL, creado TEXT, tipo TEXT NOT NULL CHECK (tipo IN ('venta','gasto')), monto REAL NOT NULL DEFAULT 0, producto TEXT, nota TEXT)`);
initSchemaTable(`CREATE TABLE IF NOT EXISTS productos (id INTEGER PRIMARY KEY AUTOINCREMENT, nombre TEXT NOT NULL, categoria TEXT, costoProducto REAL NOT NULL DEFAULT 0, costoTransporte REAL NOT NULL DEFAULT 0, costoEmpaque REAL NOT NULL DEFAULT 0, minutos INTEGER NOT NULL DEFAULT 0, valorHora REAL NOT NULL DEFAULT 0, precioVenta REAL NOT NULL DEFAULT 0, ultimaVenta TEXT)`);
initSchemaTable(`CREATE TABLE IF NOT EXISTS cierres (fecha TEXT PRIMARY KEY, totalVentas REAL NOT NULL DEFAULT 0, totalGastos REAL NOT NULL DEFAULT 0, quedoReal REAL NOT NULL DEFAULT 0, compartido INTEGER NOT NULL DEFAULT 0)`);
initSchemaTable(`CREATE TABLE IF NOT EXISTS sync_state (id INTEGER PRIMARY KEY CHECK (id = 1), lastSync TEXT)`);

export async function getNegocio(): Promise<Negocio | null> {
  try {
    const rows = await run("SELECT * FROM negocio WHERE id = 1");
    if (!rows.length) return null;
    const r = rows[0] as Record<string, unknown>;
    return {
      id: 1,
      tipoNegocio: String(r.tipoNegocio ?? ""),
      antiguedadMeses: Number(r.antiguedadMeses ?? 0),
      meta: String(r.meta ?? "mantener") as Meta,
      formalidad: String(r.formalidad ?? "ninguna") as Formalidad,
      ciudad: String(r.ciudad ?? ""),
      pais: String(r.pais ?? "CO") as PaisId,
      avisoAceptado: String(r.avisoAceptado ?? ""),
      creado: String(r.creado ?? ""),
    };
  } catch {
    return null;
  }
}

export async function guardarNegocio(negocio: Negocio): Promise<void> {
  await run(
    `INSERT OR REPLACE INTO negocio (id, tipoNegocio, antiguedadMeses, meta, formalidad, ciudad, pais, avisoAceptado, creado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [1, negocio.tipoNegocio, negocio.antiguedadMeses, negocio.meta, negocio.formalidad, negocio.ciudad, negocio.pais, negocio.avisoAceptado, negocio.creado]
  );
}

export async function getMovimientos(): Promise<Movimiento[]> {
  const rows = await run("SELECT id, fecha, creado, tipo, monto, producto, nota FROM movimientos ORDER BY fecha DESC, id DESC");
  return rows.map((r: any) => ({
    id: r.id ? Number(r.id) : undefined,
    fecha: String(r.fecha),
    creado: r.creado ? String(r.creado) : undefined,
    tipo: String(r.tipo) as TipoMovimiento,
    monto: Number(r.monto ?? 0),
    producto: r.producto ? String(r.producto) : undefined,
    nota: r.nota ? String(r.nota) : undefined,
  }));
}

export async function agregarMovimiento(mov: Movimiento): Promise<number> {
  const res = await run(
    `INSERT INTO movimientos (fecha, creado, tipo, monto, producto, nota) VALUES (?, ?, ?, ?, ?, ?)`,
    [mov.fecha, mov.creado ?? null, mov.tipo, mov.monto, mov.producto ?? null, mov.nota ?? null]
  );
  const idRow = await run("SELECT last_insert_rowid() AS id");
  return idRow[0]?.id ? Number(idRow[0].id) : 0;
}

export async function borrarMovimiento(id: number): Promise<void> {
  await run("DELETE FROM movimientos WHERE id = ?", [id]);
}

export async function getProductos(): Promise<Producto[]> {
  const rows = await run("SELECT id, nombre, categoria, costoProducto, costoTransporte, costoEmpaque, minutos, valorHora, precioVenta, ultimaVenta FROM productos ORDER BY nombre");
  return rows.map((r: any) => ({
    id: r.id ? Number(r.id) : undefined,
    nombre: String(r.nombre),
    categoria: r.categoria ? (String(r.categoria) as CategoriaProducto) : undefined,
    costoProducto: Number(r.costoProducto ?? 0),
    costoTransporte: Number(r.costoTransporte ?? 0),
    costoEmpaque: Number(r.costoEmpaque ?? 0),
    minutos: Number(r.minutos ?? 0),
    valorHora: Number(r.valorHora ?? 0),
    precioVenta: Number(r.precioVenta ?? 0),
    ultimaVenta: r.ultimaVenta ? String(r.ultimaVenta) : undefined,
  }));
}

export async function guardarProducto(producto: Producto): Promise<void> {
  if (producto.id) {
    await run(
      `UPDATE productos SET nombre=?, categoria=?, costoProducto=?, costoTransporte=?, costoEmpaque=?, minutos=?, valorHora=?, precioVenta=?, ultimaVenta=? WHERE id=?`,
      [producto.nombre, producto.categoria ?? null, producto.costoProducto, producto.costoTransporte, producto.costoEmpaque, producto.minutos, producto.valorHora, producto.precioVenta, producto.ultimaVenta ?? null, producto.id]
    );
  } else {
    await run(
      `INSERT INTO productos (nombre, categoria, costoProducto, costoTransporte, costoEmpaque, minutos, valorHora, precioVenta, ultimaVenta) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [producto.nombre, producto.categoria ?? null, producto.costoProducto, producto.costoTransporte, producto.costoEmpaque, producto.minutos, producto.valorHora, producto.precioVenta, producto.ultimaVenta ?? null]
    );
  }
}

export async function borrarProducto(id: number): Promise<void> {
  await run("DELETE FROM productos WHERE id = ?", [id]);
}

export async function getCierres(): Promise<Cierre[]> {
  const rows = await run("SELECT fecha, totalVentas, totalGastos, quedoReal, compartido FROM cierres ORDER BY fecha DESC");
  return rows.map((r: any) => ({
    fecha: String(r.fecha),
    totalVentas: Number(r.totalVentas ?? 0),
    totalGastos: Number(r.totalGastos ?? 0),
    quedoReal: Number(r.quedoReal ?? 0),
    compartido: Boolean(r.compartido),
  }));
}

export async function guardarCierre(cierre: Cierre): Promise<void> {
  await run(
    `INSERT OR REPLACE INTO cierres (fecha, totalVentas, totalGastos, quedoReal, compartido) VALUES (?, ?, ?, ?, ?)`,
    [cierre.fecha, cierre.totalVentas, cierre.totalGastos, cierre.quedoReal, cierre.compartido ? 1 : 0]
  );
}

export async function borrarTodo(): Promise<void> {
  await run("DELETE FROM negocio");
  await run("DELETE FROM movimientos");
  await run("DELETE FROM productos");
  await run("DELETE FROM cierres");
}

/* ------------------------------------------------------------------ */
/* Sync / export / import                                              */
/* ------------------------------------------------------------------ */

export async function loadSyncConfig(): Promise<SyncConfig> {
  try {
    const stored = localStorage.getItem("impetus_sync");
    if (stored) return JSON.parse(stored) as SyncConfig;
  } catch { /* ignore */ }
  return { autoSync: true };
}

export async function saveSyncConfig(cfg: SyncConfig): Promise<void> {
  try { localStorage.setItem("impetus_sync", JSON.stringify(cfg)); } catch { /* ignore */ }
}

export async function exportData(): Promise<string> {
  const negocio = await getNegocio();
  const movs = await getMovimientos();
  const productos = await getProductos();
  const cierres = await getCierres();
  return JSON.stringify({ version: 1, exportado: new Date().toISOString(), negocio, movimientos: movs, productos, cierres }, null, 2);
}

export async function importData(json: string): Promise<void> {
  const payload = JSON.parse(json);
  await borrarTodo();
  if (payload.negocio) await guardarNegocio(payload.negocio);
  for (const m of payload.movimientos ?? []) {
    await run(`INSERT INTO movimientos (fecha, creado, tipo, monto, producto, nota) VALUES (?, ?, ?, ?, ?, ?)`,
      [m.fecha, m.creado ?? null, m.tipo, m.monto, m.producto ?? null, m.nota ?? null]);
  }
  for (const p of payload.productos ?? []) {
    await guardarProducto(p);
  }
  for (const c of payload.cierres ?? []) {
    await guardarCierre(c);
  }
}

/* ------------------------------------------------------------------ */
/* Lazy init wrapper (dbApi)                                          */
/* ------------------------------------------------------------------ */

let initPromise: Promise<void> | null = null;

function ensureInit(): Promise<void> {
  if (!initPromise) {
    initPromise = new Promise((resolve) => resolve());
  }
  return initPromise;
}

function withInit<T>(fn: () => Promise<T>): Promise<T> {
  return ensureInit().then(() => fn());
}

export const dbApi = {
  getNegocio: () => withInit(() => getNegocio()),
  guardarNegocio: (n: Negocio) => withInit(() => guardarNegocio(n)),
  getMovimientos: () => withInit(() => getMovimientos()),
  agregarMovimiento: (m: Movimiento) => withInit(() => agregarMovimiento(m)),
  borrarMovimiento: (id: number) => withInit(() => borrarMovimiento(id)),
  getProductos: () => withInit(() => getProductos()),
  guardarProducto: (p: Producto) => withInit(() => guardarProducto(p)),
  borrarProducto: (id: number) => withInit(() => borrarProducto(id)),
  getCierres: () => withInit(() => getCierres()),
  guardarCierre: (c: Cierre) => withInit(() => guardarCierre(c)),
  borrarTodo: () => withInit(() => borrarTodo()),
  loadSyncConfig: () => withInit(() => loadSyncConfig()),
  saveSyncConfig: (cfg: SyncConfig) => withInit(() => saveSyncConfig(cfg)),
  exportData: () => withInit(() => exportData()),
  importData: (json: string) => withInit(() => importData(json)),
};
