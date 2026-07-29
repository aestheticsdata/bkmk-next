import CreateBookmark from "@components/bookmarks/create/CreateBookmark";
import Layout from "@components/shared/Layout";
import { Suspense } from "react";

/**
 * Écran d'édition **transitoire**. Le handoff v2 le remplace par une modale
 * (UI 10, COS-319) : c'est ce ticket-là qui supprimera cette route, pour que
 * l'édition ne soit jamais indisponible entre deux lots.
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
