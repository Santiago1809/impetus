import type { Formalidad, Meta } from "@/lib/db";
import type { PaisId } from "@/lib/paises";

export type TipoRecurso = "tributario" | "financiero";

export interface Recurso {
  id: string;
  tipo: TipoRecurso;
  nombre: string;
  entidad: string;
  queEs: string;
  aplicaA: string;
  requisitos: string[];
  costo: string;
  enlace: string;
  /** Only show when the profile's formalidad is in this list (omit = todos). */
  formalidades?: Formalidad[];
  /** Only show when the profile's meta is in this list (omit = todas). */
  metas?: Meta[];
  estado: "verificado" | "por_verificar";
  fechaVerificacion: string;
}

/**
 * Country-scoped tax and financial guidance. Never mixed across countries.
 * Verify every figure with the official authority before a real pilot.
 */
export const RECURSOS: Record<PaisId, Recurso[]> = {
  CO: [
    {
      id: "co-rut",
      tipo: "tributario",
      nombre: "RUT y régimen tributario",
      entidad: "DIAN",
      queEs:
        "El RUT es el registro único tributario. Define cómo declarás y qué impuestos te corresponden según tu actividad e ingresos.",
      aplicaA: "Toda persona que vende o presta servicios, incluso si aún no se ha formalizado.",
      requisitos: ["Documento de identidad", "Dirección y actividad económica", "Actualizar el RUT si cambia la actividad"],
      costo: "Gratuito. Las declaraciones pueden tener sanciones si se presentan tarde.",
      enlace: "https://www.dian.gov.co",
      formalidades: ["ninguna", "proceso", "registrada"],
      metas: ["formalizar", "crecer"],
      estado: "por_verificar",
      fechaVerificacion: "",
    },
    {
      id: "co-simple",
      tipo: "tributario",
      nombre: "Régimen Simple de Tributación (RST)",
      entidad: "DIAN",
      queEs:
        "Un régimen que unifica varios impuestos en una sola declaración y puede reducir la carga para negocios pequeños.",
      aplicaA: "Personas naturales y jurídicas con ingresos bajos que cumplan los topes del régimen.",
      requisitos: [
        "Estar inscrito en el RUT",
        "Cumplir los límites de ingresos y actividad",
        "Presentar la declaración anual del régimen",
      ],
      costo: "La tarifa depende de la actividad y de los ingresos.",
      enlace: "https://www.dian.gov.co",
      formalidades: ["proceso", "registrada"],
      metas: ["formalizar", "mantener"],
      estado: "por_verificar",
      fechaVerificacion: "",
    },
    {
      id: "co-factura",
      tipo: "tributario",
      nombre: "Facturación electrónica",
      entidad: "DIAN",
      queEs:
        "La factura electrónica es obligatoria para quienes venden productos o servicios y es la prueba fiscal de tus ingresos.",
      aplicaA: "Negocios responsables de IVA o con actividad económica registrada.",
      requisitos: ["RUT actualizado", "Habilitación en el sistema de facturación", "Resolución o rango de numeración"],
      costo: "El software o proveedor tecnológico puede cobrar; la habilitación ante la DIAN no tiene costo.",
      enlace: "https://www.dian.gov.co",
      formalidades: ["proceso", "registrada"],
      metas: ["formalizar", "crecer"],
      estado: "por_verificar",
      fechaVerificacion: "",
    },
    {
      id: "co-ica",
      tipo: "tributario",
      nombre: "Impuesto de Industria y Comercio (ICA)",
      entidad: "Alcaldía de Medellín",
      queEs:
        "Impuesto municipal sobre los ingresos de la actividad comercial, industrial o de servicios en la ciudad.",
      aplicaA: "Negocios que venden o prestan servicios dentro del municipio.",
      requisitos: ["Registro en el municipio", "Declaración según la periodicidad que corresponda"],
      costo: "Tarifa municipal según la actividad; consultá la Secretaría de Hacienda.",
      enlace: "https://www.medellin.gov.co",
      formalidades: ["proceso", "registrada"],
      metas: ["formalizar", "mantener"],
      estado: "por_verificar",
      fechaVerificacion: "",
    },
    {
      id: "co-pila",
      tipo: "tributario",
      nombre: "Seguridad social del trabajador independiente",
      entidad: "PILA / UGPP",
      queEs:
        "Como independiente también aportás a salud y pensión. Estar al día te protege y fortalece tu historial.",
      aplicaA: "Personas que trabajan por cuenta propia y reciben ingresos por su actividad.",
      requisitos: ["Afiliación a EPS y fondo de pensión", "Reportar los aportes por PILA", "Ingresos declarados según tu actividad"],
      costo: "Porcentaje sobre el ingreso base de cotización.",
      enlace: "https://www.ugpp.gov.co",
      formalidades: ["proceso", "registrada"],
      metas: ["formalizar", "mantener"],
      estado: "por_verificar",
      fechaVerificacion: "",
    },
    {
      id: "co-usura",
      tipo: "financiero",
      nombre: "Tasa de usura y crédito formal",
      entidad: "Superintendencia Financiera de Colombia",
      queEs:
        "La tasa de usura es el máximo que puede cobrarte un crédito. Comparar la tasa evita pagar de más o caer en prestamistas informales.",
      aplicaA: "Cualquier persona que esté pensando en pedir un crédito.",
      requisitos: ["Consultar la tasa vigente antes de firmar", "Revisar el costo total, no solo la cuota"],
      costo: "Gratuito consultar. El crédito tiene intereses y posiblemente seguros o cuotas.",
      enlace: "https://www.superfinanciera.gov.co",
      formalidades: ["ninguna", "proceso", "registrada"],
      metas: ["mantener", "crecer", "credito"],
      estado: "por_verificar",
      fechaVerificacion: "",
    },
    {
      id: "co-educacion",
      tipo: "financiero",
      nombre: "Educación financiera para micronegocios",
      entidad: "Banca de las Oportunidades",
      queEs:
        "Guías públicas para separar la plata del negocio de la personal, presupuestar y elegir productos financieros formales.",
      aplicaA: "Micronegocios que quieren ordenar sus finanzas antes de pedir crédito.",
      requisitos: ["Ninguno para consultar"],
      costo: "Gratuito.",
      enlace: "https://www.bancadelasoportunidades.gov.co",
      formalidades: ["ninguna", "proceso", "registrada"],
      metas: ["mantener", "crecer", "credito", "formalizar"],
      estado: "por_verificar",
      fechaVerificacion: "",
    },
  ],

  HN: [
    {
      id: "hn-rtn",
      tipo: "tributario",
      nombre: "RTN y obligaciones ante el SAR",
      entidad: "Servicio de Administración de Rentas (SAR)",
      queEs:
        "El Registro Tributario Nacional (RTN) identifica tu actividad ante el fisco y habilita tus declaraciones.",
      aplicaA: "Toda persona que realiza una actividad económica en Honduras.",
      requisitos: ["Documento de identidad", "Datos del negocio y actividad", "Actualizar el RTN si cambia la actividad"],
      costo: "El trámite es gratuito; las declaraciones y multas dependen del régimen.",
      enlace: "https://www.sar.gob.hn",
      formalidades: ["ninguna", "proceso", "registrada"],
      metas: ["formalizar", "crecer"],
      estado: "por_verificar",
      fechaVerificacion: "",
    },
    {
      id: "hn-isv",
      tipo: "tributario",
      nombre: "Impuesto Sobre Ventas (ISV)",
      entidad: "SAR",
      queEs:
        "Impuesto al consumo que se agrega al precio de venta en los productos y servicios alcanzados por la ley.",
      aplicaA: "Negocios que venden productos o servicios gravados y están inscritos como contribuyentes.",
      requisitos: ["RTN activo", "Facturas o documentos de venta", "Declarar y pagar en los plazos del SAR"],
      costo: "La tasa general es del 15%. Hay bienes y servicios con tratamiento distinto.",
      enlace: "https://www.sar.gob.hn",
      formalidades: ["proceso", "registrada"],
      metas: ["formalizar", "crecer"],
      estado: "por_verificar",
      fechaVerificacion: "",
    },
    {
      id: "hn-simplificado",
      tipo: "tributario",
      nombre: "Régimen simplificado para pequeños contribuyentes",
      entidad: "SAR",
      queEs:
        "Un esquema con trámites y declaraciones más simples para negocios de menor tamaño. El SAR define si calificás.",
      aplicaA: "Pequeños negocios con ingresos bajos que quieren cumplir sin una carga contable grande.",
      requisitos: ["RTN", "Estar dentro de los límites del régimen", "Presentar las declaraciones del esquema"],
      costo: "Depende del régimen y de los ingresos declarados.",
      enlace: "https://www.sar.gob.hn",
      formalidades: ["ninguna", "proceso"],
      metas: ["formalizar", "mantener"],
      estado: "por_verificar",
      fechaVerificacion: "",
    },
    {
      id: "hn-permiso",
      tipo: "tributario",
      nombre: "Permiso de operación municipal",
      entidad: "Alcaldía de tu municipio",
      queEs:
        "La mayoría de los negocios necesita un permiso municipal para operar. El requisito y el costo cambian por ciudad.",
      aplicaA: "Negocios con local o punto de venta en un municipio.",
      requisitos: ["RTN", "Solicitud en la alcaldía", "Cumplir los requisitos locales de uso de suelo"],
      costo: "Tasa municipal según el tipo de negocio.",
      enlace: "https://www.gob.hn",
      formalidades: ["ninguna", "proceso", "registrada"],
      metas: ["formalizar", "mantener"],
      estado: "por_verificar",
      fechaVerificacion: "",
    },
    {
      id: "hn-tasas",
      tipo: "financiero",
      nombre: "Tasas de interés y crédito supervisado",
      entidad: "Banco Central de Honduras (BCH)",
      queEs:
        "Consultá las tasas de referencia y compará el costo real del crédito antes de firmar con cualquier entidad.",
      aplicaA: "Cualquier persona que esté evaluando un crédito o una cooperativa.",
      requisitos: ["Comparar tasa, plazo y cuota total", "Verificar que la entidad esté supervisada"],
      costo: "Gratuito consultar. El crédito tiene intereses y comisiones.",
      enlace: "https://www.bch.hn",
      formalidades: ["ninguna", "proceso", "registrada"],
      metas: ["mantener", "crecer", "credito"],
      estado: "por_verificar",
      fechaVerificacion: "",
    },
    {
      id: "hn-educacion",
      tipo: "financiero",
      nombre: "Educación financiera y entidades supervisadas",
      entidad: "Comisión Nacional de Bancos y Seguros (CNBS)",
      queEs:
        "Información para entender productos financieros, verificar entidades autorizadas y evitar préstamos abusivos.",
      aplicaA: "Personas y micronegocios que quieren usar servicios financieros formales.",
      requisitos: ["Ninguno para consultar"],
      costo: "Gratuito.",
      enlace: "https://www.cnbs.gob.hn",
      formalidades: ["ninguna", "proceso", "registrada"],
      metas: ["mantener", "crecer", "credito", "formalizar"],
      estado: "por_verificar",
      fechaVerificacion: "",
    },
  ],

  MX: [
    {
      id: "mx-rfc",
      tipo: "tributario",
      nombre: "RFC y alta ante el SAT",
      entidad: "Servicio de Administración Tributaria (SAT)",
      queEs:
        "El RFC es la clave fiscal. Con ella puedes emitir facturas, declarar y acceder a programas formales.",
      aplicaA: "Toda persona que vende o presta servicios, incluso desde casa.",
      requisitos: ["Identificación oficial", "CURP", "Comprobante de domicilio", "Elegir el régimen fiscal"],
      costo: "El trámite es gratuito; las obligaciones dependen del régimen.",
      enlace: "https://www.sat.gob.mx",
      formalidades: ["ninguna", "proceso", "registrada"],
      metas: ["formalizar", "crecer"],
      estado: "por_verificar",
      fechaVerificacion: "",
    },
    {
      id: "mx-resico",
      tipo: "tributario",
      nombre: "RESICO (Régimen Simplificado de Confianza)",
      entidad: "SAT",
      queEs:
        "Régimen para personas físicas con ingresos moderados: menos trámites y una tasa de ISR más baja.",
      aplicaA: "Personas físicas con ingresos anuales dentro del límite del régimen.",
      requisitos: ["RFC activo", "No superar el límite anual de ingresos", "Emitir facturas y presentar declaraciones"],
      costo: "Depende de los ingresos y de la tasa del régimen.",
      enlace: "https://www.sat.gob.mx",
      formalidades: ["proceso", "registrada"],
      metas: ["formalizar", "mantener"],
      estado: "por_verificar",
      fechaVerificacion: "",
    },
    {
      id: "mx-cfdi",
      tipo: "tributario",
      nombre: "Facturación CFDI 4.0",
      entidad: "SAT",
      queEs:
        "La factura electrónica (CFDI) respalda tus ventas y es obligatoria para contribuyentes del régimen formal.",
      aplicaA: "Negocios dados de alta en el SAT que venden a otras personas o empresas.",
      requisitos: ["RFC y contraseña del SAT", "Certificado de sello digital", "Software o proveedor autorizado"],
      costo: "La facturación puede tener costo si usás un proveedor; el SAT no cobra por el timbrado.",
      enlace: "https://www.sat.gob.mx",
      formalidades: ["proceso", "registrada"],
      metas: ["formalizar", "crecer"],
      estado: "por_verificar",
      fechaVerificacion: "",
    },
    {
      id: "mx-iva",
      tipo: "tributario",
      nombre: "IVA e ISR del negocio",
      entidad: "SAT",
      queEs:
        "El IVA se traslada al cliente y el ISR grava la ganancia. Ambos se declaran según el régimen y la periodicidad.",
      aplicaA: "Personas con actividad empresarial o profesional registradas ante el SAT.",
      requisitos: ["RFC", "Facturas de ventas y compras", "Declaraciones mensuales o anuales"],
      costo: "IVA general del 16%; el ISR depende de la ganancia y del régimen.",
      enlace: "https://www.sat.gob.mx",
      formalidades: ["registrada"],
      metas: ["crecer", "mantener"],
      estado: "por_verificar",
      fechaVerificacion: "",
    },
    {
      id: "mx-cat",
      tipo: "financiero",
      nombre: "CAT y costo real del crédito",
      entidad: "CONDUSEF",
      queEs:
        "El CAT mide el costo total de un crédito, incluyendo intereses y comisiones. Compararlo evita deudas impagables.",
      aplicaA: "Cualquier persona que esté por pedir un crédito o tarjeta.",
      requisitos: ["Pedir el CAT por escrito", "Comparar al menos dos opciones", "Revisar la tabla de comisiones"],
      costo: "Gratuito consultar. El crédito tiene intereses, comisiones y posibles seguros.",
      enlace: "https://www.condusef.gob.mx",
      formalidades: ["ninguna", "proceso", "registrada"],
      metas: ["mantener", "crecer", "credito"],
      estado: "por_verificar",
      fechaVerificacion: "",
    },
    {
      id: "mx-educacion",
      tipo: "financiero",
      nombre: "Educación financiera y prevención de fraude",
      entidad: "CONDUSEF",
      queEs:
        "Guías para presupuestar, separar el dinero del negocio y reconocer préstamos abusivos o fraudes digitales.",
      aplicaA: "Micronegocios y personas que manejan efectivo o piden crédito.",
      requisitos: ["Ninguno para consultar"],
      costo: "Gratuito.",
      enlace: "https://www.condusef.gob.mx",
      formalidades: ["ninguna", "proceso", "registrada"],
      metas: ["mantener", "crecer", "credito", "formalizar"],
      estado: "por_verificar",
      fechaVerificacion: "",
    },
  ],
};

export const AVISO_TRIBUTARIO =
  "La información fiscal y financiera es orientativa y puede cambiar. Confirmá siempre con la autoridad tributaria o la entidad correspondiente antes de tomar una decisión.";
