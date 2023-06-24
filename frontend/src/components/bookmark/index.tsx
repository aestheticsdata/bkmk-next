import useBookmark from "@components/bookmark/services/useBookmark";
import { useEffect } from "react";

const BookMarkDetail = ({ id } : { id: string }) => {
  const { isLoading, bookmark } = useBookmark(id);

  useEffect(() => {
    bookmark && console.log("bookmark detail", bookmark);
  }, [bookmark]);

  return (
    <div className="flex pt-60">
      une image
      {bookmark &&
        <img
          src={"/screenshotsUpload/5/"+bookmark.screenshot}
        />
      }

    </div>
  )
}

export default BookMarkDetail;
