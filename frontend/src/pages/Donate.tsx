import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Layout } from "../components/Layout";
import { getTokenPrice } from "../lib/api";

const TREASURY_ACCOUNT = (import.meta.env.VITE_TREASURY_ACCOUNT_ID as string | undefined)?.trim();
const HEDERA_NETWORK = (import.meta.env.VITE_HEDERA_NETWORK as string | undefined)?.trim() ?? "testnet";

export function DonatePage() {
  const [copied, setCopied] = useState(false);

  const priceQuery = useQuery({
    queryKey: ["tokenPrice"],
    queryFn: getTokenPrice,
  });

  const copyAddress = useCallback(async () => {
    if (!TREASURY_ACCOUNT) return;
    try {
      await navigator.clipboard.writeText(TREASURY_ACCOUNT);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may be unavailable (e.g. insecure context)
    }
  }, []);

  return (
    <Layout title="Donate HBAR">
      <div className="mt-4 space-y-6">
        <p className="text-sm text-slate-400">
          <strong className="text-foam">No sign-in required.</strong> Send{" "}
          <strong className="text-foam">HBAR</strong> to the Ocean Watch treasury from HashPack,
          Blade, or any Hedera wallet—scan the QR code or copy the account below. Funds support the
          OCEAN redemption pool (80% treasury, 20% platform fee).
        </p>

        {priceQuery.isSuccess ? (
          <div className="rounded-2xl border border-lagoon-500/20 bg-abyss-850/70 p-4 text-sm text-slate-300">
            <p className="text-xs font-medium uppercase tracking-wider text-lagoon-400/80">
              Treasury snapshot
            </p>
            <ul className="mt-2 space-y-1 font-mono text-xs text-slate-400">
              <li>Treasury HBAR: {priceQuery.data.treasuryBalanceHbar.toFixed(4)}</li>
              <li>OCEAN circulating supply: {priceQuery.data.circulatingSupply.toFixed(2)}</li>
              <li>Indicative price / OCEAN: {priceQuery.data.pricePerToken.toFixed(8)} HBAR</li>
            </ul>
          </div>
        ) : priceQuery.isError ? (
          <p className="text-xs text-coral-300/90" role="alert">
            Could not load token price right now.
          </p>
        ) : (
          <p className="text-xs text-slate-500">Loading metrics…</p>
        )}

        {TREASURY_ACCOUNT ? (
          <div className="rounded-2xl border border-lagoon-500/15 bg-abyss-900/60 p-5 space-y-4">
            <div>
              <p className="text-xs font-medium text-lagoon-400/90">Treasury account ({HEDERA_NETWORK})</p>
              <p className="mt-2 break-all font-mono text-sm text-foam">{TREASURY_ACCOUNT}</p>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div
                className="rounded-2xl border border-lagoon-500/25 bg-white p-3 shadow-inner"
                role="img"
                aria-label={`QR code containing Hedera account ${TREASURY_ACCOUNT}`}
              >
                <QRCodeSVG
                  value={TREASURY_ACCOUNT}
                  size={200}
                  level="M"
                  includeMargin={false}
                  bgColor="#ffffff"
                  fgColor="#0f172a"
                />
              </div>
              <p className="text-center text-xs text-slate-500">
                Scan with your wallet app to pre-fill the recipient. Choose any amount of HBAR to
                send.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void copyAddress()}
              className="w-full rounded-2xl border border-lagoon-500/35 bg-abyss-850 py-3 text-sm font-medium text-lagoon-300 transition hover:border-lagoon-400/50 hover:text-foam"
            >
              {copied ? "Copied!" : "Copy account ID"}
            </button>
          </div>
        ) : (
          <div
            className="rounded-2xl border border-coral-500/30 bg-coral-500/10 p-4 text-sm text-coral-200"
            role="status"
          >
            Set <code className="rounded bg-abyss-950/50 px-1 font-mono text-xs">VITE_TREASURY_ACCOUNT_ID</code>{" "}
            in your environment to show the donation address and QR code.
          </div>
        )}
      </div>
    </Layout>
  );
}
