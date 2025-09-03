"use client";

import "./App.css";
import diora from "./assets/diora.png";
import { EmbeddedWallet } from "@apillon/wallet-react";
import { networks } from "./networks";

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
            defaultNetworkId={56}
            networks={networks}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
