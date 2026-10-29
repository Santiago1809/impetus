"use client";

import { useState } from "react";
import { DriveTutorial } from "@/lib/drive";
import { AVISO_RESPONSABILIDAD } from "@/data/apoyo";
import type { Cierre, Negocio } from "@/lib/db";
import { dinero, hoyISO } from "@/lib/format";
import { DIAS_PARA_RUTA, rutaDesbloqueada, type Resumen } from "@/lib/hoja-vida";
import { PAISES } from "@/lib/paises";
import { apoyosPara, ETIQUETAS_APOYO, ETIQUETAS_FORMALIDAD, ETIQUETAS_META } from "@/lib/reglas";
import { Boton, IcoCandado, IcoCheck, IcoCompartir, IcoFlecha, IcoInfo } from "./ui";

export function Ruta({
  negocio,
  cierres,
  resumen,
  onIrRegistro,
  onEjemplo,
  onExportar,
  onBorrar,
  onEditar,
}: {
  negocio: Negocio;
  cierres: Cierre[];
  resumen: Resumen;
  onIrRegistro: () => void;
  onEjemplo: () => Promise<void>;
  onExportar: () => void;
  onBorrar: () => void;
  onEditar: () => void;
}) {
  const pais = negocio.pais;
  const p = PAISES[pais];
  const [vista, setVista] = useState<"hoja" | "apoyos">("hoja");
  const abierta = rutaDesbloqueada(resumen);
  const apoyos = apoyosPara(pais, negocio);
  const constancia = Math.round(resumen.constancia * 100);
  const progreso = Math.min(resumen.diasUltimos30 / DIAS_PARA_RUTA, 1);

  const mensajeHoja = `Hoja de vida de mi negocio · Impetus
Negocio: ${negocio.tipoNegocio}
Ciudad: ${negocio.ciudad}, ${p.nombre}
Días con registro: ${resumen.diasRegistrados} (${resumen.diasUltimos30} en los últimos 30)
Ventas promedio: ${dinero(resumen.ventasPromedio, pais)} por día registrado
Constancia: ${constancia}% en los últimos 30 días
Fecha: ${hoyISO()}

Hoja autodeclarada. No es un score crediticio.`;

  if (!abierta) {
    return (
      <div className="space-y-4">
        <div>
          <p className="eyebrow">Mi historial</p>
          <h1 className="mt-1 title-xl">Empieza tu historial</h1>
        </div>

        <div id="ds-ruta-nivel" className="rounded-[1.5rem] bg-verde p-5 text-white">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em]">
            <IcoCandado className="size-3.5" /> Empieza con tu primera venta
          </span>
          <h2 className="mt-3 font-display text-[24px] font-bold leading-tight">
            Tu hoja de vida nace en la primera venta
          </h2>
          <p className="mt-1 text-[13px] leading-snug text-white/85">
            Registra una sola venta y se activa al instante. Después crece cada día que anotes algo.
          </p>
        </div>

        <div className="card space-y-3 p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Qué vas a desbloquear</p>
          {[
            ["🏅", "Hoja de vida del negocio", "Días registrados, ventas promedio y constancia."],
            ["🤝", "Apoyos según tu perfil", "Crédito, formalización y capacitación para tu meta."],
            ["📤", "Compartir por WhatsApp", "Un resumen claro para tu familia o una cooperativa."],
          ].map(([emoji, titulo, texto]) => (
            <div key={titulo} className="flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-lavanda text-lg">{emoji}</span>
              <div>
                <p className="text-[13px] font-bold">{titulo}</p>
                <p className="text-[11px] leading-snug text-muted">{texto}</p>
              </div>
            </div>
          ))}
        </div>

        <Boton bloque onClick={onIrRegistro} className="min-h-14">
          Registrar el día de hoy <IcoFlecha />
        </Boton>
        <Boton bloque variante="secondary" onClick={onEjemplo}>
          Probar con datos de ejemplo
        </Boton>
        <p className="text-center text-[11px] leading-snug text-muted">
          Los datos de ejemplo son ficticios y se guardan solo en este celular.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4" id="pantalla-ruta">
      <DriveTutorial
        id="pantalla-ruta"
        steps={[
          { element: "#pantalla-ruta", popover: { title: "Mi historial", description: "Aquí ves tus logros, tu hoja de vida y las opciones de apoyo para crecer." } },
          { element: "#ds-ruta-nivel", popover: { title: "Tu nivel", description: "Los días que registraste se convierten en confianza para tu negocio." } },
          { element: "#ds-ruta-tabs", popover: { title: "Dos vistas", description: "Hoja de vida con tus números, u opciones de apoyo para tu perfil." } },
          { element: "#ds-ruta-hoja", popover: { title: "Hoja de vida", description: "Tu constancia, ventas promedio y racha. Compártela cuando la necesites." } },
        ]}
      />
      <div className="rounded-[1.5rem] bg-verde p-5 text-white">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-menta px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.1em] text-verde-deep">
          <IcoCheck className="size-3.5" /> Nivel desbloqueado
        </span>
        <h1 className="mt-2 font-display text-[24px] font-bold leading-tight">
          {resumen.diasUltimos30} {resumen.diasUltimos30 === 1 ? "día con registro" : "días con registros"} en {negocio.ciudad}
        </h1>
        <p className="mt-1 text-[12px] leading-snug text-white/85">
          Tu disciplina contable ahora respalda la confianza en tu micronegocio.
        </p>
        <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold">
          📍 {negocio.ciudad} · {p.nombre}
        </p>
      </div>

      <div id="ds-ruta-tabs" className="grid grid-cols-2 gap-1 rounded-2xl bg-lavanda p-1">
        {(
          [
            ["hoja", "Hoja de vida"],
            ["apoyos", "Opciones de apoyo"],
          ] as const
        ).map(([v, label]) => (
          <button
            key={v}
            type="button"
            onClick={() => setVista(v)}
            aria-pressed={vista === v}
            className={`press min-h-11 rounded-[0.625rem] text-[13px] font-bold active:scale-[0.99] ${
              vista === v ? "bg-card text-ink shadow-sm" : "text-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {vista === "hoja" ? (
        <div className="space-y-3">
          <section className="card p-4" id="ds-ruta-hoja">
            <div className="flex items-start gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-verde-soft text-xl">🏪</span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-verde">
                  Autodeclarado · verificable
                </p>
                <h2 className="font-display text-[19px] font-bold leading-tight">{negocio.tipoNegocio}</h2>
                <p className="text-[12px] text-muted">
                  {negocio.ciudad} · Desde hace {negocio.antiguedadMeses} meses
                </p>
              </div>
              <span className="rounded-full bg-verde-soft px-2.5 py-1 text-[10px] font-extrabold text-verde-deep">
                {ETIQUETAS_META[negocio.meta]}
              </span>
            </div>

            <div className="mt-4 rounded-xl bg-paper p-3">
              <div className="flex items-center justify-between text-[12px]">
                <span className="font-semibold">Constancia de registro</span>
                <span className="font-extrabold text-verde">{constancia}% activo</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-lavanda-strong">
                <div className="h-full rounded-full bg-verde" style={{ width: `${Math.max(constancia, 3)}%` }} />
              </div>
              <p className="mt-1.5 text-[10px] text-muted">
                {resumen.diasUltimos30} de 30 días con registro · {ETIQUETAS_FORMALIDAD[negocio.formalidad]}
              </p>
            </div>
          </section>

          <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
            <div className="card p-4">
              <p className="text-[11px] font-semibold text-muted">Ventas promedio</p>
              <p className="num mt-1 text-[17px] font-extrabold text-verde">{dinero(resumen.ventasPromedio, pais)}</p>
              <p className="text-[10px] text-muted">por día registrado</p>
            </div>
            <div className="card p-4">
              <p className="text-[11px] font-semibold text-muted">Días seguidos</p>
              <p className="num mt-1 text-[17px] font-extrabold text-verde">{resumen.racha}</p>
              <p className="text-[10px] text-muted">racha actual</p>
            </div>
            <div className="card p-4">
              <p className="text-[11px] font-semibold text-muted">Cierres al día</p>
              <p className="num mt-1 text-[17px] font-extrabold text-verde">{cierres.length}</p>
              <p className="text-[10px] text-muted">días archivados</p>
            </div>
            <div className="card p-4">
              <p className="text-[11px] font-semibold text-muted">Días registrados</p>
              <p className="num mt-1 text-[17px] font-extrabold text-verde">{resumen.diasRegistrados}</p>
              <p className="text-[10px] text-muted">desde el inicio</p>
            </div>
          </div>

          <a
            href={`https://wa.me/?text=${encodeURIComponent(mensajeHoja)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-14 items-center justify-center gap-2 rounded-xl bg-wa text-[14px] font-extrabold text-[#062d15]"
          >
            <IcoCompartir className="size-5" /> Compartir hoja de vida por WhatsApp
          </a>

          <div className="flex gap-3 rounded-2xl bg-ambar-soft p-4">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ambar text-ambar-ink">
              <IcoInfo className="size-4" />
            </span>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-ambar-ink">
                Aviso de responsabilidad financiera
              </p>
              <p className="mt-1 text-[11px] leading-relaxed">{AVISO_RESPONSABILIDAD}</p>
            </div>
          </div>

          <section className="card p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[14px] font-bold">Tus datos y privacidad</h2>
              <IcoCandado className="size-4 text-muted" />
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-muted">
              Tus registros se guardan solo en la memoria de este celular. No compartimos tu saldo con terceros
              sin tu orden. {p.avisoDatos}
            </p>
            <Boton bloque variante="secondary" onClick={onExportar} className="mt-3">
              Exportar mis datos (JSON)
            </Boton>
            <Boton bloque variante="peligro" onClick={onBorrar} className="mt-2">
              Borrar mis datos si lo deseo
            </Boton>
            <button type="button" onClick={onEditar} className="mt-2 w-full text-[12px] font-bold text-verde">
              Editar mi perfil
            </button>
          </section>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-full bg-card px-2.5 py-1 text-[11px] font-semibold text-muted ring-1 ring-line">
              {ETIQUETAS_META[negocio.meta]}
            </span>
            <span className="rounded-full bg-card px-2.5 py-1 text-[11px] font-semibold text-muted ring-1 ring-line">
              {ETIQUETAS_FORMALIDAD[negocio.formalidad]}
            </span>
            <span className="rounded-full bg-card px-2.5 py-1 text-[11px] font-semibold text-muted ring-1 ring-line">
              {p.bandera} {p.nombre}
            </span>
          </div>

          {apoyos.length === 0 ? (
            <div className="card p-4 text-[13px] text-muted">No hay apoyos cargados para tu perfil en {p.nombre}.</div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {apoyos.map((a) => (
              <article key={a.id} className="card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-verde">{a.entidad}</p>
                    <h2 className="mt-0.5 font-display text-[16px] font-bold leading-tight">{a.nombre}</h2>
                    {a.ambito ? <p className="text-[10px] text-muted">{a.ambito}</p> : null}
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-extrabold uppercase ${
                      a.estado === "verificado"
                        ? "bg-verde-soft text-verde-deep"
                        : "bg-ambar-soft text-ambar-ink"
                    }`}
                  >
                    {ETIQUETAS_APOYO[a.estado]}
                  </span>
                </div>
                <p className="mt-2 text-[12px] leading-relaxed">{a.queEs}</p>
                <p className="mt-2 text-[11px] leading-snug text-muted">
                  <span className="font-bold text-ink">Aplica a:</span> {a.aplicaA}
                </p>
                <ul className="mt-2 space-y-1">
                  {a.requisitos.map((r) => (
                    <li key={r} className="flex gap-2 text-[11px] leading-snug text-muted">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-verde" /> {r}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-[11px] text-muted">
                  <span className="font-bold text-ink">Costo o tasa:</span> {a.costo}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <a
                    href={a.enlace}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-verde px-3 text-[12px] font-bold text-white"
                  >
                    Ver fuente oficial <IcoFlecha className="size-3.5" />
                  </a>
                  <span className="text-[9px] text-muted">
                    {a.fechaVerificacion ? `Verif. ${a.fechaVerificacion}` : "Sin verificar"}
                  </span>
                </div>
              </article>
            ))}
            </div>
          )}

          <div className="flex gap-3 rounded-2xl bg-ambar-soft p-4">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ambar text-ambar-ink">
              <IcoInfo className="size-4" />
            </span>
            <p className="text-[11px] leading-relaxed">{AVISO_RESPONSABILIDAD}</p>
          </div>
          <p className="text-center text-[10px] text-muted">
            Los programas marcados «por verificar» provienen de la base de apoyo y deben confirmarse con la
            entidad antes de usarse.
          </p>
        </div>
      )}
    </div>
  );
}
