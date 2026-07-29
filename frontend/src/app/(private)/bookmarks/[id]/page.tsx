import BookmarkDetail from "@components/bookmark/BookmarkDetail";
import Layout from "@components/shared/Layout";
import { Suspense } from "react";

export default async function BookmarkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <Suspense fallback={null}>
      <Layout
        displayTools={true}
        backButton={true}
        editButton={true}
        deleteButton={true}
      >
        <div className="pt-24">
          <BookmarkDetail id={id} />
        </div>
      </Layout>
    </Suspense>
  );
}
