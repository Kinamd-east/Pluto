import { useEffect, useState } from "react";
import { ethers } from "ethers";
import BattleCardNFTAbi from "../abi/BattleCardNFT.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_BATTLE_CARD_NFT_CONTRACT_ADDRESS;

export const useBattleCardNFTContract = (
  signer: ethers.JsonRpcSigner | null,
) => {
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    if (signer) {
      const _contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        BattleCardNFTAbi.abi,
        signer,
      );
      setContract(_contract);
    }
  }, [signer]);

  return contract;
};
