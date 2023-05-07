import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";
import useBookmarks from "@components/bookmarks/services/useBookmarks";

import type { Bookmark } from "@components/bookmarks/interfaces";

const Bookmarks = () => {
  const { bookmarks, isLoading } = useBookmarks();

  useEffect(() => {
    console.log("bookmarks", bookmarks);
  }, [bookmarks]);

  return (
    <div className="flex flex-col w-full pt-16 bg-green-300">
      {isLoading && <div>loading...</div>}
      {bookmarks?.length > 0 &&
        bookmarks.map((bookmark: Bookmark) => (
          <div className="flex justify-between items-center bg-blue-300 w-11/12 text-sm" key={bookmark.id}>
            <div>{bookmark.title}</div>
            <div className="bg-yellow-500">
              {bookmark.original_url}
            </div>
            <div>{bookmark.notes}</div>
            {bookmark.stars && (
              <div className="flex">
                {[...Array(bookmark.stars)].map((_, i) => (
                    <div className="text-pink-600" key={i+200}>
                      <FontAwesomeIcon icon={faStar} />
                    </div>
                  ))
                }
                {[...Array(5 - bookmark.stars)].map((_, i) => (
                  <div className="text-pink-600" key={i+200}>
                    <FontAwesomeIcon icon={faStarRegular} />
                  </div>
                ))
                }
              </div>
              )
            }
          </div>
        ))
      }
    </div>
  );
};

export default Bookmarks;
