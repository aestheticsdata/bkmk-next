import { useEffect, useState } from "react";
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

import type { UserStore } from "@auth/store/userStore";
import type { Bookmark } from "@components/bookmarks/interfaces/bookmark";
import { usePageStore } from "@components/shared/pageStore";

interface BookmarkResponse {
  rows: Bookmark[];
  total_count: number;
}

const useBookmarks = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const userID = useUserStore((state: UserStore) => state.user?.id);
  const { privateRequest } = useRequestHelper();
  const [bookmarks, setBookmarks] = useState<BookmarkResponse>();
  const [page, setPage] = useState(-1);

  const { pageNumberSaved, setPageNumberSaved } = usePageStore((state: any) => ({
    pageNumberSaved: state.pageNumberSaved,
    setPageNumberSaved: state.setPageNumberSaved,
  }));

  useEffect(() => {
    console.log("query change : ", router.query);
    Object.keys(router.query).filter(k => k !== "page").length > 0 && queryClient.invalidateQueries([QUERY_KEYS.BOOKMARKS]);
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
      return privateRequest(`/bookmarks?userID=${userID}&${stringified}`);
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
    console.log("bookmark in service : ", bookmark);
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
      router.push(`/bookmarks?page=${pageNumberSaved}`);
    },
    onError: ((e) => {console.log("error editing bookmark : ", e)}),
  });


  const uploadBookmarksService = async (f: any) => {
    console.log("bookmark file in service : ", f);
    return privateRequest("/bookmarks/upload",  {
      method: "POST",
      data: f,
      headers: {"Content-Type": "multipart/form-data"},
    })
  }
  const uploadBookmarks = useMutation((bookmarkFile: any) => {
    console.log("bookmarkFile : ", bookmarkFile);
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
