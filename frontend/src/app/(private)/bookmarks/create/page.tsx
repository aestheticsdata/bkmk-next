import CreateBookmark from "@components/bookmarks/create/CreateBookmark";
import Layout from "@components/shared/Layout";
import { Suspense } from "react";

export default function BookmarksCreatePage() {
  return (
    <Suspense fallback={null}>
      <Layout displayTools={false}>
        <CreateBookmark id={undefined} />
      </Layout>
    </Suspense>
  );
}
