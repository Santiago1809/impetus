"use client";
import { useEffect, useRef } from "react";
import { driver, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";

export type { DriveStep };

const STEPS: DriveStep[] = [
  { element: "#ds-nombre", popover: { title: "Nombre del negocio", description: "Le pones nombre al micronegocio." } },
  { element: "#ds-pais", popover: { title: "Tu país", description: "Elegimos fiscalidad e idioma." } },
  { element: "#ds-ciudad", popover: { title: "Tu ciudad", description: "Medellín, CDMX o Tegucigalpa." } },
  { element: "#ds-tipo", popover: { title: "Tipo de negocio", description: "El módulo se adapta a tu sector." } },
];

/**
 * Tutorial guiado con driver.js. Se muestra una sola vez por pantalla
 * (clave en localStorage) para quien entra por primera vez.
 */
export function DriveTutorial({
  id = "onboarding",
  steps = STEPS,
  onDone,
}: {
  id?: string;
  steps?: DriveStep[];
  onDone?: () => void;
}) {
  const doneRef = useRef(false);
  useEffect(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    const key = `impetus_tutorial_${id}`;
    try {
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, "1");
    } catch {
      /* sin storage: se muestra igual */
    }
    const drv = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      skipMissingElement: true,
      popoverClass: "bg-card border border-line rounded-2xl shadow-xl px-4 py-3",
    });
    drv.setSteps(steps);
    try {
      drv.drive();
    } catch {
      /* ignora si los targets aún no están en DOM */
    }
    const onClose = () => {
      drv.destroy();
      onDone?.();
    };
    window.setTimeout(onClose, 30000);
    return () => {
      try {
        drv.destroy();
      } catch {
        /* ya cerrado */
      }
    };
  }, [id, steps, onDone]);
  return null;
}
