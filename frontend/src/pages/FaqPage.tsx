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
  {
    heading: "The map",
    items: [
      {
        q: "How does the map work?",
        a: "The map displays every sighting submitted through OceanWatch. Each record is fetched from the OceanWatch indexer (a GraphQL API) and plotted at its reported GPS coordinates. You can narrow what you see using the date-range and species filters above the map.",
      },
      {
        q: "What do the red dots on the map represent?",
        a: "Each dot is a confirmed shark observation submitted by a World-ID-verified reporter. The colour is uniform for now; future versions may vary colour by species or recency.",
      },
      {
        q: "What information is shown when I tap a dot?",
        a: "Tapping a marker opens a popup showing: species (or best estimate), observation date, individual count, observed behaviour, the reporter's wallet address, the Hedera sequence number, and the consensus timestamp. A field note is shown if the reporter added one.",
      },
      {
        q: "How do the date and species filters work?",
        a: "The date filter hides sightings older than the selected window (7 days, 30 days, 3 months, or all time). The species filter restricts markers to a single species. Both filters are applied client-side and update the map and sighting count instantly.",
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
