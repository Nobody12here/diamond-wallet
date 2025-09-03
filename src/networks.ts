import { Network } from "@apillon/wallet-sdk";

export const networks: Network[] = [
  {
    name: "Moonbase Testnet",
    id: 1287,
    rpcUrl: "https://rpc.testnet.moonbeam.network",
    explorerUrl: "https://moonbase.moonscan.io",
  },
  {
    name: "Ethereum Mainnet",
    id: 1,
    currencySymbol:"ETH",
    imageUrl:"https://icons.llamao.fi/icons/chains/rsz_ethereum.jpg",
    rpcUrl: "https://eth.llamarpc.com",
    explorerUrl: "https://etherscan.io",
  },
  {
    name: "BNB Smart Chain Mainnet",
    id: 56,
    currencySymbol: "BNB",
    rpcUrl: "https://binance.llamarpc.com",
    explorerUrl: "https://bscscan.com",
    imageUrl:"https://icons.llamao.fi/icons/chains/rsz_binance.jpg"
  },
  {
    name: "Polygon Mainnet",
    id: 137,
    currencySymbol:"POL",
    rpcUrl: "https://polygon-mainnet.g.alchemy.com/v2/demo",
    explorerUrl: "https://polygonscan.com",
  },
  {
    name: "Arbitrum One",
    id: 42161,
    rpcUrl: "https://arb1.arbitrum.io/rpc",
    explorerUrl: "https://arbiscan.io",
  },
  {
    name: "Optimism",
    id: 10,
    rpcUrl: "https://mainnet.optimism.io",
    explorerUrl: "https://optimistic.etherscan.io",
  },
  {
    name: "Avalanche C-Chain",
    id: 43114,
    rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
    explorerUrl: "https://snowtrace.io",
  },
  {
    name: "Fantom Opera",
    id: 250,
    rpcUrl: "https://rpc.ftm.tools",
    explorerUrl: "https://ftmscan.com",
  },
];
