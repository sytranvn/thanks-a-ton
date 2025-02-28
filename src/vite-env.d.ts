/// <reference types="vite/client" />

import { Network } from "@orbs-network/ton-access"

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_URL: string
  readonly VITE_APP_CONTRACT_ADDRESS: string
  readonly VITE_APP_NETWORK: Network
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
