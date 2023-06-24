import useBookmark from "@components/bookmark/services/useBookmark";
import { useEffect } from "react";
import StarsDisplay from "@components/bookmarks/Stars/StarsDisplay";
import PriorityDisplay from "@components/bookmarks/priority/PriorityDisplay";

const BookMarkDetail = ({ id } : { id: string }) => {
  const { isLoading, bookmark } = useBookmark(id);

  useEffect(() => {
    bookmark && console.log("bookmark detail", bookmark);
  }, [bookmark]);

  return (
    <div className="flex flex-col pt-16 pl-2">
      {bookmark &&
        <>
          <div className="font-semibold py-2">
            {bookmark.title}
          </div>

          {
            bookmark.stars &&
            <div className="py-2">
              <StarsDisplay count={bookmark.stars} />
            </div>
          }

          {bookmark.screenshot &&
            <div className="py-2">
              <img
                className="border-8 rounded border-grey2"
                src={"/screenshotsUpload/5/"+bookmark.screenshot}
                width="50%"
              />
            </div>
          }

          {bookmark.notes &&
            <div className="text-sm py-2">
              {bookmark.notes}
            </div>
          }

          {bookmark.priority &&
            <div className="text-sm">
              Priorité : <PriorityDisplay priorityLevel={bookmark.priority} />
            </div>
          }
        </>
      }
    </div>
  )
}

export default BookMarkDetail;
