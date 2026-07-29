"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import queryString from "query-string";
import useBookmarks from "@components/bookmarks/services/useBookmarks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLeftLong } from "@fortawesome/free-solid-svg-icons";
import { faRightLong } from "@fortawesome/free-solid-svg-icons";
import { usePageStore } from "@components/shared/pageStore";
import {
  PAGES,
  ROWS_BY_PAGE
} from "@components/shared/config/constants";

const Pagination = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { bookmarks } = useBookmarks(PAGES.PAGINATION);
  const [page, setPage] = useState(0);
  const [lastPage, setLasPage] = useState(0);

  // zustand v5 : un sélecteur qui renvoie un objet littéral produit une nouvelle
  // référence à chaque rendu et fait boucler le composant — on sélectionne la fonction.
  const setPageNumberSaved = usePageStore((state: any) => state.setPageNumberSaved);

  // Le routeur d'App Router n'accepte plus `push({ query })` : on reconstruit la
  // query string et on pousse une URL relative, qui reste sur le chemin courant.
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
    bookmarks?.rows.length! > 0 && setLasPage(Math.floor((bookmarks?.total_count!-1)/ROWS_BY_PAGE));
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
          className="hover:text-white cursor-pointer rounded hover:bg-grey1 px-0.5"
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
  )
}

export default Pagination;
