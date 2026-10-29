import { PAISES, type PaisId } from "./paises";

export function dinero(valor: number, pais: PaisId): string {
  const p = PAISES[pais];
  const texto = new Intl.NumberFormat(p.locale, {
    style: "currency",
    currency: p.moneda,
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(valor) ? Math.round(valor) : 0);
  return texto.replace(/\u00a0/g, " ");
}

/** Plain grouped number, no symbol. Used inside the keypad display. */
export function numero(valor: number, pais: PaisId): string {
  return new Intl.NumberFormat(PAISES[pais].locale, { maximumFractionDigits: 0 }).format(
    Number.isFinite(valor) ? Math.round(valor) : 0,
  );
}

/** Local date as YYYY-MM-DD. Avoids UTC drift from toISOString(). */
export function hoyISO(d = new Date()): string {
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

export function fechaLarga(iso: string, pais: PaisId = "CO"): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(PAISES[pais].locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function fechaCorta(iso: string, pais: PaisId = "CO"): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(PAISES[pais].locale, {
    day: "numeric",
    month: "short",
  });
}

export function restarDias(iso: string, dias: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const fecha = new Date(y, m - 1, d);
  fecha.setDate(fecha.getDate() - dias);
  return hoyISO(fecha);
}

/** "12.500" -> 12500, "12,5" -> 12.5 */
export function aNumero(texto: string): number {
  const limpio = texto.replace(/[^\d.,-]/g, "").replace(/\./g, "").replace(",", ".");
  const n = Number.parseFloat(limpio);
  return Number.isFinite(n) ? n : 0;
}

export function porcentaje(valor: number, total: number): number {
  if (!total) return 0;
  return Math.round((valor / total) * 100);
}
