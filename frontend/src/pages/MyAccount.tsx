import { Layout } from "../components/Layout";

export function MyAccountPage() {
  return (
    <Layout title="My account">
      <p className="mt-2 text-sm text-slate-400">
        Account settings and identity (to be connected to your auth / wallet later).
      </p>
    </Layout>
  );
}
