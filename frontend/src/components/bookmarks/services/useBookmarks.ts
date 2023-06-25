import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import useRequestHelper from "@helpers/useRequestHelper";
import { useUserStore } from "@auth/store/userStore";
import { QUERY_KEYS, QUERY_OPTIONS } from "@components/bookmarks/config/constants";

import type { UserStore } from "@auth/store/userStore";
import type { Bookmark } from "@components/bookmarks/interfaces/bookmark";

const useBookmarks = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const userID = useUserStore((state: UserStore) => state.user!.id);
  const { privateRequest } = useRequestHelper();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  const getBookmarks = async () => {
    try {
      return privateRequest(`/bookmarks?userID=${userID}`);
    } catch (e) {
      console.log("get bookmarks error : ", e);
    }
  };

  const { data, isLoading } = useQuery([QUERY_KEYS.BOOKMARKS], getBookmarks, {
    retry: false,
    ...QUERY_OPTIONS,
  });

  useEffect(() => {
    if (data) {
      setBookmarks(data.data);
    }
  }, [data]);

  const createBookmarkService = async (bookmark: Bookmark) => {
    return privateRequest("/bookmarks/add", {
      method: "POST",
      data: bookmark,
      headers: {"Content-Type": "multipart/form-data"},
    });
  };

  const createBookmark = useMutation((bookmark: any) => {
    return createBookmarkService(bookmark);
  }, {
    onSuccess: async () => {
      await queryClient.invalidateQueries([QUERY_KEYS.BOOKMARKS]);
      router.push("/bookmarks");
    },
    onError: ((e) => {console.log("errot creating bookmark", e)}),
  });

  return {
    bookmarks,
    isLoading,
    createBookmark,
  };
}

export default useBookmarks;
