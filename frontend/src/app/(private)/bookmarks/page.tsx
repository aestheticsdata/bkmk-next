import Bookmarks from "@components/bookmarks/Bookmarks";
import Layout from "@components/shared/Layout";
import { Suspense } from "react";

export default function BookmarksPage() {
  return (
    <Suspense fallback={null}>
      <Layout
        filters={true}
        sortbar={true}
      >
        <Bookmarks />
      </Layout>
    </Suspense>
  );
}
