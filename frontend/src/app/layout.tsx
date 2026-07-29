import "@styles/globals.css";
import Providers from "@app/providers";
import { Poppins, Smooch_Sans, Ubuntu } from "next/font/google";

import type { Metadata } from "next";

// Les trois familles de l'ancienne UI, auto-hébergées par next/font au lieu de
// l'@import Google Fonts qui vivait en tête de globals.css.
// DS 01 (COS-290) les remplace par IBM Plex Mono, seule police de GRAPHITE.
//
// Le suffixe `-face` évite une définition circulaire : le token de thème s'appelle
// `--font-poppins` (il produit l'utilitaire `font-poppins`) et pointe sur ces
// variables-ci — voir styles/tokens/typography.css.
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "700"],
  variable: "--font-poppins-face",
  display: "swap",
});

const smoochSans = Smooch_Sans({
  subsets: ["latin"],
  variable: "--font-smooch-face",
  display: "swap",
});

const ubuntu = Ubuntu({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-ubuntu-face",
  display: "swap",
});

export const metadata: Metadata = {
  title: "bkmk",
  description: "a bookmark index for people who keep everything",
  icons: {
    icon: "/images/favicon.ico",
    apple: "/images/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      className={`${poppins.variable} ${smoochSans.variable} ${ubuntu.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-grey1">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
