import { useRouter } from "next/router";
import Layout from "@components/shared/Layout";
import BookMarkDetail from "@components/bookmark/BookmarkDetail";


const BookmarkPageDetails = () => {
  const router = useRouter();

  return (
    <Layout displayTools={true} backButton={true} editButton={true}>
      <div className="pt-24">
        <BookMarkDetail id={router.query.id as string} />
      </div>
    </Layout>
  );
}

export default BookmarkPageDetails;
