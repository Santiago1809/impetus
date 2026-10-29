"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { dbApi, type Movimiento, type Negocio, type Producto, type TipoMovimiento } from "@/lib/db";
import { dinero, fechaLarga, hoyISO, numero } from "@/lib/format";
import { movimientosDelDia, totales } from "@/lib/hoja-vida";
import { PAISES, simboloMoneda } from "@/lib/paises";
import { dictar, hayVoz, montoDeVoz } from "@/lib/voz";
import { DriveTutorial } from "@/lib/drive";
import { IcoBorrar, IcoCheck, IcoFlecha, IcoMas, IcoMenos, IcoMicro } from "./ui";

const GASTOS = [
  "Insumos / materiales",
  "Transporte",
  "Empaque",
  "Servicios (luz, agua)",
  "Alquiler / renta",
  "Otros gastos",
];

export function Registro({
  negocio,
  movs,
  productos,
  recargar,
  irACierre,
}: {
  negocio: Negocio;
  movs: Movimiento[];
  productos: Producto[];
  recargar: () => Promise<void>;
  irACierre: () => void;
}) {
  const pais = negocio.pais;
  const p = PAISES[pais];
  const [tipo, setTipo] = useState<TipoMovimiento>("venta");
  const [monto, setMonto] = useState(0);
  const [producto, setProducto] = useState("");
  const [nota, setNota] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [flash, setFlash] = useState("");
  const [escuchando, setEscuchando] = useState(false);

  const hayMicrofono = useSyncExternalStore(
    () => () => {},
    hayVoz,
    () => false,
  );

  const hoy = hoyISO();
  const delDia = useMemo(() => {
    return movimientosDelDia(movs, hoy).sort((a, b) => {
      if (a.creado && b.creado) return b.creado.localeCompare(a.creado);
      return (b.id ?? 0) - (a.id ?? 0);
    });
  }, [movs, hoy]);
  const totalesHoy = totales(delDia);

  // Precio del producto: se lee de la BD. Solo si no tiene precio se usa un mock.
  function precioEfectivo(prod: Producto): number {
    if (prod.precioVenta > 0) return prod.precioVenta;
    return p.montosRapidos[1] ?? 10000;
  }

  const productoSeleccionado = productos.find((x) => x.nombre === producto);

  function digito(d: string) {
    if (d === "borrar") {
      setMonto((m) => Math.floor(m / 10));
      return;
    }
    setMonto((m) => {
      const siguiente = Number(`${m}${d}`);
      return siguiente > 999_999_999 ? m : siguiente;
    });
  }

  async function guardar() {
    if (monto <= 0 || guardando) return;
    setGuardando(true);
    await dbApi.agregarMovimiento({
      fecha: hoy,
      creado: new Date().toISOString(),
      tipo,
      monto,
      producto: producto.trim() || undefined,
      nota: nota.trim() || undefined,
    });
    await recargar();
    setMonto(0);
    setNota("");
    setGuardando(false);
    setFlash(tipo === "venta" ? "Venta guardada" : "Gasto guardado");
    window.setTimeout(() => setFlash(""), 2200);
  }

  function escuchar() {
    if (escuchando) return;
    setEscuchando(true);
    const parar = dictar(
      p.locale,
      (texto) => {
        const n = montoDeVoz(texto);
        if (n > 0) {
          setMonto(n);
          setFlash(`Escuché: ${dinero(n, pais)}`);
        } else {
          setProducto(texto.trim().slice(0, 40));
          setFlash(`Escuché: "${texto.trim()}"`);
        }
        window.setTimeout(() => setFlash(""), 3000);
      },
      () => setEscuchando(false),
    );
    if (!parar) setEscuchando(false);
  }

  async function eliminar(id?: number) {
    if (!id) return;
    await dbApi.borrarMovimiento(id);
    await recargar();
  }

  return (
    <div className="space-y-4">
      <DriveTutorial
        id="pantalla-registro"
        steps={[
          {
            element: "#ds-tipo-mov",
            popover: {
              title: "Anotar: venta o gasto",
              description: "Primero elige qué vas a registrar. Cada tipo tiene sus propias opciones.",
            },
          },
          {
            element: "#ds-productos",
            popover: {
              title: "Tu catálogo",
              description: "Toca un producto y el precio se llena solo desde tu catálogo. En gasto verás tus conceptos.",
            },
          },
          {
            element: "#ds-monto",
            popover: {
              title: "El monto",
              description: "Aquí ves cuánto vas a registrar. Puedes ajustarlo con el teclado si hace falta.",
            },
          },
          {
            element: "#ds-guardar",
            popover: {
              title: "Guardar",
              description: "Un toque y queda anotado. Todo se suma en tu cierre del día.",
            },
          },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,560px)_minmax(0,340px)] lg:justify-center lg:items-start">
      <div className="space-y-4">
      <div className="hidden md:block">
        <p className="eyebrow">Movimientos</p>
        <h1 className="mt-1 title-lg">Anotar venta o gasto</h1>
      </div>
      <div className="flex items-center justify-between gap-2 text-[12px] text-muted">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-lavanda px-3 py-1.5 font-semibold text-ink">
          <span className="size-2 rounded-full bg-wa" /> En tu celular
        </span>
        <span className="font-semibold capitalize text-ink">{fechaLarga(hoy, pais)}</span>
      </div>

      <div id="ds-tipo-mov" className="grid grid-cols-2 gap-1.5 rounded-2xl bg-lavanda p-1.5">
        <button
          type="button"
          onClick={() => setTipo("venta")}
          aria-pressed={tipo === "venta"}
          className={`flex min-h-12 items-center justify-center gap-2 rounded-xl text-[14px] font-extrabold transition-all active:scale-[0.98] ${
            tipo === "venta" ? "bg-verde text-white shadow-sm" : "text-muted"
          }`}
        >
          <IcoMas className="size-4" /> Venta
        </button>
        <button
          type="button"
          onClick={() => setTipo("gasto")}
          aria-pressed={tipo === "gasto"}
          className={`flex min-h-12 items-center justify-center gap-2 rounded-xl text-[14px] font-extrabold transition-all active:scale-[0.98] ${
            tipo === "gasto" ? "bg-terra text-white shadow-sm" : "text-muted"
          }`}
        >
          <IcoMenos className="size-4" /> Gasto
        </button>
      </div>

      <div id="ds-productos">
        <p className="mb-2 text-[12px] font-semibold text-muted">
          {tipo === "venta" ? "Elige de tu catálogo" : "¿En qué se fue el dinero?"}
        </p>
        <div className="flex flex-wrap gap-2">
          {tipo === "venta" ? (
            productos.length === 0 ? (
              <span className="text-[12px] text-muted">Sin productos aún — agrégalos en Precio</span>
            ) : (
              productos.map((prod: Producto) => {
                const activo = producto === prod.nombre;
                return (
                  <button
                    key={prod.id ?? prod.nombre}
                    type="button"
                    onClick={() => {
                      setProducto(prod.nombre);
                      setMonto(precioEfectivo(prod));
                      setNota("");
                    }}
                    className={`flex min-h-11 items-center gap-1.5 rounded-full px-3.5 text-[12px] font-semibold transition-colors active:scale-[0.98] ${
                      activo ? "bg-verde text-white" : "bg-card text-ink ring-1 ring-line"
                    }`}
                  >
                    {prod.nombre}
                    <span className={`text-[10px] ${activo ? "text-white/75" : "text-muted"}`}>
                      {dinero(precioEfectivo(prod), pais)}
                    </span>
                  </button>
                );
              })
            )
          ) : (
            GASTOS.map((g) => {
              const activo = producto === g;
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => setProducto(activo ? "" : g)}
                  className={`min-h-11 rounded-full px-3.5 text-[12px] font-semibold transition-colors active:scale-[0.98] ${
                    activo ? "bg-terra text-white" : "bg-card text-ink ring-1 ring-line"
                  }`}
                >
                  {g}
                </button>
              );
            })
          )}
        </div>
      </div>

      <div id="ds-monto" className="card overflow-hidden">
        <div className="px-5 pb-3 pt-4">
          <div className="flex items-center justify-between">
            <span
              className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] ${
                tipo === "venta" ? "text-verde" : "text-terra"
              }`}
            >
              <span className={`size-2 rounded-full ${tipo === "venta" ? "bg-verde" : "bg-terra"}`} />
              {tipo === "venta" ? "Entrada" : "Salida"}
            </span>
            <span className="rounded-full bg-lavanda px-2.5 py-1 text-[11px] font-bold text-muted">{p.moneda}</span>
          </div>
          <p className="num mt-2 text-center text-[46px] font-extrabold leading-none">
            <span className="mr-1 text-[24px] font-bold text-muted">{simboloMoneda(pais)}</span>
            {numero(monto, pais)}
          </p>
          <p className="mt-2 min-h-4 text-center text-[12px] text-muted">
            {tipo === "venta"
              ? productoSeleccionado
                ? "Precio leído de tu catálogo"
                : "Elige un producto o marca el monto"
              : "Anota lo que salió de tu bolsillo"}
          </p>
          {flash ? <p className="pop mt-1.5 text-center text-[12px] font-bold text-verde">{flash}</p> : null}
        </div>

        <div className="border-t border-line bg-paper/60 p-3">
          <div className="mb-2 grid grid-cols-4 gap-2">
            {p.montosRapidos.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setMonto((m) => m + v)}
                className="h-9 rounded-lg bg-card text-[12px] font-bold text-ink ring-1 ring-line active:bg-line"
              >
                +{numero(v, pais)}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "00", "0"].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => digito(d)}
                className="h-12 rounded-lg bg-card text-[20px] font-bold text-ink ring-1 ring-line active:bg-line"
              >
                {d}
              </button>
            ))}
            <button
              type="button"
              onClick={() => digito("borrar")}
              aria-label="Borrar último dígito"
              className="grid h-12 place-items-center rounded-lg bg-lavanda-strong text-ink active:bg-line-strong"
            >
              <IcoBorrar className="size-5" />
            </button>
          </div>
        </div>

        <div id="ds-guardar" className="border-t border-line p-3">
          <button
            type="button"
            onClick={guardar}
            disabled={monto <= 0 || guardando}
            className={`flex min-h-13 w-full items-center justify-center gap-2 rounded-xl px-5 text-[15px] font-extrabold text-white transition-colors active:scale-[0.99] disabled:opacity-40 ${
              tipo === "venta" ? "bg-verde" : "bg-terra"
            }`}
          >
            <IcoCheck className="size-5" />
            {guardando ? "Guardando…" : tipo === "venta" ? "Guardar venta" : "Guardar gasto"}
          </button>
        </div>
      </div>

      {hayMicrofono ? (
        <button
          type="button"
          onClick={escuchar}
          className={`flex w-full items-center gap-3 rounded-2xl bg-lavanda px-4 py-3 text-left transition-colors active:scale-[0.99] ${
            escuchando ? "bg-verde-soft" : ""
          }`}
        >
          <span className={`grid size-10 shrink-0 place-items-center rounded-full bg-verde text-white ${escuchando ? "animate-pulse" : ""}`}>
            <IcoMicro />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-bold">{escuchando ? "Escuchando…" : "Dictar por voz"}</span>
            <span className="block truncate text-[11px] text-muted">
              {escuchando ? "Di el monto o el producto" : 'Ej. "Venta de 18 mil"'}
            </span>
          </span>
        </button>
      ) : null}

      <details className="card px-4 py-3">
        <summary className="cursor-pointer text-[12px] font-semibold text-muted">Detalles opcionales</summary>
        <div className="mt-3 space-y-2">
          <input
            value={producto}
            onChange={(e) => setProducto(e.target.value)}
            placeholder="Producto o concepto"
            maxLength={40}
            className="h-11 w-full rounded-xl border border-line-strong bg-card px-3.5 text-[14px] placeholder:text-muted/70 focus:border-verde focus:outline-none"
          />
          <input
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            placeholder="Nota: insumos, cliente, transporte…"
            maxLength={60}
            className="h-11 w-full rounded-xl border border-line-strong bg-card px-3.5 text-[14px] placeholder:text-muted/70 focus:border-verde focus:outline-none"
          />
        </div>
      </details>

      <button
        type="button"
        onClick={irACierre}
        className="mx-auto flex items-center gap-1 text-[13px] font-bold text-verde"
      >
        Ir al cierre del día <IcoFlecha className="size-4" />
      </button>

      </div>

      <aside className="space-y-4 lg:sticky lg:top-24">
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-[15px] font-bold">Hoy</h2>
          <span className="rounded-full bg-verde-soft px-2.5 py-1 text-[11px] font-bold text-verde-deep">
            {delDia.length} {delDia.length === 1 ? "movimiento" : "movimientos"}
          </span>
        </div>

        {delDia.length === 0 ? (
          <div className="card px-4 py-6 text-center text-[13px] text-muted">
            Todavía no registraste nada hoy. Empieza con una venta.
          </div>
        ) : (
          <ul className="space-y-2">
            {delDia.map((m) => {
              const hora = m.creado
                ? new Date(m.creado).toLocaleTimeString(p.locale, { hour: "2-digit", minute: "2-digit" })
                : "";
              return (
                <li key={m.id} className="flex items-center gap-3 rounded-2xl border border-line bg-card px-3 py-2.5">
                  <span
                    className={`grid size-10 shrink-0 place-items-center rounded-full ${
                      m.tipo === "venta" ? "bg-menta/30 text-verde-deep" : "bg-ambar-soft text-ambar-ink"
                    }`}
                  >
                    {m.tipo === "venta" ? <IcoMas /> : <IcoMenos />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-bold">{m.producto || (m.tipo === "venta" ? "Venta" : "Gasto")}</p>
                    <p className="truncate text-[11px] text-muted">
                      {[hora, m.tipo === "venta" ? "Venta" : "Gasto", m.nota].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <p className={`num shrink-0 text-[14px] font-extrabold ${m.tipo === "venta" ? "text-verde" : "text-ambar-ink"}`}>
                    {m.tipo === "venta" ? "+" : "−"}
                    {dinero(m.monto, pais)}
                  </p>
                  <button
                    type="button"
                    onClick={() => eliminar(m.id)}
                    aria-label="Eliminar registro"
                    className="grid size-8 shrink-0 place-items-center rounded-full text-muted hover:bg-terra-soft hover:text-terra"
                  >
                    <IcoBorrar className="size-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {delDia.length > 0 ? (
          <p className="mt-3 text-center text-[11px] text-muted">
            Te queda hoy: <span className="font-bold text-ink">{dinero(totalesHoy.quedo, pais)}</span>
          </p>
        ) : null}
      </section>
      </aside>
      </div>
    </div>
  );
}
