import useBookmarks from "@components/bookmarks/services/useBookmarks";
import { useEffect } from "react";

import type { Bookmark } from "@components/bookmarks/interfaces";

const Bookmarks = () => {
  const { bookmarks, isLoading } = useBookmarks();

  useEffect(() => {
    console.log("isLoading", isLoading);
  }, [isLoading]);

  useEffect(() => {
    console.log("bookmarks", bookmarks);
  }, [bookmarks]);

  return (
    <div className="flex flex-col pt-14">
      {bookmarks?.length > 0 &&
        bookmarks.map((bookmark: Bookmark) => (
          <div className="flex justify-between" key={bookmark.id}>
            <div>{bookmark.title}</div>
            <div>{bookmark.original_url}</div>
            <div>{bookmark.notes}</div>
          </div>
        ))
      }
    </div>
  );
};

export default Bookmarks;
