"use client";

import "./App.css";
import diora from "./assets/diora.png";
import { useWallet, useAccount } from "@apillon/wallet-react";
import { EmbeddedWallet } from "@apillon/wallet-react";
import { networks } from "./networks";
import { useEffect } from "react";

function App() {
  const { info } = useAccount();
  const { wallet } = useWallet();
  useEffect(() => {
    if (wallet && wallet.events) {
      console.log(wallet)
      wallet.events.emit("addToken", {
        address: "0x55d398326f99059ff775485246999027b3197955",
        name: "BUSDT",
        symbol: "BUSDT",
        decimals: 18,
        imageUrl: "https://bscscan.com/token/images/busdt_32.png",
        chainId: 56,
      });
    }
  }, [wallet.events]);
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
