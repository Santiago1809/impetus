import { dbApi } from "./db";
import { hoyISO, restarDias } from "./format";
import { PAISES, type PaisId } from "./paises";
import type { CategoriaProducto } from "./db";

/** Seeds 18 consecutive days so the Ruta unlock can be demoed without waiting. */
export async function cargarEjemplo(pais: PaisId): Promise<void> {
  const base = PAISES[pais].valorHora;
  const paso = base >= 10000 ? 500 : base >= 1000 ? 100 : 10;
  const redondear = (n: number) => Math.max(paso, Math.round(n / paso) * paso);
  const hoy = hoyISO();
  const comidas: CategoriaProducto[] = ["alimentos", "alimentos", "bebidas", "bebidas"];
  const rango = (min: number, max: number) => min + Math.random() * (max - min);

  for (let i = 0; i < 18; i += 1) {
    const fecha = restarDias(hoy, i);
    const ventas = 2 + Math.floor(Math.random() * 3);
    for (let v = 0; v < ventas; v += 1) {
      await dbApi.agregarMovimiento({
        fecha,
        creado: `${fecha}T${String(9 + ((v * 2) % 9)).padStart(2, "0")}:${String((v * 17) % 60).padStart(2, "0")}:00`,
        tipo: "venta",
        monto: redondear(base * rango(1.2, 3.4)),
        producto: comidas[Math.floor(Math.random() * comidas.length)] === "alimentos" ? "Almuerzo" : "Bebida",
      });
    }
    if (Math.random() < 0.65) {
      await dbApi.agregarMovimiento({
        fecha,
        creado: `${fecha}T18:15:00`,
        tipo: "gasto",
        monto: redondear(base * rango(0.4, 1.4)),
        nota: "Insumos",
      });
    }
  }

  await dbApi.guardarProducto({
    nombre: "Almuerzo del día",
    categoria: "alimentos",
    costoProducto: redondear(base * 1.1),
    costoTransporte: redondear(base * 0.2),
    costoEmpaque: redondear(base * 0.25),
    minutos: 20,
    valorHora: base,
    precioVenta: redondear(base * 2.8),
  });
  await dbApi.guardarProducto({
    nombre: "Postre",
    categoria: "alimentos",
    costoProducto: redondear(base * 0.5),
    costoTransporte: redondear(base * 0.1),
    costoEmpaque: redondear(base * 0.2),
    minutos: 12,
    valorHora: base,
    precioVenta: redondear(base * 1.4),
  });
}
