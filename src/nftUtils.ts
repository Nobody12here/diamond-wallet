// src/nftUtils.ts
import { Contract } from "ethers";
import { NFT_ABI, NFT_CONTRACT_ADDRESS } from "./constants";
import { EmbeddedEthersSigner } from "@apillon/wallet-sdk";


export async function getUserNFTTokenIds(): Promise<number[]> {
    const signer = new EmbeddedEthersSigner();
    const signerAddress = await signer.getAddress()
    const contract = new Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, signer as any);
    const balance = await contract.balanceOf(signerAddress);
    console.log(`Balance of ${signerAddress} is ${balance}`)
    const tokenIds: number[] = [];
    for (let i = 0; i < balance; i++) {
        const tokenId = await contract.tokenOfOwnerByIndex(signerAddress, i);
        tokenIds.push(tokenId);
    }
    return tokenIds;
}
