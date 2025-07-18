import { useEffect, useState } from "react";
import { useWalletContext } from "./contexts/WalletContext";
import { usePlutoCoinStoreContract } from "./hooks/usePlutoCoinStore";
import { usePlutoCoinContract } from "./hooks/usePlutoCoin";
import { toast } from "sonner";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router";
import { updateDoc, doc, increment } from "firebase/firestore";
import { db } from "./firebase";

const Navbar = () => {
  const { connectWallet, signer, walletAddress, loading } = useWalletContext();
  const coinStoreContract = usePlutoCoinStoreContract(signer);
  const coinContract = usePlutoCoinContract(signer);

  const [amountInEth, setAmountInEth] = useState("0.0005");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [coinBalance, setCoinBalance] = useState("0");
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleBuyCoins = async () => {
    if (!coinStoreContract || !signer || !coinContract || !walletAddress)
      return;

    try {
      setIsLoading(true);

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

      toast("Coins purchased!!!");
      const balance = await coinContract.balanceOf(walletAddress);
      setCoinBalance(balance.toString());
    } catch (error) {
      console.error("Failed to buy coins:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const syncBalanceWithFirestore = async () => {
      if (!coinContract || !walletAddress) return;

      try {
        const balance = await coinContract.balanceOf(walletAddress);
        const balanceInCoins = balance.toString();

        setCoinBalance(balanceInCoins); // Local UI update

        // Firestore update 🔥
        await updateDoc(doc(db, "users", walletAddress), {
          coins: Number(balanceInCoins),
        });
      } catch (err) {
        console.error("Failed to sync Firestore with wallet balance:", err);
      }
    };

    syncBalanceWithFirestore();
  }, [coinContract, walletAddress]);

  return (
    <nav className="w-full bg-white dark:bg-black shadow-md border-b border-gray-200 dark:border-white/[0.1] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="text-2xl font-extrabold text-gray-900 dark:text-white"
            >
              Pluto
            </Link>
            <div className="hidden sm:flex space-x-6 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Link to="/" className="hover:text-yellow-500">
                Home
              </Link>
              <Link to="/marketplace" className="hover:text-yellow-500">
                Marketplace
              </Link>
            </div>
          </div>

          {/* Right */}
          <div className="hidden sm:flex items-center gap-4">
            {!walletAddress ? (
              <Button
                onClick={connectWallet}
                className="bg-yellow-500 cursor-pointer hover:bg-yellow-600 text-white font-semibold px-4 py-2 rounded-lg shadow transition"
              >
                Connect Wallet
              </Button>
            ) : (
              <>
                <Link
                  to="/buy-coins"
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 shadow-lg px-4 py-2 text-white font-bold text-sm"
                >
                  <img src="/images/coin.png" alt="PCN" className="w-5 h-5" />
                  <span>{coinBalance}</span>
                  <span className="text-xs font-medium">PCN</span>
                </Link>
                <Button
                  className="cursor-pointer bg-white text-black font-semibold hover:bg-black hover:text-white border border-gray-300 rounded-lg px-4 py-2"
                  onClick={() => navigate(`/profile/${walletAddress}`)}
                >
                  Profile
                </Button>
              </>
            )}
          </div>

          {/* Hamburger */}
          <div className="sm:hidden">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-black dark:text-white focus:outline-none cursor-pointer"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="sm:hidden mt-2 space-y-4 pb-4">
            <Link to="/" className="block text-gray-700 dark:text-gray-300">
              Home
            </Link>
            <Link
              to="/marketplace"
              className="block text-gray-700 dark:text-gray-300"
            >
              Marketplace
            </Link>

            {!walletAddress ? (
              <button
                onClick={connectWallet}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-4 py-2 rounded-lg shadow transition"
              >
                {loading ? "Connect Wallet" : "Connecting..."}
              </button>
            ) : (
              <>
                <Link
                  to="/buy-coins"
                  className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 px-4 py-2 rounded-xl text-white font-bold w-fit"
                >
                  <img src="/images/coin.png" alt="PCN" className="w-5 h-5" />
                  <span>{coinBalance}</span>
                  <span className="text-xs font-medium">PCN</span>
                </Link>
                <Button
                  className="w-full bg-white text-black cursor-pointer font-semibold hover:bg-black hover:text-white border border-gray-300 rounded-lg px-4 py-2 mt-2"
                  onClick={() => navigate(`/profile/${walletAddress}`)}
                >
                  Profile
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
