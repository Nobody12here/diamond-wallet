"use client";

import "./App.css";
import { LiFiWidget, WidgetConfig } from '@lifi/widget';

import diora from "./assets/diora.png";
import { EmbeddedWallet as EmbeddedWalletType, getProvider } from "@apillon/wallet-sdk";
import { EmbeddedEthersSigner } from "@apillon/wallet-sdk";
import { useWallet, useAccount, EmbeddedWallet } from "@apillon/wallet-react";
import { ethers } from "ethers";
import { useEffect, useMemo, useState } from "react";
import { getUserNFTTokenIds } from "./nftUtils";
import { NFT_ABI, NFT_CONTRACT_ADDRESS, TOKENS_LIST, token } from "./constants";
import { Contract } from "ethers";
import { useConnect } from "wagmi";
import { apillonConnector } from "./ApilionConnector";
import { networks } from "./networks";
import { useAccount as useAccountWagmi } from "wagmi";
function App() {
  const { info, getBalance } = useAccount();
  const {connect} = useConnect();
  const { address, chain } = useAccountWagmi();
  console.log("wagmi address = ", address, " wagmi chain = ", chain)
  const { wallet } = useWallet();
  const [chainId, setChainId] = useState<string>("0x38");
  const [showWalletModal, setShowWalletModal] = useState<boolean>(true);
  const [showSwapModal, setShowSwapModal] = useState<boolean>(false);
  const isConnected = !!(info as any)?.address || !!(info as any)?.accountAddress || !!wallet;

  // Derived connection data
  const [account, setAccount] = useState<string | null>(null);
  const [nativeBalance, setNativeBalance] = useState<string | null>(null);
  const [connectedChainName, setConnectedChainName] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function syncFromApillon() {
      try {
        // Address
        const addr = (info as any)?.activeWallet?.address || (info as any)?.address || null;
        if (!mounted) return;
        setAccount(addr);

        // ChainId -> name
        const rawChainId: any = (info as any)?.activeWallet?.chainId ?? chainId;
        let numId: number | null = null;
        if (typeof rawChainId === 'number') numId = rawChainId;
        else if (typeof rawChainId === 'string') {
          numId = rawChainId.startsWith('0x') ? parseInt(rawChainId, 16) : parseInt(rawChainId, 10);
        }
        if (numId != null) {
          const net = (networks as any[]).find(n => n.id === numId);
          setConnectedChainName(net?.name || `Chain ${numId}`);
        }

        // Balance
        const bal: any = await getBalance();
        if (!mounted) return;
        let display: string | null = null;
        if (bal == null) display = null;
        else if (typeof bal === 'string' || typeof bal === 'number') display = String(bal);
        else if (typeof bal === 'object') {
          if (bal.formatted) display = String(bal.formatted);
          else if (bal.native?.formatted) display = String(bal.native.formatted);
          else if (bal.value) {
            const v = typeof bal.value === 'string' ? bal.value : (bal.value.toString?.() ?? bal.value);
            try { display = ethers.utils.formatEther(v); } catch { display = String(v); }
          } else if (bal.balance) display = String(bal.balance);
        }
        if (display != null) {
          const num = Number(display);
          setNativeBalance(isNaN(num) ? display : num.toFixed(4));
        }
      } catch {
        // ignore
      }
    }
    syncFromApillon();
    return () => { mounted = false; };
  }, [info, chainId, getBalance]);

  function shortAddr(addr?: string | null) {
    if (!addr) return "";
    return addr.slice(0, 6) + "..." + addr.slice(-4);
  }

  function addTokensToWallet(wallet: EmbeddedWalletType, tokens: token, currentChainId: number) {
    if (wallet && wallet.events) {
      tokens.forEach((token) => {
        if (token.chainId === currentChainId) {
          wallet.events.emit("addToken", token);
        }
      });
    }
  }
  const widgetConfig: any = useMemo(() => {
    return {
      apiKey: (import.meta as any).env?.LIFI_API_KEY,
      integrator: "Opensea",

      theme: {
        container: {
          border: '1px solid rgb(234, 234, 234)',
          borderRadius: '16px',
        },
      },
    };
  }, []);
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
        connect({connector:apillonConnector()})
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
  // One-click Open Wallet: trigger internal button
  const walletRootRef = (globalThis as any)._apillonWalletRootRef || { current: null };
  (globalThis as any)._apillonWalletRootRef = walletRootRef; // persist across re-renders

  function handleOpenWalletClick() {
    // If modal is hidden, show it first
    setShowWalletModal(true);
    // next tick: click inner open button
    setTimeout(() => {
      try {
        const root: HTMLElement | null = walletRootRef.current || document.body;
        // Look for a stable button inside the widget that opens the wallet UI
        const btn = root?.querySelector(
          '.oaw-button, button.oaw-btn-default-style, button:where([data-testid="open-wallet"],[aria-label="Open wallet"])'
        ) as HTMLButtonElement | null;
        btn?.click();
      } catch { }
    }, 50);
  }
  return (
    <div className="App">
      {/* Action area shown after user connects */}
      {isConnected && !showWalletModal && !showSwapModal && (
        <div className="actions-container">
          <h2 className="actions-title">Diamond Wallet</h2>
          <p className="actions-subtitle">Manage your assets & swap seamlessly</p>

          {/* Connected summary */}
          <div className="connected-summary">
            <div className="pill"><span className="dot" /> {connectedChainName || '—'}</div>
            <div className="pill">Balance: {nativeBalance ?? '—'}</div>
            <div className="pill">{shortAddr(account)}</div>
          </div>

          <div className="actions-buttons">
            <button className="gold-btn" onClick={() => handleOpenWalletClick()}>Open Wallet</button>
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
              <div ref={(el) => (walletRootRef.current = el)}>
                <EmbeddedWallet
                  passkeyAuthMode="popup"
                  clientId={import.meta.env.VITE_APOLIOS_KEY}
                  defaultNetworkId={56}
                  networks={networks}
                />
              </div>
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

            <LiFiWidget integrator="Diamond Wallet" config={widgetConfig} />

          </div>
        </div>
      )}
    </div>
  );
}

export default App;
