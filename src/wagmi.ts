import { createConfig } from "wagmi";
import { http } from "viem";
import { createClient } from "viem";

import {
  mainnet,
  bsc,
  polygon,
  arbitrum,
  optimism,
  avalanche,
  fantom,
} from "viem/chains";
import { apillonConnector } from "./ApilionConnector";
export const chains = [
  mainnet,
  bsc,
  polygon,
  arbitrum,
  optimism,
  avalanche,
  fantom,
] as const;

export const config = createConfig({
  chains,
  connectors: [apillonConnector()],
  client({ chain }) {
    return createClient({
      chain,
      transport: http(),
    });
  }
});
