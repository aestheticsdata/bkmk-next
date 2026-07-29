"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

// FontAwesome injecte sa feuille de style à la volée, ce qui produit des icônes
// géantes au premier paint avec Next : on importe la CSS et on coupe l'injection.
// https://github.com/vercel/next.js/issues/20682#issuecomment-770565613
import { config as fontawesomeConfig } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";

fontawesomeConfig.autoAddCss = false;

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
