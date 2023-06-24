import { useRouter } from "next/router";
import Layout from "@components/shared/Layout";
import BookMarkDetail from "@components/bookmark";


const BookmarkPageDetails = () => {
  const router = useRouter();

  return (
    <Layout>
      <BookMarkDetail id={router.query.id as string} />
    </Layout>
  );
}

export default BookmarkPageDetails;
