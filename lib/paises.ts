export type PaisId = "CO" | "HN" | "MX";

export interface Pais {
  id: PaisId;
  nombre: string;
  bandera: string;
  moneda: string;
  locale: string;
  valorHora: number;
  montosRapidos: number[];
  ciudadEjemplo: string;
  avisoDatos: string;
}

export const PAISES: Record<PaisId, Pais> = {
  CO: {
    id: "CO",
    nombre: "Colombia",
    bandera: "🇨🇴",
    moneda: "COP",
    locale: "es-CO",
    valorHora: 12000,
    montosRapidos: [1000, 5000, 10000, 50000],
    ciudadEjemplo: "Medellín",
    avisoDatos:
      "Tus datos se guardan solo en este celular. Nadie más los ve y puedes borrarlos cuando quieras. En Colombia aplica la Ley 1581 de 2012 de protección de datos personales.",
  },
  HN: {
    id: "HN",
    nombre: "Honduras",
    bandera: "🇭🇳",
    moneda: "HNL",
    locale: "es-HN",
    valorHora: 100,
    montosRapidos: [10, 50, 100, 500],
    ciudadEjemplo: "Tegucigalpa",
    avisoDatos:
      "Tus datos se guardan solo en este celular. Nadie más los ve y puedes borrarlos cuando quieras. Se tratan según la normativa de protección de datos de Honduras.",
  },
  MX: {
    id: "MX",
    nombre: "México",
    bandera: "🇲🇽",
    moneda: "MXN",
    locale: "es-MX",
    valorHora: 80,
    montosRapidos: [10, 50, 100, 500],
    ciudadEjemplo: "Ciudad de México",
    avisoDatos:
      "Tus datos se guardan solo en este celular. Nadie más los ve y puedes borrarlos cuando quieras. En México aplica la Ley Federal de Protección de Datos Personales en Posesión de los Particulares.",
  },
};

export const LISTA_PAISES = [PAISES.CO, PAISES.HN, PAISES.MX];

export function esPais(valor: string): valor is PaisId {
  return valor === "CO" || valor === "HN" || valor === "MX";
}

/** A label for the local currency: "$", "L" or "MX$". */
export function simboloMoneda(pais: PaisId): string {
  return pais === "HN" ? "L" : "$";
}
