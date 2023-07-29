import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface PageStoreType {
  pageNumberSaved: number;
  setPageNumberSaved: (page: number) => void;
}

export const usePageStore = create<any>( // to avoid any see https://github.com/pmndrs/zustand/issues/638
  persist(
    (set, _) => ({
      pageNumberSaved: 0,
      setPageNumberSaved: (page: number) => set({ pageNumberSaved: page }),
    }),
    {
      name: "bkmk-page",
    }
  )
);
