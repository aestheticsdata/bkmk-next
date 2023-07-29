import Layout from "@components/shared/Layout";
import Reminders from "@components/reminders/Reminders";

const RemindersPage = () => {
  return (
    <Layout
      displayTools={false}
    >
      <Reminders />
    </Layout>
  )
}

RemindersPage.auth = true;

export default RemindersPage;
