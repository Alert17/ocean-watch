/**
 * /faq — Frequently Asked Questions about OceanWatch.
 *
 * Accessible from the FAQ button on the Map page.
 * Uses the same accordion pattern already established in MapPage.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";

// ── FAQ content ────────────────────────────────────────────────────────────

const FAQ_SECTIONS: { heading: string; items: { q: string; a: string }[] }[] = [
  {
    heading: "About the project",
    items: [
      {
        q: "What is OceanWatch?",
        a: "OceanWatch is a decentralised citizen-science platform where divers and marine enthusiasts report shark sightings around Isla Cozumel and the wider Caribbean. Every observation is anchored on the Hedera Consensus Service (HCS), creating a tamper-evident, publicly verifiable record of marine wildlife activity.",
      },
      {
        q: "What problem does it solve?",
        a: "Shark population data is scattered, expensive to collect, and often locked behind academic institutions. OceanWatch opens data collection to anyone with a dive mask and a smartphone, producing a continuous, crowd-sourced time series that researchers and conservationists can use freely.",
      },
      {
        q: "Why track shark sightings specifically?",
        a: "Sharks are apex predators and key indicators of reef health. Their presence — or absence — signals the overall state of a marine ecosystem. Yet global shark populations have declined by over 70% since 1970. Granular, geo-tagged sighting data helps identify hotspots, migration routes, and the effect of protected zones.",
      },
      {
        q: "Why Cozumel?",
        a: "Isla Cozumel sits on the Mesoamerican Barrier Reef — the second-largest coral reef system in the world. It hosts nurse sharks, Caribbean reef sharks, and occasional bull sharks year-round. Its relatively small geographic footprint makes it ideal for a focused pilot before expanding globally.",
      },
    ],
  },

        {/* ── Back to map ───────────────────────────────────── */}
        <div className="border-t border-lagoon-500/10 pt-4">
          <button
            type="button"
            onClick={() => navigate("/map")}
            className="w-full rounded-2xl border border-lagoon-500/25 bg-abyss-850/70 py-3 text-sm font-medium text-lagoon-300 transition hover:border-lagoon-400/40 hover:text-foam"
          >
            ← Back to map
          </button>
        </div>

      </div>
    </Layout>
  );
}
