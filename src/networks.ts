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
    rpcUrl: "https://bsc-rpc.publicnode.com",
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

];
