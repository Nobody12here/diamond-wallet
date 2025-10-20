import { createConnector } from "@wagmi/core";
import { getProvider as getEmbeddedProvider } from "@apillon/wallet-sdk";

export function apillonConnector() {
  return createConnector((config) => {
    const rawProvider = getEmbeddedProvider() as any;

    if (!rawProvider) throw new Error("Apillon provider not found");

    // Wrap provider to gracefully handle missing methods
    const provider = {
      ...rawProvider,
      async request(args: { method: string; params?: any[] }) {
        try {
          return await rawProvider.request(args);
        } catch (err: any) {
          // Fallback for eth_estimateGas
          if (args.method === "eth_estimateGas") {
            // 21000 gas (basic ETH tx)
            return "0x5208";
          }
          // Fallback for eth_call, some embedded providers fail here
          if (args.method === "eth_call") {
            // Return null to let Viem skip revert decoding
            return null;
          }
          throw err;
        }
      },
    };

    const handleAccountsChanged = (accounts: string[]) => {
      config.emitter.emit("change", { accounts: accounts as `0x${string}`[] });
    };

    const handleChainChanged = (chainId: string | number) => {
      const numeric = typeof chainId === "string" ? Number(chainId) : chainId;
      config.emitter.emit("change", { chainId: numeric });
    };

    const handleDisconnect = () => {
      config.emitter.emit("disconnect");
    };

    return {
      id: "apillon",
      name: "Apillon Wallet",
      type: "injected",

      async connect(options?: { chainId?: number; isReconnecting?: boolean }) {
        await provider.request({ method: "eth_requestAccounts" });
        const accounts = await this.getAccounts();
        const chainId = options?.chainId ?? (await this.getChainId());

        if (provider.on) {
          provider.on("accountsChanged", handleAccountsChanged);
          provider.on("chainChanged", handleChainChanged);
          provider.on("disconnect", handleDisconnect);
        }

        return { accounts, chainId };
      },

      async disconnect() {
        if (provider.removeListener) {
          provider.removeListener("accountsChanged", handleAccountsChanged);
          provider.removeListener("chainChanged", handleChainChanged);
          provider.removeListener("disconnect", handleDisconnect);
        }
      },

      async getAccounts() {
        if (provider.getAccount) {
          const acc = await provider.getAccount();
          return [acc.address as `0x${string}`];
        }
        const accounts = await provider.request({ method: "eth_accounts" });
        return accounts as `0x${string}`[];
      },

      async getChainId() {
        const chainId = await provider.request({ method: "eth_chainId" });
        return Number(chainId);
      },

      async isAuthorized() {
        const accounts = await this.getAccounts();
        return accounts.length > 0;
      },

      onAccountsChanged: handleAccountsChanged,
      onChainChanged: handleChainChanged,
      onDisconnect: handleDisconnect,

      getProvider: () => provider,
    };
  });
}
