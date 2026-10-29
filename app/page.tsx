import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-dvh place-items-center">
          <div className="flex flex-col items-center gap-3">
            <div className="grid size-11 place-items-center rounded-2xl bg-verde text-white">
              <span className="font-display text-lg font-extrabold">i</span>
            </div>
            <p className="text-[13px] text-muted">Abriendo tu registro…</p>
          </div>
        </div>
      }
    >
      <AppShell />
    </Suspense>
  );
}
