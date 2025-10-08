import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Providers from "./providers";
import "./globals.css";
import { Suspense } from "react";
import TopLoader from "@/components/shared/TopLoader/TopLoader";
import { Viewport } from "next";

const geistSans = Geist({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  title: "SGIRS: Sistema de Gestión Integral de Residuos Sólidos",
  description: "Sistema de Gestión Integral de Residuos Sólidos",
  icons: {
    icon: [
      { url: "/favicon_io/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon_io/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon_io/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon_io/android-icon-36x36.png", sizes: "36x36", type: "image/png" },
      { url: "/favicon_io/android-icon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon_io/android-icon-72x72.png", sizes: "72x72", type: "image/png" },
      { url: "/favicon_io/android-icon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon_io/android-icon-144x144.png", sizes: "144x144", type: "image/png" },
      { url: "/favicon_io/android-icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/favicon_io/favicon.ico",
    apple: [
      { url: "/favicon_io/apple-icon-57x57.png", sizes: "57x57", type: "image/png" },
      { url: "/favicon_io/apple-icon-60x60.png", sizes: "60x60", type: "image/png" },
      { url: "/favicon_io/apple-icon-72x72.png", sizes: "72x72", type: "image/png" },
      { url: "/favicon_io/apple-icon-76x76.png", sizes: "76x76", type: "image/png" },
      { url: "/favicon_io/apple-icon-114x114.png", sizes: "114x114", type: "image/png" },
      { url: "/favicon_io/apple-icon-120x120.png", sizes: "120x120", type: "image/png" },
      { url: "/favicon_io/apple-icon-144x144.png", sizes: "144x144", type: "image/png" },
      { url: "/favicon_io/apple-icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/favicon_io/apple-icon-180x180.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/favicon_io/manifest.json",
  other: {
    "msapplication-TileColor": "#ffffff",
    "msapplication-TileImage": "/favicon_io/ms-icon-144x144.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.className} antialiased`}
      >
        <Suspense fallback={null}>
          <TopLoader />
        </Suspense>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
