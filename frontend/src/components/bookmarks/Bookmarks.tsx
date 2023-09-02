import {
  useEffect,
  useState,
} from "react";
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
import useReminders from "@components/reminders/services/useReminders";
import StarsDisplay from "@components/common/stars/StarsDisplay";
import PriorityDisplay from "@components/common/priority/PriorityDisplay";
import Categories from "@components/common/category/Categories";
import DeleteConfirm from "@components/common/deleteConfirm/DeleteConfirm";
import {
  ROUTES,
  COLUMN_WIDTH,
  FIRST_VISIT,
  VISITED,
} from "@components/shared/config/constants";
import { PAGES } from "@components/shared/config/constants";

import type { Bookmark } from "@components/bookmarks/interfaces/bookmark";

const Bookmarks = () => {
  const { data: reminders } = useReminders();
  const { bookmarks, deleteBookmark, isLoading } = useBookmarks(PAGES.BOOKMARKS);
  const router = useRouter();
  const [displayDeleteConfirm, setDisplayDeleteConfirm] = useState<number>(-1);

  useEffect(() => {
    if (reminders?.data.length > 0 && localStorage.getItem(FIRST_VISIT) !== VISITED) {
      localStorage.setItem(FIRST_VISIT, VISITED);
      for (const reminder of reminders!.data) {
        if (reminder.original_url) {
          window.open(reminder.original_url, "_blank");
        } else {
          console.log(reminder.id);
          // ouvrir le reminder qui n'a pas d'url -> bookmark detail
          window.open(`bookmarks/${reminder.id}`, "_blank");
        }
      }
      router.push("/bookmarks/reminders");
    }
  }, [reminders]);

  return (
    <div className="flex flex-col w-full mt-2 pb-20 divide-y divide-grey2 overflow-x-auto overflow-y-hidden min-h-0">
      {isLoading && <div>loading...</div>}
      {bookmarks?.rows.length === 0 && !isLoading && <div>Pas de bookmarks</div>}
      {bookmarks?.rows?.length! > 0 && !isLoading &&
        bookmarks!.rows.map((bookmark: Bookmark) => (
          <div
            key={`${bookmark.id}-${decodeURIComponent(bookmark.title)}`}
            className={`
              flex cursor-pointer px-0.5 text-xs 
              ${bookmark.original_url ? "hover:bg-blue-300": "hover:bg-yellow-500"}
              transition-colors ease-linear duration-150
            `}
          >

            {bookmark.original_url ?
              <div className={`flex justify-center hover:text-blue-500 ${COLUMN_WIDTH.linkIcon} py-1`}>
                <a
                  href={bookmark.original_url}
                  target="_blank"
                  onClick={(e) => {e.stopPropagation()}}
                >
                  <FontAwesomeIcon icon={faRightToBracket} />
                </a>
              </div>
              :
              <div className={`${COLUMN_WIDTH.linkIcon}`} />
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
                    {decodeURIComponent(bookmark.title)}
                </div>
                <div className={`flex justify-start ${COLUMN_WIDTH.stars}`}>
                  {bookmark.stars > 0 && <StarsDisplay count={bookmark.stars} />}
                </div>
                <div className={`${COLUMN_WIDTH.notes} truncate`} title={bookmark.notes && decodeURIComponent(bookmark.notes)}>
                  {bookmark.notes && decodeURIComponent(bookmark.notes)}
                </div>
                <div className={`flex justify-center items-center ${COLUMN_WIDTH.priority}`} title={`priority: ${bookmark.priority || "N/A"}`}>
                  {bookmark.priority &&
                    <PriorityDisplay priorityLevel={bookmark.priority} />
                  }
                </div>
                <Categories categories={bookmark.categories} />
                <div className={`flex ${COLUMN_WIDTH.screenshot} text-xs`}>
                  {bookmark.screenshot &&
                    <div>
                      <FontAwesomeIcon icon={faImage} />
                    </div>
                  }
                </div>
                <div className={`flex ${COLUMN_WIDTH.alarm} text-xs`}>
                  {bookmark.alarm_id &&
                    <div>
                      <FontAwesomeIcon icon={faBell} />
                    </div>
                  }
                </div>
                <div className={`flex justify-center text-xxs ${COLUMN_WIDTH.dateAdded}`}>
                  ajouté le : {format(new Date(bookmark.date_added!), "dd MMM yyyy", { locale: fr })}
                </div>
                {displayDeleteConfirm === bookmark.id ?
                  // <div className="flex w-[100px] space-x-1 text-xxxs">
                  //   <div
                  //     className="outline outline-1 outline-grey3 rounded cursor-pointer px-1 hover:bg-grey01 uppercase"
                  //     onClick={(e) => {
                  //       e.preventDefault();
                  //       e.stopPropagation();
                  //       setDisplayDeleteConfirm(-1);
                  //       deleteBookmark.mutate(bookmark.id);
                  //     }}
                  //   >
                  //     confirm
                  //   </div>
                  //   <div
                  //     className="outline outline-1 outline-grey3 rounded cursor-pointer px-1 hover:bg-grey01 uppercase"
                  //     onClick={(e) => {
                  //       e.preventDefault();
                  //       e.stopPropagation();
                  //       setDisplayDeleteConfirm(-1);
                  //     }}
                  //   >
                  //     cancel
                  //   </div>
                  // </div>
                  <DeleteConfirm
                    closeCB={setDisplayDeleteConfirm}
                    deleteCB={() => { deleteBookmark.mutate(bookmark.id) }}
                  />
                  :
                  <>
                    <div
                      className="flex w-[20px] mx-1 text-grey1"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDisplayDeleteConfirm(bookmark.id);
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
                  </>
                }
              </div>
            </Link>
          </div>
        ))
      }
    </div>
  );
};

export default Bookmarks;
