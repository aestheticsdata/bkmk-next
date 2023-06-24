import { useRouter } from "next/router";
import Layout from "@components/shared/Layout";
import BookMarkDetail from "@components/bookmark";
import useBookmark from "@components/bookmark/services/useBookmark";
import { useEffect } from "react";

const BookmarkPageDetails = () => {
  const router = useRouter();
  const { isLoading, bookmark } = useBookmark(router.query.id as string);

  useEffect(() => {
    bookmark && console.log("bookmark detail", bookmark);
  }, [bookmark]);

  return (
    <Layout>
      <BookMarkDetail id={Number(router.query.id)}/>
    </Layout>
  );
}

export default BookmarkPageDetails;
