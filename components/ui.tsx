"use client";

import { useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";

/* ---------------------------------- Icons --------------------------------- */

type IconProps = { className?: string };

function Svg({ className = "size-5", children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const IcoRegistro = ({ className }: IconProps) => (
  <Svg className={className}>
    <rect x="4" y="3" width="16" height="18" rx="2.5" />
    <path d="M8 7h8M8 12h2M14 12h2M8 16h2M14 16h2" />
  </Svg>
);

export const IcoCierre = ({ className }: IconProps) => (
  <Svg className={className}>
    <path d="M6 3h9l4 4v14H6z" />
    <path d="M9 9h6M9 13h6M9 17h3" />
  </Svg>
);

export const IcoPrecio = ({ className }: IconProps) => (
  <Svg className={className}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
    <path d="M8 8h4M8 16h2M15 8v8M12.5 16h5" />
  </Svg>
);

export const IcoGuia = ({ className }: IconProps) => (
  <Svg className={className}>
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
    <path d="M4 20.5V5.5M8 8h7M8 12h5" />
  </Svg>
);

export const IcoApoyos = ({ className }: IconProps) => (
  <Svg className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="m15.5 8.5-2 5-5 2 2-5z" />
  </Svg>
);

export const IcoRuta = ({ className }: IconProps) => (
  <Svg className={className}>
    <path d="M4 20V6a2 2 0 0 1 2-2h9l-1.5 3L15 10H6" />
    <path d="M8 20h10" />
  </Svg>
);

export const IcoAjustes = ({ className }: IconProps) => (
  <Svg className={className}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
  </Svg>
);

export const IcoBasura = ({ className }: IconProps) => (
  <Svg className={className}>
    <path d="M4 7h16M9 7V5h6v2M6 7l1 14h10l1-14M10 11v6M14 11v6" />
  </Svg>
);

export const IcoFlecha = ({ className }: IconProps) => (
  <Svg className={className}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
);

export const IcoCandado = ({ className }: IconProps) => (
  <Svg className={className}>
    <rect x="4" y="10" width="16" height="11" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </Svg>
);

export const IcoCompartir = ({ className }: IconProps) => (
  <Svg className={className}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4" />
  </Svg>
);

export const IcoCheck = ({ className }: IconProps) => (
  <Svg className={className}>
    <path d="m4 12 5 5L20 6" />
  </Svg>
);

export const IcoCerrar = ({ className }: IconProps) => (
  <Svg className={className}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);

export const IcoMas = ({ className }: IconProps) => (
  <Svg className={className}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

export const IcoMenos = ({ className }: IconProps) => (
  <Svg className={className}>
    <path d="M5 12h14" />
  </Svg>
);

export const IcoInfo = ({ className }: IconProps) => (
  <Svg className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8h.01" />
  </Svg>
);

export const IcoBorrar = ({ className }: IconProps) => (
  <Svg className={className}>
    <path d="M21 5H9L3 12l6 7h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1z" />
    <path d="m12 9 5 6M17 9l-5 6" />
  </Svg>
);

export const IcoRobot = ({ className }: IconProps) => (
  <Svg className={className}>
    <rect x="4" y="7" width="16" height="12" rx="3" />
    <path d="M9 12h.01M15 12h.01M9 16h6M12 3v4" />
  </Svg>
);

/* --------------------------------- Buttons -------------------------------- */

type BotonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: "primary" | "secondary" | "ghost" | "peligro" | "ambar";
  bloque?: boolean;
};

const estilosBoton: Record<NonNullable<BotonProps["variante"]>, string> = {
  primary: "bg-verde text-white shadow-[0_6px_16px_-10px_rgba(18,32,26,0.6)] hover:bg-verde-deep",
  secondary: "bg-lavanda text-ink hover:bg-lavanda-strong",
  ghost: "bg-transparent text-verde hover:bg-verde-soft",
  peligro: "bg-terra-soft text-terra hover:bg-terra/15",
  ambar: "bg-ambar text-ambar-ink hover:brightness-95",
};

export function Boton({ variante = "primary", bloque, className = "", ...props }: BotonProps) {
  return (
    <button
      {...props}
      className={`press inline-flex min-h-12 items-center justify-center gap-2 rounded-[0.875rem] px-5 text-[15px] font-bold active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-40 ${estilosBoton[variante]} ${bloque ? "w-full" : ""} ${className}`}
    />
  );
}

/* ---------------------------------- Sheet --------------------------------- */

export function Sheet({
  abierto,
  onCerrar,
  titulo,
  children,
}: {
  abierto: boolean;
  onCerrar: () => void;
  titulo: string;
  children: ReactNode;
}) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar();
    };
    window.addEventListener("keydown", onKey);
    panel.current?.focus();
    return () => {
      document.body.style.overflow = previo;
      window.removeEventListener("keydown", onKey);
    };
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onCerrar}
        className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]"
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        tabIndex={-1}
        className="sheet relative flex max-h-[94dvh] w-full flex-col overflow-hidden rounded-t-[1.5rem] border border-line bg-card shadow-2xl outline-none sm:max-w-md sm:rounded-[1.5rem]"
      >
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3.5">
          <h2 className="font-display text-[17px] font-extrabold tracking-tight">{titulo}</h2>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="grid size-9 place-items-center rounded-full text-muted hover:bg-black/5 hover:text-ink"
          >
            <IcoCerrar />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </div>
  );
}

/* ---------------------------------- Inputs -------------------------------- */

export function Etiqueta({ children }: { children: ReactNode }) {
  return <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{children}</span>;
}

export function Campo({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

const claseInput =
  "h-12 w-full rounded-[0.875rem] border border-line-strong bg-card px-3.5 text-[16px] text-ink placeholder:text-muted/70 transition-colors focus:border-verde focus:outline-none focus:ring-2 focus:ring-verde/15";

export function EntradaTexto(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return <input {...rest} className={`${claseInput} ${className}`} />;
}

export function EntradaNumero({
  valor,
  onCambio,
  sufijo,
  ...rest
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> & {
  valor: number;
  onCambio: (n: number) => void;
  sufijo?: string;
}) {
  const [texto, setTexto] = useState(valor ? String(valor) : "");
  const [previo, setPrevio] = useState(valor);

  // Reset the draft when the parent sets a new value (e.g. loading another product).
  if (valor !== previo) {
    setPrevio(valor);
    setTexto(valor ? String(valor) : "");
  }

  return (
    <div className="relative">
      <input
        {...rest}
        type="text"
        inputMode="numeric"
        value={texto}
        onChange={(e) => {
          const limpio = e.target.value.replace(/\D/g, "");
          setTexto(limpio);
          onCambio(Number(limpio || 0));
        }}
        className={`${claseInput} num pr-14`}
      />
      {sufijo ? (
        <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted">
          {sufijo}
        </span>
      ) : null}
    </div>
  );
}

export function Segmentado<T extends string>({
  valor,
  opciones,
  onCambio,
}: {
  valor: T;
  opciones: { valor: T; etiqueta: string; icono?: ReactNode }[];
  onCambio: (v: T) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-1 rounded-[0.875rem] border border-line bg-paper p-1">
      {opciones.map((o) => (
        <button
          key={o.valor}
          type="button"
          onClick={() => onCambio(o.valor)}
          aria-pressed={valor === o.valor}
          className={`flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors ${
            valor === o.valor ? "bg-card text-ink shadow-sm" : "text-muted hover:text-ink"
          }`}
        >
          {o.icono}
          {o.etiqueta}
        </button>
      ))}
    </div>
  );
}

export function Vacio({
  titulo,
  texto,
  children,
}: {
  titulo: string;
  texto: string;
  children?: ReactNode;
}) {
  return (
    <div className="card px-6 py-9 text-center">
      <div className="mx-auto mb-3 grid size-11 place-items-center rounded-full bg-verde-soft text-verde">
        <IcoInfo />
      </div>
      <p className="font-display text-[17px] font-extrabold tracking-tight">{titulo}</p>
      <p className="mt-1 text-sm leading-relaxed text-muted">{texto}</p>
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}
