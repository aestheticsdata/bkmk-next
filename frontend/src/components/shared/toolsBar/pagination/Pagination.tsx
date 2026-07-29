"use client";

import useBookmarks from "@components/bookmarks/services/useBookmarks";
import { PAGES, ROWS_BY_PAGE } from "@components/shared/config/constants";
import { usePageStore } from "@components/shared/pageStore";
import { faLeftLong, faRightLong } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter, useSearchParams } from "next/navigation";
import queryString from "query-string";
import { useEffect, useState } from "react";

const Pagination = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { bookmarks } = useBookmarks(PAGES.PAGINATION);
  const [page, setPage] = useState(0);
  const [lastPage, setLasPage] = useState(0);

  // zustand v5: a selector returning an object literal produces a new reference on every
  // render and loops the component — select the function itself.
  const setPageNumberSaved = usePageStore((state: any) => state.setPageNumberSaved);

  // The App Router no longer accepts `push({ query })`: rebuild the query string and
  // push a relative URL, which stays on the current path.
  const pushPage = (nextPage: number) => {
    const parsed: any = queryString.parse(window.location.search);
    parsed["page"] = nextPage.toString();
    router.push(`?${queryString.stringify(parsed)}`);
  };

  useEffect(() => {
    const page = Number(queryString.parse(window.location.search).page);
    setPage(page);
    setPageNumberSaved(page);
  }, []);

  useEffect(() => {
    bookmarks?.rows.length! > 0 && setLasPage(Math.floor((bookmarks?.total_count! - 1) / ROWS_BY_PAGE));
  }, [bookmarks]);

  useEffect(() => {
    if (searchParams.get("page")) {
      setPage(Number(searchParams.get("page")));
    }
  }, [searchParams]);

  return (
    <div className="flex w-[100px] space-x-2 items-center px-4">
      <button
        className="cursor-pointer hover:text-grey2 transition-colors ease-linear duration-150 disabled:text-grey1"
        onClick={() => {
          pushPage(page - 1);
          setPage(page - 1);
          setPageNumberSaved(page - 1);
        }}
        disabled={page === 0}
      >
        <FontAwesomeIcon icon={faLeftLong} />
      </button>
      <div className="flex text-sm w-[50px] justify-center select-none space-x-0.5 px-0.5">
        <div>{page}</div>
        <div>/</div>
        <div
          className="hover:text-white cursor-pointer rounded-sm hover:bg-grey1 px-0.5"
          onClick={() => {
            router.push(`?page=${lastPage}`);
            setPage(lastPage);
          }}
        >
          {lastPage}
        </div>
      </div>
      <button
        className="cursor-pointer hover:text-grey2 transition-colors ease-linear duration-150 disabled:text-grey1"
        onClick={() => {
          pushPage(page + 1);
          setPage(page + 1);
          setPageNumberSaved(page + 1);
        }}
        disabled={page === lastPage}
      >
        <FontAwesomeIcon icon={faRightLong} />
      </button>
    </div>
  );
};

export default Pagination;
