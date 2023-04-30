'use client';

import Head from 'next/head';
import '../styles/globals.css';
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useAuthStore } from "@auth/store/authStore";

import type { NextComponentType } from "next";
import type { AppProps } from 'next/app';
import type { AuthType } from "@auth/store/authStore";


type BKMK = AppProps & {
  Component: NextComponentType & {
    auth?: boolean;
  };
};

const BKMK_App = ({ Component, pageProps: { ...pageProps } }: BKMK) => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <div className="bg-grey1">
      <Head>
        <link rel="shortcut icon" href="/images/favicon.ico" />
      </Head>
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
  const bkmkToken = useAuthStore((state: AuthType) => state.token);

  useEffect(() => {
    authCheck();
  }, []);

  const authCheck = () => {
    if (bkmkToken) {
      setAuthorized(true);
    } else {
      setAuthorized(false);
      router.push("/login");
    }
  };

  return (authorized && children) || <div>Redirecting ...</div>;
}

export default BKMK_App;
