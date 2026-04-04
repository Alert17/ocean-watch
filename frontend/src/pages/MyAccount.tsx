import { Layout } from "../components/Layout";

export function MyAccountPage() {
  return (
    <Layout title="Mon compte">
      <p className="mt-2 text-sm text-slate-400">
        Paramètres du compte et identité (à brancher sur ton auth / portefeuille plus tard).
      </p>
    </Layout>
  );
}
