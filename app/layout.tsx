import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Impetus · Mi negocio, claro",
  description:
    "Registra ventas y gastos, calcula tu precio real y cierra el día. Tus datos quedan en tu celular.",
  applicationName: "Impetus",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Impetus",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#17493c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-CO" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
