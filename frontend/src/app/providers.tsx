"use client";

import { TooltipProvider } from "@components/ui/tooltip";
// FontAwesome injects its stylesheet at runtime, which gives giant icons on the first
// paint under Next: import the CSS ourselves and switch the injection off.
// https://github.com/vercel/next.js/issues/20682#issuecomment-770565613
import { config as fontawesomeConfig } from "@fortawesome/fontawesome-svg-core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import "@fortawesome/fontawesome-svg-core/styles.css";

fontawesomeConfig.autoAddCss = false;

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required by shadcn's `Tooltip`, which throws at use without it. It renders
          nothing and costs nothing while no tooltip is mounted. */}
      <TooltipProvider>{children}</TooltipProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
