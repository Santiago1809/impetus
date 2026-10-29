/** "venta de 3 arepas por 18 mil" -> 18000 */
export function montoDeVoz(texto: string): number {
  const limpio = texto
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/,/g, ".");
  const numero = limpio.match(/\d+(\.\d+)?/)?.[0];
  if (!numero) return 0;
  let valor = Number.parseFloat(numero);
  if (!Number.isFinite(valor)) return 0;
  if (/\bmil\b/.test(limpio) && valor < 1000) valor *= 1000;
  return Math.round(valor);
}

export function hayVoz(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as unknown as Record<string, unknown>;
  return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
}

export function dictar(
  lang: string,
  onTexto: (texto: string) => void,
  onFin: () => void,
): (() => void) | null {
  if (!hayVoz()) return null;
  const w = window as unknown as Record<string, unknown>;
  const Reconocedor = (w.SpeechRecognition || w.webkitSpeechRecognition) as new () => {
    lang: string;
    interimResults: boolean;
    maxAlternatives: number;
    start: () => void;
    stop: () => void;
    onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
    onend: (() => void) | null;
    onerror: (() => void) | null;
  };

  const rec = new Reconocedor();
  rec.lang = lang;
  rec.interimResults = false;
  rec.maxAlternatives = 1;
  rec.onresult = (e) => {
    const texto = e.results?.[0]?.[0]?.transcript ?? "";
    onTexto(texto);
  };
  rec.onend = onFin;
  rec.onerror = onFin;
  rec.start();
  return () => rec.stop();
}
