import { getEmbeddedWallet, getProvider } from "@apillon/wallet-sdk";
import { ethers } from "ethers";

const toHexChainId = (id: number) => "0x" + id.toString(16);

function getEthersProvider() {
  const apProvider: any = getProvider();
  if (!apProvider) throw new Error("Apillon provider not available");
  return new ethers.providers.Web3Provider(apProvider, "any");
}

export function getLifiWalletManagement() {
  return {
    isConnected: async () => {
      const w = getEmbeddedWallet();
      try {
        const acc = await (w as any)?.getAccount?.();
        return !!acc?.address;
      } catch {
        return false;
      }
    },

    connect: async () => {
      const provider: any = getProvider();
      if (!provider) throw new Error("Provider not available");
      await provider.request?.({ method: "eth_requestAccounts" });
      const acc = (await (provider.getAccount?.() ?? { address: undefined })) as any;
      const chainIdHex = await provider.request?.({ method: "eth_chainId" });
      return {
        accounts: acc?.address ? [acc.address] : [],
        chainId: typeof chainIdHex === 'string' ? parseInt(chainIdHex, 16) : Number(chainIdHex),
      };
    },

    disconnect: async () => {
      // Apillon embedded wallet may not support programmatic disconnect; no-op
      return;
    },

    switchChain: async (chainId: number) => {
      const provider: any = getProvider();
      if (!provider?.request) throw new Error("Provider not available");
      try {
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: toHexChainId(chainId) }],
        });
      } catch (err: any) {
        if (err?.code === 4902) {
          throw new Error("Chain not added in wallet");
        }
        throw err;
      }
    },

    addToken: async ({ address, symbol, decimals, image }: { address: string; symbol: string; decimals: number; image?: string }) => {
      const provider: any = getProvider();
      if (!provider?.request) return false;
      try {
        return await provider.request({
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC20',
            options: { address, symbol, decimals, image },
          },
        });
      } catch {
        return false;
      }
    },

    // Used by Widget for broadcasting user ops when needed
    sendTransaction: async (tx: any) => {
      const provider = getEthersProvider();
      const signer = provider.getSigner();
      return await signer.sendTransaction(tx);
    },

    signMessage: async (message: string | Uint8Array) => {
      const w = getEmbeddedWallet();
      if (!w) throw new Error("Embedded wallet not available");
      const content = typeof message === 'string' ? message : ethers.utils.hexlify(message);
      const sig = await w.signMessage({ message: content, mustConfirm: true });
      if (!sig) throw new Error("User rejected message signing");
      return sig as string;
    },

    signTypedData: async (params: { domain: any; types: any; message: any }) => {
      const w = getEmbeddedWallet();
      if (!w) throw new Error("Embedded wallet not available");
      const anyW: any = w;
      if (typeof anyW.signTypedData !== 'function') throw new Error('Typed data signing not supported');
      const sig = await anyW.signTypedData({ ...params, mustConfirm: true });
      if (!sig) throw new Error("User rejected typed data signing");
      return sig as string;
    },
  } as any; // cast to any to satisfy widget config typing differences across versions
}
