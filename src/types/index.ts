import { Address } from "viem"
export interface WalletButtonRedirectProps {
    email: string,
    wallet: Address | "",
    chainId: number,
    onOpenSwapModal?: () => void,
}
