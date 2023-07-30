import { useEffect } from "react";
import { useRouter } from "next/router";
import useReminders from "@components/reminders/services/useReminders";
import BookmarkDetail from "@components/bookmark/BookmarkDetail";
import { ROUTES } from "@components/shared/config/constants";

import type { BookmarkAndAlarm } from "@components/bookmarks/interfaces/bookmark";

const Reminders = () => {
  const router = useRouter();
  const { data, isLoading } = useReminders();

  useEffect(() => {
    data && console.log("data : ", data);
  }, [data]);

  return (
    <>
    {!isLoading ?
      data?.data.length > 0 ?
        <div className="flex flex-col mt-20 p-2 space-y-4">
          {
            data!.data.map((bookmark: BookmarkAndAlarm) =>
              <div
                className="
                  border-2 border-grey2 rounded p-2 bg-grey01 w-[750px]
                  cursor-pointer hover:bg-white transition-colors ease-linear duration-150
                "
                onClick={() => {router.push(`${ROUTES.bookmarksEdition.path}/${bookmark.id}`)}}
              >
                <BookmarkDetail id={bookmark.id.toString()} />
              </div>
            )
          }
        </div>
        :
        <div>Pas d'alarmes aujourd'hui</div>
      :
      <div className="flex mt-28">
        Loading ...
      </div>
    }
    </>
  )
}

export default Reminders;
