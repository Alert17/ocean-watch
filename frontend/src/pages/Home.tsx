import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";

export function HomePage() {
  return (
    <Layout title="Observations marines">
      <div className="relative mt-2 space-y-6">
        <div className="rounded-2xl border border-lagoon-500/20 bg-abyss-850/80 p-5 shadow-card backdrop-blur-sm">
          <p className="text-balance text-sm leading-relaxed text-slate-300">
            Carnet de terrain numérique pour la science citoyenne : signalez un ou plusieurs
            requins autour de <strong className="text-foam">Cozumel</strong>, avec position sur
            carte et zone marine. Vos envois alimentent l’historique local (données mockées en
            développement).
          </p>
        </div>

        <div className="grid gap-3">
          <Link
            to="/report"
            className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-reef-500/90 to-lagoon-600/90 px-5 py-4 font-semibold text-abyss-950 shadow-glow transition hover:from-reef-400 hover:to-lagoon-500"
          >
            <span>Nouvelle observation</span>
            <span aria-hidden className="text-xl">
              →
            </span>
          </Link>
          <Link
            to="/history"
            className="rounded-2xl border border-lagoon-500/30 bg-abyss-800/60 px-5 py-4 text-center font-medium text-foam transition hover:border-reef-400/40 hover:bg-abyss-800"
          >
            Consulter mon historique
          </Link>
        </div>

        <section
          className="rounded-2xl border border-white/5 bg-abyss-900/40 p-4"
          aria-labelledby="tips-heading"
        >
          <h2 id="tips-heading" className="font-display text-lg text-reef-300">
            Bonnes pratiques
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li className="flex gap-2">
              <span className="text-lagoon-400" aria-hidden>
                ◆
              </span>
              Notez l’heure locale de l’observation et la visibilité si pertinent.
            </li>
            <li className="flex gap-2">
              <span className="text-lagoon-400" aria-hidden>
                ◆
              </span>
              Touchez la carte dans la zone où vous avez observé l’animal.
            </li>
            <li className="flex gap-2">
              <span className="text-lagoon-400" aria-hidden>
                ◆
              </span>
              Respectez la faune : distance de sécurité, pas d’harcelement.
            </li>
          </ul>
        </section>
      </div>
    </Layout>
  );
}
