import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLeftLong } from "@fortawesome/free-solid-svg-icons";
import { faRightLong } from "@fortawesome/free-solid-svg-icons";
import queryString from "query-string";
import { useEffect, useState } from "react";

const Pagination = () => {
  const [page, setPage] = useState(0);

  useEffect(() => {
    setPage(Number(queryString.parse(window.location.search).page));
  }, []);

  return (
    <div className="flex w-[40px] space-x-2 items-center">
      <div
        className="cursor-pointer hover:text-grey2 transition-colors ease-linear duration-150"
        onClick={() => {}}
      >
        <FontAwesomeIcon icon={faLeftLong} />
      </div>
      <div className="text-sm">{page}/4</div>
      <div
        className="cursor-pointer hover:text-grey2 transition-colors ease-linear duration-150"
        onClick={() => {}}
      >
        <FontAwesomeIcon icon={faRightLong} />
      </div>
    </div>
  )
}

export default Pagination;
