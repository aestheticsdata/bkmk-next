// import { create } from "zustand";
// import produce from "immer";
// import { devtools } from 'zustand/middleware';
//
//
// interface GlobalStore {
//   isCalendarVisible: boolean;
//   setIsCalendarVisible: (isCalendarVisible: boolean) => void;
//   pageNumberSaved: number;
//   setPageNumberSaved: (page: number) => void;
// }
//
// export const useGlobalStore = create<GlobalStore>(devtools(set => ({
//   isCalendarVisible: false,
//   setIsCalendarVisible: (isVisible: boolean) => set(
//     produce(draft => { draft.isCalendarVisible = isVisible})
//   ),
// })));
//
// export default useGlobalStore;
