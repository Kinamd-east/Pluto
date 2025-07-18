import { useEffect, useState } from "react";
import { ethers } from "ethers";
import PlutoCoinAbi from "../abi/PlutoCoin.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_PLUTO_COIN_CONTRACT_ADDRESS;

export const usePlutoCoinContract = (signer: ethers.JsonRpcSigner | null) => {
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    if (signer) {
      const _contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        PlutoCoinAbi.abi,
        signer,
      );
      setContract(_contract);
    }
  }, [signer]);

  return contract;
};
