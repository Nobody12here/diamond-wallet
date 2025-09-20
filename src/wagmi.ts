import { createConfig } from 'wagmi';
import { http } from 'viem';
import { mainnet, bsc, polygon, arbitrum, optimism, avalanche, fantom } from 'viem/chains';
import { apillonConnector } from "./ApilionConnector"
export const chains = [mainnet, bsc, polygon, arbitrum, optimism, avalanche, fantom] as const;

export const config = createConfig({
    chains,
    transports: {
        [mainnet.id]: http(),
        [bsc.id]: http('https://bsc-dataseed.binance.org'),
        [polygon.id]: http(),
        [arbitrum.id]: http(),
        [optimism.id]: http(),
        [avalanche.id]: http(),
        [fantom.id]: http(),
    },
    connectors: [apillonConnector()]
});
