import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthType {
  token: string | null;
  setToken: (t: string | null) => void;
}

// zustand v5 requires the curried form `create<T>()(...)` as soon as a middleware is
// involved — which is what finally lets the store be typed instead of passed as `any`.
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
