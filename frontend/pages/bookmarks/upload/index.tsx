import Layout from "@src/components/shared/Layout";
import UploadBookmarks from "@components/bookmarks/upload/UploadBookmarks";

const BookmarksUpload = () => {
  return (
    <Layout displayTools={false}>
      <UploadBookmarks />
    </Layout>
  );
};

BookmarksUpload.auth = true;

export default BookmarksUpload;
