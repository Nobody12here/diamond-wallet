"use client";

import "./App.css";
import { LiFiWidget, WidgetConfig } from '@lifi/widget';

import diora from "./assets/diora.png";
import { EmbeddedWallet as EmbeddedWalletType } from "@apillon/wallet-sdk";
import { EmbeddedEthersSigner } from "@apillon/wallet-sdk";
import { TOKEN_LIST } from "./tokenList";
import { useWallet, useAccount, EmbeddedWallet } from "@apillon/wallet-react";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { getUserNFTTokenIds } from "./nftUtils";
import { NFT_ABI, NFT_CONTRACT_ADDRESS, TOKENS_LIST, token } from "./constants";
import { Contract } from "ethers";
import { networks } from "./networks";
function App() {
  const { info } = useAccount();
  const { wallet } = useWallet();
  const [chainId, setChainId] = useState<string>("0x38");
  const [showWalletModal, setShowWalletModal] = useState<boolean>(true);
  const [showSwapModal, setShowSwapModal] = useState<boolean>(false);

  const isConnected = !!(info as any)?.address || !!(info as any)?.accountAddress || !!wallet;

  function addTokensToWallet(wallet: EmbeddedWalletType, tokens: token, currentChainId: number) {
    if (wallet && wallet.events) {
      tokens.forEach((token) => {
        if (token.chainId === currentChainId) {
          wallet.events.emit("addToken", token);
        }
      });
    }
  }
  const widgetConfig: WidgetConfig = {
    apiKey: import.meta.env.LIFI_API_KEY,
    integrator: "Opensea",
    theme: {
      container: {
        border: '1px solid rgb(234, 234, 234)',
        borderRadius: '16px',
      },
    },
  };
  async function loadNFTs() {
    const signer = new EmbeddedEthersSigner();
    const NFT_contract = new Contract(
      NFT_CONTRACT_ADDRESS,
      NFT_ABI,
      signer as any
    );

    // Get the user's NFT token IDs
    const tokenIds: number[] = await getUserNFTTokenIds();
    for (const tokenId of tokenIds) {
      // Fetch the token URI from the contract
      const uri: string = await NFT_contract.tokenURI(tokenId);
      const ipfsHash = uri.split("//")[1];
      const metadataResp = await fetch(
        `https://gateway.pinata.cloud/ipfs/${ipfsHash}`
      );
      const metadata = await metadataResp.json();
      const imageHash = metadata.image.split("//")[1];
      const imageUrl = `https://gateway.pinata.cloud/ipfs/${imageHash}`;

      wallet.events.emit("addTokenNft", {
        address: NFT_CONTRACT_ADDRESS,
        tokenId: Number(tokenId),
        chainId: 56,
        imageUrl,
      });
    }
  }
  useEffect(() => {
    //@ts-ignore
    window.Browser = {
      T: (msg: string) => { msg }
    }
  }, [])
  useEffect(() => {
    if (wallet && wallet.events) {
      wallet.events.on("chainChanged", (chainIdObj) => {
        setChainId(chainIdObj.chainId);
      });
      // Convert chainId to decimal if it's a hex string
      let currentChainId: any = chainId;
      if (typeof chainId === "string" && chainId.startsWith("0x")) {
        currentChainId = parseInt(chainId, 16);
      }
      addTokensToWallet(wallet, TOKENS_LIST, currentChainId);

      // Only load NFTs if on BNB chain
      if (currentChainId === 56) {
        loadNFTs();
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
  }, [info, chainId, wallet]);
  const provider = new ethers.providers.JsonRpcProvider("https://mainnet.infura.io/v3/ab8035e5b3264a99a067469db85f9c83")
  return (
    <div className="App">
      {/* Action area shown after user connects */}
      {isConnected && !showWalletModal && !showSwapModal && (
        <div className="actions-container">
          <h2 className="actions-title">Diamond Wallet</h2>
          <p className="actions-subtitle">Manage your assets & swap seamlessly</p>
          <div className="actions-buttons">
            <button className="gold-btn" onClick={() => setShowWalletModal(true)}>Open Wallet</button>
            <button className="gold-btn secondary" onClick={() => setShowSwapModal(true)}>Swap Assets</button>
          </div>
        </div>
      )}

      {/* Wallet Modal (shown initially for sign in) */}
      {(showWalletModal || !isConnected) && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3>{isConnected ? 'Your Wallet' : 'Connect Your Wallet'}</h3>
              {isConnected && (
                <button className="close-btn" onClick={() => setShowWalletModal(false)} aria-label="Close Wallet">×</button>
              )}
            </div>
            <div className="modal-body">
              <div className="logo">
                <img src={diora} alt="Diora" />
              </div>
              <EmbeddedWallet
                passkeyAuthMode="popup"
                clientId={import.meta.env.VITE_APOLIOS_KEY}
                defaultNetworkId={56}
                networks={networks}
              />
            </div>
            {isConnected && (
              <div className="modal-footer">
                <button className="gold-btn full" onClick={() => setShowWalletModal(false)}>Close</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Swap Widget Modal */}
      {isConnected && showSwapModal && (
        <div className="modal-overlay">
          <div className="modal-box large">
            <div className="modal-header">
              <h3>Swap Assets</h3>
              <button className="close-btn" onClick={() => setShowSwapModal(false)} aria-label="Close Swap">×</button>
            </div>
            <div className="modal-body">
              <LiFiWidget integrator="Diamond Wallet" config={widgetConfig} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
