import {
  useEffect,
  useState
} from "react";
import useRequestHelper from "@helpers/useRequestHelper";

const useGetScreenshot = (bookmark: any) => {
  const { privateRequest } = useRequestHelper();
  const [imageUrl, setImageUrl] = useState('');

  const getScreenshot = async (bookmark: any) => {
    // setIsLoading(true);
    const res = await privateRequest(`/bookmarks/upload/${bookmark.id}?screenshotFilename=${bookmark.screenshot}&userID=${bookmark.user_id}`);
    setImageUrl(res.data);
    // setIsLoading(false);
  }

  useEffect(() => {
    if (bookmark) {
      getScreenshot(bookmark);
    }
  }, [bookmark]);

  return imageUrl;
}

export default useGetScreenshot;
