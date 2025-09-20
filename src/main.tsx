import "./index.css";

import ReactDOM from "react-dom/client";


import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { config } from "./wagmi";

import App from "./App";

const queryClient = new QueryClient();
const originalFetch = window.fetch;
window.fetch = async (url, options) => {
    if (typeof url === "string" && url.startsWith("ipfs://")) {
        url = url.replace("ipfs://", "https://ipfs.io/ipfs/");
    }
    return originalFetch(url, options);
};
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
            <App />
        </QueryClientProvider>
    </WagmiProvider>
);
