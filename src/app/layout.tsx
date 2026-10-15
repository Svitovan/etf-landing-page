import type { Metadata, Viewport } from "next";
import { Newsreader, Inter } from "next/font/google";
import "../styles/globals.css";

const newsreader = Newsreader({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
  adjustFontFallback: false,
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VOO, IVV, SPY: Srovnání ETF pro českého investora | ETF Přehled",
  description:
    "Nezávislé vzdělávací srovnání nákladů tří největších ETF na S&P 500 obchodovaných na NYSE Arca. Zjistěte, co si ověřit před nákupem u českého brokera.",
  keywords: ["ETF srovnání", "VOO", "IVV", "SPY", "S&P 500", "český investor", "poplatky ETF"],
  robots: "index, follow",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#176B56",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs" className={`${newsreader.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
