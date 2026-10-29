"use client";

import { useState } from "react";
import { DriveTutorial } from "@/lib/drive";
import { AVISO_TRIBUTARIO, RECURSOS, type Recurso } from "@/data/recursos";
import type { Negocio } from "@/lib/db";
import { PAISES } from "@/lib/paises";
import { ETIQUETAS_FORMALIDAD, ETIQUETAS_META, ETIQUETAS_RECURSO, recursosPara } from "@/lib/reglas";
import { IcoFlecha, IcoInfo } from "./ui";

type Vista = "tributario" | "financiero";

export function Guia({ negocio }: { negocio: Negocio }) {
  const [vista, setVista] = useState<Vista>("tributario");
  const [verTodo, setVerTodo] = useState(false);
  const pais = negocio.pais;
  const p = PAISES[pais];

  const ajustados = recursosPara(pais, negocio, vista);
  const recursos = verTodo
    ? RECURSOS[pais].filter((r) => r.tipo === vista)
    : ajustados;

  return (
    <div className="space-y-4" id="pantalla-guia">
      <DriveTutorial
        id="pantalla-guia"
        steps={[
          { element: "#pantalla-guia", popover: { title: "Trámites", description: "Impuestos, dinero y apoyos explicados para tu país, sin enredos." } },
          { element: "#ds-guia-perfil", popover: { title: "Hecho para ti", description: "Todo se ajusta a tu tipo de negocio, tu meta y tu formalidad." } },
          { element: "#ds-guia-tabs", popover: { title: "Dos temas", description: "Cambia entre impuestos y dinero/crédito según lo que necesites." } },
          { element: "#ds-guia-recursos", popover: { title: "Recursos útiles", description: "Toca cada tarjeta para ver el detalle, plazos y enlaces oficiales." } },
        ]}
      />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)] lg:items-start">
      <div>
        <p className="eyebrow">Impuestos y apoyos</p>
        <h1 className="mt-1 title-xl">
          Impuestos y dinero,
          <br />
          sin enredos
        </h1>
        <p className="mt-1.5 body-sm">
          Solo información de {p.bandera} {p.nombre}, ajustada a tu perfil y a tu meta.
        </p>
      </div>

      <div id="ds-guia-perfil" className="rounded-2xl border border-line bg-card p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Ajustado a tu perfil</p>
          <span className="rounded-full bg-verde-soft px-2 py-1 text-[10px] font-extrabold text-verde-deep">
            {p.bandera} {p.nombre}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Chip>{negocio.tipoNegocio}</Chip>
          <Chip>{ETIQUETAS_META[negocio.meta]}</Chip>
          <Chip>{ETIQUETAS_FORMALIDAD[negocio.formalidad]}</Chip>
        </div>
      </div>
      </div>

      <div id="ds-guia-tabs" className="grid grid-cols-2 gap-1 rounded-2xl bg-lavanda p-1">
        <button
          type="button"
          onClick={() => {
            setVista("tributario");
            setVerTodo(false);
          }}
          aria-pressed={vista === "tributario"}
          className={`press min-h-11 rounded-[0.625rem] text-[13px] font-bold active:scale-[0.99] ${
            vista === "tributario" ? "bg-card text-ink shadow-sm" : "text-muted"
          }`}
        >
          Impuestos
        </button>
        <button
          type="button"
          onClick={() => {
            setVista("financiero");
            setVerTodo(false);
          }}
          aria-pressed={vista === "financiero"}
          className={`press min-h-11 rounded-[0.625rem] text-[13px] font-bold active:scale-[0.99] ${
            vista === "financiero" ? "bg-card text-ink shadow-sm" : "text-muted"
          }`}
        >
          Dinero y crédito
        </button>
      </div>

      {ajustados.length === 0 ? (
        <div className="rounded-2xl bg-lavanda p-4">
          <p className="text-[13px] font-bold">No hay coincidencias exactas para tu perfil hoy.</p>
          <p className="mt-1 text-[12px] leading-snug text-muted">
            Puedes ver todo lo disponible para {p.nombre} y decidir qué te sirve.
          </p>
          <button
            type="button"
            onClick={() => setVerTodo(true)}
            className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-card px-4 text-[13px] font-bold text-verde"
          >
            Ver todo lo de {p.nombre} <IcoFlecha className="size-4" />
          </button>
        </div>
      ) : null}

      {verTodo ? (
        <button
          type="button"
          onClick={() => setVerTodo(false)}
          className="mx-auto flex min-h-11 items-center gap-2 rounded-xl px-4 text-[12px] font-bold text-verde"
        >
          Volver a lo de mi perfil
        </button>
      ) : null}

      <div id="ds-guia-recursos" className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {recursos.map((r) => (
          <TarjetaRecurso key={r.id} recurso={r} pais={p.nombre} />
        ))}
      </div>

      <div className="flex gap-3 rounded-2xl bg-ambar-soft p-4">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ambar text-ambar-ink">
          <IcoInfo className="size-4" />
        </span>
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-ambar-ink">Aviso importante</p>
          <p className="mt-1 text-[12px] leading-relaxed">{AVISO_TRIBUTARIO}</p>
          <p className="mt-2 text-[11px] text-ambar-ink">
            Contenido exclusivo de {p.nombre}. No se mezcla con otros países.
          </p>
        </div>
      </div>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-paper px-2.5 py-1 text-[11px] font-semibold text-muted">{children}</span>;
}

function TarjetaRecurso({ recurso, pais }: { recurso: Recurso; pais: string }) {
  const [abierto, setAbierto] = useState(false);
  return (
    <article className="card overflow-hidden">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <span
            className={`grid size-10 shrink-0 place-items-center rounded-xl text-lg ${
              recurso.tipo === "tributario" ? "bg-[#ffe3ef]" : "bg-[#dfe9ff]"
            }`}
          >
            {recurso.tipo === "tributario" ? "🧾" : "💳"}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-verde">{recurso.entidad}</p>
            <h2 className="mt-0.5 font-display text-[16px] font-bold leading-tight">{recurso.nombre}</h2>
          </div>
          <span
            className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-extrabold uppercase ${
              recurso.estado === "verificado" ? "bg-verde-soft text-verde-deep" : "bg-ambar-soft text-ambar-ink"
            }`}
          >
            {ETIQUETAS_RECURSO[recurso.estado]}
          </span>
        </div>

        <p className="mt-3 text-[12px] leading-relaxed text-ink/90">{recurso.queEs}</p>
        <p className="mt-2 text-[11px] leading-snug text-muted">
          <span className="font-bold text-ink">Aplica a:</span> {recurso.aplicaA}
        </p>

        {abierto ? (
          <div className="mt-3 space-y-3 rounded-xl bg-paper p-3">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-muted">Requisitos</p>
              <ul className="mt-1 space-y-1">
                {recurso.requisitos.map((r) => (
                  <li key={r} className="flex gap-2 text-[12px] leading-snug">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-verde" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-muted">Costo o tasa</p>
              <p className="mt-0.5 text-[12px] leading-snug">{recurso.costo}</p>
            </div>
            <p className="text-[10px] text-muted">
              {recurso.fechaVerificacion
                ? `Fuente oficial revisada el ${recurso.fechaVerificacion} · ${pais}`
                : `Sin verificar: confirmá costos y requisitos en la fuente oficial · ${pais}`}
            </p>
          </div>
        ) : null}

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => setAbierto(!abierto)}
            className="min-h-11 flex-1 rounded-xl bg-lavanda px-3 text-[12px] font-bold text-ink"
          >
            {abierto ? "Ver menos" : "Requisitos y costo"}
          </button>
          <a
            href={recurso.enlace}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-verde px-3 text-[12px] font-bold text-white"
          >
            Fuente oficial <IcoFlecha className="size-3.5" />
          </a>
        </div>
      </div>
    </article>
  );
}
