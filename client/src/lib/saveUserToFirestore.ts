import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export const saveUserToFirestore = async (walletAddress: string) => {
  const userRef = doc(db, "users", walletAddress);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    await setDoc(userRef, {
      inventory: [],
      wins: 0,
      losses: 0,
      coins: 0,
      level: 1,
    });
  }
};
