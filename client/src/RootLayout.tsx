import Navbar from "./Navbar";
import { Outlet } from "react-router";
import { useWalletContext } from "./contexts/WalletContext";

const RootLayout = () => {
  const { walletAddress, loading } = useWalletContext();

  return (
    <div>
      <Navbar />
      {loading ? (
        <div>Loading wallet...</div>
      ) : walletAddress ? (
        <Outlet />
      ) : (
        <div>Please connect your wallet</div>
      )}
    </div>
  );
};

export default RootLayout;
