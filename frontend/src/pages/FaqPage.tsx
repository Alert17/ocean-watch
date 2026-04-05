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
  {
    heading: "Data & trust",
    items: [
      {
        q: "Is the data live or partially mocked?",
        a: "The indexer pipeline is being finalised. Until it is fully live, the map may display a set of representative mock sightings so you can explore the interface. The Report page always submits real data to the backend. A swap comment in the code marks where mock data will be replaced.",
      },
      {
        q: "What is the purpose of the on-chain transaction references?",
        a: "Each sighting payload is submitted to the Hedera Consensus Service, which assigns a sequence number and a consensus timestamp. These references let anyone independently verify that a record existed at a specific point in time and has not been altered since — providing auditability without requiring a trusted intermediary.",
      },
      {
        q: "Are GPS coordinates shared publicly?",
        a: "Yes — coordinates are written to a public ledger. If exact privacy matters to you, consider rounding your coordinates to roughly 1 km precision before submitting. The app does not round automatically.",
      },
      {
        q: "How are sightings verified?",
        a: "Every reporter must hold a World ID credential (biometric proof-of-personhood) to prevent duplicate or bot submissions. The World ID proof is verified server-side before the sighting is accepted. This does not verify the biological accuracy of the observation — species identification relies on the reporter's best judgement.",
      },
    ],
  },
  {
    heading: "Contributing",
    items: [
      {
        q: "How can I report a sighting?",
        a: "Open the Report tab, tap on the Cozumel map to place your marker in the sea, fill in the species, count, behaviour and date fields, optionally attach photos or a note, then hit Submit. You will need a connected Hedera wallet and a verified World ID to send data.",
      },
      {
        q: "What kind of information can I add to a sighting?",
        a: "Required: GPS position (via map tap), species estimate, individual count, behaviour, and observation date/time. Optional: a free-text field note (depth, visibility, other species nearby) and one or more photos or videos.",
      },
      {
        q: "Why is this useful for researchers and conservation?",
        a: "A publicly accessible, on-chain dataset means any researcher can query historical sightings without gatekeepers. Long-term trends — seasonal patterns, species richness, behaviour changes near dive sites — become visible as data accumulates. Conservation agencies can use the data to argue for or against the extension of marine protected areas.",
      },
      {
        q: "How will donations be used?",
        a: "Donations collected through OceanWatch are split across two purposes. The first half funds peer-reviewed marine science: water quality studies, species population surveys, and reef monitoring programmes conducted by independent research teams in the Cozumel region. The second half supports environmental education in local schools — classroom materials, guided snorkelling sessions for students, and workshops that teach younger generations why sharks and healthy reefs matter. Every allocation is recorded on-chain so donors can follow exactly where their contribution goes.",
      },
    ],
  },
];

// ── Accordion item ─────────────────────────────────────────────────────────

function AccordionItem({
  q,
  a,
  open,
  onToggle,
}: {
  q: string;
  a: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-lagoon-500/20 bg-abyss-850/60">
      <button
        type="button"
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-foam"
        onClick={onToggle}
        aria-expanded={open}
      >
        <span className="pr-3">{q}</span>
        <span
          className={[
            "ml-3 shrink-0 text-lagoon-400 transition-transform duration-200",
            open ? "rotate-180" : "",
          ].join(" ")}
          aria-hidden
        >
          ▾
        </span>
      </button>
      {open && (
        <p className="border-t border-lagoon-500/10 px-4 pb-4 pt-3 text-sm text-slate-400 leading-relaxed">
          {a}
        </p>
      )}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export function FaqPage() {
  const navigate = useNavigate();
  // Each section has its own open-item index (null = all closed).
  const [openItems, setOpenItems] = useState<(number | null)[]>(
    FAQ_SECTIONS.map(() => null),
  );

  const toggle = (sectionIdx: number, itemIdx: number) => {
    setOpenItems((prev) =>
      prev.map((v, i) =>
        i === sectionIdx ? (v === itemIdx ? null : itemIdx) : v,
      ),
    );
  };

  return (
    <Layout title="FAQ">
      <div className="mt-2 space-y-6">

        {/* ── Intro ─────────────────────────────────────────── */}
        <p className="text-sm text-slate-400 text-balance">
          Everything you need to know about{" "}
          <span className="font-medium text-foam">OceanWatch</span> — the
          project, the map, how to contribute, and how on-chain records work.
        </p>

        {/* ── Sections ──────────────────────────────────────── */}
        {FAQ_SECTIONS.map((section, si) => (
          <section key={si} aria-labelledby={`faq-section-${si}`}>
            <h2
              id={`faq-section-${si}`}
              className="mb-3 font-display text-lg text-reef-300"
            >
              {section.heading}
            </h2>
            <div className="space-y-2">
              {section.items.map((item, ii) => (
                <AccordionItem
                  key={ii}
                  q={item.q}
                  a={item.a}
                  open={openItems[si] === ii}
                  onToggle={() => toggle(si, ii)}
                />
              ))}
            </div>
          </section>
        ))}

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
