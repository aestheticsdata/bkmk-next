import Layout from "@src/components/shared/Layout";
import CreateBookmark from "@components/bookmarks/create/CreateBookmark";

const BookmarksCreate = () => {
  return (
    <Layout displayTools={false}>
      <CreateBookmark />
    </Layout>
  );
};

BookmarksCreate.auth = true;

export default BookmarksCreate;
