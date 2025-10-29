import { getEmbeddedWallet, getProvider } from "@apillon/wallet-sdk";
import { ethers } from "ethers";

// General helpers
const toHexChainId = (id: number) => "0x" + id.toString(16);

const withTimeout = async <T>(p: Promise<T>, ms = 60_000, label = "Operation") => {
  let t: any;
  const timeout = new Promise<never>((_, reject) => {
    t = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
  });
  try {
    return await Promise.race([p, timeout]);
  } finally {
    clearTimeout(t);
  }
};

export type SignMessageParams = {
  message: string;
  mustConfirm?: boolean; // forces wallet UI confirmation
};

export async function signMessageWithApillon({ message, mustConfirm = true }: SignMessageParams) {
  const w = getEmbeddedWallet();
  if (!w) throw new Error("Embedded wallet not available");
  // apillon sdk handles encoding internally
  const sig = await w.signMessage({ message, mustConfirm });
  if (!sig) throw new Error("User rejected message signing or no signature returned");
  return sig as string;
}

// EVM provider/signer helpers using Apillon provider
function getEthersProvider() {
  const apProvider: any = getProvider();
  if (!apProvider) throw new Error("Apillon provider not available");
  // Wrap as an EIP-1193 provider for ethers v5
  const provider = new ethers.providers.Web3Provider(apProvider, "any");
  return provider;
}

async function ensureOnCorrectNetwork(expectedChainId?: number) {
  if (!expectedChainId) return;
  const provider = getEthersProvider();
  const network = await provider.getNetwork();
  if (network.chainId === expectedChainId) return;

  // Try to switch via EIP-3326 / wallet_switchEthereumChain
  const eip1193: any = (provider.provider as any);
  try {
    await eip1193.request?.({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: toHexChainId(expectedChainId) }],
    });
  } catch (err: any) {
    // If the chain is not added, try to add or rethrow
    if (err?.code === 4902) {
      throw new Error("Target chain is not added to the wallet");
    }
    throw err;
  }
}

export type SendNativeTxParams = {
  to: string;
  valueEther: string; // e.g. "0.01"
  expectedChainId?: number;
  confirmationBlocks?: number; // default 1
  timeoutMs?: number; // default 60s
};

export async function sendNativeTransaction(params: SendNativeTxParams) {
  const { to, valueEther, expectedChainId, confirmationBlocks = 1, timeoutMs = 60_000 } = params;
  if (!ethers.utils.isAddress(to)) throw new Error("Invalid recipient address");

  await ensureOnCorrectNetwork(expectedChainId);

  const provider = getEthersProvider();
  const signer = provider.getSigner();
  const from = await signer.getAddress();

  const txRequest: ethers.providers.TransactionRequest = {
    from,
    to,
    value: ethers.utils.parseEther(valueEther),
  };

  // Try to estimate gas, but don't fail hard if provider can't
  try {
    const gas = await provider.estimateGas(txRequest);
    txRequest.gasLimit = gas;
  } catch {
    // fallback gas limit for simple transfers
    txRequest.gasLimit = ethers.BigNumber.from(21000);
  }

  const tx = await signer.sendTransaction(txRequest);
  const receipt = await withTimeout<ethers.providers.TransactionReceipt>(
    tx.wait(confirmationBlocks),
    timeoutMs,
    "Waiting for confirmations"
  );
  if (receipt.status !== 1) throw new Error("Transaction failed");
  return { hash: tx.hash, receipt };
}

export type SendErc20Params = {
  tokenAddress: string;
  to: string;
  amount: string; // human value, e.g. "25.5"
  decimals?: number; // default 18
  expectedChainId?: number;
  confirmationBlocks?: number;
  timeoutMs?: number;
};

const ERC20_ABI = [
  "function decimals() view returns (uint8)",
  "function transfer(address to, uint256 amount) returns (bool)",
];

export async function sendErc20Transfer(params: SendErc20Params) {
  const { tokenAddress, to, amount, decimals, expectedChainId, confirmationBlocks = 1, timeoutMs = 60_000 } = params;
  if (!ethers.utils.isAddress(tokenAddress)) throw new Error("Invalid token address");
  if (!ethers.utils.isAddress(to)) throw new Error("Invalid recipient address");

  await ensureOnCorrectNetwork(expectedChainId);

  const provider = getEthersProvider();
  const signer = provider.getSigner();

  const erc20 = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
  const tokenDecimals = typeof decimals === "number" ? decimals : await erc20.decimals().catch(() => 18);
  const amt = ethers.utils.parseUnits(amount, tokenDecimals);

  const tx = await erc20.transfer(to, amt);
  const receipt = await withTimeout<ethers.providers.TransactionReceipt>(
    tx.wait(confirmationBlocks),
    timeoutMs,
    "Waiting for ERC20 confirmations"
  );
  if (receipt.status !== 1) throw new Error("ERC20 transfer failed");
  return { hash: tx.hash, receipt };
}

// Optional: EIP-712 typed data signing for production-grade auth flows
export async function signTypedData(domain: any, types: any, message: any, mustConfirm = true) {
  const w = getEmbeddedWallet();
  if (!w) throw new Error("Embedded wallet not available");
  const walletAny: any = w;
  if (typeof walletAny.signTypedData !== 'function') {
    throw new Error("signTypedData not supported by this wallet version");
  }
  const sig = await walletAny.signTypedData({ domain, types, message, mustConfirm });
  if (!sig) throw new Error("User rejected typed data signing or no signature returned");
  return sig as string;
}
