import { createConnector } from "@wagmi/core";
import { getProvider as getEmbeddedProvider } from "@apillon/wallet-sdk";

export function apillonConnector() {
    return createConnector((config) => ({
        id: "apillon",
        name: "Apillon Wallet",
        type: "injected",
        getProvider() {
            return getEmbeddedProvider() as any;
        },

        async connect(options?: { chainId?: number; isReconnecting?: boolean }) {
            const provider = getEmbeddedProvider();
            if (!provider) throw new Error("Apillon provider not found");

            // request accounts
            const accounts = await provider.request({ method: "eth_requestAccounts" });
            const account = accounts[0] as `0x${string}`;

            return {
                accounts: [account],
                chainId: options?.chainId ?? (await this.getChainId()),
            };
        },

        async disconnect() {
            // optional cleanup if Apillon supports it
        },

        async getAccounts() {
            const provider = getEmbeddedProvider();
            const accounts = await provider.request({ method: "eth_accounts" });
            return accounts as `0x${string}`[];
        },

        async getChainId() {
            const provider = getEmbeddedProvider();
            return Number(await provider.request({ method: "eth_chainId" }));
        },

        async isAuthorized() {
            try {
                const accounts = await this.getAccounts();
                return accounts.length > 0;
            } catch {
                return false;
            }
        },

        onAccountsChanged: (accounts) => {
            config.emitter.emit("change", { accounts: accounts as `0x${string}`[] });
        },

        onChainChanged: (chainId) => {
            config.emitter.emit("change", { chainId: Number(chainId) });
        },

        onDisconnect: () => {
            config.emitter.emit("disconnect");
        },
    }));
}
