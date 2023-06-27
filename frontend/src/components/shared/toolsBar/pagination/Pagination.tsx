import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import queryString from "query-string";
import useBookmarks from "@components/bookmarks/services/useBookmarks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLeftLong } from "@fortawesome/free-solid-svg-icons";
import { faRightLong } from "@fortawesome/free-solid-svg-icons";

const Pagination = () => {
  const router = useRouter();
  const { bookmarks } = useBookmarks();
  const [page, setPage] = useState(0);
  const [lastPage, setLasPage] = useState(0);

  useEffect(() => {
    setPage(Number(queryString.parse(window.location.search).page));
  }, []);

  useEffect(() => {
    bookmarks?.length > 0 && setLasPage(Math.floor((bookmarks[0].total_count)/10));
  }, [bookmarks]);

  return (
    <div className="flex w-[100px] space-x-2 items-center">
      <button
        className="cursor-pointer hover:text-grey2 transition-colors ease-linear duration-150 disabled:text-grey1"
        onClick={() => {
          router.push({ query: { page: page - 1 } });
          setPage(page - 1);
        }}
        disabled={page === 0}
      >
        <FontAwesomeIcon icon={faLeftLong} />
      </button>
      <div className="flex text-sm w-[40px] justify-center">{page}/{lastPage}</div>
      <button
        className="cursor-pointer hover:text-grey2 transition-colors ease-linear duration-150 disabled:text-grey1"
        onClick={() => {
          router.push({ query: { page: page + 1 } });
          setPage(page + 1);
        }}
        disabled={page === lastPage}
      >
        <FontAwesomeIcon icon={faRightLong} />
      </button>
    </div>
  )
}

export default Pagination;
