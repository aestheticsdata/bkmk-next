import "@styles/globals.css";
import Providers from "@app/providers";
import { IBM_Plex_Mono, Poppins, Smooch_Sans, Ubuntu } from "next/font/google";

import type { Metadata } from "next";

// IBM Plex Mono is GRAPHITE's only typeface. The three families below belong to the
// old UI: they stay until the UI lot has rebuilt the screens using them, otherwise every
// page would lose its typography at once.
//
// The `-face` suffix avoids a circular definition: the theme token is named `--font-mono`
// (it produces the `font-mono` utility) and points at these variables — see
// styles/tokens/typography.css.
//
// Four weights, the ones the handoff uses: 400 body, 500 active rows and chips, 600
// titles and wordmark, 700 nothing yet but the mockup calls for it on strong values.
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-mono-face",
  display: "swap",
});

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

// No `icons` here on purpose: `icon.svg`, `favicon.ico` and `apple-icon.png` sit next to this
// file and the App Router picks them up on its own, emitting the <link> tags with the right
// type and sizes. Declaring them here as well would override that convention.
export const metadata: Metadata = {
  title: "bkmk",
  description: "a bookmark index for people who keep everything",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      className={`${plexMono.variable} ${poppins.variable} ${smoochSans.variable} ${ubuntu.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-grey1">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
