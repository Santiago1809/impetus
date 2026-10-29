"use client";

import { useState } from "react";
import type { Negocio } from "@/lib/db";
import { PAISES } from "@/lib/paises";
import { ETIQUETAS_FORMALIDAD, ETIQUETAS_META } from "@/lib/reglas";
import { Boton, IcoBasura, IcoFlecha, IcoInfo, Sheet } from "./ui";

export function Ajustes({
  abierto,
  onCerrar,
  negocio,
  movimientos,
  onEditar,
  onEjemplo,
  onExportar,
  onBorrarTodo,
}: {
  abierto: boolean;
  onCerrar: () => void;
  negocio: Negocio;
  movimientos: number;
  onEditar: () => void;
  onEjemplo: () => Promise<void>;
  onExportar: () => void;
  onBorrarTodo: () => Promise<void>;
}) {
  const [confirmar, setConfirmar] = useState(false);
  const [cargandoEjemplo, setCargandoEjemplo] = useState(false);
  const p = PAISES[negocio.pais];

  return (
    <Sheet abierto={abierto} onCerrar={onCerrar} titulo="Ajustes">
      <div className="space-y-4">
        <div className="rounded-2xl bg-paper p-4">
          <p className="eyebrow">Mi negocio</p>
          <p className="mt-1 font-display text-[17px] font-extrabold tracking-tight">{negocio.tipoNegocio}</p>
          <p className="text-[12px] text-muted">
            {negocio.ciudad} · {p.bandera} {p.nombre}
          </p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <span className="chip !min-h-7 !px-2.5 !text-[10px] !text-muted">{ETIQUETAS_META[negocio.meta]}</span>
            <span className="chip !min-h-7 !px-2.5 !text-[10px] !text-muted">{ETIQUETAS_FORMALIDAD[negocio.formalidad]}</span>
            <span className="chip !min-h-7 !px-2.5 !text-[10px] !text-muted">{movimientos} registros</span>
          </div>
          <button
            type="button"
            onClick={onEditar}
            className="press mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-[0.875rem] bg-card text-[13px] font-bold text-verde active:scale-[0.99]"
          >
            Editar mi perfil <IcoFlecha className="size-4" />
          </button>
        </div>

        <div className="space-y-2">
          <p className="eyebrow">Datos y respaldo</p>
          <Boton bloque variante="secondary" onClick={onExportar}>
            Exportar mis datos (JSON)
          </Boton>
          <Boton
            bloque
            variante="secondary"
            disabled={cargandoEjemplo}
            onClick={async () => {
              if (movimientos > 0 && !window.confirm("Esto agrega 18 días ficticios a tu historial actual. ¿Continuar?")) {
                return;
              }
              setCargandoEjemplo(true);
              await onEjemplo().finally(() => setCargandoEjemplo(false));
            }}
          >
            {cargandoEjemplo ? "Cargando ejemplo…" : "Agregar 18 días de ejemplo"}
          </Boton>
        </div>

        <div className="flex gap-3 rounded-2xl bg-lavanda p-4">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-card text-verde">
            <IcoInfo className="size-4" />
          </span>
          <p className="text-[11px] leading-relaxed text-ink">
            <b>100% en tu celular.</b> Impetus no envía tus datos a ningún servidor. Si borras la app o los
            datos del navegador, se pierden: exporta un respaldo si te sirve.
          </p>
        </div>

        <div className="rounded-2xl border border-terra/25 p-4">
          <p className="text-[12px] font-bold text-terra">Zona peligrosa</p>
          <p className="mt-1 text-[11px] leading-snug text-muted">
            Se borran el perfil, los movimientos, los productos y los cierres de este celular.
          </p>
          {confirmar ? (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Boton variante="ghost" onClick={() => setConfirmar(false)}>
                Cancelar
              </Boton>
              <Boton
                variante="peligro"
                onClick={async () => {
                  setConfirmar(false);
                  await onBorrarTodo();
                }}
              >
                Sí, borrar
              </Boton>
            </div>
          ) : (
            <Boton bloque variante="peligro" onClick={() => setConfirmar(true)} className="mt-3">
              <IcoBasura className="size-4" /> Borrar todos mis datos
            </Boton>
          )}
        </div>

        <p className="pb-2 text-center text-[10px] text-muted">
          Impetus · prototipo · datos locales · {new Date().getFullYear()}
        </p>
      </div>
    </Sheet>
  );
}
