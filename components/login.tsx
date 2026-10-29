"use client";

import { useState } from "react";
import { entrar, type Sesion } from "@/lib/db";
import { Boton, Campo, EntradaTexto, IcoCandado } from "./ui";

export function Login({ onEntrar }: { onEntrar: (sesion: Sesion) => void }) {
  const [registro, setRegistro] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (enviando) return;
    setEnviando(true);
    setError("");
    try {
      const sesion = await entrar(email, password, registro);
      onEntrar(sesion);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos entrar. Intenta otra vez.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5">
          <div className="grid size-10 place-items-center rounded-[0.875rem] bg-verde text-white">
            <span className="font-display text-lg font-extrabold">i</span>
          </div>
          <div>
            <p className="font-display text-[17px] font-extrabold leading-none tracking-tight">Impetus</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Finanzas claras</p>
          </div>
        </div>

        <h1 className="mt-6 font-display text-[26px] font-extrabold leading-tight tracking-tight">
          {registro ? "Crea tu cuenta" : "Entra a tu negocio"}
        </h1>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
          Tus ventas, gastos y precios quedan solo en tu cuenta. Nadie más los ve.
        </p>

        <form onSubmit={enviar} className="mt-5 space-y-3">
          <Campo label="Correo">
            <EntradaTexto
              type="email"
              autoComplete="email"
              inputMode="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
            />
          </Campo>
          <Campo
            label="Contraseña"
            hint={registro ? "Mínimo 6 caracteres. Anótala en un lugar seguro." : undefined}
          >
            <EntradaTexto
              type="password"
              autoComplete={registro ? "new-password" : "current-password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
            />
          </Campo>

          {error ? (
            <p className="rounded-xl bg-terra-soft px-3 py-2 text-[12px] font-semibold text-terra" role="alert">
              {error}
            </p>
          ) : null}

          <Boton type="submit" bloque disabled={enviando}>
            <IcoCandado className="size-4" />
            {enviando ? "Entrando…" : registro ? "Crear cuenta y entrar" : "Entrar"}
          </Boton>
        </form>

        <button
          type="button"
          onClick={() => {
            setRegistro((r) => !r);
            setError("");
          }}
          className="mx-auto mt-4 block text-[13px] font-bold text-verde"
        >
          {registro ? "Ya tengo cuenta: entrar" : "No tengo cuenta: crear una"}
        </button>
      </div>
    </div>
  );
}
