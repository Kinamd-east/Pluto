import { useParams } from "react-router";
import { useCardMarketplaceContract } from "../hooks/useCardMarketplaceContract";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { usePlutoCoinContract } from "../hooks/usePlutoCoin";
import { useWalletContext } from "@/contexts/WalletContext";
import { Button } from "@/components/ui/button";
import { toIpfsUri } from "@/lib/ipfs";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  increment,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../firebase";

type CardDoc = {
  tokenURI: string;
  id: string;
  name: string;
  description: string;
  image: string;
  attack: number;
  defense: number;
  class: string;
  element: string;
  evolvesTo: string;
  exp: number;
  isEvolvable: boolean;
  rarity?: string;
  price: number;
};

const CardInfo = () => {
  const { signer, walletAddress } = useWalletContext();
  const { id } = useParams<{ id: string }>();
  const [card, setCard] = useState<CardDoc | null>(null);
  const [isBuying, setIsBuying] = useState(false);
  const [isFindingCard, setIsFindingCard] = useState(false);
  const cardMarketplace = useCardMarketplaceContract(signer);
  const fullTokenURI = toIpfsUri(id);
  const coinContract = usePlutoCoinContract(signer);

  const handleBuyCard = async (price: number, tokenURI: string) => {
    if (!signer || !walletAddress || !cardMarketplace || !coinContract || !card)
      return;

    setIsBuying(true);

    try {
      // 🪙 Get user's coin balance
      const balance = await coinContract.balanceOf(walletAddress);
      if (balance < BigInt(price)) {
        toast("Insufficient coin balance");
        return;
      }

      // 1. Check allowance
      const allowance = await coinContract.allowance(
        walletAddress,
        cardMarketplace.target,
      );
      if (allowance < BigInt(price)) {
        const approveTx = await coinContract.approve(
          cardMarketplace.target,
          price,
        );
        await approveTx.wait();
        console.log("✅ Approved PlutoCoin spending");
      }

      // 2. Buy the card
      const buyTx = await cardMarketplace.buyCard(price, tokenURI);
      await buyTx.wait();

      // 3. Update Firestore
      await updateDoc(doc(db, "users", walletAddress), {
        coins: increment(-price),
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
      setIsBuying(false);
    } catch (error) {
      setIsBuying(false);
      console.error("❌ Purchase failed:", error);
      toast("Purchase failed, please try again");
    } finally {
      setIsBuying(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      if (!fullTokenURI) return;
      setIsFindingCard(true);
      try {
        const cardsRef = collection(db, "cards");
        const q = query(cardsRef, where("tokenURI", "==", fullTokenURI));
        const snap = await getDocs(q);
        if (snap.empty) {
          setCard(null);
        } else {
          const docSnap = snap.docs[0];
          setCard({ id: docSnap.id, ...(docSnap.data() as any) });
        }
      } catch (err) {
        console.error("Failed to load card:", err);
        setCard(null);
      } finally {
        setIsFindingCard(false);
      }
    };
    load();
  }, [fullTokenURI]);

  if (isFindingCard) return <h1 className="font-bold">Loading ...</h1>;

  if (!card) {
    return (
      <div className="p-6 text-center text-red-500 font-semibold">
        Card not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-black rounded-xl shadow-md border dark:border-white/20 border-black/10 p-6 md:p-10 flex flex-col md:flex-row gap-8 items-center">
        <img
          src={card.image.replace("ipfs://", "https://ipfs.io/ipfs/")}
          alt={card.name}
          className="w-full md:w-1/2 rounded-xl object-cover shadow-md"
        />
        <div className="w-full md:w-1/2 space-y-4">
          <h2 className="text-2xl font-bold dark:text-white">{card.name}</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-300">
            {card.description}
          </p>
          <p className="text-sm text-neutral-500 dark:text-neutral-300">
            <span className="font-semibold capitalize text-red-500">
              attack: {card.attack}
            </span>{" "}
            &#x2022; {""}
            <span className="text-emerald-500">Defense: {card.defense}</span>
          </p>
          <p className="text-sm text-neutral-500 dark:text-neutral-300">
            <span className="font-semibold capitalize">{card.rarity}</span> •{" "}
            <span className="text-emerald-500">{card.price} PCN</span>
          </p>
          <Button
            className="w-full md:w-auto cursor-pointer disabled:bg-gray-400"
            disabled={isBuying}
            onClick={() => handleBuyCard(card.price, card.tokenURI)}
          >
            {isBuying ? "Please wait..." : "Buy Now"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CardInfo;
