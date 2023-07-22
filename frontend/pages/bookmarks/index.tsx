import Layout from "@src/components/shared/Layout";
import Bookmarks from "@components/bookmarks/Bookmarks";

const BookmarksPageList = () => {
  return (
    <Layout filters={true}>
      <Bookmarks />
    </Layout>
  )
}

BookmarksPageList.auth = true;

export default BookmarksPageList;
