import useRequestHelper from "@helpers/useRequestHelper";
import { useEffect, useState } from "react";

const useGetScreenshot = (bookmark: any) => {
  const { privateRequest } = useRequestHelper();
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const getScreenshot = async (bookmark: any) => {
    setIsLoading(true);
    if (bookmark.screenshot) {
      // No `&userID=` (COS-306) — see `services/useScreenshot.ts`, which replaces this helper.
      const res = await privateRequest(`/bookmarks/upload/${bookmark.id}?screenshotFilename=${bookmark.screenshot}`);
      setImageUrl(res.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (bookmark) {
      getScreenshot(bookmark);
    }
  }, [bookmark]);

  return {
    imageUrl,
    isLoading,
  };
};

export default useGetScreenshot;
