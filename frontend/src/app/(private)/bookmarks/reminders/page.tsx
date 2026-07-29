import Reminders from "@components/reminders/Reminders";
import Layout from "@components/shared/Layout";
import { Suspense } from "react";

export default function RemindersPage() {
  return (
    <Suspense fallback={null}>
      <Layout displayTools={false}>
        <Reminders />
      </Layout>
    </Suspense>
  );
}
