import { useEffect } from "react";
import { WalletButtonRedirectProps } from "./types";

// Chain ID to network symbol mapping
function getNetworkSymbol(chainId: number): string {
  const chainSymbols: Record<number, string> = {
    1: "eth",        // Ethereum Mainnet
    56: "bep",       // BNB Smart Chain
    137: "matic",    // Polygon
    42161: "arb",    // Arbitrum One
    10: "op",        // Optimism
    43114: "avax",   // Avalanche C-Chain
    250: "ftm",      // Fantom
    1440000: "xrp",  // XRPL EVM (from your networks.ts)
    // Add more chains as needed
  };
  
  return chainSymbols[chainId] || "unknown";
}
function WalletButtonRedirect(props: WalletButtonRedirectProps) {
    useEffect(() => {
        // Don't start observing if we don't have the required data yet
        if (!props.email || !props.wallet || !props.chainId) {
            return;
        }

        const networkSymbol = getNetworkSymbol(props.chainId);

        let isAttached = false;
        const observer = new MutationObserver(() => {
            // Find the button by text content
            const buttons = Array.from(document.querySelectorAll("button"));
            const buyBtn = buttons.find((btn) =>
                btn.textContent?.trim() === "Buy"
            );

            if (buyBtn && !isAttached) {
                if (buyBtn.disabled) {
                    buyBtn.removeAttribute("disabled");
                    buyBtn.classList.remove("opacity-60", "grayscale"); // Apillon uses Tailwind styles for "disabled" look
                }
                
                // Remove any existing click handlers to avoid duplicates
                const newBtn = buyBtn.cloneNode(true) as HTMLButtonElement;
                buyBtn.parentNode?.replaceChild(newBtn, buyBtn);
                
                newBtn.addEventListener("click", () => {
                    window.location.href = `https://pay.incoin.ai/diora?email=${props.email}&wallet=${props.wallet}&network=${networkSymbol}`;
                });
                
                isAttached = true;
                observer.disconnect(); // stop observing once attached
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
            observer.disconnect();
            isAttached = false;
        };
    }, [props.email, props.wallet, props.chainId]); // Re-run when any prop changes

    return null;
}

export default WalletButtonRedirect;
