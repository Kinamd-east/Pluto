import { useEffect, useState } from "react";
import { ethers } from "ethers";
import CoinMarketplaceAbi from "../abi/CardMarketplace.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_CARD_MARKETPLACE_CONTRACT_ADDRESS;

export const useCardMarketplaceContract = (
  signer: ethers.JsonRpcSigner | null,
) => {
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    if (signer) {
      const _contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CoinMarketplaceAbi.abi,
        signer,
      );
      setContract(_contract);
    }
  }, [signer]);

  return contract;
};
