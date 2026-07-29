import type { ReactElement } from "react";

export interface Dropdown {
  // React 19: `ReactElement` now defaults to `unknown` props, which stops the Dropdown's
  // `cloneElement` from injecting `handleclosefromchild`.
  children: ReactElement<any>[];
  displayCaret?: boolean;
}
