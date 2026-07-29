import UploadBookmarks from "@components/bookmarks/upload/UploadBookmarks";
import Layout from "@components/shared/Layout";
import { Suspense } from "react";

export default function BookmarksUploadPage() {
  return (
    <Suspense fallback={null}>
      <Layout displayTools={false}>
        <UploadBookmarks />
      </Layout>
    </Suspense>
  );
}
