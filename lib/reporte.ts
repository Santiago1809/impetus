import type { Movimiento, Negocio } from "./db";
import { dinero, hoyISO } from "./format";
import { PAISES } from "./paises";

function fecha(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function recortar(doc: any, texto: string, ancho: number): string {
  const lineas = doc.splitTextToSize(texto, ancho);
  return lineas.length ? lineas[0] : "";
}

/**
 * Genera y descarga un PDF con el historial de ventas del negocio.
 * Se carga jsPDF en el navegador, solo cuando el usuario pide el reporte.
 */
export async function generarReporteVentas(negocio: Negocio, movs: Movimiento[]): Promise<boolean> {
  const ventas = movs
    .filter((m) => m.tipo === "venta")
    .sort((a, b) => (a.fecha === b.fecha ? (a.id ?? 0) - (b.id ?? 0) : a.fecha.localeCompare(b.fecha)));

  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const p = PAISES[negocio.pais];
  const ancho = doc.internal.pageSize.getWidth();
  const alto = doc.internal.pageSize.getHeight();
  const margen = 16;
  const hoy = hoyISO();

  const total = ventas.reduce((s, v) => s + v.monto, 0);
  const dias = new Set(ventas.map((v) => v.fecha)).size;
  const promedio = dias ? total / dias : 0;

  /* ------------------------------ Encabezado ------------------------------ */
  doc.setFillColor(23, 73, 60);
  doc.rect(0, 0, ancho, 34, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("IMPETUS", margen, 12);
  doc.setFontSize(19);
  doc.text("Reporte de ventas", margen, 24);

  doc.setFontSize(11);
  doc.text(recortar(doc, negocio.tipoNegocio, 90), ancho - margen, 14, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`${negocio.ciudad}, ${p.nombre}`, ancho - margen, 21, { align: "right" });

  /* --------------------------------- Meta --------------------------------- */
  doc.setTextColor(107, 118, 113);
  doc.setFontSize(9);
  const periodo = ventas.length
    ? `${fecha(ventas[0].fecha)} - ${fecha(ventas[ventas.length - 1].fecha)}`
    : "Sin ventas registradas";
  doc.text(`Generado: ${fecha(hoy)}`, margen, 44);
  doc.text(`Periodo: ${periodo}`, ancho - margen, 44, { align: "right" });

  /* ------------------------------- Resumen -------------------------------- */
  const tarjetas = [
    ["Total vendido", dinero(total, negocio.pais)],
    ["Ventas", String(ventas.length)],
    ["Promedio por día", dinero(promedio, negocio.pais)],
    ["Días con ventas", String(dias)],
  ];
  const separacion = 3;
  const anchoTarjeta = (ancho - margen * 2 - separacion * 3) / 4;

  tarjetas.forEach(([etiqueta, valor], i) => {
    const x = margen + i * (anchoTarjeta + separacion);
    doc.setFillColor(242, 241, 236);
    doc.roundedRect(x, 50, anchoTarjeta, 18, 2, 2, "F");
    doc.setTextColor(107, 118, 113);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text(etiqueta.toUpperCase(), x + 3, 56);
    doc.setTextColor(18, 32, 26);
    doc.setFontSize(11);
    doc.text(recortar(doc, valor, anchoTarjeta - 6), x + 3, 63);
  });

  /* -------------------------------- Tabla --------------------------------- */
  let y = 78;

  function cabeceraTabla() {
    doc.setFillColor(230, 239, 234);
    doc.rect(margen, y, ancho - margen * 2, 8, "F");
    doc.setTextColor(23, 73, 60);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("FECHA", margen + 3, y + 5.5);
    doc.text("PRODUCTO", margen + 25, y + 5.5);
    doc.text("NOTA", margen + 95, y + 5.5);
    doc.text("MONTO", ancho - margen - 3, y + 5.5, { align: "right" });
    y += 8;
  }

  cabeceraTabla();

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  if (ventas.length === 0) {
    doc.setTextColor(107, 118, 113);
    doc.text("Todavía no hay ventas para incluir en el reporte.", margen + 3, y + 8);
    y += 14;
  }

  ventas.forEach((v, i) => {
    if (y > alto - 28) {
      doc.addPage();
      y = 20;
      cabeceraTabla();
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
    }

    if (i % 2 === 1) {
      doc.setFillColor(250, 249, 245);
      doc.rect(margen, y, ancho - margen * 2, 7, "F");
    }

    doc.setTextColor(18, 32, 26);
    doc.text(fecha(v.fecha), margen + 3, y + 4.8);
    doc.text(recortar(doc, v.producto ?? "Venta", 66), margen + 25, y + 4.8);
    doc.text(recortar(doc, v.nota ?? "-", 55), margen + 95, y + 4.8);
    doc.setFont("helvetica", "bold");
    doc.text(dinero(v.monto, negocio.pais), ancho - margen - 3, y + 4.8, { align: "right" });
    doc.setFont("helvetica", "normal");

    y += 7;
  });

  /* -------------------------------- Totales -------------------------------- */
  if (ventas.length > 0) {
    if (y > alto - 40) {
      doc.addPage();
      y = 20;
    }
    doc.setDrawColor(207, 205, 194);
    doc.line(margen, y + 2, ancho - margen, y + 2);
    y += 9;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(18, 32, 26);
    doc.text("Total vendido", margen + 3, y);
    doc.text(dinero(total, negocio.pais), ancho - margen - 3, y, { align: "right" });
  }

  /* --------------------------------- Pie ---------------------------------- */
  const paginas = doc.getNumberOfPages();
  for (let i = 1; i <= paginas; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 224, 216);
    doc.line(margen, alto - 18, ancho - margen, alto - 18);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(107, 118, 113);
    doc.text(
      "Reporte autodeclarado generado con Impetus. No es un score crediticio ni un documento fiscal.",
      margen,
      alto - 13,
    );
    doc.text(`Página ${i} de ${paginas}`, ancho - margen, alto - 13, { align: "right" });
  }

  const nombreArchivo = `reporte-ventas-${negocio.pais}-${hoy}.pdf`;
  doc.save(nombreArchivo);
  return true;
}
