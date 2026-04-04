import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";
import { useAuth } from "../hooks/useAuth";

/**
 * Account hub at /my-account.
 * Hedera login + World ID verification live on /world-id.
 */
export function MyAccountPage() {
  const auth = useAuth();

  return (
    <Layout title="Mon compte">
      <div className="mt-4 space-y-6">
        <p className="text-sm text-slate-400">
          Gérez votre session Ocean Watch. La connexion Hedera et la vérification World ID se
          font sur la page dédiée.
        </p>

        <Link
          to="/world-id"
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-reef-500/90 to-lagoon-600/90 px-5 py-4 font-semibold text-abyss-950 shadow-glow transition hover:from-reef-400 hover:to-lagoon-500"
        >
          Ouvrir World ID &amp; connexion
        </Link>

        {auth.jwt || auth.wallet ? (
          <div className="rounded-2xl border border-lagoon-500/20 bg-abyss-850/70 p-4 space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-lagoon-400/80">
              État de la session
            </p>
            {auth.wallet ? (
              <p className="font-mono text-xs text-slate-400 break-all">{auth.wallet}</p>
            ) : null}
            {auth.name ? (
              <p className="text-sm text-foam">{auth.name}</p>
            ) : null}
            <p className="text-sm text-slate-400">
              World ID :{" "}
              <span className={auth.isWorldIdVerified ? "text-reef-300" : "text-coral-300"}>
                {auth.isWorldIdVerified ? "vérifié" : "non vérifié"}
              </span>
            </p>
            {!auth.isWorldIdVerified && auth.jwt ? (
              <p className="text-xs text-slate-500">
                Poursuivez sur la page World ID pour finaliser la vérification.
              </p>
            ) : null}
          </div>
        ) : null}

        {auth.isReady ? (
          <button
            type="button"
            onClick={auth.logout}
            className="w-full rounded-2xl border border-slate-700 bg-abyss-850 py-3 text-sm font-medium text-slate-400 transition hover:border-coral-500/40 hover:text-coral-300"
          >
            Se déconnecter
          </button>
        ) : null}
      </div>
    </Layout>
  );
}
