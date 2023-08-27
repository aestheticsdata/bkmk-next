import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import queryString from "query-string";
import useRequestHelper from "@helpers/useRequestHelper";
import { useUserStore } from "@auth/store/userStore";
import { QUERY_KEYS, QUERY_OPTIONS } from "@components/bookmarks/config/constants";
import { PAGES, ROWS_BY_PAGE } from "@components/shared/config/constants";
import { usePageStore } from "@components/shared/pageStore";

import type { UserStore } from "@auth/store/userStore";
import type { Bookmark } from "@components/bookmarks/interfaces/bookmark";

interface BookmarkResponse {
  rows: Bookmark[];
  total_count: number;
}

const useBookmarks = (from: string = "") => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const userID = useUserStore((state: UserStore) => state.user?.id);
  const { privateRequest } = useRequestHelper();
  const [bookmarks, setBookmarks] = useState<BookmarkResponse>();
  const [page, setPage] = useState(-1);

  const { pageNumberSaved } = usePageStore((state: any) => ({
    pageNumberSaved: state.pageNumberSaved,
  }));

  const routerqueryRef = useRef(router.query);
  useEffect(() => {
    // ce hook est appelé depuis la page bookmark et la page pagination
    // il y a 4 cas:
    // une url sans query string
    // une url avec sort
    // une url avec des filtres
    // une url avec sort et des filtres
    if (from === PAGES.BOOKMARKS) {
      const hasSortChanged = router.query.sort !== routerqueryRef.current.sort;
      let invalidated = false;

      if ((Object.keys(router.query).filter(k => k !== "page").length > 0)) {
        queryClient.invalidateQueries([QUERY_KEYS.BOOKMARKS]);
        invalidated = true;
      }
      if (hasSortChanged && !invalidated) {
        queryClient.invalidateQueries([QUERY_KEYS.BOOKMARKS]);
      }
      routerqueryRef.current = router.query;
    }
  }, [router.query]);

  useEffect(() => {
    if (pageNumberSaved) {
      setPage(Number(pageNumberSaved));
    } else {
      setPage(Number(queryString.parse(window.location.search).page));
    }
  }, []);

  useEffect(() => {
    setPage(Number(queryString.parse(window.location.search).page));
  }, [router.query.page]);

  const getBookmarks = async () => {
    const parsed = queryString.parse(location.search);
    const stringified = queryString.stringify(parsed);
    try {
      return privateRequest(`/bookmarks?rows=${ROWS_BY_PAGE}&userID=${userID}&${stringified}`);
    } catch (e) {
      console.log("get bookmarks error : ", e);
    }
  };

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.BOOKMARKS, page],
    queryFn: () => getBookmarks(),
    retry: false,
    enabled: page > -1,
    ...QUERY_OPTIONS,
  });

  useEffect(() => {
    if (data) {
      setBookmarks(data.data);
    }
  }, [data]);

  const createBookmarkService = async (bookmark: Bookmark) => {
    return privateRequest("/bookmarks", {
      method: "POST",
      data: bookmark,
      headers: {"Content-Type": "multipart/form-data"},
    });
  };

  const createBookmark = useMutation((bookmark: Bookmark) => {
    return createBookmarkService(bookmark);
  }, {
    onSuccess: async () => {
      await queryClient.invalidateQueries([QUERY_KEYS.BOOKMARKS]);
      await queryClient.invalidateQueries([QUERY_KEYS.REMINDERS]);
      router.push(`/bookmarks?page=${pageNumberSaved}`);
    },
    onError: ((e) => {console.log("error creating bookmark", e)}),
  });

  const deleteBookmarkService = async (id: number ) => {
    return privateRequest(`/bookmarks/${id}`, {
      method: "DELETE",
    });
  };

  const deleteBookmark = useMutation((id: number) => {
    return deleteBookmarkService(id);
  }, {
    onSuccess: async () => {
      await queryClient.invalidateQueries([QUERY_KEYS.BOOKMARKS]);
      await queryClient.invalidateQueries([QUERY_KEYS.REMINDERS]);
      await queryClient.invalidateQueries([QUERY_KEYS.CATEGORIES]);
    },
    onError: ((e) => {console.log("error deleting bookmark", e)}),
  });

  const editBookmarkService = async (bookmark: Bookmark) => {
    return privateRequest("/bookmarks", {
      method: "PUT",
      data: bookmark,
      headers: {"Content-Type": "multipart/form-data"},
    })
  }
  const editBookmark = useMutation((bookmark: Bookmark) => {
    return editBookmarkService(bookmark);
  }, {
    onSuccess: async () => {
      await queryClient.invalidateQueries([QUERY_KEYS.BOOKMARKS]);
      await queryClient.invalidateQueries([QUERY_KEYS.BOOKMARK, router.query.id]);
      await queryClient.invalidateQueries([QUERY_KEYS.REMINDERS]);
      await queryClient.invalidateQueries([QUERY_KEYS.CATEGORIES]);
      router.push(`/bookmarks?page=${pageNumberSaved}`);
    },
    onError: ((e) => {console.log("error editing bookmark : ", e)}),
  });


  const uploadBookmarksService = async (f: any) => {
    return privateRequest("/bookmarks/upload",  {
      method: "POST",
      data: f,
      headers: {"Content-Type": "multipart/form-data"},
    })
  }
  const uploadBookmarks = useMutation((bookmarkFile: any) => {
    return uploadBookmarksService(bookmarkFile);
  }, {
    onSuccess: async () => {
      await queryClient.invalidateQueries([QUERY_KEYS.BOOKMARKS]);
      router.push("/bookmarks?page=0");
    },
    onError: ((e) => {console.log("error uploading bookmark file : ", e)}),
  })

  return {
    bookmarks,
    isLoading,
    createBookmark,
    deleteBookmark,
    editBookmark,
    uploadBookmarks,
  };
}

export default useBookmarks;
