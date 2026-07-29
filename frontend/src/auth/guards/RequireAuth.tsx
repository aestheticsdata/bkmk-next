"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "@auth/store/authStore";

import type { AuthType } from "@auth/store/authStore";

/**
 * Garde de session **temporaire**, héritée de l'ancien `pages/_app.tsx` : elle lit le
 * JWT persisté en localStorage par le store zustand.
 *
 * ⚠️ Elle attend la fin de la **réhydratation** du store avant de décider quoi que ce
 * soit. Sans cette attente, un rechargement de page décide sur un token encore `null` :
 * le serveur rend forcément « pas de token » (il n'a pas de localStorage), et tout ce
 * qui s'exécute avant la réhydratation croit la session absente. Deux dégâts possibles,
 * la redirection vers /login, et — plus sournois — les enfants qui se montent et lancent
 * leurs requêtes sans en-tête `Authorization`, ce qui renvoie un 401 que
 * `useRequestHelper` traduit en passage par /logout, lequel **vide le store**.
 *
 * Le rendu est volontairement identique côté serveur et au premier rendu client
 * (`hydrated` démarre à `false` des deux côtés) : pas de divergence d'hydratation.
 *
 * AUTH 04 (COS-296) remplace tout ceci par un contrôle **serveur** dans
 * `app/(private)/layout.tsx`, sur le modèle de `pfa/front/src/auth/server/getServerSession.ts`.
 * Le token disparaît du localStorage avec AUTH 01.
 */
const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const token = useAuthStore((state: AuthType) => state.token);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // La réhydratation peut être déjà terminée quand cet effet s'exécute — auquel cas
    // `onFinishHydration` ne se déclenchera plus jamais.
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }

    return useAuthStore.persist.onFinishHydration(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (hydrated && !token) {
      router.push("/login");
    }
  }, [hydrated, token, router]);

  if (!hydrated) {
    return <div>Loading ...</div>;
  }

  return token ? <>{children}</> : <div>Redirecting ...</div>;
};

export default RequireAuth;
