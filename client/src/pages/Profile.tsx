import {
  collection,
  query,
  where,
  getDoc,
  getDocs,
  doc,
} from "firebase/firestore";
import { Copy } from "lucide-react";
import { db } from "../firebase";
import { useEffect, useState } from "react";
import { useParams } from "react-router";

type ProfileDoc = {
  id: string;
  inventory: string[];
  wins: number;
  losses: number;
  coins: number;
  level: number;
};

type CardDoc = {
  tokenURI: string;
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  attack: number;
  defense: number;
  class: string;
  element: string;
  evolvesTo: string;
  exp: number;
  isEvolvable: boolean;
  rarity?: string;
};

const Profile = () => {
  const { id } = useParams<{ id: string }>();
  const [copied, setCopied] = useState(false);
  const [isFindingProfile, setIsFindingProfile] = useState(false);
  const [profile, setProfile] = useState<ProfileDoc | null>(null);
  const [userCards, setUserCards] = useState<CardDoc | null>(null);
  const [isFindingInventory, setIsFindingInventory] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profile.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setIsFindingProfile(true);
      try {
        const userRef = doc(db, "users", id); // use wallet address directly
        const docSnap = await getDoc(userRef);
        if (!docSnap.exists()) {
          setProfile(null);
        } else {
          setProfile({ id: docSnap.id, ...(docSnap.data() as any) });
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
        setProfile(null);
      } finally {
        setIsFindingProfile(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    const loadInventoryCards = async () => {
      if (!profile || !profile.inventory || profile.inventory.length === 0)
        return;

      setIsFindingInventory(true);
      try {
        const cardsRef = collection(db, "cards");
        const promises = profile.inventory.map(async (tokenURI) => {
          const q = query(cardsRef, where("tokenURI", "==", tokenURI));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const docSnap = snap.docs[0];
            return { id: docSnap.id, ...(docSnap.data() as CardDoc) };
          }
          return null;
        });

        const results = await Promise.all(promises);
        const filtered = results.filter(
          (card): card is CardDoc => card !== null,
        );
        setUserCards(filtered);
      } catch (err) {
        console.error("Failed to fetch cards from inventory:", err);
      } finally {
        setIsFindingInventory(false);
      }
    };

    loadInventoryCards();
  }, [profile]);

  useEffect(() => {
    if (profile) {
      console.log("Profile updated:", profile);
    }
  }, [profile]);

  useEffect(() => {
    if (userCards) {
      console.log("Loaded cards from inventory:", userCards);
    } else {
      console.log("No cards found or user has no inventory.");
    }
  }, [userCards]);

  if (isFindingProfile) return <h1 className="font-bold">Loading ...</h1>;

  if (!profile) {
    return (
      <div className="p-6 text-center text-red-500 font-semibold">
        Profile not found.
      </div>
    );
  }
  return (
    <div className="min-h-screen px-4 py-8 max-w-6xl mx-auto">
      <div className="bg-white dark:bg-black rounded-xl shadow-md border dark:border-white/20 border-black/10 p-6 md:p-10 flex flex-col gap-6">
        {/* Profile Header */}
        <div className="w-full space-y-4">
          <div className="flex items-center gap-2">
            <h2
              className="text-2xl font-bold dark:text-white truncate max-w-[200px]"
              title={profile.id}
            >
              {profile.id.slice(0, 6)}...{profile.id.slice(-4)}
            </h2>
            <button
              onClick={copyToClipboard}
              className="text-gray-500 hover:text-black dark:hover:text-white"
              title="Copy to clipboard"
            >
              <Copy size={18} />
            </button>
            {copied && <span className="text-sm text-green-500">Copied!</span>}
          </div>

          <p className="font-bold text-center md:text-left">
            Level: {profile.level}
          </p>
          <div className="flex justify-center md:justify-start gap-4 text-sm text-neutral-500 dark:text-neutral-300">
            <p>Wins: {profile.wins}</p>
            <p>Losses: {profile.losses}</p>
          </div>
        </div>

        {/* Inventory Display */}
        {isFindingInventory ? (
          <p className="text-center text-gray-500 dark:text-gray-400">
            Loading Inventory...
          </p>
        ) : userCards && userCards.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {userCards.map((card) => (
              <div
                key={card.tokenURI}
                className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border dark:border-white/20 border-black/10 p-4 flex flex-col gap-4"
              >
                <img
                  src={card.image.replace("ipfs://", "https://ipfs.io/ipfs/")}
                  alt={card.name}
                  className="w-full h-48 object-cover rounded-lg shadow"
                />
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold dark:text-white">
                    {card.name}
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-300 line-clamp-2">
                    {card.description}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-300">
                    <span className="font-semibold text-red-500">
                      Attack: {card.attack}
                    </span>{" "}
                    •{" "}
                    <span className="text-emerald-500">
                      Defense: {card.defense}
                    </span>
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-300">
                    <span className="capitalize font-semibold">
                      {card.rarity}
                    </span>{" "}
                    • <span className="text-yellow-500">{card.price} PCN</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">
            No cards found in inventory.
          </p>
        )}
      </div>
    </div>
  );
};

export default Profile;
