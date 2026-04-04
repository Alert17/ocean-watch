import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";

/**
 * Displayed after a successful sighting submission.
 * Animation: SVG checkmark circle (CSS keyframes, no external library).
 */
export function CongratsPage() {
  return (
    <Layout>
      <div className="flex min-h-[72vh] flex-col items-center justify-center gap-8 text-center">

        {/* ── Animated success icon ─────────────────────────── */}
        <div
          style={{
            animation: "ow-scale-in 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) both",
          }}
        >
          <svg
            width="108"
            height="108"
            viewBox="0 0 108 108"
            fill="none"
            aria-hidden
          >
            {/* Outer glow ring */}
            <circle
              cx="54"
              cy="54"
              r="52"
              stroke="#2dd4bf"
              strokeWidth="2"
              opacity="0.25"
            />
            {/* Main ring */}
            <circle
              cx="54"
              cy="54"
              r="44"
              stroke="#2dd4bf"
              strokeWidth="3"
              opacity="0.6"
            />
            {/* Filled background disc */}
            <circle cx="54" cy="54" r="40" fill="#0a1a2e" />
            {/* Checkmark — drawn via stroke-dashoffset */}
            <path
              d="M32 54 L47 70 L76 38"
              stroke="#2dd4bf"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              style={{
                strokeDasharray: 65,
                strokeDashoffset: 65,
                animation: "ow-draw-check 0.45s 0.45s ease-out forwards",
              }}
            />
          </svg>
        </div>

        {/* ── Title & subtitle ──────────────────────────────── */}
        <div
          className="space-y-2"
          style={{ animation: "ow-fade-up 0.4s 0.75s both" }}
        >
          <h1 className="font-display text-3xl font-semibold text-foam">
            Observation envoyée !
          </h1>
          <p className="text-balance text-sm leading-relaxed text-slate-400">
            Merci de contribuer à la conservation des requins à{" "}
            <strong className="text-foam">Cozumel</strong>.
            <br />
            Votre signal sera intégré à l'indexeur Ocean Watch.
          </p>
        </div>

        {/* ── CTA buttons ───────────────────────────────────── */}
        <div
          className="flex w-full flex-col gap-3"
          style={{ animation: "ow-fade-up 0.4s 0.95s both" }}
        >
          {/*
           * TODO: replace these href targets with real auth routes once
           * Hedera wallet connect / login flow is implemented.
           */}
          <Link
            to="/my-account"
            className="w-full rounded-2xl bg-gradient-to-r from-reef-500/90 to-lagoon-600/90 py-3.5 text-center font-semibold text-abyss-950 shadow-glow transition hover:from-reef-400 hover:to-lagoon-500"
          >
            Se connecter
          </Link>
          <Link
            to="/my-account"
            className="w-full rounded-2xl border border-lagoon-500/30 bg-abyss-800/60 py-3.5 text-center font-medium text-foam transition hover:border-reef-400/40 hover:bg-abyss-800"
          >
            Créer un compte
          </Link>
          <Link
            to="/"
            className="text-sm text-slate-500 underline-offset-2 hover:text-slate-400 hover:underline"
          >
            Retour à l'accueil
          </Link>
        </div>

      </div>
    </Layout>
  );
}
