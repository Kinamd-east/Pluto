import { useEffect, useState } from "react";
import { ethers } from "ethers";
import PlutoCoinStoreAbi from "../abi/PlutoCoinStore.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_PLUTO_COINSTORE_CONTRACT_ADDRESS;

export const usePlutoCoinStoreContract = (
  signer: ethers.JsonRpcSigner | null,
) => {
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    if (signer) {
      const _contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        PlutoCoinStoreAbi.abi,
        signer,
      );
      setContract(_contract);
    }
  }, [signer]);

  return contract;
};
