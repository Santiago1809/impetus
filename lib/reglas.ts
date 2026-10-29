import { APOYOS, type Apoyo } from "@/data/apoyo";
import { RECURSOS, type Recurso, type TipoRecurso } from "@/data/recursos";
import type { Negocio } from "./db";
import type { PaisId } from "./paises";

const ORDEN_ESTADO = { verificado: 0, por_verificar: 1, por_confirmar: 2 };

export function apoyosPara(pais: PaisId, negocio: Negocio): Apoyo[] {
  const todos = APOYOS[pais];
  const coinciden = todos.filter(
    (a) =>
      a.metas.includes(negocio.meta) &&
      (!a.formalidades || a.formalidades.length === 0 || a.formalidades.includes(negocio.formalidad)),
  );
  const lista = coinciden.length > 0 ? coinciden : todos;
  return [...lista].sort((a, b) => ORDEN_ESTADO[a.estado] - ORDEN_ESTADO[b.estado]);
}

export function recursosPara(pais: PaisId, negocio: Negocio, tipo: TipoRecurso): Recurso[] {
  return RECURSOS[pais]
    .filter(
      (r) =>
        r.tipo === tipo &&
        (!r.formalidades || r.formalidades.includes(negocio.formalidad)) &&
        (!r.metas || r.metas.includes(negocio.meta)),
    )
    .sort((a, b) => ORDEN_ESTADO[a.estado] - ORDEN_ESTADO[b.estado]);
}

export const ETIQUETAS_META: Record<Negocio["meta"], string> = {
  mantener: "Mantener mi negocio",
  crecer: "Crecer",
  formalizar: "Formalizarme",
  credito: "Conseguir crédito",
};

export const ETIQUETAS_FORMALIDAD: Record<Negocio["formalidad"], string> = {
  ninguna: "Aún sin registro",
  proceso: "En proceso",
  registrada: "Ya registrada",
};

export const ETIQUETAS_APOYO: Record<Apoyo["estado"], string> = {
  verificado: "Verificado",
  por_verificar: "Por verificar",
  por_confirmar: "Por confirmar",
};

export const ETIQUETAS_RECURSO: Record<Recurso["estado"], string> = {
  verificado: "Verificado",
  por_verificar: "Por verificar",
};
