/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GRAPHQL_URL: string;
  readonly VITE_USE_MSW: string;
  /** Reown Cloud — https://cloud.reown.com (required for Hedera WalletConnect) */
  readonly VITE_WALLETCONNECT_PROJECT_ID?: string;
  /** testnet | mainnet | previewnet | devnet (default: testnet) */
  readonly VITE_HEDERA_NETWORK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
