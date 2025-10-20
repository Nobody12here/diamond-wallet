import { EmbeddedWallet } from "@apillon/wallet-react";
import { networks } from "../networks";

type Props = {
  containerRef?: (el: HTMLDivElement | null) => void;
  clientId: string;
  defaultNetworkId?: number;
};

export function WalletEmbed({ containerRef, clientId, defaultNetworkId = 56 }: Props) {
  return (
    <div ref={containerRef}>
      <EmbeddedWallet passkeyAuthMode="popup" clientId={clientId} defaultNetworkId={defaultNetworkId} networks={networks} />
    </div>
  );
}
