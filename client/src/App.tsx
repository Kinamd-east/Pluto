import { Routes, Route } from "react-router";
import RootLayout from "./RootLayout";
import Home from "./pages/Home";
import Marketplace from "./pages/Marketplace";
import { Toaster } from "@/components/ui/sonner";
import Profile from "./pages/Profile";
import CardInfo from "./pages/CardInfo";
import CoinPurchase from "./pages/CoinPurchase";

const App = () => {
  return (
    <div>
      <Routes>
        <Route element={<RootLayout />}>
          <Route element={<Home />} path="/" />
          <Route element={<Marketplace />} path="/marketplace" />
          <Route element={<CardInfo />} path="/marketplace/:id" />
          <Route element={<Profile />} path="/profile/:id" />
          <Route element={<CoinPurchase />} path="/buy-coins" />
        </Route>
      </Routes>
      <Toaster />
    </div>
  );
};

export default App;
