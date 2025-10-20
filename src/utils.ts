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
            // Check if we're trying to access content inside an iframe
            const walletIframe = document.querySelector('iframe[id*="walletIframe"]') as HTMLIFrameElement;
            if (walletIframe) {
                console.log('Wallet is in iframe mode - skipping DOM manipulation to avoid CORS issues');
                return;
            }

            const buttons = Array.from(
                document.querySelectorAll<HTMLButtonElement>("button")
            );
            const buyCandidate = buttons.find(
                (btn) => btn.textContent?.trim() === "Buy"
            );

            if (!buyCandidate) {
                return;
            }

            let buyBtn = buyCandidate;

            if (!buyCandidate.dataset.dwBuyBtn) {
                buyCandidate.dataset.dwBuyBtn = "true";
            }

            if (buyBtn.disabled) {
                buyBtn.removeAttribute("disabled");
                buyBtn.classList.remove("opacity-60", "grayscale");
            }

            if (!buyButtons.has(buyBtn)) {
                buyBtn.addEventListener("click", handleBuyClick, { once: false });
                buyButtons.add(buyBtn);
            }

            const parent = buyBtn.parentElement as HTMLElement | null;
            if (!parent) {
                return;
            }

            if (!parent.dataset.dwLayoutAdjusted) {
                const computed = window.getComputedStyle(parent);
                if (computed.display === "grid") {
                    parent.style.gridTemplateColumns = "repeat(auto-fit, minmax(0, 1fr))";
                    parent.style.columnGap = computed.columnGap || "8px";
                    parent.style.rowGap = computed.rowGap || "8px";
                } else if (computed.display === "flex") {
                    parent.style.flexWrap = "wrap";
                    parent.style.gap = computed.gap || "8px";
                    parent.style.justifyContent = computed.justifyContent || "center";
                }
                parent.dataset.dwLayoutAdjusted = "true";
            }

            Array.from(parent.querySelectorAll<HTMLButtonElement>("button")).forEach(
                (btn) => {
                    if (btn === buyBtn) return;
                    if (btn.dataset.dwSwapBtn === "true") return;
                    if (btn.textContent?.trim() === "Swap") {
                        btn.remove();
                    }
                }
            );

            let swapBtn = parent.querySelector<HTMLButtonElement>(
                'button[data-dw-swap-btn="true"]'
            );

                    if (!swapBtn) {
                        swapBtn = buyBtn.cloneNode(true) as HTMLButtonElement;
                        swapBtn.dataset.dwSwapBtn = "true";
                        swapBtn.removeAttribute("disabled");
                        swapBtn.setAttribute("aria-label", "Swap");
                        const labelElement = swapBtn.querySelector<HTMLElement>("span, strong");
                        if (labelElement) {
                            labelElement.textContent = "Swap";
                        } else {
                            swapBtn.textContent = "Swap";
                        }
                        parent.insertBefore(swapBtn, buyBtn.nextSibling);
                    }

                    if (swapBtn) {
                        const parentComputed = window.getComputedStyle(parent);
                        const buyComputed = window.getComputedStyle(buyBtn);

                        swapBtn.style.marginLeft = buyComputed.marginLeft;
                        swapBtn.style.marginRight = buyComputed.marginRight;
                        swapBtn.style.marginTop = buyComputed.marginTop;
                        swapBtn.style.marginBottom = buyComputed.marginBottom;

                        if (parentComputed.display === "grid") {
                            swapBtn.style.gridColumn = "1 / -1";
                            swapBtn.style.width = "100%";
                            swapBtn.style.justifySelf = "stretch";
                        } else if (parentComputed.display === "flex") {
                            swapBtn.style.flexBasis = "100%";
                            swapBtn.style.flexGrow = "1";
                            swapBtn.style.maxWidth = "100%";
                            swapBtn.style.width = "100%";
                            swapBtn.style.alignSelf = "stretch";
                        } else {
                            swapBtn.style.width = "100%";
                        }
                    }

                    if (swapBtn && !swapButtons.has(swapBtn)) {
                        swapBtn.addEventListener("click", handleSwapClick);
                        swapButtons.add(swapBtn);
                    }
        };

        ensureButtons();

        const observer = new MutationObserver(ensureButtons);
        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
            observer.disconnect();
            buyButtons.forEach((btn) =>
                btn.removeEventListener("click", handleBuyClick)
            );
            swapButtons.forEach((btn) =>
                btn.removeEventListener("click", handleSwapClick)
            );
            swapButtons.clear();
            buyButtons.clear();
        };
    }, [props.email, props.wallet, props.chainId, props.walletOpen, props.onOpenSwapModal]);

    return null;
}

export default WalletButtonRedirect;