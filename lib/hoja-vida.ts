import type { Movimiento } from "./db";
import { hoyISO, restarDias } from "./format";

export const DIAS_PARA_RUTA = 15;

export interface Resumen {
  diasRegistrados: number;
  diasUltimos30: number;
  ventasPromedio: number;
  constancia: number; // 0..1
  racha: number;
  desde: string | null;
  totalVentas30: number;
  totalGastos30: number;
  hayVenta: boolean;
}

export function resumir(movs: Movimiento[]): Resumen {
  const hoy = hoyISO();
  const hace30 = restarDias(hoy, 29);

  const dias = new Set(movs.map((m) => m.fecha));
  const dias30 = new Set(movs.filter((m) => m.fecha >= hace30 && m.fecha <= hoy).map((m) => m.fecha));

  let totalVentas30 = 0;
  let totalGastos30 = 0;
  for (const m of movs) {
    if (m.fecha < hace30 || m.fecha > hoy) continue;
    if (m.tipo === "venta") totalVentas30 += m.monto;
    else totalGastos30 += m.monto;
  }

  // Consecutive days ending today, or yesterday if today is still empty.
  let racha = 0;
  let cursor = dias.has(hoy) ? hoy : restarDias(hoy, 1);
  while (dias.has(cursor)) {
    racha += 1;
    cursor = restarDias(cursor, 1);
  }

  const ordenadas = [...dias].sort();

  return {
    diasRegistrados: dias.size,
    diasUltimos30: dias30.size,
    ventasPromedio: dias30.size ? totalVentas30 / dias30.size : 0,
    constancia: Math.min(dias30.size / 30, 1),
    racha,
    desde: ordenadas[0] ?? null,
    totalVentas30,
    totalGastos30,
    hayVenta: movs.some((m) => m.tipo === "venta"),
  };
}

export function rutaDesbloqueada(resumen: Resumen): boolean {
  return resumen.hayVenta;
}

export function movimientosDelDia(movs: Movimiento[], fecha = hoyISO()): Movimiento[] {
  return movs.filter((m) => m.fecha === fecha);
}

export function totales(movs: Movimiento[]) {
  let ventas = 0;
  let gastos = 0;
  for (const m of movs) {
    if (m.tipo === "venta") ventas += m.monto;
    else gastos += m.monto;
  }
  return { ventas, gastos, quedo: ventas - gastos };
}
