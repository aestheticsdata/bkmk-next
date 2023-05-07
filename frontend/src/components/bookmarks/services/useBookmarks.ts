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

const useBookmarks = () => {
  // const queryClient = useQueryClient();
  const userID = useUserStore((state: UserStore) => state.user!.id);
  const { privateRequest } = useRequestHelper();
  const [bookmarks, setBookmarks] = useState([]);


  const getBookmarks = async () => {
    try {
      return privateRequest(`/bookmarks?userID=${userID}`);
    } catch (e) {
      console.log("get spendings error", e);
    }
  };

  const { data, isLoading } = useQuery([QUERY_KEYS.BOOKMARKS], getBookmarks, {
    retry: false,
    ...QUERY_OPTIONS,
  });

  useEffect(() => {
    data?.data && setBookmarks(data.data);
  }, [data]);

  return {
    bookmarks,
    isLoading,
  };
}

export default useBookmarks;
