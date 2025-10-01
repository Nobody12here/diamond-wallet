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
    8453: "base",    // Base Mainnet
    250: "ftm",      // Fantom Opera
    1329: "sei",     // Sei Network
    25: "cro",       // Cronos Mainnet
    1284: "glmr",    // Moonbeam
    42220: "celo",   // Celo Mainnet
    100: "xdai",     // Gnosis Chain
    5000: "mnt",     // Mantle Network
    59144: "linea",  // Linea Mainnet
    534352: "scroll", // Scroll Mainnet
    81457: "blast",  // Blast Mainnet
    1440000: "xrp",  // XRPL EVM
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
                // Handle the existing Buy button
                if (buyBtn.disabled) {
                    buyBtn.removeAttribute("disabled");
                    buyBtn.classList.remove("opacity-60", "grayscale");
                }
                
                // Remove any existing click handlers to avoid duplicates
                const newBuyBtn = buyBtn.cloneNode(true) as HTMLButtonElement;
                buyBtn.parentNode?.replaceChild(newBuyBtn, buyBtn);
                
                newBuyBtn.addEventListener("click", () => {
                    window.location.href = `https://pay.incoin.ai/diora?email=${props.email}&wallet=${props.wallet}&network=${networkSymbol}`;
                });

                // Create and add the new button beside the Buy button
                const swapBtn = document.createElement("button");
                swapBtn.textContent = "Swap";
                
                // Copy all classes from the Buy button to maintain consistent styling
                swapBtn.className = newBuyBtn.className;
                
                // Add custom styling if needed (optional)
                swapBtn.style.marginLeft = "2px"; // Add some spacing between buttons
                
                // Add click handler for the Swap button
                swapBtn.addEventListener("click", () => {
                    // First, try to close the wallet modal
                    const closeWalletModal = () => {
                        // Method 1: Look for close button (X) in the wallet modal
                        const closeButtons = Array.from(document.querySelectorAll("button"));
                        const walletCloseBtn = closeButtons.find((btn) => 
                            btn.textContent?.trim() === "×" || 
                            btn.getAttribute("aria-label")?.includes("close") ||
                            btn.innerHTML?.includes("×") ||
                            btn.classList.contains("close") ||
                            btn.querySelector("svg")?.innerHTML?.includes("path") // SVG close icons
                        );
                        
                        if (walletCloseBtn) {
                            walletCloseBtn.click();
                        } else {
                            // Method 2: Press Escape key to close modal
                            document.dispatchEvent(new KeyboardEvent('keydown', {
                                key: 'Escape',
                                code: 'Escape',
                                keyCode: 27,
                                which: 27,
                                bubbles: true
                            }));
                        }
                    };

                    // Close wallet modal first
                    closeWalletModal();
                    
                    // Then open swap modal with a small delay to ensure wallet modal is closed
                    setTimeout(() => {
                        if (props.onOpenSwapModal) {
                            props.onOpenSwapModal();
                        }
                    }, 100);
                });

                // Insert the Swap button right after the Buy button
                newBuyBtn.parentNode?.insertBefore(swapBtn, newBuyBtn.nextSibling);
                
                isAttached = true;
                observer.disconnect(); // stop observing once attached
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
            observer.disconnect();
            isAttached = false;
        };
    }, [props.email, props.wallet, props.chainId, props.onOpenSwapModal]); // Re-run when any prop changes

    return null;
}

export default WalletButtonRedirect;