export interface Costos {
  costoProducto: number;
  costoTransporte: number;
  costoEmpaque: number;
  minutos: number;
  valorHora: number;
}

export interface Desglose extends Costos {
  manoObra: number;
  costoReal: number;
}

/** Costo completo de una unidad: insumos + transporte + empaque + tiempo propio. */
export function desglosar(costos: Costos): Desglose {
  const limpio = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0);
  const costoProducto = limpio(costos.costoProducto);
  const costoTransporte = limpio(costos.costoTransporte);
  const costoEmpaque = limpio(costos.costoEmpaque);
  const minutos = limpio(costos.minutos);
  const valorHora = limpio(costos.valorHora);
  const manoObra = (minutos / 60) * valorHora;
  return {
    costoProducto,
    costoTransporte,
    costoEmpaque,
    minutos,
    valorHora,
    manoObra,
    costoReal: costoProducto + costoTransporte + costoEmpaque + manoObra,
  };
}

/** Precio para obtener un margen sobre el precio de venta (no un recargo sobre el costo). */
export function precioParaMargen(costoReal: number, margen: number): number {
  const m = Math.min(Math.max(margen, 0), 0.9);
  return m >= 0.9 ? costoReal * 10 : costoReal / (1 - m);
}

/** Margen que deja un precio de venta dado. */
export function margenDe(precioVenta: number, costoReal: number): number {
  if (!precioVenta) return 0;
  return (precioVenta - costoReal) / precioVenta;
}

/** Redondea a los mil más cercanos, hacia arriba, como se cotiza en la calle. */
export function redondearMil(valor: number): number {
  return Math.ceil(valor / 1000) * 1000;
}

/** Precio de un pedido al por mayor: el margen se aplica al costo de todas las unidades. */
export function precioPedido(costoUnitario: number, cantidad: number, margen: number) {
  const n = Math.max(1, Math.floor(cantidad) || 1);
  const costoTotal = costoUnitario * n;
  const total = redondearMil(precioParaMargen(costoTotal, margen));
  return {
    cantidad: n,
    costoTotal,
    total,
    porUnidad: Math.ceil(total / n),
    ganancia: total - costoTotal,
  };
}
