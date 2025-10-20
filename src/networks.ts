import { Network } from "@apillon/wallet-sdk";

export const networks: Network[] = [
  {
    name: "Ethereum Mainnet",
    id: 1,
    currencySymbol: "ETH",
    imageUrl: "https://icons.llamao.fi/icons/chains/rsz_ethereum.jpg",
    rpcUrl: "https://eth.llamarpc.com",
    explorerUrl: "https://etherscan.io",
  },
  {
    name: "XRPL EVM",
    currencySymbol: "XRP",
    rpcUrl: "https://rpc.xrplevm.org",
    id: "1440000",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/f/fb/XRP_Ledger_logo.jpg",
    explorerUrl: ""
  },
  {
    name: "BNB Smart Chain Mainnet",
    id: 56,
    currencySymbol: "BNB",
    rpcUrl: "https://bsc-rpc.publicnode.com/",
    explorerUrl: "https://bscscan.com",
    imageUrl: "https://icons.llamao.fi/icons/chains/rsz_binance.jpg"
  },
  {
    name: "Polygon Mainnet",
    id: 137,
    currencySymbol: "POL",
    rpcUrl: "https://rpc.poolz.finance/polygon",
    explorerUrl: "https://polygonscan.com",
    imageUrl:"https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Polygon_Icon.svg/800px-Polygon_Icon.svg.png"
  },
  {
    name: "Arbitrum One",
    id: 42161,
    currencySymbol: "ETH",
    rpcUrl: "https://arb1.arbitrum.io/rpc",
    explorerUrl: "https://arbiscan.io",
    imageUrl: "https://icons.llamao.fi/icons/chains/rsz_arbitrum.jpg"
  },
  {
    name: "Optimism Mainnet",
    id: 10,
    currencySymbol: "ETH",
    rpcUrl: "https://mainnet.optimism.io",
    explorerUrl: "https://optimistic.etherscan.io",
    imageUrl: "https://icons.llamao.fi/icons/chains/rsz_optimism.jpg"
  },
  {
    name: "Avalanche C-Chain",
    id: 43114,
    currencySymbol: "AVAX",
    rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
    explorerUrl: "https://snowtrace.io",
    imageUrl: "https://icons.llamao.fi/icons/chains/rsz_avalanche.jpg"
  },
  {
    name: "Base Mainnet",
    id: 8453,
    currencySymbol: "ETH",
    rpcUrl: "https://mainnet.base.org",
    explorerUrl: "https://basescan.org",
    imageUrl: "https://icons.llamao.fi/icons/chains/rsz_base.jpg"
  },
  {
    name: "Fantom Opera",
    id: 250,
    currencySymbol: "FTM",
    rpcUrl: "https://rpc.ftm.tools",
    explorerUrl: "https://ftmscan.com",
    imageUrl: "https://icons.llamao.fi/icons/chains/rsz_fantom.jpg"
  },
  {
    name: "Sei Network",
    id: 1329,
    currencySymbol: "SEI",
    rpcUrl: "https://evm-rpc.sei-apis.com",
    explorerUrl: "https://seitrace.com",
    imageUrl: "https://assets.coingecko.com/coins/images/28205/large/Sei_Logo_-_Transparent.png"
  },
  {
    name: "Cronos Mainnet",
    id: 25,
    currencySymbol: "CRO",
    rpcUrl: "https://evm.cronos.org",
    explorerUrl: "https://cronoscan.com",
    imageUrl: "https://icons.llamao.fi/icons/chains/rsz_cronos.jpg"
  },
  {
    name: "Moonbeam",
    id: 1284,
    currencySymbol: "GLMR",
    rpcUrl: "https://rpc.api.moonbeam.network",
    explorerUrl: "https://moonscan.io",
    imageUrl: "https://icons.llamao.fi/icons/chains/rsz_moonbeam.jpg"
  },
  {
    name: "Celo Mainnet",
    id: 42220,
    currencySymbol: "CELO",
    rpcUrl: "https://forno.celo.org",
    explorerUrl: "https://celoscan.io",
    imageUrl: "https://icons.llamao.fi/icons/chains/rsz_celo.jpg"
  },
  {
    name: "Gnosis Chain",
    id: 100,
    currencySymbol: "xDAI",
    rpcUrl: "https://rpc.gnosischain.com",
    explorerUrl: "https://gnosisscan.io",
    imageUrl: "https://icons.llamao.fi/icons/chains/rsz_gnosis.jpg"
  },
  {
    name: "Mantle Network",
    id: 5000,
    currencySymbol: "MNT",
    rpcUrl: "https://rpc.mantle.xyz",
    explorerUrl: "https://explorer.mantle.xyz",
    imageUrl: "https://icons.llamao.fi/icons/chains/rsz_mantle.jpg"
  },
  {
    name: "Linea Mainnet",
    id: 59144,
    currencySymbol: "ETH",
    rpcUrl: "https://rpc.linea.build",
    explorerUrl: "https://lineascan.build",
    imageUrl: "https://icons.llamao.fi/icons/chains/rsz_linea.jpg"
  },
  {
    name: "Scroll Mainnet",
    id: 534352,
    currencySymbol: "ETH",
    rpcUrl: "https://rpc.scroll.io",
    explorerUrl: "https://scrollscan.com",
    imageUrl: "https://icons.llamao.fi/icons/chains/rsz_scroll.jpg"
  },
  {
    name: "Blast Mainnet",
    id: 81457,
    currencySymbol: "ETH",
    rpcUrl: "https://rpc.blast.io",
    explorerUrl: "https://blastscan.io",
    imageUrl: "https://icons.llamao.fi/icons/chains/rsz_blast.jpg"
  },

];
