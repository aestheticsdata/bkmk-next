"use client";

import { useAuth } from "@auth/context/AuthContext";
import useRequestHelper from "@helpers/useRequestHelper";
import { queryKeys } from "@lib/query/keys";
import { CategoryListSchema } from "@src/schemas/categories";
import { useQuery } from "@tanstack/react-query";

import type { Category } from "@src/schemas/categories";

/* The categories, as the index rail reads them (COS-299): a sorted, typed list.
 *
 * Separate from `components/common/category/services/useCategories.ts`, which the create and edit
 * forms use: that one returns `any`, and mutates each row to add the `label` / `value` pair
 * `react-select` wants. Those forms are UI 06 (COS-302) and UI 10 (COS-319); when they are rebuilt
 * that hook goes and this one is what remains.
 *
 * ⚠️ **No counts.** The rail draws `dev 188` and this returns no number, because none exists:
 * `getCategoriesController` returns the rows of `category`, and counting bookmarks per category is
 * DATA 05 (COS-310). The rail leaves the column empty rather than inventing a figure — see the note
 * there. `all` is the exception: the list response's `total_count` is a real total. */
function useCategoryList(): { categories: Category[]; isLoading: boolean } {
  const { privateRequest } = useRequestHelper();
  const userID = useAuth().user?.id;

  const list = useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: async () => {
      const response = await privateRequest(`/categories?userID=${userID}`);
      const categories = CategoryListSchema.parse(response.data);
      // Sorted here rather than in the component: the order is a property of the list, and the rail
      // is not the only screen that will show it.
      return categories.toSorted((a, b) => a.name.localeCompare(b.name));
    },
    enabled: Boolean(userID),
    retry: false,
  });

  return { categories: list.data ?? [], isLoading: list.isLoading };
}

export { useCategoryList };
