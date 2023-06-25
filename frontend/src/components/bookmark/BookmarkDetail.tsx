import useBookmark from "@components/bookmark/services/useBookmark";
import { useEffect } from "react";
import StarsDisplay from "@components/common/stars/StarsDisplay";
import PriorityDisplay from "@components/common/priority/PriorityDisplay";
import Categories from "@components/common/category/Categories";

const BookmarkDetail = ({ id } : { id: string }) => {
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

          {bookmark.original_url &&
            <div className="text-sm">
              <a
                href={bookmark.original_url}
                className="hover:text-grey2"
                target="_blank"
                onClick={(e) => {e.stopPropagation()}}
              >

                {bookmark.original_url}
              </a>
            </div>
          }

          {bookmark.stars > 0 &&
            <div className="py-2 text-sm">
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
            <div className="text-sm py-2 w-[450px] whitespace-pre-wrap">
              {decodeURIComponent(bookmark.notes)}
            </div>
          }

          {bookmark.priority &&
            <div className="text-sm">
              Priorité : <PriorityDisplay priorityLevel={bookmark.priority} />
            </div>
          }

          <div className="text-sm">
            <Categories categories={bookmark.categories} />
          </div>
        </>
      }
    </div>
  )
}

export default BookmarkDetail;
