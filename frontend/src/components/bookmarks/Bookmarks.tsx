import { useEffect } from "react";
import Link from 'next/link';
import fr from "date-fns/locale/fr";
import format from "date-fns/format";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightToBracket, faArrowUpLong } from '@fortawesome/free-solid-svg-icons';
import useBookmarks from "@components/bookmarks/services/useBookmarks";
import Stars from "@components/bookmarks/Stars";
import getPriorityNumber from "@helpers/getPriorityNumber";

import type { Bookmark } from "@components/bookmarks/interfaces/bookmark";

const Bookmarks = () => {
  const { bookmarks, isLoading } = useBookmarks();

  useEffect(() => {
    console.log("bookmarks", bookmarks);
  }, [bookmarks]);

  return (
    <div className="flex flex-col w-full pt-14 divide-y divide-grey2">
      {isLoading && <div>loading...</div>}
      {bookmarks?.length > 0 &&
        bookmarks.map((bookmark: Bookmark) => (
          <Link
            key={bookmark.id}
            className={`
              flex cursor-pointer px-0.5 py-1 text-xs 
              ${bookmark.original_url ? "hover:bg-blue-300": "hover:bg-yellow-500"}
              transition-colors ease-linear duration-150
            `}
            href={{
              pathname: "/bookmarks/[id]",
              query: { id: bookmark.id },
            }}
          >

            {bookmark.original_url ?
              <div className="flex justify-center hover:text-blue-500 w-[20px]">
                <a
                  href={bookmark.original_url}
                  target="_blank"
                  onClick={(e) => {e.stopPropagation()}}
                >
                  <FontAwesomeIcon icon={faRightToBracket} />
                </a>
              </div>
              :
              <div className="pl-[20px]" />
            }
            <div
              title={bookmark.original_url ?? ""}
              className="w-[400px] truncate font-semibold"
            >
                {bookmark.title}
            </div>
            <div className="flex justify-start mx-1 w-[70px]">
              {bookmark.stars ?
                <Stars count={bookmark.stars} />
                :
                "N/A"
              }
            </div>
            <div className="w-[300px] truncate" title={bookmark.notes}>{bookmark.notes}</div>
            <div className="flex justify-center items-center w-[80px]">
              {
                bookmark.priority &&
                (new Array(getPriorityNumber(bookmark.priority))
                  .fill(0))
                  .map(() =>
                    <FontAwesomeIcon icon={faArrowUpLong} />
                  )
              }
            </div>
            <div>ajouté le : {format(new Date(bookmark.date_added!), "dd MMM yyyy", { locale: fr })}</div>

          </Link>
        ))
      }
    </div>
  );
};

export default Bookmarks;
