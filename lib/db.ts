import type { PaisId } from "./paises";

export type TipoMovimiento = "venta" | "gasto";
export type CategoriaProducto = "alimentos" | "bebidas" | "ropa" | "belleza" | "otros";

export type Meta = "mantener" | "crecer" | "formalizar" | "credito";
export type Formalidad = "ninguna" | "proceso" | "registrada";

export interface Negocio {
  id: number;
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

export interface Sesion {
  email: string;
}

/* ------------------------------------------------------------------ */
/* Cliente: todo pasa por /api/db, que exige sesión y filtra por cuenta */
/* ------------------------------------------------------------------ */

async function pedir<T>(op: string, datos?: unknown): Promise<T> {
  const res = await fetch("/api/db", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ op, datos }),
  });
  if (res.status === 401) throw new Error("sesion-expirada");
  if (!res.ok) throw new Error(`Error ${res.status} al ${op}`);
  return (await res.json()) as T;
}

export const dbApi = {
  getNegocio: () => pedir<Negocio | null>("getNegocio"),
  guardarNegocio: (n: Negocio) => pedir<void>("guardarNegocio", n),
  getMovimientos: () => pedir<Movimiento[]>("getMovimientos"),
  agregarMovimiento: (m: Movimiento) => pedir<number>("agregarMovimiento", m),
  borrarMovimiento: (id: number) => pedir<void>("borrarMovimiento", { id }),
  getProductos: () => pedir<Producto[]>("getProductos"),
  guardarProducto: (p: Producto) => pedir<void>("guardarProducto", p),
  borrarProducto: (id: number) => pedir<void>("borrarProducto", { id }),
  getCierres: () => pedir<Cierre[]>("getCierres"),
  guardarCierre: (c: Cierre) => pedir<void>("guardarCierre", c),
  borrarTodo: () => pedir<void>("borrarTodo"),
};

/* ------------------------------------------------------------------ */
/* Sesión                                                              */
/* ------------------------------------------------------------------ */

export async function sesionActual(): Promise<Sesion | null> {
  const res = await fetch("/api/auth/sesion", { cache: "no-store" });
  if (!res.ok) return null;
  const data = (await res.json()) as { email?: string | null };
  return data.email ? { email: data.email } : null;
}

export async function entrar(email: string, password: string, registro: boolean): Promise<Sesion> {
  const res = await fetch(`/api/auth/${registro ? "registro" : "login"}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string; email?: string };
  if (!res.ok || !data.email) throw new Error(data.error || "No pudimos entrar. Intenta otra vez.");
  return { email: data.email };
}

export async function salir(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
}
