import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface PageStoreType {
  pageNumberSaved: number;
  setPageNumberSaved: (page: number) => void;
}

export const usePageStore = create<PageStoreType>()(
  persist(
    (set) => ({
      pageNumberSaved: 0,
      setPageNumberSaved: (page: number) => set({ pageNumberSaved: page }),
    }),
    {
      name: "bkmk-page",
    },
  ),
);
