import { createConnector } from "@wagmi/core";
import { getProvider as getEmbeddedProvider } from "@apillon/wallet-sdk";

export function apillonConnector() {
  return createConnector((config) => {
    const provider = getEmbeddedProvider() as any;

    if (!provider) {
      throw new Error("Apillon provider not found");
    }

    // Handlers need to be referenced for cleanup
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
        // Try Apillon API first, fallback to eth_accounts
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

      // Required by wagmi/LiFi
      getProvider: () => provider,
    };
  });
}
