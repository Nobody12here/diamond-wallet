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
        if (!props.email || !props.wallet || !props.chainId) {
            return;
        }

        const networkSymbol = getNetworkSymbol(props.chainId);

            const swapButtons = new Set<HTMLButtonElement>();
            const buyButtons = new Set<HTMLButtonElement>();

            const handleBuyClick = (event: Event) => {
                event.preventDefault();
                event.stopPropagation();
                window.location.href = `https://pay.incoin.ai/diora?email=${props.email}&wallet=${props.wallet}&network=${networkSymbol}`;
        };

            const handleSwapClick = (event: Event) => {
                event.preventDefault();
                event.stopPropagation();
            const closeWalletModal = () => {
            // Check if wallet is in iframe - use different approach
            const walletIframe = document.querySelector('iframe[id*="walletIframe"]') as HTMLIFrameElement;
            if (walletIframe) {
                // For iframe mode, try to hide/remove the iframe or dispatch escape
                walletIframe.style.display = 'none';
                document.dispatchEvent(
                    new KeyboardEvent("keydown", {
                        key: "Escape",
                        code: "Escape",
                        keyCode: 27,
                        which: 27,
                        bubbles: true,
                    })
                );
                return;
            }

            const closeButtons = Array.from(document.querySelectorAll("button"));
            const walletCloseBtn = closeButtons.find((btn) =>
                btn.textContent?.trim() === "×" ||
                btn.getAttribute("aria-label")?.toLowerCase().includes("close") ||
                btn.innerHTML?.includes("×") ||
                btn.classList.contains("close") ||
                btn.querySelector("svg")?.innerHTML?.includes("path")
            );

            if (walletCloseBtn) {
                walletCloseBtn.click();
            } else {
                document.dispatchEvent(
                    new KeyboardEvent("keydown", {
                        key: "Escape",
                        code: "Escape",
                        keyCode: 27,
                        which: 27,
                        bubbles: true,
                    })
                );
            }
        };

            closeWalletModal();
            setTimeout(() => {
                props.onOpenSwapModal?.();
            }, 100);
        };

        const ensureButtons = () => {
            const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>("button"));
            const buyBtn = buttons.find((btn) => btn.textContent?.trim() === "Buy");

            if (!buyBtn) {
                return;
            }

            if (buyBtn.disabled) {
                buyBtn.removeAttribute("disabled");
                buyBtn.classList.remove("opacity-60", "grayscale");
            }

            if (!buyButtons.has(buyBtn)) {
                buyBtn.addEventListener("click", handleBuyClick);
                buyButtons.add(buyBtn);
            }

            const parent = buyBtn.parentElement;
            if (!parent) {
                return;
            }

                    const straySwapButtons = Array.from(parent.querySelectorAll<HTMLButtonElement>("button"));
                    straySwapButtons.forEach((btn) => {
                        if (btn === buyBtn) return;
                        if (btn.dataset.dwSwapBtn === "true") return;
                        if (btn.textContent?.trim() === "Swap") {
                            btn.remove();
                        }
                    });

            const existingSwapButtons = parent.querySelectorAll<HTMLButtonElement>("button[data-dw-swap-btn]");
            existingSwapButtons.forEach((btn, index) => {
                if (index === 0) {
                    if (!swapButtons.has(btn)) {
                        btn.addEventListener("click", handleSwapClick);
                        swapButtons.add(btn);
                    }
                    return;
                }
                btn.remove();
            });

            if (existingSwapButtons.length === 0) {
                const swapBtn = document.createElement("button");
                swapBtn.type = "button";
                swapBtn.textContent = "Swap";
                swapBtn.dataset.dwSwapBtn = "true";
                swapBtn.className = buyBtn.className;
                swapBtn.style.marginLeft = "2px";
                        swapBtn.addEventListener("click", handleSwapClick);
                swapButtons.add(swapBtn);
                parent.insertBefore(swapBtn, buyBtn.nextSibling);
            }
        };

        ensureButtons();

        const observer = new MutationObserver(ensureButtons);
        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
            observer.disconnect();
            buyButtons.forEach((btn) => btn.removeEventListener("click", handleBuyClick));
            swapButtons.forEach((btn) => btn.removeEventListener("click", handleSwapClick));
            swapButtons.clear();
            buyButtons.clear();
        };
    }, [props.email, props.wallet, props.chainId, props.walletOpen, props.onOpenSwapModal]);

    return null;
}

export default WalletButtonRedirect;