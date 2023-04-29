//
// import { Inter } from 'next/font/google';
// import Hello from "@/components/hello";
//
// const inter = Inter({ subsets: ['latin'] });
//
// export default function Home() {
//   return (
//     <div className="flex justify-center">
//       <Hello />
//     </div>
//   )
// }


'use client';

import './globals.css';
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
// import { useAuthStore } from "@auth/store/authStore";

import type { NextComponentType } from "next";
import type { AppProps } from 'next/app';


type BKMK = AppProps & {
  Component: NextComponentType & {
    auth?: boolean;
  };
};

const BKMK_App = ({ Component, ...pageProps }: BKMK) => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <div className="bg-grey1">
      <QueryClientProvider client={queryClient}>
        {
          Component.auth ? (
            <Auth>
              <Component {...pageProps} />
            </Auth>
          ) : (
            <Component {...pageProps} />
          )
        }
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </div>
  );
}

function Auth({ children }: { children: JSX.Element }) {
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();
  // const pfaToken = useAuthStore((state) => state.token);

  useEffect(() => {
    authCheck();
  }, []);

  const authCheck = () => {
    // if (pfaToken) {
    //   setAuthorized(true);
    // } else {
    //   setAuthorized(false);
    //   router.push("/login");
    // }
  };

  // return (authorized && children) || <div>Redirecting ...</div>;
  return children;
}

export default BKMK_App;
