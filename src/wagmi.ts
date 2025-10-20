import { createConfig } from 'wagmi';
import { http } from 'viem';
import { mainnet, bsc, polygon, arbitrum, optimism, avalanche, fantom } from 'viem/chains';
import { apillonConnector } from "./ApilionConnector"
export const chains = [mainnet, bsc, polygon] as const;

export const config = createConfig({
    chains,
    transports: {
        [mainnet.id]: http('https://ethereum.publicnode.com'),
        [bsc.id]: http('https://bsc.publicnode.com'),
        [polygon.id]: http('https://polygon.llamarpc.com'),
    },
    connectors: [apillonConnector()]
});
