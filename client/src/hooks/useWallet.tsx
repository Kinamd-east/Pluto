import { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import { toast } from "sonner"
import { saveUserToFirestore } from "../lib/saveUserToFirestore";

export const useWallet = () => {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [loading, setLoading] = useState(true); // 👈 Add loading state

  const connectWallet = useCallback(async () => {
    setLoading(true); // 🔄 Start loading

    try {
      if (!window.ethereum) {
        alert("MetaMask not found");
        setLoading(false);
        return;
      }

      let _provider = new ethers.BrowserProvider(window.ethereum);
      const network = await _provider.getNetwork();

      if (network.chainId !== 11155111n) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0xaa36a7" }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: "0xaa36a7",
                    chainName: "Sepolia Testnet",
                    rpcUrls: ["https://rpc.sepolia.org"],
                    nativeCurrency: {
                      name: "Sepolia ETH",
                      symbol: "ETH",
                      decimals: 18,
                    },
                    blockExplorerUrls: ["https://sepolia.etherscan.io"],
                  },
                ],
              });
            } catch (addError) {
              alert("Switch to Sepolia manually.");
              setLoading(false);
              return;
            }
          } else {
            toast(`Error switching network: ${switchError}`)
            console.error("Error switching network:", switchError);
            setLoading(false);
            return;
          }
        }

        _provider = new ethers.BrowserProvider(window.ethereum); // Recreate provider
      }

      await _provider.send("eth_requestAccounts", []);
      const _signer = await _provider.getSigner();
      const _wallet = await _signer.getAddress();

      setProvider(_provider);
      setSigner(_signer);
      setWalletAddress(_wallet);
      localStorage.setItem("wallet", _wallet);

      await saveUserToFirestore(_wallet);
    } catch (err) {
      toast(`Wallet connection error: ${err}`)
      console.error("Wallet connection error:", err);
    } finally {
      setLoading(false); // ✅ Done loading
    }
  }, []);

  useEffect(() => {
    const autoConnect = async () => {
      const savedWallet = localStorage.getItem("wallet");
      if (savedWallet && window.ethereum) {
        await connectWallet();
      } else {
        setLoading(false); // 💡 Avoid hanging loading if no wallet found
      }
    };
    autoConnect();
  }, [connectWallet]);

  return { provider, signer, walletAddress, connectWallet, loading };
};
