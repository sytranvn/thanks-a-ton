import { Network } from "@orbs-network/ton-access";

const config = {
  network: import.meta.env.VITE_APP_NETWORK as Network,
  address: import.meta.env.VITE_APP_CONTRACT_ADDRESS,
} as const;
export default  config;
