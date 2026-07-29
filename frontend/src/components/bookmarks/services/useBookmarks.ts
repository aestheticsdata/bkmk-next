"use client";

import { useUserStore } from "@auth/store/userStore";
import { QUERY_KEYS, QUERY_OPTIONS } from "@components/bookmarks/config/constants";
import { PAGES, ROWS_BY_PAGE } from "@components/shared/config/constants";
import { usePageStore } from "@components/shared/pageStore";
import useRequestHelper from "@helpers/useRequestHelper";
import { BookmarkListSchema } from "@src/schemas/bookmarks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import queryString from "query-string";
import { useEffect, useRef, useState } from "react";

import type { UserStore } from "@auth/store/userStore";
// Les mutations gardent l'ancienne interface : leur charge utile part en multipart, où
// `categories` est déjà une chaîne JSON et les nombres des chaînes. La décrire vraiment
// (`CreateBookmarkPayloadSchema`) appartient au lot DATA, avec le formulaire qui l'émet.
import type { Bookmark } from "@components/bookmarks/interfaces/bookmark";
import type { BookmarkList } from "@src/schemas/bookmarks";

const useBookmarks = (from: string = "") => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ id?: string }>();
  const searchParams = useSearchParams();
  const userID = useUserStore((state: UserStore) => state.user?.id);
  const { privateRequest } = useRequestHelper();
  const [bookmarks, setBookmarks] = useState<BookmarkList>();
  const [page, setPage] = useState(-1);

  // zustand v5 : sélectionner une valeur, jamais un objet littéral — sinon la
  // référence change à chaque rendu et le composant boucle.
  const pageNumberSaved = usePageStore((state: any) => state.pageNumberSaved);

  const previousSearchParams = useRef(searchParams);
  useEffect(() => {
    // ce hook est appelé depuis la page bookmark et la page pagination
    // il y a 4 cas:
    // une url sans query string
    // une url avec sort
    // une url avec des filtres
    // une url avec sort et des filtres
    if (from === PAGES.BOOKMARKS) {
      const hasSortChanged = searchParams.get("sort") !== previousSearchParams.current.get("sort");
      let invalidated = false;

      if (Array.from(searchParams.keys()).filter((k) => k !== "page").length > 0) {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BOOKMARKS] });
        invalidated = true;
      }
      if (hasSortChanged && !invalidated) {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BOOKMARKS] });
      }
      previousSearchParams.current = searchParams;
    }
  }, [searchParams]);

  useEffect(() => {
    if (pageNumberSaved) {
      setPage(Number(pageNumberSaved));
    } else {
      setPage(Number(queryString.parse(window.location.search).page));
    }
  }, []);

  useEffect(() => {
    setPage(Number(queryString.parse(window.location.search).page));
  }, [searchParams]);

  const getBookmarks = async () => {
    const parsed = queryString.parse(location.search);
    const stringified = queryString.stringify(parsed);
    const response = await privateRequest(`/bookmarks?rows=${ROWS_BY_PAGE}&userID=${userID}&${stringified}`);
    // La frontière : le service rend une page validée, pas une réponse axios.
    return BookmarkListSchema.parse(response.data);
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
      setBookmarks(data);
    }
  }, [data]);

  const createBookmarkService = async (bookmark: Bookmark) => {
    return privateRequest("/bookmarks", {
      method: "POST",
      data: bookmark,
      headers: { "Content-Type": "multipart/form-data" },
    });
  };

  const createBookmark = useMutation({
    mutationFn: (bookmark: Bookmark) => createBookmarkService(bookmark),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BOOKMARKS] });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.REMINDERS] });
      router.push(`/${PAGES.BOOKMARKS}?page=${pageNumberSaved}`);
    },
    onError: (e) => {
      console.log("error creating bookmark", e);
    },
  });

  const deleteBookmarkService = async (id: number) => {
    return privateRequest(`/bookmarks/${id}`, {
      method: "DELETE",
    });
  };

  const deleteBookmark = useMutation({
    mutationFn: (id: number) => deleteBookmarkService(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BOOKMARKS] });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.REMINDERS] });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CATEGORIES] });
      // `usePathname` rend l'URL réelle : on quitte la fiche seulement si on y est.
      if (/^\/bookmarks\/\d+\/?$/.test(pathname ?? "")) {
        router.push(`/${PAGES.BOOKMARKS}?page=0`);
      }
    },
    onError: (e) => {
      console.log("error deleting bookmark", e);
    },
  });

  const editBookmarkService = async (bookmark: Bookmark) => {
    return privateRequest("/bookmarks", {
      method: "PUT",
      data: bookmark,
      headers: { "Content-Type": "multipart/form-data" },
    });
  };
  const editBookmark = useMutation({
    mutationFn: (bookmark: Bookmark) => editBookmarkService(bookmark),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BOOKMARKS] });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BOOKMARK, params.id] });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.REMINDERS] });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CATEGORIES] });
      router.push(`/${PAGES.BOOKMARKS}?page=${pageNumberSaved}`);
    },
    onError: (e) => {
      console.log("error editing bookmark : ", e);
    },
  });

  const uploadBookmarksService = async (f: any) => {
    return privateRequest("/bookmarks/upload", {
      method: "POST",
      data: f,
      headers: { "Content-Type": "multipart/form-data" },
    });
  };
  const uploadBookmarks = useMutation({
    mutationFn: (bookmarkFile: any) => uploadBookmarksService(bookmarkFile),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BOOKMARKS] });
      router.push(`/${PAGES.BOOKMARKS}?page=0`);
    },
    onError: (e) => {
      console.log("error uploading bookmark file : ", e);
    },
  });

  return {
    bookmarks,
    isLoading,
    createBookmark,
    deleteBookmark,
    editBookmark,
    uploadBookmarks,
  };
};

export default useBookmarks;
