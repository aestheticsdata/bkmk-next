import { useEffect, useState } from "react";
import {
  useQuery,
  // useMutation,
  // useQueryClient
} from "@tanstack/react-query";
import useRequestHelper from "@helpers/useRequestHelper";
import { useUserStore } from "@auth/store/userStore";
import { QUERY_KEYS, QUERY_OPTIONS } from "@components/bookmarks/config/constants";

import type { UserStore } from "@auth/store/userStore";

const useCategories = () => {
  const userID = useUserStore((state: UserStore) => state.user!.id);
  const { privateRequest } = useRequestHelper();
  const [categories, setCategories] = useState<any>([]);

  const getCategories = async () => {
    try {
      return privateRequest(`/categories?userID=${userID}`);
    } catch (e) {
      console.log("get categories error", e);
    }
  };

  const { data, isLoading } = useQuery([QUERY_KEYS.CATEGORIES], getCategories, {
    retry: false,
    ...QUERY_OPTIONS,
  });

  useEffect(() => {
    if (data) {
      data.data.forEach((category: any) => {
        category.label = category.name;
        category.value = category.id;
      });
      setCategories(data.data);
    }
  }, [data]);

  return {
    categories,
    isLoading,
  }
};

export default useCategories;
