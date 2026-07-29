import { useUserStore } from "@auth/store/userStore";
import { QUERY_KEYS, QUERY_OPTIONS } from "@components/bookmarks/config/constants";
import useRequestHelper from "@helpers/useRequestHelper";
import { CategoryListSchema } from "@src/schemas/categories";
import {
  useQuery,
  // useMutation,
  // useQueryClient
} from "@tanstack/react-query";
import { useEffect, useState } from "react";

import type { UserStore } from "@auth/store/userStore";

const useCategories = () => {
  const userID = useUserStore((state: UserStore) => state.user!.id);
  const { privateRequest } = useRequestHelper();
  const [categories, setCategories] = useState<any>([]);

  const getCategories = async () => {
    const response = await privateRequest(`/categories?userID=${userID}`);
    // The boundary: the service returns validated categories, not an axios response.
    return CategoryListSchema.parse(response.data);
  };

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.CATEGORIES],
    queryFn: getCategories,
    retry: false,
    ...QUERY_OPTIONS,
  });

  useEffect(() => {
    if (data) {
      const categoriesTmp: any[] = [...data];
      categoriesTmp.forEach((category: any) => {
        category.label = category.name;
        category.value = category.id;
      });
      categoriesTmp.sort((a: any, b: any) => a.label.localeCompare(b.label));
      setCategories(categoriesTmp);
    }
  }, [data]);

  return {
    categories,
    isLoading,
  };
};

export default useCategories;
