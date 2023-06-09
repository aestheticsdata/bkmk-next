import Layout from "@src/components/shared/Layout";
import CreateBookmark from "@components/bookmarks/create/CreateBookmark";

const BookmarksCreate = ({ id }: { id: number }) => {
  return (
    <Layout displayTools={false}>
      <CreateBookmark id={id} />
    </Layout>
  );
};

BookmarksCreate.auth = true;

export default BookmarksCreate;
