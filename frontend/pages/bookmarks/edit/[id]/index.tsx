import { useRouter } from "next/router";
import Layout from "@components/shared/Layout";
import BookmarksCreate from "@pages/bookmarks/create";

const BookmarkPageEdit = () => {
  const router = useRouter();

  return (
    <Layout
      displayTools={false}
      backButton={true}
    >
      {router.query.id && <BookmarksCreate id={Number(router.query.id)} />}
    </Layout>
  )
}

export default BookmarkPageEdit;
