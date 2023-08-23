import {
  useEffect,
  useState
} from "react";
import useRequestHelper from "@helpers/useRequestHelper";

const useGetScreenshot = (bookmark: any) => {
  const { privateRequest } = useRequestHelper();
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const getScreenshot = async (bookmark: any) => {
    setIsLoading(true);
    if (bookmark.screenshot) {
      const res = await privateRequest(`/bookmarks/upload/${bookmark.id}?screenshotFilename=${bookmark.screenshot}&userID=${bookmark.user_id}`);
      setImageUrl(res.data);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    if (bookmark) {
      getScreenshot(bookmark);
    }
  }, [bookmark]);

  return {
    imageUrl,
    isLoading,
  };
}

export default useGetScreenshot;
