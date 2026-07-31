"use client";

import { useAuth } from "@auth/context/AuthContext";
import useRequestHelper from "@helpers/useRequestHelper";
import { queryKeys } from "@lib/query/keys";
import { CategoryListSchema } from "@src/schemas/categories";
import { useQuery } from "@tanstack/react-query";

import type { Category } from "@src/schemas/categories";

/* The categories, as the index rail and the filter modal read them (COS-299): a sorted, typed list.
 *
 * Separate from `components/common/category/services/useCategories.ts`, which the create and edit
 * forms use: that one returns `any`, and mutates each row to add the `label` / `value` pair
 * `react-select` wants. Those forms are UI 06 (COS-302) and UI 10 (COS-319); when they are rebuilt
 * that hook goes and this one is what remains.
 *
 * ⚠️ **Each row now carries `bookmarks_count`** (COS-300), which it did not: the filter modal ranks its
 * suggestions by "most used", and a most-used list without a count is an arbitrary ten. See
 * `getCategoriesController`.
 *
 * That does **not** make the rail's `dev 188` counters this hook's business — the rail still shows
 * nothing there, and lighting it up is DATA 05 (COS-310) along with the `storage` block. The number is
 * simply available now.
 *
 * The alphabetical order comes from the controller's `ORDER BY c.name` rather than a `toSorted` here:
 * ordering a list is what a database does. */
function useCategoryList(): { categories: Category[]; isLoading: boolean } {
  const { privateRequest } = useRequestHelper();
  const userID = useAuth().user?.id;

  const list = useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: async () => {
      const response = await privateRequest(`/categories?userID=${userID}`);
      return CategoryListSchema.parse(response.data);
    },
    enabled: Boolean(userID),
    retry: false,
  });

  return { categories: list.data ?? [], isLoading: list.isLoading };
}

export { useCategoryList };
