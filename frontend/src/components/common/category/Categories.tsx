import getCategoryComponent from "@components/common/category/getCategoryComponent";
import { COLUMN_WIDTH } from "@components/shared/config/constants";

import type { Category } from "@components/bookmarks/interfaces/bookmark";


interface CategoriesProps {
  categories: Category[];
}
const Categories = ({ categories }: CategoriesProps) =>
  <div className={`flex ${COLUMN_WIDTH.categories} space-x-1 text-tiny font-bold overflow-hidden`}>
    {categories.length > 0 &&
      categories.map((c: Category) => getCategoryComponent(c))
    }
  </div>;


export default Categories;
