import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  email: string;
  id: string;
  language: string;
}

export interface UserStore {
  user: User | null;
  setUser: (u: User | null) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (u: User | null) => set({ user: u }),
    }),
    {
      name: "bkmk-user",
    }
  )
);
