import { useEffect } from "react";
import useBookmarks from "@components/bookmarks/services/useBookmarks";
import Stars from "@components/bookmarks/Stars";

import type { Bookmark } from "@components/bookmarks/interfaces/bookmark";

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
            {bookmark.stars && <Stars count={bookmark.stars} />}
          </div>
        ))
      }
    </div>
  );
};

export default Bookmarks;
