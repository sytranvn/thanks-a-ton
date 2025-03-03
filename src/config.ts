import { Network } from "@orbs-network/ton-access";

const config = {
  network: await import.meta.env.VITE_APP_NETWORK as Network,
  address: await import.meta.env.VITE_APP_CONTRACT_ADDRESS,
} as const;
export default  config;
console.log(config)
