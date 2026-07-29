import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthType {
  token: string | null;
  setToken: (t: string | null) => void;
}

// zustand v5 impose la forme curryfiée `create<T>()(...)` dès qu'un middleware
// est utilisé — c'est ce qui permet de typer le store au lieu de le passer en `any`.
export const useAuthStore = create<AuthType>()(
  persist(
    (set) => ({
      token: null,
      setToken: (t: string | null) => set({ token: t }),
    }),
    {
      name: "bkmk-token",
    },
  ),
);
