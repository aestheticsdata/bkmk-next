import getCategoryComponent from "@components/common/category/getCategoryComponent";

import type { Category } from "@components/bookmarks/interfaces/bookmark";


interface CategoriesProps {
  categories: Category[];
}
const Categories = ({ categories }: CategoriesProps) =>
  <div className="flex w-[240px] text-tiny font-bold">
    {categories.length > 0 &&
      categories.map((c: Category) => getCategoryComponent(c))
    }
  </div>;


export default Categories;
