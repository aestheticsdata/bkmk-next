import { useRouter } from "next/router";
import Layout from "@components/shared/Layout";
import BookMarkDetail from "@components/bookmark";

const BookmarkPageDetails = () => {
  const router = useRouter();
  return (
    <Layout>
      <BookMarkDetail id={Number(router.query.id)}/>
    </Layout>
  );
}

export default BookmarkPageDetails;
