import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useWalletContext } from "../contexts/WalletContext";
import { usePlutoCoinStoreContract } from "../hooks/usePlutoCoinStore";
import { usePlutoCoinContract } from "../hooks/usePlutoCoin";
import { toast } from "sonner";
import { ethers } from "ethers";
import { updateDoc, doc, increment } from "firebase/firestore";
import { db } from "../firebase";

const coinPacks = [
  { coins: 80, price: 0.0005 },
  { coins: 240, price: 0.0015 },
  { coins: 480, price: 0.003 },
  { coins: 1520, price: 0.0095 },
  { coins: 5000, price: 0.03 },
  { coins: 7000, price: 0.04 },
  { coins: 10000, price: 0.06 },
];

const CoinPurchase = () => {
  const { signer, walletAddress } = useWalletContext();
  const coinStoreContract = usePlutoCoinStoreContract(signer);
  const coinContract = usePlutoCoinContract(signer);

  // const [price, setAmountInEth] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleBuyCoins = async (price: number) => {
    if (!coinStoreContract || !signer || !coinContract || !walletAddress)
      return;

    try {
      setIsLoading(true);
      const amountInEth = price.toLocaleString();

      const tx = await coinStoreContract.buyCoins({
        value: ethers.parseEther(amountInEth),
      });
      await tx.wait();

      // 🔥 Calculate how many coins to add
      const coinsToAdd = (parseFloat(amountInEth) * 160000).toFixed(0);

      // 🔥 Update Firestore balance
      await updateDoc(doc(db, "users", walletAddress), {
        coins: increment(Number(coinsToAdd)),
      });

      toast("Coins successfully purchased!!!");
    } catch (error) {
      console.error("Failed to buy coins:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white py-12 px-4">
      <div className="max-w-4xl mx-auto text-center mb-10">
        <h1 className="text-4xl font-extrabold mb-4">Buy Coins</h1>
        <p className="text-gray-300">
          Select a coin pack to boost your battle experience
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {coinPacks.map((pack) => (
          <div
            key={pack.coins}
            className="bg-gray-900 p-6 rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300"
          >
            <h2 className="text-3xl font-bold mb-2">
              {pack.coins.toLocaleString()} Coins
            </h2>
            <p className="text-xl text-green-400 mb-4">{pack.price} ETH</p>
            <Button
              disabled={isLoading}
              className="w-full cursor-pointer bg-yellow-400 text-black font-semibold hover:bg-yellow-300 disabled:bg-gray-400"
              onClick={() => handleBuyCoins(pack.price)}
            >
              {isLoading ? "Please wait..." : "Buy Now"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoinPurchase;
