import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthType {
  token: string | null;
  setToken: (t: string | null) => void;
}

export const useAuthStore = create<any>( // to avoid any see https://github.com/pmndrs/zustand/issues/638
  persist(
    (set, _) => ({
      token: null,
      setToken: (t: string | null) => set({ token: t }),
    }),
    {
      name: "bkmk-token",
    }
  )
);
