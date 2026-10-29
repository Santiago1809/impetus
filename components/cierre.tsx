"use client";

import { useMemo, useState } from "react";
import { DriveTutorial } from "@/lib/drive";
import { dbApi, type Cierre, type Movimiento, type Negocio, type Producto } from "@/lib/db";
import { dinero, fechaLarga, hoyISO } from "@/lib/format";
import { movimientosDelDia, totales } from "@/lib/hoja-vida";
import { PAISES } from "@/lib/paises";
import { desglosar } from "@/lib/precio";
import { Boton, IcoCheck, IcoCierre, IcoCompartir, IcoFlecha, IcoInfo, Vacio } from "./ui";
import { generarReporteVentas } from "@/lib/reporte";

export function CierreDia({
  negocio,
  movs,
  productos,
  cierres,
  recargar,
  irAPrecio,
  irARegistro,
}: {
  negocio: Negocio;
  movs: Movimiento[];
  productos: Producto[];
  cierres: Cierre[];
  recargar: () => Promise<void>;
  irAPrecio: () => void;
  irARegistro: () => void;
}) {
  const pais = negocio.pais;
  const hoy = hoyISO();
  const [compartiendo, setCompartiendo] = useState(false);
  const [generandoPdf, setGenerandoPdf] = useState(false);
  const [errorPdf, setErrorPdf] = useState("");

  const delDia = useMemo(() => movimientosDelDia(movs, hoy), [movs, hoy]);
  const totalVentasHistorial = useMemo(() => movs.filter((m) => m.tipo === "venta").length, [movs]);
  const t = totales(delDia);
  const cierreHoy = cierres.find((c) => c.fecha === hoy);

  const gastosPorConcepto = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const m of delDia) {
      if (m.tipo !== "gasto") continue;
      const nombre = m.nota || m.producto || "Gasto general";
      mapa.set(nombre, (mapa.get(nombre) ?? 0) + m.monto);
    }
    return [...mapa.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  }, [delDia]);

  const tiempoPropio = useMemo(() => {
    const conTiempo = productos.filter((p) => p.minutos > 0);
    if (!conTiempo.length) return null;
    const promedio = conTiempo.reduce((acc, p) => acc + desglosar(p).manoObra, 0) / conTiempo.length;
    return { promedio, minutos: Math.round(conTiempo.reduce((a, p) => a + p.minutos, 0) / conTiempo.length) };
  }, [productos]);

  const mensaje = `Cierre de hoy · ${negocio.tipoNegocio} (${negocio.ciudad})
Ventas: ${dinero(t.ventas, pais)}
Gastos: ${dinero(t.gastos, pais)}
Quedó en registro: ${dinero(t.quedo, pais)}

Registrado con Impetus.`;

  async function archivar(compartido: boolean) {
    await dbApi.guardarCierre({
      fecha: hoy,
      totalVentas: t.ventas,
      totalGastos: t.gastos,
      quedoReal: t.quedo,
      compartido: compartido || Boolean(cierreHoy?.compartido),
    });
    await recargar();
  }

  function compartir() {
    setCompartiendo(true);
    window.open(`https://wa.me/?text=${encodeURIComponent(mensaje)}`, "_blank", "noopener,noreferrer");
    void archivar(true).finally(() => setCompartiendo(false));
  }

  if (delDia.length === 0) {
    return (
      <div className="space-y-5">
        <Encabezado pais={pais} />
        <Vacio titulo="Todavía no hay nada que cerrar" texto="Registra tu primera venta o gasto de hoy y vuelve para ver cuánto te quedó de verdad.">
          <Boton onClick={irARegistro}>Ir a registrar</Boton>
        </Vacio>
        <SiguienteNivel onIr={irAPrecio} />
      </div>
    );
  }

  return (
    <div className="space-y-4" id="pantalla-cierre">
      <DriveTutorial
        id="pantalla-cierre"
        steps={[
          { element: "#pantalla-cierre", popover: { title: "Mi día", description: "Aquí revisas en un minuto cuánto entró, cuánto salió y qué te quedó de verdad." } },
          { element: "#ds-cierre-neta", popover: { title: "Tu ganancia real", description: "El número grande es lo que te queda limpio después de todos los gastos del día." } },
          { element: "#ds-cierre-totales", popover: { title: "Ventas y gastos", description: "Cuántas ventas hiciste, cuánto gastaste y el total de cada uno." } },
          { element: "#ds-cierre-gastos", popover: { title: "En qué se fue", description: "Ve el detalle de los gastos por concepto para detectar fugas." } },
          { element: "#ds-cierre-compartir", popover: { title: "Comparte tu cierre", description: "Envía el resumen a tu socio o familia por WhatsApp y archiva el día." } },
        ]}
      />
      <Encabezado pais={pais} />

      <div id="ds-cierre-neta" className="rounded-[1.5rem] bg-verde px-5 py-5 text-white shadow-[0_18px_40px_-28px_rgba(18,32,26,0.9)]">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-menta">Ganancia neta real en registro</span>
          <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold">{PAISES[pais].moneda}</span>
        </div>
        <p className="mt-2 text-[13px] text-white/80">¿Cuánto te quedó de verdad hoy?</p>
        <p className="num mt-1 text-[42px] font-extrabold leading-none">
          {t.quedo >= 0 ? "+" : "−"} {dinero(Math.abs(t.quedo), pais)}
        </p>
        <div className="mt-4 flex items-center justify-between border-t border-white/15 pt-3">
          <span className="inline-flex items-center gap-1.5 text-[12px] text-white/85">
            <IcoCheck className="size-4" /> En efectivo y Nequi/transferencias
          </span>
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold ${
              t.quedo >= 0 ? "bg-verde-soft text-verde-deep" : "bg-terra-soft text-terra"
            }`}
          >
            {t.quedo >= 0 ? "Día positivo ⚡" : "Día en rojo"}
          </span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,640px)_minmax(0,360px)] lg:justify-center lg:items-start">
      <div className="space-y-4">
      <div id="ds-cierre-totales" className="grid grid-cols-2 gap-2.5">
        <div className="card p-4">
          <span className="grid size-8 place-items-center rounded-full bg-verde-soft text-verde">
            <IcoFlecha className="size-4 -rotate-90" />
          </span>
          <p className="mt-2 text-[11px] text-muted">{delDia.filter((m) => m.tipo === "venta").length} ventas</p>
          <p className="text-[13px] font-bold">Total vendido</p>
          <p className="num mt-0.5 text-[18px] font-extrabold text-verde">{dinero(t.ventas, pais)}</p>
        </div>
        <div className="card p-4">
          <span className="grid size-8 place-items-center rounded-full bg-terra-soft text-terra">
            <IcoFlecha className="size-4 rotate-90" />
          </span>
          <p className="mt-2 text-[11px] text-muted">{delDia.filter((m) => m.tipo === "gasto").length} gastos</p>
          <p className="text-[13px] font-bold">Total gastos</p>
          <p className="num mt-0.5 text-[18px] font-extrabold text-terra">{dinero(t.gastos, pais)}</p>
        </div>
      </div>

      {gastosPorConcepto.length > 0 ? (
        <section className="card p-4" id="ds-cierre-gastos">
          <h2 className="text-[14px] font-bold">¿En qué se fue la plata hoy?</h2>
          <ul className="mt-3 space-y-2">
            {gastosPorConcepto.map(([nombre, monto]) => (
              <li key={nombre} className="flex items-center gap-3 rounded-xl bg-paper px-3 py-2.5">
                <span className="grid size-8 place-items-center rounded-lg bg-ambar-soft text-[14px]">🛍️</span>
                <span className="min-w-0 flex-1 truncate text-[13px] font-semibold">{nombre}</span>
                <span className="num text-[13px] font-bold">{dinero(monto, pais)}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {tiempoPropio ? (
        <div className="flex gap-3 rounded-2xl bg-ambar-soft p-4">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ambar text-ambar-ink">
            <IcoInfo className="size-5" />
          </span>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-ambar-ink">Alerta de esfuerzo oculto</p>
            <p className="mt-1 text-[13px] leading-snug">
              En tus productos, tu tiempo vale <b>{dinero(tiempoPropio.promedio, pais)}</b> por unidad
              (unos {tiempoPropio.minutos} min). Revisa que el precio lo cubra.
            </p>
          </div>
        </div>
      ) : null}

      </div>

      <aside className="space-y-4 lg:sticky lg:top-24">
      <section className="card p-4">
        <h2 className="inline-flex items-center gap-2 text-[14px] font-bold">
          <IcoCierre className="size-4 text-verde" /> Reporte de ventas
        </h2>
        <p className="mt-1 text-[11px] leading-snug text-muted">
          Descarga tu historial completo en PDF:{" "}
          {totalVentasHistorial === 0
            ? "aún no hay ventas registradas."
            : `${totalVentasHistorial} ${totalVentasHistorial === 1 ? "venta" : "ventas"} con fecha, producto y monto.`}
        </p>
        <Boton
          bloque
          variante="secondary"
          onClick={async () => {
            if (generandoPdf) return;
            setGenerandoPdf(true);
            setErrorPdf("");
            try {
              await generarReporteVentas(negocio, movs);
            } catch {
              setErrorPdf("No se pudo generar el PDF. Intenta de nuevo.");
            } finally {
              setGenerandoPdf(false);
            }
          }}
          disabled={totalVentasHistorial === 0 || generandoPdf}
          className="mt-3"
        >
          {generandoPdf ? "Generando PDF…" : "Descargar reporte PDF"}
        </Boton>
        {errorPdf ? <p className="mt-2 text-[11px] font-semibold text-terra">{errorPdf}</p> : null}
      </section>

      <section className="card p-4" id="ds-cierre-compartir">
        <div className="flex items-center justify-between gap-2">
          <h2 className="inline-flex items-center gap-2 text-[14px] font-bold">
            <IcoCompartir className="size-4 text-verde" /> Compartir con socio o familia
          </h2>
          <span className="rounded-full bg-verde-soft px-2 py-1 text-[10px] font-extrabold text-verde-deep">Sin fiados</span>
        </div>
        <p className="mt-1 text-[11px] text-muted">Mensaje listo para enviar:</p>
        <pre className="mt-2 whitespace-pre-wrap rounded-xl bg-paper px-3 py-2.5 font-sans text-[12px] leading-relaxed text-ink">
          {mensaje}
        </pre>
        <Boton bloque onClick={compartir} disabled={compartiendo} className="mt-3 bg-wa text-[#062d15] hover:brightness-95">
          <IcoCompartir className="size-4" /> Compartir cierre por WhatsApp
        </Boton>
      </section>

      <SiguienteNivel onIr={irAPrecio} />

      <Boton
        bloque
        variante={cierreHoy ? "secondary" : "primary"}
        onClick={() => archivar(false)}
        disabled={Boolean(cierreHoy)}
        className="min-h-14"
      >
        <IcoCheck className="size-5" />
        {cierreHoy ? "Día archivado" : "Finalizar y archivar día"}
      </Boton>
      </aside>
      </div>
    </div>
  );
}

function Encabezado({ pais }: { pais: Negocio["pais"] }) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        <p className="eyebrow">Tu día</p>
        <h1 className="font-display text-[24px] font-extrabold capitalize">{fechaLarga(hoyISO(), pais)}</h1>
      </div>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-[11px] font-bold text-ink ring-1 ring-line">
        <span className="size-2 rounded-full bg-verde" /> Turno día
      </span>
    </div>
  );
}

function SiguienteNivel({ onIr }: { onIr: () => void }) {
  return (
    <section className="rounded-2xl bg-lavanda p-4">
      <p className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted">
        Siguiente nivel <span className="size-1.5 rounded-full bg-ambar" />
      </p>
      <h2 className="mt-1 font-display text-[17px] font-bold leading-tight">Calcula el precio real de tus productos</h2>
      <p className="mt-1 text-[12px] leading-snug text-muted">
        Descubre si estás regalando tu mano de obra o si tu margen cubre tus metas.
      </p>
      <button
        type="button"
        onClick={onIr}
        className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-card px-4 text-[13px] font-bold text-verde"
      >
        Abrir calculadora de costos <IcoFlecha className="size-4" />
      </button>
    </section>
  );
}
