import { QUERY_KEYS, QUERY_OPTIONS } from "@components/bookmarks/config/constants";
import useRequestHelper from "@helpers/useRequestHelper";
import { BookmarkDetailResponseSchema } from "@src/schemas/bookmarks";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import type { BookmarkDetail } from "@src/schemas/bookmarks";

const useBookmark = (bookmarkID: string) => {
  // const userID = useUserStore((state: UserStore) => state.user!.id);
  const { privateRequest } = useRequestHelper();
  const [bookmark, setBookmark] = useState<BookmarkDetail>();

  const getBookmark = async () => {
    const response = await privateRequest(`/bookmarks/${bookmarkID}`);
    // The controller returns the query result as-is, so a one-row array. The boundary
    // validates the array; the record screen takes the row.
    return BookmarkDetailResponseSchema.parse(response.data);
  };

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.BOOKMARK, bookmarkID],
    queryFn: getBookmark,
    retry: false,
    enabled: !!bookmarkID,
    ...QUERY_OPTIONS,
  });

  useEffect(() => {
    if (data) {
      setBookmark(data[0]);
    }
  }, [data]);

  return {
    isLoading,
    bookmark,
  };
};

export default useBookmark;
