"use client";

import { useMemo, useState } from "react";
import { DriveTutorial } from "@/lib/drive";
import { dbApi, type Negocio, type Producto } from "@/lib/db";
import { dinero } from "@/lib/format";
import { PAISES } from "@/lib/paises";
import { desglosar, margenDe, precioPedido } from "@/lib/precio";
import { Boton, Campo, EntradaNumero, EntradaTexto, IcoBasura, IcoCheck, IcoCompartir, IcoInfo, IcoMas, Segmentado } from "./ui";

const MARGENES = [
  { valor: 0.3, etiqueta: "30%", sub: "Básico" },
  { valor: 0.35, etiqueta: "35%", sub: "Recomendado" },
  { valor: 0.5, etiqueta: "50%", sub: "Crecimiento" },
];

export function PrecioReal({
  negocio,
  productos,
  recargar,
}: {
  negocio: Negocio;
  productos: Producto[];
  recargar: () => Promise<void>;
}) {
  const pais = negocio.pais;
  const p = PAISES[pais];
  const [productoId, setProductoId] = useState<number | undefined>();
  const [nombre, setNombre] = useState("");
  const [costoProducto, setCostoProducto] = useState(0);
  const [costoTransporte, setCostoTransporte] = useState(0);
  const [costoEmpaque, setCostoEmpaque] = useState(0);
  const [minutos, setMinutos] = useState(15);
  const [valorHora, setValorHora] = useState(p.valorHora);
  const [precioVenta, setPrecioVenta] = useState(0);
  const [margen, setMargen] = useState(0.35);
  const [venta, setVenta] = useState<"unidad" | "mayor">("unidad");
  const [unidades, setUnidades] = useState(10);
  const [flash, setFlash] = useState("");
  const [guardando, setGuardando] = useState(false);

  const d = useMemo(
    () => desglosar({ costoProducto, costoTransporte, costoEmpaque, minutos, valorHora }),
    [costoProducto, costoTransporte, costoEmpaque, minutos, valorHora],
  );

  const porMayor = venta === "mayor";
  const pedido = precioPedido(d.costoReal, porMayor ? unidades : 1, margen);
  const { cantidad, costoTotal, total: sugerido, porUnidad: sugeridoUnidad, ganancia } = pedido;
  const margenActual = margenDe(precioVenta, d.costoReal);
  const perdida = precioVenta > 0 ? precioVenta - d.costoReal : 0;

  const mensaje = `Análisis de precio · ${nombre || "mi producto"}
Costo real completo por unidad: ${dinero(d.costoReal, pais)}
Precio sugerido por unidad: ${dinero(sugeridoUnidad, pais)}
${porMayor ? `Pedido de ${cantidad} unidades · precio total: ${dinero(sugerido, pais)}\n` : ""}Ganancia real por unidad: ${dinero(ganancia / cantidad, pais)}

Calculado con Impetus.`;

  function cargar(prod: Producto) {
    setProductoId(prod.id);
    setNombre(prod.nombre);
    setCostoProducto(prod.costoProducto);
    setCostoTransporte(prod.costoTransporte);
    setCostoEmpaque(prod.costoEmpaque);
    setMinutos(prod.minutos);
    setValorHora(prod.valorHora || p.valorHora);
    setPrecioVenta(prod.precioVenta);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function nuevo() {
    setProductoId(undefined);
    setNombre("");
    setCostoProducto(0);
    setCostoTransporte(0);
    setCostoEmpaque(0);
    setMinutos(15);
    setValorHora(p.valorHora);
    setPrecioVenta(0);
  }

  async function guardar() {
    if (!nombre.trim() || d.costoReal <= 0 || guardando) return;
    setGuardando(true);
    try {
      await dbApi.guardarProducto({
        id: productoId,
        nombre: nombre.trim(),
        costoProducto,
        costoTransporte,
        costoEmpaque,
        minutos,
        valorHora,
        precioVenta: precioVenta || sugeridoUnidad,
      });
      await recargar();
      setPrecioVenta(precioVenta || sugeridoUnidad);
      setFlash(productoId ? "Precio actualizado" : "Producto guardado");
      window.setTimeout(() => setFlash(""), 2400);
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(id?: number) {
    if (!id) return;
    await dbApi.borrarProducto(id);
    if (id === productoId) nuevo();
    await recargar();
  }

  return (
    <div className="space-y-4" id="pantalla-precio">
      <DriveTutorial
        id="pantalla-precio"
        steps={[
          { element: "#pantalla-precio", popover: { title: "Precio real", description: "Aquí descubres cuánto te cuesta de verdad cada producto y a cuánto venderlo." } },
          { element: "#ds-precio-producto", popover: { title: "Elige el producto", description: "Nombre del producto que vas a analizar. Si ya lo guardaste, tócalo arriba." } },
          { element: "#ds-precio-costos", popover: { title: "Suma todo el costo", description: "Insumos, transporte, empaque y tu propio tiempo. Ese es el costo real de una unidad." } },
          { element: "#ds-precio-realidad", popover: { title: "Mira la diferencia", description: "Compara lo que creías que costaba con el costo real y tu precio actual." } },
          { element: "#ds-precio-margen", popover: { title: "Elige tu precio", description: "Selecciona el margen, revisa el precio sugerido y guárdalo en tu catálogo." } },
        ]}
      />
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-ambar-soft px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.1em] text-ambar-ink">
          Nivel esta semana · día 3 a 7
        </span>
        <h1 className="mt-2 title-xl">Calculadora de precio real</h1>
        <p className="mt-1.5 body-sm">
          10 de cada 12 micronegocios cobran solo por el insumo. Ojo con el flete, la bolsa y tu tiempo.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,600px)_minmax(0,380px)] lg:justify-center lg:items-start">
      <div className="space-y-4">
      {productos.length > 0 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={nuevo}
            className={`flex min-h-10 shrink-0 items-center gap-1 rounded-full px-3.5 text-[12px] font-bold ${
              !productoId ? "bg-ink text-white" : "bg-card text-ink ring-1 ring-line"
            }`}
          >
            <IcoMas className="size-3.5" /> Nuevo
          </button>
          {productos.map((prod) => (
            <button
              key={prod.id}
              type="button"
              onClick={() => cargar(prod)}
              className={`min-h-10 shrink-0 rounded-full px-3.5 text-[12px] font-bold ${
                productoId === prod.id ? "bg-verde text-white" : "bg-card text-ink ring-1 ring-line"
              }`}
            >
              {prod.nombre}
            </button>
          ))}
        </div>
      ) : null}

      <div className="card p-4" id="ds-precio-producto">
        <Campo
          label="Nombre del producto"
          hint="Escríbelo como lo conocen tus clientes. Ej. «Arepa de chócolo especial»."
        >
          <EntradaTexto
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej. Arepa de chócolo especial"
            maxLength={40}
            className="font-bold"
          />
        </Campo>
        <div className="mt-3 flex items-center gap-2 text-[11px] text-muted">
          <span className="rounded-full bg-lavanda px-2 py-1 font-bold">Paso 1 de 3</span>
          Completa el desglose real de una unidad
        </div>
      </div>

      <section className="card p-4" id="ds-precio-costos">
        <h2 className="mb-3 text-[14px] font-bold">Desglose del costo unitario</h2>
        <div className="space-y-3">
          <Fila
            etiqueta="Ingredientes o insumos"
            ayuda="Lo que gastas en materiales para UNA unidad: masa, queso, huevo…"
            emoji="🧾"
            valor={costoProducto}
            onCambio={setCostoProducto}
            pais={pais}
          />
          <Fila
            etiqueta="Transporte y fletes"
            ayuda="Lo que pagas por traer la mercancía o por una entrega, repartido por unidad."
            emoji="🛵"
            valor={costoTransporte}
            onCambio={setCostoTransporte}
            pais={pais}
          />
          <Fila
            etiqueta="Empaque y desechables"
            ayuda="Bolsa, vaso, caja o servilleta que entregas con cada venta."
            emoji="🛍️"
            valor={costoEmpaque}
            onCambio={setCostoEmpaque}
            pais={pais}
          />
          <div className="rounded-xl bg-verde-soft/60 p-3">
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-card text-[15px]">⏱️</span>
              <p className="flex-1 text-[13px] font-bold">Tu mano de obra propia</p>
              <p className="num text-[14px] font-extrabold text-verde">{dinero(d.manoObra, pais)}</p>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Campo label="Minutos por unidad" hint="Cuánto tardas en preparar UNA unidad.">
                <EntradaNumero valor={minutos} onCambio={setMinutos} sufijo="min" className="h-11 bg-card" />
              </Campo>
              <Campo label="Valor de tu hora" hint="Cuánto quieres ganar por hora de trabajo.">
                <EntradaNumero valor={valorHora} onCambio={setValorHora} sufijo={p.moneda} className="h-11 bg-card" />
              </Campo>
            </div>
          </div>
        </div>
      </section>

      <section className="card p-4" id="ds-precio-realidad">
        <div className="flex items-center justify-between">
          <h2 className="text-[14px] font-bold">El choque de la realidad</h2>
          {precioVenta > 0 && perdida < 0 ? (
            <span className="rounded-full bg-terra-soft px-2 py-1 text-[10px] font-extrabold text-terra">Diagnóstico crítico</span>
          ) : null}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <Metrica titulo="Solo insumos" valor={dinero(costoProducto, pais)} sub="Lo que anotabas" />
          <Metrica titulo="Costo real" valor={dinero(d.costoReal, pais)} sub="Con todo incluido" destacado />
          <Metrica titulo="Tu precio" valor={precioVenta ? dinero(precioVenta, pais) : "—"} sub={precioVenta ? "En mostrador" : "Sin definir"} />
        </div>

        {precioVenta > 0 ? (
          <div
            className={`mt-3 rounded-xl px-3 py-2.5 text-[12px] leading-snug ${
              perdida < 0
                ? "bg-terra-soft text-terra"
                : margenActual < 0.2
                  ? "bg-ambar-soft text-ambar-ink"
                  : "bg-verde-soft text-verde-deep"
            }`}
          >
            {perdida < 0 ? (
              <>
                <b>¡Estás perdiendo {dinero(Math.abs(perdida), pais)} por cada unidad!</b> Estás asumiendo el
                transporte, el empaque y tu esfuerzo sin cobrarlo.
              </>
            ) : margenActual < 0.2 ? (
              <>
                Tu precio cubre el costo, pero deja solo <b>{Math.round(margenActual * 100)}%</b> de margen. Es
                frágil ante cualquier subida.
              </>
            ) : (
              <>
                Tu precio cubre el costo y deja <b>{Math.round(margenActual * 100)}%</b> de margen real. Vas bien.
              </>
            )}
          </div>
        ) : null}
      </section>

      </div>

      <aside className="space-y-4 lg:sticky lg:top-24">
      <section className="card p-4" id="ds-precio-margen">
        <h2 className="text-[14px] font-bold">Margen de ganancia limpia</h2>
        <div className="mt-2">
          <Segmentado
            valor={venta}
            onCambio={setVenta}
            opciones={[
              { valor: "unidad", etiqueta: "Por unidad" },
              { valor: "mayor", etiqueta: "Al por mayor" },
            ]}
          />
        </div>
        {porMayor ? (
          <div className="mt-2">
            <Campo label="¿Cuántas unidades en el pedido?" hint="Calculamos el precio del pedido completo.">
              <EntradaNumero valor={unidades} onCambio={setUnidades} sufijo="u" className="h-11" />
            </Campo>
          </div>
        ) : null}
        <div className="mt-2 grid grid-cols-3 gap-2">
          {MARGENES.map((m) => (
            <button
              key={m.valor}
              type="button"
              onClick={() => setMargen(m.valor)}
              className={`rounded-xl px-2 py-2 text-center transition-colors ${
                margen === m.valor ? "bg-verde-soft ring-2 ring-verde" : "bg-paper"
              }`}
            >
              <span className="block text-[16px] font-extrabold">{m.etiqueta}</span>
              <span className="block text-[10px] text-muted">{m.sub}</span>
            </button>
          ))}
        </div>

        <div className="mt-3 rounded-2xl bg-verde px-4 py-4 text-white">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.12em] text-menta">
            <span>{porMayor ? `Por unidad · pedido de ${cantidad}` : "Precio sugerido y justo"}</span>
            <span>{p.moneda}</span>
          </div>
          <p className="num mt-1 text-[34px] font-extrabold leading-none">{dinero(sugeridoUnidad, pais)}</p>
          <p className="mt-1 text-[12px] text-white/85">
            {porMayor
              ? `${cantidad} unidades · total ${dinero(sugerido, pais)} · costo ${dinero(costoTotal, pais)}`
              : `Tu costo real es ${dinero(d.costoReal, pais)}`}
          </p>
          <p className="mt-3 border-t border-white/15 pt-2 text-[12px] text-white/85">
            Ganancia real libre por unidad: <b className="text-white">{dinero(ganancia / cantidad, pais)}</b>
            {porMayor ? <> · en el pedido <b className="text-white">{dinero(ganancia, pais)}</b></> : null}
          </p>
        </div>

        <div className="mt-3">
          <Campo
            label="Tu precio de venta actual"
            hint="Si lo dejas en 0, guardamos el precio sugerido."
          >
            <EntradaNumero valor={precioVenta} onCambio={setPrecioVenta} sufijo={p.moneda} />
          </Campo>
        </div>

        {flash ? <p className="pop mt-2 text-[12px] font-bold text-verde">{flash}</p> : null}

        <Boton bloque onClick={guardar} disabled={!nombre.trim() || d.costoReal <= 0 || guardando} className="mt-3 min-h-12">
          <IcoCheck className="size-4" />
          {guardando
            ? "Guardando…"
            : productoId
              ? "Actualizar precio"
              : "Guardar producto y precio"}
        </Boton>

        {nombre && d.costoReal > 0 ? (
          <a
            href={`https://wa.me/?text=${encodeURIComponent(mensaje)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex min-h-11 items-center justify-center gap-2 rounded-xl text-[12px] font-bold text-verde"
          >
            <IcoCompartir className="size-4" /> Compartir análisis por WhatsApp
          </a>
        ) : null}
      </section>

      <div className="flex gap-3 rounded-2xl bg-lavanda p-4">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-card text-verde">
          <IcoInfo className="size-5" />
        </span>
        <p className="text-[12px] leading-snug text-ink">
          <b>¿Te da miedo subir el precio?</b> El precio justo no es solo el insumo: incluye tu tiempo, el
          domicilio y la calidad.
        </p>
      </div>

      {productos.length > 0 ? (
        <section>
          <h2 className="mb-2 text-[13px] font-bold">Productos guardados</h2>
          <ul className="space-y-2">
            {productos.map((prod) => (
              <li key={prod.id} className="flex items-center gap-3 rounded-2xl border border-line bg-card px-3 py-2.5">
                <button type="button" onClick={() => cargar(prod)} className="min-w-0 flex-1 text-left">
                  <p className="truncate text-[13px] font-bold">{prod.nombre}</p>
                  <p className="text-[11px] text-muted">
                    Costo real {dinero(desglosar(prod).costoReal, pais)} · Venta {dinero(prod.precioVenta, pais)}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => eliminar(prod.id)}
                  aria-label={`Eliminar ${prod.nombre}`}
                  className="grid size-8 place-items-center rounded-full text-muted hover:bg-terra-soft hover:text-terra"
                >
                  <IcoBasura className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      </aside>
      </div>
    </div>
  );
}

function Fila({
  etiqueta,
  ayuda,
  emoji,
  valor,
  onCambio,
  pais,
}: {
  etiqueta: string;
  ayuda: string;
  emoji: string;
  valor: number;
  onCambio: (n: number) => void;
  pais: Negocio["pais"];
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-lavanda text-[15px]">{emoji}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold">{etiqueta}</p>
        <p className="mt-0.5 text-[11px] leading-snug text-muted">{ayuda}</p>
      </div>
      <div className="w-28 shrink-0">
        <EntradaNumero valor={valor} onCambio={onCambio} sufijo={PAISES[pais].moneda} className="h-11 text-right" />
      </div>
    </div>
  );
}

function Metrica({
  titulo,
  valor,
  sub,
  destacado,
}: {
  titulo: string;
  valor: string;
  sub: string;
  destacado?: boolean;
}) {
  return (
    <div className={`rounded-xl px-2 py-2.5 ${destacado ? "bg-ambar-soft" : "bg-paper"}`}>
      <p className="text-[10px] font-semibold text-muted">{titulo}</p>
      <p className="num mt-0.5 text-[14px] font-extrabold">{valor}</p>
      <p className="mt-0.5 text-[9px] leading-tight text-muted">{sub}</p>
    </div>
  );
}
