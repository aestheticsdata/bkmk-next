import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  baseCurrency: string;
  email: string;
  id: string;
  language: string;
}

interface UserStore {
  user: User | null;
  setUser: (u: User | null) => void;
}

export const useUserStore = create<any>( // to avoid any see https://github.com/pmndrs/zustand/issues/638
  persist(
    (set, _) => ({
      user: null,
      setUser: (u: User | null) => set({ user: u }),
    }),
    {
      name: "bkmk-user",
    }
  )
);
