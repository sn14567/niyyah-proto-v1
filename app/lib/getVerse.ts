import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

export async function getVerse() {
  const ref = doc(db, "verses", "verse1");
  const snapshot = await getDoc(ref);

  if (snapshot.exists()) {
    return snapshot.data();
  } else {
    throw new Error("Verse not found");
  }
}
