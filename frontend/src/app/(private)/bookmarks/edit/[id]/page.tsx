import CreateBookmark from "@components/bookmarks/create/CreateBookmark";
import Layout from "@components/shared/Layout";
import { Suspense } from "react";

/**
 * **Transitional** edit screen. The v2 handoff replaces it with a modal (UI 10,
 * COS-319), and that ticket is the one that removes this route — so editing is never
 * unavailable between two lots.
 */
export default async function BookmarkEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <Suspense fallback={null}>
      <Layout
        displayTools={false}
        backButton={true}
      >
        <CreateBookmark id={Number(id)} />
      </Layout>
    </Suspense>
  );
}
