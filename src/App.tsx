"use client";

import "./App.css";
import diora from "./assets/diora.png";
import { EmbeddedWallet } from "@apillon/wallet-react";

function App() {
  return (
    <div className="App">
      <div className="login-container">
        <div className="login-card">
          <div className="logo">
            <img src={diora} alt="Diora" />
          </div>

          <EmbeddedWallet
            clientId={import.meta.env.VITE_APOLIOS_KEY}
            defaultNetworkId={1287}
            networks={[
              {
                name: "Moonbase Testnet",
                id: 1287,
                rpcUrl: "https://rpc.testnet.moonbeam.network",
                explorerUrl: "https://moonbase.moonscan.io",
              },
              /* ... */
            ]}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
