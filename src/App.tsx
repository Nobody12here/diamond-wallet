"use client";

import "./App.css";
import { LiFiWidget, WidgetConfig } from '@lifi/widget';

import diora from "./assets/diora.png";
import WalletButtonRedirect from "./utils";

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
  const { connect } = useConnect();
  const { address, chain } = useAccountWagmi();
  const { wallet } = useWallet();
  const [chainId, setChainId] = useState<string>("0x38");
  const [showWalletModal, setShowWalletModal] = useState<boolean>(false);
  const [showSwapModal, setShowSwapModal] = useState<boolean>(false);
  const isConnected = !!(info as any)?.address || !!(info as any)?.accountAddress || !!wallet;
  // Derived connection data
  const [account, setAccount] = useState<string | null>(null);
  const [nativeBalance, setNativeBalance] = useState<string | null>(null);
  useEffect(() => {
    let mounted = true;
    async function syncFromApillon() {
      try {
        // Address
        const addr = (info as any)?.activeWallet?.address || (info as any)?.address || null;
        if (!mounted) return;
        setAccount(addr)
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
  // Normalize chainId (can be hex string like "0x38", decimal string like "56", or number)
  const allowedChainId = useMemo(() => {
    if (typeof chainId === 'number') return chainId;
    if (typeof chainId === 'string') {
      if (chainId.startsWith('0x')) return parseInt(chainId, 16);
      const n = Number(chainId);
      return Number.isFinite(n) ? n : 56; // fallback to BNB (56)
    }
    return 56;
  }, [chainId]);
  
  const widgetConfig: WidgetConfig = useMemo(() => {
    return {
      apiKey: (import.meta as any).env?.LIFI_API_KEY,
      integrator: "Opensea",
      chains: {
        allow: [allowedChainId],
      },
      theme: {
        container: {
          border: '1px solid rgb(234, 234, 234)',
          borderRadius: '16px',
        },
      },
    } as WidgetConfig;
  }, [allowedChainId]);
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
    console.log("info = ",info)
    if (wallet && wallet.events) {
      wallet.events.on("chainChanged", (chainIdObj) => {
        connect({ connector: apillonConnector() })
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

  return (
    <div className="App">
      {/* Wallet Button Redirect - only render when we have user data */}
      {info?.username && address && chain?.id && (
        <WalletButtonRedirect 
          email={info.username} 
          chainId={chain.id}
          wallet={address} 
        />
      )}

      {!showWalletModal && !showSwapModal && (
        <div className="actions-container">
          <div className="actions-header">
            <div className="logo">
              <img src={diora} alt="Diora" />
            </div>
            <h2 className="actions-title">DIORA Wallet</h2>
          </div>
          <p className="actions-subtitle">Manage your assets & swap seamlessly</p>

          {/* Connected summary */}
          <div className="connected-summary">
            {isConnected ? (
              <>
                <div className="pill">Balance: {nativeBalance ?? '—'}</div>
                <div className="pill">{shortAddr(account)}</div>
              </>
            ) : (
              <div className="pill">Wallet not connected</div>
            )}
          </div>

          <div className="actions-buttons">
            <div ref={(el) => (walletRootRef.current = el)}>
              <EmbeddedWallet
                passkeyAuthMode="popup"
                clientId={import.meta.env.VITE_APOLIOS_KEY}
                defaultNetworkId={56}
                networks={networks}
              />
            </div>
            <button className="gold-btn secondary" onClick={() => (isConnected ? setShowSwapModal(true) : setShowWalletModal(true))}>Swap Assets</button>
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

            {/* Key forces remount so the widget picks up updated chain allow-list */}
            <LiFiWidget key={`lifi-${allowedChainId}`} integrator="Diamond Wallet" config={widgetConfig} />

          </div>
        </div>
      )}
    </div>
  );
}

export default App;
