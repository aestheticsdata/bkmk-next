import Layout from "@components/shared/Layout";

export default function AboutPage() {
  return (
    <Layout
      isLogin
      displayTools={false}
    >
      <div className="mt-28 flex w-96 flex-col items-center space-y-8 rounded-sm bg-linear-to-br from-lime-300 to-emerald-500 py-3 font-smooch shadow-lg">
        <div>Site hébergé chez OVH SAS</div>
        <div>Siège social : 2 rue Kellermann - 59100 Roubaix - France</div>
        <div>Code APE 2620Z</div>
        <div>N° TVA : FR 22 424 761 419</div>
      </div>
    </Layout>
  );
}
