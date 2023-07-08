import { useRouter } from "next/router";
import Layout from "@components/shared/Layout";
import BookmarksCreate from "@pages/bookmarks/create";

const BookmarkPageEdit = () => {
  const router = useRouter();

  return (
    <Layout displayTools={false} backButton={true}>
      <BookmarksCreate id={router.query.id as string} />
    </Layout>
  )
}

export default BookmarkPageEdit;
