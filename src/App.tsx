"use client";

import "./App.css";
import { ChainId, WidgetConfig } from "@lifi/widget";

import WalletButtonRedirect from "./utils";

import { EmbeddedWallet as EmbeddedWalletType } from "@apillon/wallet-sdk";
import { useWallet, useAccount } from "@apillon/wallet-react";
import { ethers } from "ethers";
import { useEffect, useMemo, useState } from "react";
import { TOKENS_LIST } from "./constants";
import { useConnect } from "wagmi";
import { apillonConnector } from "./ApilionConnector";
import { useAccount as useAccountWagmi } from "wagmi";
import { WalletHeader } from "./components/WalletHeader";
import { ConnectedSummary } from "./components/ConnectedSummary";
import { WalletEmbed } from "./components/WalletEmbed";
import { SwapModal } from "./components/SwapModal";
import { addTokensToWallet, loadNFTs } from "./lib/tokenManager";
import { useAllowedChainId } from "./hooks/useAllowedChainId";
function App() {
  const { info, getBalance } = useAccount();
  const { connect } = useConnect();
  const { address, chain } = useAccountWagmi();
  const { wallet } = useWallet();
  const [chainId, setChainId] = useState<string>("0x38");
  const [showWalletModal, setShowWalletModal] = useState<boolean>(false);
  const [showSwapModal, setShowSwapModal] = useState<boolean>(false);
  const isConnected =
    !!(info as any)?.address || !!(info as any)?.accountAddress || !!wallet;
  // Derived connection data
  const [account, setAccount] = useState<string | null>(null);
  const [nativeBalance, setNativeBalance] = useState<string | null>(null);
  useEffect(() => {
    let mounted = true;
    async function syncFromApillon() {
      try {
        // Address
        const addr =
          (info as any)?.activeWallet?.address ||
          (info as any)?.address ||
          null;
        if (!mounted) return;
        setAccount(addr);
        // Balance
        const bal: any = await getBalance();
        if (!mounted) return;
        let display: string | null = null;
        if (bal == null) display = null;
        else if (typeof bal === "string" || typeof bal === "number")
          display = String(bal);
        else if (typeof bal === "object") {
          if (bal.formatted) display = String(bal.formatted);
          else if (bal.native?.formatted)
            display = String(bal.native.formatted);
          else if (bal.value) {
            const v =
              typeof bal.value === "string"
                ? bal.value
                : bal.value.toString?.() ?? bal.value;
            try {
              display = ethers.utils.formatEther(v);
            } catch {
              display = String(v);
            }
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
    return () => {
      mounted = false;
    };
  }, [info, chainId, getBalance]);

  const allowedChainId = useAllowedChainId(chainId, 56);
  console.log("LIFI key = ", import.meta.env.VITE_LIFI_API_KEY);
  const widgetConfig: WidgetConfig = useMemo(() => {
    return {
      feeConfig: {
        fee: 0.002,
        showFeePercentage: true,
        showFeeTooltip: true,
      },
      sdkConfig: {
        [ChainId.BSC]: ["https://bsc-rpc.publicnode.com/"],
      },
      apiKey: import.meta.env.VITE_LIFI_API_KEY,
      integrator: "DiamondWallet",
      chains: {
        allow: [allowedChainId],
      },
      theme: {
        container: {
          border: "1px solid rgb(234, 234, 234)",
          borderRadius: "16px",
        },
      },
    } as WidgetConfig;
  }, [allowedChainId]);
  // loadNFTs moved to lib/tokenManager

  useEffect(() => {
    console.log("info = ", info);
    if (wallet && wallet.events) {
      connect({ connector: apillonConnector() });
      wallet.events.on("chainChanged", (chainIdObj) => {
        setChainId(chainIdObj.chainId);
      });
      // Convert chainId to decimal if it's a hex string
      let currentChainId: any = chainId;
      if (typeof chainId === "string" && chainId.startsWith("0x")) {
        currentChainId = parseInt(chainId, 16);
      }
      addTokensToWallet(wallet, TOKENS_LIST, currentChainId as number);

      // Only load NFTs if on BNB chain
      if (currentChainId === 56) {
        loadNFTs(wallet as any);
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
  const walletRootRef = (globalThis as any)._apillonWalletRootRef || {
    current: null,
  };
  (globalThis as any)._apillonWalletRootRef = walletRootRef; // persist across re-renders

  useEffect(() => {
    if (typeof document === "undefined") return;

    const target = document.body;
    if (!target) return;

    let trackedButton: HTMLButtonElement | null = null;

    const handleWalletButtonClick = () => {
      setShowWalletModal(!showWalletModal);
    };

    const attachListener = () => {
      const button = document.querySelector<HTMLButtonElement>(
        ".oaw-wallet-widget-btn"
      );

      if (button && button !== trackedButton) {
        trackedButton?.removeEventListener("click", handleWalletButtonClick);
        trackedButton = button;
        trackedButton.addEventListener("click", handleWalletButtonClick);
      }
    };

    attachListener();

    const observer = new MutationObserver(attachListener);
    observer.observe(target, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      trackedButton?.removeEventListener("click", handleWalletButtonClick);
    };
  }, [setShowWalletModal]);

  return (
    <div className="App">
      {/* Wallet Button Redirect - only render when we have user data */}
      {info?.username && address && chain?.id && (
        <WalletButtonRedirect
          email={info.username}
          chainId={chain.id}
          wallet={address}
          walletOpen={showWalletModal}
          onOpenSwapModal={() => setShowSwapModal(true)}
        />
      )}
      <SendTransaction></SendTransaction>
      {!showWalletModal && !showSwapModal && (
        <div className="actions-container">
          <WalletHeader />
          <p className="actions-subtitle">
            Manage your assets & swap seamlessly
          </p>

          {/* Connected summary */}
          <ConnectedSummary balance={nativeBalance} address={account} />

          <div className="actions-buttons">
            <WalletEmbed
              containerRef={(el) => (walletRootRef.current = el)}
              clientId={import.meta.env.VITE_APOLIOS_KEY}
              defaultNetworkId={56}
            />
            <button
              className="gold-btn secondary"
              onClick={() =>
                isConnected ? setShowSwapModal(true) : setShowWalletModal(true)
              }
            >
              Swap Assets
            </button>
          </div>
        </div>
      )}

      <SwapModal
        open={!!(isConnected && showSwapModal)}
        onClose={() => setShowSwapModal(false)}
        allowedChainId={allowedChainId}
        widgetConfig={widgetConfig}
      />
    </div>
  );
}

export default App;
