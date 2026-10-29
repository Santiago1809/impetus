"use client";

import { useEffect, useMemo, useState } from "react";
import { dbApi, type Formalidad, type Meta, type Negocio, type Producto } from "@/lib/db";
import { LISTA_PAISES, PAISES, simboloMoneda, type PaisId } from "@/lib/paises";
import { dinero } from "@/lib/format";
import { Boton, EntradaTexto, IcoBorrar, IcoCheck, IcoCandado, IcoFlecha } from "./ui";
import { DriveTutorial } from "@/lib/drive";

const TIPOS = [
  { valor: "Alimentos preparados", emoji: "🥟", color: "bg-menta/60" },
  { valor: "Confitería y dulces", emoji: "🍬", color: "bg-[#ffe3ef]" },
  { valor: "Ropa y confección", emoji: "👕", color: "bg-[#dfe9ff]" },
  { valor: "Maquillaje y belleza", emoji: "💄", color: "bg-[#ffe0d6]" },
];

const ANTIGUEDADES = [
  { meses: 3, etiqueta: "Menos de 6 meses" },
  { meses: 9, etiqueta: "De 6 meses a 1 año" },
  { meses: 24, etiqueta: "De 1 a 3 años" },
  { meses: 60, etiqueta: "Más de 3 años" },
];

const METAS: { valor: Meta; titulo: string; texto: string; emoji: string; color: string }[] = [
  {
    valor: "mantener",
    titulo: "Mantener y no perder dinero",
    texto: "Controlar los gastos del día y saber cuánto queda limpio.",
    emoji: "🐷",
    color: "bg-menta/60",
  },
  {
    valor: "crecer",
    titulo: "Crecer en ventas y clientes",
    texto: "Saber qué producto se mueve mejor y ganar más.",
    emoji: "📈",
    color: "bg-[#dfe9ff]",
  },
  {
    valor: "credito",
    titulo: "Crédito formal",
    texto: "Construir un historial real para pedir prestado a tasa justa.",
    emoji: "🏦",
    color: "bg-[#efe7ff]",
  },
  {
    valor: "formalizar",
    titulo: "Pasos para formalizarme",
    texto: "Entender el registro y los impuestos sin trámites confusos.",
    emoji: "📝",
    color: "bg-[#ffe3ef]",
  },
];

function etiquetaRegistro(pais: PaisId) {
  if (pais === "CO") return { proceso: "RUT en trámite", registrada: "Registrado (RUT / Cámara)" };
  if (pais === "HN") return { proceso: "RTN en trámite", registrada: "Registrado (RTN / Cámara)" };
  return { proceso: "RFC en trámite", registrada: "Registrado (RFC / SAT)" };
}

export function Onboarding({
  inicial,
  modoEdicion = false,
  onGuardar,
}: {
  inicial?: Negocio | null;
  modoEdicion?: boolean;
  onGuardar: (n: Negocio) => void;
}) {
  const [paso, setPaso] = useState(1);
  const [pais, setPais] = useState<PaisId>(inicial?.pais ?? "CO");
  const [nombreNegocio, setNombreNegocio] = useState(inicial?.tipoNegocio ?? "");
  const [ciudad, setCiudad] = useState(inicial?.ciudad ?? PAISES[pais].ciudadEjemplo);
  const [tipo, setTipo] = useState(inicial?.tipoNegocio ?? "");
  const [antiguedad, setAntiguedad] = useState(inicial?.antiguedadMeses ?? 0);
  const [formalidad, setFormalidad] = useState<Formalidad>(inicial?.formalidad ?? "ninguna");
  const [meta, setMeta] = useState<Meta>(inicial?.meta ?? "mantener");
  const [aviso, setAviso] = useState(Boolean(inicial?.avisoAceptado));
  const [productosDb, setProductosDb] = useState<Producto[]>([]);
  const [nuevoProducto, setNuevoProducto] = useState({ nombre: "", precioVenta: 0 });
  const [prodEditar, setProdEditar] = useState<Producto | null>(null);
  const [flashProducto, setFlashProducto] = useState("");
  const [guardandoProducto, setGuardandoProducto] = useState(false);
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);
  const [guardandoNegocio, setGuardandoNegocio] = useState(false);

  const registro = etiquetaRegistro(pais);
  const puedeSeguir = paso === 1 ? Boolean(tipo) : paso === 2 ? productosDb.length > 0 : paso === 3 ? antiguedad > 0 : aviso;

  useEffect(() => {
    dbApi.getProductos().then((ps) => setProductosDb(ps)).catch(() => {});
  }, []);

  async function agregarProducto() {
    const nombre = nuevoProducto.nombre.trim();
    if (!nombre || guardandoProducto) return;
    setGuardandoProducto(true);
    try {
      await dbApi.guardarProducto({
        nombre,
        precioVenta: nuevoProducto.precioVenta,
        costoProducto: 0,
        costoTransporte: 0,
        costoEmpaque: 0,
        minutos: 0,
        valorHora: 0,
      });
      setProductosDb(await dbApi.getProductos());
      setNuevoProducto({ nombre: "", precioVenta: 0 });
      setFlashProducto("Producto agregado");
      window.setTimeout(() => setFlashProducto(""), 2000);
    } finally {
      setGuardandoProducto(false);
    }
  }

  async function guardarEdicionProducto() {
    if (!prodEditar || guardandoEdicion) return;
    setGuardandoEdicion(true);
    try {
      await dbApi.guardarProducto(prodEditar);
      setProductosDb(await dbApi.getProductos());
      setProdEditar(null);
      setFlashProducto("Producto actualizado");
      window.setTimeout(() => setFlashProducto(""), 2000);
    } finally {
      setGuardandoEdicion(false);
    }
  }

  async function eliminarProducto(id?: number) {
    if (!id) return;
    await dbApi.borrarProducto(id);
    setProductosDb(await dbApi.getProductos());
  }

  async function guardar() {
    if (guardandoNegocio) return;
    setGuardandoNegocio(true);
    try {
      await onGuardar({
        id: inicial?.id ?? 0,
        tipoNegocio: nombreNegocio.trim() || tipo || "Mi negocio",
        antiguedadMeses: antiguedad,
        meta,
        formalidad,
        ciudad: ciudad.trim() || PAISES[pais].ciudadEjemplo,
        pais,
        avisoAceptado: inicial?.avisoAceptado || new Date().toISOString(),
        creado: inicial?.creado || new Date().toISOString(),
      });
    } finally {
      setGuardandoNegocio(false);
    }
  }

  const p = PAISES[pais];

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <aside className="hidden flex-col justify-between bg-verde px-12 py-14 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-[0.875rem] bg-white/12 text-white ring-1 ring-white/25">
            <span className="font-display text-xl font-extrabold">i</span>
          </div>
          <div>
            <p className="font-display text-lg font-extrabold leading-none tracking-tight">Impetus</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">Finanzas claras</p>
          </div>
        </div>

        <div className="max-w-md">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-menta">Hecho para tu negocio</p>
          <h2 className="mt-3 font-display text-[34px] font-extrabold leading-[1.08] tracking-tight">
            Tu negocio, claro.
            <br />
            Sin cuadernos ni cuentas cruzadas.
          </h2>
          <p className="mt-4 text-[14px] leading-relaxed text-white/75">
            Registra ventas y gastos, descubre tu precio real y construye un historial que te abre puertas.
          </p>

          <ul className="mt-8 space-y-3">
            {[
              ["Registra en segundos", "Venta o gasto, con tu catálogo y precios reales."],
              ["Precio real, no el de la intuición", "Insumos, transporte, empaque y tu tiempo."],
              ["Cierre del día", "Cuánto te quedó de verdad, sin fiados."],
              ["Historial que sirve", "Hoja de vida y apoyos desde tu primera venta."],
            ].map(([titulo, texto]) => (
              <li key={titulo} className="flex gap-3">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-white/15">
                  <IcoCheck className="size-3.5" />
                </span>
                <span>
                  <span className="block text-[13px] font-bold">{titulo}</span>
                  <span className="block text-[12px] leading-snug text-white/65">{texto}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="max-w-sm text-[11px] leading-relaxed text-white/45">
          Prototipo con datos de referencia. La información fiscal y financiera es orientativa: verifica siempre
          con la entidad oficial de tu país.
        </p>
      </aside>

      <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col px-4 pb-8 pt-5 lg:mx-auto lg:max-w-xl lg:px-12 lg:py-12">
      <div className="mb-4 flex items-center gap-3 lg:hidden">
        <div className="grid size-10 place-items-center rounded-[0.875rem] bg-verde text-white shadow-[0_6px_16px_-10px_rgba(18,32,26,0.7)]">
          <span className="font-display text-lg font-extrabold">i</span>
        </div>
        <div>
          <p className="font-display text-[17px] font-extrabold leading-none tracking-tight">Impetus</p>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Finanzas claras</p>
        </div>
      </div>

      <div className="mb-5 flex items-center gap-2.5 rounded-2xl bg-verde-soft px-4 py-3 text-verde-deep">
        <IcoCandado className="size-5 shrink-0" />
        <p className="text-[12px] leading-snug">
          <span className="font-bold">100% privado.</span> {p.avisoDatos}
        </p>
      </div>

      <div className="mb-5 flex items-center gap-1.5" aria-hidden="true">
        {[1, 2, 3, 4].map((n) => (
          <span
            key={n}
            className={`h-1 flex-1 rounded-full transition-colors ${n <= paso ? "bg-verde" : "bg-lavanda-strong"}`}
          />
        ))}
        <span className="ml-1 text-[10px] font-bold text-muted">{paso}/4</span>
      </div>

      {paso === 1 && !inicial ? <DriveTutorial onDone={() => {}} /> : null}

      {paso === 1 ? (
        <div className="space-y-6">
          <div>
            <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-lavanda px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-muted">
              Paso 1 de 3 · 100% privado
            </p>
            <h1 className="font-display text-[30px] font-extrabold">
              {modoEdicion ? "Actualizá tu negocio" : "¡Bienvenido a Impetus!"}
            </h1>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">
              Registra tu primera venta, cierra el día y descubre tu precio real. Todo queda en este celular, sin servidores.
            </p>
            <div className="mt-3 rounded-2xl border-2 border-line bg-card p-4 text-[13px] leading-relaxed text-muted">
              <span className="font-bold text-ink">Cómo funciona:</span> 1) Anota tus ventas y gastos · 2) Revisa tu día · 3) Calcula tus precios · 4) Mira tu historial.
            </div>
          </div>

          <section>
            <label htmlFor="nombreNegocio" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Nombre del negocio</label>
            <input
              id="ds-nombre"
              type="text"
              value={nombreNegocio}
              onChange={(e) => setNombreNegocio(e.target.value)}
              placeholder="Ej. Empanadas María"
              maxLength={60}
              className="h-12 w-full rounded-2xl border-2 border-line-strong bg-card px-4 text-[14px] font-bold text-ink placeholder:text-muted focus:border-verde focus:outline-none"
            />
          </section>

          <section>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Tu país</p>
            <div className="grid grid-cols-3 gap-2">
              {LISTA_PAISES.map((op) => {
                const activo = pais === op.id;
                return (
                  <button
                    key={op.id}
                    id={op.id === "CO" ? "ds-pais" : undefined}
                    type="button"
                    disabled={modoEdicion && inicial?.pais !== op.id}
                    onClick={() => setPais(op.id)}
                    className={`flex min-h-20 flex-col items-center justify-center gap-1 rounded-2xl border-2 bg-card text-[12px] font-bold transition-colors disabled:opacity-35 ${
                      activo ? "border-verde bg-verde-soft/60" : "border-line hover:border-line-strong"
                    }`}
                  >
                    <span className="text-2xl">{op.bandera}</span>
                    {op.nombre}
                  </button>
                );
              })}
            </div>
            {modoEdicion ? (
              <p className="mt-2 text-[11px] text-muted">
                Para cambiar de país hay que borrar los datos (Ajustes).
              </p>
            ) : null}
          </section>

          <section>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Tu ciudad</p>
            <div className="grid grid-cols-3 gap-2">
              {[{ ciudad: "Medellín", pais: "CO" }, { ciudad: "Ciudad de México", pais: "MX" }, { ciudad: "Tegucigalpa", pais: "HN" }]
                .filter((c) => c.pais === pais)
                .map((c) => (
                  <button
                    key={c.ciudad}
                    id={ciudad === c.ciudad ? "ds-ciudad" : undefined}
                    type="button"
                    onClick={() => setCiudad(c.ciudad)}
                    className={`min-h-12 rounded-2xl border-2 px-2 text-[12px] font-bold transition-colors ${
                      ciudad === c.ciudad ? "border-verde bg-verde-soft/60 text-verde-deep" : "border-line bg-card text-ink hover:border-line-strong"
                    }`}
                  >
                    {c.ciudad}
                  </button>
                ))}
            </div>
          </section>

          <section>
            <div className="mb-2 flex items-baseline justify-between">
              <h2 id="ds-tipo" className="font-display text-[20px] font-bold">¿Qué tipo de negocio tienes?</h2>
              <span className="text-[11px] text-muted">Elige una</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {TIPOS.map((t) => {
                const activo = tipo === t.valor;
                return (
                  <button
                    key={t.valor}
                    type="button"
                    onClick={() => setTipo(t.valor)}
                    className={`relative flex min-h-28 flex-col justify-between rounded-2xl border-2 p-3 text-left transition-colors ${
                      activo ? "border-verde bg-verde-soft/50" : "border-transparent bg-card"
                    }`}
                  >
                    <span className={`grid size-10 place-items-center rounded-xl text-xl ${t.color}`}>{t.emoji}</span>
                    <span className="text-[13px] font-bold leading-tight">{t.valor}</span>
                    {activo ? (
                      <span className="absolute right-2.5 top-2.5 grid size-6 place-items-center rounded-full bg-verde text-white">
                        <IcoCheck className="size-3.5" />
                      </span>
                    ) : null}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setTipo("Otro micronegocio")}
                className={`col-span-2 flex min-h-14 items-center gap-3 rounded-2xl border-2 px-3 text-left text-[13px] font-bold transition-colors ${
                  tipo === "Otro micronegocio" ? "border-verde bg-verde-soft/50" : "border-transparent bg-card"
                }`}
              >
                <span className="grid size-9 place-items-center rounded-xl bg-ambar-soft text-lg">📦</span>
                Otro micronegocio o servicio
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {paso === 2 ? (
        <div className="space-y-6" id="ds-productos">
          <div>
            <h1 className="font-display text-[26px] font-extrabold">¿Qué vendes?</h1>
            <p className="mt-1 text-[15px] text-muted">
              Registra tus productos o servicios. Los usarás al anotar cada venta.
            </p>
          </div>

          {flashProducto ? (
            <p className="rounded-2xl bg-verde-soft px-4 py-2 text-center text-[12px] font-bold text-verde-deep">
              {flashProducto}
            </p>
          ) : null}

          {productosDb.length > 0 ? (
            <ul className="space-y-2">
              {productosDb.map((prod) => (
                <li key={prod.id ?? prod.nombre} className="card px-3 py-2.5">
                  {prodEditar?.id === prod.id ? (
                    <div className="space-y-2">
                      <input
                        value={prodEditar?.nombre ?? ""}
                        onChange={(e) => setProdEditar(prodEditar ? { ...prodEditar, nombre: e.target.value } : null)}
                        maxLength={60}
                        className="h-10 w-full rounded-xl border border-line-strong bg-card px-3 text-[14px] font-bold focus:border-verde focus:outline-none"
                      />
                      <input
                        type="number"
                        value={prodEditar?.precioVenta ?? 0}
                        onChange={(e) => setProdEditar(prodEditar ? { ...prodEditar, precioVenta: Number(e.target.value) } : null)}
                        min={0}
                        className="h-10 w-full rounded-xl border border-line-strong bg-card px-3 text-[14px] num focus:border-verde focus:outline-none"
                      />
                      <div className="flex gap-2">
                        <Boton
                          onClick={guardarEdicionProducto}
                          disabled={guardandoEdicion}
                          className="flex-1 min-h-10 text-[13px]"
                        >
                          {guardandoEdicion ? "Guardando…" : "Guardar"}
                        </Boton>
                        <Boton variante="secondary" onClick={() => setProdEditar(null)} className="flex-1 min-h-10 text-[13px]">Cancelar</Boton>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-bold">{prod.nombre}</p>
                        <p className="text-[11px] text-muted">{dinero(prod.precioVenta, pais)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setProdEditar(prod)}
                        className="rounded-full px-3 py-1.5 text-[12px] font-bold text-verde hover:bg-verde-soft"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => eliminarProducto(prod.id)}
                        aria-label="Eliminar producto"
                        className="grid size-8 place-items-center rounded-full text-muted hover:bg-terra-soft hover:text-terra"
                      >
                        <IcoBorrar className="size-4" />
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="card px-4 py-5 text-center text-[13px] text-muted">
              Aún no tienes productos. Agrega el primero abajo.
            </p>
          )}

          <section className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Agregar producto o servicio</p>
            <input
              value={nuevoProducto.nombre}
              onChange={(e) => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })}
              placeholder="Ej. Empanada de carne"
              maxLength={60}
              className="h-11 w-full rounded-xl border border-line-strong bg-card px-3.5 text-[14px] focus:border-verde focus:outline-none"
            />
            <input
              type="number"
              value={nuevoProducto.precioVenta || ""}
              onChange={(e) => setNuevoProducto({ ...nuevoProducto, precioVenta: Number(e.target.value) })}
              placeholder={`Precio de venta (${simboloMoneda(pais)})`}
              min={0}
              className="h-11 w-full rounded-xl border border-line-strong bg-card px-3.5 text-[14px] num focus:border-verde focus:outline-none"
            />
            <Boton
              onClick={agregarProducto}
              disabled={!nuevoProducto.nombre.trim() || guardandoProducto}
              className="w-full min-h-11 text-[14px]"
            >
              {guardandoProducto ? "Guardando…" : "Agregar producto"}
            </Boton>
          </section>
        </div>
      ) : null}

      {paso === 3 ? (
        <div className="space-y-7">
          <div>
            <h1 className="font-display text-[26px] font-extrabold">Contanos un poco más</h1>
            <p className="mt-1 text-[15px] text-muted">Así calculamos mejor tu ruta y tus recomendaciones.</p>
          </div>

          <section>
            <h2 className="mb-3 font-display text-[20px] font-bold">¿Hace cuánto tienes el negocio?</h2>
            <div className="flex flex-wrap gap-2">
              {ANTIGUEDADES.map((a) => (
                <button
                  key={a.meses}
                  type="button"
                  onClick={() => setAntiguedad(a.meses)}
                  className={`min-h-12 rounded-full px-4 text-[13px] font-bold transition-colors ${
                    antiguedad === a.meses ? "bg-ink text-white" : "bg-lavanda text-ink hover:bg-lavanda-strong"
                  }`}
                >
                  {a.etiqueta}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-display text-[20px] font-bold">¿Cómo está registrado hoy?</h2>
            <p className="mb-3 text-[13px] text-muted">No te preocupes si no tienes papeles: se adapta a tu realidad.</p>
            <div className="space-y-2">
              {(
                [
                  { valor: "ninguna", titulo: "Sin registro", sub: "Informal por ahora" },
                  { valor: "proceso", titulo: registro.proceso, sub: "Ya empezaste el trámite" },
                  { valor: "registrada", titulo: registro.registrada, sub: "Al día con el registro" },
                ] as { valor: Formalidad; titulo: string; sub: string }[]
              ).map((o) => (
                <button
                  key={o.valor}
                  type="button"
                  onClick={() => setFormalidad(o.valor)}
                  className={`flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left transition-colors ${
                    formalidad === o.valor ? "border-verde bg-verde-soft/40" : "border-transparent bg-card"
                  }`}
                >
                  <span
                    className={`grid size-5 shrink-0 place-items-center rounded-full border-2 ${
                      formalidad === o.valor ? "border-verde bg-verde text-white" : "border-line-strong"
                    }`}
                  >
                    {formalidad === o.valor ? <IcoCheck className="size-3" /> : null}
                  </span>
                  <span>
                    <span className="block text-[14px] font-bold leading-tight">{o.titulo}</span>
                    <span className="block text-[12px] text-muted">{o.sub}</span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        </div>
      ) : null}

      {paso === 4 ? (
        <div className="space-y-5">
          <div>
            <h1 className="font-display text-[26px] font-extrabold">¿Cuál es tu meta principal hoy?</h1>
            <p className="mt-1 text-[15px] text-muted">Con esto elegimos qué apoyos y qué información fiscal te mostramos.</p>
          </div>

          <div className="space-y-2.5">
            {METAS.map((m) => {
              const activo = meta === m.valor;
              return (
                <button
                  key={m.valor}
                  type="button"
                  onClick={() => setMeta(m.valor)}
                  className={`flex w-full items-center gap-3 rounded-2xl border-2 p-3 text-left transition-colors ${
                    activo ? "border-verde bg-verde-soft/40" : "border-transparent bg-card"
                  }`}
                >
                  <span className={`grid size-11 shrink-0 place-items-center rounded-xl text-xl ${m.color}`}>{m.emoji}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-bold leading-tight">{m.titulo}</span>
                    <span className="mt-0.5 block text-[12px] leading-snug text-muted">{m.texto}</span>
                  </span>
                  <span
                    className={`grid size-5 shrink-0 place-items-center rounded-full border-2 ${
                      activo ? "border-verde bg-verde text-white" : "border-line-strong"
                    }`}
                  >
                    {activo ? <IcoCheck className="size-3" /> : null}
                  </span>
                </button>
              );
            })}
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-lavanda p-4">
            <input
              type="checkbox"
              checked={aviso}
              onChange={(e) => setAviso(e.target.checked)}
              className="mt-0.5 size-5 shrink-0 accent-verde"
            />
            <span className="text-[12px] leading-relaxed text-ink">
              Acepto el tratamiento de mis datos. Se guardan solo en este celular, nadie más los ve y puedo
              borrarlos cuando quiera.
            </span>
          </label>

          <Boton bloque onClick={guardar} disabled={!aviso || guardandoNegocio} className="min-h-14 text-base">
            {guardandoNegocio
              ? "Guardando…"
              : modoEdicion
                ? "Guardar cambios"
                : "Comenzar a registrar hoy"}
            <IcoFlecha />
          </Boton>
          <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-muted">
            <IcoCandado className="size-3.5" /> Funciona 100% sin internet en cualquier barrio.
          </p>
        </div>
      ) : null}

      {paso < 4 ? (
        <div className="mt-auto flex gap-2 pt-8">
          {paso > 1 ? (
            <Boton variante="secondary" onClick={() => setPaso(paso - 1)} className="flex-1">
              Atrás
            </Boton>
          ) : null}
          <Boton
            onClick={() => setPaso(paso + 1)}
            disabled={!puedeSeguir}
            className={`${paso > 1 ? "flex-[2]" : "w-full"} min-h-14`}
          >
            Continuar <IcoFlecha />
          </Boton>
        </div>
      ) : paso === 4 ? (
        <Boton variante="ghost" onClick={() => setPaso(3)} className="mt-4">
          Atrás
        </Boton>
      ) : null}
      </div>
    </div>
  );
}
