import Layout from "@src/components/shared/Layout";
import CreateBookmark from "@components/bookmarks/CreateBookmark";

const BookmarksCreate = () => {
  return (
    <Layout>
      <CreateBookmark />
    </Layout>
  );
};

BookmarksCreate.auth = true;

export default BookmarksCreate;
