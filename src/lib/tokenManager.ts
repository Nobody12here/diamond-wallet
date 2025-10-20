import type { EmbeddedWallet as EmbeddedWalletType } from "@apillon/wallet-sdk";
import { Contract } from "ethers";
import { EmbeddedEthersSigner } from "@apillon/wallet-sdk";
import { NFT_ABI, NFT_CONTRACT_ADDRESS, TOKENS_LIST, token } from "../constants";

export function addTokensToWallet(wallet: EmbeddedWalletType | undefined, tokens: token, currentChainId: number) {
  if (!wallet?.events) return;
  tokens.forEach((t) => {
    if ((t as any).chainId === currentChainId) {
      wallet.events.emit("addToken", t);
    }
  });
}

export async function loadNFTs(wallet: EmbeddedWalletType | undefined) {
  if (!wallet?.events) return;
  const signer = new EmbeddedEthersSigner();
  const NFT_contract = new Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, signer as any);
  // dynamic import to avoid circular
  const { getUserNFTTokenIds } = await import("../nftUtils");
  const tokenIds: number[] = await getUserNFTTokenIds();
  for (const tokenId of tokenIds) {
    const uri: string = await NFT_contract.tokenURI(tokenId);
    const ipfsHash = uri.split("//")[1];
    const metadataResp = await fetch(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
    const metadata = await metadataResp.json();
    const imageHash = metadata.image.split("//")[1];
    const imageUrl = `https://gateway.pinata.cloud/ipfs/${imageHash}`;
    wallet.events.emit("addTokenNft", {
      address: NFT_CONTRACT_ADDRESS,
      tokenId: Number(tokenId),
      chainId: 56,
      imageUrl,
    });
  }
}
