import { ReactElement } from "react";

export interface Dropdown {
  // React 19 : `ReactElement` par défaut porte des props `unknown`, ce qui empêche
  // le `cloneElement` du Dropdown d'injecter `handleclosefromchild`.
  children: ReactElement<any>[];
  displayCaret?: boolean;
}
