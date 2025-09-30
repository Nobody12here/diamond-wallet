import { useEffect } from "react";
import { WalletButtonRedirectProps } from "./types";
function WalletButtonRedirect(props: WalletButtonRedirectProps) {
    useEffect(() => {
        // Don't start observing if we don't have the required data yet
        if (!props.email || !props.wallet || !props.network) {
            return;
        }

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
                    window.location.href = `https://pay.incoin.ai/diora?email=${props.email}&wallet=${props.wallet}&network=${props.network}`;
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
    }, [props.email, props.wallet, props.network]); // Re-run when any prop changes

    return null;
}

export default WalletButtonRedirect;
