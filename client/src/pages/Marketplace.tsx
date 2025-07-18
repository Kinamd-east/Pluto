import { useCards } from "../hooks/useCards";
import { useWallet } from "../hooks/useWallet";
import PlutoCoinAbi from "../abi/PlutoCoin.json";
import { toast } from "sonner";
import { ethers } from "ethers";
import { useCardMarketplaceContract } from "../hooks/useCardMarketplaceContract";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import { updateDoc, doc, increment, arrayUnion } from "firebase/firestore";
import { db } from "../firebase";

const Marketplace = () => {
  const { connectWallet, signer, walletAddress } = useWallet();
  const [purchasingTokenURI, setPurchasingTokenURI] = useState<string | null>(
    null,
  );
  const { cards, loading } = useCards();
  const cardMarketplace = useCardMarketplaceContract(signer);

  const handleBuyCard = async (card) => {
    if (!signer || !walletAddress || !cardMarketplace) return;

    const coinContract = new ethers.Contract(
      "0xee0aF7F9149739d5C175D114B025Cd1bC013529C", // 👈 replace with your actual PlutoCoin contract address
      PlutoCoinAbi.abi,
      signer,
    );
    setPurchasingTokenURI(card.tokenURI);

    try {
      const balance = await coinContract.balanceOf(walletAddress);
      if (balance < card.price) {
        toast("Insufficient coin balance");
        return;
      }

      // 1. Check allowance
      const allowance = await coinContract.allowance(
        walletAddress,
        cardMarketplace.target,
      );
      if (allowance < card.price) {
        const approveTx = await coinContract.approve(
          cardMarketplace.target,
          card.price,
        );
        await approveTx.wait();
        console.log("✅ Approved PlutoCoin spending");
      }

      // 2. Call buyCard
      const buyTx = await cardMarketplace.buyCard(card.price, card.tokenURI);
      await buyTx.wait();
      await updateDoc(doc(db, "users", walletAddress), {
        coins: increment(-card.price), // deduct coin
        inventory: arrayUnion({
          tokenURI: string,
          id: card.id,
          name: card.name,
          description: card.description,
          image: card.image,
          price: card.price,
          attack: card.attack,
          defense: card.defense,
          class: card.class,
          element: card.element,
          evolvesTo: card.evolvesTo,
          exp: card.exp,
          isEvolvable: card.isEvolvable,
          rarity: card.rarity,
        }),
      });
      toast("Card purchased successfully");
    } catch (error) {
      console.error("❌ Purchase failed:", error);
      alert("Purchase failed, check console.");
    } finally {
      setPurchasingTokenURI(null);
    }
  };

  if (loading) return <p>Loading cards...</p>;

  return (
    <div className="flex flex-col">
      <h1 className="text-2xl font-extrabold text-gray-900 mt-4 dark:text-white">
        Marketplace{" "}
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <CardContainer className="inter-var" key={card.id}>
            <CardBody className="w-full h-auto rounded-xl p-6 border bg-gray-50 dark:bg-black dark:border-white/[0.2] border-black/[0.1] relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1]  ">
              <CardItem translateZ="100" className="w-full mt-4">
                <img
                  src={card.image.replace("ipfs://", "https://ipfs.io/ipfs/")}
                  height="1000"
                  width="1000"
                  className="h-60 w-full object-fit rounded-xl group-hover/card:shadow-xl"
                  alt="thumbnail"
                />
                <CardItem
                  translateZ="50"
                  className="text-xl font-bold text-neutral-600 dark:text-white mt-4"
                >
                  {card.name}
                </CardItem>
                <CardItem
                  translateZ="50"
                  className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300"
                >
                  {card.description}
                </CardItem>
                <CardItem
                  translateZ="50"
                  className="capitalize underline text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300"
                >
                  {card.rarity} &#x2022; {card.price}PCN
                </CardItem>
              </CardItem>
              <div className="flex justify-between items-center mt-20">
                <CardItem
                  translateZ={20}
                  as="a"
                  href={`/marketplace/${card.tokenURI.replace("ipfs://", "")}`}
                  className="px-4 py-2 cursor-pointer hover:underline rounded-xl text-xs font-normal dark:text-white"
                >
                  See more →
                </CardItem>
                <Button
                  translatez={20}
                  disabled={purchasingTokenURI === card.tokenURI}
                  onClick={() => handleBuyCard(card)}
                  className="px-4 py-2 rounded-xl bg-black dark:bg-white dark:text-black text-white text-xs font-bold cursor-pointer"
                >
                  {purchasingTokenURI === card.tokenURI ? "Buying..." : "Buy"}
                </Button>
              </div>
            </CardBody>
          </CardContainer>
        ))}
      </div>
    </div>
  );
};

export default Marketplace;
