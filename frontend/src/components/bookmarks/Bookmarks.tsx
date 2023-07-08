import { useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import fr from "date-fns/locale/fr";
import format from "date-fns/format";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightToBracket } from "@fortawesome/free-solid-svg-icons";
import {
  faImage,
  faBell,
  faTrashAlt,
} from "@fortawesome/free-regular-svg-icons";
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import useBookmarks from "@components/bookmarks/services/useBookmarks";
import StarsDisplay from "@components/common/stars/StarsDisplay";
import PriorityDisplay from "@components/common/priority/PriorityDisplay";
import Categories from "@components/common/category/Categories";

import type { Bookmark } from "@components/bookmarks/interfaces/bookmark";
import { ROUTES } from "@components/shared/config/constants";

const Bookmarks = () => {
  const { bookmarks, deleteBookmark, isLoading } = useBookmarks();
  const router = useRouter();

  useEffect(() => {
    console.log("bookmarks", bookmarks);
  }, [bookmarks]);

  return (
    <div className="flex flex-col w-full mt-28 pb-20 divide-y divide-grey2 overflow-x-auto overflow-y-hidden min-h-0">
      {isLoading && <div>loading...</div>}
      {bookmarks?.length === 0 && !isLoading && <div>Pas de bookmarks</div>}
      {bookmarks?.length > 0 && !isLoading &&
        bookmarks.map((bookmark: Bookmark) => (
          <div
            key={`${bookmark.id}-${bookmark.title}`}
            className={`
              flex cursor-pointer px-0.5 text-xs 
              ${bookmark.original_url ? "hover:bg-blue-300": "hover:bg-yellow-500"}
              transition-colors ease-linear duration-150
            `}
          >

            {bookmark.original_url ?
              <div className="flex justify-center hover:text-blue-500 w-[20px] py-1">
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
              <div className="flex w-full py-1">
                <div
                  title={bookmark.original_url ?? ""}
                  className="w-[400px] truncate font-semibold"
                >
                    {bookmark.title}
                </div>
                <div className="flex justify-start mx-1 w-[70px]">
                  {bookmark.stars > 0 && <StarsDisplay count={bookmark.stars} />}
                </div>
                <div className="w-[300px] truncate" title={bookmark.notes && decodeURIComponent(bookmark.notes)}>
                  {bookmark.notes && decodeURIComponent(bookmark.notes)}
                </div>
                <div className="flex justify-center items-center w-[80px]" title={`priorité: ${bookmark.priority || "N/A"}`}>
                  {bookmark.priority &&
                    <PriorityDisplay priorityLevel={bookmark.priority} />
                  }
                </div>
                <Categories categories={bookmark.categories} />
                <div className="flex w-[120px] text-xs">
                  {bookmark.screenshot &&
                    <div>
                      <FontAwesomeIcon icon={faImage} />
                    </div>
                  }
                </div>
                <div className="flex w-[120px] text-xs">
                  {bookmark.alarm_id &&
                    <div>
                      <FontAwesomeIcon icon={faBell} />
                    </div>
                  }
                </div>
                <div className="flex justify-center text-xxs w-[160px]">
                  ajouté le : {format(new Date(bookmark.date_added!), "dd MMM yyyy", { locale: fr })}
                </div>
                <div
                  className="flex w-[20px] mx-1 text-grey1"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    deleteBookmark.mutate(bookmark.id);
                  }}
                >
                  <FontAwesomeIcon icon={faTrashAlt} className="hover:text-black" />
                </div>
                <div
                  className="flex w-[20px] mx-1 text-grey1"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    router.push(`${ROUTES.bookmarksEdition.path}/${bookmark.id}`);
                  }}
                >
                  <FontAwesomeIcon icon={faPencilAlt} className="hover:text-black" />
                </div>
              </div>
            </Link>
          </div>
        ))
      }
    </div>
  );
};

export default Bookmarks;
