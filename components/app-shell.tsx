"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { dbApi, salir, sesionActual, type Cierre, type Movimiento, type Negocio, type Producto, type Sesion } from "@/lib/db";
import { cargarEjemplo } from "@/lib/demo";
import { hoyISO } from "@/lib/format";
import { resumir } from "@/lib/hoja-vida";
import { PAISES } from "@/lib/paises";
import { Ajustes } from "./ajustes";
import { CierreDia } from "./cierre";
import { Guia } from "./guia";
import { Login } from "./login";
import { Onboarding } from "./onboarding";
import { PrecioReal } from "./precio";
import { Registro } from "./registro";
import { Ruta } from "./ruta";
import { IcoAjustes, IcoCierre, IcoGuia, IcoPrecio, IcoRegistro, IcoRuta } from "./ui";

type Tab = "registro" | "cierre" | "precio" | "guia" | "ruta";

const TABS = [
  { id: "registro" as Tab, etiqueta: "Anotar", Icono: IcoRegistro },
  { id: "cierre" as Tab, etiqueta: "Mi día", Icono: IcoCierre },
  { id: "precio" as Tab, etiqueta: "Precios", Icono: IcoPrecio },
  { id: "guia" as Tab, etiqueta: "Trámites", Icono: IcoGuia },
  { id: "ruta" as Tab, etiqueta: "Mi historial", Icono: IcoRuta },
];

export function AppShell() {
  const [cargando, setCargando] = useState(true);
  const [sesion, setSesion] = useState<Sesion | null | undefined>(undefined);
  const [negocio, setNegocio] = useState<Negocio | null>(null);
  const [movs, setMovs] = useState<Movimiento[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cierres, setCierres] = useState<Cierre[]>([]);
  const [tab, setTab] = useState<Tab>("registro");
  const [ajustes, setAjustes] = useState(false);
  const [editando, setEditando] = useState(false);
  const [online, setOnline] = useState(true);

  const recargar = useCallback(async () => {
    const [m, p, c] = await Promise.all([dbApi.getMovimientos(), dbApi.getProductos(), dbApi.getCierres()]);
    setMovs(m);
    setProductos(p);
    setCierres(c);
  }, []);

  useEffect(() => {
    let vivo = true;
    sesionActual()
      .then((s) => {
        if (vivo) setSesion(s);
      })
      .catch(() => {
        if (vivo) setSesion(null);
      });
    return () => {
      vivo = false;
    };
  }, []);

  useEffect(() => {
    if (!sesion) {
      setCargando(false);
      return;
    }
    let vivo = true;
    setCargando(true);
    (async () => {
      const n = await dbApi.getNegocio();
      if (!vivo) return;
      setNegocio(n);
      if (n) await recargar();
      if (vivo) setCargando(false);
    })().catch(() => setCargando(false));
    return () => {
      vivo = false;
    };
  }, [sesion, recargar]);

  useEffect(() => {
    const sync = () => setOnline(navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  const resumen = useMemo(() => resumir(movs), [movs]);

  async function guardarPerfil(n: Negocio) {
    await dbApi.guardarNegocio(n);
    setNegocio(n);
    setEditando(false);
    await recargar();
  }

  async function cargarDemo() {
    if (!negocio) return;
    await cargarEjemplo(negocio.pais);
    await recargar();
    setAjustes(false);
    setTab("ruta");
  }

  function exportar() {
    const datos = { negocio, movimientos: movs, productos, cierres, exportado: new Date().toISOString() };
    const url = URL.createObjectURL(new Blob([JSON.stringify(datos, null, 2)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `impetus-${negocio?.pais ?? "datos"}-${hoyISO()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function borrarDatos() {
    await dbApi.borrarTodo();
    setNegocio(null);
    setMovs([]);
    setProductos([]);
    setCierres([]);
    setAjustes(false);
    setTab("registro");
  }

  async function cerrarSesionApp() {
    await salir();
    setSesion(null);
    setNegocio(null);
    setMovs([]);
    setProductos([]);
    setCierres([]);
    setAjustes(false);
    setTab("registro");
  }

  if (cargando || sesion === undefined) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <div className="flex flex-col items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-verde text-white">
            <span className="font-display text-lg font-extrabold">i</span>
          </div>
          <p className="text-[13px] text-muted">Abriendo tu registro…</p>
        </div>
      </div>
    );
  }

  if (!sesion) {
    return <Login onEntrar={(s) => setSesion(s)} />;
  }

  if (!negocio || editando) {
    return <Onboarding inicial={negocio} modoEdicion={editando} onGuardar={guardarPerfil} />;
  }

  const p = PAISES[negocio.pais];

  return (
    <div className="min-h-dvh md:flex">
      {/* Sidebar: desktop only */}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-line bg-card px-4 py-6 md:flex">
        <div className="flex items-center gap-2.5 px-2">
          <div className="grid size-10 place-items-center rounded-[0.875rem] bg-verde text-white">
            <span className="font-display text-lg font-extrabold">i</span>
          </div>
          <div>
            <p className="font-display text-[17px] font-extrabold leading-none tracking-tight">Impetus</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Finanzas claras</p>
          </div>
        </div>

        <nav className="mt-8 flex-1">
          <ul className="space-y-1">
            {TABS.map(({ id, etiqueta, Icono }) => {
              const activo = tab === id;
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => setTab(id)}
                    aria-current={activo ? "page" : undefined}
                    className={`press flex w-full items-center gap-3 rounded-[0.75rem] px-3 py-2.5 text-left text-[14px] font-bold active:scale-[0.99] ${
                      activo ? "bg-verde-soft text-verde-deep" : "text-muted hover:bg-lavanda hover:text-ink"
                    }`}
                  >
                    <Icono className="size-5 shrink-0" />
                    {etiqueta}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-6 space-y-3 border-t border-line pt-4">
          <div className="rounded-[0.875rem] bg-paper px-3 py-2.5">
            <p className="truncate text-[13px] font-bold">{negocio.tipoNegocio}</p>
            <p className="mt-0.5 flex items-center gap-1.5 truncate text-[11px] text-muted">
              <span className={`size-1.5 shrink-0 rounded-full ${online ? "bg-wa" : "bg-ambar"}`} />
              {negocio.ciudad} · {p.bandera} {p.nombre}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAjustes(true)}
            className="press flex w-full items-center gap-2.5 rounded-[0.75rem] px-3 py-2 text-left text-[13px] font-bold text-muted hover:bg-lavanda hover:text-ink"
          >
            <IcoAjustes className="size-4" /> Ajustes y privacidad
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col md:mx-0 md:max-w-none md:flex-1">
        <header className="sticky top-0 z-30 border-b border-line bg-paper/85 px-4 pb-2.5 pt-[max(0.625rem,env(safe-area-inset-top))] backdrop-blur-md md:hidden">
          <div className="flex items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-[0.875rem] bg-verde text-white shadow-[0_6px_16px_-10px_rgba(18,32,26,0.7)]">
              <span className="font-display text-lg font-extrabold">i</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-[15px] font-extrabold leading-tight tracking-tight">
                {negocio.tipoNegocio}
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 truncate text-[11px] font-medium text-muted">
                <span className={`size-1.5 shrink-0 rounded-full ${online ? "bg-wa" : "bg-ambar"}`} />
                {negocio.ciudad} · {p.bandera} {p.nombre}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAjustes(true)}
              aria-label="Ajustes y privacidad"
              className="press grid size-11 shrink-0 place-items-center rounded-[0.875rem] border border-line bg-card text-ink hover:bg-lavanda active:scale-95"
            >
              <IcoAjustes className="size-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 pb-32 pt-4 md:px-8 md:pb-12 md:pt-7">
          <div className="mx-auto w-full md:max-w-6xl">
            {tab === "registro" ? (
              <Registro negocio={negocio} movs={movs} productos={productos} recargar={recargar} irACierre={() => setTab("cierre")} />
            ) : null}
            {tab === "cierre" ? (
              <CierreDia
                negocio={negocio}
                movs={movs}
                productos={productos}
                cierres={cierres}
                recargar={recargar}
                irAPrecio={() => setTab("precio")}
                irARegistro={() => setTab("registro")}
              />
            ) : null}
            {tab === "precio" ? <PrecioReal negocio={negocio} productos={productos} recargar={recargar} /> : null}
            {tab === "guia" ? <Guia negocio={negocio} /> : null}
            {tab === "ruta" ? (
              <Ruta
                negocio={negocio}
                cierres={cierres}
                resumen={resumen}
                onIrRegistro={() => setTab("registro")}
                onEjemplo={cargarDemo}
                onExportar={exportar}
                onBorrar={borrarDatos}
                onEditar={() => setEditando(true)}
              />
            ) : null}
          </div>
        </main>

        <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[480px] border-t border-line bg-card/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-md md:hidden">
          <ul className="grid grid-cols-5">
            {TABS.map(({ id, etiqueta, Icono }) => {
              const activo = tab === id;
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => setTab(id)}
                    aria-current={activo ? "page" : undefined}
                    aria-label={etiqueta}
                    className={`press flex w-full flex-col items-center gap-1 rounded-[0.875rem] py-1.5 text-[10px] font-bold ${
                      activo ? "text-verde" : "text-muted active:scale-95"
                    }`}
                  >
                    <span
                      className={`grid h-8 w-11 place-items-center rounded-full ${
                        activo ? "bg-verde-soft" : "bg-transparent"
                      }`}
                    >
                      <Icono className={`size-[19px] ${activo ? "stroke-[2.2]" : ""}`} />
                    </span>
                    {etiqueta}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <Ajustes
        abierto={ajustes}
        onCerrar={() => setAjustes(false)}
        negocio={negocio}
        cuenta={sesion.email}
        movimientos={movs.length}
        onEditar={() => {
          setAjustes(false);
          setEditando(true);
        }}
        onEjemplo={cargarDemo}
        onExportar={exportar}
        onBorrarTodo={borrarDatos}
        onSalir={cerrarSesionApp}
      />
    </div>
  );
}
