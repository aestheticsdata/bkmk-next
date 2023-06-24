import { useEffect } from "react";
import Link from "next/link";
import fr from "date-fns/locale/fr";
import format from "date-fns/format";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightToBracket } from "@fortawesome/free-solid-svg-icons";
import { faImage } from "@fortawesome/free-regular-svg-icons";
import useBookmarks from "@components/bookmarks/services/useBookmarks";
import StarsDisplay from "@components/bookmarks/Stars/StarsDisplay";

import type {
  Bookmark,
  Category,
} from "@components/bookmarks/interfaces/bookmark";
import getCategoryComponent from "@components/common/category/Category";
import PriorityDisplay from "@components/bookmarks/priority/PriorityDisplay";

const Bookmarks = () => {
  const { bookmarks, isLoading } = useBookmarks();

  useEffect(() => {
    console.log("bookmarks", bookmarks);
  }, [bookmarks]);

  return (
    <div className="flex flex-col w-full pt-20 pb-20 divide-y divide-grey2 overflow-x-auto overflow-y-hidden min-h-0">
      {isLoading && <div>loading...</div>}
      {bookmarks?.length > 0 &&
        bookmarks.map((bookmark: Bookmark) => (
          <div
            key={`${bookmark.id}-${bookmark.title}`}
            className={`
              flex cursor-pointer px-0.5 py-1 text-xs 
              ${bookmark.original_url ? "hover:bg-blue-300": "hover:bg-yellow-500"}
              transition-colors ease-linear duration-150
            `}
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
            <Link
              className="flex"
              href={{
                pathname: "/bookmarks/[id]",
                query: { id: bookmark.id },
              }}
            >
              <div
                title={bookmark.original_url ?? ""}
                className="w-[400px] truncate font-semibold"
              >
                  {bookmark.title}
              </div>
              <div className="flex justify-start mx-1 w-[70px]">
                {bookmark.stars ?
                  <StarsDisplay count={bookmark.stars} />
                  :
                  "N/A"
                }
              </div>
              <div className="w-[300px] truncate" title={bookmark.notes}>{bookmark.notes}</div>
              <div className="flex justify-center items-center w-[80px]" title={`priorité: ${bookmark.priority || "N/A"}`}>
                {bookmark.priority &&
                  <PriorityDisplay priorityLevel={bookmark.priority} />
                }
              </div>
              <div className="flex w-[240px] text-tiny font-bold">
                {bookmark.categories.length > 0 &&
                  bookmark.categories.map((c: Category) => getCategoryComponent(c))
                }
              </div>
              <div className="flex w-[120px] text-xs">
                {bookmark.screenshot &&
                  <div>
                    <FontAwesomeIcon icon={faImage} />
                  </div>
                }
              </div>
              <div className="text-xxs flex-shrink-0">
                ajouté le : {format(new Date(bookmark.date_added!), "dd MMM yyyy", { locale: fr })}
              </div>
            </Link>
          </div>
        ))
      }
    </div>
  );
};

export default Bookmarks;
