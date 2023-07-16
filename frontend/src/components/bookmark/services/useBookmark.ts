import { useEffect, useState } from "react";
import {
  useQuery,
} from "@tanstack/react-query";
import useRequestHelper from "@helpers/useRequestHelper";
import { QUERY_KEYS, QUERY_OPTIONS } from "@components/bookmarks/config/constants";

import type { Bookmark } from "@components/bookmarks/interfaces/bookmark";

const useBookmark = (bookmarkID: string) => {
  // const userID = useUserStore((state: UserStore) => state.user!.id);
  const { privateRequest } = useRequestHelper();
  const [bookmark, setBookmark] = useState<Bookmark>();

  const getBookmark = async () => {
    try {
      return privateRequest(`/bookmarks/${bookmarkID}`);
    } catch (e) {
      console.log("get bookmark error : ", e);
    }
  };

  const { data, isLoading } = useQuery([QUERY_KEYS.BOOKMARK, bookmarkID], getBookmark, {
    retry: false,
    enabled: !!bookmarkID,
    ...QUERY_OPTIONS,
  });

  useEffect(() => {
    if (data) {
      setBookmark(data.data[0]);
    }
  }, [data]);

  return {
    isLoading,
    bookmark,
  };
}

export default useBookmark;
