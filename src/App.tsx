"use client";

import "./App.css";
import diora from "./assets/diora.png";
import { useWallet, useAccount } from "@apillon/wallet-react";
import { EmbeddedWallet } from "@apillon/wallet-react";
import { networks } from "./networks";
import { useEffect, useState } from "react";
import { getUserNFTTokenIds } from "./nftUtils"
import { NFT_CONTRACT_ADDRESS } from "./constants";
function App() {
  const { info } = useAccount();
  const { wallet } = useWallet();
  const [chainId, setChainId] = useState<string>("");
  async function loadNFTs() {
    const tokenIds:number[] = await getUserNFTTokenIds();
    for(var i=0;i<tokenIds.length;i+=1){
      wallet.events.emit("addTokenNft",{
        address:NFT_CONTRACT_ADDRESS,
        tokenId:tokenIds[i],
        name:"DCNFP",
        chainId:56
      })
    }
   }
  useEffect(() => {
    if (wallet && wallet.events) {
      wallet.events.on("chainChanged", (chainId) => {
        setChainId(chainId.chainId);
      });
      console.log("Chain id = ", chainId)
      if (chainId == "0x38") {
        loadNFTs()
        wallet.events.emit("addToken", {
          address: "0xbfa362937BFD11eC22a023aBF83B6dF4E5E303d4",
          name: "Diamond Token",
          symbol: "DIT",
          decimals: 18,
          imageUrl: "",
          chainId: 56,
        });
       
      }
    }
  }, [info, chainId]);
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
