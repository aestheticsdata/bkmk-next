import Layout from "@src/components/shared/Layout";
import Bookmarks from "@components/bookmarks/Bookmarks";

const BookmarksPage = () => {
  return (
    <Layout>
      <Bookmarks />
    </Layout>
  )
}

BookmarksPage.auth = true;

export default BookmarksPage;
